(() => {
  const body = document.body;
  const panels = [...document.querySelectorAll('[data-rp-panel]')];
  if (!panels.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = [...document.querySelectorAll('[data-rp-chapter]')];
  const content = document.querySelector('.rp-content');
  let currentChapter;
  let chapterAnimation;

  function readChapter() {
    const hash = location.hash.slice(1);
    if (panels.some(panel => panel.id === hash)) return hash;
    const params = new URL(location.href).searchParams;
    if (params.get('chapter') === 'contributions') return 'outcomes';
    if (params.get('chapter') === 'methods') {
      return { interviews: 'questions', explanation: 'explanation', sources: 'sources' }[params.get('study')] || 'explanation';
    }
    return 'questions';
  }

  function selectChapter(id, options = {}) {
    const active = panels.find(panel => panel.id === id);
    if (!active) return;
    chapterAnimation?.cancel();
    panels.forEach(panel => {
      panel.hidden = panel !== active;
      panel.classList.toggle('is-active', panel === active);
    });
    navigation.forEach(link => {
      if (link.dataset.rpChapter === id && link.closest('.rp-chapters')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    currentChapter = id;
    content.setAttribute('aria-labelledby', active.getAttribute('aria-labelledby'));
    const heading = active.querySelector('.rp-chapter-heading h1, .rp-chapter-heading h2');
    document.title = heading.textContent.replace(/\s+/g, ' ') + ' · 王世卓研究计划';
    if (options.history) {
      const url = new URL(location.href);
      url.hash = id;
      url.searchParams.delete('chapter');
      url.searchParams.delete('study');
      history.pushState({ chapter: id }, '', url);
    }
    if (options.scroll) window.scrollTo({ top: 0, behavior: 'instant' });
    if (options.focus) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    if (options.animate && !reduced.matches) {
      chapterAnimation = active.animate(
        [{ opacity: .5, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 320, easing: 'cubic-bezier(.2,.75,.25,1)' }
      );
    }
    if (id === 'sources' && !sourcePositioned) requestAnimationFrame(() => positionSource(false));
  }

  navigation.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const id = link.dataset.rpChapter;
    if (id === currentChapter) return;
    selectChapter(id, { history: true, animate: true, scroll: true, focus: !link.closest('.rp-chapters') });
  }));
  window.addEventListener('popstate', () => selectChapter(readChapter(), { scroll: true }));
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (panels.some(panel => panel.id === id) && id !== currentChapter) selectChapter(id, { scroll: true });
  });
  document.querySelector('.rp-skip').addEventListener('click', event => {
    event.preventDefault();
    content.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  const reasonButtons = [...document.querySelectorAll('[data-rp-reason]')];
  const reasonFigure = document.querySelector('#rp-reason-illustration');
  reasonFigure.setAttribute('role', 'tabpanel');
  reasonFigure.tabIndex = 0;
  const reasonCopy = {
    feature: ['特点说明', '介绍推荐食物的营养或备餐特点，同时保留必要适用条件。'],
    relation: ['关联解释', '将这些食物特点与案例中的膳食要求、生活条件联系起来，说明为什么推荐。']
  };
  function selectReason(mode) {
    if (!reasonCopy[mode]) return;
    reasonButtons.forEach(button => {
      const selected = button.dataset.rpReason === mode;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    reasonFigure.dataset.rpReasonState = mode;
    reasonFigure.setAttribute('aria-labelledby', 'rp-reason-' + mode);
    document.querySelector('[data-rp-reason-title]').textContent = reasonCopy[mode][0];
    document.querySelector('[data-rp-reason-description]').textContent = reasonCopy[mode][1];
  }
  reasonButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectReason(button.dataset.rpReason));
    button.addEventListener('keydown', event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? reasonButtons.length - 1 :
        event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? 1 - index : null;
      if (next === null) return;
      event.preventDefault();
      selectReason(reasonButtons[next].dataset.rpReason);
      reasonButtons[next].focus();
    });
  });

  const sourceStage = document.querySelector('.rp-source-stage');
  const locationButtons = [...document.querySelectorAll('[data-rp-location]')];
  const layoutButtons = [...document.querySelectorAll('[data-rp-layout]')];
  const documentButtons = [...document.querySelectorAll('[data-rp-document]')];
  const sourceScroller = document.querySelector('[data-rp-source-scroll]');
  const sourceTabs = document.querySelector('.rp-source-tabs');
  let locationMode = 'home';
  let layoutMode = 'switch';
  let documentMode = 'source';
  let sourcePositioned = false;

  function positionSource(animate) {
    if (!sourceScroller || currentChapter !== 'sources' ||
        (layoutMode === 'switch' && documentMode !== 'source')) return;
    const target = document.querySelector(locationMode === 'located' ? '[data-rp-source-passage]' : '[data-rp-source-home]');
    const top = sourceScroller.scrollTop + target.getBoundingClientRect().top - sourceScroller.getBoundingClientRect().top;
    sourceScroller.scrollTo({ top: Math.max(0, top), behavior: animate && !reduced.matches ? 'smooth' : 'instant' });
    sourcePositioned = true;
  }

  function updateSource(shouldPosition = false, animate = true) {
    sourceStage.dataset.rpLocationState = locationMode;
    sourceStage.dataset.rpLayoutState = layoutMode;
    sourceStage.dataset.rpDocumentState = documentMode;
    locationButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rpLocation === locationMode)));
    layoutButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rpLayout === layoutMode)));
    documentButtons.forEach(button => {
      const active = button.dataset.rpDocument === documentMode;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    sourceTabs.hidden = layoutMode === 'parallel';
    const answer = document.querySelector('.rp-answer-sheet');
    const original = document.querySelector('.rp-source-sheet');
    answer.hidden = layoutMode === 'switch' && documentMode !== 'answer';
    original.hidden = layoutMode === 'switch' && documentMode !== 'source';
    [answer, original].forEach((panel, index) => {
      if (layoutMode === 'switch') {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', documentButtons[index].id);
        panel.tabIndex = 0;
      } else {
        panel.removeAttribute('role');
        panel.removeAttribute('tabindex');
        panel.setAttribute('aria-labelledby', panel.querySelector('h3').id);
      }
    });
    const names = {
      'home-switch': ['普通查阅 · 首页 ＋ 切换', '打开原文首页后自行查找，建议与原文切换查看。'],
      'located-switch': ['仅段落定位 · 定位 ＋ 切换', '打开原文时定位至相关段落，建议与原文切换查看。'],
      'home-parallel': ['仅并排呈现 · 首页 ＋ 并排', '打开原文首页后自行查找，建议与完整原文并排显示。'],
      'located-parallel': ['两项功能同时提供 · 定位 ＋ 并排', '打开原文时定位至相关段落，建议与完整原文并排显示。']
    };
    const copy = names[locationMode + '-' + layoutMode];
    document.querySelector('[data-rp-source-condition]').textContent = copy[0];
    document.querySelector('[data-rp-source-description]').textContent = copy[1];
    if (shouldPosition) requestAnimationFrame(() => positionSource(animate));
  }

  locationButtons.forEach(button => button.addEventListener('click', () => {
    locationMode = button.dataset.rpLocation;
    documentMode = 'source';
    updateSource(true);
  }));
  layoutButtons.forEach(button => button.addEventListener('click', () => {
    layoutMode = button.dataset.rpLayout;
    updateSource(false, false);
  }));
  documentButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      documentMode = button.dataset.rpDocument;
      updateSource(false, false);
    });
    button.addEventListener('keydown', event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 :
        event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? 1 - index : null;
      if (next === null) return;
      event.preventDefault();
      documentMode = documentButtons[next].dataset.rpDocument;
      updateSource(false, false);
      documentButtons[next].focus();
    });
  });

  document.querySelectorAll('.rp-details').forEach(details => {
    const indicator = details.querySelector('summary span');
    details.addEventListener('toggle', () => { indicator.textContent = details.open ? '－' : '＋'; });
  });
  body.classList.add('rp-enhanced');
  selectReason('feature');
  updateSource(false, false);
  selectChapter(readChapter());
})();
