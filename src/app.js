/* =============================================
    CHROMA — Color Palette Generator
    Main application logic
   ============================================= */

// ── Utilities ──────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function textColor(hex) {
  return luminance(hex) > 0.35 ? '#111111' : '#ffffff';
}

function rgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function hslString(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const COLOR_NAMES = [
  'Midnight', 'Obsidian', 'Charcoal', 'Iron', 'Ash',
  'Pearl', 'Ivory', 'Cream', 'Champagne', 'Gold',
  'Amber', 'Copper', 'Rust', 'Crimson', 'Scarlet',
  'Rose', 'Blush', 'Salmon', 'Coral', 'Tangerine',
  'Saffron', 'Citrine', 'Lime', 'Sage', 'Forest',
  'Emerald', 'Teal', 'Cyan', 'Azure', 'Cobalt',
  'Indigo', 'Violet', 'Lavender', 'Mauve', 'Plum',
  'Burgundy', 'Wine', 'Mocha', 'Caramel', 'Linen',
];

function nameFromHex(hex) {
  const { h, s, l } = rgbToHsl(...Object.values(hexToRgb(hex)));
  const idx = Math.floor(h / 9) % COLOR_NAMES.length;
  return COLOR_NAMES[idx];
}

function randomHex() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

// ── Color Generation Modes ─────────────────────

function generateColor(mode) {
  switch (mode) {
    case 'warm': return hslToHex(Math.random() * 60 + 330 > 360 ? Math.random() * 60 : Math.random() * 60, 60 + Math.random() * 40, 35 + Math.random() * 45);
    case 'cool': return hslToHex(180 + Math.random() * 120, 50 + Math.random() * 40, 35 + Math.random() * 45);
    case 'pastel': return hslToHex(Math.random() * 360, 40 + Math.random() * 30, 70 + Math.random() * 20);
    case 'dark': return hslToHex(Math.random() * 360, 20 + Math.random() * 50, 8 + Math.random() * 25);
    case 'neon': return hslToHex(Math.random() * 360, 90 + Math.random() * 10, 50 + Math.random() * 15);
    case 'earth': return hslToHex(20 + Math.random() * 50, 25 + Math.random() * 40, 25 + Math.random() * 45);
    case 'monochrome': {
      const base = state.palette[0] ? hexToRgb(state.palette[0].hex) : { r: 100, g: 100, b: 100 };
      const { h, s } = rgbToHsl(base.r, base.g, base.b);
      return hslToHex(h + (Math.random() * 20 - 10), s, 20 + Math.random() * 60);
    }
    default: return randomHex();
  }
}

function buildColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    name: nameFromHex(hex),
    locked: false
  };
}

// ── Harmony Algorithms ─────────────────────────

function getHarmonyColors(baseHex, rule) {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const make = (dh, ds = s, dl = l) => buildColor(hslToHex((h + dh + 360) % 360, Math.min(100, ds), Math.min(95, Math.max(5, dl))));

  switch (rule) {
    case 'complementary': return [make(0), make(30, -15, l - 10), make(180), make(210, -15, l + 10)];
    case 'triadic': return [make(0), make(120), make(240), make(60, s - 20)];
    case 'analogous': return [make(-40), make(-20), make(0), make(20), make(40)];
    case 'split': return [make(0), make(150), make(210), make(75, s - 20)];
    case 'tetradic': return [make(0), make(90), make(180), make(270)];
    case 'square': return [make(0), make(90), make(180), make(270), make(45, s - 20)];
    default: return [make(0), make(180)];
  }
}

// ── State ──────────────────────────────────────

const state = {
  palette: [],
  count: 5,
  mode: 'random',
  copyFmt: 'hex',
  savedPalettes: JSON.parse(localStorage.getItem('chroma_saved') || '[]'),
  harmonyRule: 'complementary',
  harmonyBase: '#6C63FF',
  gradientType: 'linear',
  gradientAngle: 135,
  gradientStops: [{ color: '#6C63FF', pos: 0 }, { color: '#ff6bb5', pos: 100 }],
};

// ── Palette Rendering ──────────────────────────

function renderPalette(colors, containerId = 'palette-container') {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  colors.forEach((c, i) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch' + (c.locked ? ' locked' : '');
    swatch.style.background = c.hex;
    swatch.dataset.index = i;

    const textCol = textColor(c.hex);
    swatch.innerHTML = `
      <div class="lock-indicator" style="color:${textCol}">🔒</div>
      <div class="swatch-inner">
        <div class="swatch-hex" style="color:${textCol}">${c.hex}</div>
        <div class="swatch-name" style="color:${textCol}">${c.name}</div>
        <div class="swatch-actions">
          <button class="swatch-btn copy-btn" data-hex="${c.hex}" style="color:${textCol};border-color:${textCol}30">Copy</button>
          <button class="swatch-btn lock-btn" data-index="${i}" style="color:${textCol};border-color:${textCol}30">${c.locked ? '🔓 Unlock' : '🔒 Lock'}</button>
        </div>
      </div>
    `;

    // Click swatch to copy
    swatch.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      copyColor(c.hex);
    });

    container.appendChild(swatch);
  });

  // Attach button events
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); copyColor(btn.dataset.hex); });
  });
  container.querySelectorAll('.lock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      state.palette[idx].locked = !state.palette[idx].locked;
      renderPalette(state.palette);
    });
  });
}

