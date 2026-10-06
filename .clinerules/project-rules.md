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
- 2.348 baris, 83 KB, IIFE (tanpa modul ES)

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
2. Bug guest-guest: pemain kadang tidak lihat nama pemain lain
3. Kredensial MQTT/TURN masih hardcoded di bloby.html (risiko keamanan)
4. Bug fungsional: tombol Pause mati, host migration tidak ada, dll.
5. Belum ada anti-cheat: skor dikirim klien & dipercaya host

## Rencana Perbaikan (dari analisis OpenCode)
1. Pindahkan kredensial ke server (Next.js API proxy) — PRIORITAS
2. Setup Twilio TURN (gratis $15) — untuk multiplayer stabil
3. Fix bug fungsional (Pause, host migration, dll.)
4. Anti-cheat minimal (validasi skor ekstrem di host)
5. Migrasi ke App Router Next.js (route /game) — jangka panjang

## Aturan untuk AI Agent
- Baca file ini setiap sesi baru
- Kalau ada keputusan besar, update file ini
- Kalau ganti model AI, file ini tetap berlaku
- Prioritaskan sesuai "Rencana Perbaikan" di atas
- Konfirmasi dulu sebelum ubah kredensial/networking
