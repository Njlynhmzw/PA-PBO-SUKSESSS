package controller;

import models.Member;
import service.MemberService;
import util.InputHelper;

import java.util.Scanner;

/**
 * LAYER CONTROLLER — Menangani I/O untuk menu Member.
 */
public class MemberController {

    private final MemberService memberService;
    private final Scanner       input;

    public MemberController(MemberService memberService, Scanner input) {
        this.memberService = memberService;
        this.input         = input;
    }

    // ── DAFTAR MEMBER ───────────────────────────────────────────────
    public void daftarMember() {
        System.out.println("\n========== DAFTAR MEMBER BARU ==========");
        System.out.print("Nama     : "); String nama  = input.nextLine();
        System.out.print("Telepon  : "); String phone = input.nextLine();
        System.out.print("Email    : "); String email = input.nextLine();
        System.out.println("Tier     : 1. Regular  2. Plus");
        System.out.print("Pilih tier: ");
        String tier = InputHelper.readInt(input) == 2 ? "PLUS" : "REGULAR";

        try {
            Member m = memberService.daftarMember(nama, phone, email, tier);
            System.out.println("\n✅ Member berhasil didaftarkan!");
            System.out.println("   ID Member : " + m.getMemberId());
        } catch (Exception e) {
            System.out.println("❌ Gagal: " + e.getMessage());
        }
    }

    // ── LIHAT SEMUA MEMBER ──────────────────────────────────────────
    public void lihatMember() {
        if (memberService.isEmpty()) { System.out.println("\nBelum ada member."); return; }
        System.out.println("\n============= DAFTAR MEMBER =============");
        for (Member m : memberService.semuaMember()) {
            System.out.println(m);
            System.out.println("-----------------------------------------");
        }
    }

    // ── UPDATE MEMBER ───────────────────────────────────────────────
    public void updateMember() {
        lihatMember();
        System.out.print("\nMasukkan ID Member: ");
        String id = input.nextLine();
        if (memberService.cariById(id).isEmpty()) { System.out.println("Member tidak ditemukan."); return; }

        System.out.print("Nama baru    : "); String nama  = input.nextLine();
        System.out.print("Telepon baru : "); String phone = input.nextLine();
        System.out.print("Email baru   : "); String email = input.nextLine();

        System.out.println(memberService.updateMember(id, nama, phone, email)
                ? "✅ Member berhasil diupdate!" : "❌ Gagal update member.");
    }

    // ── HAPUS MEMBER ────────────────────────────────────────────────
    public void hapusMember() {
        lihatMember();
        System.out.print("\nMasukkan ID Member: ");
        String id = input.nextLine();
        System.out.println(memberService.hapusMember(id)
                ? "✅ Member berhasil dihapus." : "❌ Member tidak ditemukan.");
    }

    public MemberService getService() { return memberService; }
}