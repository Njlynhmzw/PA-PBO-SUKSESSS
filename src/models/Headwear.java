package models;

public class Headwear extends Product implements Discountable, Displayable {

    public enum JenisHeadwear {
        SNAPBACK("Snapback Cap"), FITTED_CAP("Fitted Cap"),
        BUCKET_HAT("Bucket Hat"), BEANIE("Beanie"), VISOR("Visor");
        private final String label;
        JenisHeadwear(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private JenisHeadwear jenisHeadwear;

    public Headwear(String name, double price, int stock, String size,
                    boolean hasDiscount, double discountPercent, JenisHeadwear jenis) {
        super(name, price, stock, size, hasDiscount, discountPercent);
        this.jenisHeadwear = jenis;
    }

    @Override public String getCategory()   { return "Headwear"; }
    @Override public String getJenis()      { return jenisHeadwear.getLabel(); }
    @Override public String getDetailInfo() { return "Jenis: " + jenisHeadwear.getLabel() + " | Size: " + getSize(); }

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
                getId(), getName(), getCategory(), jenisHeadwear.getLabel(),
                getFinalPrice(), isHasDiscount() ? String.format(" (diskon %.0f%%)", getDiscountPercent()) : "",
                getStock(), getStatusStok(), getSize(), getDiscountLabel());
    }

    public JenisHeadwear getJenisHeadwear()             { return jenisHeadwear; }
    public void setJenisHeadwear(JenisHeadwear jenis)   { this.jenisHeadwear = jenis; }
}