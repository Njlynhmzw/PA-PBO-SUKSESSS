package service;

import models.*;
import repository.ProductRepository;

import java.util.List;
import java.util.Optional;

/**
 * LAYER SERVICE — Logika bisnis untuk manajemen Produk.
 *
 * ✅ PERBAIKAN:
 *   1. tambahProduk() → pakai productRepository.createNew() agar ID
 *      di-generate dari tabel counters di MySQL (PRD-0001, dst.)
 *      dan data langsung masuk ke database.
 *   2. update*() → pakai productRepository.update() agar perubahan
 *      benar-benar di-UPDATE ke MySQL, tidak hanya di memory.
 *   3. kurangiStok() → persist ke database agar stok tidak balik
 *      ke angka lama saat server restart.
 */
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ── CREATE ──────────────────────────────────────────────────────
    public Product tambahProduk(String nama, double harga, int stok, String size,
                                boolean hasDiscount, double discountPercent,
                                String kategori, int jenisIndex) {
        // ✅ FIX: createNew() = generate ID dari counters MySQL + INSERT ke DB
        return productRepository.createNew(
                nama, harga, stok, size,
                hasDiscount, discountPercent,
                kategori, jenisIndex
        );
    }

    // ── READ ────────────────────────────────────────────────────────
    public List<Product>     semuaProduk()              { return productRepository.findAll(); }
    public Optional<Product> cariById(String id)        { return productRepository.findById(id); }
    public List<Product>     cariByKategori(String kat) { return productRepository.findByCategory(kat); }
    public boolean           isEmpty()                  { return productRepository.isEmpty(); }

    // ── UPDATE ──────────────────────────────────────────────────────
    public boolean updateNama(String id, String namaBaru) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        p.setName(namaBaru);
        productRepository.update(p);   // ✅ FIX: persist ke MySQL
        return true;
    }

    public boolean updateHarga(String id, double hargaBaru) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        p.setPrice(hargaBaru);
        productRepository.update(p);   // ✅ FIX: persist ke MySQL
        return true;
    }

    public boolean updateStok(String id, int stokBaru) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        p.setStock(stokBaru);
        productRepository.update(p);   // ✅ FIX: persist ke MySQL
        return true;
    }

    public boolean updateLengkap(String id, String nama, double harga, int stok) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        p.setName(nama);
        p.setPrice(harga);
        p.setStock(stok);
        productRepository.update(p);   // ✅ FIX: persist ke MySQL
        return true;
    }

    // ── DELETE ──────────────────────────────────────────────────────
    public boolean hapusProduk(String id) {
        return productRepository.delete(id);
    }

    // ── STOCK MANAGEMENT ────────────────────────────────────────────
    public boolean kurangiStok(String id, int qty) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        if (p.getStock() < qty) return false;
        p.setStock(p.getStock() - qty);
        productRepository.update(p);   // ✅ FIX: persist ke MySQL
        return true;
    }
}