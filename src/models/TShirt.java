package models;

public class TShirt extends Product implements Discountable, Displayable {

    public enum JenisTShirt {
        POLO("Polo Shirt"),
        CREW_NECK("Crew Neck"),
        V_NECK("V-Neck"),
        OVERSIZED("Oversized"),
        RACING("Racing Tee");

        private final String label;
        JenisTShirt(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private JenisTShirt jenisTShirt;

    public TShirt(String name, double price, int stock, String size,
                  boolean hasDiscount, double discountPercent, JenisTShirt jenis) {
        super(name, price, stock, size, hasDiscount, discountPercent);
        this.jenisTShirt = jenis;
    }

    @Override public String getCategory()   { return "T-Shirts"; }
    @Override public String getJenis()      { return jenisTShirt.getLabel(); }
    @Override public String getDetailInfo() { return "Jenis: " + jenisTShirt.getLabel() + " | Size: " + getSize(); }

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
                getId(), getName(), getCategory(), jenisTShirt.getLabel(),
                getFinalPrice(), isHasDiscount() ? String.format(" (diskon %.0f%%)", getDiscountPercent()) : "",
                getStock(), getStatusStok(), getSize(), getDiscountLabel());
    }

    public JenisTShirt getJenisTShirt()              { return jenisTShirt; }
    public void setJenisTShirt(JenisTShirt jenis)    { this.jenisTShirt = jenis; }
}