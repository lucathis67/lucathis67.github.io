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
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Wording comes from _data/translations.yml through data attributes on the dialog.
  const text = (key, fallback, values = {}) => Object.entries(values)
    .reduce((result, [name, value]) => result.replace(`{${name}}`, value), dialog.dataset[key] || fallback);
  const managedAttributes = ['tabindex', 'role', 'aria-haspopup', 'aria-controls', 'aria-label'];
  const originalAttributes = new Map(photographs.map(image => [
    image, new Map(managedAttributes.map(name => [name, image.getAttribute(name)]))
  ]));

  const stage = dialog.querySelector('.photo-viewer-stage');
  const paper = dialog.querySelector('.photo-viewer-paper');
  const displayed = dialog.querySelector('.photo-viewer-image');
  const message = dialog.querySelector('.photo-viewer-message');
  const counter = dialog.querySelector('.photo-viewer-counter');
  const edition = dialog.querySelector('.photo-viewer-edition');
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
  let transitions = [];
  let outgoing;
  let closing = false;
  let closeTimer;
  const fadeDuration = 410;
  function clearTransition() {
    transitions.forEach(animation => animation.cancel());
    transitions = [];
    outgoing?.remove();
    outgoing = undefined;
  }
  reducedMotion.addEventListener('change', clearTransition);

  // Fine-art mat (27 November 2026): equal margins on three sides, 6% of the
  // print's longer side, and a deeper bottom margin, as in real framing,
  // where the photograph's number is written like an edition number.
  const matRatio = 0.06;
  const matBottomFactor = 2;
  function fitPrint() {
    if (!dialog.open || !dimensions) return;
    const { width: availableWidth, height: availableHeight } = stage.getBoundingClientRect();
    const { width, height } = dimensions;
    const mat = Math.max(width, height) * matRatio;
    const scale = Math.min(
      availableWidth / (width + 2 * mat),
      availableHeight / (height + (1 + matBottomFactor) * mat),
      1
    );
    if (scale <= 0) return;
    const side = mat * scale;
    const bottom = side * matBottomFactor;
    displayed.style.width = `${width * scale}px`;
    displayed.style.height = `${height * scale}px`;
    paper.style.padding = `${side}px ${side}px ${bottom}px`;
    paper.style.setProperty('--mat-side', `${side}px`);
    paper.style.setProperty('--mat-bottom', `${bottom}px`);
  }

  const sourceFor = image => image.dataset.viewerSrc || image.src || image.currentSrc;
  function warmNeighbour(offset) {
    if (photographs.length < 2) return;
    const neighbour = photographs[(index + offset + photographs.length) % photographs.length];
    const image = new Image();
    image.src = sourceFor(neighbour);
  }

  async function showPhotograph(newIndex, direction = 0) {
    if (closing) return;
    clearTransition();
    index = (newIndex + photographs.length) % photographs.length;
    const current = photographs[index];
    const token = ++request;
    clearTimeout(loadingTimer);
    stage.setAttribute('aria-busy', 'true');
    const canTransition = direction && !paper.hidden && !reducedMotion.matches;
    message.hidden = true;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photographs.length).padStart(2, '0')}`;
    edition.textContent = counter.textContent;
    counter.setAttribute('aria-label', text('labelCounter', 'Photographie {n} sur {total}', { n: index + 1, total: photographs.length }));
    loadingTimer = setTimeout(() => {
      if (token !== request || !dialog.open) return;
      message.textContent = text('labelLoading', 'Chargement de la photographie…');
      message.hidden = false;
    }, 300);

    const image = new Image();
    image.src = sourceFor(current);
    try {
      await image.decode();
      if (token !== request || !dialog.open) return;
      if (canTransition && !reducedMotion.matches) {
        const printBounds = paper.getBoundingClientRect();
        const stageBounds = stage.getBoundingClientRect();
        outgoing = paper.cloneNode(true);
        outgoing.classList.add('photo-viewer-transition');
        outgoing.setAttribute('aria-hidden', 'true');
        outgoing.style.left = `${printBounds.left - stageBounds.left}px`;
        outgoing.style.top = `${printBounds.top - stageBounds.top}px`;
        stage.append(outgoing);
      }
      dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      displayed.src = image.src;
      displayed.alt = current.alt;
      paper.hidden = false;
      fitPrint();
      if (outgoing) {
        // Fade the old print away completely before revealing the new one.
        // Both halves share the same brief transition duration.
        const options = { duration: fadeDuration, easing: 'linear' };
        transitions = [
          outgoing.animate([
            { opacity: 1, offset: 0, easing: 'ease-in-out' },
            { opacity: 0, offset: 0.5 },
            { opacity: 0, offset: 1 }
          ], { ...options, fill: 'forwards' }),
          paper.animate([
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.5, easing: 'ease-in-out' },
            { opacity: 1, offset: 1 }
          ], options)
        ];
        Promise.allSettled(transitions.map(animation => animation.finished)).then(() => {
          if (token === request) clearTransition();
        });
      }
      if (!direction && !reducedMotion.matches) {
        const entrance = paper.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: fadeDuration, easing: 'ease-in-out'
        });
        transitions.push(entrance);
      }
      warmNeighbour(1);
      warmNeighbour(-1);
    } catch {
      if (token !== request || !dialog.open) return;
      paper.hidden = true;
      message.textContent = text('labelError', 'Cette photographie ne peut pas être affichée. Vous pouvez passer à la suivante.');
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
    closing = false;
    dialog.classList.remove('is-closing');
    dialog.classList.add('is-opening');
    dialog.showModal();
    document.documentElement.classList.add('photo-viewer-open');
    showPhotograph(position);
  }
  function closeViewer(immediate = false) {
    if (!dialog.open) return;
    if (immediate === true || reducedMotion.matches) { dialog.close(); return; }
    if (closing) return;
    closing = true;
    ++request;
    clearTimeout(loadingTimer);
    clearTransition();
    dialog.classList.remove('is-opening');
    dialog.classList.add('is-closing');
    closeTimer = setTimeout(() => dialog.close(), fadeDuration);
  }
  dialog.addEventListener('animationend', event => {
    if (event.target === dialog && event.animationName === 'viewer-fade-in') dialog.classList.remove('is-opening');
  });
  dialog.addEventListener('close', () => {
    clearTimeout(closeTimer);
    closing = false;
    dialog.classList.remove('is-opening', 'is-closing');
    clearTransition();
    ++request; // Ignore pending image loads after closing or reopening.
    clearTimeout(loadingTimer);
    stage.setAttribute('aria-busy', 'false');
    document.documentElement.classList.remove('photo-viewer-open');
    if (viewerBreakpoint.matches) opener?.focus({ preventScroll: true });
  });

  function updateInteraction() {
    const enabled = viewerBreakpoint.matches;
    if (!enabled) closeViewer(true);
    photographs.forEach((image, position) => {
      image.classList.toggle('photo-viewer-trigger', enabled);
      if (enabled) {
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-haspopup', 'dialog');
        image.setAttribute('aria-controls', 'photo-viewer');
        image.setAttribute('aria-label', `${text('labelEnlarge', 'Agrandir la photographie {n} sur {total}', { n: position + 1, total: photographs.length })}${image.alt ? `${document.documentElement.lang.startsWith('fr') ? ' : ' : ': '}${image.alt}` : ''}`);
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
  previous.addEventListener('click', () => showPhotograph(index - 1, -1));
  next.addEventListener('click', () => showPhotograph(index + 1, 1));
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
    showPhotograph(destinations[event.key], event.key === 'ArrowLeft' || event.key === 'Home' ? -1 : 1);
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
    showPhotograph(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitPrint).observe(stage);
  else window.addEventListener('resize', fitPrint);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePhotoViewer, { once: true });
} else {
  initializePhotoViewer();
}
