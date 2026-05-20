package repository;

import db.DatabaseConfig;
import models.*;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


public class TransactionRepository {

    private Connection conn() { return DatabaseConfig.getConnection(); }

    private String generateId() {
        try {
            conn().setAutoCommit(false);
            conn().prepareStatement(
                    "UPDATE counters SET value = value + 1 WHERE name = 'transaction'"
            ).executeUpdate();

            ResultSet rs = conn().prepareStatement(
                    "SELECT value FROM counters WHERE name = 'transaction'"
            ).executeQuery();
            rs.next();
            int num = rs.getInt(1);
            conn().commit();
            conn().setAutoCommit(true);
            return String.format("TRX-%06d", num);
        } catch (SQLException e) {
            try { conn().rollback(); conn().setAutoCommit(true); } catch (SQLException ignored) {}
            throw new RuntimeException("Gagal generate transaction ID", e);
        }
    }

    public void save(Transaction transaction) {
        if (transaction.getTransactionId() == null || transaction.getTransactionId().isBlank()) {
            transaction.setTransactionId(generateId());
        }

        String sqlTrx = """
            INSERT INTO transactions
                (id, member_id, subtotal, member_discount, total)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE id = id
            """;
        try (PreparedStatement ps = conn().prepareStatement(sqlTrx)) {
            ps.setString(1, transaction.getTransactionId());
            ps.setString(2, transaction.getMember() != null
                    ? transaction.getMember().getMemberId() : null);
            ps.setDouble(3, transaction.getTotalBeforeDiscount());
            ps.setDouble(4, transaction.getTotalSavings());
            ps.setDouble(5, transaction.getTotalAfterDiscount());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Gagal menyimpan transaksi: " + e.getMessage(), e);
        }

        String sqlItem = """
            INSERT INTO transaction_items
                (transaction_id, product_id, product_name, qty, price_per_item, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        try (PreparedStatement ps = conn().prepareStatement(sqlItem)) {
            for (TransactionItem item : transaction.getItems()) {
                ps.setString(1, transaction.getTransactionId());
                ps.setString(2, item.getProduct().getId());
                ps.setString(3, item.getProduct().getName());
                ps.setInt   (4, item.getQty());
                ps.setDouble(5, item.getDiscountedPrice());
                ps.setDouble(6, item.getSubtotal());
                ps.addBatch();
            }
            ps.executeBatch();
        } catch (SQLException e) {
            throw new RuntimeException("Gagal menyimpan item transaksi: " + e.getMessage(), e);
        }
    }

    public List<Transaction> findAll() {
        String sql = "SELECT * FROM transactions ORDER BY created_at DESC";
        List<Transaction> result = new ArrayList<>();
        try (Statement st = conn().createStatement();
             ResultSet rs  = st.executeQuery(sql)) {
            while (rs.next()) {
                Transaction t = mapRow(rs);
                loadItems(t);
                result.add(t);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Gagal mengambil transaksi: " + e.getMessage(), e);
        }
        return result;
    }

    public Optional<Transaction> findById(String transactionId) {
        String sql = "SELECT * FROM transactions WHERE id = ?";
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, transactionId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Transaction t = mapRow(rs);
                loadItems(t);
                return Optional.of(t);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Gagal mencari transaksi: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public int     count()   {
        try (ResultSet rs = conn().createStatement()
                .executeQuery("SELECT COUNT(*) FROM transactions")) {
            rs.next(); return rs.getInt(1);
        } catch (SQLException e) { return 0; }
    }
    public boolean isEmpty() { return count() == 0; }

    private Transaction mapRow(ResultSet rs) throws SQLException {
        String trxId    = rs.getString("id");
        String memberId = rs.getString("member_id");
        double subtotal = rs.getDouble("subtotal");         // total sebelum diskon
        double discount = rs.getDouble("member_discount");  // total hemat
        double total    = rs.getDouble("total");            // total bayar

        Transaction t = new Transaction();
        t.setTransactionId(trxId);

        t.setTotalsFromDb(subtotal, discount, total);

        if (memberId != null) {
            MemberRepository memberRepo = new MemberRepository();
            memberRepo.findById(memberId).ifPresent(t::setMember);
        }
        return t;
    }

    private void loadItems(Transaction t) {
        String sql = """
            SELECT ti.*, p.category, p.jenis, p.has_discount, p.discount_percent,
                   p.price, p.stock, p.size
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
            WHERE ti.transaction_id = ?
            ORDER BY ti.id ASC
            """;
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, t.getTransactionId());
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ProductRepository productRepo = new ProductRepository();
                Optional<Product> optProd = productRepo.findById(rs.getString("product_id"));

                if (optProd.isPresent()) {
                    int     qty           = rs.getInt("qty");
                    double  pricePerItem  = rs.getDouble("price_per_item");

                    TransactionItem item = new TransactionItem(
                            optProd.get(), qty, "NONE"
                    );
                    t.addItemFromDb(item);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Gagal memuat item transaksi: " + e.getMessage(), e);
        }
    }
}