/*PURE*/
var LAT = { sharp: ['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'],
            flat:  ['Do','Reb','Re','Mib','Mi','Fa','Solb','Sol','Lab','La','Sib','Si'] };
var AMER = { sharp: ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
             flat:  ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] };
var FLAT_MAJ = [5,10,3,8,1], FLAT_MIN = [2,7,0,5,10,3];
function isMinor(q) { return q.indexOf('m') === 0 && q.indexOf('maj') !== 0; }
function useFlat(pc, minor) { return (minor ? FLAT_MIN : FLAT_MAJ).indexOf(((pc % 12) + 12) % 12) >= 0; }
function noteName(pc, flat, american) {
  var t = american ? AMER : LAT;
  return t[flat ? 'flat' : 'sharp'][((pc % 12) + 12) % 12];
}
// ch = [pc, qualidad, bajo]; shift en semitonos; capo resta; key = [pc, qualidad] de la canción
function fmtChord(ch, shift, capo, key, american) {
  var d = shift - capo;
  var kp = (((key[0] + d) % 12) + 12) % 12;
  var flat = useFlat(kp, isMinor(key[1]));
  var s = noteName(ch[0] + d, flat, american) + ch[1];
  if (ch[2] >= 0) s += '/' + noteName(ch[2] + d, flat, american);
  return s;
}
function keyLabel(key, shift, capo, american) {
  var d = shift - capo;
  var kp = (((key[0] + d) % 12) + 12) % 12;
  return noteName(kp, useFlat(kp, isMinor(key[1])), american) + (isMinor(key[1]) ? 'm' : '');
}
function shiftText(n) { n = ((n % 12) + 12) % 12; if (n > 6) n -= 12; return n === 0 ? '0' : (n > 0 ? '+' + n : '−' + Math.abs(n)); }
function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
/*ENDPURE*/

var S = window.SONGS;
var BYID = {}; S.forEach(function (s, i) { s.idx = i; BYID[s.id] = s; });
var CATS = ['Espíritu Santo','Alabanza','Bendición','Sanación','Virgen María'];
var CATKEY = { 'ESPÍRITU SANTO': 'Espíritu Santo', 'ALABANZA': 'Alabanza', 'BLESSING': 'Bendición', 'SANACIÓN': 'Sanación', 'VIRGEN MARÍA': 'Virgen María' };

