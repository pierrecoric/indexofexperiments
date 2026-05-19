// ── User-controlled parameters ──────────────────────────────────────────────
let widthFrame      = 90;
let heightWeaving   = 180;

let frames          = ["ox", "xo"];
let warpSequence    = "aaaabbbbccccdddd"; // ↕ vertical
let weftSequence    = "eeeeddddaaaacccc"; // ↔ horizontal

// ── Derived state ─────────────────────────────────────────────────────────
let amountFrames    = frames.length;
let warpSeqLength   = warpSequence.length;
let weftSeqLength   = weftSequence.length;

let cellSize        = 8;
let tail            = 1;
let threadThickness = 3;

// ── Buffers ───────────────────────────────────────────────────────────────
let tileBuffer = null; // one repeating tile, drawn at cellSize resolution
let mainBuffer = null; // full weave (widthFrame × heightWeaving cells)

// ── p5 readiness guard ────────────────────────────────────────────────────
let p5Ready = false;

let weaving = Array.from({ length: heightWeaving }, () =>
    Array(widthFrame).fill('')
);

// ── p5 setup ─────────────────────────────────────────────────────────────
function setup() {
    const interfaceHeight = document.getElementById('weaving-interface').offsetHeight;
    if (isMobile()) {
        // On mobile the canvas fills the full width;
        // height is proportional to the weave aspect ratio
        const cw = windowWidth;
        const ch = Math.round(cw * (heightWeaving / widthFrame));
        let canvas = createCanvas(cw, ch);
        canvas.parent('canvas-area');
    } else {
        let canvas = createCanvas(windowWidth, windowHeight - interfaceHeight - 50);
        canvas.parent('canvas-area');
    }
    p5Ready = true;
    populateArray(); // → drawTile → stampToMainBuffer → renderToCanvas
}

// ── Mobile detection ─────────────────────────────────────────────────────
function isMobile() { return window.innerWidth <= 600; }

// ── Math helpers ──────────────────────────────────────────────────────────
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a / gcd(a, b)) * b; }

// ── Compute the smallest repeating tile size in cells ─────────────────────
function computeTileSize() {
    // Height: rows repeat when both the frame cycle and warp color cycle align
    const tileH = lcm(amountFrames, warpSeqLength);

    // Width: columns repeat when weft color cycle and all frame lengths align
    const frameLengthLCM = frames.reduce((acc, f) => lcm(acc, f.length), 1);
    const tileW = lcm(frameLengthLCM, weftSeqLength);

    return { tileW, tileH };
}

// ── Derived sizing ────────────────────────────────────────────────────────
function deriveCellSize() {
    const interfaceHeight = document.getElementById('weaving-interface').offsetHeight;
    const availableWidth  = windowWidth;
    const availableHeight = windowHeight - interfaceHeight;
    const cellByWidth     = Math.floor(availableWidth  / widthFrame);
    const cellByHeight    = Math.floor(availableHeight / heightWeaving);
    return Math.min(Math.max(Math.min(cellByWidth, cellByHeight), 4), 50);
}

function deriveTail(cs)            { return Math.max(1, Math.round(cs * 0.1));  }
function deriveThreadThickness(cs) { return Math.max(1, Math.round(cs * 0.35)); }

// ── Read UI ───────────────────────────────────────────────────────────────
function getFramesFromUI() {
    return Array.from(document.querySelectorAll('#frames-list .frame-row input[type="text"]'))
        .map(input => input.value.trim().toLowerCase())
        .filter(v => v.length > 0);
}

function getColorsFromUI() {
    const map = {};
    document.querySelectorAll('#colors-grid .color-swatch').forEach(swatch => {
        const label = swatch.querySelector('label');
        const input = swatch.querySelector('input[type="color"]');
        if (label && input) map[label.textContent.trim()] = input.value;
    });
    return map;
}

