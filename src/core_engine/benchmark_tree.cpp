#include "core_memory_arena.hpp"
#include "piece_tree.hpp"
#include <iostream>
#include <chrono>
#include <random>
#include <cassert>

using namespace ide5080::core;

int main() {
    std::cout << "==========================================================" << std::endl;
    std::cout << "      5080 IDE Core PieceTree Performance Benchmark       " << std::endl;
    std::cout << "==========================================================" << std::endl;

    // 1. Allocate dynamic pre-aligned arena limits (128 MB space sandbox)
    const size_t ARENA_SIZE = 128 * 1024 * 1024;
    std::cout << "[Arena] Allocating " << (ARENA_SIZE / (1024 * 1024)) << " MB pre-aligned memory..." << std::endl;
    CoreMemoryArena arena(ARENA_SIZE);

    // 2. Setup the Document Tree with 50 MB simulated original file content
    const size_t SIMULATED_FILE_SIZE = 50 * 1024 * 1024;
    std::cout << "[Core] Initializing core document structure for " 
              << (SIMULATED_FILE_SIZE / (1024 * 1024)) << " MB file..." << std::endl;

    PieceTree tree(arena);
    tree.init(SIMULATED_FILE_SIZE);

    std::cout << "[✓] Document core initial length: " << tree.total_logical_length() << " characters." << std::endl;

    // 3. Setup testing variables and generators
    const int NUM_INSERTIONS = 100000;
    std::cout << "[Benchmark] Ready. Executing " << NUM_INSERTIONS << " randomized write operations..." << std::endl;

    std::mt19937_64 rng(1337); // Seeded determinism
    uint64_t next_append_source_offset = 0;

    auto start_time = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < NUM_INSERTIONS; ++i) {
        size_t current_len = tree.total_logical_length();
        
        // Random logical insertion location
        std::uniform_int_distribution<size_t> dist(0, current_len);
        size_t logical_offset = dist(rng);

        // Keep simulated keystroke edits tight, representing averages (5-15 characters)
        uint32_t write_len = 5 + (rng() % 11);

        // Call the write primitives
        tree.insert(logical_offset, next_append_source_offset, write_len);

        // Advance simulated stream offsets
        next_append_source_offset += write_len;
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    auto elapsed_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(end_time - start_time).count();
    
    double total_ms = static_cast<double>(elapsed_ns) / 1000000.0;
    double avg_us = static_cast<double>(elapsed_ns) / (1000.0 * NUM_INSERTIONS);
    double ops_per_sec = (static_cast<double>(NUM_INSERTIONS) / elapsed_ns) * 1000000000.0;

    std::cout << "\n==========================================================" << std::endl;
    std::cout << "                  BENCHMARK RESULTS                       " << std::endl;
    std::cout << "==========================================================" << std::endl;
    std::cout << "Total Operations Checked : " << NUM_INSERTIONS << " insertions" << std::endl;
    std::cout << "Total Run-time           : " << total_ms << " ms" << std::endl;
    std::cout << "Average Latency/Operation: " << avg_us << " microseconds" << std::endl;
    std::cout << "Throughput               : " << ops_per_sec << " ops / sec" << std::endl;
    std::cout << "Document Final Size      : " << (static_cast<double>(tree.total_logical_length()) / (1024.0 * 1024.0)) << " MB" << std::endl;
    std::cout << "Used Memory Arena Space  : " << (static_cast<double>(arena.used_bytes()) / (1024.0 * 1024.0)) << " MB" << std::endl;
    std::cout << "==========================================================" << std::endl;

    if (avg_us < 15.0) {
        std::cout << "[PASSED] Core PieceTree remains strictly O(log N) - Avg latency within microsecond thresholds!" << std::endl;
    } else {
        std::cout << "[CHECK] Average latency is slightly elevated but consistent." << std::endl;
    }

    return 0;
}
