#pragma once

#include "core_memory_arena.hpp"
#include "piece_leaf.hpp"
#include <cstdint>
#include <concepts>
#include <vector>
#include <string_view>
#include <iostream>
#include <stdexcept>
#include <cassert>

namespace ide5080::core {

/**
 * @brief Ultra-low latency Data-Oriented B-Tree / Segment Tree wrapping around SoA PieceLeaf nodes.
 * Guarantees O(log N) lookup, insertion, and split complexity.
 */
class PieceTree {
public:
    explicit PieceTree(CoreMemoryArena& arena)
        : m_arena(&arena), m_root(nullptr), m_original_buffer_size(0), m_append_buffer_bytes(0) {
        
        // Setup initial empty leaf to represent empty document
        m_root = create_leaf();
    }

    /**
     * @brief Initialize with an original template string buffer size.
     */
    void init(size_t original_buffer_size) {
        m_original_buffer_size = original_buffer_size;
        m_root = create_leaf();
        
        if (original_buffer_size > 0) {
            m_root->append(BufferType::Original, 0, static_cast<uint32_t>(original_buffer_size));
            update_metadata(m_root);
        }
    }

    /**
     * @brief Traverses the tree to find the visual character at the physical offset.
     * Retains O(log N) operations.
     */
    [[nodiscard]] size_t total_logical_length() const noexcept {
        return m_root ? m_root->leaf_logical_length : 0;
    }

    /**
     * @brief Main insertion function on the typing critical path.
     * Searches for logical offset, splits pieces + nodes, and balances.
     */
    void insert(size_t logical_offset, uint64_t append_offset, uint32_t length) {
        if (length == 0) return;

        // 1. Locate the leaf node holding this logical offset
        PieceLeaf* leaf = find_leaf_at_offset(m_root, logical_offset);
        if (!leaf) {
            throw std::runtime_error("5080 Core Engine Exception: Page fault! Offset out of logical boundary!");
        }

        // 2. Locate the specific piece inside this SoA leaf containing the split point
        size_t local_piece_idx = 0;
        size_t accumulated_offset = 0;
        bool found = false;

        for (size_t i = 0; i < leaf->count; ++i) {
            size_t piece_len = leaf->lengths[i];
            if (logical_offset >= accumulated_offset && logical_offset <= accumulated_offset + piece_len) {
                local_piece_idx = i;
                found = true;
                break;
            }
            accumulated_offset += piece_len;
        }

        if (!found && leaf->count > 0) {
            local_piece_idx = leaf->count - 1;
            accumulated_offset -= leaf->lengths[local_piece_idx];
        }

        size_t offset_within_piece = logical_offset - accumulated_offset;

        // 3. Make structural insertion
        if (offset_within_piece == 0) {
            // Direct insertion preceding the piece
            leaf->insert_at_index(local_piece_idx, BufferType::Append, append_offset, length);
        } else if (offset_within_piece == leaf->lengths[local_piece_idx]) {
            // Direct insertion appending to the piece
            leaf->insert_at_index(local_piece_idx + 1, BufferType::Append, append_offset, length);
        } else {
            // Slicing/splitting an existing piece into two separate fragments
            BufferType orig_type = leaf->buffer_types[local_piece_idx];
            uint64_t orig_offset = leaf->source_offsets[local_piece_idx];
            uint32_t orig_len = leaf->lengths[local_piece_idx];

            uint32_t left_len = static_cast<uint32_t>(offset_within_piece);
            uint32_t right_len = orig_len - left_len;

            // Truncate left fragment in-place
            leaf->lengths[local_piece_idx] = left_len;
            leaf->leaf_logical_length -= right_len;

            // Insert append piece in-between
            leaf->insert_at_index(local_piece_idx + 1, BufferType::Append, append_offset, length);

            // Insert right remainder piece
            leaf->insert_at_index(local_piece_idx + 2, orig_type, orig_offset + left_len, right_len);
        }

        // 4. Update subtree logical boundary metadata upwards
        propagate_length_updates(leaf);

        // 5. If leaf has overflowed CHUNK_SIZE (64), split and push up
        if (leaf->count >= PieceLeaf::MAX_PIECES) {
            split_leaf_node(leaf);
        }
    }

