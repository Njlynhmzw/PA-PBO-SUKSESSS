package models;

public class GiftAccessory extends Product implements Discountable, Displayable {

    public enum JenisGift {
        KEYCHAIN("Keychain"), MUG("Mug"), PHONE_CASE("Phone Case"),
        LANYARD("Lanyard"), STICKER_PACK("Sticker Pack"),
        MODEL_CAR("Model Car"), BACKPACK("Backpack"), WALLET("Wallet");
        private final String label;
        JenisGift(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private JenisGift jenisGift;

    public GiftAccessory(String name, double price, int stock, String size,
                         boolean hasDiscount, double discountPercent, JenisGift jenis) {
        super(name, price, stock, size, hasDiscount, discountPercent);
        this.jenisGift = jenis;
    }

    @Override public String getCategory()   { return "Gift & Accessories"; }
    @Override public String getJenis()      { return jenisGift.getLabel(); }
    @Override public String getDetailInfo() { return "Jenis: " + jenisGift.getLabel(); }

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
                        "  Harga      : Rp %,.0f%s%n  Stok       : %d (%s)%n  Varian     : %s%n  Diskon     : %s",
                getId(), getName(), getCategory(), jenisGift.getLabel(),
                getFinalPrice(), isHasDiscount() ? String.format(" (diskon %.0f%%)", getDiscountPercent()) : "",
                getStock(), getStatusStok(), getSize(), getDiscountLabel());
    }

    public JenisGift getJenisGift()           { return jenisGift; }
    public void setJenisGift(JenisGift jenis) { this.jenisGift = jenis; }
}