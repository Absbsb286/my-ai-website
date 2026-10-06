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
