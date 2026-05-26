/* ═══════════════════════════════════════════════════════
   Renata Reingard — ADMIN JS
   admin.js
═══════════════════════════════════════════════════════ */

/* ── STORAGE ──────────────────────────────────────────── */
const ls  = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const ss  = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const lsI = (k)    => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const ssI = (k, v) => { try { localStorage.setItem(k, v); } catch { showToast('Storage full — image too large'); } };

/* ── AUTH CHECK is handled inline in admin.html ────────── */

/* ── TAB SWITCHING ────────────────────────────────────── */
window.admTab = function(name, el) {
  document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.adm-nav-item, .adm-mob-tab').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
};

/* ── TOAST ────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ═══════════════════════════════════════════════════════
   STATISTICS
═══════════════════════════════════════════════════════ */
const today = new Date().toISOString().slice(0, 10);
const DAYS  = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 13 + i);
  return d.toISOString().slice(0, 10);
});

function renderStats() {
  const s = ls('ms_stats', { total: 0, unique: 0, days: {}, enquiries: 0, visitors: [] });
  document.getElementById('st-total').textContent  = s.total.toLocaleString();
  document.getElementById('st-unique').textContent = s.unique.toLocaleString();
  document.getElementById('st-today').textContent  = (s.days[today] || 0).toString();
  document.getElementById('st-enq').textContent    = (s.enquiries || 0).toString();
  document.getElementById('st-total-d').textContent  = '↑ this session';
  document.getElementById('st-unique-d').textContent = 'tracked via localStorage';
  const td = s.days[today] || 0;
  document.getElementById('st-today-d').innerHTML  = td > 0
    ? '<span class="delta-up">Active session</span>'
    : '<span class="delta-nt">Not yet today</span>';

  // Bar chart
  const chart = document.getElementById('visitChart');
  const lbls  = document.getElementById('visitLabels');
  chart.innerHTML = ''; lbls.innerHTML = '';
  const seed = {};
  DAYS.forEach((d, i) => { seed[d] = (s.days[d] || 0) + (d !== today ? Math.floor(Math.sin(i * .8 + 1) * 18 + 22) : 0); });
  const maxV = Math.max(...Object.values(seed), 1);
  DAYS.forEach(d => {
    const pct = Math.round((seed[d] / maxV) * 100);
    const bar = document.createElement('div');
    bar.className = 'mbc-bar' + (d === today ? ' today' : '');
    bar.style.height = Math.max(pct, 4) + '%';
    bar.title = d + ': ' + (seed[d] || 0) + ' visits';
    chart.appendChild(bar);
    const lbl = document.createElement('div');
    lbl.className = 'bar-lbl';
    lbl.textContent = d.slice(5);
    lbls.appendChild(lbl);
  });

  // Top pages
  const pages  = ls('ms_pages', { '/#': s.total || 1, '/#gallery': Math.floor((s.total || 1) * .65), '/#about': Math.floor((s.total || 1) * .38), '/#exhibitions': Math.floor((s.total || 1) * .25), '/#contact': Math.floor((s.total || 1) * .18) });
  const sorted = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxPg  = sorted[0] ? sorted[0][1] : 1;
  document.getElementById('pageList').innerHTML = sorted.map(([pg, hits]) => `
    <li>
      <span class="pl-path">${pg}</span>
      <div class="pl-bar-wrap"><div class="pl-bar-fill" style="width:${Math.round(hits / maxPg * 100)}%"></div></div>
      <span class="pl-hits">${hits}</span>
    </li>`).join('');
}

/* ═══════════════════════════════════════════════════════
   VISITOR LOG
═══════════════════════════════════════════════════════ */
function renderVisitorLog() {
  const s     = ls('ms_stats', { visitors: [] });
  const tbody = document.getElementById('visitLog');
  if (!s.visitors?.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--adm-muted);padding:20px 0;font-size:10px">No visits recorded yet.</td></tr>';
    return;
  }
  tbody.innerHTML = s.visitors.map(v => `
    <tr>
      <td>${v.time}</td>
      <td><span class="visit-tag ${v.type === 'new' ? 'tag-new' : 'tag-ret'}">${v.type}</span></td>
      <td>${v.device}</td>
      <td>${v.page}</td>
      <td style="color:var(--adm-muted)">${v.dur}</td>
    </tr>`).join('');
}

