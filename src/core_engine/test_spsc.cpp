#include "spsc_queue.hpp"
#include <iostream>
#include <thread>
#include <vector>
#include <chrono>
#include <cassert>
#include <cstring>

using namespace ide5080::core;

constexpr size_t TEST_EVENTS = 1000000;

void run_producer(SPSCRingBuffer<UIEvent, 16384>& queue) {
    for (size_t i = 0; i < TEST_EVENTS; ++i) {
        UIEvent ev;
        ev.type = EventType::InsertChar;
        ev.payload.insert.logical_offset = i;
        ev.payload.insert.length = 1;
        ev.payload.insert.chars[0] = 'a';
        ev.payload.insert.chars[1] = '\0';

        // Keep spinning if the queue fills up (backpressure)
        while (!queue.push(ev)) {
            std::this_thread::yield();
        }
    }
}

void run_consumer(SPSCRingBuffer<UIEvent, 16384>& queue, size_t& received_count, bool& integrity_passed) {
    size_t count = 0;
    bool holds_integrity = true;
    std::array<UIEvent, 32> batch_buffer;

    while (count < TEST_EVENTS) {
        size_t pulled = queue.pop_batch(batch_buffer.data(), batch_buffer.size());
        if (pulled == 0) {
            std::this_thread::yield();
            continue;
        }

        for (size_t i = 0; i < pulled; ++i) {
            const auto& ev = batch_buffer[i];
            if (ev.type != EventType::InsertChar) {
                holds_integrity = false;
            }
            if (ev.payload.insert.logical_offset != count) {
                holds_integrity = false;
            }
            count++;
        }
    }

    received_count = count;
    integrity_passed = holds_integrity;
}

int main() {
    std::cout << "==========================================================" << std::endl;
    std::cout << "     5080 IDE SPSC Lock-Free Thread Boundary Stress Test  " << std::endl;
    std::cout << "==========================================================" << std::endl;

    SPSCRingBuffer<UIEvent, 16384> queue;

    size_t total_received = 0;
    bool integrity_verified = false;

    std::cout << "[System] Spawning Producer & Consumer Dual Thread Streams..." << std::endl;
    auto start_time = std::chrono::high_resolution_clock::now();

    std::thread producer(run_producer, std::ref(queue));
    std::thread consumer(run_consumer, std::ref(queue), std::ref(total_received), std::ref(integrity_verified));

    producer.join();
    consumer.join();

    auto end_time = std::chrono::high_resolution_clock::now();
    auto elapsed_ms = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time).count();

    double throughput_million_ops = (static_cast<double>(TEST_EVENTS) / (elapsed_ms / 1000.0)) / 1000000.0;

    std::cout << "\n==========================================================" << std::endl;
    std::cout << "                  STRESS TEST RESULTS                     " << std::endl;
    std::cout << "==========================================================" << std::endl;
    std::cout << "Total Events Transferred   : " << total_received << " items" << std::endl;
    std::cout << "Stress Verification Run-time: " << elapsed_ms << " ms" << std::endl;
    std::cout << "Throughput Score           : " << throughput_million_ops << " million events/sec" << std::endl;
    std::cout << "Security & Data Integrity  : " << (integrity_verified ? "PASSED" : "FAILED") << std::endl;
    std::cout << "==========================================================" << std::endl;

    assert(total_received == TEST_EVENTS && "Error: We lost events inside the ring buffer!");
    assert(integrity_verified && "Error: Memory barriers failed, records are corrupt!");

    std::cout << "[✓] SPSC Ring Buffer verification successful! No locks, zero packet loss." << std::endl;

    return 0;
}
