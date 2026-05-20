package service;

import models.Member;
import repository.MemberRepository;

import java.util.List;
import java.util.Optional;


public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public Member daftarMember(String nama, String phone, String email, String tierStr) {
        if (memberRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Nomor telepon " + phone + " sudah terdaftar!");
        }
        Member.Tier tier = tierStr.equalsIgnoreCase("PLUS")
                ? Member.Tier.PLUS : Member.Tier.REGULAR;

        return memberRepository.createNew(nama, phone, email, tier);
    }

    public List<Member>     semuaMember()              { return memberRepository.findAll(); }
    public Optional<Member> cariByPhone(String phone)  { return memberRepository.findByPhone(phone); }
    public Optional<Member> cariById(String memberId)  { return memberRepository.findById(memberId); }
    public boolean          isEmpty()                  { return memberRepository.isEmpty(); }

    public boolean updateMember(String id, String nama, String phone, String email) {
        Optional<Member> opt = memberRepository.findById(id);
        if (opt.isEmpty()) return false;
        Member m = opt.get();
        m.setName(nama);
        m.setPhone(phone);
        m.setEmail(email);
        memberRepository.update(m);
        return true;
    }

    public boolean hapusMember(String id) {
        return memberRepository.delete(id);
    }


    public void catatTransaksi(Member member, double total) {
        member.tambahTransaksi(total);
        memberRepository.update(member);
    }
}