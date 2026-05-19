package models;

public class Outerwear extends Product implements Discountable, Displayable {

    public enum JenisOuterwear {
        JACKET("Jacket"), HOODIE("Hoodie"), WINDBREAKER("Windbreaker"),
        RAIN_JACKET("Rain Jacket"), VARSITY("Varsity Jacket");
        private final String label;
        JenisOuterwear(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private JenisOuterwear jenisOuterwear;

    public Outerwear(String name, double price, int stock, String size,
                     boolean hasDiscount, double discountPercent, JenisOuterwear jenis) {
        super(name, price, stock, size, hasDiscount, discountPercent);
        this.jenisOuterwear = jenis;
    }

    @Override public String getCategory()   { return "Outerwear"; }
    @Override public String getJenis()      { return jenisOuterwear.getLabel(); }
    @Override public String getDetailInfo() { return "Jenis: " + jenisOuterwear.getLabel() + " | Size: " + getSize(); }

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
                        "  Harga      : Rp %,.0f%s%n  Stok       : %d (%s)%n  Size       : %s%n  Diskon     : %s",
                getId(), getName(), getCategory(), jenisOuterwear.getLabel(),
                getFinalPrice(), isHasDiscount() ? String.format(" (diskon %.0f%%)", getDiscountPercent()) : "",
                getStock(), getStatusStok(), getSize(), getDiscountLabel());
    }

    public JenisOuterwear getJenisOuterwear()             { return jenisOuterwear; }
    public void setJenisOuterwear(JenisOuterwear jenis)   { this.jenisOuterwear = jenis; }
}