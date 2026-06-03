#pragma once

#include <cstddef>
#include <cstdint>
#include <concepts>
#include <memory>
#include <new>
#include <stdexcept>
#include <bit>

namespace ide5080::core {

/**
 * @brief Thread-safe (or thread-confined depending on usage) 64-byte Aligned Memory Arena.
 * Optimized for high-throughput, low-latency allocations on the editor's critical path.
 */
class CoreMemoryArena {
public:
    static constexpr size_t ALIGNMENT = 64;

    explicit CoreMemoryArena(size_t capacity_bytes)
        : m_capacity(capacity_bytes), m_offset(0) {
        
        // Ensure capacity is a multiple of 64 bytes
        m_capacity = (m_capacity + ALIGNMENT - 1) & ~(ALIGNMENT - 1);
        
        // Allocate raw block with 64-byte alignment
#if defined(_MSC_VER)
        m_buffer = static_cast<uint8_t*>(_aligned_malloc(m_capacity, ALIGNMENT));
        if (!m_buffer) throw std::bad_alloc();
#else
        int res = posix_memalign(reinterpret_cast<void**>(&m_buffer), ALIGNMENT, m_capacity);
        if (res != 0) throw std::bad_alloc();
#endif
    }

    ~CoreMemoryArena() noexcept {
        if (m_buffer) {
#if defined(_MSC_VER)
            _aligned_free(m_buffer);
#else
            free(m_buffer);
#endif
            m_buffer = nullptr;
        }
    }

    // No copy, only move semantics (if wanted) or disable completely to ensure strict ownership
    CoreMemoryArena(const CoreMemoryArena&) = delete;
    CoreMemoryArena& operator=(const CoreMemoryArena&) = delete;
    CoreMemoryArena(CoreMemoryArena&& other) noexcept
        : m_buffer(other.m_buffer), m_capacity(other.m_capacity), m_offset(other.m_offset) {
        other.m_buffer = nullptr;
        other.m_capacity = 0;
        other.m_offset = 0;
    }

    CoreMemoryArena& operator=(CoreMemoryArena&& other) noexcept {
        if (this != &other) {
            if (m_buffer) {
#if defined(_MSC_VER)
                _aligned_free(m_buffer);
#else
                free(m_buffer);
#endif
            }
            m_buffer = other.m_buffer;
            m_capacity = other.m_capacity;
            m_offset = other.m_offset;
            other.m_buffer = nullptr;
            other.m_capacity = 0;
            other.m_offset = 0;
        }
        return *this;
    }

    /**
     * @brief Allocates 64-byte aligned block of memory from the pre-allocated arena block.
     * @param bytes Number of bytes to allocate.
     * @return Aligned pointer to the allocated memory.
     */
    [[nodiscard]] void* allocate(size_t bytes) {
        // Round up the allocation size to a multiple of 64 bytes to preserve alignment
        size_t aligned_size = (bytes + ALIGNMENT - 1) & ~(ALIGNMENT - 1);

        if (m_offset + aligned_size > m_capacity) {
            throw std::runtime_error("5080 Core Engine Exception: CoreMemoryArena out of memory capacity!");
        }

        uint8_t* ptr = m_buffer + m_offset;
        m_offset += aligned_size;

        return static_cast<void*>(ptr);
    }

    /**
     * @brief Resets the arena memory pointer safely, invalidating all current allocations.
     * Fast O(1) deallocation of all items.
     */
    void reset() noexcept {
        m_offset = 0;
    }

    [[nodiscard]] size_t capacity() const noexcept { return m_capacity; }
    [[nodiscard]] size_t used_bytes() const noexcept { return m_offset; }
    [[nodiscard]] size_t free_bytes() const noexcept { return m_capacity - m_offset; }

private:
    uint8_t* m_buffer = nullptr;
    size_t m_capacity = 0;
    size_t m_offset = 0;
};

/**
 * @brief STL-compatible Allocator wrapping our CoreMemoryArena for use in std containers.
 */
template <typename T>
class ArenaAllocator {
public:
    using value_type = T;

    explicit ArenaAllocator(CoreMemoryArena& arena) noexcept : m_arena(&arena) {}

    template <typename U>
    constexpr ArenaAllocator(const ArenaAllocator<U>& other) noexcept : m_arena(other.m_arena) {}

    [[nodiscard]] T* allocate(size_t n) {
        if (n == 0) return nullptr;
        void* ptr = m_arena->allocate(n * sizeof(T));
        return static_cast<T*>(ptr);
    }

    void deallocate(T* p, size_t n) noexcept {
        // deallocation is a no-op within the Arena lifecycle
    }

    template <typename U, typename... Args>
    void construct(U* p, Args&&... args) {
        ::new (static_cast<void*>(p)) U(std::forward<Args>(args)...);
    }

    template <typename U>
    void destroy(U* p) noexcept {
        p->~U();
    }

    template <typename U>
    struct rebind {
        using other = ArenaAllocator<U>;
    };

    CoreMemoryArena* m_arena;
};

template <typename T, typename U>
bool operator==(const ArenaAllocator<T>& a, const ArenaAllocator<U>& b) noexcept {
    return a.m_arena == b.m_arena;
}

template <typename T, typename U>
bool operator!=(const ArenaAllocator<T>& a, const ArenaAllocator<U>& b) noexcept {
    return !(a == b);
}

} // namespace ide5080::core
