import api.ApiServer;
import api.DataSeeder;

import repository.MemberRepository;
import repository.ProductRepository;
import repository.TransactionRepository;

import service.MemberService;
import service.ProductService;
import service.TransactionService;

/**
 * MAIN APPLICATION
 * Sistem Manajemen Merchandise McLaren F1
 * Mode: REST API Server (untuk Web Frontend)
 */
public class Main {

    public static void main(String[] args) throws Exception {

        // =========================
        // REPOSITORY LAYER (sama persis, tidak berubah)
        // =========================
        ProductRepository     productRepository     = new ProductRepository();
        MemberRepository      memberRepository      = new MemberRepository();
        TransactionRepository transactionRepository = new TransactionRepository();

        // =========================
        // SERVICE LAYER (sama persis, tidak berubah)
        // =========================
        ProductService     productService     = new ProductService(productRepository);
        MemberService      memberService      = new MemberService(memberRepository);
        TransactionService transactionService = new TransactionService(transactionRepository, productRepository);

        // =========================
        // DATA AWAL (opsional — bisa dihapus kalau tidak mau seed)
        // =========================
        DataSeeder.seed(productService, memberService);

        // =========================
        // JALANKAN HTTP API SERVER
        // =========================
        ApiServer server = new ApiServer(productService, memberService, transactionService);
        server.start();

        // Jaga agar program tidak langsung keluar
        System.out.println("Server berjalan. Tekan ENTER untuk berhenti...");
        System.in.read();
        server.stop();
    }
}