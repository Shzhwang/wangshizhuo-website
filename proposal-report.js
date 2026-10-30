(() => {
  const root = document.querySelector('#proposal.proposal-report');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...root.querySelectorAll('[data-pe-tab]')];
  const panels = [...root.querySelectorAll('[data-pe-panel]')];
  const exhibit = root.querySelector('.pe-exhibit');
  let active = 'reason';
  let animations = [];

  function show(mode, animate = true) {
    if (!panels.some(panel => panel.dataset.pePanel === mode)) return;
    animations.forEach(animation => animation.cancel());
    animations = [];
    active = mode;
    tabs.forEach(tab => {
      const selected = tab.dataset.peTab === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.pePanel !== mode; });
    exhibit.dataset.peMode = mode;
    if (animate && !reduced.matches) {
      const panel = panels.find(item => !item.hidden);
      animations.push(panel.animate(
        [{ opacity: .5, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 330, easing: 'cubic-bezier(.2,.75,.25,1)' }
      ));
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.peTab !== active) show(tab.dataset.peTab);
    });
    tab.addEventListener('keydown', event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        event.key === 'ArrowRight' ? (index + 1) % tabs.length :
        event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : null;
      if (next === null) return;
      event.preventDefault();
      show(tabs[next].dataset.peTab);
      tabs[next].focus();
    });
  });
  root.classList.add('pe-ready');
  root.querySelector('.pe-exhibit-tabs').hidden = false;
  show(new URL(location.href).searchParams.get('rp-study') === 'sources' ? 'source' : 'reason', false);

  const legacy = {
    '#proposal-context': 'questions',
    '#proposal-studies': new URL(location.href).searchParams.get('rp-study') === 'sources' ? 'sources' : 'explanation',
    '#proposal-outcomes': 'outcomes'
  };
  if (legacy[location.hash]) location.replace('research-plan.html#' + legacy[location.hash]);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (reduced.matches) return;
      const targets = [root.querySelector('.pe-question'), exhibit, root.querySelector('.pe-route')];
      targets.forEach((target, i) => target.animate(
        [{ transform: 'translateY(14px)', opacity: .6 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 540, delay: i * 75, easing: 'cubic-bezier(.2,.75,.25,1)' }
      ));
    }, { threshold: .15 });
    observer.observe(root);
  }
})();
