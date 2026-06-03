#pragma once

#include <cstddef>
#include <cstdint>
#include <type_traits>
#include <array>

namespace ide5080::core {

enum class BufferType : uint32_t {
    Original = 0,
    Append   = 1
};

/**
 * @brief Represents custom structural elements inside a Piece table.
 * Laid out in Structure of Arrays (SoA) format with 64-byte memory boundary alignments.
 */
struct alignas(64) PieceLeaf {
    // 64 pieces per leaf allows the arrays to fit beautifully into standard cache-lines.
    static constexpr size_t MAX_PIECES = 64;

    // Structure of Arrays (SoA) to guarantee sequential L1/L2 data access and SIMD friendliness
    alignas(64) BufferType buffer_types[MAX_PIECES];
    alignas(64) uint64_t   source_offsets[MAX_PIECES];
    alignas(64) uint32_t   lengths[MAX_PIECES];

    // Node pointers for balanced lookup or tree traversals
    PieceLeaf* parent = nullptr;
    PieceLeaf* left = nullptr;
    PieceLeaf* right = nullptr;
    
    // Intrusive linked list trackers for fast in-order leaf traversal
    PieceLeaf* next = nullptr;
    PieceLeaf* prev = nullptr;

    // Logical sizes and metadata
    uint32_t count = 0;              // Current active pieces in this leaf
    uint32_t leaf_logical_length = 0; // Total text characters represented by this entire leaf
    bool is_leaf = true;

    /**
     * @brief Inserts a piece descriptor into the arrays at a specific index within the leaf.
     */
    void insert_at_index(size_t index, BufferType type, uint64_t source_offset, uint32_t length) noexcept {
        if (index > count || count >= MAX_PIECES) return;

        // Shift elements down in SoA layout
        for (size_t i = count; i > index; --i) {
            buffer_types[i]   = buffer_types[i - 1];
            source_offsets[i] = source_offsets[i - 1];
            lengths[i]        = lengths[i - 1];
        }

        buffer_types[index]   = type;
        source_offsets[index] = source_offset;
        lengths[index]        = length;

        count++;
        leaf_logical_length += length;
    }

    /**
     * @brief Appends a piece to the leaf.
     */
    void append(BufferType type, uint64_t source_offset, uint32_t length) noexcept {
        insert_at_index(count, type, source_offset, length);
    }

    /**
     * @brief Splits the current leaf in half, transferring the latter half of the items.
     * @param target Splitting target leaf where items are moved to.
     */
    void split_to(PieceLeaf& target) noexcept {
        size_t split_point = count / 2;
        size_t move_count = count - split_point;

        for (size_t i = 0; i < move_count; ++i) {
            size_t src_idx = split_point + i;
            target.buffer_types[i]   = this->buffer_types[src_idx];
            target.source_offsets[i] = this->source_offsets[src_idx];
            target.lengths[i]        = this->lengths[src_idx];
            target.leaf_logical_length += this->lengths[src_idx];
            this->leaf_logical_length  -= this->lengths[src_idx];
        }

        target.count = static_cast<uint32_t>(move_count);
        this->count  = static_cast<uint32_t>(split_point);
    }

    /**
     * @brief Returns details of a specific piece descriptor within this SoA leaf.
     */
    struct PieceView {
        BufferType type;
        uint64_t source_offset;
        uint32_t length;
    };

    [[nodiscard]] PieceView get_piece(size_t index) const noexcept {
        return PieceView{
            .type = buffer_types[index],
            .source_offset = source_offsets[index],
            .length = lengths[index]
        };
    }
};

// Compile-time assertions of the structural alignments and offsets
static_assert(sizeof(PieceLeaf) % 64 == 0, "PieceLeaf struct size must be 64-byte aligned to maximize cache-line prefetching!");
static_assert(alignof(PieceLeaf) == 64, "PieceLeaf struct must be strictly 64-byte aligned!");

} // namespace ide5080::core
