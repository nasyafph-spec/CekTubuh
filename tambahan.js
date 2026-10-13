'use strict';

/* =========================================================
   tambahan.js - dimuat SETELAH script.js
   Menambah dua hal tanpa mengubah script.js:
   1. Rencana pemulihan (risiko sedang dan tinggi)
   2. Kirim hasil ke peneliti (opsional). Persetujuan dicentang di
      awal formulir; kalau dicentang, hasil terkirim otomatis.
   ========================================================= */

const TAMBAHAN = {
  // Tempel URL Web App Google Apps Script di sini (berakhiran /exec).
  // Kosongkan ('') kalau belum ingin ada fitur kirim data.
  endpoint: 'https://script.google.com/macros/s/AKfycbyaHZaFG9MFsU5uPHvKMs1KyUvKJYKBNQLs1jDdXV5XxW888AR78L7tZY50ciP-u0ZeDg/exec'
};

const RECOVERY = {
  tinggi: {
    title: 'Rencana pemulihan untuk kamu',
    intro: 'Karena risikomu tinggi, fokus dulu ke pemulihan sebelum mengejar performa. Ikuti langkah di bawah secara berurutan dan diskusikan dengan pelatih.',
    phases: [
      { title: 'Hari 1 sampai 3: istirahat total',
        items: [
          'Hentikan latihan berat dan latihan intensitas tinggi. Boleh jalan santai atau peregangan ringan 15 sampai 20 menit.',
          'Beri tahu pelatih bahwa kamu butuh menurunkan beban. Itu bukan tanda lemah, itu bagian dari program latihan.',
          'Tidur siang singkat 20 sampai 30 menit boleh, tapi jangan terlalu sore supaya tidur malam tidak terganggu.',
          'Catat tiap pagi: tidur berapa jam, rasa lelah (1 sampai 10), dan nyeri otot.'
        ] },
      { title: 'Tidur yang memulihkan',
        items: [
          'Targetkan 8 sampai 10 jam per malam. Majukan jam tidur 15 sampai 30 menit setiap malam sampai tercapai.',
          'Tidur dan bangun di jam yang sama, termasuk akhir pekan.',
          'Matikan layar HP 1 jam sebelum tidur. Kamar gelap, sejuk, dan tenang.',
          'Hindari kafein (kopi, teh pekat, minuman energi) setelah sore hari.'
        ] },
      { title: 'Makan dan minum untuk pulih',
        items: [
          'Makan utama 3 kali sehari, jangan dilewati, plus 1 sampai 2 camilan bergizi.',
          'Setiap makan ada karbohidrat (nasi, kentang, roti), protein (telur, ikan, ayam, tempe, tahu), serta sayur dan buah.',
          'Makan ringan 1 sampai 2 jam sebelum aktivitas, dan makan lagi dalam 1 jam setelahnya.',
          'Minum air putih sepanjang hari. Warna urine kuning pucat tandanya cukup cairan.'
        ] },
      { title: 'Pikiran dan suasana hati',
        items: [
          'Ceritakan apa yang kamu rasakan ke pelatih, guru, orang tua, atau teman yang kamu percaya.',
          'Sisihkan waktu untuk hal yang kamu suka di luar olahraga: ngobrol dengan teman, musik, jalan santai.',
          'Latihan napas pelan 5 menit (tarik napas 4 hitungan, buang 6 hitungan) membantu menenangkan badan.',
          'Kalau tugas dan ujian menumpuk, buat jadwal belajar harian supaya tidak menumpuk di malam hari.'
        ] },
      { title: 'Hari 4 sampai 14: kembali bertahap',
        items: [
          'Mulai lagi dengan sekitar 50 persen dari beban biasa (durasi dan intensitas), fokus teknik dan latihan ringan.',
          'Naikkan beban sedikit demi sedikit, tidak lebih dari sekitar 10 persen per minggu, selama tubuh terasa baik.',
          'Pertahankan minimal 1 sampai 2 hari istirahat penuh setiap minggu, dan jangan latihan berat dua hari berturut-turut.',
          'Kalau lelah, nyeri, atau mood memburuk lagi, turunkan beban satu tingkat dan istirahat lagi.'
        ] },
      { title: 'Penguatan agar tidak kambuh',
        items: [
          'Pemanasan 10 sampai 15 menit dan pendinginan 5 sampai 10 menit di setiap sesi.',
          'Latihan penguatan ringan 2 kali seminggu (squat, plank, keseimbangan satu kaki) dengan teknik benar.',
          'Isi cek risiko ini seminggu sekali untuk memantau tren, bukan hanya saat merasa buruk.',
          'Atur siklus latihan: 2 sampai 3 minggu beban naik, diikuti 1 minggu yang lebih ringan.'
        ] }
    ],
    signs: 'Tanda kamu sudah pulih: tidur nyenyak, bangun segar, nyeri hilang, mood stabil, dan performa kembali normal tanpa memaksakan diri. Isi cek risiko lagi setelah 1 sampai 2 minggu.',
    warn: 'Segera periksakan diri ke dokter atau tenaga kesehatan jika ada nyeri dada, sesak, pusing atau pingsan, jantung berdebar tidak wajar, nyeri berat yang menetap, demam berulang, atau perasaan sangat sedih dan putus asa yang tidak membaik.'
  },
  sedang: {
    title: 'Langkah pencegahan agar risiko tidak naik',
    intro: 'Risikomu belum tinggi, tapi sudah ada tanda awal. Mulai dari langkah kecil ini minggu ini.',
    phases: [
      { title: 'Atur beban latihan',
        items: [
          'Pastikan ada minimal 1 sampai 2 hari istirahat penuh seminggu.',
          'Selang-seling hari latihan berat dengan hari ringan, dan kurangi durasi bila sekolah sedang padat.'
        ] },
      { title: 'Perkuat pemulihan',
        items: [
          'Tidur 8 sampai 10 jam per malam dengan jam tidur yang konsisten.',
          'Makan 3 kali sehari, makan ringan sebelum dan sesudah latihan, serta minum air putih cukup.'
        ] },
      { title: 'Pantau dan komunikasikan',
        items: [
          'Cek ulang risiko seminggu lagi dan bandingkan skornya.',
          'Ceritakan rasa lelah atau nyeri ke pelatih sebelum menjadi parah.'
        ] }
    ],
    signs: '',
    warn: 'Jika gejala memburuk atau nyeri berat muncul, periksakan diri ke tenaga kesehatan.'
  }
};

