// Footer year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// Theme toggle (light/dark)
const rootEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeToggleText = document.getElementById("themeToggleText");
const themeIcon = document.getElementById("themeIcon");

function getPreferredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  rootEl.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Tema gelap aktif. Klik untuk tema terang." : "Tema terang aktif. Klik untuk tema gelap."
    );
  }
  if (themeToggleText) {
    themeToggleText.textContent = theme === "dark" ? "Gelap" : "Terang";
  }
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
  }
}

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = rootEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    rootEl.classList.add("theme-transition");
    applyTheme(next);
    localStorage.setItem("theme", next);
    window.setTimeout(() => rootEl.classList.remove("theme-transition"), 180);
  });
}

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

function setNavOpen(isOpen) {
  if (!navToggle || !siteNav) return;
  siteNav.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.contains("open");
    setNavOpen(!isOpen);
  });

  // Close menu when clicking a link (mobile)
  siteNav.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement && target.classList.contains("nav-link")) {
      setNavOpen(false);
    }
  });
}

// Active nav link based on current section
const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"));
const linkById = new Map(
  navLinks
    .map((a) => {
      const hash = a.getAttribute("href") || "";
      if (!hash.startsWith("#")) return null;
      const id = hash.slice(1);
      return id ? [id, a] : null;
    })
    .filter(Boolean)
);

const sections = Array.from(document.querySelectorAll("main section[id]"));

function setActiveNav(id) {
  navLinks.forEach((a) => a.classList.remove("active"));
  const active = linkById.get(id);
  if (active) active.classList.add("active");
}

const headerHeight = Number.parseInt(
  getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
  10
);

function updateActiveFromViewport() {
  if (!sections.length) return;

  const markerY = Number.isFinite(headerHeight) ? headerHeight + 18 : 86;
  let currentId = sections[0]?.id || "";

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= markerY && rect.bottom >= markerY) {
      currentId = section.id;
      break;
    }
  }

  // If we're at the very bottom, ensure last section becomes active
  const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  if (nearBottom) {
    currentId = sections[sections.length - 1].id;
  }

  if (currentId) setActiveNav(currentId);
}

let rafPending = false;
function onScrollOrResize() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    updateActiveFromViewport();
  });
}

window.addEventListener("scroll", onScrollOrResize, { passive: true });
window.addEventListener("resize", onScrollOrResize);
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (id) setActiveNav(id);
});

updateActiveFromViewport();

// If user opens with a hash
if (location.hash) {
  const id = location.hash.slice(1);
  if (id) setActiveNav(id);
}