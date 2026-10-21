# Aturan Proyek Blobby Jelly

## Struktur Project
- Framework: Next.js 16 (app router)
- Hosting: Vercel (production dari branch main)
- Git remote: https://github.com/Absbsb286/my-ai-website
- File utama game: public/bloby.html (single-file HTML+JS)

## Konvensi Kode
- Selalu gunakan Tailwind CSS untuk styling
- File .tsx untuk React components
- Gunakan 'use client' untuk komponen yang butuh interaksi browser
- Untuk game (bloby.html), gunakan vanilla JS tanpa framework

## Aturan Multiplayer
- Konfigurasi di EMQX_ROOM_CONFIG (public/bloby.html)
- Jangan ubah relayUrls, rtcConfig, atau kredensial TURN tanpa konfirmasi
- Setelah edit networking, test dengan 2 tab dulu sebelum commit

## Git Workflow
- Branch main = production (Vercel auto-deploy)
- Branch feature/* = eksperimen
- Auto-push berjalan via node auto-push.js (pantau src/ dan public/)
- Selalu cek git status sebelum commit

## Testing
- Setelah edit bloby.html, test di Chrome Incognito
- Untuk multiplayer, test di 2 tab dulu (device sama)
- Kalau berhasil, baru test lintas device

## Larangan
- JANGAN hapus file .gitignore
- JANGAN push API key ke GitHub
- JANGAN ubah file di node_modules/
- JANGAN commit file .tmp-* atau file test temporary

---

# Sejarah & Konteks Keputusan

## Mengapa EMQX Serverless (bukan broker publik)?
- Broker publik (broker.emqx.io) sering down/overload
- WiFi kampus blokir WebRTC P2P langsung (symmetric NAT)
- EMQX Serverless free tier: 1 juta session minutes/bulan
- Deployment: bolby, region Asia-Pacific (Google Cloud)
- WebSocket URL: wss://<hostname>:8084/mqtt (port 8084 untuk browser)
- Port 8883 untuk ESP32 (MQTT TLS) nanti

## Mengapa TURN evan-brass.net?
- WiFi kampus blokir OpenRelay (DNS lookup error 701)
- TURN evan-brass berfungsi via IPv6 (meskipun IPv4 gagal)
- Kredensial publik: user/password
- Kadang rate limit saat banyak test → fallback ke provider lain
- Test tool: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

## Mengapa Single-File HTML (public/bloby.html)?
- Simpel untuk deploy di Vercel
- Bisa edit cepat via Cline
- Trade-off: tidak dapat manfaat Next.js (metadata, bundling, lint, typecheck)
- 4.311 baris, ±164 KB, IIFE (tanpa modul ES)

## Fitur Profil Pemain (21 Okt 2026)
- Scope: nama tampilan + warna teks nama; tanpa avatar/emoji.
- Nama 2–10 karakter; spasi dan tanda baca umum boleh, emoji/karakter kontrol dibuang.
- 6 warna dari palet game; warna teks tidak mengubah warna jelly.
- Entry: chip nama + ikon pensil di menu; scene `profile`; input HTML
  `#nameInput` di atas canvas. Tidak ada entry saat race.
- Simpan ke `blobby_name` / `blobby_name_color`; nama duplikat boleh,
  penanda `(kamu)` di waiting dan hasil.
- Sinkronisasi: `nameColor` di hello/roster/state/ranking; warna peer
  dinormalisasi ke palet; nama remote di-clip maks 10 saat digambar.
- Test 21 Okt 2026: desktop 1000×900 + viewport 390×844; batas 10,
  emoji, error <2/empty, simpan/batal/persist; 2 origin (localhost vs
  127.0.0.1) untuk localStorage terpisah; nama sama "NebulaJell" coral/mint;
  warna benar di waiting, HUD, label remote, dan layar hasil; tanpa error JS.
- Production alias (setelah deploy 7389b4d): scene profil terbuka, simpan
  "Produksi"/mint, persist setelah reload, tanpa error console.
- Belum diuji: 2 device fisik, 3 pemain guest-guest, dan anti-cheat
  nama/warna. Warning MQTT keepalive pernah muncul setelah reload tab yang
  masih terhubung room (bukan dari fitur profil).

## Git Workflow
- Branch main = production (Vercel auto-deploy)
- Branch stable-working = backup dari main
- Branch feature/* = eksperimen
- Auto-push.js memantau src/ dan public/ (debounce 10 detik)
- File di luar src/ dan public/ (misal .clinerules) → push manual

## Setup AI Coding
- Gateway: 9Router (localhost:20128) — gabungkan banyak provider
- Provider aktif: OpenCode Free (prefix oc/)
- Model default: oc/muse-spark-1.3-contributor-free
- Cline: interface GUI di VS Code
- OpenCode: interface TUI di terminal
- 9Router harus selalu jalan saat pakai Cline/OpenCode

## Masalah yang Sedang Dihadapi
1. TURN evan-brass rate limit → multiplayer lintas device kadang gagal
2. Bug guest-guest (3 pemain) belum diverifikasi; host-guest + nama/warna sudah lolos
3. ✅ Kredensial MQTT/TURN sudah dipindahkan ke server (Next.js API proxy)
4. ✅ Tombol Pause (solo) + host migration dasar sudah diperbaiki (f89bc92, 8c54565)
5. Belum ada anti-cheat: skor dikirim klien & dipercaya host

## Rencana Perbaikan (dari analisis OpenCode)
1. ✅ Pindahkan kredensial ke server (Next.js API proxy) — SELESAI
2. ✅ Bug fungsional utama (koneksi, akhir race, hasil, host migration) — SELESAI 21 Okt 2026
3. Anti-cheat minimal (validasi skor ekstrem di host) — prioritas berikutnya
4. Migrasi game ke route Next.js /game — jangka panjang
5. Terakhir/opsional: TURN berbayar (Twilio, dsb.)
   - JANGAN pakai layanan berbayar untuk project ini.
   - Pakai TURN gratis (OpenRelay/Metered) atau coturn self-host
     hanya kalau STUN saja benar-benar tidak cukup.

## Bug Hasil Audit (20 Okt 2026) — Status 21 Okt 2026

### ✅ Sudah diperbaiki
1. Timer koneksi (`netSetTimeout`) sekarang dilacak dan dibatalkan di
   `netCleanup`. `net.connected` hanya di-set oleh hello/roster, bukan timer.
   Peringatan "Room belum ditemukan" akhirnya benar-benar tampil di detik 8.
2. Cleanup punya nomor urut (`_cleanupSeq`): klik "Keluar" lalu langsung
   "Buat/Gabung Room" tidak bisa dihapus oleh cleanup lama yang telat selesai.
3. Guest tidak lagi diam di akhir race: host mengirim `over` ulang
   (400/1200/2500 ms), guest punya fallback ranking lokal setelah 4 detik,
   dan `showResult` hanya sekali (koin/bonus tidak dobel).
4. `getOver` memvalidasi pengirim + seed race, dan mengabaikan duplikat.
5. Roster host membersihkan pemain ghost dari daftar guest.
6. Host migration memilih dari peer yang masih terhubung, bukan ghost.
7. Layar hasil memakai tinggi baris adaptif; 6+ pemain tidak menabrak teks
   koin/tombol. Pemain yang tidak ada di ranking tidak lagi default "MENANG".
8. Countdown 3 detik (tidak sempat menampilkan "4"), skor/posisi remote
   di-reset saat mulai, dan remote player disembunyikan selama countdown.
9. Pause solo menghentikan musik; resume menyalakannya lagi.
10. Sub-scene (MP menu, join, waiting, settings, skins) memakai background
    menu tanpa tombol menu utama, jadi tidak ada tombol "hantu" di belakang.
11. `console.log` debug dihapus; meta `mobile-web-app-capable` ditambahkan.

### ✅ Verifikasi 21 Okt 2026 (2 tab, localhost + production)
- Buat room + join: host dan guest saling melihat nama yang benar.
- Start race dari lobby: guest menerima seed/countdown dan melihat host.
- Akhir race: guest menerima `over` dan layar hasil tampil; koin hanya
  bertambah sekali meski `over` dikirim ulang 3x.
- "Main Lagi" dari layar hasil mengembalikan kedua pemain ke lobby; race
  kedua berjalan normal.
- Host menutup tab: guest dipromosikan jadi host setelah 6 detik, dan
  entri host lama (ghost) hilang dari daftar.
- Kode room salah: peringatan "Room belum ditemukan... Batalkan" muncul
  setelah 8 detik (tidak lagi ditutupi status connected palsu).
- Production: penanda kode baru ada, buat room + guest join berhasil,
  tanpa error console.
- Profil pemain: detail test ada di bagian "Fitur Profil Pemain".
- Catatan: ini test 2 tab di satu laptop, bukan 2 device fisik. Skenario
  3 pemain (guest-guest) belum diuji.

### Catatan / sisa
- Metadata `layout.tsx` TIDAK mojibake. Judulnya memang memakai em dash
  U+2014; tampilan "�?" hanya artefak alat baca. Tidak perlu diubah.
- Anti-cheat belum ada: peer bisa memalsukan `state`/`start`/`over`.
- Platform bergerak masih dihitung per-client (bisa drift sedikit).
- `BONUS_LAST_STANDING` diberikan ke semua yang masih hidup — cek apakah
  memang desain yang diinginkan.
- Nama pemain guest-guest perlu diverifikasi ulang di device nyata.
- Profil: 3 pemain guest-guest + 2 device fisik belum diuji; nama/warna
  belum punya anti-cheat (warna dinormalisasi, nama digambar di canvas).
- TURN evan-brass masih bisa rate limit; TURN berbayar tetap prioritas terakhir.

## Aturan untuk AI Agent
- Baca file ini setiap sesi baru
- Kalau ada keputusan besar, update file ini
- Kalau ganti model AI, file ini tetap berlaku
- Prioritaskan sesuai "Rencana Perbaikan" di atas
- Konfirmasi dulu sebelum ubah kredensial/networking
