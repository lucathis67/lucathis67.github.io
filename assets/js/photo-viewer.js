// Each article is its own album. No gallery list or content rewrite is needed.
function initializePhotoViewer() {
  const content = document.querySelector('.reportage-content');
  const dialog = document.querySelector('#photo-viewer');
  if (!content || !dialog || typeof dialog.showModal !== 'function') return;

  // Keep deliberately linked images and explicit opt-outs available as authored.
  const photographs = Array.from(content.querySelectorAll('img:not([data-no-viewer])'))
    .filter(image => !image.closest('a, button'));
  if (!photographs.length) return;

  // Below 800px, preserve the ordinary inline photographs without triggers.
  const viewerBreakpoint = matchMedia('(min-width: 800px)');
  const managedAttributes = ['tabindex', 'role', 'aria-haspopup', 'aria-controls', 'aria-label'];
  const originalAttributes = new Map(photographs.map(image => [
    image, new Map(managedAttributes.map(name => [name, image.getAttribute(name)]))
  ]));

  const stage = dialog.querySelector('.photo-viewer-stage');
  const paper = dialog.querySelector('.photo-viewer-paper');
  const displayed = dialog.querySelector('.photo-viewer-image');
  const message = dialog.querySelector('.photo-viewer-message');
  const counter = dialog.querySelector('.photo-viewer-counter');
  const previous = dialog.querySelector('.photo-viewer-previous');
  const next = dialog.querySelector('.photo-viewer-next');
  const close = dialog.querySelector('.photo-viewer-close');
  let index = 0;
  let opener;
  let request = 0;
  let loadingTimer;
  let dimensions;
  let touchStart;
  let suppressClickUntil = 0;

  // The image occupies 80% of the paper's width: a 10% white mat on each side.
  // Equal physical padding on all edges creates the fine-art print treatment.
  const matRatio = 0.125;
  function fitPrint() {
    if (!dialog.open || !dimensions) return;
    const { width: availableWidth, height: availableHeight } = stage.getBoundingClientRect();
    const { width, height } = dimensions;
    const scale = Math.min(
      availableWidth / (width * (1 + 2 * matRatio)),
      availableHeight / (height + width * 2 * matRatio),
      1
    );
    if (scale <= 0) return;
    const imageWidth = width * scale;
    displayed.style.width = `${imageWidth}px`;
    displayed.style.height = `${height * scale}px`;
    paper.style.padding = `${imageWidth * matRatio}px`;
  }

  const sourceFor = image => image.dataset.viewerSrc || image.src || image.currentSrc;
  function warmNeighbour(offset) {
    if (photographs.length < 2) return;
    const neighbour = photographs[(index + offset + photographs.length) % photographs.length];
    const image = new Image();
    image.src = sourceFor(neighbour);
  }

  async function showPhotograph(newIndex) {
    index = (newIndex + photographs.length) % photographs.length;
    const current = photographs[index];
    const token = ++request;
    clearTimeout(loadingTimer);
    stage.setAttribute('aria-busy', 'true');
    paper.hidden = true;
    message.hidden = true;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photographs.length).padStart(2, '0')}`;
    counter.setAttribute('aria-label', `Photographie ${index + 1} sur ${photographs.length}`);
    loadingTimer = setTimeout(() => {
      if (token !== request || !dialog.open) return;
      message.textContent = 'Chargement de la photographie…';
      message.hidden = false;
    }, 300);

    const image = new Image();
    image.src = sourceFor(current);
    try {
      await image.decode();
      if (token !== request || !dialog.open) return;
      dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      displayed.src = image.src;
      displayed.alt = current.alt;
      paper.hidden = false;
      fitPrint();
      warmNeighbour(1);
      warmNeighbour(-1);
    } catch {
      if (token !== request || !dialog.open) return;
      paper.hidden = true;
      message.textContent = 'Cette photographie ne peut pas être affichée. Vous pouvez passer à la suivante.';
      message.hidden = false;
    } finally {
      if (token === request) {
        clearTimeout(loadingTimer);
        stage.setAttribute('aria-busy', 'false');
        if (!paper.hidden) message.hidden = true;
      }
    }
  }

  function openViewer(image, position) {
    if (!viewerBreakpoint.matches || dialog.open) return;
    opener = image;
    dimensions = undefined;
    paper.hidden = true;
    dialog.showModal();
    document.documentElement.classList.add('photo-viewer-open');
    showPhotograph(position);
  }
  function closeViewer() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener('close', () => {
    ++request; // Ignore pending image loads after closing or reopening.
    clearTimeout(loadingTimer);
    stage.setAttribute('aria-busy', 'false');
    document.documentElement.classList.remove('photo-viewer-open');
    if (viewerBreakpoint.matches) opener?.focus({ preventScroll: true });
  });

  function updateInteraction() {
    const enabled = viewerBreakpoint.matches;
    if (!enabled) closeViewer();
    photographs.forEach((image, position) => {
      image.classList.toggle('photo-viewer-trigger', enabled);
      if (enabled) {
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-haspopup', 'dialog');
        image.setAttribute('aria-controls', 'photo-viewer');
        image.setAttribute('aria-label', `Agrandir la photographie ${position + 1} sur ${photographs.length}${image.alt ? ` : ${image.alt}` : ''}`);
      } else {
        originalAttributes.get(image).forEach((value, name) => {
          if (value === null) image.removeAttribute(name);
          else image.setAttribute(name, value);
        });
      }
    });
  }
  photographs.forEach((image, position) => {
    image.addEventListener('click', () => openViewer(image, position));
    image.addEventListener('keydown', event => {
      if (!viewerBreakpoint.matches || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      openViewer(image, position);
    });
  });
  viewerBreakpoint.addEventListener('change', updateInteraction);
  updateInteraction();

  close.addEventListener('click', closeViewer);
  previous.addEventListener('click', () => showPhotograph(index - 1));
  next.addEventListener('click', () => showPhotograph(index + 1));
  previous.hidden = next.hidden = photographs.length < 2;
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeViewer();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll('button:not([disabled])'))
        .filter(button => !button.hidden);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    const destinations = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: photographs.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    showPhotograph(destinations[event.key]);
  });
  dialog.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) return;
    if (event.target === dialog || event.target === stage) closeViewer();
  });

  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointercancel', () => { touchStart = undefined; });
  stage.addEventListener('pointerup', event => {
    if (!touchStart || event.pointerType !== 'touch') return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = undefined;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClickUntil = performance.now() + 350;
    showPhotograph(index + (dx < 0 ? 1 : -1));
  });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitPrint).observe(stage);
  else window.addEventListener('resize', fitPrint);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePhotoViewer, { once: true });
} else {
  initializePhotoViewer();
}
