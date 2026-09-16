(() => {
  const board = document.querySelector('#support-matrix.support-notes');
  if (!board) return;
  const tabs = [...board.querySelectorAll('.credential-tabs button')];
  const panels = [...board.querySelectorAll('.credential-skill-panel')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentAnimation;
  const select = (tab, focus = false, motion = true) => {
    const changed = tab.getAttribute('aria-selected') !== 'true';
    currentAnimation?.cancel();
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus({ preventScroll: true });
    const visible = panels.find(panel => !panel.hidden);
    if (changed && motion && !reduced.matches && visible?.animate) {
      currentAnimation = visible.animate([{ opacity: .3, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  };
  board.querySelector('.credential-tabs').setAttribute('role', 'tablist');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
  panels.forEach(panel => panel.setAttribute('role', 'tabpanel'));
  board.classList.add('notes-enhanced');
  select(tabs[0], false, false);
  reduced.addEventListener('change', () => { if (reduced.matches) currentAnimation?.cancel(); });
})();
