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
  const show = async step => {
    if (busy) return;
    busy = true;
    if (!reduced.matches) {
      animation = track.animate([
        { transform: `translateX(${centre(2)}px)` },
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
    slot.addEventListener('click', activate);
    slot.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
  new ResizeObserver(() => {
    if (animation) animation.cancel();
    align();
  }).observe(carousel.querySelector('.slideshow-window'));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(event.key === 'ArrowRight' ? 1 : -1);
  });
  let start;
  carousel.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    start = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) show(dx < 0 ? 1 : -1);
    start = null;
  }, { passive: true });
  render();
})();
