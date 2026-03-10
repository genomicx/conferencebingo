/* Conference Bingo - Application Logic */
const BingoApp = (() => {
  const $ = (id) => document.getElementById(id);

  // --- State ---
  let currentMode = 'conference';
  let currentSeed = '';
  let checkedCells = new Set();
  let cardItems = [];
  let customItems = null;
  let hasBingo = false;

  // --- LocalStorage helpers ---
  function storageKey() {
    return 'bingo-' + currentMode + '-' + currentPreset + '-' + currentSeed;
  }

  function saveCheckedState() {
    if (!currentSeed) return;
    localStorage.setItem(storageKey(), JSON.stringify([...checkedCells]));
  }

  function loadCheckedState() {
    if (!currentSeed) return;
    const saved = localStorage.getItem(storageKey());
    if (saved) {
      try {
        checkedCells = new Set(JSON.parse(saved));
      } catch (e) {
        checkedCells = new Set();
      }
    }
  }

  function clearCheckedState() {
    if (!currentSeed) return;
    localStorage.removeItem(storageKey());
  }

  // --- Conference Presets (loaded from /presets/*.json) ---
  const PRESETS = {};
  let currentPreset = 'generic';

  async function loadPresets() {
    try {
      const indexRes = await fetch('presets/index.json');
      const presetIds = await indexRes.json();
      await Promise.all(presetIds.map(async (id) => {
        const res = await fetch('presets/' + id + '.json');
        PRESETS[id] = await res.json();
      }));
    } catch (e) {
      console.error('Failed to load presets:', e);
    }
  }

  // --- Seeded PRNG ---
  function hashSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function() {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(array, rng) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // --- Seed Generation (dictionary words) ---
  const SEED_WORDS = [
    'AMBER','APPLE','ATLAS','BADGE','BEACH','BLAZE','BLOOM','BRAVE','BRICK',
    'BRISK','BROOK','CAMEL','CANDY','CEDAR','CHARM','CHESS','CHIEF','CHIMP',
    'CLIFF','CLOUD','CLOWN','COBRA','CORAL','COMET','CRANE','CRISP','CROWN',
    'DANCE','DELTA','DINGO','DRAKE','DREAM','DRIFT','EAGLE','EMBER','FABLE',
    'FAIRY','FLAME','FLASK','FLINT','FLORA','FORGE','FROST','GHOST','GIANT',
    'GLEAM','GLOBE','GRAPE','GROVE','GUARD','GUAVA','GUSTY','HAVEN','HAZEL',
    'HERON','HONEY','HORSE','IVORY','JEWEL','JOLLY','KARMA','KAYAK','KIOSK',
    'KNIFE','KOALA','LATCH','LEMON','LILAC','LLAMA','LUCKY','LUNAR','LYRIC',
    'MAGIC','MANGO','MAPLE','MARSH','MEDAL','MELON','MIRTH','MOOSE','MOUNT',
    'NOBLE','NORTH','NOVEL','OCEAN','OLIVE','OMEGA','ONION','ORBIT','OTTER',
    'OZONE','PANDA','PEACH','PEARL','PERCH','PILOT','PIXEL','PLAID','PLUME',
    'POLAR','PRISM','PULSE','QUAIL','QUEEN','QUEST','QUIET','QUIRK','QUOTA',
    'RADAR','RAVEN','RIDGE','RIVER','ROBIN','ROCKY','ROVER','ROYAL','RUSTY',
    'SCOUT','SHARK','SHELL','SHINE','SLOTH','SNOWY','SOLAR','SONIC','SPARK',
    'SPICE','SPIKE','SQUID','STEAM','STEEL','STONE','STORM','STORK','SUGAR',
    'SWIFT','TANGO','TIGER','TITAN','TOPAZ','TORCH','TROUT','TULIP','ULTRA',
    'UMBRA','UNITE','UPPER','VAPOR','VAULT','VENOM','VIGOR','VIOLA','VIVID',
    'WALTZ','WHALE','WHEAT','WINDS','WITTY','WOODY','XENON','YACHT','ZEBRA',
  ];

  function generateRandomSeed() {
    return SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
  }

  // --- Card Generation ---
  function getActiveItems() {
    if (customItems) return customItems;
    return (PRESETS[currentPreset] || PRESETS.generic).items;
  }

  function generateConferenceCard(seed) {
    const pool = getActiveItems();
    if (pool.length < 24) {
      showAlert('custom-status', 'warning', `Need at least 24 items. Found ${pool.length}.`);
      return null;
    }
    const rng = mulberry32(hashSeed(seed));
    const shuffled = seededShuffle(pool, rng);
    const selected = shuffled.slice(0, 24);
    selected.splice(12, 0, 'FREE');
    return selected;
  }

  function generateNumberCard(seed) {
    const rng = mulberry32(hashSeed(seed));
    const ranges = [[1, 15], [16, 30], [31, 45], [46, 60], [61, 75]];
    const columns = ranges.map(([min, max]) => {
      const pool = [];
      for (let n = min; n <= max; n++) pool.push(n);
      return seededShuffle(pool, rng).slice(0, 5);
    });
    const items = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        items.push(columns[col][row]);
      }
    }
    items[12] = 'FREE';
    return items;
  }

  // --- Bingo Detection ---
  const WINNING_LINES = [
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
    [0,6,12,18,24], [4,8,12,16,20],
  ];

  function checkBingo() {
    const checked = new Set(checkedCells);
    checked.add(12);
    for (const line of WINNING_LINES) {
      if (line.every(i => checked.has(i))) return line;
    }
    return null;
  }

  // --- UI Rendering ---
  function renderCard() {
    const grid = $('bingo-grid');
    grid.innerHTML = '';

    if (currentMode === 'number') {
      grid.classList.add('has-headers');
      'BINGO'.split('').forEach(letter => {
        const cell = document.createElement('div');
        cell.className = 'bingo-header-cell';
        cell.textContent = letter;
        grid.appendChild(cell);
      });
    } else {
      grid.classList.remove('has-headers');
    }

    cardItems.forEach((item, i) => {
      const cell = document.createElement('div');
      cell.className = 'bingo-cell';
      if (currentMode === 'number' && i !== 12) cell.classList.add('number-mode');

      if (i === 12) {
        cell.classList.add('free-space', 'checked');
        cell.textContent = 'FREE SPACE';
      } else {
        cell.textContent = String(item);
        if (checkedCells.has(i)) cell.classList.add('checked');
        cell.addEventListener('click', () => toggleCell(i));
      }

      grid.appendChild(cell);
    });

    updateBingoStatus();
  }

  function toggleCell(index) {
    if (checkedCells.has(index)) {
      checkedCells.delete(index);
    } else {
      checkedCells.add(index);
    }
    saveCheckedState();
    renderCard();
  }

  function updateBingoStatus() {
    const winLine = checkBingo();
    const banner = $('bingo-banner');

    if (winLine) {
      if (!hasBingo) {
        hasBingo = true;
        banner.style.display = 'block';
      }
      const cells = $('bingo-grid').querySelectorAll('.bingo-cell');
      winLine.forEach(i => {
        if (cells[i]) cells[i].classList.add('winning');
      });
    } else {
      hasBingo = false;
      banner.style.display = 'none';
    }
  }

  // --- Card Management ---
  function generateCard(fresh) {
    const seedInput = $('seed-input');
    currentSeed = seedInput.value.trim().toUpperCase() || generateRandomSeed();
    seedInput.value = currentSeed;

    hasBingo = false;

    if (fresh) {
      clearCheckedState();
      checkedCells = new Set();
    } else {
      checkedCells = new Set();
      loadCheckedState();
    }

    cardItems = currentMode === 'conference'
      ? generateConferenceCard(currentSeed)
      : generateNumberCard(currentSeed);

    if (cardItems) {
      renderCard();
      $('seed-code').textContent = currentSeed;
      updateURL();
      $('card-section').style.display = 'block';
    }
  }

  function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('seed', currentSeed);
    url.searchParams.set('mode', currentMode);
    if (currentMode === 'conference' && currentPreset !== 'generic') {
      url.searchParams.set('preset', currentPreset);
    } else {
      url.searchParams.delete('preset');
    }
    window.history.replaceState({}, '', url);
  }

  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    const mode = params.get('mode');
    const preset = params.get('preset');
    if (mode === 'number' || mode === 'conference') {
      currentMode = mode;
      document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === currentMode);
      });
      $('custom-section').style.display = currentMode === 'conference' ? 'block' : 'none';
    }
    if (preset && PRESETS[preset]) {
      currentPreset = preset;
      $('preset-select').value = preset;
    }
    if (seed) {
      $('seed-input').value = seed;
      generateCard();
    }
  }

  // --- Custom Items ---
  function handleCustomFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      $('custom-textarea').value = e.target.result;
      parseCustomItems(e.target.result);
    };
    reader.readAsText(file);
  }

  function parseCustomItems(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 24) {
      showAlert('custom-status', 'warning', `Need at least 24 items. Found ${lines.length}.`);
      return;
    }
    customItems = lines;
    showAlert('custom-status', 'info', `Loaded ${lines.length} custom items. Generate a card to use them.`);
  }

  function resetToDefaults() {
    customItems = null;
    $('custom-textarea').value = '';
    $('custom-status').innerHTML = '';
    $('preset-select').value = currentPreset;
  }

  function showAlert(targetId, type, message) {
    const icon = type === 'warning'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    $(targetId).innerHTML = `<div class="alert alert-${type}">${icon}<span>${message}</span></div>`;
  }

  // --- PDF Export ---
  function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const gridW = pageW - margin * 2;
    const cellW = gridW / 5;
    const cellH = currentMode === 'conference' ? 28 : 24;
    let startY = 50;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = currentMode === 'conference' ? 'Conference Bingo' : 'Number Bingo';
    doc.text(title, pageW / 2, 25, { align: 'center' });

    // Seed
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Seed: ' + currentSeed, pageW / 2, 35, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // B-I-N-G-O headers for number mode
    if (currentMode === 'number') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      'BINGO'.split('').forEach((letter, col) => {
        const x = margin + col * cellW;
        doc.setFillColor(13, 148, 136);
        doc.rect(x, startY, cellW, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(letter, x + cellW / 2, startY + 9, { align: 'center' });
      });
      startY += 14;
      doc.setTextColor(0, 0, 0);
    }

    // Draw cells
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const i = row * 5 + col;
        const x = margin + col * cellW;
        const y = startY + row * cellH;

        // Cell background
        if (i === 12) {
          doc.setFillColor(13, 148, 136);
          doc.rect(x, y, cellW, cellH, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('FREE', x + cellW / 2, y + cellH / 2 - 1, { align: 'center' });
          doc.text('SPACE', x + cellW / 2, y + cellH / 2 + 4, { align: 'center' });
        } else if (checkedCells.has(i)) {
          doc.setFillColor(209, 250, 229);
          doc.rect(x, y, cellW, cellH, 'FD');
          doc.setTextColor(13, 148, 136);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(x, y, cellW, cellH, 'FD');
          doc.setTextColor(51, 65, 85);
        }

        // Cell text
        if (i !== 12) {
          const text = String(cardItems[i]);
          if (currentMode === 'number') {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(text, x + cellW / 2, y + cellH / 2 + 2, { align: 'center' });
          } else {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(text, cellW - 4);
            const lineH = 3.2;
            const totalH = lines.length * lineH;
            const textY = y + (cellH - totalH) / 2 + lineH;
            lines.forEach((line, li) => {
              doc.text(line, x + cellW / 2, textY + li * lineH, { align: 'center' });
            });
          }
        }

        // Cell border
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, cellW, cellH);
        doc.setTextColor(0, 0, 0);
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text('conferencebingo.vercel.app', pageW / 2, pageH - 10, { align: 'center' });

    const prefix = currentMode === 'conference'
      ? (currentPreset !== 'generic' ? currentPreset : 'conference')
      : 'number';
    doc.save('bingo-' + prefix + '-' + currentSeed + '.pdf');
  }

  // --- Share ---
  function copyShareURL() {
    const url = new URL(window.location);
    url.searchParams.set('seed', currentSeed);
    url.searchParams.set('mode', currentMode);
    if (currentMode === 'conference' && currentPreset !== 'generic') {
      url.searchParams.set('preset', currentPreset);
    } else {
      url.searchParams.delete('preset');
    }
    navigator.clipboard.writeText(url.toString()).then(() => {
      const btn = $('share-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-2px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share';
      }, 2000);
    });
  }

  function copySeed() {
    navigator.clipboard.writeText(currentSeed).then(() => {
      const el = $('seed-code');
      const orig = el.textContent;
      el.textContent = 'Copied!';
      setTimeout(() => { el.textContent = orig; }, 1500);
    });
  }

  // --- Init ---
  async function init() {
    // Load presets from JSON files
    await loadPresets();

    // Populate preset dropdown
    const presetSelect = $('preset-select');
    Object.entries(PRESETS).forEach(([key, preset]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = preset.name + ' (' + preset.items.length + ' items)';
      presetSelect.appendChild(opt);
    });
    presetSelect.addEventListener('change', () => {
      currentPreset = presetSelect.value;
      customItems = null;
      $('custom-textarea').value = '';
      $('custom-status').innerHTML = '';
      $('card-section').style.display = 'none';
    });

    // Mode tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;
        $('custom-section').style.display = currentMode === 'conference' ? 'block' : 'none';
        $('card-section').style.display = 'none';
      });
    });

    // Generate
    $('generate-btn').addEventListener('click', generateCard);
    $('random-seed-btn').addEventListener('click', () => {
      $('seed-input').value = generateRandomSeed();
      generateCard(true);
    });
    $('seed-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') generateCard();
    });

    // Card actions
    $('export-pdf-btn').addEventListener('click', exportPDF);
    $('share-btn').addEventListener('click', copyShareURL);
    $('seed-display').addEventListener('click', copySeed);
    $('reset-btn').addEventListener('click', () => {
      checkedCells = new Set();
      hasBingo = false;
      saveCheckedState();
      renderCard();
    });
    $('new-card-btn').addEventListener('click', () => {
      $('seed-input').value = generateRandomSeed();
      generateCard(true);
    });

    // Custom items toggle
    $('custom-toggle-btn').addEventListener('click', () => {
      $('custom-toggle-btn').classList.toggle('open');
      $('custom-body').classList.toggle('open');
    });

    // Custom items actions
    $('use-custom-btn').addEventListener('click', () => {
      parseCustomItems($('custom-textarea').value);
    });
    $('reset-custom-btn').addEventListener('click', resetToDefaults);

    // File drop
    const drop = $('custom-drop');
    const fileInput = $('custom-file-input');
    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleCustomFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) handleCustomFile(fileInput.files[0]);
    });

    // Init nav and theme from genomicx.js
    if (window.GenomicX) {
      GenomicX.initNav();
      GenomicX.initTheme();
    }

    // Load from URL
    loadFromURL();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { generateCard, exportPDF };
})();
