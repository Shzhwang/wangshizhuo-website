(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  document.querySelectorAll('[data-measure-set]').forEach(set => {
    const tabs = [...set.querySelectorAll('[data-measure-tab]')];
    const panels = [...set.querySelectorAll('[data-measure-panel]')];
    if (!tabs.length || tabs.some(tab => !panels.some(panel => panel.id === tab.getAttribute('aria-controls')))) return;
    function select(index, animate = true) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach(panel => {
        running.get(panel)?.cancel();
        running.delete(panel);
        panel.hidden = panel.id !== tabs[index].getAttribute('aria-controls');
        if (!panel.hidden && animate && !reducedMotion.matches) {
          const effect = panel.animate([{ opacity: .5, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'cubic-bezier(.22,.75,.25,1)' });
          running.set(panel, effect);
          effect.finished.then(() => { if (running.get(panel) === effect) running.delete(panel); }).catch(() => {});
        }
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault(); select(next); tabs[next].focus();
      });
    });
    select(0, false);
    set.classList.add('is-ready');
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { running.forEach(effect => effect.cancel()); running.clear(); }
  });
})();
