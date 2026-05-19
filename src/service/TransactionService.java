package service;

import models.*;
import repository.ProductRepository;
import repository.TransactionRepository;

import java.util.List;
import java.util.Optional;

/**
 * LAYER SERVICE — Logika bisnis untuk proses Transaksi.
 *
 * Tanggung jawab:
 *   - Membuat transaksi baru
 *   - Menambahkan item ke transaksi (validasi stok)
 *   - Menghitung harga setelah diskon member (Polymorphism via Discountable)
 *   - Menyimpan transaksi selesai
 */
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository     productRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              ProductRepository productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository     = productRepository;
    }

    /** Buat transaksi baru (boleh null untuk non-member) */
    public Transaction buatTransaksi(Member member) {
        return new Transaction(member);
    }

    /**
     * Tambahkan produk ke transaksi.
     * Validasi: produk ada, stok cukup.
     * Kembalikan pesan error atau null jika sukses.
     */
    public String tambahItem(Transaction transaksi, String produkId, int qty) {
        Optional<Product> opt = productRepository.findById(produkId);
        if (opt.isEmpty())            return "Produk tidak ditemukan.";

        Product produk = opt.get();
        if (qty <= 0)                 return "Jumlah harus lebih dari 0.";
        if (produk.getStock() < qty)  return "Stok tidak mencukupi! (tersisa " + produk.getStock() + ")";

        // Buat item — Polymorphism: kalkulasi diskon member via interface Discountable
        TransactionItem item = new TransactionItem(produk, qty, transaksi.getMemberTier());
        transaksi.addItem(item);

        // Kurangi stok langsung
        produk.setStock(produk.getStock() - qty);
        return null; // null = sukses
    }

    /** Selesaikan & simpan transaksi ke repository */
    public void simpanTransaksi(Transaction transaksi) {
        transactionRepository.save(transaksi);
    }

    // ── READ ────────────────────────────────────────────────────────
    public List<Transaction>     semuaTransaksi()                        { return transactionRepository.findAll(); }
    public Optional<Transaction> cariById(String id)                     { return transactionRepository.findById(id); }
    public boolean               isEmpty()                               { return transactionRepository.isEmpty(); }
}