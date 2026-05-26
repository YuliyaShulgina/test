/* ═══════════════════════════════════════════════════════
   Renata Reingard — GALLERY JS
   gallery.js
═══════════════════════════════════════════════════════ */

/* ── STORAGE ──────────────────────────────────────────── */
const ls   = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const ss   = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const lsI  = (k)    => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const ssI  = (k, v) => { try { localStorage.setItem(k, v); } catch { showToast('Storage full'); } };

/* ── CURSOR ───────────────────────────────────────────── */
if (window.matchMedia('(pointer:fine)').matches) {
  const $c = document.getElementById('cursor');
  const $r = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    $c.style.left = mx + 'px'; $c.style.top = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * .35; ry += (my - ry) * .35;
    $r.style.left = rx + 'px'; $r.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

/* ── SCROLL REVEAL ────────────────────────────────────── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── NAV SCROLL ───────────────────────────────────────── */
const $nav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  const on = window.scrollY > 60;
  $nav.style.background        = on ? 'rgba(14,13,12,.93)' : 'transparent';
  $nav.style.backdropFilter    = on ? 'blur(12px)' : 'none';
  $nav.style.borderBottom      = on ? '1px solid rgba(255,255,255,.06)' : 'none';
  $nav.style.transition        = 'all .3s';
});

/* ── MOBILE MENU ──────────────────────────────────────── */
window.openMobMenu  = () => document.getElementById('mobileMenu').classList.add('open');
window.closeMobMenu = () => document.getElementById('mobileMenu').classList.remove('open');

/* ── VISITOR TRACKING ─────────────────────────────────── */
const today = new Date().toISOString().slice(0, 10);

function trackVisit() {
  const stats = ls('ms_stats', { total: 0, unique: 0, days: {}, enquiries: 0, visitors: [] });
  stats.total++;
  stats.days[today] = (stats.days[today] || 0) + 1;
  let uid = lsI('ms_uid');
  if (!uid) { uid = 'u_' + Date.now(); ssI('ms_uid', uid); stats.unique++; }
  const pg = window.location.hash || '/#';
  const pages = ls('ms_pages', {});
  pages[pg] = (pages[pg] || 0) + 1;
  ss('ms_pages', pages);
  const device  = window.innerWidth < 600 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop';
  const dur     = Math.floor(Math.random() * 220 + 20) + 's';
  const type    = lsI('ms_uid') ? 'returning' : 'new';
  stats.visitors.unshift({
    time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    type, device, page: pg || '/#', dur
  });
  if (stats.visitors.length > 60) stats.visitors = stats.visitors.slice(0, 60);
  ss('ms_stats', stats);
}
trackVisit();

window.recordEnquiry = () => {
  const s = ls('ms_stats', { enquiries: 0 });
  s.enquiries = (s.enquiries || 0) + 1;
  ss('ms_stats', s);
  showToast('Enquiry recorded');
};

/* ── LOGIN ────────────────────────────────────────────── */
const CRED = { u: 'admin', p: 'gallery2025' };
window.openLogin  = () => document.getElementById('loginOverlay').classList.add('open');
window.closeLogin = () => document.getElementById('loginOverlay').classList.remove('open');

document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

window.doLogin = function() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (u === CRED.u && p === CRED.p) {
    err.style.display = 'none';
    /* Set auth token BEFORE navigating so admin.html finds it */
    sessionStorage.setItem('ms_admin_auth', '1');
    closeLogin();
    window.location.href = 'admin.html';
  } else {
    err.style.display = 'block';
    ['loginUser', 'loginPass'].forEach(id => document.getElementById(id).style.borderBottomColor = '#c0534a');
  }
};

