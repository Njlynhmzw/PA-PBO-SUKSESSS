package models;

public class TransactionItem {

    private Product product;
    private int     qty;
    private double  priceAtTime;
    private double  discountedPrice;

    public TransactionItem(Product product, int qty, String memberTier) {
        this.product      = product;
        this.qty          = qty;
        this.priceAtTime  = product.getFinalPrice();

        if (memberTier != null && !"NONE".equals(memberTier) && product instanceof Discountable) {
            this.discountedPrice = ((Discountable) product).calculateMemberDiscount(memberTier);
        } else {
            this.discountedPrice = priceAtTime;
        }
    }

    public double getSubtotal() { return discountedPrice * qty; }
    public double getSavings()  { return (priceAtTime - discountedPrice) * qty; }

    public Product getProduct()          { return product; }
    public int     getQty()              { return qty; }
    public double  getPriceAtTime()      { return priceAtTime; }
    public double  getDiscountedPrice()  { return discountedPrice; }
}