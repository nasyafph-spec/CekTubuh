'use strict';

/* =========================================================
   CekTubuh - script.js
   1. Pengaturan skor   (ubah batas dan poin di sini)
   2. Data pertanyaan   (tiap opsi: [teks, poin 0-3])
   3. Logika skor       (fungsi murni, mudah diuji)
   4. Tampilan          (form bertahap, hasil, riwayat)
   ========================================================= */

/* ---------- 1. Pengaturan skor ---------- */

const CONFIG = {
  batasSedang: 30,   // persen: mulai risiko sedang
  batasTinggi: 55,   // persen: mulai risiko tinggi
  gejalaTinggi: 9,   // skor gejala (maks 12) yang otomatis membuat risiko tinggi
  storageKey: 'CekTubuh.riwayat.v1',
  maksRiwayat: 8
};

const LEVELS = {
  rendah: {
    label: 'Risiko rendah',
    summary: 'Beban latihan dan pemulihanmu tampak seimbang. Pertahankan kebiasaan ini dan cek lagi setiap minggu.'
  },
  sedang: {
    label: 'Risiko sedang',
    summary: 'Ada tanda beban latihan mulai melebihi pemulihan. Perbaiki indikator yang paling menonjol di bawah ini dan bicarakan dengan pelatihmu.'
  },
  tinggi: {
    label: 'Risiko tinggi',
    summary: 'Beban latihan kemungkinan melebihi kemampuan tubuhmu untuk pulih. Bicarakan dengan pelatih soal menurunkan beban dan menambah istirahat dalam beberapa hari ke depan. Jika ada nyeri berat, pusing, atau sesak, periksakan diri ke tenaga kesehatan.'
  }
};

/* ---------- 2. Data pertanyaan ---------- */

const GROUPS = [
  { id: 'latihan',   title: 'Latihan',        desc: 'Gambaran beban latihan dan sekolahmu dalam 7 hari terakhir.' },
  { id: 'pemulihan', title: 'Pemulihan',      desc: 'Seberapa cukup tubuhmu istirahat dan tidur.' },
  { id: 'makan',     title: 'Makan dan minum', desc: 'Asupan yang menopang tenaga dan pemulihanmu.' },
  { id: 'gejala',    title: 'Kondisi tubuh',  desc: 'Apa yang kamu rasakan di badan dan pikiran belakangan ini.' }
];

