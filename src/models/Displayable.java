package models;

/**
 * Interface Displayable — kontrak tampilan produk (summary & detail).
 * Menerapkan konsep: Abstraction (interface)
 */
public interface Displayable {
    String toSummaryString();
    String toDetailString();
}