package service;

import models.*;
import repository.ProductRepository;

import java.util.List;
import java.util.Optional;

/**
 * LAYER SERVICE — Logika bisnis untuk manajemen Produk.
 *
 * Tanggung jawab:
 *   - Validasi input bisnis
 *   - Koordinasi antar operasi
 *   - Menggunakan Repository untuk akses data
 *
 * Layer ini TIDAK menangani I/O (Scanner/print) — itu urusan Controller.
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
        Product produk = buildProduct(nama, harga, stok, size, hasDiscount, discountPercent, kategori, jenisIndex);
        productRepository.save(produk);
        return produk;
    }

    /** Factory method: buat objek produk sesuai kategori (Polymorphism) */
    private Product buildProduct(String nama, double harga, int stok, String size,
                                 boolean hasDiscount, double discountPercent,
                                 String kategori, int jenisIndex) {
        return switch (kategori) {
            case "T-Shirts"          -> new TShirt(nama, harga, stok, size, hasDiscount, discountPercent,
                    TShirt.JenisTShirt.values()[jenisIndex]);
            case "Headwear"          -> new Headwear(nama, harga, stok, size, hasDiscount, discountPercent,
                    Headwear.JenisHeadwear.values()[jenisIndex]);
            case "Outerwear"         -> new Outerwear(nama, harga, stok, size, hasDiscount, discountPercent,
                    Outerwear.JenisOuterwear.values()[jenisIndex]);
            case "Footwear"          -> new Footwear(nama, harga, stok, size, hasDiscount, discountPercent,
                    Footwear.JenisFootwear.values()[jenisIndex]);
            case "Gift & Accessories"-> new GiftAccessory(nama, harga, stok, size, hasDiscount, discountPercent,
                    GiftAccessory.JenisGift.values()[jenisIndex]);
            default -> throw new IllegalArgumentException("Kategori tidak valid: " + kategori);
        };
    }

    // ── READ ────────────────────────────────────────────────────────
    public List<Product> semuaProduk()                        { return productRepository.findAll(); }
    public Optional<Product> cariById(String id)              { return productRepository.findById(id); }
    public List<Product> cariByKategori(String kat)           { return productRepository.findByCategory(kat); }
    public boolean isEmpty()                                   { return productRepository.isEmpty(); }

    // ── UPDATE ──────────────────────────────────────────────────────
    public boolean updateNama(String id, String namaBaru) {
        Optional<Product> opt = productRepository.findById(id);
        opt.ifPresent(p -> p.setName(namaBaru));
        return opt.isPresent();
    }

    public boolean updateHarga(String id, double hargaBaru) {
        Optional<Product> opt = productRepository.findById(id);
        opt.ifPresent(p -> p.setPrice(hargaBaru));
        return opt.isPresent();
    }

    public boolean updateStok(String id, int stokBaru) {
        Optional<Product> opt = productRepository.findById(id);
        opt.ifPresent(p -> p.setStock(stokBaru));
        return opt.isPresent();
    }

    public boolean updateLengkap(String id, String nama, double harga, int stok) {
        Optional<Product> opt = productRepository.findById(id);
        opt.ifPresent(p -> { p.setName(nama); p.setPrice(harga); p.setStock(stok); });
        return opt.isPresent();
    }

    // ── DELETE ──────────────────────────────────────────────────────
    public boolean hapusProduk(String id) {
        return productRepository.delete(id);
    }

    // ── STOCK MANAGEMENT ────────────────────────────────────────────
    /** Kurangi stok saat transaksi; return false jika stok tidak cukup */
    public boolean kurangiStok(String id, int qty) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) return false;
        Product p = opt.get();
        if (p.getStock() < qty) return false;
        p.setStock(p.getStock() - qty);
        return true;
    }
}