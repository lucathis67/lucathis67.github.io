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
  // The heading mirrors the header (brand title, close button); the language
  // switcher, hidden from the header on smaller screens, follows the links.
  const mobileNav = navigation.cloneNode(true);
  mobileNav.setAttribute("aria-label", label("menuMobileNav", "Navigation mobile"));
  mobileNav.querySelectorAll(".current").forEach(link => link.setAttribute("aria-current", "page"));
  dialog.append(mobileNav);
  const languageSwitch = header.querySelector(".language-switch");
  if (languageSwitch) dialog.append(languageSwitch.cloneNode(true));
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
    dialog.style.setProperty("--menu-heading-height", `${header.offsetHeight}px`);
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
  mobileNav.addEventListener("click", event => {
    if (event.target.closest("a")) finishClose();
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

function initialize() {
  initializeSite();
  initializeMasthead();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
