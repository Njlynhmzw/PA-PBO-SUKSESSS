package models;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Model Transaction — versi MySQL-compatible.
 *
 * ✅ PERBAIKAN:
 *   1. Tambah setTransactionId() agar Repository bisa set ID dari MySQL counter.
 *   2. Tambah setMember() agar Repository bisa set member saat mapRow().
 *   3. Tambah addItemFromDb() untuk load item dari DB tanpa recalculate total
 *      (total sudah tersimpan di DB, tidak perlu dihitung ulang).
 *   4. ID tidak lagi di-generate dari static counter Java — datang dari MySQL.
 */
public class Transaction {

    private String            transactionId;
    private LocalDateTime     dateTime;
    private Member            member;
    private List<TransactionItem> items;
    private double            totalBeforeDiscount;
    private double            totalAfterDiscount;
    private double            totalSavings;

    // ── Constructor default (ID di-set oleh TransactionRepository) ───
    public Transaction() {
        this.transactionId       = null; // di-set oleh Repository
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

    // ── Tambah item saat transaksi berjalan (hitung ulang total) ─────
    public void addItem(TransactionItem item) {
        items.add(item);
        recalculate();
    }

    // ✅ Tambah item dari database (total sudah final, tidak recalculate)
    public void addItemFromDb(TransactionItem item) {
        items.add(item);
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

    // ✅ Set total langsung dari nilai database (dipanggil oleh Repository saat load)
    public void setTotalsFromDb(double before, double savings, double after) {
        this.totalBeforeDiscount = before;
        this.totalSavings        = savings;
        this.totalAfterDiscount  = after;
    }

    // ── Getters & Setters ─────────────────────────────────────────
    public String               getTransactionId()           { return transactionId; }
    public void                 setTransactionId(String id)  { this.transactionId = id; } // ✅
    public LocalDateTime        getDateTime()                { return dateTime; }
    public Member               getMember()                  { return member; }
    public void                 setMember(Member m)          { this.member = m; }          // ✅
    public List<TransactionItem> getItems()                  { return items; }
    public double               getTotalBeforeDiscount()     { return totalBeforeDiscount; }
    public double               getTotalAfterDiscount()      { return totalAfterDiscount; }
    public double               getTotalSavings()            { return totalSavings; }

    public String getFormattedDate() {
        return dateTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));
    }
}