const QUESTIONS = [
  // --- Latihan ---
  { id: 'frekuensi', group: 'latihan', short: 'Frekuensi latihan',
    label: 'Berapa hari kamu latihan dalam seminggu terakhir?',
    options: [['1 sampai 3 hari', 0], ['4 sampai 5 hari', 1], ['6 hari', 2], ['7 hari', 3]],
    tip: 'Jadwalkan minimal 1 sampai 2 hari tanpa latihan berat setiap minggu.' },
  { id: 'durasi', group: 'latihan', short: 'Durasi latihan',
    label: 'Rata-rata, berapa lama satu sesi latihanmu?',
    options: [['Maksimal 90 menit', 0], ['91 sampai 120 menit', 1], ['121 sampai 150 menit', 2], ['Lebih dari 150 menit', 3]],
    tip: 'Coba pangkas durasi sesi, atau pecah menjadi dua sesi dengan jeda istirahat.' },
  { id: 'intensitas', group: 'latihan', short: 'Intensitas latihan',
    label: 'Seberapa berat latihanmu biasanya, dalam skala 1 sampai 10?',
    options: [['1 sampai 4 (ringan)', 0], ['5 sampai 6 (sedang)', 1], ['7 sampai 8 (berat)', 2], ['9 sampai 10 (sangat berat)', 3]],
    tip: 'Selang-seling hari latihan berat dengan hari yang lebih ringan.' },
  { id: 'sekolah', group: 'latihan', short: 'Beban sekolah',
    label: 'Seberapa padat tugas dan ujian sekolahmu minggu ini?',
    options: [['Longgar', 0], ['Normal', 1], ['Padat', 2], ['Sangat padat, ujian atau tenggat menumpuk', 3]],
    tip: 'Saat sekolah sedang padat, bicarakan dengan pelatih untuk menurunkan beban latihan sementara.' },

  // --- Pemulihan ---
  { id: 'istirahat', group: 'pemulihan', short: 'Hari istirahat',
    label: 'Berapa hari penuh tanpa latihan dalam seminggu terakhir?',
    options: [['2 hari atau lebih', 0], ['1 hari', 2], ['Tidak ada', 3]],
    tip: 'Hari istirahat adalah waktu otot memperbaiki diri. Sisihkan minimal satu hari penuh.' },
  { id: 'tidur', group: 'pemulihan', short: 'Lama tidur',
    label: 'Rata-rata, berapa jam kamu tidur per malam?',
    options: [['8 jam atau lebih', 0], ['Sekitar 7 jam', 1], ['Sekitar 6 jam', 2], ['5 jam atau kurang', 3]],
    tip: 'Remaja umumnya disarankan tidur sekitar 8 sampai 10 jam per malam. Majukan jam tidurmu sedikit demi sedikit.' },
  { id: 'kualitasTidur', group: 'pemulihan', short: 'Kualitas tidur',
    label: 'Seberapa nyenyak tidurmu?',
    options: [['Nyenyak', 0], ['Cukup nyenyak', 1], ['Sering terbangun', 2], ['Sulit tidur', 3]],
    tip: 'Jauhkan layar HP satu jam sebelum tidur dan tidur di jam yang sama setiap hari.' },

  // --- Makan dan minum ---
  { id: 'makanUtama', group: 'makan', short: 'Makan utama',
    label: 'Berapa kali kamu makan utama per hari?',
    options: [['3 kali atau lebih', 0], ['2 kali', 1], ['1 kali', 3]],
    tip: 'Usahakan 3 kali makan utama per hari, ditambah camilan bergizi.' },
  { id: 'sekitarLatihan', group: 'makan', short: 'Makan sekitar latihan',
    label: 'Apakah kamu makan sebelum dan sesudah latihan?',
    options: [['Selalu', 0], ['Sering', 1], ['Kadang-kadang', 2], ['Hampir tidak pernah', 3]],
    tip: 'Makan ringan 1 sampai 2 jam sebelum latihan, lalu makan lagi setelahnya untuk membantu pemulihan.' },
  { id: 'minum', group: 'makan', short: 'Minum air putih',
    label: 'Berapa gelas air putih yang kamu minum per hari?',
    options: [['8 gelas atau lebih', 0], ['6 sampai 7 gelas', 1], ['4 sampai 5 gelas', 2], ['Kurang dari 4 gelas', 3]],
    tip: 'Bawa botol minum dan minum secara teratur, terutama saat latihan.' },

  // --- Kondisi tubuh ---
  { id: 'nyeri', group: 'gejala', short: 'Nyeri otot',
    label: 'Apakah ada nyeri otot yang tidak kunjung membaik?',
    options: [['Tidak ada', 0], ['Pegal ringan, hilang setelah istirahat', 1], ['Nyeri yang bertahan beberapa hari', 2], ['Nyeri berat atau mengganggu gerakan', 3]],
    tip: 'Nyeri yang bertahan perlu diistirahatkan. Jika berat, periksakan ke tenaga kesehatan.' },
  { id: 'lelah', group: 'gejala', short: 'Rasa lelah',
    label: 'Seberapa lelah kamu meskipun sudah istirahat?',
    options: [['Segar', 0], ['Sedikit lelah', 1], ['Sering lelah', 2], ['Lelah terus-menerus', 3]],
    tip: 'Lelah yang menetap adalah tanda tubuh butuh pulih. Kurangi beban latihan beberapa hari.' },
  { id: 'mood', group: 'gejala', short: 'Suasana hati',
    label: 'Bagaimana suasana hatimu belakangan ini?',
    options: [['Stabil dan semangat', 0], ['Kadang bosan', 1], ['Mudah kesal atau cemas', 2], ['Kehilangan semangat latihan', 3]],
    tip: 'Ceritakan ke pelatih, guru, atau orang yang kamu percaya. Suasana hati juga sinyal pemulihan.' },
  { id: 'performa', group: 'gejala', short: 'Performa latihan',
    label: 'Bagaimana performa latihanmu dibanding biasanya?',
    options: [['Stabil atau naik', 0], ['Sedikit turun', 1], ['Turun jelas', 2], ['Terus turun walau sudah istirahat', 3]],
    tip: 'Performa yang terus turun bisa jadi tanda kelelahan. Diskusikan penyesuaian program dengan pelatih.' }
];

