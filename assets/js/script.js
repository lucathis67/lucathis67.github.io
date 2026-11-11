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

  const toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Ouvrir le menu");
  toggle.setAttribute("aria-haspopup", "dialog");
  toggle.setAttribute("aria-controls", "mobile-menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '<span></span><span></span>';
  header.append(toggle);

  const dialog = document.createElement("dialog");
  dialog.id = "mobile-menu";
  dialog.className = "mobile-menu";
  dialog.setAttribute("aria-label", "Menu de navigation");
  dialog.innerHTML = '<div class="mobile-menu-heading"><div class="mobile-menu-brand"><span>Lucas Mathis <em>Art</em></span></div><button class="menu-close" type="button" aria-label="Fermer le menu" autofocus><span></span><span></span></button></div>';
  const subtitle = header.querySelector('.brand-subtitle');
  if (subtitle) {
    const menuSubtitle = subtitle.cloneNode(true);
    menuSubtitle.className = 'mobile-menu-subtitle';
    dialog.querySelector('.mobile-menu-brand').append(menuSubtitle);
  }
  const mobileNav = navigation.cloneNode(true);
  if (navigation.classList.contains('split-navigation')) {
    mobileNav.removeAttribute('class');
    const links = [...navigation.querySelectorAll('.split-links a')];
    const list = document.createElement('ul');
    links.forEach(link => {
      const item = document.createElement('li');
      item.append(link.cloneNode(true));
      list.append(item);
    });
    mobileNav.replaceChildren(list);
  }
  mobileNav.setAttribute("aria-label", "Navigation mobile");
  mobileNav.querySelectorAll(".current").forEach(link => link.setAttribute("aria-current", "page"));
  dialog.append(mobileNav);
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
  matchMedia("(max-width: 1400px)").addEventListener("change", event => {
    if (!event.matches && dialog.open) finishClose();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
} else {
  initializeSite();
}
