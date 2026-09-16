/* Progressive enhancement: native anchors and the active fill work without JS. */
(() => {
  const bar = document.querySelector('.topbar');
  const nav = bar?.querySelector('.nav-links');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const lens = document.createElement('span');
  lens.className = 'nav-lens';
  lens.setAttribute('aria-hidden', 'true');
  nav.prepend(lens);
  nav.classList.add('has-lens');
  let hovered = null;
  let frame = 0;
  let lightFrame = 0;
  let lastGeometry = '';
  let barBounds = null;
  let lightX = 0;
  let lightY = 0;

  const positionLens = () => {
    frame = 0;
    const focused = links.includes(document.activeElement) ? document.activeElement : null;
    const keyboardFocused = links.find(link => link.matches(':focus-visible'));
    const selected = links.find(link => link.classList.contains('active'));
    const target = keyboardFocused || hovered || focused || selected;
    if (!target) {
      lens.classList.remove('is-visible');
      lastGeometry = '';
      return;
    }
    // Native layout coordinates are stable while labels receive a press transform.
    const x = target.offsetLeft;
    const width = target.offsetWidth;
    const geometry = `${x}:${width}`;
    if (geometry !== lastGeometry) {
      lens.style.setProperty('--lens-x', `${x}px`);
      lens.style.setProperty('--lens-width', `${width}px`);
      lastGeometry = geometry;
    }
    lens.classList.add('is-visible');
  };
  const scheduleLens = () => {
    if (!frame) frame = requestAnimationFrame(positionLens);
  };

  links.forEach(link => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || !finePointer.matches) return;
      hovered = link;
      scheduleLens();
    });
    link.addEventListener('pointerleave', () => {
      hovered = null;
      scheduleLens();
    });
    link.addEventListener('pointerdown', () => lens.classList.add('is-pressed'));
    link.addEventListener('focus', scheduleLens);
    link.addEventListener('blur', scheduleLens);
  });
  const release = () => lens.classList.remove('is-pressed');
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  window.addEventListener('blur', release);

  // Observe only link state. No scroll handler or perpetual animation loop.
  const observer = new MutationObserver(scheduleLens);
  links.forEach(link => observer.observe(link, { attributes: true, attributeFilter: ['class'] }));
  new ResizeObserver(() => {
    barBounds = null;
    lastGeometry = '';
    scheduleLens();
  }).observe(nav);
  document.fonts?.ready.then(scheduleLens);

  const canLight = () => finePointer.matches && !reducedMotion.matches && !reducedTransparency.matches;
  const paintLight = () => {
    lightFrame = 0;
    bar.style.setProperty('--glass-x', `${lightX}px`);
    bar.style.setProperty('--glass-y', `${lightY}px`);
  };
  const moveLight = event => {
    if (!canLight() || event.pointerType === 'touch') return;
    if (!barBounds) barBounds = bar.getBoundingClientRect();
    lightX = event.clientX - barBounds.left;
    lightY = event.clientY - barBounds.top;
    if (!lightFrame) lightFrame = requestAnimationFrame(paintLight);
    bar.classList.add('is-lit');
  };
  bar.addEventListener('pointerenter', event => {
    barBounds = bar.getBoundingClientRect();
    moveLight(event);
  });
  bar.addEventListener('pointermove', moveLight, { passive: true });
  const clearLight = () => {
    bar.classList.remove('is-lit');
    if (lightFrame) cancelAnimationFrame(lightFrame);
    lightFrame = 0;
  };
  bar.addEventListener('pointerleave', clearLight);
  window.addEventListener('blur', clearLight);
  reducedMotion.addEventListener('change', clearLight);
  reducedTransparency.addEventListener('change', clearLight);
  finePointer.addEventListener('change', clearLight);
  window.addEventListener('resize', () => { barBounds = null; }, { passive: true });
  positionLens();
})();
