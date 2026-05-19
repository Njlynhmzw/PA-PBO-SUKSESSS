package service;

import models.Member;
import repository.MemberRepository;

import java.util.List;
import java.util.Optional;

/**
 * LAYER SERVICE — Logika bisnis untuk manajemen Member.
 *
 * Tanggung jawab:
 *   - Validasi duplikasi nomor telepon
 *   - Logika upgrade tier otomatis
 *   - Koordinasi operasi CRUD via Repository
 */
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // ── CREATE ──────────────────────────────────────────────────────
    /** Daftarkan member baru; lempar exception jika nomor sudah ada */
    public Member daftarMember(String nama, String phone, String email, String tierStr) {
        if (memberRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Nomor telepon " + phone + " sudah terdaftar!");
        }
        Member.Tier tier = tierStr.equalsIgnoreCase("PLUS") ? Member.Tier.PLUS : Member.Tier.REGULAR;
        Member member = new Member(nama, phone, email, tier);
        memberRepository.save(member);
        return member;
    }

    // ── READ ────────────────────────────────────────────────────────
    public List<Member>     semuaMember()                 { return memberRepository.findAll(); }
    public Optional<Member> cariByPhone(String phone)     { return memberRepository.findByPhone(phone); }
    public Optional<Member> cariById(String memberId)     { return memberRepository.findById(memberId); }
    public boolean          isEmpty()                     { return memberRepository.isEmpty(); }

    // ── UPDATE ──────────────────────────────────────────────────────
    public boolean updateMember(String id, String nama, String phone, String email) {
        Optional<Member> opt = memberRepository.findById(id);
        opt.ifPresent(m -> { m.setName(nama); m.setPhone(phone); m.setEmail(email); });
        return opt.isPresent();
    }

    // ── DELETE ──────────────────────────────────────────────────────
    public boolean hapusMember(String id) {
        return memberRepository.delete(id);
    }

    // ── BUSINESS LOGIC ──────────────────────────────────────────────
    /** Catat transaksi ke member (update total & cek upgrade tier) */
    public void catatTransaksi(Member member, double total) {
        member.tambahTransaksi(total); // logika upgrade ada di model Member
    }
}