/* Isi kartu pada bagian Indikator: judul, ikon, dan alasan tiap indikator diperiksa */
const GROUP_CARD = {
  latihan: {
    headline: 'Seberapa berat bebanmu',
    icon: '<circle cx="24" cy="24" r="18"/><path d="M24 6v36M6 24h36M10 10c6 5 6 23 0 28M38 10c-6 5-6 23 0 28"/>'
  },
  pemulihan: {
    headline: 'Waktu tubuhmu untuk pulih',
    icon: '<path d="M36 28.5A15 15 0 1 1 19.5 12 12 12 0 0 0 36 28.5z"/>'
  },
  makan: {
    headline: 'Seberapa terpenuhi energimu',
    icon: '<path d="M24 6S12 20 12 29a12 12 0 0 0 24 0C36 20 24 6 24 6z"/><path d="M18 30a6 6 0 0 0 6 6"/>'
  },
  gejala: {
    headline: 'Apa kata tubuhmu',
    icon: '<path d="M4 26h9l5-12 8 24 6-16 3 4h9"/>',
    featured: true,
    note: 'Bisa menaikkan tingkat risiko'
  }
};

const INFO = {
  frekuensi: 'Makin sering latihan tanpa jeda, makin sedikit waktu bagi otot dan saraf untuk pulih.',
  durasi: 'Sesi yang terlalu panjang menambah kelelahan, terutama jika dilakukan berulang.',
  intensitas: 'Latihan sangat berat yang diulang membebani tubuh lebih besar daripada latihan ringan.',
  sekolah: 'Tugas dan ujian ikut menambah beban pikiran, jadi tekanan atlet pelajar tidak hanya berasal dari latihan.',
  istirahat: 'Hari tanpa latihan memberi waktu bagi tubuh untuk memperbaiki diri setelah beban latihan.',
  tidur: 'Tidur adalah waktu utama pemulihan. Tidur yang kurang membuat tubuh sulit pulih.',
  kualitasTidur: 'Tidur yang sering terputus kurang memulihkan, walaupun jumlah jamnya sudah cukup.',
  makanUtama: 'Makan teratur menyediakan energi untuk latihan dan bahan untuk pemulihan.',
  sekitarLatihan: 'Makan sebelum latihan menjaga tenaga, dan makan sesudahnya membantu pemulihan.',
  minum: 'Kekurangan cairan dapat membuat tubuh lebih cepat lelah saat berlatih.',
  nyeri: 'Nyeri otot yang tidak membaik dapat menandakan tubuh belum pulih dari beban latihan.',
  lelah: 'Lelah yang tetap ada walaupun sudah istirahat adalah tanda umum kelelahan berlebih.',
  mood: 'Perubahan suasana hati, seperti mudah kesal atau hilang semangat, sering menyertai overtraining.',
  performa: 'Performa yang menurun padahal rutin berlatih adalah salah satu tanda yang dikaitkan dengan overtraining.'
};

/* Cabang olahraga: hanya memberi catatan umum, tidak mengubah skor */
const SPORTS = [
  { id: 'basket', label: 'Basket',
    note: 'Basket banyak melibatkan lompatan dan perubahan arah berulang, jadi perhatikan kondisi lutut dan pergelangan kaki.' },
  { id: 'futsal', label: 'Futsal dan sepak bola',
    note: 'Cabang ini banyak melibatkan lari cepat dan berhenti mendadak, jadi perhatikan kondisi otot paha dan betis.' },
  { id: 'voli', label: 'Bola voli',
    note: 'Bola voli banyak melibatkan lompatan dan gerakan lengan di atas kepala, jadi perhatikan kondisi bahu dan lutut.' },
  { id: 'bulutangkis', label: 'Bulu tangkis',
    note: 'Bulu tangkis banyak melibatkan langkah cepat dan ayunan lengan berulang, jadi perhatikan bahu, lutut, dan pergelangan kaki.' },
  { id: 'renang', label: 'Renang',
    note: 'Renang membebani bahu secara berulang, jadi perhatikan kondisi bahu dan tenaga secara keseluruhan.' },
  { id: 'atletik', label: 'Atletik',
    note: 'Atletik (lari, lompat, lempar) membebani tungkai dan sendi secara berulang, jadi jaga jeda pemulihan antarsesi.' },
  { id: 'lainnya', label: 'Lainnya', note: '' }
];