var prefs = { american: false, size: 19, chords: true };
function store(k, v) { try { if (v === undefined) { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
var saved = store('cm:prefs'); if (saved) { for (var k in saved) prefs[k] = saved[k]; }

var st = { id: null, vi: 0, shift: 0, capo: 0, cat: null, q: '', panel: false };
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

$('total').textContent = S.length;

function matches(s) {
  if (st.cat && (!s.cats || s.cats.indexOf(st.cat) < 0)) return false;
  if (st.q) { var n = norm(s.title); var parts = norm(st.q).split(/\s+/); for (var i = 0; i < parts.length; i++) if (n.indexOf(parts[i]) < 0) return false; }
  return true;
}
function sortKey(s) { return norm(s.title).replace(/[^a-z0-9 ]/g, '').trim(); }
function sortedAll() { return S.slice().sort(function (a, b) { return sortKey(a).localeCompare(sortKey(b), 'es'); }); }
// Todas: orden alfabético. Con categoría: orden original del cancionero.
function visibleList() { return st.cat ? S.filter(matches) : sortedAll().filter(matches); }
function buildChips() {
  var h = '<button class="chip" aria-pressed="' + (!st.cat) + '" data-cat="">Todas</button>';
  CATS.forEach(function (c) { h += '<button class="chip" aria-pressed="' + (st.cat === c) + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; });
  $('chips').innerHTML = h;
}
function buildList() {
  var items = visibleList();
  $('count').textContent = items.length + (items.length === 1 ? ' canción' : ' canciones');
  var h = '';
  items.forEach(function (s) {
    h += '<li><a href="#' + s.id + '"' + (s.id === st.id ? ' aria-current="true"' : '') + '><span class="ttl">' + esc(s.title) + '</span>' +
      (s.versions.length > 1 ? '<span class="tag">' + s.versions.length + ' versiones</span>' : '') + '</a></li>';
  });
  $('list').innerHTML = items.length ? h : '<li style="padding:14px 6px;color:var(--muted)">Ninguna canción coincide con la búsqueda.</li>';
}

function loadSongState() {
  var s = BYID[st.id];
  var v = store('cm:' + st.id + ':' + st.vi);
  st.shift = v ? v.s : 0; st.capo = v ? v.c : 0;
}
function saveSongState() { store('cm:' + st.id + ':' + st.vi, { s: st.shift, c: st.capo }); }

function chordsHtml(chs, key) {
  return chs.map(function (c) { return fmtChord(c, st.shift, st.capo, key, prefs.american); }).join(' ');
}
function renderBody(v) {
  var key = v.key || [0, ''];
  var h = '';
  v.lines.forEach(function (l) {
    var k = l[0];
    if (k === 'l') {
      h += '<div class="ln">';
      l[1].forEach(function (sg) { h += '<span class="s"><span class="c">' + esc(chordsHtml(sg[0], key)) + '</span><span class="t">' + esc(sg[1]) + '</span></span>'; });
      h += '</div>';
    } else if (k === 'c') {
      h += '<div class="row">' + l[1].map(function (c) { return '<span>' + esc(fmtChord(c, st.shift, st.capo, key, prefs.american)) + '</span>'; }).join('') +
        (l[2] && l[2].length ? '<span class="ann">' + esc(l[2].join(' ')) + '</span>' : '') + '</div>';
    } else if (k === 'i') {
      h += '<div class="row keep"><span class="lab">' + esc(l[1].replace(/:$/, '')) + '</span>' + l[2].map(function (c) { return '<span>' + esc(fmtChord(c, st.shift, st.capo, key, prefs.american)) + '</span>'; }).join('') + '</div>';
    } else if (k === 'n') {
      h += '<div class="mark">' + esc(l[1]) + '</div>';
    } else {
      h += '<div class="plain">' + esc(l[1]) + '</div>';
    }
  });
  return h;
}

function renderSong() {
  var s = BYID[st.id], v = s.versions[st.vi];
  var key = v.key || [0, ''];
  var am = prefs.american;
  var minor = isMinor(key[1]);
  // opciones de tono destino
  var opts = '';
  for (var t = 0; t < 12; t++) {
    var pc = (key[0] + t) % 12;
    opts += '<option value="' + t + '"' + (t === st.shift ? ' selected' : '') + '>' + noteName(pc, useFlat(pc, minor), am) + (minor ? 'm' : '') + '</option>';
  }
  var capoOpts = '';
  for (var c = 0; c <= 7; c++) capoOpts += '<option value="' + c + '"' + (c === st.capo ? ' selected' : '') + '>' + (c === 0 ? 'Sin cejilla' : 'Traste ' + c) + '</option>';
  var hasKey = !!v.lines.length;
  var h = '';
  h += '<div class="bar"><div class="bar-top">' +
    '<button class="back" id="back" aria-label="Volver al índice">← Índice</button>';
  if (hasKey) {
    h += '<div class="tone" role="group" aria-label="Tono">' +
      '<span class="lbl">Tono</span>' +
      '<button class="btn" id="down" aria-label="Bajar un semitono">−</button>' +
      '<select class="sel" id="key" aria-label="Tono de destino">' + opts + '</select>' +
      '<button class="btn" id="up" aria-label="Subir un semitono">+</button>' +
      '<span class="shift" id="shift">' + shiftText(st.shift) + '</span>' +
      '<button class="btn" id="reset" aria-label="Volver al tono original" title="Tono original">↺</button></div>';
  }
  h += '<span class="spacer"></span><button class="btn" id="tpanel" aria-expanded="' + st.panel + '">Ajustes</button></div>';
  h += '<div class="panel" id="panel"' + (st.panel ? '' : ' hidden') + '>' +
    '<div class="grp"><span>Cejilla</span><select class="sel" id="capo">' + capoOpts + '</select></div>' +
    '<div class="grp"><span>Notación</span><div class="seg-ctl"><button id="nlat" aria-pressed="' + (!am) + '">Do Re Mi</button><button id="nam" aria-pressed="' + am + '">C D E</button></div></div>' +
    '<div class="grp"><span>Tamaño de letra</span><div class="seg-ctl"><button id="fsm" aria-label="Letra más pequeña">A−</button><button id="fsp" aria-label="Letra más grande">A+</button></div></div>' +
    '<div class="grp"><span>Acordes</span><div class="seg-ctl"><button id="chon" aria-pressed="' + prefs.chords + '">Con</button><button id="choff" aria-pressed="' + (!prefs.chords) + '">Solo letra</button></div></div>' +
    ('wakeLock' in navigator ? '<div class="grp"><span>Pantalla</span><div class="seg-ctl"><button id="wake" aria-pressed="' + !!wl + '">Mantener encendida</button></div></div>' : '') +
    '</div></div>';

  h += '<article class="song"><h2>' + esc(s.title) + '</h2><div class="meta">' +
    (s.cats ? '<span>' + esc(s.cats.join(' · ')) + '</span>' : '') +
    (hasKey ? '<span>Tono original <b>' + keyLabel(key, 0, 0, am) + '</b></span>' +
      (st.shift ? '<span>Ahora en <b>' + keyLabel(key, st.shift, 0, am) + '</b> (' + shiftText(st.shift) + ')</span>' : '') +
      (st.capo ? '<span>Cejilla en el traste <b>' + st.capo + '</b>: tocas formas de <b>' + keyLabel(key, st.shift, st.capo, am) + '</b></span>' : '') : '') +
    '</div>';
  if (s.versions.length > 1) {
    h += '<div class="vers seg-ctl" role="group" aria-label="Versión">' + s.versions.map(function (vv, i) {
      return '<button data-v="' + i + '" aria-pressed="' + (i === st.vi) + '">' + (i === 0 ? 'Original' : vv.label === '+V' ? 'Versión +V' : 'Versión ' + esc(vv.label)) + '</button>';
    }).join('') + '</div>';
  }
  if (v.notes.length) h += '<div class="notes"><div>Notas del cancionero (tono original):</div>' + v.notes.map(function (n) { return '<div>' + esc(n) + '</div>'; }).join('') + '</div>';
  if (!hasKey) {
    h += '<div class="empty">Esta página del cancionero no tenía texto extraíble en el PDF (probablemente es una imagen). Falta la letra y los acordes.</div>';
  } else {
    h += '<div class="sheet' + (prefs.chords ? '' : ' nochords') + '" id="sheet">' + renderBody(v) + '</div>';
  }
  var vl = visibleList(), pos = vl.indexOf(s);
  if (pos < 0) { vl = sortedAll(); pos = vl.indexOf(s); }
  var prev = vl[pos - 1], next = vl[pos + 1];
  h += '<nav class="pn" aria-label="Navegar entre canciones"><span>' + (prev ? '<a href="#' + prev.id + '">← ' + esc(prev.title) + '</a>' : '') + '</span><span style="text-align:right">' + (next ? '<a href="#' + next.id + '">' + esc(next.title) + ' →</a>' : '') + '</span></nav></article>';
  $('main').innerHTML = h;
  document.documentElement.style.setProperty('--fs', prefs.size + 'px');
  wire();
}
function renderWelcome() {
  $('main').innerHTML = '<div class="welcome"><h2>Elige una canción</h2><p>Cada canción tiene control de tono: sube o baja de semitono en semitono, o elige directamente el tono al que cantas cómodo. Los acordes se recalculan todos a la vez, con séptimas, menores y bajos.</p><p>En Ajustes puedes poner cejilla, cambiar entre Do Re Mi y C D E, agrandar la letra o ver solo la letra.</p><p class="fine">Los acordes se reparten sobre las palabras de cada línea según el orden del PDF; si alguno cae en una sílaba distinta a la del cancionero, lo notarás al cantar.</p></div>';
}

var wl = null;
function wire() {
  var on = function (id, fn) { var e = $(id); if (e) e.addEventListener('click', fn); };
  on('back', function () { location.hash = ''; });
  on('up', function () { st.shift = (st.shift + 1) % 12; saveSongState(); renderSong(); });
  on('down', function () { st.shift = (st.shift + 11) % 12; saveSongState(); renderSong(); });
  on('reset', function () { st.shift = 0; st.capo = 0; saveSongState(); renderSong(); });
  on('tpanel', function () { st.panel = !st.panel; renderSong(); });
  on('nlat', function () { prefs.american = false; store('cm:prefs', prefs); renderSong(); });
  on('nam', function () { prefs.american = true; store('cm:prefs', prefs); renderSong(); });
  on('fsm', function () { prefs.size = Math.max(13, prefs.size - 2); store('cm:prefs', prefs); renderSong(); });
  on('fsp', function () { prefs.size = Math.min(40, prefs.size + 2); store('cm:prefs', prefs); renderSong(); });
  on('chon', function () { prefs.chords = true; store('cm:prefs', prefs); renderSong(); });
  on('choff', function () { prefs.chords = false; store('cm:prefs', prefs); renderSong(); });
  on('wake', toggleWake);
  var ks = $('key'); if (ks) ks.addEventListener('change', function () { st.shift = +ks.value; saveSongState(); renderSong(); });
  var cs = $('capo'); if (cs) cs.addEventListener('change', function () { st.capo = +cs.value; saveSongState(); renderSong(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-v]'), function (b) {
    b.addEventListener('click', function () { st.vi = +b.getAttribute('data-v'); loadSongState(); renderSong(); });
  });
}
function toggleWake() {
  if (wl) { try { wl.release(); } catch (e) {} wl = null; renderSong(); return; }
  try { navigator.wakeLock.request('screen').then(function (l) { wl = l; l.addEventListener('release', function () { wl = null; }); renderSong(); }, function () {}); } catch (e) {}
}

function route() {
  var id = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (BYID[id]) {
    if (st.id !== id) { st.id = id; st.vi = 0; loadSongState(); }
    document.body.setAttribute('data-view', 'song');
    renderSong(); window.scrollTo(0, 0);
  } else {
    st.id = null;
    document.body.setAttribute('data-view', 'list');
    renderWelcome();
  }
  buildList();
}
window.addEventListener('hashchange', route);
$('q').addEventListener('input', function (e) { st.q = e.target.value; buildList(); if (st.id) renderSong(); });
$('chips').addEventListener('click', function (e) {
  var b = e.target.closest('.chip'); if (!b) return;
  st.cat = b.getAttribute('data-cat') || null; buildChips(); buildList(); if (st.id) renderSong();
});
buildChips(); route();

/* Instalación como app (Android: botón; iPhone/iPad: instrucciones) y modo sin conexión */
(function () {
  var box = document.getElementById('install'), deferred = null;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function dismissed() { try { return localStorage.getItem('cm:install-dismissed') === '1'; } catch (e) { return false; } }
  function dismiss() { try { localStorage.setItem('cm:install-dismissed', '1'); } catch (e) {} box.hidden = true; }
  function show(html, wire) { if (standalone || dismissed() || !box) return; box.innerHTML = html + '<button type="button" id="inst-x" aria-label="Cerrar aviso">Ahora no</button>'; box.hidden = false; document.getElementById('inst-x').addEventListener('click', dismiss); if (wire) wire(); }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    show('<p>Instala el cancionero en tu dispositivo y úsalo sin conexión.</p><button type="button" class="go" id="inst-go">Instalar</button>', function () {
      document.getElementById('inst-go').addEventListener('click', function () { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; box.hidden = true; }); });
    });
  });
  window.addEventListener('appinstalled', function () { if (box) box.hidden = true; });
  if (ios && !standalone) show('<p>Para instalarlo: toca <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>.</p>');
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