function generatePalette() {
  const newColors = [];
  for (let i = 0; i < state.count; i++) {
    if (state.palette[i]?.locked) {
      newColors.push(state.palette[i]);
    } else {
      newColors.push(buildColor(generateColor(state.mode)));
    }
  }
  state.palette = newColors;
  renderPalette(state.palette);
  updateGradientFromPalette();
}

// ── Copy ──────────────────────────────────────

function copyColor(hex) {
  let val = hex;
  if (state.copyFmt === 'rgb') val = rgbString(hex);
  if (state.copyFmt === 'hsl') val = hslString(hex);
  if (window.electronAPI) {
    window.electronAPI.copyToClipboard(val);
  } else {
    navigator.clipboard?.writeText(val);
  }
  showToast(`Copied ${val}`);
}

// ── Toast ──────────────────────────────────────

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Save Palettes ──────────────────────────────

function savePalette() {
  if (!state.palette.length) return;
  const entry = { id: Date.now(), colors: state.palette.map(c => ({ ...c })), date: new Date().toLocaleDateString() };
  state.savedPalettes.unshift(entry);
  if (state.savedPalettes.length > 30) state.savedPalettes.pop();
  localStorage.setItem('chroma_saved', JSON.stringify(state.savedPalettes));
  renderSaved();
  showToast('Palette saved!');
}