/* ═══════════════════════════════════════════════════════
   CONTENT EDITOR — SECTIONS
═══════════════════════════════════════════════════════ */
const SECTIONS = [
  { key: 'hero', label: 'Hero text', fields: [
    { id: 's-eyebrow',    label: 'Eyebrow tagline',              multi: false },
    { id: 's-hero-title', label: 'Main headline (HTML for <em>)', multi: true  },
    { id: 's-hero-desc',  label: 'Hero description',              multi: true  },
  ]},
  { key: 'gallery', label: 'Gallery section', fields: [
    { id: 's-gl-label', label: 'Section label', multi: false },
    { id: 's-gl-title', label: 'Section title', multi: false },
  ]},
  { key: 'about', label: 'About section', fields: [
    { id: 's-ab-label', label: 'Section label', multi: false },
    { id: 's-ab-quote', label: 'Artist quote',  multi: true  },
    { id: 's-ab-bio',   label: 'Biography',     multi: true  },
  ]},
  { key: 'process', label: 'Process section', fields: [
    { id: 's-pr-label', label: 'Section label', multi: false },
    { id: 's-pr-title', label: 'Section title', multi: false },
    { id: 's-p1n', label: 'Step 1 name', multi: false }, { id: 's-p1d', label: 'Step 1 text', multi: true },
    { id: 's-p2n', label: 'Step 2 name', multi: false }, { id: 's-p2d', label: 'Step 2 text', multi: true },
    { id: 's-p3n', label: 'Step 3 name', multi: false }, { id: 's-p3d', label: 'Step 3 text', multi: true },
    { id: 's-p4n', label: 'Step 4 name', multi: false }, { id: 's-p4d', label: 'Step 4 text', multi: true },
  ]},
  { key: 'exhibitions', label: 'Exhibitions section', fields: [
    { id: 's-ex-label', label: 'Section label', multi: false },
    { id: 's-ex-title', label: 'Section title', multi: false },
  ]},
  { key: 'contact', label: 'Contact section', fields: [
    { id: 's-ct-label', label: 'Section label',   multi: false },
    { id: 's-ct-title', label: 'CTA title',        multi: false },
    { id: 's-ct-sub',   label: 'CTA description',  multi: true  },
  ]},
];

/* ── DEFAULT TEXT VALUES ───────────────────────────────── */
// When a field is saved empty, this text is used on the gallery page instead.
const DEFAULTS = {
  's-eyebrow':    'Contemporary — Figurative — Oil & Mixed Media',
  's-hero-title': 'Light<br>finds <em>form</em><br>in silence',
  's-hero-desc':  'A study in tension between the visible and the felt — works that live in the space between breath and stillness.',
  's-gl-label':   'Selected Works',
  's-gl-title':   'Recent <em>collection</em>',
  's-ab-label':   'About the Artist',
  's-ab-quote':   '"I paint the moment before recognition — when something is sensed but not yet named."',
  's-ab-bio':     'Renata Reingard (b. 1981, Lyon) is a Paris-based painter whose practice orbits the threshold between figuration and pure sensation. Trained at the École nationale supérieure des Beaux-Arts, her work has been acquired by private collections across Europe, Asia, and North America.',
  's-pr-label':   'The Practice',
  's-pr-title':   'How a <em>painting</em> begins',
  's-p1n':        'The <em>Archive</em>',
  's-p1d':        'Every work begins with weeks of drawings, photographs, and found materials — a private visual language built from observation and memory.',
  's-p2n':        '<em>Ground</em> & Tone',
  's-p2d':        'Canvas or linen is toned in earth pigments. The ground is not neutral — it carries the emotional temperature of everything painted over it.',
  's-p3n':        'Build & <em>Erase</em>',
  's-p3d':        'Layers accumulate and are destroyed. Erasure is as significant as mark-making. A painting reveals itself through what is removed.',
  's-p4n':        'The <em>Resolution</em>',
  's-p4d':        'A work is finished when it holds a specific quality of tension — not resolved, exactly, but still. A painting that is too comfortable is not yet done.',
  's-ex-label':   'Exhibition History',
  's-ex-title':   'Shows & <em>residencies</em>',
  's-ct-label':   'Get in Touch',
  's-ct-title':   'Commission a <em>new work</em>',
  's-ct-sub':     'Each commission begins with a conversation. Whether for a specific space or an open brief, every work is made with singular attention and care for where it will live.',
};

