#include "core_memory_arena.hpp"
#include "piece_leaf.hpp"
#include <iostream>
#include <cassert>

using namespace ide5080::core;

void run_arena_alignment_tests() {
    std::cout << "[5080 Core Engine Suite] Running Arena Alignment Tests..." << std::endl;

    // Allocate an arena of 1 MB (1024 * 1024 bytes)
    size_t arena_capacity = 1014 * 1024; // Will be aligned up inside CoreMemoryArena
    CoreMemoryArena arena(arena_capacity);

    std::cout << "Arena Initialized. Capacity: " << arena.capacity() << " bytes." << std::endl;

    // Allocate 3 separate PieceLeaf nodes and verify alignment on 64-byte boundaries
    void* ptr1 = arena.allocate(sizeof(PieceLeaf));
    void* ptr2 = arena.allocate(sizeof(PieceLeaf));
    void* ptr3 = arena.allocate(sizeof(PieceLeaf));

    std::cout << "Allocation 1 address: " << ptr1 << " (alignment offset: " << (reinterpret_cast<uintptr_t>(ptr1) % 64) << ")" << std::endl;
    std::cout << "Allocation 2 address: " << ptr2 << " (alignment offset: " << (reinterpret_cast<uintptr_t>(ptr2) % 64) << ")" << std::endl;
    std::cout << "Allocation 3 address: " << ptr3 << " (alignment offset: " << (reinterpret_cast<uintptr_t>(ptr3) % 64) << ")" << std::endl;

    // Assert alignment correctness
    assert(reinterpret_cast<uintptr_t>(ptr1) % 64 == 0 && "Error: Allocation 1 is not 64-byte aligned!");
    assert(reinterpret_cast<uintptr_t>(ptr2) % 64 == 0 && "Error: Allocation 2 is not 64-byte aligned!");
    assert(reinterpret_cast<uintptr_t>(ptr3) % 64 == 0 && "Error: Allocation 3 is not 64-byte aligned!");

    std::cout << "[✓] 64-byte memory boundary alignment verified!" << std::endl;

    // Initialize custom STL ArenaAllocator
    ArenaAllocator<double> allocator(arena);
    double* d_arr = allocator.allocate(100); // 100 doubles (800 bytes, rounded up to 64 bytes = 832)
    assert(reinterpret_cast<uintptr_t>(d_arr) % 64 == 0 && "Error: Standard Allocator returned unaligned pointer!");
    
    std::cout << "[✓] STL ArenaAllocator alignment check successful!" << std::endl;
}

void run_piece_soa_tests() {
    std::cout << "[5080 Core Engine Suite] Running PieceLeaf Structure-of-Arrays (SoA) Tests..." << std::endl;

    PieceLeaf leaf;
    leaf.count = 0;
    leaf.leaf_logical_length = 0;

    // Append some mock piece descriptors
    leaf.append(BufferType::Original, 100, 50);
    leaf.append(BufferType::Append, 0, 15);
    leaf.append(BufferType::Original, 1000, 25);

    assert(leaf.count == 3);
    assert(leaf.leaf_logical_length == 90);

    auto piece0 = leaf.get_piece(0);
    assert(piece0.type == BufferType::Original);
    assert(piece0.source_offset == 100);
    assert(piece0.length == 50);

    auto piece1 = leaf.get_piece(1);
    assert(piece1.type == BufferType::Append);
    assert(piece1.source_offset == 0);
    assert(piece1.length == 15);

    // Test a mid-leaf insertion split logic
    leaf.insert_at_index(1, BufferType::Original, 500, 10);
    assert(leaf.count == 4);
    assert(leaf.leaf_logical_length == 100);

    auto inserted = leaf.get_piece(1);
    assert(inserted.type == BufferType::Original);
    assert(inserted.source_offset == 500);
    assert(inserted.length == 10);

    // Test leaf splinter split action
    PieceLeaf secondary_leaf;
    leaf.split_to(secondary_leaf);

    assert(leaf.count == 2);
    assert(secondary_leaf.count == 2);
    assert(leaf.leaf_logical_length + secondary_leaf.leaf_logical_length == 100);

    std::cout << "[✓] PieceLeaf SoA mutations and split-transfer verified!" << std::endl;
}

int main() {
    try {
        run_arena_alignment_tests();
        run_piece_soa_tests();
        std::cout << "\n=============================================" << std::endl;
        std::cout << "Phase 1 Memory Primitives Successfully Verified!" << std::endl;
        std::cout << "=============================================" << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Phase 1 Test Suite Failed with exception: " << e.what() << std::endl;
        return 1;
    }
}
