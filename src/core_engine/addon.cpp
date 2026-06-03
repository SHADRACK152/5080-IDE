#include <napi.h>
#include "core_memory_arena.hpp"
#include "piece_tree.hpp"
#include "spsc_queue.hpp"
#include <thread>
#include <atomic>
#include <vector>
#include <string>
#include <iostream>

using namespace ide5080::core;

class EditorCoreWrapper : public Napi::ObjectWrap<EditorCoreWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports) {
        Napi::Function func = DefineClass(env, "EditorCoreWrapper", {
            InstanceMethod("init", &EditorCoreWrapper::InitTree),
            InstanceMethod("start", &EditorCoreWrapper::StartKernel),
            InstanceMethod("stop", &EditorCoreWrapper::StopKernel),
            InstanceMethod("pushEvent", &EditorCoreWrapper::PushEvent),
            InstanceMethod("getText", &EditorCoreWrapper::GetText),
            InstanceMethod("totalLogicalLength", &EditorCoreWrapper::TotalLogicalLength)
        });

        Napi::FunctionReference* constructor = new Napi::FunctionReference();
        *constructor = Napi::Persistent(func);
        env.SetInstanceData(constructor);

        exports.Set("EditorCore", func);
        return exports;
    }

    EditorCoreWrapper(const Napi::CallbackInfo& info)
        : Napi::ObjectWrap<EditorCoreWrapper>(info)
        , m_arena(128 * 1024 * 1024) // 128MB Arena preallocation
        , m_tree(m_arena)
        , m_running(false) {
        
        Napi::Env env = info.Env();
        if (info.Length() > 0 && info[0].IsNumber()) {
            size_t size = info[0].As<Napi::Number>().Int64Value();
            m_original_size = size;
        } else {
            m_original_size = 0;
        }
    }

    ~EditorCoreWrapper() {
        stop_worker();
    }

private:
    CoreMemoryArena m_arena;
    PieceTree m_tree;
    SPSCRingBuffer<UIEvent, 16384> m_queue;

    size_t m_original_size = 0;
    std::string m_original_buffer;
    std::string m_append_buffer;

    std::thread m_worker_thread;
    std::atomic<bool> m_running;

    Napi::Value InitTree(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        if (info.Length() < 1 || !info[0].IsString()) {
            Napi::TypeError::New(env, "String expected for original document template").ThrowAsJavaScriptException();
            return env.Null();
        }

        m_original_buffer = info[0].As<Napi::String>().Utf8Value();
        m_tree.init(m_original_buffer.size());
        m_append_buffer.reserve(32 * 1024 * 1024); // 32MB prealigned append string reservation

        return env.Undefined();
    }

    Napi::Value StartKernel(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        if (m_running.load()) {
            return Napi::Boolean::New(env, true);
        }

        m_running.store(true);
        m_worker_thread = std::thread(&EditorCoreWrapper::worker_loop, this);
        return Napi::Boolean::New(env, true);
    }

    Napi::Value StopKernel(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        stop_worker();
        return Napi::Boolean::New(env, true);
    }

    Napi::Value PushEvent(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        if (info.Length() < 1 || !info[0].IsObject()) {
            Napi::TypeError::New(env, "Object expected for event descriptor").ThrowAsJavaScriptException();
            return Napi::Boolean::New(env, false);
        }

        Napi::Object obj = info[0].As<Napi::Object>();
        uint32_t type_val = obj.Get("type").As<Napi::Number>().Uint32Value();
        
        UIEvent ev;
        ev.type = static_cast<EventType>(type_val);

        if (ev.type == EventType::InsertChar) {
            std::string text = obj.Get("text").As<Napi::String>().Utf8Value();
            uint64_t offset = obj.Get("offset").As<Napi::Number>().Int64Value();

            ev.payload.insert.logical_offset = offset;
            ev.payload.insert.length = static_cast<uint32_t>(text.copy(ev.payload.insert.chars, 31));
            ev.payload.insert.chars[ev.payload.insert.length] = '\0';
        } else if (ev.type == EventType::Backspace) {
            uint64_t offset = obj.Get("offset").As<Napi::Number>().Int64Value();
            uint32_t count = obj.Get("count").As<Napi::Number>().Uint32Value();

            ev.payload.backspace.logical_offset = offset;
            ev.payload.backspace.count = count;
        } else if (ev.type == EventType::ViewportScroll) {
            uint32_t line = obj.Get("line").As<Napi::Number>().Uint32Value();
            uint32_t col = obj.Get("column").As<Napi::Number>().Uint32Value();

            ev.payload.scroll.top_line = line;
            ev.payload.scroll.left_column = col;
        }

        // Push event down standard lock-free ring buffer
        bool success = m_queue.push(ev);
        return Napi::Boolean::New(env, success);
    }

    Napi::Value GetText(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        std::string result = m_tree.get_reconstructed_text(m_original_buffer, m_append_buffer);
        return Napi::String::New(env, result);
    }

    Napi::Value TotalLogicalLength(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        return Napi::Number::New(env, m_tree.total_logical_length());
    }

    void stop_worker() {
        if (m_running.load()) {
            m_running.store(false);
            if (m_worker_thread.joinable()) {
                m_worker_thread.join();
            }
        }
    }

    void worker_loop() noexcept {
        std::array<UIEvent, 32> batch;
        uint32_t spin_count = 0;
        while (m_running.load(std::memory_order_relaxed)) {
            size_t count = m_queue.pop_batch(batch.data(), batch.size());
            if (count == 0) {
                if (spin_count < 2000) {
                    spin_count++;
                    std::this_thread::yield();
                } else {
                    std::this_thread::sleep_for(std::chrono::milliseconds(1));
                }
                continue;
            }

            spin_count = 0; // Reset spin count
            for (size_t i = 0; i < count; ++i) {
                const auto& ev = batch[i];
                if (ev.type == EventType::InsertChar) {
                    // Critical writing path
                    uint64_t append_offset = m_append_buffer.size();
                    m_append_buffer.append(ev.payload.insert.chars, ev.payload.insert.length);

                    m_tree.insert(
                        ev.payload.insert.logical_offset,
                        append_offset,
                        ev.payload.insert.length
                    );
                }
                // (Extend for deletes/scroll events on the background loop here as needed)
            }
        }
    }
};

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
    return EditorCoreWrapper::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