(function () {
  const result = document.getElementById('result');
  if (!result) return;

  /* ----- Persetujuan di awal formulir (di bawah pilihan cabang olahraga) ----- */

  const cabang = document.getElementById('cabang');
  if (cabang && TAMBAHAN.endpoint) {
    const field = cabang.closest('.field');
    if (field) {
      field.insertAdjacentHTML('afterend',
        '<div style="margin-bottom:24px">' +
          '<label class="consent"><input type="checkbox" id="consent-awal"> ' +
          '<span><strong>Kirim hasilku ke peneliti (opsional).</strong> Jika dicentang, hasilmu otomatis terkirim ' +
          'begitu hasil tampil. Yang dikirim: nama panggilan, cabang olahraga, waktu, persentase, tingkat risiko, ' +
          'dan poin tiap pertanyaan. Jika kamu di bawah 18 tahun, beri tahu orang tua atau guru dulu.</span></label>' +
        '</div>');
    }
  }

  function collect() {
    const form = document.getElementById('wizard');
    const ans = {};
    for (const q of QUESTIONS) {
      const c = form.querySelector('input[name="' + q.id + '"]:checked');
      if (!c) return null;
      ans[q.id] = { pts: Number(c.value), answer: c.nextElementSibling.textContent };
    }
    return ans;
  }

  function recoveryHTML(level) {
    const r = RECOVERY[level];
    if (!r) return '';
    const phases = r.phases.map((p, i) =>
      '<details class="phase"' + (i === 0 ? ' open' : '') + '>' +
        '<summary><span class="phase-n">' + (i + 1) + '</span>' + escapeHTML(p.title) + '</summary>' +
        '<ul>' + p.items.map(t => '<li>' + escapeHTML(t) + '</li>').join('') + '</ul>' +
      '</details>'
    ).join('');
    return '<div class="result-sec recovery ' + level + '">' +
      '<h3>' + escapeHTML(r.title) + '</h3>' +
      '<p>' + escapeHTML(r.intro) + '</p>' + phases +
      (r.signs ? '<p class="rec-signs">' + escapeHTML(r.signs) + '</p>' : '') +
      '<p class="rec-warn"><strong>Perlu bantuan medis?</strong> ' + escapeHTML(r.warn) + '</p>' +
    '</div>';
  }

  /* Kotak untuk yang TIDAK mencentang di awal: boleh memilih kirim setelah lihat hasil */
  const shareHTML =
    '<div class="result-sec share-box">' +
      '<h3>Bantu penelitian (opsional)</h3>' +
      '<p>Hasil ini bisa dikirim ke penulis untuk keperluan Karya Tulis Ilmiah. Yang dikirim: nama panggilan yang kamu isi, cabang olahraga, waktu, persentase, tingkat risiko, dan poin tiap pertanyaan. Tidak ada data lain.</p>' +
      '<label class="consent"><input type="checkbox" id="consent"> ' +
      '<span>Saya setuju hasil ini dikirim ke penulis. Jika saya di bawah 18 tahun, saya sudah memberi tahu orang tua atau guru.</span></label>' +
      '<button type="button" class="btn btn-ghost" data-action="send">Kirim hasil ke peneliti</button>' +
      '<p class="share-msg" id="share-msg" role="status"></p>' +
    '</div>';

  /* Kotak untuk yang mencentang di awal: terkirim otomatis */
  const autoHTML =
    '<div class="result-sec share-box">' +
      '<h3>Pengiriman ke peneliti</h3>' +
      '<p class="share-msg" id="share-msg" role="status">Mengirim...</p>' +
      '<button type="button" class="btn btn-ghost" data-action="send" hidden>Coba kirim lagi</button>' +
    '</div>';

  let terkirim = false;

  function kirim(msg, btn) {
    const ans = collect();
    if (!ans) return;
    const r = scoreAnswers(ans);
    const payload = {
      waktu: new Date().toISOString(),
      nama: (document.getElementById('nama').value || '').trim(),
      cabang: document.getElementById('cabang').value,
      persen: Math.round(r.pct),
      level: r.level,
      kelompok: r.groupTotals,
      jawaban: {}
    };
    r.items.forEach(i => { payload.jawaban[i.q.id] = i.pts; });

    if (btn) btn.disabled = true;
    msg.textContent = 'Mengirim...';
    fetch(TAMBAHAN.endpoint, {
      method: 'POST',
      mode: 'no-cors',                      // Apps Script tidak mendukung CORS penuh
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(() => {
      terkirim = true;
      if (btn) btn.hidden = true;
      msg.textContent = 'Terima kasih, hasilmu sudah dikirim ke peneliti.';
    }).catch(() => {
      if (btn) { btn.disabled = false; btn.hidden = false; }
      msg.textContent = 'Gagal mengirim. Cek koneksi internet lalu coba lagi.';
    });
  }

  function tambah() {
    const actions = result.querySelector('.result-actions');
    if (result.hidden || !actions) { delete result.dataset.tambahan; return; }
    if (result.dataset.tambahan) return;
    result.dataset.tambahan = '1';

    const ans = collect();
    if (!ans) return;
    const r = scoreAnswers(ans);

    const awal = document.getElementById('consent-awal');
    const otomatis = Boolean(TAMBAHAN.endpoint && awal && awal.checked);
    const kotak = otomatis ? autoHTML : (TAMBAHAN.endpoint ? shareHTML : '');

    actions.insertAdjacentHTML('beforebegin', recoveryHTML(r.level) + kotak);

    if (otomatis && !terkirim) {
      kirim(document.getElementById('share-msg'), result.querySelector('[data-action="send"]'));
    }
  }

  new MutationObserver(tambah).observe(result, { childList: true });

  // Tombol kirim (manual atau "coba kirim lagi")
  result.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action="send"]');
    if (!btn || terkirim) return;
    const msg = document.getElementById('share-msg');
    const consent = document.getElementById('consent');   // hanya ada di kotak manual
    if (consent && !consent.checked) {
      msg.textContent = 'Centang persetujuan dulu kalau kamu ingin mengirim hasil.';
      return;
    }
    kirim(msg, btn);
  });

  // Isi ulang: izinkan kirim lagi untuk hasil berikutnya
  result.addEventListener('click', e => {
    if (e.target.closest('button[data-action="reset"]')) terkirim = false;
  });
})();