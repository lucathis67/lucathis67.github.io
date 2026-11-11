(() => {
  const source = document.getElementById('slideshow-data');
  const carousel = document.querySelector('.home-slideshow');
  if (!source || !carousel) return;
  const slides = JSON.parse(source.textContent);
  const track = carousel.querySelector('.slideshow-track');
  const template = track.querySelector('.slideshow-slide');
  // Two neighbours on each side prevent an empty edge during a transition.
  while (track.children.length < 5) track.append(template.cloneNode(true));
  const slots = [...track.children];
  const status = carousel.querySelector('.slideshow-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let busy = false;
  let animation;
  let generation = 0;
  let drag = null;
  let suppressClickUntil = 0;
  const centre = position => {
    const slot = slots[position];
    return -(slot.offsetLeft + slot.getBoundingClientRect().width / 2);
  };
  const align = () => { track.style.transform = `translateX(${centre(2)}px)`; };
  const render = async () => {
    const current = ++generation;
    await Promise.all(slots.map(async (slot, position) => {
      const slide = slides[(index + position - 2 + slides.length * 2) % slides.length];
      const src = slide.src;
      const loaded = new Image();
      loaded.src = src;
      try { await loaded.decode(); } catch { return; }
      if (current !== generation) return;
      const image = slot.querySelector('img');
      image.width = loaded.naturalWidth;
      image.height = loaded.naturalHeight;
      image.src = slide.src;
      image.alt = position === 2 ? slide.alt : '';
      const interactive = position === 1 || position === 3;
      slot.setAttribute('aria-hidden', position === 0 || position === 4 ? 'true' : 'false');
      slot.tabIndex = interactive ? 0 : -1;
      if (interactive) {
        slot.setAttribute('role', 'button');
        slot.setAttribute('aria-label', position === 1 ? 'Photographie précédente' : 'Photographie suivante');
      } else {
        slot.removeAttribute('role');
        slot.removeAttribute('aria-label');
      }
      slot.classList.toggle('is-neighbour', interactive);
    }));
    if (current !== generation) return;
    align();
    status.textContent = `${index + 1} / ${slides.length}`;
  };
  const show = async (step, offset = 0) => {
    if (busy) return;
    busy = true;
    if (!reduced.matches) {
      animation = track.animate([
        { transform: `translateX(${centre(2) + offset}px)` },
        { transform: `translateX(${centre(2 + step)}px)` }
      ], { duration: 550, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
      try { await animation.finished; } catch { animation = null; busy = false; return; }
    }
    index = (index + step + slides.length) % slides.length;
    await render();
    animation?.cancel();
    animation = null;
    busy = false;
  };
  slots.forEach((slot, position) => {
    const activate = () => {
      if (position === 1 || position === 3) show(position === 1 ? -1 : 1);
    };
    slot.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
      activate();
    });
    slot.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
  new ResizeObserver(() => {
    drag = null;
    carousel.querySelector('.slideshow-window').classList.remove('is-dragging');
    if (animation) animation.cancel();
    align();
  }).observe(carousel.querySelector('.slideshow-window'));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(event.key === 'ArrowRight' ? 1 : -1);
  });
  const windowElement = carousel.querySelector('.slideshow-window');
  // Let the browser handle vertical page scrolling and pinch zoom; capture only
  // deliberate horizontal gestures, including those starting on the centre image.
  windowElement.addEventListener('dragstart', event => event.preventDefault());
  windowElement.addEventListener('pointerdown', event => {
    if (busy || !event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: 0, horizontal: false };
  });
  windowElement.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) { drag = null; return; }
      drag.horizontal = true;
      windowElement.setPointerCapture(event.pointerId);
      windowElement.classList.add('is-dragging');
    }
    const limit = Math.abs(centre(dx < 0 ? 3 : 1) - centre(2));
    drag.offset = Math.max(-limit, Math.min(limit, dx));
    track.style.transform = `translateX(${centre(2) + drag.offset}px)`;
  });
  const finishDrag = (event, cancelled = false) => {
    if (!drag || event.pointerId !== drag.id) return;
    const finished = drag;
    drag = null;
    windowElement.classList.remove('is-dragging');
    if (windowElement.hasPointerCapture(event.pointerId)) windowElement.releasePointerCapture(event.pointerId);
    if (!finished.horizontal) return;
    suppressClickUntil = performance.now() + 500;
    const threshold = Math.min(60, windowElement.clientWidth * 0.12);
    const step = !cancelled && Math.abs(finished.offset) >= threshold ? (finished.offset < 0 ? 1 : -1) : 0;
    show(step, finished.offset);
  };
  windowElement.addEventListener('pointerup', event => finishDrag(event));
  windowElement.addEventListener('pointercancel', event => finishDrag(event, true));
  windowElement.addEventListener('lostpointercapture', event => {
    // Touch implicitly captures on the image. Its capture-loss event bubbles
    // here when we transfer capture to the window; that is not a cancelled drag.
    if (event.target === windowElement) finishDrag(event, true);
  });
  render();
})();
