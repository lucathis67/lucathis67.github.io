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
  const overview = dialog.querySelector('.photo-viewer-overview');
  const room = dialog.querySelector('.photo-viewer-room');
  const wall = dialog.querySelector('.photo-viewer-wall');
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
  const slideDuration = 900;
  function clearTransition() {
    transitions.forEach(animation => animation.cancel());
    transitions = [];
    outgoing?.remove();
    outgoing = undefined;
  }
  reducedMotion.addEventListener('change', clearTransition);

  // Fine-art mat (27 November 2026): equal margins on three sides, 6% of the
  // print's longer side, and a bottom margin twice as deep, as in real
  // framing, which gives the photograph's number room to breathe.
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
      let stageBounds;
      if (canTransition && !reducedMotion.matches) {
        const printBounds = paper.getBoundingClientRect();
        stageBounds = stage.getBoundingClientRect();
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
        // Walking along the wall (27 November 2026): the old print slides away
        // and fades while the new one arrives from the other side, both at
        // once, slowly. Skipped when less motion is wanted (see canTransition).
        const distance = Math.min(120, stageBounds.width * 0.08) * direction;
        const options = { duration: slideDuration, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' };
        transitions = [
          outgoing.animate([
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: `translateX(${-distance}px)` }
          ], { ...options, fill: 'forwards' }),
          paper.animate([
            { opacity: 0, transform: `translateX(${distance}px)` },
            { opacity: 1, transform: 'translateX(0)' }
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

  // Quiet mode: controls fade out when the mouse rests (see _photo-viewer.scss).
  let quietTimer;
  const wake = () => {
    dialog.classList.remove('is-quiet');
    clearTimeout(quietTimer);
  };
  const restSoon = () => {
    wake();
    quietTimer = setTimeout(() => {
      // Stay awake while a control is hovered or focused from the keyboard.
      if (dialog.open && room.hidden && !dialog.querySelector('button:hover, button:focus-visible')) dialog.classList.add('is-quiet');
    }, 2500);
  };
  dialog.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') restSoon();
  });
  dialog.addEventListener('keydown', wake);
  dialog.addEventListener('focusin', wake);
  dialog.addEventListener('close', wake);

  // Room overview (27 November 2026): one step back, and every photograph of
  // the story hangs on the wall as a small matted print. Choosing one walks
  // back to it. Escape or the same button returns to the current print.
  photographs.forEach((image, position) => {
    const item = document.createElement('li');
    const frame = document.createElement('button');
    frame.type = 'button';
    frame.className = 'photo-viewer-frame';
    frame.setAttribute('aria-label', text('labelCounter', 'Photographie {n} sur {total}', { n: position + 1, total: photographs.length }) + (image.alt ? ` : ${image.alt}` : ''));
    const thumbnail = document.createElement('img');
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.decoding = 'async';
    thumbnail.src = image.currentSrc || image.src;
    if (image.getAttribute('width') && image.getAttribute('height')) {
      thumbnail.style.aspectRatio = `${image.getAttribute('width')} / ${image.getAttribute('height')}`;
    }
    frame.append(thumbnail);
    frame.addEventListener('click', () => leaveRoom(position));
    item.append(frame);
    wall.append(item);
  });
  const frames = Array.from(wall.querySelectorAll('.photo-viewer-frame'));
  const step = (element, keyframes) => reducedMotion.matches
    ? undefined
    : element.animate(keyframes, { duration: 500, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
  function enterRoom() {
    if (!room.hidden || closing) return;
    clearTransition();
    wake();
    frames.forEach((frame, position) => {
      if (position === index) frame.setAttribute('aria-current', 'true');
      else frame.removeAttribute('aria-current');
    });
    dialog.classList.add('is-room');
    stage.hidden = true;
    room.hidden = false;
    overview.setAttribute('aria-pressed', 'true');
    overview.setAttribute('aria-label', overview.dataset.labelBack || 'Revenir à la photographie');
    step(room, [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'scale(1)' }]);
    frames[index]?.focus({ preventScroll: false });
    frames[index]?.scrollIntoView({ block: 'nearest' });
  }
  function leaveRoom(position) {
    if (room.hidden) return;
    const finish = () => {
      room.hidden = true;
      stage.hidden = false;
      dialog.classList.remove('is-room');
      overview.setAttribute('aria-pressed', 'false');
      overview.setAttribute('aria-label', text('labelOverview', 'Voir toutes les photographies du reportage'));
      paper.hidden = true;
      showPhotograph(position);
      (photographs.length > 1 ? next : close).focus({ preventScroll: true });
    };
    const leaving = step(room, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.08)' }]);
    if (leaving) leaving.finished.then(finish, finish);
    else finish();
  }
  overview.dataset.labelOverview = overview.getAttribute('aria-label');
  dialog.dataset.labelOverview = overview.getAttribute('aria-label');
  overview.hidden = photographs.length < 2;
  overview.addEventListener('click', () => (room.hidden ? enterRoom() : leaveRoom(index)));
  dialog.addEventListener('close', () => {
    room.hidden = true;
    stage.hidden = false;
    dialog.classList.remove('is-room');
    overview.setAttribute('aria-pressed', 'false');
    overview.setAttribute('aria-label', dialog.dataset.labelOverview);
  });

  close.addEventListener('click', closeViewer);
  previous.addEventListener('click', () => showPhotograph(index - 1, -1));
  next.addEventListener('click', () => showPhotograph(index + 1, 1));
  previous.hidden = next.hidden = photographs.length < 2;
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    if (!room.hidden) leaveRoom(index);
    else closeViewer();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll('button:not([disabled])'))
        .filter(button => !button.closest('[hidden]') && button.getClientRects().length);
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
    if (!room.hidden) return;
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
