// CodeAlpha Frontend Development Internship | Task 1: Image Gallery

// 1. DATA: 20 photos (5 themes x 4). Nothing to download or add.
const themes = {
  Mountains: "mountain",
  Beach:     "beach",
  Forest:    "forest",
  City:      "city",
  Flowers:   "flowers",
};
const heights = [1000, 600, 800, 560];   // different heights give the staggered look

const photos = [];
Object.entries(themes).forEach(([cat, keyword]) => {
  for (let n = 1; n <= 4; n++) {
    photos.push({ cat, keyword, n, title: `${cat} ${n}`, h: heights[(n + cat.length) % 4] });
  }
});

// main picture, and a backup picture in case the first one fails to load
const thumb  = p => `https://loremflickr.com/800/${p.h}/${p.keyword}?lock=${p.n}`;
const large  = p => `https://loremflickr.com/1600/${p.h * 2}/${p.keyword}?lock=${p.n}`;
const backup = (p, w) => `https://picsum.photos/seed/${p.keyword}${p.n}/${w}/${w === 800 ? p.h : p.h * 2}`;

// 2. ELEMENTS
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
let visible = [], index = 0, lastFocus = null;

// 3. FILTER BUTTONS (built from the categories in the data)
["All", ...Object.keys(themes)].forEach((name, i) => {
  const b = document.createElement("button");
  b.textContent = name;
  b.className = i === 0 ? "active" : "";
  b.addEventListener("click", () => {
    filters.querySelectorAll("button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    render(name);
  });
  filters.appendChild(b);
});

// 4. RENDER THE GRID
function render(cat) {
  visible = cat === "All" ? photos : photos.filter(p => p.cat === cat);
  grid.innerHTML = "";
  visible.forEach((p, i) => {
    const el = document.createElement("button");
    el.className = "item";
    el.style.cssText = `aspect-ratio: 800 / ${p.h}; --i: ${i}`;
    el.setAttribute("aria-label", `Open ${p.title}`);
    el.innerHTML = `<img alt="${p.title}" loading="lazy">
                    <span class="cap">${p.title}<small>${p.cat}</small></span>`;
    const img = el.querySelector("img");
    img.onerror = () => { img.onerror = null; img.src = backup(p, 800); };   // use backup photo
    img.src = thumb(p);
    el.addEventListener("click", () => openBox(i));
    grid.appendChild(el);
  });
}

// 5. LIGHTBOX
function show() {
  const p = visible[index];
  lbImg.classList.add("fade");
  lbImg.onload = () => lbImg.classList.remove("fade");
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = backup(p, 1600); };
  lbImg.src = large(p);
  lbImg.alt = p.title;
  lbCap.textContent = `${p.title}  (${index + 1} of ${visible.length})`;
}
function openBox(i) {
  lastFocus = document.activeElement;
  index = i; show();
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("close").focus();
}
function closeBox() {
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
const step = d => { index = (index + d + visible.length) % visible.length; show(); };

document.getElementById("next").addEventListener("click", () => step(1));
document.getElementById("prev").addEventListener("click", () => step(-1));
document.getElementById("close").addEventListener("click", closeBox);
lb.addEventListener("click", e => { if (e.target === lb) closeBox(); });

document.addEventListener("keydown", e => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeBox();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

// swipe support on phones
let startX = 0;
lb.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
});

render("All");