// ── Populate the weaving array ────────────────────────────────────────────
function populateArray() {
    frames       = getFramesFromUI();
    amountFrames = frames.length;
    if (amountFrames === 0) return;

    weaving = Array.from({ length: heightWeaving }, () =>
        Array(widthFrame).fill('')
    );

    for (let y = 0; y < heightWeaving; y++) {
        const currentFrame = y % amountFrames;
        const len          = frames[currentFrame].length;
        for (let x = 0; x < widthFrame; x++) {
            weaving[y][x] = frames[currentFrame][x % len];
        }
    }

    drawTile();
}

// ── Step 3: Draw one tile into tileBuffer ─────────────────────────────────
function drawTile() {
    if (!p5Ready) return; // called before createCanvas() — skip
    cellSize        = deriveCellSize();
    tail            = deriveTail(cellSize);
    threadThickness = deriveThreadThickness(cellSize);

    const { tileW, tileH } = computeTileSize();
    const colorMap          = getColorsFromUI();

    tileBuffer = createGraphics(tileW * cellSize, tileH * cellSize);
    tileBuffer.background(255);
    tileBuffer.strokeWeight(threadThickness);

    for (let y = 0; y < tileH; y++) {
        for (let x = 0; x < tileW; x++) {
            const weftLetter = weftSequence[x % weftSeqLength];
            const warpLetter = warpSequence[y % warpSeqLength];
            const cell       = weaving[y % heightWeaving][x % widthFrame];
            drawCell(tileBuffer, x, y, cell, weftLetter, warpLetter, colorMap);
        }
    }

    stampToMainBuffer(tileW, tileH);
}

// ── Step 4: Stamp tile across mainBuffer ──────────────────────────────────
function stampToMainBuffer(tileW, tileH) {
    const mainW = widthFrame  * cellSize;
    const mainH = heightWeaving * cellSize;

    mainBuffer = createGraphics(mainW, mainH);
    mainBuffer.background(255);

    const tilePixW = tileW * cellSize;
    const tilePixH = tileH * cellSize;

    for (let py = 0; py < mainH; py += tilePixH) {
        for (let px = 0; px < mainW; px += tilePixW) {
            mainBuffer.image(tileBuffer, px, py);
        }
    }

    renderToCanvas();
}

// ── Step 5: Scale mainBuffer to fit the canvas ────────────────────────────
function renderToCanvas() {
    background(241, 252, 255);

    if (!mainBuffer) return;

    const canvasW = width;
    const canvasH = height;
    const mainW   = mainBuffer.width;
    const mainH   = mainBuffer.height;

    // Fit inside the canvas, preserving aspect ratio
    const scale   = Math.min(canvasW / mainW, canvasH / mainH);
    const drawW   = mainW * scale;
    const drawH   = mainH * scale;

    // Center it
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    image(mainBuffer, offsetX, offsetY, drawW, drawH);
}

// ── Draw a single cell into a given graphics context ─────────────────────
function drawCell(g, x, y, cell, weftLetter, warpLetter, colorMap) {
    const cs = cellSize;
    const px = x * cs;
    const py = y * cs;

    if (cell === 'o') {
        // weft thread (vertical) on top
        bufferStroke(g, weftLetter, colorMap);
        g.line(px + cs / 2, py,          px + cs / 2, py + cs);

        bufferStroke(g, warpLetter, colorMap);
        g.line(px,          py + cs / 2, px + tail,   py + cs / 2);
        g.line(px + cs - tail, py + cs / 2, px + cs,  py + cs / 2);
    } else {
        // warp thread (horizontal) on top
        bufferStroke(g, warpLetter, colorMap);
        g.line(px,          py + cs / 2, px + cs,     py + cs / 2);

        bufferStroke(g, weftLetter, colorMap);
        g.line(px + cs / 2, py,          px + cs / 2, py + tail);
        g.line(px + cs / 2, py + cs - tail, px + cs / 2, py + cs);
    }
}

// ── Color switcher for a graphics buffer ─────────────────────────────────
function bufferStroke(g, letter, colorMap) {
    const hex = colorMap[letter];
    g.stroke(hex !== undefined ? hex : '#000000');
}

