package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import models.Product;
import service.ProductService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * ProductHandler — menangani semua request ke /api/products
 *
 * GET    /api/products          → list semua produk
 * GET    /api/products/{id}     → detail satu produk
 * POST   /api/products          → tambah produk baru
 * PUT    /api/products/{id}     → update produk
 * DELETE /api/products/{id}     → hapus produk
 */
public class ProductHandler implements HttpHandler {

    private static final String PREFIX = "/api/products";
    private final ProductService productService;

    public ProductHandler(ProductService productService) {
        this.productService = productService;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        ApiServer.addCorsHeaders(ex);
        if (ApiServer.handlePreflight(ex)) return;

        String method = ex.getRequestMethod().toUpperCase();
        String id     = ApiServer.extractId(ex, PREFIX);

        try {
            switch (method) {
                case "GET"    -> handleGet(ex, id);
                case "POST"   -> handlePost(ex);
                case "PUT"    -> handlePut(ex, id);
                case "DELETE" -> handleDelete(ex, id);
                default       -> ApiServer.sendResponse(ex, 405, "{\"error\":\"Method not allowed\"}");
            }
        } catch (Exception e) {
            ApiServer.sendResponse(ex, 500, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    // ── GET ──────────────────────────────────────────────────────────

    private void handleGet(HttpExchange ex, String id) throws IOException {
        if (id == null) {
            // GET /api/products → semua produk
            List<Product> list = productService.semuaProduk();
            ApiServer.sendResponse(ex, 200, productsToJson(list));
        } else {
            // GET /api/products/{id}
            Optional<Product> opt = productService.cariById(id);
            if (opt.isPresent()) {
                ApiServer.sendResponse(ex, 200, productToJson(opt.get()));
            } else {
                ApiServer.sendResponse(ex, 404, "{\"error\":\"Produk tidak ditemukan\"}");
            }
        }
    }

    // ── POST ─────────────────────────────────────────────────────────

    private void handlePost(HttpExchange ex) throws IOException {
        String body = ApiServer.readBody(ex);
        try {
            // Parse JSON manual (tanpa library eksternal)
            String nama            = JsonParser.getString(body, "name");
            double harga           = JsonParser.getDouble(body, "price");
            int    stok            = JsonParser.getInt(body, "stock");
            String size            = JsonParser.getString(body, "size");
            String kategori        = JsonParser.getString(body, "category");
            String jenis           = JsonParser.getString(body, "jenis");
            boolean hasDiscount    = JsonParser.getBoolean(body, "hasDiscount");
            double discountPercent = JsonParser.getDouble(body, "discountPercent");

            // Konversi jenis (string label) ke index enum
            int jenisIndex = resolveJenisIndex(kategori, jenis);
            Product p = productService.tambahProduk(
                    nama, harga, stok, size, hasDiscount, discountPercent, kategori, jenisIndex
            );
            ApiServer.sendResponse(ex, 201, productToJson(p));
        } catch (Exception e) {
            ApiServer.sendResponse(ex, 400, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    // ── PUT ──────────────────────────────────────────────────────────

    private void handlePut(HttpExchange ex, String id) throws IOException {
        if (id == null) { ApiServer.sendResponse(ex, 400, "{\"error\":\"ID diperlukan\"}"); return; }
        String body = ApiServer.readBody(ex);
        try {
            String nama   = JsonParser.getString(body, "name");
            double harga  = JsonParser.getDouble(body, "price");
            int    stok   = JsonParser.getInt(body, "stock");
            boolean ok    = productService.updateLengkap(id, nama, harga, stok);
            if (ok) {
                ApiServer.sendResponse(ex, 200, "{\"message\":\"Produk diupdate\"}");
            } else {
                ApiServer.sendResponse(ex, 404, "{\"error\":\"Produk tidak ditemukan\"}");
            }
        } catch (Exception e) {
            ApiServer.sendResponse(ex, 400, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    // ── DELETE ───────────────────────────────────────────────────────

    private void handleDelete(HttpExchange ex, String id) throws IOException {
        if (id == null) { ApiServer.sendResponse(ex, 400, "{\"error\":\"ID diperlukan\"}"); return; }
        boolean ok = productService.hapusProduk(id);
        if (ok) {
            ApiServer.sendResponse(ex, 200, "{\"message\":\"Produk dihapus\"}");
        } else {
            ApiServer.sendResponse(ex, 404, "{\"error\":\"Produk tidak ditemukan\"}");
        }
    }

    // ── Serialisasi JSON manual ───────────────────────────────────────

    private String productsToJson(List<Product> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(productToJson(list.get(i)));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    static String productToJson(Product p) {
        return String.format("""
            {
              "id": "%s",
              "name": "%s",
              "price": %.0f,
              "finalPrice": %.0f,
              "stock": %d,
              "size": "%s",
              "category": "%s",
              "jenis": "%s",
              "hasDiscount": %b,
              "discountPercent": %.0f,
              "statusStok": "%s"
            }""",
                p.getId(),
                escapeJson(p.getName()),
                p.getPrice(),
                p.getFinalPrice(),
                p.getStock(),
                escapeJson(p.getSize()),
                escapeJson(p.getCategory()),
                escapeJson(p.getJenis()),
                p.isHasDiscount(),
                p.getDiscountPercent(),
                p.getStatusStok()
        );
    }

    // ── Helper: cari index enum berdasarkan label ────────────────────

    private int resolveJenisIndex(String kategori, String jenisLabel) {
        String[][] JENIS_MAP = {
                {"Polo Shirt","Crew Neck","V-Neck","Oversized","Racing Tee"},
                {"Snapback Cap","Fitted Cap","Bucket Hat","Beanie","Visor"},
                {"Jacket","Hoodie","Windbreaker","Rain Jacket","Varsity Jacket"},
                {"Sneakers","Sandals","Boots","Slip-On","Racing Shoes"},
                {"Keychain","Mug","Phone Case","Lanyard","Sticker Pack","Model Car","Backpack","Wallet"}
        };
        String[] KATEGORI_LIST = {"T-Shirts","Headwear","Outerwear","Footwear","Gift & Accessories"};

        int katIdx = -1;
        for (int i = 0; i < KATEGORI_LIST.length; i++) {
            if (KATEGORI_LIST[i].equalsIgnoreCase(kategori)) { katIdx = i; break; }
        }
        if (katIdx == -1) throw new IllegalArgumentException("Kategori tidak valid: " + kategori);

        for (int j = 0; j < JENIS_MAP[katIdx].length; j++) {
            if (JENIS_MAP[katIdx][j].equalsIgnoreCase(jenisLabel)) return j;
        }
        throw new IllegalArgumentException("Jenis tidak valid: " + jenisLabel);
    }

    static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r");
    }
}