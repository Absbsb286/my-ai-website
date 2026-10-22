<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Panduan untuk AI Coding Agent

File ini adalah panduan universal untuk AI agent yang bekerja di
project ini. Baca file ini SEBELUM melakukan task apapun.

## Tentang Project
- Nama: my-ai-website
- Jenis: Game multiplayer "Blobby Jelly" + landing page
- Framework: Next.js 16 (App Router) + static HTML di public/
- Hosting: Vercel (production dari branch main)
- Repo: https://github.com/Absbsb286/my-ai-website

## File Utama
- public/bloby.html — file game utama (4.043 baris, HTML+JS)
- public/game/characters.js — data 11 karakter, bentuk prosedural, aksesori, idle, blink
- public/game/character-fx.js — trail fase 2 + burst per karakter
- src/app/page.tsx — hanya redirect ke /bloby.html
- src/app/layout.tsx — metadata (sudah benar; title/OG memakai em dash)
- auto-push.js — script auto-commit & push (pantau src/ dan public/)
- .clinerules/project-rules.md — aturan detail untuk Cline

## Cara Kerja
1. Game multiplayer P2P pakai Trystero (WebRTC)
2. Signaling via EMQX Serverless MQTT (WebSocket port 8084)
3. TURN server: evan-brass.net (untuk WiFi ketat seperti kampus)
4. State sync 30Hz, interpolasi 100ms delay

## Profil Pemain
- Nama 2–10 karakter, tanpa emoji; 6 pilihan warna teks nama.
- Diubah lewat chip nama + ikon pensil di menu utama; tidak bisa saat race.
- Disimpan di `localStorage['blobby_name']` dan `localStorage['blobby_name_color']`.
- `nameColor` ikut `hello`/`roster`/`state`/ranking; warna dari peer dinormalisasi.
- Nama duplikat diizinkan; penanda `(kamu)` ada di daftar waiting dan hasil.

## Sistem Karakter
- 11 karakter: classic, ninja, mochi, astro, pudi, chef, taro, detektif, sprout, nori, nova.
- Data/render di `public/game/characters.js`; FX trail di `public/game/character-fx.js`.
- Picker dibuka dari tombol Karakter di menu atau chip "Karakter · <nama>" di waiting lobby.
- Harga: ninja 500, mochi 800, astro 1000, pudi 1200, chef 1500, taro 1800, detektif 2000, sprout 2400, nori 2800, nova 3200.
- localStorage: `blobby_coins`, `blobby_skins`, `blobby_skin`. Field jaringan tetap `skin`.
- Trail bisa dimatikan di Settings; reduced-motion otomatis mematikan trail.
- Mata karakter mengikuti platform pendaratan terdekat (lokal + remote).
- Powered mode tetap memakai armor Iron Man.

## Konvensi Kode
- Tailwind CSS untuk styling
- File .tsx untuk React, vanilla JS untuk game
- Game pakai IIFE (bukan ES module)
- Komentar dalam Bahasa Indonesia

## Larangan
- JANGAN push API key ke GitHub
- JANGAN ubah kredensial broker/TURN tanpa konfirmasi
- JANGAN ubah node_modules/
- JANGAN commit file .tmp-* atau file test temporary
- JANGAN hapus .gitignore

## Prioritas Perbaikan (dari analisis)
1. ✅ Pindahkan kredensial MQTT/TURN ke server (proxy Next.js) — SELESAI
2. ✅ Bug fungsional utama (koneksi, akhir race, hasil, host migration) — SELESAI 21 Okt 2026
   - Sisa catatan kecil: drift platform bergerak antar-client, aturan
     BONUS_LAST_STANDING, dan verifikasi nama guest-guest.
3. Anti-cheat minimal (prioritas berikutnya)
4. Migrasi game ke route Next.js (/game) — jangka panjang
5. Terakhir/opsional: TURN berbayar (Twilio, dsb.)
   - JANGAN pakai layanan berbayar untuk project ini.
   - Kalau butuh TURN tambahan, pakai yang gratis (OpenRelay/Metered)
     atau coturn self-host di VM gratis.

## Kontak Konteks
- Untuk konteks lengkap, baca .clinerules/project-rules.md
- Untuk sejarah keputusan, baca section "Sejarah & Konteks" di file itu

## Testing
- Status 21 Okt 2026: alur room/race/hasil/replay/host migration lolos di 2 tab lokal + production
- Karakter 21 Okt 2026: picker desktop + 360px mobile, 11 karakter + teaser,
  beli/pilih Mochi, avatar menu/profil/waiting/hasil, sinkron skin 2 tab,
  mulai race saat guest di picker, trail Mochi/Nova di race — lolos.
- Build 21 Okt 2026: `npm run build` lolos; ESLint hanya warning font lama di layout.
- Profil 21 Okt 2026: desktop + viewport mobile, batas 10 karakter, sanitasi emoji,
  simpan/batal/persistensi, nama duplikat + `(kamu)`, sinkron warna di waiting,
  HUD, label remote, layar hasil (2 origin lokal), dan production
  (scene profil + simpan/persist) — lolos.
- Setelah edit bloby.html: test di Chrome Incognito
- Multiplayer: test 2 tab dulu, baru lintas device
- Test TURN: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
