# TODO

## Perbaikan mata melihat ke atas saat melompat

- [x] **Selesai** — saat karakter berada di udara atau melompat, pupil masih dominan melihat ke bawah, belum mengikuti platform di atas/ahead.
  - File utama: `public/bloby.html` (`landingGazeFor`, `updateLandingGaze`).
  - Gejala: tes menghasilkan `gaze.y` minimum sekitar `0.005` dan tidak ada nilai negatif (tidak melihat ke atas).
  - Penyebab: kandidat platform hanya diterima jika lintasan horizontal sangat sejajar (`dx > 18` langsung dilewati), lalu fallback memilih platform di bawah.
  - Rencana perbaikan:
    1. Saat `vy < 0` (naik), cari platform di atas yang masih terjangkau berdasarkan titik apex lompatan.
    2. Longgarkan batas horizontal dan beri penalti untuk platform yang berlawanan dengan arah gerak `vx`.
    3. Utamakan platform di atas/ahead; fallback ke platform bawah hanya jika tidak ada kandidat yang masuk akal.
    4. Verifikasi `gaze.y < 0` saat melompat dan pupil terlihat mengarah ke atas/ahead.

- [x] Mata mode armor 17 koin sudah memakai `gaze` dan sudah dicek pengguna.

## Update 24 Okt 2026
- [x] Bug spectator stale sudah diperbaiki: raceSeed di packet state, `alive` tidak diikat phase countdown, keyboard spectator gate local dead, dan spektator palsu ditolak. Build lulus.
- [ ] Next: perbaikan spektator lebih lanjut (polish camera, UI spectator, dan host authority), dilanjutkan sesi berikutnya.

## Update 23 Okt 2026
- [x] Platform bergerak - gerak di-resolve dari waktu dinding (spawnTime + elapsed) dengan pantulan deterministik, bukan += vx*dt. File: public/bloby.html (spawnPlatform, updateGame).
- [x] BONUS_LAST_STANDING - hanya diberikan ke sole survivor (aliveCount === 1). File: public/bloby.html (buildRanking).
- [x] TURN gratis tambahan - OpenRelay ditambahkan sebagai fallback pada /api/config. File: src/app/api/config/route.ts.
- [x] Migrasi /game tahap awal - route Next.js /game dibuat + redirect /game. Engine masih iframe public/bloby.html. File: src/app/game/page.tsx, src/app/page.tsx.