/* ---------- 3. Logika skor (fungsi murni) ---------- */

function levelFromPercent(pct) {
  if (pct >= CONFIG.batasTinggi) return 'tinggi';
  if (pct >= CONFIG.batasSedang) return 'sedang';
  return 'rendah';
}

/**
 * ans: { idPertanyaan: { pts: angka, answer: teks } }
 */
function scoreAnswers(ans) {
  const groupTotals = {};
  const groupMax = {};
  GROUPS.forEach(g => { groupTotals[g.id] = 0; groupMax[g.id] = 0; });

  const items = [];
  let total = 0;
  let max = 0;

  QUESTIONS.forEach(q => {
    const a = ans[q.id];
    const qMax = Math.max(...q.options.map(o => o[1]));
    total += a.pts;
    max += qMax;
    groupTotals[q.group] += a.pts;
    groupMax[q.group] += qMax;
    items.push({ q: q, pts: a.pts, answer: a.answer });
  });

  const pct = (total / max) * 100;
  let level = levelFromPercent(pct);
  let note = '';

  const gejala = items.filter(i => i.q.group === 'gejala');
  if (groupTotals.gejala >= CONFIG.gejalaTinggi && level !== 'tinggi') {
    level = 'tinggi';
    note = 'Tingkat risiko dinaikkan karena skor gejala fisik dan suasana hati tinggi.';
  } else if (level === 'rendah' && gejala.some(i => i.pts === 3)) {
    level = 'sedang';
    note = 'Tingkat risiko dinaikkan karena ada satu gejala yang berat.';
  }

  return { total, max, pct, level, note, groupTotals, groupMax, items };
}

/* ---------- 4. Tampilan ---------- */

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function polar(cx, cy, r, pct) {
  const a = Math.PI * (1 - pct / 100);
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

function arcPath(cx, cy, r, p1, p2) {
  const [x1, y1] = polar(cx, cy, r, p1);
  const [x2, y2] = polar(cx, cy, r, p2);
  return 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
         ' A ' + r + ' ' + r + ' 0 0 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2);
}

function renderGauge(el, pct, levelKey, animate) {
  const cx = 120, cy = 120, r = 92;
  const zones = [
    [0, CONFIG.batasSedang, 'var(--low)'],
    [CONFIG.batasSedang, CONFIG.batasTinggi, 'var(--mid)'],
    [CONFIG.batasTinggi, 100, 'var(--high)']
  ];
  const paths = zones.map(z =>
    '<path d="' + arcPath(cx, cy, r, z[0] + 0.8, z[1] - 0.8) + '" stroke="' + z[2] + '"/>'
  ).join('');

  const angle = -90 + pct * 1.8;
  const startAngle = animate ? -90 : angle;
  const label = 'Penunjuk risiko: ' + Math.round(pct) + ' persen, ' + LEVELS[levelKey].label;

  el.innerHTML =
    '<svg viewBox="0 0 240 150" role="img" aria-label="' + label + '">' +
      '<g fill="none" stroke-width="18">' + paths + '</g>' +
      '<text class="tick" x="28" y="144" text-anchor="middle">0%</text>' +
      '<text class="tick" x="212" y="144" text-anchor="middle">100%</text>' +
      '<g class="needle" style="transform: rotate(' + startAngle + 'deg)">' +
        '<line x1="120" y1="120" x2="120" y2="40"/>' +
      '</g>' +
      '<circle class="hub" cx="120" cy="120" r="10"/>' +
    '</svg>';

  if (animate) {
    const needle = el.querySelector('.needle');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      needle.style.transform = 'rotate(' + angle + 'deg)';
    }));
  }
}

