/* ===============================
   Product data helpers
   - Fetch products once (relative path works on static hosting)
   - Render cards with accessible markup
================================ */

async function getProducts() {
  const res = await fetch("products.json");
  if (!res.ok) throw new Error("Could not load products.json");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items || []);
}

function normalizeImagePath(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return src;
}

// Build a product card HTML snippet
function productCard(p) {
  const payBtn = p.paymentLink
    ? `<a class="btn primary" href="${p.paymentLink}" target="_blank" rel="noreferrer">Buy securely</a>`
    : "";

  const waText = encodeURIComponent(
    `Hi London Labels, I'm interested in: ${p.name} (${p.id}). Is it available?`
  );

  const waBtn = `
    <a class="btn soft"
       href="https://wa.me/447000000000?text=${waText}"
       target="_blank"
       rel="noreferrer">
      Ask on WhatsApp
    </a>
  `;

  return `
    <div class="card reveal">
      <a href="product.html?id=${encodeURIComponent(p.id)}">
        <div class="imgwrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
      </a>

      <div class="body">
        <h4>${p.name}</h4>
        <div class="price">₦${Number(p.price).toFixed(2)}</div>
        ${p.condition ? `<div class="meta">Condition: ${p.condition}</div>` : ""}
        <div class="actions">
          <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
          ${payBtn}
          ${waBtn}
        </div>
      </div>
    </div>
  `;
}

// Render a single category to a grid
async function renderCategory(category, targetId) {
  const products = await getProducts();
  const grid = document.getElementById(targetId);
  if (!grid) return;

  const filtered = products.filter(p => p.category === category);

  grid.innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : `<p class="small">No items in this section yet. Check back soon.</p>`;
}
// Render a category collection (e.g., clothing: new or thrift)
async function renderCollection(category, collection, targetId) {
  const products = await getProducts();
  const grid = document.getElementById(targetId);
  if (!grid) return;

  const filtered = products.filter(
    p => p.category === category && p.collection === collection
  );

  grid.innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : `<p class="small">No items in this section yet. Check back soon.</p>`;
}


// Render the latest N products to a grid
async function renderLatest(targetId, limit = 8) {
  const products = await getProducts();
  const grid = document.getElementById(targetId);
  if (!grid) return;

  const latest = [...products].reverse().slice(0, limit);
  grid.innerHTML = latest.map(productCard).join("");
}

/* ===============================
   Hero video: autoplay + reduced motion
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".titleVideo");
  if (document.body) document.body.classList.add("page-loaded");
  initReveal(); // apply scroll-based animations
  if (!video) return;

  // Respect users who prefer reduced motion by pausing the video
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stopVideo = () => {
    video.pause();
    video.removeAttribute("autoplay");
  };

  if (prefersReduced.matches) {
    stopVideo();
    return;
  }

  video.muted = true;
  video.playsInline = true;

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      // silently fail if browser blocks autoplay
    });
  }

  // If the user toggles the preference while the page is open
  prefersReduced.addEventListener("change", e => {
    if (e.matches) stopVideo();
  });
});

// Scroll reveal: fade/slide in items with .reveal
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) {
    items.forEach(el => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.2});

  items.forEach(el => observer.observe(el));
}
