(() => {
  'use strict';
  const section = document.querySelector('#research.research-playground');
  if (!section) return;
  const tabs = [...section.querySelectorAll('[data-desk-tab]')];
  const panels = [...section.querySelectorAll('[data-desk-panel]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const zoom = section.querySelector('.desk-zoom');
  let zoomOrigin = null;
  section.querySelectorAll('.desk-face a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      zoomOrigin = link;
      zoom.querySelector('img').src = link.href;
      zoom.querySelector('img').alt = link.querySelector('img').alt;
      zoom.querySelector('h3').textContent = link.dataset.zoomTitle || link.closest('figure').querySelector('figcaption strong').textContent;
      zoom.showModal();
      document.body.classList.add('research-zoom-open');
    });
  });
  zoom.querySelector('button').addEventListener('click', () => zoom.close());
  zoom.addEventListener('click', event => { if (event.target === zoom) zoom.close(); });
  zoom.addEventListener('close', () => {
    document.body.classList.remove('research-zoom-open');
    zoomOrigin?.focus({preventScroll:true});
  });

  function setFace(panel, flipped) {
    const visual = panel.querySelector('.desk-visual');
    const control = panel.querySelector('.desk-flip');
    visual.classList.toggle('is-flipped', flipped);
    panel.querySelectorAll('.desk-face').forEach(face => {
      const visible = face.classList.contains('desk-back') === flipped;
      face.setAttribute('aria-hidden', String(!visible));
      face.inert = !visible;
    });
    control.setAttribute('aria-pressed', String(flipped));
    control.setAttribute('aria-label', flipped ? '翻回查看设计全貌' : '翻面查看设计解读');
    control.querySelector('span').textContent = flipped ? '翻回看设计全貌' : '翻面看设计解读';
  }

  function selectCase(tab, focus = false) {
    const id = tab.dataset.deskTab;
    section.dataset.deskCase = id;
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.dataset.deskPanel === id;
      panel.hidden = !active;
      setFace(panel, false);
      if (active && !reducedMotion.matches) {
        panel.getAnimations().forEach(animation => animation.cancel());
        panel.animate([{opacity:.4, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {
          duration:320, easing:'cubic-bezier(.2,.7,.2,1)'
        });
      }
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(tab));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      selectCase(tabs[next], true);
    });
  });

  panels.forEach(panel => {
    const detailTabs = [...panel.querySelectorAll('.desk-detail-tab')];
    const detailViews = [...panel.querySelectorAll('.desk-detail-view')];
    const selectDetail = (selected, focus = false) => {
      detailTabs.forEach((tab, i) => {
        const active = tab === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        detailViews[i].hidden = !active;
      });
      if (focus) selected.focus();
    };
    detailTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectDetail(tab));
      tab.addEventListener('keydown', event => {
        let next = null;
        if (event.key === 'ArrowDown') next = (index + 1) % detailTabs.length;
        if (event.key === 'ArrowUp') next = (index + detailTabs.length - 1) % detailTabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = detailTabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        selectDetail(detailTabs[next], true);
      });
    });
    const visual = panel.querySelector('.desk-visual');
    const flip = panel.querySelector('.desk-flip');
    flip.addEventListener('click', () => setFace(panel, flip.getAttribute('aria-pressed') !== 'true'));
    let frame = 0;
    const resetTilt = () => {
      cancelAnimationFrame(frame);
      visual.style.removeProperty('--desk-rx');
      visual.style.removeProperty('--desk-ry');
    };
    visual.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = visual.getBoundingClientRect();
        const x = Math.max(-.5, Math.min(.5, (event.clientX-r.left)/r.width-.5));
        const y = Math.max(-.5, Math.min(.5, (event.clientY-r.top)/r.height-.5));
        visual.style.setProperty('--desk-rx', `${-y*3}deg`);
        visual.style.setProperty('--desk-ry', `${x*3}deg`);
      });
    }, {passive:true});
    visual.addEventListener('pointerleave', resetTilt);
    visual.addEventListener('pointercancel', resetTilt);
    window.addEventListener('blur', resetTilt);
    reducedMotion.addEventListener('change', resetTilt);
  });

  // Keep old bookmarks useful after merging the homepage project overview here.
  const redirectLegacyProjectAnchor = () => {
    if (window.location.hash !== '#projects') return;
    history.replaceState(null, '', `${location.pathname}${location.search}#research`);
    section.scrollIntoView({block:'start'});
  };
  window.addEventListener('hashchange', redirectLegacyProjectAnchor);
  redirectLegacyProjectAnchor();
})();