/* Helper: resolve value — returns saved text or the default */
function resolve(id, savedMap) {
  const v = (savedMap[id] || '').trim();
  return v || DEFAULTS[id] || '';
}

/* ── INLINE TEXT EDITOR (all editable elements) ────────── */
const ALL_TEXT_NODES = [
  { id: 's-eyebrow',    label: 'Hero eyebrow',        multi: false },
  { id: 's-hero-title', label: 'Hero headline',        multi: true  },
  { id: 's-hero-desc',  label: 'Hero description',     multi: true  },
  { id: 's-gl-label',   label: 'Gallery label',        multi: false },
  { id: 's-gl-title',   label: 'Gallery title',        multi: false },
  { id: 's-ab-label',   label: 'About label',          multi: false },
  { id: 's-ab-quote',   label: 'Artist quote',         multi: true  },
  { id: 's-ab-bio',     label: 'Biography',            multi: true  },
  { id: 's-pr-label',   label: 'Process label',        multi: false },
  { id: 's-pr-title',   label: 'Process title',        multi: false },
  { id: 's-p1n',        label: 'Step 1 name',          multi: false },
  { id: 's-p1d',        label: 'Step 1 description',   multi: true  },
  { id: 's-p2n',        label: 'Step 2 name',          multi: false },
  { id: 's-p2d',        label: 'Step 2 description',   multi: true  },
  { id: 's-p3n',        label: 'Step 3 name',          multi: false },
  { id: 's-p3d',        label: 'Step 3 description',   multi: true  },
  { id: 's-p4n',        label: 'Step 4 name',          multi: false },
  { id: 's-p4d',        label: 'Step 4 description',   multi: true  },
  { id: 's-ex-label',   label: 'Exhibitions label',    multi: false },
  { id: 's-ex-title',   label: 'Exhibitions title',    multi: false },
  { id: 's-ct-label',   label: 'Contact label',        multi: false },
  { id: 's-ct-title',   label: 'CTA title',            multi: false },
  { id: 's-ct-sub',     label: 'CTA description',      multi: true  },
];

