package db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DatabaseConfig — Singleton koneksi ke MySQL.
 * Taruh di package baru: db/
 *
 * Dependency yang perlu ditambah di IntelliJ:
 *   File → Project Structure → Libraries → + → From Maven
 *   → mysql:mysql-connector-java:8.0.33
 */
public class DatabaseConfig {

    // ── Sesuaikan dengan Laragon kalian ─────────────────────────
    private static final String URL      = "jdbc:mysql://localhost:3306/mclaren_db"
            + "?useSSL=false&allowPublicKeyRetrieval=true"
            + "&serverTimezone=Asia/Makassar";
    private static final String USER     = "root";
    private static final String PASSWORD = "";   // Laragon default: kosong

    private static Connection connection;

    /** Ambil koneksi (buat baru jika belum ada / sudah tertutup) */
    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("✅ Database terhubung: mclaren_db");
            }
        } catch (SQLException e) {
            System.err.println("❌ Gagal konek ke database: " + e.getMessage());
            throw new RuntimeException("Database connection failed", e);
        }
        return connection;
    }

    /** Tutup koneksi saat aplikasi berhenti */
    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("Database connection closed.");
            }
        } catch (SQLException e) {
            System.err.println("Error closing connection: " + e.getMessage());
        }
    }
}