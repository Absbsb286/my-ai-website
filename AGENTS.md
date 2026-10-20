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
- public/bloby.html — file game utama (3.861 baris, single-file HTML+JS)
- src/app/page.tsx — hanya redirect ke /bloby.html
- src/app/layout.tsx — metadata (sudah benar; title/OG memakai em dash)
- auto-push.js — script auto-commit & push (pantau src/ dan public/)
- .clinerules/project-rules.md — aturan detail untuk Cline

## Cara Kerja
1. Game multiplayer P2P pakai Trystero (WebRTC)
2. Signaling via EMQX Serverless MQTT (WebSocket port 8084)
3. TURN server: evan-brass.net (untuk WiFi ketat seperti kampus)
4. State sync 15Hz, interpolasi 100ms delay

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
- Status 21 Okt 2026: alur room/race/hasil/replay/host migration lolos di 2 tab lokal
- Setelah edit bloby.html: test di Chrome Incognito
- Multiplayer: test 2 tab dulu, baru lintas device
- Test TURN: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
