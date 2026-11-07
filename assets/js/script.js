function initializeSite() {
  const year = new Date().getFullYear();
  const copyright = document.getElementById("copyright");
  if (copyright) copyright.textContent = `© Lucas Mathis Art ${year}`;

  // Count articles in reading order across both homepage columns.
  document.querySelectorAll(".home-header + main article").forEach((article, index) => {
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
  dialog.innerHTML = '<div class="mobile-menu-heading"><span>Lucas Mathis <em>Art</em></span><button class="menu-close" type="button" aria-label="Fermer le menu" autofocus><span></span><span></span></button></div>';
  const mobileNav = navigation.cloneNode(true);
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
  toggle.addEventListener("click", () => {
    dialog.showModal();
    toggle.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("menu-open");
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
  matchMedia("(max-width: 800px)").addEventListener("change", event => {
    if (!event.matches && dialog.open) finishClose();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
} else {
  initializeSite();
}