if (typeof document !== 'undefined') {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let lastResult = null;
  let lastSaved = false;

  /* ----- Form bertahap ----- */

  function questionHTML(q) {
    const opts = q.options.map(o =>
      '<label class="opt"><input type="radio" name="' + q.id + '" value="' + o[1] + '">' +
      '<span>' + escapeHTML(o[0]) + '</span></label>'
    ).join('');
    return '<fieldset class="q" data-q="' + q.id + '"><legend>' + escapeHTML(q.label) + '</legend>' +
           '<div class="opts">' + opts + '</div></fieldset>';
  }

  function buildForm() {
    const panels = $('#panels');
    const nameField =
      '<div class="field"><label for="nama">Nama panggilan (boleh dikosongkan)</label>' +
      '<input type="text" id="nama" name="nama" maxlength="30" autocomplete="off"></div>' +
      '<div class="field"><label for="cabang">Cabang olahraga</label>' +
      '<select id="cabang" name="cabang">' +
      SPORTS.map(s => '<option value="' + s.id + '">' + s.label + '</option>').join('') +
      '</select></div>';

    GROUPS.forEach((g, gi) => {
      const sec = document.createElement('section');
      sec.className = 'step-panel';
      sec.hidden = gi !== 0;
      sec.setAttribute('aria-labelledby', 'st-' + g.id);
      sec.innerHTML =
        '<h3 id="st-' + g.id + '">' + g.title + '</h3>' +
        '<p class="step-desc">' + g.desc + '</p>' +
        (gi === 0 ? nameField : '') +
        QUESTIONS.filter(q => q.group === g.id).map(questionHTML).join('');
      panels.appendChild(sec);
    });

    $('#stepper').innerHTML = GROUPS.map((g, i) =>
      '<li><span class="n">' + (i + 1) + '</span>' + g.title + '</li>'
    ).join('');

    const count = $('#qcount');
    if (count) count.textContent = QUESTIONS.length;
  }

  function setMsg(text) { $('#step-msg').textContent = text; }

  function showStep(n, scroll) {
    current = n;
    document.querySelectorAll('.step-panel').forEach((p, i) => { p.hidden = i !== n; });
    document.querySelectorAll('#stepper li').forEach((li, i) => {
      li.classList.toggle('done', i < n);
      li.classList.toggle('current', i === n);
      if (i === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    $('#btn-back').disabled = n === 0;
    $('#btn-next').textContent = n === GROUPS.length - 1 ? 'Lihat hasil' : 'Lanjut';
    setMsg('');
    if (scroll) {
      $('#cek-card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function validateStep(n) {
    const panel = document.querySelectorAll('.step-panel')[n];
    const missing = [];
    panel.querySelectorAll('fieldset.q').forEach(fs => {
      const ok = fs.querySelector('input:checked');
      fs.classList.toggle('invalid', !ok);
      if (!ok) missing.push(fs);
    });
    if (missing.length) {
      setMsg('Jawab semua pertanyaan di langkah ini dulu (' + missing.length + ' belum terisi).');
      missing[0].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  /* ----- Hasil ----- */

  function collectAnswers() {
    const form = $('#wizard');
    const ans = {};
    QUESTIONS.forEach(q => {
      const checked = form.querySelector('input[name="' + q.id + '"]:checked');
      ans[q.id] = { pts: Number(checked.value), answer: checked.nextElementSibling.textContent };
    });
    return ans;
  }

  function barLevel(pct) { return levelFromPercent(pct); }

  function renderResult(r) {
    const lv = LEVELS[r.level];
    const pctRound = Math.round(r.pct);

    const bars = GROUPS.map(g => {
      const p = r.groupMax[g.id] ? (r.groupTotals[g.id] / r.groupMax[g.id]) * 100 : 0;
      return '<div class="bar-row">' +
        '<div class="bar-label">' + g.title + '<span>' + r.groupTotals[g.id] + ' dari ' + r.groupMax[g.id] + '</span></div>' +
        '<div class="bar"><i class="' + barLevel(p) + '" data-w="' + p.toFixed(0) + '"></i></div></div>';
    }).join('');

    const standouts = r.items.filter(i => i.pts >= 2).sort((a, b) => b.pts - a.pts);
    const tips = standouts.length
      ? '<ul class="tips">' + standouts.map(i =>
          '<li><strong>' + i.q.short + '</strong>' +
          '<span class="ans">Jawabanmu: ' + escapeHTML(i.answer) + '</span>' +
          '<p>' + i.q.tip + '</p></li>'
        ).join('') + '</ul>'
      : '<p>Tidak ada indikator dengan skor tinggi. Tetap catat kondisimu setiap minggu.</p>';

    const name = ($('#nama').value || '').trim();

    const intro = name
      ? escapeHTML(name) + ', ' + lv.summary.charAt(0).toLowerCase() + lv.summary.slice(1)
      : lv.summary;

    // Peringatan khusus jika risiko tinggi
    const utama = standouts.slice(0, 3).map(i => i.q.short.toLowerCase()).join(', ');
    const warning = r.level === 'tinggi'
      ? '<div class="warning" role="alert">' +
          '<svg class="warn-icon" viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" fill="none" ' +
          'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v5M12 18h.01"/></svg>' +
          '<div><strong>Peringatan: risiko overtraining tinggi</strong>' +
          '<p>Kurangi atau hentikan sementara latihan berintensitas tinggi dan bicarakan dengan pelatihmu hari ini.' +
          (utama ? ' Indikator yang paling menonjol: ' + utama + '.' : '') + '</p>' +
          '<p>Jika ada nyeri berat, pusing, sesak, atau nyeri dada, berhenti latihan dan periksakan diri ke tenaga kesehatan.</p></div>' +
        '</div>'
      : '';

    // Catatan sesuai cabang olahraga
    const sport = SPORTS.find(s => s.id === r.sport) || SPORTS[0];
    const sportSec = sport.note
      ? '<div class="result-sec"><h3>Catatan untuk ' + sport.label.toLowerCase() + '</h3>' +
        '<p>' + sport.note + ' Catatan ini tidak mengubah skor.</p></div>'
      : '';

    $('#result').innerHTML =
      warning +
      '<div class="result-head">' +
        '<div class="gauge" id="result-gauge"></div>' +
        '<div class="result-main">' +
          '<p class="pct">' + pctRound + '<small>%</small></p>' +
          '<span class="badge ' + r.level + '">' + lv.label + '</span>' +
          '<p class="sport-line">Cabang olahraga: <strong>' + sport.label + '</strong></p>' +
          '<p>' + intro + '</p>' +
          (r.note ? '<p class="level-note">' + r.note + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<div class="result-sec"><h3>Skor per kelompok</h3><div class="bars">' + bars + '</div></div>' +
      '<div class="result-sec"><h3>Yang paling menonjol</h3>' + tips + '</div>' +
      sportSec +
      '<div class="result-actions">' +
        '<button type="button" class="btn btn-primary" data-action="save">Simpan ke riwayat</button>' +
        '<button type="button" class="btn btn-ghost" data-action="reset">Isi ulang</button>' +
      '</div>';

    renderGauge($('#result-gauge'), r.pct, r.level, !reduceMotion);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#result .bar i').forEach(i => { i.style.width = i.dataset.w + '%'; });
    }));
  }

  function showResult() {
    lastResult = scoreAnswers(collectAnswers());
    lastResult.name = ($('#nama').value || '').trim();
    lastResult.sport = $('#cabang').value;
    lastSaved = false;
    $('#wizard-area').hidden = true;
    $('#result').hidden = false;
    renderResult(lastResult);
    $('#cek-card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    $('#result').focus({ preventScroll: true });
  }

  function resetAll() {
    $('#wizard').reset();
    document.querySelectorAll('fieldset.q.invalid').forEach(f => f.classList.remove('invalid'));
    $('#result').hidden = true;
    $('#result').innerHTML = '';
    $('#wizard-area').hidden = false;
    lastResult = null;
    showStep(0, true);
  }

  /* ----- Riwayat (disimpan di browser) ----- */

  function loadHistory() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function storeHistory(list) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function renderHistory() {
    const list = loadHistory();
    const box = $('#riwayat');
    box.hidden = list.length === 0;
    $('#riwayat-list').innerHTML = list.map(h => {
      const date = new Date(h.t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const lv = LEVELS[h.level] ? h.level : 'rendah';
      const sp = SPORTS.find(s => s.id === h.sport);
      const who = [h.name, sp ? sp.label : ''].filter(Boolean).join(', ');
      return '<li><span class="when">' + date +
        (who ? ' <span class="who-name">' + escapeHTML(who) + '</span>' : '') + '</span>' +
        '<span class="badge ' + lv + '">' + LEVELS[lv].label.replace('Risiko ', '') + '</span>' +
        '<span class="h-pct">' + Number(h.pct) + '%</span></li>';
    }).join('');
  }

  function saveResult(btn) {
    if (!lastResult || lastSaved) return;
    const list = loadHistory();
    list.unshift({
      t: Date.now(),
      name: lastResult.name,
      sport: lastResult.sport,
      pct: Math.round(lastResult.pct),
      level: lastResult.level
    });
    if (storeHistory(list.slice(0, CONFIG.maksRiwayat))) {
      lastSaved = true;
      btn.textContent = 'Tersimpan';
      btn.disabled = true;
      renderHistory();
    } else {
      btn.textContent = 'Gagal menyimpan (penyimpanan browser dimatikan)';
    }
  }

  /* ----- Bagian Indikator ----- */

  function renderIndikator() {
    $('#ind-cards').innerHTML = GROUPS.map((g, gi) => {
      const x = GROUP_CARD[g.id];
      const qs = QUESTIONS.filter(q => q.group === g.id);
      const maxPts = qs.reduce((s, q) => s + Math.max(...q.options.map(o => o[1])), 0);

      const feats = qs.map(q =>
        '<li data-cari="' + escapeHTML((q.short + ' ' + INFO[q.id]).toLowerCase()) + '">' +
          '<button type="button" class="feat" aria-expanded="false" aria-controls="inf-' + q.id + '">' +
            '<span>' + q.short + '</span>' +
          '</button>' +
          '<p class="feat-info" id="inf-' + q.id + '" hidden>' + INFO[q.id] + '</p>' +
        '</li>'
      ).join('');

      return '<li class="ind-card' + (x.featured ? ' is-featured' : '') + '" ' +
        'data-kartu="' + escapeHTML((g.title + ' ' + x.headline + ' ' + g.desc).toLowerCase()) + '">' +
        '<div class="ind-card-head">' + g.title + '</div>' +
        '<div class="ind-frame" aria-hidden="true">' +
          '<svg viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="currentColor" ' +
          'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + x.icon + '</svg>' +
        '</div>' +
        '<div class="ind-card-body">' +
          '<h4>' + x.headline + '</h4>' +
          '<p class="ind-desc">' + g.desc + '</p>' +
          '<div class="chips"><span class="chip">' + qs.length + ' indikator</span>' +
          '<span class="chip">maks ' + maxPts + ' poin</span></div>' +
          (x.note ? '<p class="ind-note">' + x.note + '</p>' : '') +
          '<ul class="feats">' + feats + '</ul>' +
          '<a class="btn btn-ghost btn-block" href="#cek" data-step="' + gi + '">Isi bagian ini</a>' +
        '</div>' +
      '</li>';
    }).join('');

    const zones = [
      ['rendah', CONFIG.batasSedang],
      ['sedang', CONFIG.batasTinggi - CONFIG.batasSedang],
      ['tinggi', 100 - CONFIG.batasTinggi]
    ];
    $('#ruler').innerHTML = zones.map(z =>
      '<span class="z-' + z[0] + '" style="flex:' + z[1] + '"></span>'
    ).join('');

    $('#ruler-note').textContent =
      'Di bawah ' + CONFIG.batasSedang + '% berarti risiko rendah, ' +
      CONFIG.batasSedang + '% sampai ' + (CONFIG.batasTinggi - 1) + '% sedang, dan ' +
      CONFIG.batasTinggi + '% ke atas tinggi.';
  }

  /* ----- Pencarian indikator ----- */

  function filterIndikator(kata) {
    const t = kata.trim().toLowerCase();
    let ditemukan = 0;

    document.querySelectorAll('.ind-card').forEach(card => {
      const kartuCocok = !t || card.dataset.kartu.includes(t);
      let adaItem = false;
      card.querySelectorAll('.feats > li').forEach(li => {
        const cocok = kartuCocok || li.dataset.cari.includes(t);
        li.hidden = !cocok;
        if (cocok) { adaItem = true; ditemukan++; }
      });
      card.hidden = !adaItem;
    });

    const info = $('#cari-info');
    info.hidden = !t;
    info.textContent = ditemukan
      ? ditemukan + ' indikator ditemukan.'
      : 'Tidak ada indikator yang cocok. Coba kata lain, misalnya tidur, nyeri, atau minum.';
  }

  /* ----- Pasang semua ----- */

  buildForm();
  showStep(0, false);
  renderHistory();
  renderIndikator();
  renderGauge($('#demo-gauge'), 42, 'sedang', false);

  // Mengembalikan nomor langkah pertama yang masih ada pertanyaan belum dijawab (-1 jika lengkap)
  function firstIncompleteStep() {
    const panels = document.querySelectorAll('.step-panel');
    for (let i = 0; i < panels.length; i++) {
      const fieldsets = panels[i].querySelectorAll('fieldset.q');
      for (let j = 0; j < fieldsets.length; j++) {
        if (!fieldsets[j].querySelector('input:checked')) return i;
      }
    }
    return -1;
  }

  $('#btn-next').addEventListener('click', () => {
    if (!validateStep(current)) return;
    if (current === GROUPS.length - 1) {
      // Pengguna bisa melompat ke langkah terakhir lewat kartu, jadi cek semua langkah dulu
      const missing = firstIncompleteStep();
      if (missing !== -1) {
        showStep(missing, false);
        validateStep(missing);
        return;
      }
      showResult();
    } else {
      showStep(current + 1, true);
    }
  });

  $('#cari').addEventListener('input', e => filterIndikator(e.target.value));

  // Kartu indikator: buka atau tutup penjelasan, dan lompat ke langkah formulir
  $('#ind-cards').addEventListener('click', e => {
    const feat = e.target.closest('button.feat');
    if (feat) {
      const info = document.getElementById(feat.getAttribute('aria-controls'));
      const open = feat.getAttribute('aria-expanded') === 'true';
      feat.setAttribute('aria-expanded', String(!open));
      info.hidden = open;
      return;
    }
    const go = e.target.closest('a[data-step]');
    if (go && !$('#wizard-area').hidden) {
      showStep(Number(go.dataset.step), false);
    }
  });

  $('#btn-back').addEventListener('click', () => {
    if (current > 0) showStep(current - 1, true);
  });

  $('#wizard').addEventListener('change', e => {
    const fs = e.target.closest('fieldset.q');
    if (fs) fs.classList.remove('invalid');
    if (!document.querySelector('fieldset.q.invalid')) setMsg('');
  });

  $('#wizard').addEventListener('submit', e => e.preventDefault());

  $('#result').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'reset') resetAll();
    if (btn.dataset.action === 'save') saveResult(btn);
  });

  $('#btn-clear').addEventListener('click', () => {
    if (window.confirm('Hapus semua riwayat di perangkat ini?')) {
      storeHistory([]);
      renderHistory();
    }
  });

  /* ----- Pindah halaman lewat menu bawah ----- */

  const VIEWS = ['indikator', 'cek', 'tentang'];

  function showView(name) {
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== name; });

    document.querySelectorAll('.tabbar a').forEach(a => {
      const aktif = a.dataset.view === name;
      a.classList.toggle('active', aktif);
      if (aktif) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    window.scrollTo(0, 0);
    $('#view-' + name).focus({ preventScroll: true });
  }

  function viewFromHash() {
    const nama = location.hash.replace('#', '');
    return VIEWS.includes(nama) ? nama : null;
  }

  window.addEventListener('hashchange', () => {
    const nama = viewFromHash();
    if (nama) showView(nama);
  });

  showView(viewFromHash() || 'indikator');
}

if (typeof module !== 'undefined') {
  module.exports = { scoreAnswers, levelFromPercent, QUESTIONS, GROUPS, CONFIG };
}