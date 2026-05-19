package repository;

import models.Transaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * LAYER REPOSITORY — Penyimpanan data Transaksi menggunakan ArrayList.
 *
 * Tanggung jawab: CRUD data mentah Transaksi ke/dari penyimpanan in-memory.
 * Layer ini TIDAK berisi logika bisnis.
 */
public class TransactionRepository {

    // ── Penyimpanan in-memory (ArrayList) ───────────────────────────
    private final List<Transaction> transactions;

    public TransactionRepository() {
        this.transactions = new ArrayList<>();
    }

    /** Simpan transaksi baru ke ArrayList */
    public void save(Transaction transaction) {
        transactions.add(transaction);
    }

    /** Ambil semua transaksi */
    public List<Transaction> findAll() {
        return transactions;
    }

    /** Cari transaksi berdasarkan ID */
    public Optional<Transaction> findById(String transactionId) {
        for (Transaction t : transactions) {
            if (t.getTransactionId().equals(transactionId)) return Optional.of(t);
        }
        return Optional.empty();
    }

    public int     count()   { return transactions.size(); }
    public boolean isEmpty() { return transactions.isEmpty(); }
}