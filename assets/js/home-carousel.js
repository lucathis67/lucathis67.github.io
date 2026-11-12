(() => {
  const carousel = document.querySelector('.home-slideshow');
  if (!carousel || typeof Glide === 'undefined') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const status = carousel.querySelector('.slideshow-status');
  const track = carousel.querySelector('.slideshow-window');
  let suppressClickUntil = 0;

  // Glide's component API lets its standard drag/transition/clone components
  // work with the natural widths of equally tall portrait and landscape images.
  function NaturalTranslate(glide, components, events) {
    const set = (jump = false) => {
      const wrapper = components.Html.wrapper;
      const originals = components.Html.slides;
      let target = originals[glide.index];
      if (!jump && components.Run.isOffset()) {
        const candidates = [...wrapper.children].filter(slide =>
          Number(slide.dataset.slideIndex) === glide.index);
        target = components.Run.isOffset('>')
          ? candidates.find(slide => slide.offsetLeft > originals[originals.length - 1].offsetLeft)
          : candidates.reverse().find(slide => slide.offsetLeft < originals[0].offsetLeft);
      }
      if (!target) return;
      const position = target.offsetLeft + target.offsetWidth / 2 - track.clientWidth / 2;
      wrapper.style.transform = `translate3d(${-position + components.Move.offset}px, 0, 0)`;
    };
    events.on('move', () => {
      set();
      if (components.Run.isOffset()) {
        components.Transition.after(() => {
          events.emit('translate.jump');
          set(true);
        });
      }
    });
    events.on(['mount.after', 'resize', 'update'], () => requestAnimationFrame(() => set(true)));
    events.on('destroy', () => { components.Html.wrapper.style.transform = ''; });
    return { set };
  }

  const glide = new Glide(carousel, {
    type: 'carousel',
    perView: 1,
    focusAt: 'center',
    gap: 24,
    cloningRatio: 3,
    autoplay: false,
    keyboard: false,
    perTouch: 1,
    swipeThreshold: 40,
    dragThreshold: 40,
    touchAngle: 45,
    animationDuration: reduced.matches ? 0 : 550,
    animationTimingFunc: 'cubic-bezier(.22,.61,.36,1)',
    breakpoints: { 800: { gap: 12 } }
  });

  function updateAccessibility() {
    const slides = [...carousel.querySelectorAll('.glide__slide')];
    const originals = slides.filter(slide => !slide.classList.contains('glide__slide--clone'));
    const active = originals[glide.index];
    const centre = track.getBoundingClientRect().left + track.clientWidth / 2;
    slides.forEach(slide => {
      const bounds = slide.getBoundingClientRect();
      const visible = bounds.right > 0 && bounds.left < document.documentElement.clientWidth;
      const neighbour = visible && slide !== active;
      slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
      slide.tabIndex = neighbour ? 0 : -1;
      slide.classList.toggle('is-neighbour', neighbour);
      if (neighbour) {
        slide.setAttribute('role', 'button');
        slide.setAttribute('aria-label', bounds.left + bounds.width / 2 < centre ? 'Photographie précédente' : 'Photographie suivante');
      } else {
        slide.removeAttribute('role');
        slide.removeAttribute('aria-label');
      }
    });
    status.textContent = `${glide.index + 1} / ${originals.length}`;
  }
  glide.on(['mount.after', 'run.after', 'resize', 'update'], () => requestAnimationFrame(() => requestAnimationFrame(updateAccessibility)));
  glide.on('move.after', updateAccessibility);
  glide.on('swipe.move', () => { suppressClickUntil = performance.now() + 400; });
  const activate = event => {
    const slide = event.target.closest('.is-neighbour');
    if (!slide || glide.disabled || performance.now() < suppressClickUntil) return;
    const bounds = slide.getBoundingClientRect();
    glide.go(bounds.left + bounds.width / 2 < track.getBoundingClientRect().left + track.clientWidth / 2 ? '<' : '>');
  };
  carousel.addEventListener('click', activate);
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      glide.go(event.key === 'ArrowRight' ? '>' : '<');
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.is-neighbour')) {
      event.preventDefault();
      activate(event);
    }
  });
  reduced.addEventListener('change', () => glide.update({ animationDuration: reduced.matches ? 0 : 550 }));
  // Actual file dimensions also handle older metadata with approximate sizes.
  Promise.all([...carousel.querySelectorAll('.glide__slide img')].map(async image => {
    try { await image.decode(); } catch { return; }
    image.closest('.glide__slide').style.setProperty('--slide-ratio', image.naturalWidth / image.naturalHeight);
  })).then(() => glide.mount({ Translate: NaturalTranslate }));
})();
