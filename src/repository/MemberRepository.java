package repository;

import db.DatabaseConfig;
import models.Member;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MemberRepository {

    private Connection conn() { return DatabaseConfig.getConnection(); }

    private String generateId() {
        try {
            conn().setAutoCommit(false);
            conn().prepareStatement(
                    "UPDATE counters SET value = value + 1 WHERE name = 'member'"
            ).executeUpdate();

            ResultSet rs = conn().prepareStatement(
                    "SELECT value FROM counters WHERE name = 'member'"
            ).executeQuery();
            rs.next();
            int num = rs.getInt(1);
            conn().commit();
            conn().setAutoCommit(true);
            return String.format("MEM-%04d", num);
        } catch (SQLException e) {
            try { conn().rollback(); conn().setAutoCommit(true); } catch (SQLException ignored) {}
            throw new RuntimeException("Gagal generate member ID", e);
        }
    }

    public void save(Member member) {
        if (member.getMemberId() == null || member.getMemberId().isBlank()) {
            member.setMemberId(generateId());
        }

        String sql = """
            INSERT INTO members
                (id, name, phone, email, tier, total_transaksi, total_belanja)
            VALUES (?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE
                name=VALUES(name), phone=VALUES(phone), email=VALUES(email),
                tier=VALUES(tier), total_transaksi=VALUES(total_transaksi),
                total_belanja=VALUES(total_belanja)
            """;
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, member.getMemberId());
            ps.setString(2, member.getName());
            ps.setString(3, member.getPhone());
            ps.setString(4, member.getEmail());
            ps.setString(5, member.getTier().name());
            ps.setInt   (6, member.getTotalTransaksi());
            ps.setDouble(7, member.getTotalBelanja());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Gagal menyimpan member: " + e.getMessage(), e);
        }
    }

    public void update(Member member) {
        String sql = """
            UPDATE members
            SET name             = ?,
                phone            = ?,
                email            = ?,
                tier             = ?,
                total_transaksi  = ?,
                total_belanja    = ?
            WHERE id = ?
            """;
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, member.getName());
            ps.setString(2, member.getPhone());
            ps.setString(3, member.getEmail());
            ps.setString(4, member.getTier().name());
            ps.setInt   (5, member.getTotalTransaksi());
            ps.setDouble(6, member.getTotalBelanja());
            ps.setString(7, member.getMemberId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Gagal mengupdate member: " + e.getMessage(), e);
        }
    }

    public Member createNew(String nama, String phone, String email, Member.Tier tier) {
        String newId = generateId();
        Member m = new Member(newId, nama, phone, email, tier, 0, 0.0);
        save(m);
        return m;
    }

    public List<Member> findAll() {
        String sql = "SELECT * FROM members ORDER BY created_at ASC";
        List<Member> result = new ArrayList<>();
        try (Statement st = conn().createStatement();
             ResultSet rs  = st.executeQuery(sql)) {
            while (rs.next()) result.add(mapRow(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Gagal mengambil member: " + e.getMessage(), e);
        }
        return result;
    }

    public Optional<Member> findByPhone(String phone) {
        String sql = "SELECT * FROM members WHERE phone = ?";
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, phone);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return Optional.of(mapRow(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Gagal mencari member by phone: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public Optional<Member> findById(String memberId) {
        String sql = "SELECT * FROM members WHERE id = ?";
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, memberId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return Optional.of(mapRow(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Gagal mencari member by ID: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public boolean delete(String memberId) {
        String sql = "DELETE FROM members WHERE id = ?";
        try (PreparedStatement ps = conn().prepareStatement(sql)) {
            ps.setString(1, memberId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Gagal menghapus member: " + e.getMessage(), e);
        }
    }

    public boolean existsByPhone(String phone) { return findByPhone(phone).isPresent(); }

    public int count() {
        try (ResultSet rs = conn().createStatement()
                .executeQuery("SELECT COUNT(*) FROM members")) {
            rs.next(); return rs.getInt(1);
        } catch (SQLException e) { return 0; }
    }

    public boolean isEmpty() { return count() == 0; }

    private Member mapRow(ResultSet rs) throws SQLException {
        String id     = rs.getString("id");
        String name   = rs.getString("name");
        String phone  = rs.getString("phone");
        String email  = rs.getString("email");
        Member.Tier tier = Member.Tier.valueOf(rs.getString("tier"));
        int    totalTrx  = rs.getInt("total_transaksi");
        double totalBel  = rs.getDouble("total_belanja");

        return new Member(id, name, phone, email, tier, totalTrx, totalBel);
    }
}