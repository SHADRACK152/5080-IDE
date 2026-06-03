#pragma once

#include <atomic>
#include <cstddef>
#include <cstdint>
#include <concepts>
#include <array>
#include <new>

namespace ide5080::core {

enum class EventType : uint32_t {
    InsertChar     = 0,
    Backspace      = 1,
    ViewportScroll = 2
};

struct UIEvent {
    EventType type;
    union {
        struct {
            char chars[32];
            uint32_t length;
            uint64_t logical_offset;
        } insert;
        struct {
            uint64_t logical_offset;
            uint32_t count;
        } backspace;
        struct {
            uint32_t top_line;
            uint32_t left_column;
        } scroll;
    } payload;
};

/**
 * @brief Lock-Free Single-Producer Single-Consumer (SPSC) Ring Buffer.
 * Structured specifically to transfer UI events to our headless core with O(1) latency.
 */
template <typename T, size_t Capacity = 4096>
class SPSCRingBuffer {
    static_assert((Capacity & (Capacity - 1)) == 0, "Capacity must be a power of two to optimize index masking!");

public:
    SPSCRingBuffer() : m_write_idx(0), m_read_idx(0) {}

    ~SPSCRingBuffer() = default;

    // SPSC cannot be copied or mapped across multiple instances
    SPSCRingBuffer(const SPSCRingBuffer&) = delete;
    SPSCRingBuffer& operator=(const SPSCRingBuffer&) = delete;

    /**
     * @brief Pushes a single item into the ring buffer using release semantics.
     * Accessible on the UI/Node Thread.
     */
    bool push(const T& item) noexcept {
        const size_t write_pos = m_write_idx.load(std::memory_order_relaxed);
        const size_t read_pos  = m_read_idx.load(std::memory_order_acquire); // Acquire updated read index

        if ((write_pos - read_pos) >= Capacity) {
            return false; // Queue is completely full
        }

        m_buffer[write_pos & MASK] = item;
        m_write_idx.store(write_pos + 1, std::memory_order_release); // Release written memory structure maps to RAM
        return true;
    }

    /**
     * @brief Pulls a single item out of the ring buffer using acquire semantics.
     * Accessible on the Core Thread.
     */
    bool pop(T& item) noexcept {
        const size_t read_pos  = m_read_idx.load(std::memory_order_relaxed);
        const size_t write_pos = m_write_idx.load(std::memory_order_acquire); // Acquire updated write index

        if (read_pos == write_pos) {
            return false; // Queue is empty
        }

        item = m_buffer[read_pos & MASK];
        m_read_idx.store(read_pos + 1, std::memory_order_release); // Signal read vacancy
        return true;
    }

    /**
     * @brief Low-overhead batch extraction to minimize cross-core cache invalidation.
     * @param out_buffer Output buffer to write elements into.
     * @param max_count Maximum number of operations to process.
     * @return Number of items retrieved successfully.
     */
    size_t pop_batch(T* out_buffer, size_t max_count) noexcept {
        const size_t read_pos  = m_read_idx.load(std::memory_order_relaxed);
        const size_t write_pos = m_write_idx.load(std::memory_order_acquire); // Synchronize write index

        if (read_pos == write_pos) {
            return 0; // Empty boundary
        }

        size_t available = write_pos - read_pos;
        size_t to_extract = (available < max_count) ? available : max_count;

        for (size_t i = 0; i < to_extract; ++i) {
            out_buffer[i] = m_buffer[(read_pos + i) & MASK];
        }

        m_read_idx.store(read_pos + to_extract, std::memory_order_release); // Commit batch pop safely
        return to_extract;
    }

    [[nodiscard]] size_t size() const noexcept {
        const size_t write_pos = m_write_idx.load(std::memory_order_relaxed);
        const size_t read_pos  = m_read_idx.load(std::memory_order_relaxed);
        return (write_pos >= read_pos) ? (write_pos - read_pos) : 0;
    }

    [[nodiscard]] bool empty() const noexcept {
        return m_write_idx.load(std::memory_order_relaxed) == m_read_idx.load(std::memory_order_relaxed);
    }

private:
    static constexpr size_t MASK = Capacity - 1;

    // Store array buffer elements
    alignas(64) std::array<T, Capacity> m_buffer;

    // Align indices on separate 64-byte boundaries to avoid CPU core false sharing
    alignas(64) std::atomic<size_t> m_write_idx;
    alignas(64) std::atomic<size_t> m_read_idx;
};

} // namespace ide5080::core
