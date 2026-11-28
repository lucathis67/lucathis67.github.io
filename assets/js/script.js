function initializeSite() {
  const year = new Date().getFullYear();
  const copyright = document.getElementById("copyright");
  if (copyright) copyright.textContent = `© Lucas Mathis Art ${year}`;

  // Alternate portfolio story backgrounds in reading order on mobile.
  document.querySelectorAll(".main-container-row .story-card").forEach((article, index) => {
    article.classList.toggle("article-warm", index % 2 === 1);
  });

  const header = document.querySelector("header");
  const navigation = header?.querySelector("nav");
  if (!navigation || typeof HTMLDialogElement === "undefined") return;

  // Labels come from _data/translations.yml through data attributes on the header.
  const label = (key, fallback) => header.dataset[key] || fallback;

  const toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", label("menuOpen", "Ouvrir le menu"));
  toggle.setAttribute("aria-haspopup", "dialog");
  toggle.setAttribute("aria-controls", "mobile-menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '<span></span><span></span>';
  header.append(toggle);

  const dialog = document.createElement("dialog");
  dialog.id = "mobile-menu";
  dialog.className = "mobile-menu";
  dialog.setAttribute("aria-label", label("menuDialog", "Menu de navigation"));
  dialog.innerHTML = '<div class="mobile-menu-heading"><div class="mobile-menu-brand"><span>Lucas Mathis Art</span></div><button class="menu-close" type="button" autofocus><span></span><span></span></button></div>';
  dialog.querySelector(".menu-close").setAttribute("aria-label", label("menuClose", "Fermer le menu"));
  // The heading mirrors the header: brand title, close button.
  const mobileNav = navigation.cloneNode(true);
  mobileNav.setAttribute("aria-label", label("menuMobileNav", "Navigation mobile"));
  mobileNav.querySelectorAll(".current").forEach(link => link.setAttribute("aria-current", "page"));
  dialog.append(mobileNav);
  // Colophon at the foot of the menu (27 November 2026): e-mail and
  // Instagram, as in the site footer.
  const { menuEmail: email, menuInstagramUrl: instagramUrl, menuInstagramHandle: instagramHandle } = header.dataset;
  if (email || instagramUrl) {
    const colophon = document.createElement("div");
    colophon.className = "mobile-menu-colophon";
    if (email) {
      const mail = document.createElement("a");
      mail.href = `mailto:${email}`;
      mail.textContent = email;
      colophon.append(mail);
    }
    if (instagramUrl) {
      const instagram = document.createElement("a");
      instagram.href = instagramUrl;
      instagram.target = "_blank";
      instagram.rel = "noopener noreferrer";
      instagram.textContent = `${instagramHandle || "Instagram"} `;
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      instagram.append(arrow);
      // Opens in a new tab: said to screen readers (text from translations.yml).
      if (header.dataset.menuNewTab) {
        const note = document.createElement("span");
        note.className = "visually-hidden";
        note.textContent = ` ${header.dataset.menuNewTab}`;
        instagram.append(note);
      }
      colophon.append(instagram);
    }
    dialog.append(colophon);
  }
  document.body.append(dialog);
  header.classList.add("has-mobile-menu");

  let closing = false;
  let closeTimer;
  const finishClose = () => {
    clearTimeout(closeTimer);
    dialog.close();
    dialog.classList.remove("is-closing");
    document.documentElement.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    closing = false;
  };
  const closeMenu = () => {
    if (!dialog.open || closing) return;
    closing = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return finishClose();
    dialog.classList.add("is-closing");
    closeTimer = setTimeout(finishClose, 450);
  };
  toggle.addEventListener("click", event => {
    // Keep focus inside the dialog, but omit the initial ring for taps/clicks.
    dialog.classList.toggle("pointer-open", event.detail > 0);
    // The menu heading takes the header's current height and title size (full
    // or thin), so the brand and the close button sit where they were.
    // Unrounded, so that the menu's rule falls exactly on the header's.
    dialog.style.setProperty("--menu-heading-height", `${header.getBoundingClientRect().height}px`);
    dialog.classList.toggle("is-full", !header.classList.contains("is-condensed"));
    const brandTitle = header.querySelector(".brand-title");
    if (brandTitle) {
      dialog.style.setProperty("--menu-brand-size", getComputedStyle(brandTitle).fontSize);
      dialog.style.setProperty("--menu-brand-offset", `${brandTitle.getBoundingClientRect().top - header.getBoundingClientRect().top}px`);
    }
    dialog.showModal();
    toggle.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("menu-open");
  });
  dialog.addEventListener("keydown", () => {
    dialog.classList.remove("pointer-open");
  });
  dialog.querySelector(".menu-close").addEventListener("click", closeMenu);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeMenu();
  });
  dialog.addEventListener("animationend", event => {
    if (event.target === dialog && closing) finishClose();
  });
  // A link of the menu: the links leave first, as when the menu closes, while
  // the page stays, then the browser goes to the new page (28 November 2026,
  // _mobile-menu.scss). A modified click (new tab, etc.) or reduced
  // motion goes straight there, as before.
  mobileNav.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    const leaveSlowly = !matchMedia("(prefers-reduced-motion: reduce)").matches
      && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      && event.button === 0
      && !link.target
      && link.origin === location.origin;
    if (!leaveSlowly) return finishClose();
    event.preventDefault();
    dialog.classList.add("is-leaving");
    setTimeout(() => { location.href = link.href; }, 320);
  });
  // Back to this page from the history: the menu is closed again.
  window.addEventListener("pageshow", event => {
    if (event.persisted && dialog.open) {
      dialog.classList.remove("is-leaving");
      finishClose();
    }
  });
  matchMedia("(max-width: 1200px)").addEventListener("change", event => {
    if (!event.matches && dialog.open) finishClose();
  });
}

