'use strict';

/* =========================================================
   tampilan.js - dipasang di <head> index.html
   1. Ganti tema terang/gelap (pilihan diingat di browser)
   2. Foto pada kartu indikator (otomatis kembali ke ikon
      kalau fotonya belum ada)
   ========================================================= */

/* Foto untuk tiap kartu. Urutan kunci = id kelompok di script.js.
   Taruh filenya di folder "foto" pada repo, lalu sesuaikan nama file di sini. */
const FOTO_KARTU = {
  latihan:   'foto/latihan.jpg',
  pemulihan: 'foto/pemulihan.jpg',
  makan:     'foto/makan.jpg',
  gejala:    'foto/kondisi-tubuh.jpg'
};

(function () {
  const KEY = 'CekTubuh.tema';
  const root = document.documentElement;

  function baca() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function simpan(t) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* abaikan */ }
  }

  function terapkan(t) {
    root.setAttribute('data-tema', t);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0B1424' : '#0E1B33');

    const btn = document.getElementById('btn-tema');
    if (btn) {
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.setAttribute('aria-label', t === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
    }
  }

  // Dijalankan segera (di <head>) supaya halaman tidak "berkedip" terang dulu
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  terapkan(baca() || (prefersDark ? 'dark' : 'light'));

  function pasangFoto() {
    if (typeof GROUPS === 'undefined') return;

    document.querySelectorAll('.ind-card').forEach(function (card, i) {
      const g = GROUPS[i];
      const frame = card.querySelector('.ind-frame');
      if (!g || !frame || !FOTO_KARTU[g.id]) return;

      // Muat dulu di belakang layar; hanya diganti kalau fotonya benar-benar ada
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.onload = function () {
        frame.textContent = '';
        frame.appendChild(img);
        frame.classList.add('ada-foto');
      };
      img.src = FOTO_KARTU[g.id];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    terapkan(root.getAttribute('data-tema') || 'light');   // pasang label tombol

    const btn = document.getElementById('btn-tema');
    if (btn) {
      btn.addEventListener('click', function () {
        const baru = root.getAttribute('data-tema') === 'dark' ? 'light' : 'dark';
        terapkan(baru);
        simpan(baru);
      });
    }

    pasangFoto();
  });
})();