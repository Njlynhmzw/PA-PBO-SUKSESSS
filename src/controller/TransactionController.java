package controller;

import models.*;
import service.MemberService;
import service.ProductService;
import service.TransactionService;
import util.InputHelper;
import util.StrukPrinter;

import java.util.Optional;
import java.util.Scanner;

/**
 * LAYER CONTROLLER — Menangani I/O untuk menu Transaksi.
 */
public class TransactionController {

    private final TransactionService transactionService;
    private final ProductService     productService;
    private final MemberService      memberService;
    private final Scanner            input;

    public TransactionController(TransactionService transactionService,
                                 ProductService productService,
                                 MemberService memberService,
                                 Scanner input) {
        this.transactionService = transactionService;
        this.productService     = productService;
        this.memberService      = memberService;
        this.input              = input;
    }

    // ── TRANSAKSI BARU ──────────────────────────────────────────────
    public void transaksiProduk() {
        if (productService.isEmpty()) { System.out.println("Belum ada produk."); return; }

        // Tampilkan produk ringkas
        System.out.println("\n============= DAFTAR PRODUK =============");
        for (Product p : productService.semuaProduk()) {
            if (p instanceof Displayable d) System.out.println(d.toSummaryString());
        }

        // Identifikasi member
        Member member = null;
        System.out.print("\nApakah pelanggan member? (y/n): ");
        if (input.nextLine().equalsIgnoreCase("y")) {
            System.out.print("Nomor telepon: ");
            String phone = input.nextLine();
            Optional<Member> opt = memberService.cariByPhone(phone);
            if (opt.isPresent()) {
                member = opt.get();
                System.out.printf("✅ Member ditemukan: %s (Tier: %s)%n",
                        member.getName(), member.getTier().getLabel());
            } else {
                System.out.println("❌ Member tidak ditemukan. Lanjut sebagai Non-Member.");
            }
        }

        // Buat transaksi
        Transaction transaksi = transactionService.buatTransaksi(member);
        char tambahLagi;

        do {
            System.out.print("\nMasukkan ID Produk: ");
            String idProduk = input.nextLine();
            System.out.print("Jumlah beli      : ");
            int qty = InputHelper.readInt(input);

            String error = transactionService.tambahItem(transaksi, idProduk, qty);
            if (error != null) { System.out.println("❌ " + error); }
            else               { System.out.println("✅ Item ditambahkan ke transaksi."); }

            System.out.print("Tambah produk lain? (y/n): ");
            tambahLagi = input.nextLine().charAt(0);

        } while (tambahLagi == 'y' || tambahLagi == 'Y');

        // Simpan & catat ke member
        transactionService.simpanTransaksi(transaksi);
        if (member != null) memberService.catatTransaksi(member, transaksi.getTotalAfterDiscount());

        // Cetak struk
        StrukPrinter.cetak(transaksi);
    }

    // ── RIWAYAT ─────────────────────────────────────────────────────
    public void riwayatTransaksi() {
        if (transactionService.isEmpty()) { System.out.println("\nBelum ada transaksi."); return; }
        System.out.println("\n============= RIWAYAT TRANSAKSI =============");
        for (Transaction t : transactionService.semuaTransaksi()) {
            System.out.printf("%-12s | %s | %-20s | Rp %,.0f%n",
                    t.getTransactionId(), t.getFormattedDate(),
                    t.getMember() != null ? t.getMember().getName() : "Non Member",
                    t.getTotalAfterDiscount());
        }
    }
}