// Site header: fixed at the top of the window. On the homepage, the brand
// title first hangs across its bottom line and, as soon as the page scrolls,
// the header shrinks to a thinner version; other pages keep the thin version.
// The page keeps a space the height of the full header, hanging title
// included (--masthead-height), so nothing moves when it shrinks.
function initializeMasthead() {
  const header = document.querySelector(".site-header[data-masthead]");
  if (!header) return;
  const brandTitle = header.querySelector(".brand-title");
  // Outside the homepage, the header stays in its thin version.
  const isStatic = header.hasAttribute("data-masthead-static");

  const root = document.documentElement;
  // Two thresholds, so that small scroll movements near the top of the page
  // do not make the header switch back and forth.
  const condenseAfter = 8;
  const expandBefore = 2;
  let scheduled = false;

  const update = () => {
    scheduled = false;
    if (isStatic) return;
    const condensed = header.classList.contains("is-condensed");
    if (!condensed && window.scrollY > condenseAfter) header.classList.add("is-condensed");
    else if (condensed && window.scrollY < expandBefore) header.classList.remove("is-condensed");
  };
  const subtitle = header.querySelector(".brand-subtitle");
  // Full height: the header, plus the hanging title and the subtitle below it.
  const fullExtent = () => {
    const top = header.getBoundingClientRect().top;
    const bottoms = [brandTitle, subtitle].filter(Boolean).map(element => element.getBoundingClientRect().bottom - top);
    return Math.ceil(Math.max(header.offsetHeight, ...bottoms));
  };
  const measure = () => {
    const condensed = header.classList.contains("is-condensed");
    header.classList.add("is-measuring");
    header.classList.add("is-condensed");
    const thinHeight = header.offsetHeight;
    header.classList.remove("is-condensed");
    root.style.setProperty("--masthead-height", `${fullExtent()}px`);
    if (brandTitle) {
      const titleWidth = brandTitle.getBoundingClientRect().width;
      const fontSize = parseFloat(getComputedStyle(brandTitle).fontSize);
      header.style.setProperty("--masthead-title-gap-full", `${Math.ceil(titleWidth / 2 + fontSize * 0.35)}px`);
    }
    root.style.setProperty("--masthead-thin-height", `${thinHeight}px`);
    header.classList.toggle("is-condensed", condensed);
    void header.offsetHeight;
    header.classList.remove("is-measuring");
    update();
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  header.classList.add("is-fixed");
  if (isStatic) {
    const measureStatic = () => {
      const height = `${header.offsetHeight}px`;
      root.style.setProperty("--masthead-height", height);
      root.style.setProperty("--masthead-thin-height", height);
    };
    measureStatic();
    window.addEventListener("resize", measureStatic);
    window.addEventListener("load", measureStatic);
    document.fonts?.ready.then(measureStatic);
    return;
  }
  measure();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  document.fonts?.ready.then(measure);
}

// Double rule under the header (28 November 2026, _masthead.scss):
// it closes into a single rule once the first rule of the page has slid
// beneath the header — on the homepage, the one above the front page; on the
// other pages, as soon as the page scrolls. `is-rule-merged` on the header.
function initializeHeaderRule() {
  const header = document.querySelector(".site-header[data-masthead]");
  if (!header) return;
  const marker = document.querySelector(".home-une .home-introduction");
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const merged = marker
      ? marker.getBoundingClientRect().top <= header.getBoundingClientRect().bottom
      : window.scrollY > 8;
    header.classList.toggle("is-rule-merged", merged);
  };
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// Safari's elastic overscroll shows the page's background colour: past the
// middle of the page, it takes the linen of the footer's strip, so the bottom
// end never flashes paper-white under it (_base.scss, `is-near-end`).
function initializeOverscroll() {
  const root = document.documentElement;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const end = root.scrollHeight - window.innerHeight;
    root.classList.toggle("is-near-end", end > 0 && window.scrollY > end / 2);
  };
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// Focus rings for the keyboard only (28 November 2026). Safari on iPhone
// counts the focus that scripts give (the photo when the viewer closes, the
// viewer's buttons when it opens) as keyboard focus, and left a dark square
// on what had just been tapped. A touch or a click sets `is-pointer` on
// <html>, which hides the rings (_base.scss); the first key pressed brings
// them back.
function initializeFocusRings() {
  const root = document.documentElement;
  document.addEventListener("pointerdown", () => root.classList.add("is-pointer"), { capture: true, passive: true });
  document.addEventListener("keydown", event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    root.classList.remove("is-pointer");
  }, { capture: true });
}

function initialize() {
  initializeFocusRings();
  initializeSite();
  initializeMasthead();
  initializeHeaderRule();
  initializeOverscroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