/* ── TOAST ────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── APPLY SAVED IMAGES ───────────────────────────────── */
function applyArtworkImage(i, data) {
  const el = document.getElementById('gi-' + i);
  if (!el) return;
  if (data) { el.style.backgroundImage = 'url(' + data + ')'; el.style.display = 'block'; }
  else       { el.style.backgroundImage = 'none'; el.style.display = 'none'; }
}
function applyHeroImage(data) {
  const el = document.getElementById('heroImgSite');
  if (!el) return;
  if (data) { el.style.backgroundImage = 'url(' + data + ')'; el.style.display = 'block'; }
  else       { el.style.display = 'none'; }
}
function applyPortraitImage(data) {
  const el = document.getElementById('portraitImgSite');
  if (!el) return;
  if (data) { el.style.backgroundImage = 'url(' + data + ')'; el.style.display = 'block'; }
  else       { el.style.display = 'none'; }
}

/* ── THEME & FONT SIZE HELPERS ────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
}
function applyFontSize(size) {
  document.documentElement.setAttribute('data-fontsize', size || 'normal');
}
function updateThemeBtns(theme) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}
function updateFontBtns(size) {
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
}

/* ── INIT ─────────────────────────────────────────────── */
(function init() {
  // Text content — apply saved values; skip missing/empty keys so HTML defaults stay intact
  const saved = ls('ms_content', {});
  Object.entries(saved).forEach(([id, val]) => {
    if (!val || !val.trim()) return; // empty → keep original HTML
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  });
  // Artwork text
  const AW_DEF = [
    { t: 'The Night Watch',                 m: 'Rembrandt van Rijn · Oil on canvas · 363 × 437 cm · 1642', p: 'Rijksmuseum' },
    { t: 'Water Lilies',                    m: 'Claude Monet · Oil on canvas · 89 × 100 cm · 1906',        p: 'Art Institute of Chicago' },
    { t: 'Wheat Field with Cypresses',      m: 'Vincent van Gogh · Oil on canvas · 72 × 91 cm · 1889',     p: 'Metropolitan Museum' },
    { t: 'The Starry Night',                m: 'Vincent van Gogh · Oil on canvas · 73 × 92 cm · 1889',     p: 'MoMA, New York' },
    { t: 'Wanderer above the Sea of Fog',   m: 'Caspar David Friedrich · Oil on canvas · 98 × 74 cm · 1818', p: 'Kunsthalle Hamburg' },
  ];
  const aw = ls('ms_artworks', null);
  if (aw) aw.forEach((a, i) => {
    const t = document.getElementById('aw-t-' + i);
    const m = document.getElementById('aw-m-' + i);
    const p = document.getElementById('aw-p-' + i);
    if (t) t.textContent = (a.t && a.t.trim()) ? a.t : AW_DEF[i].t;
    if (m) m.textContent = (a.m && a.m.trim()) ? a.m : AW_DEF[i].m;
    if (p) p.textContent = (a.p && a.p.trim()) ? a.p : AW_DEF[i].p;
  });
  // Images — local files from /img/
  const DEFAULT_PAINTINGS = [
    '../img/1.jpg',
    '../img/2.jpg',
    '../img/3.jpg',
    '../img/4.jpg',
    '../img/5.jpg',
  ];
  for (let i = 0; i < 5; i++) {
    const d = lsI('ms_aw_img_' + i) || DEFAULT_PAINTINGS[i];
    applyArtworkImage(i, d);
  }
  applyHeroImage(lsI('ms_hero_img'));
  applyPortraitImage(lsI('ms_portrait_img') || '../img/bio.jpg');
  // Theme
  const savedTheme = ls('ms_theme', 'dark');
  const savedFont  = ls('ms_fontsize', 'normal');
  applyTheme(savedTheme);
  applyFontSize(savedFont);
  updateThemeBtns(savedTheme);
  updateFontBtns(savedFont);
})();

/* ── THEME BAR CONTROLS ───────────────────────────────── */
window.setTheme = function(theme) {
  applyTheme(theme);
  ss('ms_theme', theme);
  updateThemeBtns(theme);
};
window.setFontSize = function(size) {
  applyFontSize(size);
  ss('ms_fontsize', size);
  updateFontBtns(size);
};