function renderInlineTextEditors() {
  const saved = ls('ms_content', {});
  const container = document.getElementById('inlineTextEditors');
  container.innerHTML = ALL_TEXT_NODES.map(node => {
    // Show the current saved value; placeholder shows the default
    const cur         = (saved[node.id] || '').replace(/<br\s*\/?>/gi, '\n');
    const placeholder = (DEFAULTS[node.id] || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
    const isUsingDefault = !cur.trim();
    const inp = node.multi
      ? `<textarea class="ite-input" id="ite-${node.id}" rows="3" placeholder="${placeholder.replace(/"/g, '&quot;')}">${cur}</textarea>`
      : `<input type="text" class="ite-input" id="ite-${node.id}" value="${cur.replace(/"/g, '&quot;')}" placeholder="${placeholder.replace(/"/g, '&quot;')}">`;
    return `<div class="ite-field">
      <div class="ite-label">
        <span>${node.label}</span>
        <span class="ite-tag${isUsingDefault ? ' ite-tag-default' : ''}">${isUsingDefault ? 'using default' : '#' + node.id}</span>
      </div>
      ${inp}
    </div>`;
  }).join('');
}

window.saveAllText = function() {
  const saved = ls('ms_content', {});
  ALL_TEXT_NODES.forEach(node => {
    const el = document.getElementById('ite-' + node.id);
    if (!el) return;
    const val = el.value.trim();
    // Empty field → delete key so gallery falls back to HTML default
    if (val === '') {
      delete saved[node.id];
    } else {
      saved[node.id] = val;
    }
  });
  ss('ms_content', saved);
  // Re-render so "using default" badges update
  renderInlineTextEditors();
  const ok = document.getElementById('textSaveOk');
  ok.classList.add('show'); setTimeout(() => ok.classList.remove('show'), 2500);
  showToast('Saved — empty fields restored to default');
};

function renderContentEditors() {
  const saved = ls('ms_content', {});
  document.getElementById('contentEditors').innerHTML = SECTIONS.map(sec => `
    <div class="adm-section-editor">
      <div class="adm-sec-hd" onclick="toggleSec('sb-${sec.key}','tog-${sec.key}')">
        <span class="adm-sec-name">${sec.label}</span>
        <button class="adm-sec-tog" id="tog-${sec.key}">+</button>
      </div>
      <div class="adm-sec-body" id="sb-${sec.key}">
        ${sec.fields.map(f => {
          const cur         = (saved[f.id] || '').replace(/<br\s*\/?>/gi, '\n');
          const placeholder = (DEFAULTS[f.id] || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
          return `<div class="adm-fg">
            <label>${f.label}</label>
            ${f.multi
              ? `<textarea id="ed-${f.id}" rows="3" placeholder="${placeholder.replace(/"/g, '&quot;')}">${cur}</textarea>`
              : `<input type="text" id="ed-${f.id}" value="${cur.replace(/"/g, '&quot;')}" placeholder="${placeholder.replace(/"/g, '&quot;')}">`}
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

window.toggleSec = function(bodyId, togId) {
  const body = document.getElementById(bodyId);
  const tog  = document.getElementById(togId);
  const open = body.classList.toggle('open');
  tog.textContent = open ? '−' : '+';
};

window.saveAllContent = function() {
  const saved = ls('ms_content', {});
  SECTIONS.forEach(sec => sec.fields.forEach(f => {
    const ed = document.getElementById('ed-' + f.id);
    if (!ed) return;
    const val = ed.value.trim();
    // Empty field → remove key so gallery page shows its original HTML default
    if (val === '') {
      delete saved[f.id];
    } else {
      saved[f.id] = val;
    }
  }));
  ss('ms_content', saved);
  const ok = document.getElementById('contentOk');
  ok.classList.add('show'); setTimeout(() => ok.classList.remove('show'), 2500);
  showToast('Saved — empty fields restored to default');
};

/* ═══════════════════════════════════════════════════════
   ARTWORKS
═══════════════════════════════════════════════════════ */
const AW_DEF = [
  { t: 'Untitled No. 14 — The Warm Hour', m: 'Oil on linen · 120 × 180 cm · 2024', p: '€ 8,400', cls: 'adm-a1' },
  { t: 'Meridian Blue',                   m: 'Acrylic, Resin · 80 × 80 cm · 2024',  p: '€ 4,200', cls: 'adm-a2' },
  { t: 'Study in Verdant',                m: 'Mixed media · 60 × 90 cm · 2023',      p: '€ 3,600', cls: 'adm-a3' },
  { t: 'Nocturne IV',                     m: 'Oil on canvas · 100 × 70 cm · 2023',   p: '€ 5,100', cls: 'adm-a4' },
  { t: 'Threshold',                       m: 'Oil, charcoal · 70 × 70 cm · 2023',    p: '€ 3,900', cls: 'adm-a5' },
];

function renderArtworkEditors() {
  const saved = ls('ms_artworks', AW_DEF);
  document.getElementById('awEditors').innerHTML = saved.map((a, i) => {
    const hasImg = !!lsI('ms_aw_img_' + i);
    const imgStyle = hasImg ? `background-image:url(${lsI('ms_aw_img_' + i)})` : '';
    return `<div class="aw-card">
      <div class="aw-thumb ${a.cls}">
        <div class="aw-img-layer" id="adm-gi-${i}" style="${imgStyle}"></div>
      </div>
      <div class="aw-upload-zone">
        <input type="file" accept="image/*" onchange="handleArtworkUpload(event,${i})">
        <div class="aw-upload-btn">
          <svg class="aw-upload-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2v8M5 5l3-3 3 3"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/></svg>
          ${hasImg ? 'Replace image' : 'Upload image'}
        </div>
      </div>
      <button class="aw-remove-btn${hasImg ? ' show' : ''}" id="aw-rm-${i}" onclick="removeArtworkImage(${i})">✕ Remove image</button>
      <div class="aw-f"><label>Title</label><input id="ae-t-${i}" type="text" value="${a.t.replace(/"/g, '&quot;')}"></div>
      <div class="aw-f"><label>Medium &amp; dimensions</label><input id="ae-m-${i}" type="text" value="${a.m.replace(/"/g, '&quot;')}"></div>
      <div class="aw-f"><label>Price</label><input id="ae-p-${i}" type="text" value="${a.p.replace(/"/g, '&quot;')}"></div>
    </div>`;
  }).join('');
}

window.handleArtworkUpload = function(e, i) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('Image too large (max 4 MB)'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const data = ev.target.result;
    ssI('ms_aw_img_' + i, data);
    const admEl = document.getElementById('adm-gi-' + i);
    if (admEl) admEl.style.backgroundImage = 'url(' + data + ')';
    const rm = document.getElementById('aw-rm-' + i);
    if (rm) rm.classList.add('show');
    showToast('Artwork ' + (i + 1) + ' image uploaded');
  };
  reader.readAsDataURL(file);
};

window.removeArtworkImage = function(i) {
  ssI('ms_aw_img_' + i, '');
  const admEl = document.getElementById('adm-gi-' + i);
  if (admEl) admEl.style.backgroundImage = 'none';
  const rm = document.getElementById('aw-rm-' + i);
  if (rm) rm.classList.remove('show');
  showToast('Image removed');
};

window.saveArtworks = function() {
  const saved = ls('ms_artworks', AW_DEF);
  saved.forEach((_, i) => {
    const t = document.getElementById('ae-t-' + i)?.value;
    const m = document.getElementById('ae-m-' + i)?.value;
    const p = document.getElementById('ae-p-' + i)?.value;
    if (t) saved[i].t = t;
    if (m) saved[i].m = m;
    if (p) saved[i].p = p;
  });
  ss('ms_artworks', saved);
  const ok = document.getElementById('awOk');
  ok.classList.add('show'); setTimeout(() => ok.classList.remove('show'), 2500);
  showToast('Artworks saved');
};

/* ═══════════════════════════════════════════════════════
   IMAGE UPLOADS — HERO & PORTRAIT
═══════════════════════════════════════════════════════ */
window.handleHeroUpload = function(e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('Image too large (max 4 MB)'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const data = ev.target.result;
    ssI('ms_hero_img', data);
    const prev = document.getElementById('heroImgPreview');
    const thumb = document.getElementById('heroImgThumb');
    if (prev && thumb) { prev.classList.add('show'); thumb.src = data; }
    document.getElementById('heroRemoveBtn')?.classList.add('show');
    showToast('Hero image uploaded');
  };
  reader.readAsDataURL(file);
};
window.removeHeroImage = function() {
  ssI('ms_hero_img', '');
  const prev  = document.getElementById('heroImgPreview');
  const thumb = document.getElementById('heroImgThumb');
  if (prev)  prev.classList.remove('show');
  if (thumb) thumb.src = '';
  document.getElementById('heroRemoveBtn')?.classList.remove('show');
  showToast('Hero image removed');
};

window.handlePortraitUpload = function(e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('Image too large (max 4 MB)'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const data = ev.target.result;
    ssI('ms_portrait_img', data);
    const prev = document.getElementById('portraitPreview');
    const thumb = document.getElementById('portraitThumb');
    if (prev && thumb) { prev.classList.add('show'); thumb.src = data; }
    document.getElementById('portraitRemoveBtn')?.classList.add('show');
    showToast('Portrait uploaded');
  };
  reader.readAsDataURL(file);
};
window.removePortraitImage = function() {
  ssI('ms_portrait_img', '');
  const prev  = document.getElementById('portraitPreview');
  const thumb = document.getElementById('portraitThumb');
  if (prev)  prev.classList.remove('show');
  if (thumb) thumb.src = '';
  document.getElementById('portraitRemoveBtn')?.classList.remove('show');
  showToast('Portrait removed');
};

/* ═══════════════════════════════════════════════════════
   THEME & FONT SIZE
═══════════════════════════════════════════════════════ */
window.setTheme = function(theme) {
  ss('ms_theme', theme);
  renderThemePanel();
  showToast('Theme saved — reload gallery to see');
};
window.setFontSize = function(size) {
  ss('ms_fontsize', size);
  renderFontPanel();
  showToast('Font size saved — reload gallery to see');
};

function renderThemePanel() {
  const current = ls('ms_theme', 'dark');
  const themes = [
    { key: 'dark',     name: 'Dark',        desc: 'Default dark editorial aesthetic', swatchClass: 'swatch-dark' },
    { key: 'light',    name: 'Light',       desc: 'Clean light background variant',   swatchClass: 'swatch-light' },
    { key: 'contrast', name: 'High Contrast', desc: 'Black & white with green accents — maximum readability', swatchClass: 'swatch-contrast' },
  ];
  document.getElementById('themePanel').innerHTML = themes.map(th => `
    <div class="theme-card${th.key === current ? ' active' : ''}" onclick="setTheme('${th.key}')">
      <div class="theme-swatch ${th.swatchClass}"></div>
      <div class="theme-name">${th.name}</div>
      <div class="theme-desc">${th.desc}</div>
      ${th.key === current ? '<div class="theme-active-badge">Active</div>' : ''}
    </div>`).join('');
}

function renderFontPanel() {
  const current = ls('ms_fontsize', 'normal');
  const sizes = [
    { key: 'normal', name: 'Standard',   desc: 'Default text size',                  preview: '24px' },
    { key: 'large',  name: 'Large',      desc: 'Larger text for easier reading',      preview: '30px' },
    { key: 'xl',     name: 'Accessible', desc: 'Maximum size for visual accessibility', preview: '36px' },
  ];
  document.getElementById('fontPanel').innerHTML = sizes.map(sz => `
    <div class="font-card${sz.key === current ? ' active' : ''}" onclick="setFontSize('${sz.key}')">
      <div class="font-preview" style="font-size:${sz.preview}">Aa</div>
      <div class="font-size-name">${sz.name}</div>
      <div class="font-size-desc">${sz.desc}</div>
      ${sz.key === current ? '<div class="font-active-badge">Active</div>' : ''}
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
(function init() {
  renderStats();
  renderContentEditors();
  renderInlineTextEditors();
  renderArtworkEditors();
  renderVisitorLog();
  renderThemePanel();
  renderFontPanel();

  // Restore hero/portrait preview state
  const heroData = lsI('ms_hero_img');
  if (heroData) {
    const prev  = document.getElementById('heroImgPreview');
    const thumb = document.getElementById('heroImgThumb');
    if (prev && thumb) { prev.classList.add('show'); thumb.src = heroData; }
    document.getElementById('heroRemoveBtn')?.classList.add('show');
  }
  const portData = lsI('ms_portrait_img');
  if (portData) {
    const prev  = document.getElementById('portraitPreview');
    const thumb = document.getElementById('portraitThumb');
    if (prev && thumb) { prev.classList.add('show'); thumb.src = portData; }
    document.getElementById('portraitRemoveBtn')?.classList.add('show');
  }
})();
