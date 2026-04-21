const pages = Array.from(document.querySelectorAll('.page'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNum = document.getElementById('pageNum');
const pageTotal = document.getElementById('pageTotal');
const bookmarks = Array.from(document.querySelectorAll('.bookmark'));
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbPdf = document.getElementById('lbPdf');
const lbClose = document.getElementById('lbClose');

let current = 0;
pageTotal.textContent = pages.length;

function updateBookmarks() {
    const year = pages[current].dataset.year;
    bookmarks.forEach(bm => {
        bm.classList.toggle('active', bm.dataset.year === year);
    });
}

function goTo(index) {
    if (index < 0 || index >= pages.length || index === current) return;
    pages[current].classList.remove('active');
    pages[current].classList.add('exit-left');
    const prev = current;
    current = index;
    pages[current].classList.add('active');
    setTimeout(() => pages[prev].classList.remove('exit-left'), 600);
    pageNum.textContent = current + 1;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pages.length - 1;
    updateBookmarks();
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

bookmarks.forEach(bm => {
    bm.addEventListener('click', () => {
        const year = bm.dataset.year;
        const idx = pages.findIndex(p => p.dataset.year === year);
        if (idx !== -1) goTo(idx);
    });
});

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
    if (e.key === 'Escape') closeLightbox();
});

// Lightbox – photos
document.querySelectorAll('.photo img').forEach(img => {
    img.addEventListener('click', e => {
        e.stopPropagation();
        lbImg.src = img.src;
        lbImg.classList.remove('hidden');
        lbPdf.classList.add('hidden');
        lbPdf.data = '';
        lightbox.classList.remove('hidden');
    });
});

// Lightbox – PDF
const pdfWrapper = document.getElementById('pdfWrapper');
if (pdfWrapper) {
    pdfWrapper.addEventListener('click', e => {
        e.stopPropagation();
        lbPdf.data = document.getElementById('pdfFrame').data;
        lbPdf.classList.remove('hidden');
        lbImg.classList.add('hidden');
        lbImg.src = '';
        lightbox.classList.remove('hidden');
    });
}

function closeLightbox() {
    lightbox.classList.add('hidden');
    lbImg.src = '';
    lbImg.classList.remove('hidden');
    lbPdf.data = '';
    lbPdf.classList.add('hidden');
}
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

// Init state
prevBtn.disabled = true;
updateBookmarks();

/* ── Size Editor ── */
const SIZES = [
    { key: 'landscape',  label: 'Landscape',  w: 16, h: 9  },
    { key: 'portrait',   label: 'Portrait',   w: 3,  h: 4  },
    { key: 'square',     label: 'Square',     w: 1,  h: 1  },
    { key: 'wide',       label: 'Wide',       w: 21, h: 8  },
    { key: 'panoramic',  label: 'Panoramic',  w: 3,  h: 1  },
    { key: 'hero',       label: 'Hero',       w: 2,  h: 3  },
    { key: 'small',      label: 'Small',      w: 5,  h: 4  },
    { key: 'thumb',      label: 'Thumb',      w: 4,  h: 3  },
];

const DEFAULTS = SIZES.map(s => ({ ...s }));

// Inject a <style> tag we'll update dynamically
const sizeStyle = document.createElement('style');
document.head.appendChild(sizeStyle);

function applySize(key, w, h) {
    const rules = SIZES.map(s =>
        `.size-${s.key} { aspect-ratio: ${s.w} / ${s.h}; }`
    ).join('\n');
    // Replace just the one that changed
    const entry = SIZES.find(s => s.key === key);
    if (entry) { entry.w = w; entry.h = h; }
    sizeStyle.textContent = SIZES.map(s =>
        `.size-${s.key} { aspect-ratio: ${s.w} / ${s.h}; }`
    ).join('\n');
}

// Apply initial values from SIZES
sizeStyle.textContent = SIZES.map(s =>
    `.size-${s.key} { aspect-ratio: ${s.w} / ${s.h}; }`
).join('\n');

// Build controls
const container = document.getElementById('sizeControls');
SIZES.forEach((size, i) => {
    const ratio = (size.w / size.h).toFixed(2);

    const row = document.createElement('div');
    row.className = 'size-row';
    row.innerHTML = `
        <div class="size-row-label">
            ${size.label}
            <span class="size-preview-tag" id="tag-${size.key}">${size.w}:${size.h}</span>
        </div>
        <div class="slider-group">
            <span class="slider-axis">W</span>
            <input type="range" class="size-slider" id="w-${size.key}"
                min="1" max="32" step="1" value="${size.w}">
            <span class="slider-val" id="wv-${size.key}">${size.w}</span>
        </div>
        <div class="slider-group">
            <span class="slider-axis">H</span>
            <input type="range" class="size-slider" id="h-${size.key}"
                min="1" max="32" step="1" value="${size.h}">
            <span class="slider-val" id="hv-${size.key}">${size.h}</span>
        </div>
        ${i < SIZES.length - 1 ? '<hr class="size-divider">' : ''}
    `;
    container.appendChild(row);

    const wSlider = document.getElementById(`w-${size.key}`);
    const hSlider = document.getElementById(`h-${size.key}`);
    const wVal    = document.getElementById(`wv-${size.key}`);
    const hVal    = document.getElementById(`hv-${size.key}`);
    const tag     = document.getElementById(`tag-${size.key}`);

    function update() {
        const w = parseInt(wSlider.value);
        const h = parseInt(hSlider.value);
        wVal.textContent = w;
        hVal.textContent = h;
        tag.textContent = `${w}:${h}`;
        applySize(size.key, w, h);
    }

    wSlider.addEventListener('input', update);
    hSlider.addEventListener('input', update);
});

// Toggle open/close
const editorPanel = document.getElementById('sizeEditor');
document.getElementById('editorToggle').addEventListener('click', () => {
    editorPanel.classList.toggle('collapsed');
});

// Reset defaults
document.getElementById('resetSizes').addEventListener('click', () => {
    DEFAULTS.forEach(def => {
        const wSlider = document.getElementById(`w-${def.key}`);
        const hSlider = document.getElementById(`h-${def.key}`);
        wSlider.value = def.w;
        hSlider.value = def.h;
        document.getElementById(`wv-${def.key}`).textContent = def.w;
        document.getElementById(`hv-${def.key}`).textContent = def.h;
        document.getElementById(`tag-${def.key}`).textContent = `${def.w}:${def.h}`;
        applySize(def.key, def.w, def.h);
    });
    // re-sync SIZES array
    DEFAULTS.forEach(def => {
        const entry = SIZES.find(s => s.key === def.key);
        entry.w = def.w; entry.h = def.h;
    });
    sizeStyle.textContent = SIZES.map(s =>
        `.size-${s.key} { aspect-ratio: ${s.w} / ${s.h}; }`
    ).join('\n');
});

// Copy CSS
const toast = document.getElementById('copyToast');
document.getElementById('copySizes').addEventListener('click', () => {
    const css = SIZES.map(s =>
        `.size-${s.key} { width: 100%; aspect-ratio: ${s.w} / ${s.h}; }`
    ).join('\n');
    navigator.clipboard.writeText(css).then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
});
