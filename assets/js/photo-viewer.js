// Each article is its own album. No gallery list or content rewrite is needed.
function initializePhotoViewer() {
  const content = document.querySelector('.reportage-content');
  const dialog = document.querySelector('#photo-viewer');
  if (!content || !dialog || typeof dialog.showModal !== 'function') return;

  // Keep deliberately linked images and explicit opt-outs available as authored.
  const photographs = Array.from(content.querySelectorAll('img:not([data-no-viewer])'))
    .filter(image => !image.closest('a, button'));
  if (!photographs.length) return;

  // Phone version below 800px (27 November 2026): the same viewer, lighter,
  // without the wall (see _photo-viewer.scss; keep aligned with
  // _breakpoints.scss). Every width now opens the viewer.
  const phone = matchMedia('(max-width: 800px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Wording comes from _data/translations.yml through data attributes on the dialog.
  const text = (key, fallback, values = {}) => Object.entries(values)
    .reduce((result, [name, value]) => result.replace(`{${name}}`, value), dialog.dataset[key] || fallback);

  const stage = dialog.querySelector('.photo-viewer-stage');
  const paper = dialog.querySelector('.photo-viewer-paper');
  const displayed = dialog.querySelector('.photo-viewer-image');
  const facing = dialog.querySelector('.photo-viewer-facing');
  const message = dialog.querySelector('.photo-viewer-message');
  const counter = dialog.querySelector('.photo-viewer-counter');
  const edition = dialog.querySelector('.photo-viewer-edition');
  const previous = dialog.querySelector('.photo-viewer-previous');
  const next = dialog.querySelector('.photo-viewer-next');
  const close = dialog.querySelector('.photo-viewer-close');
  const overview = dialog.querySelector('.photo-viewer-overview');
  const room = dialog.querySelector('.photo-viewer-room');
  const wall = dialog.querySelector('.photo-viewer-wall');
  const sizer = dialog.querySelector('.photo-viewer-size');
  let index = 0;
  let opener;
  let request = 0;
  let loadingTimer;
  let dimensions;
  let facingDimensions;
  let touchStart;
  let suppressClickUntil = 0;
  let transitions = [];
  let outgoing;
  let closing = false;
  let closeTimer;
  const fadeDuration = 410;
  const slideDuration = 900;
  // Options read from _photo-viewer.scss (27 November 2026): --viewer-turn
  // turns the pages slowly, --viewer-spreads opens two portraits side by side
  // on wide screens, --viewer-mat sets the mat around the print (a share of
  // its longer side; 0 when the photograph is printed on the page itself).
  const option = name => getComputedStyle(dialog).getPropertyValue(name).trim();
  const turnPages = () => option('--viewer-turn') === '1';
  // Two-page spreads: on a wide screen, two portraits that follow each other
  // face each other, as in an open album. The pairs are made from the start
  // of the story; a landscape or a lone portrait keeps a page to itself.
  const wide = matchMedia('(min-width: 1200px) and (min-aspect-ratio: 5/4)');
  const isPortrait = image => {
    const width = Number(image.getAttribute('width')) || image.naturalWidth;
    const height = Number(image.getAttribute('height')) || image.naturalHeight;
    return width > 0 && height > width;
  };
  let spreads = [];
  function makeSpreads() {
    spreads = [];
    const paired = option('--viewer-spreads') === '1' && wide.matches;
    for (let position = 0; position < photographs.length;) {
      const end = paired && position + 1 < photographs.length
        && isPortrait(photographs[position]) && isPortrait(photographs[position + 1])
        ? position + 1 : position;
      for (let member = position; member <= end; member++) spreads[member] = { start: position, end };
      position = end + 1;
    }
  }
  makeSpreads();
  function clearTransition() {
    transitions.forEach(animation => animation.cancel());
    transitions = [];
    outgoing?.remove();
    outgoing = undefined;
  }
  reducedMotion.addEventListener('change', clearTransition);

  // Fine-art mat (27 November 2026): 6% of the print's longer side, equal on
  // all four edges again since the photograph's number moved to the top band.
  const matOption = () => {
    const value = parseFloat(option('--viewer-mat'));
    return Number.isFinite(value) ? value : 0.06;
  };
  let matRatio = 0.06;
  const matBottomFactor = 1;
  function fitSpread(availableWidth, availableHeight) {
    // Both portraits at the same height, a mat around the pair and twice the
    // mat between them, where the album folds.
    const unit = 1000;
    const left = dimensions.width / dimensions.height * unit;
    const right = facingDimensions.width / facingDimensions.height * unit;
    const mat = unit * matRatio;
    const scale = Math.min(
      availableWidth / (left + right + 4 * mat),
      availableHeight / (unit + 2 * mat),
      Math.min(dimensions.height, facingDimensions.height) / unit
    );
    if (scale <= 0) return;
    const side = mat * scale;
    displayed.style.width = `${left * scale}px`;
    displayed.style.height = `${unit * scale}px`;
    facing.style.width = `${right * scale}px`;
    facing.style.height = `${unit * scale}px`;
    paper.style.padding = `${side}px`;
    paper.style.setProperty('--mat-side', `${side}px`);
    paper.style.setProperty('--mat-bottom', `${side}px`);
    paper.style.setProperty('--fold', `${side * 2 + left * scale}px`);
  }
  function fitPrint() {
    if (!dialog.open || !dimensions) return;
    matRatio = matOption();
    const { width: availableWidth, height: availableHeight } = stage.getBoundingClientRect();
    if (facingDimensions) {
      fitSpread(availableWidth, availableHeight);
      return;
    }
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

  // The number turns like the wheels of a mechanical counter (27 November
  // 2026): each character sits in its own window, and only the figures that
  // change roll, upwards when moving forward, downwards when moving back.
  // The units turn first, the tens a moment later. Without motion if less
  // motion is wanted.
  let editionValue = '';
  let editionRolls = [];
  // Snaps a roll still under way to its end at once, so that a quick
  // succession of photographs never stacks figures in a window. The
  // animations' own promises settle too late for that (asynchronously).
  function stopRolls() {
    editionRolls.forEach(({ animations, settle }) => {
      animations.forEach(animation => animation.cancel());
      settle();
    });
    editionRolls = [];
  }
  function writeEdition(value) {
    stopRolls();
    edition.replaceChildren(...Array.from(value, character => {
      const window = document.createElement('span');
      window.className = 'photo-viewer-digit';
      const face = document.createElement('span');
      face.textContent = character;
      window.append(face);
      return window;
    }));
    editionValue = value;
  }
  function setEdition(value, direction) {
    if (value === editionValue) return;
    const previous = editionValue;
    if (!previous || previous.length !== value.length || !direction || reducedMotion.matches || !dialog.open) {
      writeEdition(value);
      return;
    }
    stopRolls();
    const windows = Array.from(edition.children);
    const changed = Array.from(value).map((character, position) => position)
      .filter(position => value[position] !== previous[position]);
    changed.forEach(position => {
      const window = windows[position];
      const outgoingFace = window.firstElementChild;
      const incomingFace = document.createElement('span');
      incomingFace.textContent = value[position];
      incomingFace.className = 'is-incoming';
      window.append(incomingFace);
      // Positions further left (tens) turn a little after the units.
      const delay = (changed[changed.length - 1] - position) * 70;
      const options = { duration: 520, delay, easing: 'cubic-bezier(0.5, 0, 0.15, 1)', fill: 'backwards' };
      const leaving = outgoingFace.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(${-110 * direction}%)` }],
        { ...options, fill: 'forwards' }
      );
      const arriving = incomingFace.animate(
        [{ transform: `translateY(${110 * direction}%)` }, { transform: 'translateY(0)' }],
        options
      );
      const roll = {
        animations: [leaving, arriving],
        settle() {
          outgoingFace.remove();
          incomingFace.classList.remove('is-incoming');
        }
      };
      arriving.finished.then(() => {
        roll.settle();
        editionRolls = editionRolls.filter(item => item !== roll);
      }, () => {});
      editionRolls.push(roll);
    });
    editionValue = value;
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
    const previousIndex = index;
    index = spreads[(newIndex + photographs.length) % photographs.length].start;
    const current = photographs[index];
    const partner = spreads[index].end !== index ? photographs[spreads[index].end] : undefined;
    const token = ++request;
    clearTimeout(loadingTimer);
    stage.setAttribute('aria-busy', 'true');
    const canTransition = direction && !paper.hidden && !reducedMotion.matches;
    message.hidden = true;
    const number = position => String(position + 1).padStart(2, '0');
    counter.textContent = `${number(index)}${partner ? `–${number(index + 1)}` : ''} / ${number(photographs.length - 1)}`;
    setEdition(counter.textContent, direction || Math.sign(index - previousIndex));
    counter.setAttribute('aria-label', partner
      ? text('labelCounterSpread', 'Photographies {n} et {m} sur {total}', { n: index + 1, m: index + 2, total: photographs.length })
      : text('labelCounter', 'Photographie {n} sur {total}', { n: index + 1, total: photographs.length }));
    loadingTimer = setTimeout(() => {
      if (token !== request || !dialog.open) return;
      message.textContent = text('labelLoading', 'Chargement de la photographie…');
      message.hidden = false;
    }, 300);

    const image = new Image();
    image.src = sourceFor(current);
    let facingImage;
    if (partner) {
      facingImage = new Image();
      facingImage.src = sourceFor(partner);
    }
    try {
      await Promise.all([image.decode(), facingImage?.decode()]);
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
      facingDimensions = facingImage ? { width: facingImage.naturalWidth, height: facingImage.naturalHeight } : undefined;
      facing.hidden = !facingImage;
      paper.classList.toggle('is-spread', Boolean(facingImage));
      if (facingImage) {
        facing.src = facingImage.src;
        facing.alt = partner.alt;
      } else {
        facing.removeAttribute('src');
        facing.style.width = facing.style.height = '';
      }
      paper.hidden = false;
      fitPrint();
      if (outgoing) {
        // Walking along the wall (27 November 2026): the old print slides away
        // and fades while the new one arrives from the other side, both at
        // once, slowly. Skipped when less motion is wanted (see canTransition).
        // In the album, a page turns (27 November 2026): a slow cross-fade
        // with only a slight drift, the new page settling as the old one
        // lifts away.
        const turning = turnPages();
        const distance = (turning ? Math.min(28, stageBounds.width * 0.02) : Math.min(120, stageBounds.width * 0.08)) * direction;
        const options = turning
          ? { duration: 1200, easing: 'cubic-bezier(0.35, 0, 0.25, 1)' }
          : { duration: slideDuration, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' };
        // The old page has mostly lifted before the new one appears, so the
        // two photographs barely overlap.
        transitions = [
          outgoing.animate(turning ? [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: `translateX(${-distance * 0.6}px)`, offset: 0.6 },
            { opacity: 0, transform: `translateX(${-distance}px)` }
          ] : [
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: `translateX(${-distance}px)` }
          ], { ...options, fill: 'forwards' }),
          paper.animate(turning ? [
            { opacity: 0, transform: `translateX(${distance}px)` },
            { opacity: 0, transform: `translateX(${distance * 0.7}px)`, offset: 0.3 },
            { opacity: 1, transform: 'translateX(0)' }
          ] : [
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
      if (spreads[index].end !== index) warmNeighbour(2);
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
    if (dialog.open) return;
    opener = image;
    dimensions = undefined;
    paper.hidden = true;
    writeEdition('');
    makeSpreads();
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
    opener?.focus({ preventScroll: true });
  });

  photographs.forEach((image, position) => {
    image.classList.add('photo-viewer-trigger');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    image.setAttribute('aria-controls', 'photo-viewer');
    image.setAttribute('aria-label', `${text('labelEnlarge', 'Agrandir la photographie {n} sur {total}', { n: position + 1, total: photographs.length })}${image.alt ? `${document.documentElement.lang.startsWith('fr') ? ' : ' : ': '}${image.alt}` : ''}`);
    image.addEventListener('click', () => openViewer(image, position));
    image.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openViewer(image, position);
    });
  });

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
    // The prints are large on the wall: the browser picks, from the article's
    // own WebP versions, the one that suits their size on screen (at most
    // 360px high, see _photo-viewer.scss).
    const ratio = image.getAttribute('width') && image.getAttribute('height')
      ? image.getAttribute('width') / image.getAttribute('height')
      : 1.5;
    thumbnail.dataset.ratio = ratio;
    if (image.srcset) {
      thumbnail.srcset = image.srcset;
      thumbnail.sizes = `${Math.round(360 * ratio)}px`;
    }
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
  // The size slider (27 November 2026): it sets the height of the prints,
  // from small to as tall as the room allows. Once released, each print asks
  // the browser for the WebP version that suits its new size.
  const thumbnails = frames.map(frame => frame.querySelector('img'));
  function fitSizer() {
    const roomHeight = room.clientHeight;
    if (!roomHeight) return;
    sizer.max = Math.max(Number(sizer.min) + 40, Math.round(roomHeight * 0.78));
    if (!wall.style.getPropertyValue('--wall-print-height')) {
      sizer.value = Math.round(parseFloat(getComputedStyle(thumbnails[0]).height)) || sizer.value;
    }
  }
  sizer.addEventListener('input', () => {
    wall.style.setProperty('--wall-print-height', `${sizer.value}px`);
  });
  sizer.addEventListener('change', () => {
    thumbnails.forEach(thumbnail => {
      if (thumbnail.srcset) thumbnail.sizes = `${Math.round(sizer.value * thumbnail.dataset.ratio)}px`;
    });
  });
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
    fitSizer();
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
  // No wall on phones: leave it if the window narrows while it is shown.
  phone.addEventListener('change', () => {
    if (phone.matches && !room.hidden) leaveRoom(index);
  });
  overview.addEventListener('click', () => (room.hidden ? enterRoom() : leaveRoom(index)));
  dialog.addEventListener('close', () => {
    room.hidden = true;
    stage.hidden = false;
    dialog.classList.remove('is-room');
    overview.setAttribute('aria-pressed', 'false');
    overview.setAttribute('aria-label', dialog.dataset.labelOverview);
  });

  // One page (or one spread) at a time.
  const following = () => spreads[index].end + 1;
  wide.addEventListener('change', () => {
    makeSpreads();
    if (dialog.open && room.hidden && !closing) showPhotograph(index);
  });
  close.addEventListener('click', closeViewer);
  previous.addEventListener('click', () => showPhotograph(index - 1, -1));
  next.addEventListener('click', () => showPhotograph(following(), 1));
  previous.hidden = next.hidden = photographs.length < 2;
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    if (!room.hidden) leaveRoom(index);
    else closeViewer();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll('button:not([disabled]), input'))
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
    const destinations = { ArrowLeft: index - 1, ArrowRight: following(), Home: 0, End: photographs.length - 1 };
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
    showPhotograph(dx < 0 ? following() : index - 1, dx < 0 ? 1 : -1);
  });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitPrint).observe(stage);
  else window.addEventListener('resize', fitPrint);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePhotoViewer, { once: true });
} else {
  initializePhotoViewer();
}
