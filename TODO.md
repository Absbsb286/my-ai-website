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
