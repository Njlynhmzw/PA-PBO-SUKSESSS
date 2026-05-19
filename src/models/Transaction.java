package models;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Model Transaction — agregasi dari Member dan daftar TransactionItem.
 * Menerapkan konsep: Agregasi, Encapsulation
 */
public class Transaction {

    private String            transactionId;
    private LocalDateTime     dateTime;
    private Member            member;              // boleh null (non-member)
    private List<TransactionItem> items;
    private double            totalBeforeDiscount;
    private double            totalAfterDiscount;
    private double            totalSavings;

    private static int txCounter = 1;

    public Transaction() {
        this.transactionId       = String.format("TRX-%06d", txCounter++);
        this.dateTime            = LocalDateTime.now();
        this.items               = new ArrayList<>();
        this.totalBeforeDiscount = 0;
        this.totalAfterDiscount  = 0;
        this.totalSavings        = 0;
    }

    public Transaction(Member member) {
        this();
        this.member = member;
    }

    public void addItem(TransactionItem item) {
        items.add(item);
        recalculate();
    }

    private void recalculate() {
        totalBeforeDiscount = 0;
        totalAfterDiscount  = 0;
        totalSavings        = 0;
        for (TransactionItem item : items) {
            totalBeforeDiscount += item.getPriceAtTime() * item.getQty();
            totalAfterDiscount  += item.getSubtotal();
            totalSavings        += item.getSavings();
        }
    }

    public String getMemberTier() {
        if (member == null) return "NONE";
        return member.getTier().name();
    }

    // ── Getters ────────────────────────────────────────────────────
    public String               getTransactionId()       { return transactionId; }
    public LocalDateTime        getDateTime()            { return dateTime; }
    public Member               getMember()              { return member; }
    public List<TransactionItem> getItems()              { return items; }
    public double               getTotalBeforeDiscount() { return totalBeforeDiscount; }
    public double               getTotalAfterDiscount()  { return totalAfterDiscount; }
    public double               getTotalSavings()        { return totalSavings; }

    public String getFormattedDate() {
        return dateTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));
    }

    public static void resetCounter() { txCounter = 1; }
}