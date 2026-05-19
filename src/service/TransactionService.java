package service;

import models.*;
import repository.ProductRepository;
import repository.TransactionRepository;

import java.util.List;
import java.util.Optional;

/**
 * TransactionService — versi MySQL.
 *
 * ✅ PERBAIKAN:
 *   1. tambahItem() → setelah kurangi stok, langsung persist ke DB
 *      via productRepository.update() agar stok tidak balik saat restart.
 *   2. simpanTransaksi() → transactionRepository.save() sekarang
 *      INSERT ke MySQL, bukan ArrayList.
 */
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository     productRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              ProductRepository productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository     = productRepository;
    }

    // ── BUAT TRANSAKSI BARU ──────────────────────────────────────────
    public Transaction buatTransaksi(Member member) {
        return new Transaction(member);
    }

    // ── TAMBAH ITEM KE TRANSAKSI ─────────────────────────────────────
    public String tambahItem(Transaction transaksi, String produkId, int qty) {
        Optional<Product> opt = productRepository.findById(produkId);
        if (opt.isEmpty())            return "Produk tidak ditemukan.";

        Product produk = opt.get();
        if (qty <= 0)                 return "Jumlah harus lebih dari 0.";
        if (produk.getStock() < qty)  return "Stok tidak mencukupi! (tersisa " + produk.getStock() + ")";

        // Buat item dengan kalkulasi diskon member (Polymorphism via Discountable)
        TransactionItem item = new TransactionItem(produk, qty, transaksi.getMemberTier());
        transaksi.addItem(item);

        // ✅ FIX: Kurangi stok dan langsung persist ke MySQL
        produk.setStock(produk.getStock() - qty);
        productRepository.update(produk);

        return null; // null = sukses
    }

    // ── SIMPAN TRANSAKSI KE DATABASE ─────────────────────────────────
    public void simpanTransaksi(Transaction transaksi) {
        // ✅ FIX: save() sekarang INSERT ke MySQL (TransactionRepository versi MySQL)
        transactionRepository.save(transaksi);
    }

    // ── READ ────────────────────────────────────────────────────────
    public List<Transaction>     semuaTransaksi()          { return transactionRepository.findAll(); }
    public Optional<Transaction> cariById(String id)       { return transactionRepository.findById(id); }
    public boolean               isEmpty()                 { return transactionRepository.isEmpty(); }
}