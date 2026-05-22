package db;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class DatabaseConfig {

    private static final Map<String, String> env = loadEnv();

    private static final String URL =
            env.get("DB_URL");

    private static final String USER =
            env.get("DB_USER");

    private static final String PASSWORD =
            env.get("DB_PASSWORD");

    private static Map<String, String> loadEnv() {

        Map<String, String> map = new HashMap<>();

        try (BufferedReader br =
                     new BufferedReader(new FileReader(".env"))) {

            String line;

            while ((line = br.readLine()) != null) {

                line = line.trim();

                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                String[] parts = line.split("=", 2);

                if (parts.length == 2) {

                    map.put(
                            parts[0].trim(),
                            parts[1].trim()
                    );
                }
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Gagal membaca file .env",
                    e
            );
        }

        return map;
    }

    public static Connection getConnection() {

        try {

            return DriverManager.getConnection(
                    URL,
                    USER,
                    PASSWORD
            );

        } catch (SQLException e) {

            throw new RuntimeException(
                    "Gagal koneksi database",
                    e
            );
        }
    }
}