// ── Mirror helper ─────────────────────────────────────────────────────────
function mirrorSequence(seq) {
    return seq + seq.split('').reverse().join('');
}

// ── Read all values from UI and rebuild everything ────────────────────────
function change() {
    widthFrame    = parseInt(document.getElementById("weft-width").value, 10);
    heightWeaving = parseInt(document.getElementById("warp-length").value, 10);

    const rawWarp = document.getElementById("warp-color-sequence").value.replace(/\s/g, '');
    const rawWeft = document.getElementById("weft-color-sequence").value.replace(/\s/g, '');

    warpSequence  = document.getElementById("warp-mirror").checked ? mirrorSequence(rawWarp) : rawWarp;
    weftSequence  = document.getElementById("weft-mirror").checked ? mirrorSequence(rawWeft) : rawWeft;
    warpSeqLength = warpSequence.length;
    weftSeqLength = weftSequence.length;

    populateArray();
}

// ── Color change: only needs tile redraw (no array rebuild) ───────────────
function colorChange() {
    drawTile();
}

// ── Wire up static inputs ─────────────────────────────────────────────────
["weft-width", "warp-length",
 "warp-color-sequence", "weft-color-sequence",
 "warp-mirror", "weft-mirror"
].forEach(id => {
    document.getElementById(id).addEventListener("input", change);
});

document.getElementById('frames-list').addEventListener('input', populateArray);
document.getElementById('colors-grid').addEventListener('input', colorChange);

// ── Add / remove frame rows ───────────────────────────────────────────────
document.getElementById('add-frame').addEventListener('click', () => {
    const list = document.getElementById('frames-list');
    const row  = document.createElement('div');
    row.className = 'frame-row';
    row.innerHTML = `<input type="text" value=""><button class="button small">-</button>`;
    row.querySelector('button').addEventListener('click', () => {
        row.remove();
        populateArray();
    });
    list.appendChild(row);
    populateArray();
});

document.querySelectorAll('.frame-row .button').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.frame-row').remove();
        populateArray();
    });
});

// ── Hide / show controls ──────────────────────────────────────────────────
const iface       = document.getElementById('weaving-interface');
const colControls = document.getElementById('col-controls');
const colShow     = document.getElementById('col-show');

function setInterfaceVisible(visible) {
    iface.querySelectorAll('.col').forEach(c => {
        c.style.display = visible ? '' : 'none';
    });
    colShow.style.display = visible ? 'none' : 'flex';
    iface.classList.toggle('collapsed', !visible);
    if (!isMobile()) {
        const interfaceHeight = document.getElementById('weaving-interface').offsetHeight;
        resizeCanvas(windowWidth, windowHeight - interfaceHeight - 50);
    }
    renderToCanvas();
}

document.getElementById('btn-hide').addEventListener('click', () => setInterfaceVisible(false));
document.getElementById('btn-show').addEventListener('click', () => setInterfaceVisible(true));

// ── Save PNG ──────────────────────────────────────────────────────────────
document.getElementById('btn-save-png').addEventListener('click', () => {
    if (mainBuffer) {
        save(mainBuffer, 'weaving.png');
    } else {
        saveCanvas('weaving', 'png');
    }
});

// ── Add color swatch ──────────────────────────────────────────────────────
let colorIndex     = 5;
const colorLetters = 'abcdefghijklmnopqrstuvwxyz';

document.getElementById('add-color').addEventListener('click', () => {
    if (colorIndex >= colorLetters.length) return;
    const letter = colorLetters[colorIndex++];
    const grid   = document.getElementById('colors-grid');
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.innerHTML = `
        <input type="color" id="color${letter.toUpperCase()}" value="#888888">
        <label for="color${letter.toUpperCase()}">${letter}</label>
    `;
    grid.appendChild(swatch);
});

// ── Export: one SVG per color, pen-plotter optimised ─────────────────────

document.getElementById('btn-export').addEventListener('click', exportSVGs);