function renderSaved() {
  const grid = document.getElementById('saved-grid');
  if (!state.savedPalettes.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">♥</div><p>No saved palettes yet.<br/>Generate and save palettes to see them here.</p></div>`;
    return;
  }
  grid.innerHTML = state.savedPalettes.map(p => `
    <div class="saved-palette-card" data-id="${p.id}">
      <div class="saved-swatches">
        ${p.colors.map(c => `<div class="saved-swatch" style="background:${c.hex}" title="${c.hex}"></div>`).join('')}
      </div>
      <div class="saved-card-footer">
        <span class="saved-card-date">${p.date}</span>
        <button class="saved-card-del" data-id="${p.id}" title="Delete">✕</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.saved-palette-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.saved-card-del')) return;
      const id = parseInt(card.dataset.id);
      const found = state.savedPalettes.find(p => p.id === id);
      if (found) {
        state.palette = found.colors.map(c => ({ ...c }));
        renderPalette(state.palette);
        switchPanel('generate');
      }
    });
  });

  grid.querySelectorAll('.saved-card-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      state.savedPalettes = state.savedPalettes.filter(p => p.id !== id);
      localStorage.setItem('chroma_saved', JSON.stringify(state.savedPalettes));
      renderSaved();
    });
  });
}

// ── Harmony ───────────────────────────────────

function updateHarmony() {
  const colors = getHarmonyColors(state.harmonyBase, state.harmonyRule);
  renderPalette(colors, 'harmony-palette');
  drawColorWheel();
}

function drawColorWheel() {
  const canvas = document.getElementById('color-wheel');
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let angle = 0; angle < 360; angle++) {
    const startAngle = (angle - 1) * Math.PI / 180;
    const endAngle = (angle + 1) * Math.PI / 180;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, `hsl(${angle}, 0%, 100%)`);
    gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Dark ring
  const darkGrad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
  darkGrad.addColorStop(0, 'transparent');
  darkGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = darkGrad; ctx.fill();

  // Center circle
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = state.harmonyBase; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
}

// ── Gradient ──────────────────────────────────

function updateGradientFromPalette() {
  if (state.palette.length >= 2) {
    state.gradientStops = state.palette.map((c, i) => ({
      color: c.hex,
      pos: Math.round((i / (state.palette.length - 1)) * 100)
    }));
    renderGradientStops();
    updateGradientPreview();
  }
}

function renderGradientStops() {
  const list = document.getElementById('grad-stops');
  list.innerHTML = state.gradientStops.map((s, i) => `
    <div class="stop-row" data-index="${i}">
      <input type="color" class="stop-color-in" value="${s.color}" data-index="${i}" />
      <input type="number" class="stop-pos-in" value="${s.pos}" min="0" max="100" data-index="${i}" placeholder="%" />
      ${state.gradientStops.length > 2 ? `<button class="stop-del" data-index="${i}">✕</button>` : '<div style="width:28px"></div>'}
    </div>
  `).join('');

  list.querySelectorAll('.stop-color-in').forEach(el => {
    el.addEventListener('input', e => {
      state.gradientStops[parseInt(e.target.dataset.index)].color = e.target.value;
      updateGradientPreview();
    });
  });
  list.querySelectorAll('.stop-pos-in').forEach(el => {
    el.addEventListener('input', e => {
      state.gradientStops[parseInt(e.target.dataset.index)].pos = parseInt(e.target.value) || 0;
      updateGradientPreview();
    });
  });
  list.querySelectorAll('.stop-del').forEach(el => {
    el.addEventListener('click', e => {
      state.gradientStops.splice(parseInt(e.target.dataset.index), 1);
      renderGradientStops();
      updateGradientPreview();
    });
  });
}

function buildGradientCSS() {
  const stops = [...state.gradientStops].sort((a, b) => a.pos - b.pos);
  const stopsStr = stops.map(s => `${s.color} ${s.pos}%`).join(', ');
  if (state.gradientType === 'radial') return `radial-gradient(circle, ${stopsStr})`;
  if (state.gradientType === 'conic') return `conic-gradient(from ${state.gradientAngle}deg, ${stopsStr})`;
  return `linear-gradient(${state.gradientAngle}deg, ${stopsStr})`;
}

function updateGradientPreview() {
  const css = buildGradientCSS();
  document.getElementById('gradient-preview').style.background = css;
  document.getElementById('gradient-css-output').textContent = `background: ${css};`;
}

// ── Panel Switching ────────────────────────────

function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`panel-${name}`)?.classList.add('active');
  document.querySelector(`[data-panel="${name}"]`)?.classList.add('active');

  if (name === 'harmony') updateHarmony();
  if (name === 'saved') renderSaved();
  if (name === 'gradient') { renderGradientStops(); updateGradientPreview(); }
}

// ── Init ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Titlebar controls
  document.getElementById('btn-min')?.addEventListener('click', () => window.electronAPI?.minimize());
  document.getElementById('btn-max')?.addEventListener('click', () => window.electronAPI?.maximize());
  document.getElementById('btn-close')?.addEventListener('click', () => window.electronAPI?.close());

  // Nav
  document.querySelectorAll('.nav-item[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  // Generate
  document.getElementById('btn-generate').addEventListener('click', generatePalette);
  document.getElementById('btn-save-palette').addEventListener('click', savePalette);

  // Count buttons
  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.count = parseInt(btn.dataset.count);
      generatePalette();
    });
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      generatePalette();
    });
  });

  // Copy format
  document.querySelectorAll('.copy-fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.copy-fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.copyFmt = btn.dataset.fmt;
    });
  });

  // Export
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!state.palette.length) { showToast('Generate a palette first!'); return; }
      const format = btn.dataset.format;
      if (window.electronAPI) {
        const result = await window.electronAPI.exportPalette({ palette: state.palette, format });
        showToast(result.success ? `Saved to Downloads!` : 'Export failed');
      } else {
        showToast('Export available in desktop app');
      }
    });
  });

  // Harmony picker
  const harmonyPicker = document.getElementById('harmony-picker');
  const harmonyHex = document.getElementById('harmony-hex');

  harmonyPicker.addEventListener('input', e => {
    state.harmonyBase = e.target.value;
    harmonyHex.value = e.target.value.toUpperCase();
    updateHarmony();
  });

  harmonyHex.addEventListener('input', e => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      state.harmonyBase = val;
      harmonyPicker.value = val;
      updateHarmony();
    }
  });

  // Harmony rules
  document.querySelectorAll('.rule-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rule-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.harmonyRule = btn.dataset.rule;
      updateHarmony();
    });
  });

  // Gradient controls
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.gradientType = btn.dataset.gtype;
      updateGradientPreview();
    });
  });

  document.getElementById('angle-slider').addEventListener('input', e => {
    state.gradientAngle = parseInt(e.target.value);
    document.getElementById('angle-val').textContent = `${state.gradientAngle}°`;
    updateGradientPreview();
  });

  document.getElementById('add-stop').addEventListener('click', () => {
    state.gradientStops.push({ color: randomHex(), pos: 50 });
    renderGradientStops();
    updateGradientPreview();
  });

  document.getElementById('copy-gradient-css').addEventListener('click', () => {
    const css = `background: ${buildGradientCSS()};`;
    if (window.electronAPI) window.electronAPI.copyToClipboard(css);
    else navigator.clipboard?.writeText(css);
    showToast('Gradient CSS copied!');
  });

  // Clear saved
  document.getElementById('btn-clear-saved').addEventListener('click', () => {
    state.savedPalettes = [];
    localStorage.setItem('chroma_saved', '[]');
    renderSaved();
  });

  // Spacebar shortcut
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      generatePalette();
    }
  });

  // Initial generation
  generatePalette();
});
