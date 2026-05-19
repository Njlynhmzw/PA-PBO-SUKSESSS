package models;

/**
 * Abstract class sebagai blueprint utama semua produk McLaren.
 * Menerapkan konsep: Abstraction & Encapsulation
 */
public abstract class Product {

    // ── Encapsulation: semua field private ──────────────────────────
    private String  id;
    private String  name;
    private double  price;
    private int     stock;
    private String  size;
    private boolean hasDiscount;
    private double  discountPercent;

    private static int counter = 1;

    // ── Constructor ─────────────────────────────────────────────────
    public Product(String name, double price, int stock,
                   String size, boolean hasDiscount, double discountPercent) {
        this.id              = generateId();
        this.name            = name;
        this.price           = price;
        this.stock           = stock;
        this.size            = size;
        this.hasDiscount     = hasDiscount;
        this.discountPercent = hasDiscount ? discountPercent : 0.0;
    }

    // ── ID generator ────────────────────────────────────────────────
    private String generateId() {
        return String.format("MCL-%03d", counter++);
    }

    // ── Abstract methods (wajib diimplementasikan subclass) ─────────
    public abstract String getCategory();
    public abstract String getJenis();
    public abstract String getDetailInfo();

    // ── Business logic ──────────────────────────────────────────────
    public double getFinalPrice() {
        if (hasDiscount) return price * (1 - discountPercent / 100);
        return price;
    }

    public String getStatusStok() {
        if (stock == 0)  return "HABIS";
        if (stock <= 5)  return "MENIPIS";
        return "TERSEDIA";
    }

    // ── Getters & Setters bervalidasi ────────────────────────────────
    public String getId()    { return id; }

    public String getName()  { return name; }
    public void setName(String name) {
        if (name == null || name.trim().isEmpty())
            throw new IllegalArgumentException("Nama produk tidak boleh kosong!");
        this.name = name.trim();
    }

    public double getPrice() { return price; }
    public void setPrice(double price) {
        if (price <= 0) throw new IllegalArgumentException("Harga harus lebih dari 0!");
        this.price = price;
    }

    public int getStock()    { return stock; }
    public void setStock(int stock) {
        if (stock < 0) throw new IllegalArgumentException("Stok tidak boleh negatif!");
        this.stock = stock;
    }

    public String getSize()  { return size; }
    public void setSize(String size) { this.size = size; }

    public boolean isHasDiscount()       { return hasDiscount; }
    public void setHasDiscount(boolean v) {
        this.hasDiscount = v;
        if (!v) this.discountPercent = 0.0;
    }

    public double getDiscountPercent()   { return discountPercent; }
    public void setDiscountPercent(double v) {
        if (v < 0 || v > 100)
            throw new IllegalArgumentException("Diskon harus antara 0–100%!");
        this.discountPercent = v;
    }

    // ── Static counter helpers ────────────────────────────────────
    public static void resetCounter()      { counter = 1; }
    public static int  getCounter()        { return counter; }
    public static void setCounter(int val) { counter = val; }

    @Override
    public String toString() {
        return String.format("%-10s | %-30s | Rp %,10.0f | Stok: %3d | %s",
                id, name, price, stock, getStatusStok());
    }
}