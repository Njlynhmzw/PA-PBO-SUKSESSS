package controller;

import models.Displayable;
import models.Product;
import service.ProductService;
import util.InputHelper;

import java.util.Optional;
import java.util.Scanner;

/**
 * LAYER CONTROLLER — Menangani I/O untuk menu Produk.
 *
 * Tanggung jawab:
 *   - Membaca input pengguna (Scanner)
 *   - Menampilkan output ke console
 *   - Memanggil ProductService untuk operasi bisnis
 *   - TIDAK berisi logika bisnis langsung
 */
public class ProductController {

    private final ProductService productService;
    private final Scanner        input;

    // Mapping kategori & jenis untuk menu
    private static final String[][] JENIS_MAP = {
            {"Polo Shirt","Crew Neck","V-Neck","Oversized","Racing Tee"},           // T-Shirts
            {"Snapback Cap","Fitted Cap","Bucket Hat","Beanie","Visor"},            // Headwear
            {"Jacket","Hoodie","Windbreaker","Rain Jacket","Varsity Jacket"},       // Outerwear
            {"Sneakers","Sandals","Boots","Slip-On","Racing Shoes"},                // Footwear
            {"Keychain","Mug","Phone Case","Lanyard","Sticker Pack",               // Gift & Acc
                    "Model Car","Backpack","Wallet"}
    };
    private static final String[] KATEGORI_LIST = {
            "T-Shirts","Headwear","Outerwear","Footwear","Gift & Accessories"
    };

    public ProductController(ProductService productService, Scanner input) {
        this.productService = productService;
        this.input          = input;
    }

    // ── TAMBAH ──────────────────────────────────────────────────────
    public void tambahProduk() {
        System.out.println("\n========== TAMBAH PRODUK ==========");

        // Pilih kategori
        System.out.println("Kategori Produk:");
        for (int i = 0; i < KATEGORI_LIST.length; i++)
            System.out.printf("%d. %s%n", i + 1, KATEGORI_LIST[i]);
        System.out.print("Pilih kategori: ");
        int katIdx = InputHelper.readInt(input) - 1;
        if (katIdx < 0 || katIdx >= KATEGORI_LIST.length) { System.out.println("Kategori tidak valid."); return; }
        String kategori = KATEGORI_LIST[katIdx];

        // Input data umum
        System.out.print("Nama Produk      : "); String nama = input.nextLine();
        System.out.print("Harga (Rp)       : "); double harga = InputHelper.readDouble(input);
        System.out.print("Stok             : "); int stok  = InputHelper.readInt(input);
        System.out.print("Size / Varian    : "); String size = input.nextLine();
        System.out.print("Ada diskon? (y/n): "); boolean hasDiskon = input.nextLine().equalsIgnoreCase("y");
        double discountPercent = 0;
        if (hasDiskon) { System.out.print("Persentase diskon: "); discountPercent = InputHelper.readDouble(input); }

        // Pilih jenis
        String[] jenisList = JENIS_MAP[katIdx];
        System.out.println("\nJenis " + kategori + ":");
        for (int i = 0; i < jenisList.length; i++)
            System.out.printf("%d. %s%n", i + 1, jenisList[i]);
        System.out.print("Pilih jenis: ");
        int jenisIdx = InputHelper.readInt(input) - 1;
        if (jenisIdx < 0 || jenisIdx >= jenisList.length) { System.out.println("Jenis tidak valid."); return; }

        try {
            Product p = productService.tambahProduk(nama, harga, stok, size, hasDiskon, discountPercent, kategori, jenisIdx);
            System.out.println("\n✅ Produk berhasil ditambahkan!");
            System.out.println("   ID Produk : " + p.getId());
        } catch (Exception e) {
            System.out.println("❌ Gagal: " + e.getMessage());
        }
    }

    // ── LIHAT ───────────────────────────────────────────────────────
    public void lihatProduk() {
        if (productService.isEmpty()) { System.out.println("\nBelum ada produk."); return; }

        System.out.println("\n1. Tampilan Detail\n2. Tampilan Ringkas");
        System.out.print("Pilih tampilan: ");
        int pilihan = InputHelper.readInt(input);

        System.out.println("\n============= DAFTAR PRODUK =============");
        for (Product p : productService.semuaProduk()) {
            if (p instanceof Displayable d) {
                System.out.println(pilihan == 1 ? d.toDetailString() : d.toSummaryString());
                System.out.println("-----------------------------------------");
            }
        }
    }

    // ── UPDATE ──────────────────────────────────────────────────────
    public void updateProduk() {
        lihatProduk();
        System.out.print("\nMasukkan ID Produk: ");
        String id = input.nextLine();

        Optional<Product> opt = productService.cariById(id);
        if (opt.isEmpty()) { System.out.println("Produk tidak ditemukan."); return; }

        System.out.println("\n1. Update Nama\n2. Update Harga\n3. Update Stok\n4. Update Semua");
        System.out.print("Pilih update: ");
        int pilihan = InputHelper.readInt(input);

        boolean ok = switch (pilihan) {
            case 1 -> { System.out.print("Nama baru: "); yield productService.updateNama(id, input.nextLine()); }
            case 2 -> { System.out.print("Harga baru: "); yield productService.updateHarga(id, InputHelper.readDouble(input)); }
            case 3 -> { System.out.print("Stok baru: "); yield productService.updateStok(id, InputHelper.readInt(input)); }
            case 4 -> {
                System.out.print("Nama baru: ");  String n = input.nextLine();
                System.out.print("Harga baru: "); double h = InputHelper.readDouble(input);
                System.out.print("Stok baru: ");  int s    = InputHelper.readInt(input);
                yield productService.updateLengkap(id, n, h, s);
            }
            default -> false;
        };
        System.out.println(ok ? "✅ Produk berhasil diupdate!" : "❌ Gagal mengupdate produk.");
    }

    // ── HAPUS ───────────────────────────────────────────────────────
    public void hapusProduk() {
        lihatProduk();
        System.out.print("\nMasukkan ID Produk: ");
        String id = input.nextLine();
        System.out.println(productService.hapusProduk(id)
                ? "✅ Produk berhasil dihapus."
                : "❌ Produk tidak ditemukan.");
    }

    // ── HELPER untuk TransactionController ─────────────────────────
    public ProductService getService() { return productService; }
}