function exportSVGs() {
    const colorMap = getColorsFromUI();
    const segments = collectSegmentsByColor(colorMap);
    const svgW     = widthFrame    * cellSize;
    const svgH     = heightWeaving * cellSize;

    for (const [letter, segs] of Object.entries(segments)) {
        if (segs.length === 0) continue;
        const sorted = nearestNeighbourSort(segs);
        const hex    = colorMap[letter] || '#000000';
        const svgStr = buildSVG(sorted, hex, svgW, svgH);
        downloadSVG(svgStr, `weaving-${letter}.svg`);
    }
}

// ── Step 1: Walk the weave, collect top-thread segments by color letter ───
// Each segment: { x1, y1, x2, y2 } in pixels.
function collectSegmentsByColor(colorMap) {
    const buckets = {};
    for (const letter of Object.keys(colorMap)) buckets[letter] = [];

    for (let y = 0; y < heightWeaving; y++) {
        for (let x = 0; x < widthFrame; x++) {
            const weftLetter = weftSequence[x % weftSeqLength];
            const warpLetter = warpSequence[y % warpSeqLength];
            const cell       = weaving[y][x];
            const cs         = cellSize;
            const px         = x * cs;
            const py         = y * cs;

            if (cell === 'o') {
                // weft thread on top — full vertical segment
                pushSeg(buckets, weftLetter,
                    px + cs / 2, py,
                    px + cs / 2, py + cs);
            } else {
                // warp thread on top — full horizontal segment
                pushSeg(buckets, warpLetter,
                    px,      py + cs / 2,
                    px + cs, py + cs / 2);
            }
        }
    }

    return buckets;
}

function pushSeg(buckets, letter, x1, y1, x2, y2) {
    if (!buckets[letter]) buckets[letter] = [];
    buckets[letter].push({ x1, y1, x2, y2 });
}

// ── Step 2: Nearest-neighbour sort to minimise pen travel ─────────────────
// Greedy: always move to the closest unvisited segment.
// Also tests reversing each segment in case its far end is nearer.
function nearestNeighbourSort(segs) {
    const remaining = segs.slice();
    const sorted    = [];
    let curX = 0;
    let curY = 0;

    while (remaining.length > 0) {
        let bestIdx  = 0;
        let bestDist = Infinity;
        let bestFlip = false;

        for (let i = 0; i < remaining.length; i++) {
            const s     = remaining[i];
            const dHead = dist2(curX, curY, s.x1, s.y1);
            const dTail = dist2(curX, curY, s.x2, s.y2);

            if (dHead < bestDist) { bestDist = dHead; bestIdx = i; bestFlip = false; }
            if (dTail < bestDist) { bestDist = dTail; bestIdx = i; bestFlip = true;  }
        }

        const chosen = remaining.splice(bestIdx, 1)[0];
        sorted.push(bestFlip
            ? { x1: chosen.x2, y1: chosen.y2, x2: chosen.x1, y2: chosen.y1 }
            : chosen
        );

        const last = sorted[sorted.length - 1];
        curX = last.x2;
        curY = last.y2;
    }

    return sorted;
}

// Squared distance — avoids sqrt, sufficient for comparisons
function dist2(ax, ay, bx, by) {
    return (bx - ax) ** 2 + (by - ay) ** 2;
}

