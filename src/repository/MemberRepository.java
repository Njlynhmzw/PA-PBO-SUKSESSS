package repository;

import models.Member;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * LAYER REPOSITORY — Penyimpanan data Member menggunakan ArrayList.
 *
 * Tanggung jawab: CRUD data mentah Member ke/dari penyimpanan in-memory.
 * Layer ini TIDAK berisi logika bisnis.
 */
public class MemberRepository {

    // ── Penyimpanan in-memory (ArrayList) ───────────────────────────
    private final List<Member> members;

    public MemberRepository() {
        this.members = new ArrayList<>();
    }

    /** Simpan member baru ke ArrayList */
    public void save(Member member) {
        members.add(member);
    }

    /** Ambil semua member */
    public List<Member> findAll() {
        return members;
    }

    /** Cari member berdasarkan nomor telepon */
    public Optional<Member> findByPhone(String phone) {
        for (Member m : members) {
            if (m.getPhone().equals(phone)) return Optional.of(m);
        }
        return Optional.empty();
    }

    /** Cari member berdasarkan ID */
    public Optional<Member> findById(String memberId) {
        for (Member m : members) {
            if (m.getMemberId().equals(memberId)) return Optional.of(m);
        }
        return Optional.empty();
    }

    /** Hapus member berdasarkan ID */
    public boolean delete(String memberId) {
        return members.removeIf(m -> m.getMemberId().equals(memberId));
    }

    /** Cek apakah nomor telepon sudah terdaftar */
    public boolean existsByPhone(String phone) {
        return members.stream().anyMatch(m -> m.getPhone().equals(phone));
    }

    public int     count()   { return members.size(); }
    public boolean isEmpty() { return members.isEmpty(); }
}