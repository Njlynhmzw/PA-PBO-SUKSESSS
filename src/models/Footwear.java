package models;

public class Footwear extends Product implements Discountable, Displayable {

    public enum JenisFootwear {
        SNEAKERS("Sneakers"), SANDALS("Sandals"), BOOTS("Boots"),
        SLIP_ON("Slip-On"), RACING_SHOES("Racing Shoes");
        private final String label;
        JenisFootwear(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private JenisFootwear jenisFootwear;

    public Footwear(String name, double price, int stock, String size,
                    boolean hasDiscount, double discountPercent, JenisFootwear jenis) {
        super(name, price, stock, size, hasDiscount, discountPercent);
        this.jenisFootwear = jenis;
    }

    @Override public String getCategory()   { return "Footwear"; }
    @Override public String getJenis()      { return jenisFootwear.getLabel(); }
    @Override public String getDetailInfo() { return "Jenis: " + jenisFootwear.getLabel() + " | Ukuran: " + getSize(); }

    @Override
    public double calculateMemberDiscount(String memberTier) {
        double base = getFinalPrice();
        if ("PLUS".equals(memberTier))    return base * (1 - MEMBER_PLUS_DISCOUNT / 100);
        if ("REGULAR".equals(memberTier)) return base * (1 - MEMBER_DISCOUNT / 100);
        return base;
    }

    @Override
    public String getDiscountLabel() {
        if (!isHasDiscount()) return "Tidak ada diskon produk";
        return String.format("Diskon %.0f%% (Harga asli: Rp %,.0f)", getDiscountPercent(), getPrice());
    }

    @Override
    public String toSummaryString() {
        return String.format("%-10s | %-30s | Rp %,10.0f", getId(), getName(), getFinalPrice());
    }

    @Override
    public String toDetailString() {
        return String.format(
                "  ID         : %s%n  Nama       : %s%n  Kategori   : %s%n  Jenis      : %s%n" +
                        "  Harga      : Rp %,.0f%s%n  Stok       : %d (%s)%n  Ukuran     : %s%n  Diskon     : %s",
                getId(), getName(), getCategory(), jenisFootwear.getLabel(),
                getFinalPrice(), isHasDiscount() ? String.format(" (diskon %.0f%%)", getDiscountPercent()) : "",
                getStock(), getStatusStok(), getSize(), getDiscountLabel());
    }

    public JenisFootwear getJenisFootwear()             { return jenisFootwear; }
    public void setJenisFootwear(JenisFootwear jenis)   { this.jenisFootwear = jenis; }
}