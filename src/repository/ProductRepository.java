package repository;

import models.Product;

import java.util.*;

/**
 * LAYER REPOSITORY — Penyimpanan data Produk menggunakan ArrayList & HashMap.
 *
 * Tanggung jawab: CRUD data mentah ke/dari penyimpanan (in-memory ArrayList).
 * Layer ini TIDAK berisi logika bisnis.
 *
 * Penyimpanan:
 *   - productMap  (HashMap)   → akses O(1) by ID
 *   - insertOrder (LinkedList) → menjaga urutan insert
 */
public class ProductRepository {

    private final Map<String, Product> productMap;
    private final List<String>         insertOrder;

    public ProductRepository() {
        this.productMap  = new HashMap<>();
        this.insertOrder = new LinkedList<>();
    }

    /** Simpan produk baru, atau update jika ID sudah ada */
    public void save(Product product) {
        if (!productMap.containsKey(product.getId())) {
            insertOrder.add(product.getId());
        }
        productMap.put(product.getId(), product);
    }

    /** Cari produk berdasarkan ID */
    public Optional<Product> findById(String id) {
        return Optional.ofNullable(productMap.get(id));
    }

    /** Ambil semua produk sesuai urutan insert */
    public List<Product> findAll() {
        List<Product> result = new ArrayList<>();
        for (String id : insertOrder) {
            if (productMap.containsKey(id)) result.add(productMap.get(id));
        }
        return result;
    }

    /** Cari produk berdasarkan kategori (case-insensitive) */
    public List<Product> findByCategory(String category) {
        List<Product> result = new ArrayList<>();
        for (Product p : findAll()) {
            if (p.getCategory().equalsIgnoreCase(category)) result.add(p);
        }
        return result;
    }

    /** Hapus produk berdasarkan ID, kembalikan true jika berhasil */
    public boolean delete(String id) {
        if (productMap.containsKey(id)) {
            productMap.remove(id);
            insertOrder.remove(id);
            return true;
        }
        return false;
    }

    public boolean existsById(String id)  { return productMap.containsKey(id); }
    public int     count()                { return productMap.size(); }
    public boolean isEmpty()              { return productMap.isEmpty(); }
    public Set<String> getAllIds()        { return productMap.keySet(); }
}