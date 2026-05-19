package models;

/**
 * Model TransactionItem — satu baris item dalam sebuah transaksi.
 * Menerapkan konsep: Encapsulation, Polymorphism (instanceof Discountable)
 */
public class TransactionItem {

    private Product product;
    private int     qty;
    private double  priceAtTime;      // harga produk saat transaksi (setelah diskon produk)
    private double  discountedPrice;  // harga setelah diskon member

    public TransactionItem(Product product, int qty, String memberTier) {
        this.product      = product;
        this.qty          = qty;
        this.priceAtTime  = product.getFinalPrice();

        // Polymorphism: cek apakah produk implementasi Discountable
        if (memberTier != null && !"NONE".equals(memberTier) && product instanceof Discountable) {
            this.discountedPrice = ((Discountable) product).calculateMemberDiscount(memberTier);
        } else {
            this.discountedPrice = priceAtTime;
        }
    }

    public double getSubtotal() { return discountedPrice * qty; }
    public double getSavings()  { return (priceAtTime - discountedPrice) * qty; }

    // ── Getters ──────────────────────────────────────────────────
    public Product getProduct()          { return product; }
    public int     getQty()              { return qty; }
    public double  getPriceAtTime()      { return priceAtTime; }
    public double  getDiscountedPrice()  { return discountedPrice; }
}