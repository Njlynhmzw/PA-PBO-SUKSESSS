package util;

import models.Transaction;

public class StrukPrinter {

    public static void cetak(Transaction t) {
        System.out.println("===== STRUK =====");
        System.out.println("ID: " + t.getTransactionId());
        System.out.println("Total: " + t.getTotalAfterDiscount());
    }
}