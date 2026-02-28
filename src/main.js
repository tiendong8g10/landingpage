import "./style.css";
import { siteContent } from "./data/content.js";

let activeDocumentHandler = null;

export function buildLightboxState(totalImages) {
  return {
    next(currentIndex) {
      return (currentIndex + 1) % totalImages;
    },
    prev(currentIndex) {
      return (currentIndex - 1 + totalImages) % totalImages;
    },
  };
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitizeHref(href) {
  if (!href) {
    return "";
  }

  try {
    const parsed = new URL(href, window.location.origin);
    const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
    return allowedProtocols.has(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function renderTextBlock(block) {
  const parts = Array.isArray(block.parts) ? block.parts : [];
  if (!parts.length) {
    return escapeHtml(block.text || "");
  }

  return parts
    .map((part) => {
      const text = escapeHtml(String(part.text || ""));
      if (!text) {
        return "";
      }

      const safeHref = sanitizeHref(String(part.href || ""));
      if (!safeHref) {
        return text;
      }

      return `<a class="doc-link" href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .join("");
}

const AIR_DEFENSE_BOLD_LINES = new Set([
  "lịch sử hình thành",
  "hình thành bộ tư lệnh phòng không và cục không quân",
  "thành lập quân chủng",
  "tách - nhập quân chủng",
]);

function normalizeHeadingKey(text) {
  return String(text || "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isAirDefenseBoldLine(block) {
  return AIR_DEFENSE_BOLD_LINES.has(normalizeHeadingKey(block?.text));
}

function createSectionMarkup(section) {
  if (
    section.id === "quan-chung-phong-khong-khong-quan" &&
    Array.isArray(section.blocks) &&
    section.blocks.length
  ) {
    const blockHtml = section.blocks
      .map((block) => {
        if (block.type === "text") {
          const emphasisClass = isAirDefenseBoldLine(block) ? " doc-subheading" : "";
          return `<p class="doc-text editorial-copy${emphasisClass}">${renderTextBlock(block)}</p>`;
        }

        const safeIndex = Number.isInteger(block.imageIndex) ? block.imageIndex : 0;
        return `
          <figure
            class="doc-image gallery-card"
            role="button"
            tabindex="0"
            data-section="${section.id}"
            data-index="${safeIndex}"
            aria-label="Mở ảnh ${safeIndex + 1} trong phần ${escapeHtml(section.title)}"
          >
            <img src="${block.src}" alt="${escapeHtml(block.alt || section.title)}" loading="lazy" />
          </figure>
        `;
      })
      .join("");

    return `
      <section id="${section.id}" class="content-section reveal">
        <header class="section-header">
          <h2 class="section-title spring-glow parade-sweep">${escapeHtml(section.title)}</h2>
        </header>
        <article class="doc-flow">${blockHtml}</article>
      </section>
    `;
  }

  const itemsHtml = section.items
    .map((item, index) => {
      return `
        <article
          class="gallery-card"
          role="button"
          tabindex="0"
          data-section="${section.id}"
          data-index="${index}"
          aria-label="Mở ảnh ${index + 1} trong phần ${escapeHtml(section.title)}"
        >
          <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" />
          <p class="gallery-caption editorial-copy">${escapeHtml(item.caption)}</p>
        </article>
      `;
    })
    .join("");

  return `
    <section id="${section.id}" class="content-section reveal">
      <header class="section-header">
        <h2 class="section-title spring-glow parade-sweep">${escapeHtml(section.title)}</h2>
        <p class="editorial-copy section-copy">${escapeHtml(section.lead || "")}</p>
      </header>
      <div class="gallery-grid">${itemsHtml}</div>
    </section>
  `;
}

function buildTemplate(data) {
  const navLinks = data.sections
    .map((section) => `<a class="nav-link" href="#${section.id}">${escapeHtml(section.title)}</a>`)
    .join("");
  const introHtml = data.hero.intro
    .map((paragraph) => `<p class="editorial-copy">${escapeHtml(paragraph)}</p>`)
    .join("");
  const sectionsHtml = data.sections.map((section) => createSectionMarkup(section)).join("");

  return `
    <header class="top-nav">
      <div class="nav-inner">
        <p class="mobile-brand">TIỂU TRẠI PHẠM VĂN SÁNG</p>
        <button
          type="button"
          class="menu-toggle"
          data-mobile-nav-toggle
          aria-expanded="false"
          aria-controls="main-nav"
          aria-label="Mở hoặc đóng menu mục nội dung"
        >
          <span class="menu-toggle-line"></span>
          <span class="menu-toggle-line"></span>
          <span class="menu-toggle-line"></span>
        </button>
        <nav id="main-nav" class="main-nav" aria-label="Điều hướng nội dung chính" data-mobile-nav data-open="false">${navLinks}</nav>
      </div>
    </header>

    <main>
      <section class="hero reveal" id="gioi-thieu">
        <p class="hero-kicker">Hội trại tòng quân 2026</p>
        <h1 class="hero-title spring-shimmer parade-sweep">${escapeHtml(data.hero.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(data.hero.subtitle)}</p>
        <div class="intro-copy">${introHtml}</div>
      </section>
      ${sectionsHtml}
    </main>

    <footer class="site-footer">
      <p>Hội trại tòng quân năm 2026 • Tiểu trại Phạm Văn Sáng</p>
    </footer>

    <div class="lightbox" data-lightbox data-open="false" aria-hidden="true">
      <button class="lightbox-close" data-action="close" aria-label="Đóng ảnh">×</button>
      <button class="lightbox-nav prev" data-action="prev" aria-label="Ảnh trước">‹</button>
      <figure class="lightbox-figure">
        <img src="" alt="" data-lightbox-image />
        <figcaption data-lightbox-caption></figcaption>
        <p data-lightbox-counter></p>
      </figure>
      <button class="lightbox-nav next" data-action="next" aria-label="Ảnh sau">›</button>
    </div>
  `;
}

function wireImageFallback(root) {
  root.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        return;
      }
      if (target.dataset.fallbackApplied === "true") {
        return;
      }
      target.dataset.fallbackApplied = "true";
      target.src =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='100%25' height='100%25' fill='%23d1d5db'/><text x='50%25' y='50%25' fill='%234b5563' font-family='sans-serif' font-size='28' text-anchor='middle'>Khong tai duoc anh</text></svg>";
    },
    true
  );
}

function wireReveal(root) {
  const revealTargets = Array.from(root.querySelectorAll(".reveal"));
  if (!revealTargets.length) {
    return;
  }

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || typeof IntersectionObserver === "undefined") {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.02, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      node.classList.add("is-visible");
    }
    observer.observe(node);
  });
}

function wireMobileNav(root) {
  const topNav = root.querySelector(".top-nav");
  const toggle = root.querySelector("[data-mobile-nav-toggle]");
  const nav = root.querySelector("[data-mobile-nav]");
  if (!topNav || !toggle || !nav) {
    return;
  }

  const setOpen = (open) => {
    nav.dataset.open = open ? "true" : "false";
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    if (!topNav.classList.contains("is-collapsed")) {
      return;
    }
    const currentlyOpen = nav.dataset.open === "true";
    setOpen(!currentlyOpen);
  });

  nav.querySelectorAll("a[href^='#']").forEach((item) => {
    item.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (!topNav.classList.contains("is-collapsed")) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!nav.contains(target) && !toggle.contains(target)) {
      setOpen(false);
    }
  });
}

function wireNavLayout(root) {
  const topNav = root.querySelector(".top-nav");
  const navInner = root.querySelector(".nav-inner");
  const nav = root.querySelector("[data-mobile-nav]");
  const toggle = root.querySelector("[data-mobile-nav-toggle]");
  if (!topNav || !navInner || !nav || !toggle) {
    return;
  }

  const applyLayout = () => {
    const viewportCollapsed =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(max-width: 839px)")?.matches ?? true);

    topNav.classList.remove("is-collapsed");
    const overflowCollapsed = nav.scrollWidth > navInner.clientWidth - 8;
    const shouldCollapse = viewportCollapsed || overflowCollapsed;

    topNav.classList.toggle("is-collapsed", shouldCollapse);
    if (!shouldCollapse) {
      nav.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
    }
  };

  applyLayout();
  requestAnimationFrame(applyLayout);
  window.addEventListener("load", applyLayout);
  window.addEventListener("resize", applyLayout, { passive: true });
}

function wireLightbox(root, sectionsById) {
  const overlay = root.querySelector("[data-lightbox]");
  const overlayImage = root.querySelector("[data-lightbox-image]");
  const overlayCaption = root.querySelector("[data-lightbox-caption]");
  const overlayCounter = root.querySelector("[data-lightbox-counter]");
  const closeButton = root.querySelector("[data-action='close']");
  const nextButton = root.querySelector("[data-action='next']");
  const prevButton = root.querySelector("[data-action='prev']");

  const lightbox = {
    sectionId: "",
    index: 0,
  };

  function setOverlayState(isOpen) {
    overlay.dataset.open = isOpen ? "true" : "false";
    overlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.body.classList.toggle("lightbox-open", isOpen);
  }

  function getCurrentItems() {
    return sectionsById[lightbox.sectionId]?.items || [];
  }

  function renderOverlay() {
    const items = getCurrentItems();
    if (!items.length) {
      return;
    }
    const current = items[lightbox.index];
    overlayImage.src = current.src;
    overlayImage.alt = current.alt || current.caption;
    overlayCaption.textContent = current.caption || "";
    overlayCounter.textContent = `${lightbox.index + 1} / ${items.length}`;
  }

  function open(sectionId, index) {
    if (!sectionsById[sectionId]?.items?.length) {
      return;
    }
    lightbox.sectionId = sectionId;
    lightbox.index = index;
    renderOverlay();
    setOverlayState(true);
  }

  function close() {
    setOverlayState(false);
  }

  function move(direction) {
    const items = getCurrentItems();
    if (!items.length) {
      return;
    }
    const state = buildLightboxState(items.length);
    lightbox.index = direction === "next" ? state.next(lightbox.index) : state.prev(lightbox.index);
    renderOverlay();
  }

  root.querySelectorAll(".gallery-card").forEach((card) => {
    const openFromCard = () => {
      const sectionId = card.dataset.section;
      const index = Number(card.dataset.index || "0");
      open(sectionId, index);
    };
    card.addEventListener("click", openFromCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFromCard();
      }
    });
  });

  closeButton.addEventListener("click", close);
  nextButton.addEventListener("click", () => move("next"));
  prevButton.addEventListener("click", () => move("prev"));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  if (activeDocumentHandler) {
    document.removeEventListener("keydown", activeDocumentHandler);
  }
  activeDocumentHandler = (event) => {
    if (overlay.dataset.open !== "true") {
      return;
    }
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowRight") {
      move("next");
    } else if (event.key === "ArrowLeft") {
      move("prev");
    }
  };
  document.addEventListener("keydown", activeDocumentHandler);
}

export function renderApp(root, data = siteContent) {
  if (!root) {
    throw new Error("Missing root element");
  }

  root.innerHTML = buildTemplate(data);
  const sectionsById = Object.fromEntries(data.sections.map((section) => [section.id, section]));
  wireImageFallback(root);
  wireReveal(root);
  wireMobileNav(root);
  wireNavLayout(root);
  wireLightbox(root, sectionsById);
}

const root = document.querySelector("#app");
if (root) {
  renderApp(root, siteContent);
}