// ── Step 3: Build SVG string ──────────────────────────────────────────────
function buildSVG(segments, hex, svgW, svgH) {
    const lines = segments.map(s =>
        `  <line x1="${r(s.x1)}" y1="${r(s.y1)}" x2="${r(s.x2)}" y2="${r(s.y2)}"/>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${svgW} ${svgH}"
     width="${svgW}mm" height="${svgH}mm">
  <g stroke="${hex}"
     stroke-width="${threadThickness}"
     stroke-linecap="round"
     fill="none">
${lines}
  </g>
</svg>`;
}

// Round to 2 decimal places to keep file sizes reasonable
function r(n) { return Math.round(n * 100) / 100; }

// ── Step 4: Trigger download ──────────────────────────────────────────────
function downloadSVG(svgStr, filename) {
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Resize: only re-render, no need to rebuild buffers ───────────────────
function windowResized() {
    if (isMobile()) {
        const cw = windowWidth;
        const ch = Math.round(cw * (heightWeaving / widthFrame));
        resizeCanvas(cw, ch);
    } else {
        const interfaceHeight = document.getElementById('weaving-interface').offsetHeight;
        resizeCanvas(windowWidth, windowHeight - interfaceHeight - 50);
    }
    renderToCanvas();
}

// ── URL share ─────────────────────────────────────────────────────────────

document.getElementById('btn-share').addEventListener('click', saveToURL);

// Serialize all parameters → base64 hash → clipboard
function saveToURL() {
    const state = {
        widthFrame,
        heightWeaving,
        frames: getFramesFromUI(),
        warpSequence: document.getElementById("warp-color-sequence").value.replace(/\s/g, ''),
        weftSequence: document.getElementById("weft-color-sequence").value.replace(/\s/g, ''),
        warpMirror:   document.getElementById("warp-mirror").checked,
        weftMirror:   document.getElementById("weft-mirror").checked,
        colors:       Object.entries(getColorsFromUI()).map(([letter, hex]) => ({ letter, hex })),
    };

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    const url     = `${location.origin}${location.pathname}#${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('btn-share');
        const prev = btn.textContent;
        btn.textContent = 'copied!';
        setTimeout(() => { btn.textContent = prev; }, 1500);
    });
}

// On load: if a hash is present, decode and populate the UI
function loadFromURL() {
    const hash = window.location.hash.slice(1); // strip leading #
    if (!hash) return;

    let state;
    try {
        state = JSON.parse(decodeURIComponent(escape(atob(hash))));
    } catch (e) {
        console.warn('Could not parse URL state:', e);
        return;
    }

    // Numeric fields
    if (state.widthFrame)    document.getElementById('weft-width').value   = state.widthFrame;
    if (state.heightWeaving) document.getElementById('warp-length').value  = state.heightWeaving;

    // Sequences
    if (state.warpSequence !== undefined)
        document.getElementById('warp-color-sequence').value = state.warpSequence;
    if (state.weftSequence !== undefined)
        document.getElementById('weft-color-sequence').value = state.weftSequence;

    // Mirror checkboxes
    if (state.warpMirror !== undefined)
        document.getElementById('warp-mirror').checked = state.warpMirror;
    if (state.weftMirror !== undefined)
        document.getElementById('weft-mirror').checked = state.weftMirror;

    // Frames — clear existing rows, rebuild from state
    if (Array.isArray(state.frames)) {
        const list = document.getElementById('frames-list');
        list.innerHTML = '';
        state.frames.forEach(val => {
            const row = document.createElement('div');
            row.className = 'frame-row';
            row.innerHTML = `<input type="text" value="${val}"><button class="button small">-</button>`;
            row.querySelector('button').addEventListener('click', () => {
                row.remove();
                populateArray();
            });
            list.appendChild(row);
        });
    }

    // Colors — clear existing swatches, rebuild from state
    if (Array.isArray(state.colors)) {
        const grid = document.getElementById('colors-grid');
        grid.innerHTML = '';
        colorIndex = 0;
        state.colors.forEach(({ letter, hex }) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.innerHTML = `
                <input type="color" id="color${letter.toUpperCase()}" value="${hex}">
                <label for="color${letter.toUpperCase()}">${letter}</label>
            `;
            grid.appendChild(swatch);
            colorIndex++;
        });
    }

    // Sync DOM → JS variables so setup() uses the loaded values, not the hardcoded defaults.
    // drawTile() inside change() → populateArray() will return early because p5Ready is false.
    change();
}

// Run on page load — must be called before p5's setup() reads the UI,
// so we call it here at the bottom of the script (synchronous, before p5 init).
loadFromURL();