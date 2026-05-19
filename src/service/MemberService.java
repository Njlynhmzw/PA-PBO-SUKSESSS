package service;

import models.Member;
import repository.MemberRepository;

import java.util.List;
import java.util.Optional;

/**
 * MemberService — versi MySQL.
 *
 * ✅ PERBAIKAN:
 *   1. daftarMember() → pakai memberRepository.createNew() agar ID
 *      di-generate dari tabel counters MySQL dan langsung INSERT ke DB.
 *   2. updateMember() → pakai memberRepository.update() agar perubahan
 *      benar-benar di-UPDATE ke MySQL.
 *   3. catatTransaksi() → setelah update total belanja, langsung
 *      persist ke database via memberRepository.update().
 */
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // ── CREATE ──────────────────────────────────────────────────────
    public Member daftarMember(String nama, String phone, String email, String tierStr) {
        if (memberRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Nomor telepon " + phone + " sudah terdaftar!");
        }
        Member.Tier tier = tierStr.equalsIgnoreCase("PLUS")
                ? Member.Tier.PLUS : Member.Tier.REGULAR;

        // ✅ FIX: createNew() = generate ID dari counters MySQL + INSERT ke DB
        return memberRepository.createNew(nama, phone, email, tier);
    }

    // ── READ ────────────────────────────────────────────────────────
    public List<Member>     semuaMember()              { return memberRepository.findAll(); }
    public Optional<Member> cariByPhone(String phone)  { return memberRepository.findByPhone(phone); }
    public Optional<Member> cariById(String memberId)  { return memberRepository.findById(memberId); }
    public boolean          isEmpty()                  { return memberRepository.isEmpty(); }

    // ── UPDATE ──────────────────────────────────────────────────────
    public boolean updateMember(String id, String nama, String phone, String email) {
        Optional<Member> opt = memberRepository.findById(id);
        if (opt.isEmpty()) return false;
        Member m = opt.get();
        m.setName(nama);
        m.setPhone(phone);
        m.setEmail(email);
        memberRepository.update(m);    // ✅ FIX: persist ke MySQL
        return true;
    }

    // ── DELETE ──────────────────────────────────────────────────────
    public boolean hapusMember(String id) {
        return memberRepository.delete(id);
    }

    // ── BUSINESS LOGIC ──────────────────────────────────────────────
    /**
     * ✅ FIX: Setelah tambahTransaksi() update total di object,
     *    langsung persist ke MySQL agar tidak hilang saat restart.
     */
    public void catatTransaksi(Member member, double total) {
        member.tambahTransaksi(total);       // update total + cek upgrade tier
        memberRepository.update(member);     // ✅ persist ke MySQL
    }
}