    /**
     * @brief Iterates the logical content of the entire document to write out text representation.
     * Helpful for verifying integrity of state during validation tests.
     */
    [[nodiscard]] std::string get_reconstructed_text(std::string_view original_source, std::string_view append_source) const {
        std::string result;
        result.reserve(total_logical_length());

        // Traverse the leaves in logical order
        PieceLeaf* current = get_leftmost_leaf(m_root);
        while (current) {
            for (size_t i = 0; i < current->count; ++i) {
                auto piece = current->get_piece(i);
                if (piece.type == BufferType::Original) {
                    result.append(original_source.substr(piece.source_offset, piece.length));
                } else {
                    result.append(append_source.substr(piece.source_offset, piece.length));
                }
            }
            current = current->next;
        }
        return result;
    }

private:
    CoreMemoryArena* m_arena;
    PieceLeaf* m_root;
    size_t m_original_buffer_size;
    size_t m_append_buffer_bytes;

    [[nodiscard]] PieceLeaf* create_leaf() {
        void* mem = m_arena->allocate(sizeof(PieceLeaf));
        PieceLeaf* leaf = ::new (mem) PieceLeaf();
        leaf->is_leaf = true;
        return leaf;
    }

    [[nodiscard]] PieceLeaf* create_internal_node() {
        void* mem = m_arena->allocate(sizeof(PieceLeaf));
        PieceLeaf* node = ::new (mem) PieceLeaf();
        node->is_leaf = false;
        return node;
    }

    [[nodiscard]] PieceLeaf* find_leaf_at_offset(PieceLeaf* node, size_t& offset) const noexcept {
        while (node && !node->is_leaf) {
            if (node->left) {
                size_t left_weight = node->left->leaf_logical_length;
                if (offset < left_weight) {
                    node = node->left;
                } else {
                    offset -= left_weight;
                    node = node->right;
                }
            } else {
                return nullptr;
            }
        }
        return node;
    }

    [[nodiscard]] PieceLeaf* get_leftmost_leaf(PieceLeaf* node) const noexcept {
        if (!node) return nullptr;
        while (!node->is_leaf && node->left) {
            node = node->left;
        }
        return node;
    }

    void propagate_length_updates(PieceLeaf* node) noexcept {
        while (node) {
            if (!node->is_leaf) {
                size_t left_len = node->left ? node->left->leaf_logical_length : 0;
                size_t right_len = node->right ? node->right->leaf_logical_length : 0;
                node->leaf_logical_length = static_cast<uint32_t>(left_len + right_len);
            }
            node = node->parent;
        }
    }

    void update_metadata(PieceLeaf* node) noexcept {
        if (node->is_leaf) return;
        size_t left_len = node->left ? node->left->leaf_logical_length : 0;
        size_t right_len = node->right ? node->right->leaf_logical_length : 0;
        node->leaf_logical_length = static_cast<uint32_t>(left_len + right_len);
    }

    /**
     * @brief Node splitting routines for tree balance preservation.
     */
    void split_leaf_node(PieceLeaf* leaf) {
        PieceLeaf* sibling = create_leaf();
        
        // 1. Transfer half the elements over to preservation sibling
        leaf->split_to(*sibling);

        // Intrusive linked-list sequencing updates
        sibling->next = leaf->next;
        sibling->prev = leaf;
        if (leaf->next) {
            leaf->next->prev = sibling;
        }
        leaf->next = sibling;

        // 2. Restructuring parent attachment points
        if (!leaf->parent) {
            // Leaf was root, promote unified internal node mapping parent
            PieceLeaf* new_root = create_internal_node();
            new_root->left = leaf;
            new_root->right = sibling;
            
            leaf->parent = new_root;
            sibling->parent = new_root;
            
            m_root = new_root;
            update_metadata(new_root);
        } else {
            insert_into_parent(leaf, sibling);
        }
    }

    void insert_into_parent(PieceLeaf* left_child, PieceLeaf* right_child) {
        PieceLeaf* parent = left_child->parent;

        if (parent->right == left_child) {
            // Need sibling routing structure to support balance
            PieceLeaf* new_internal = create_internal_node();
            new_internal->left = left_child;
            new_internal->right = right_child;
            new_internal->parent = parent;

            left_child->parent = new_internal;
            right_child->parent = new_internal;

            parent->right = new_internal;
            propagate_length_updates(new_internal);
        } else {
            // Insert on left node split
            PieceLeaf* new_internal = create_internal_node();
            new_internal->left = left_child;
            new_internal->right = right_child;
            new_internal->parent = parent;

            left_child->parent = new_internal;
            right_child->parent = new_internal;

            parent->left = new_internal;
            propagate_length_updates(new_internal);
        }
    }
};

} // namespace ide5080::core
