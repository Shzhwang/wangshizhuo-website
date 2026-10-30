(() => {
  const body = document.body;
  const panels = [...document.querySelectorAll('[data-rp-panel]')];
  if (!panels.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = [...document.querySelectorAll('[data-rp-chapter]')];
  const content = document.querySelector('.rp-content');
  const animations = new Map();
  let currentChapter;
  function reveal(element, distance = 7) {
    animations.get(element)?.cancel();
    if (reduced.matches || !element || element.hidden) return;
    const animation = element.animate([
      { opacity:.45, transform:`translateY(${distance}px)` },
      { opacity:1, transform:'translateY(0)' }
    ], { duration:280, easing:'cubic-bezier(.22,.75,.25,1)' });
    animations.set(element, animation);
    animation.finished.then(() => {
      if (animations.get(element) === animation) animations.delete(element);
    }).catch(() => {});
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) { animations.forEach(animation => animation.cancel()); animations.clear(); }
  });
  function readChapter() {
    const hash = location.hash.slice(1);
    if (panels.some(panel => panel.id === hash)) return hash;
    const params = new URL(location.href).searchParams;
    if (params.get('chapter') === 'methods') return { interviews:'questions', explanation:'explanation', sources:'sources' }[params.get('study')] || 'explanation';
    return 'questions';
  }
  function selectChapter(id, options = {}) {
    const active = panels.find(panel => panel.id === id);
    if (!active) return;
    panels.forEach(panel => {
      animations.get(panel)?.cancel(); panel.hidden = panel !== active;
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
      const url = new URL(location.href); url.hash = id;
      url.searchParams.delete('chapter'); url.searchParams.delete('study');
      history.pushState({ chapter:id }, '', url);
    }
    if (options.scroll) window.scrollTo({ top:0, behavior:'instant' });
    if (options.focus) { heading.tabIndex = -1; heading.focus({ preventScroll:true }); }
    if (options.animate) reveal(active, 8);
    if (id === 'sources') requestAnimationFrame(() => {
      sizeReader();
      if (sourceOpen) positionSource(!hasOpened);
    });
  }
  navigation.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); const id = link.dataset.rpChapter;
    if (id === currentChapter) return;
    selectChapter(id, { history:true, animate:true, scroll:true, focus:!link.closest('.rp-chapters') });
  }));
  window.addEventListener('popstate', () => selectChapter(readChapter(), { scroll:true }));
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (panels.some(panel => panel.id === id) && id !== currentChapter) selectChapter(id, { scroll:true });
  });
  document.querySelector('.rp-skip').addEventListener('click', event => {
    event.preventDefault(); content.focus({ preventScroll:true }); window.scrollTo({ top:0, behavior:'instant' });
  });

  const reasonButtons = [...document.querySelectorAll('[data-rp-reason]')];
  const reasonPanels = [...document.querySelectorAll('[data-rd-reason-panel]')];
  const reasonDemo = document.querySelector('.rd-reason-demo');
  const compareButton = document.querySelector('[data-rd-compare]');
  const compareNote = document.querySelector('[data-rd-compare-note]');
  const reasonCopy = {
    feature:['介绍食物与备餐特点', '共同情境仍然提供，但理由段不逐项连接到“为什么适合这一次”。'],
    relation:['把同一特点联系到当次条件', '把全谷物特点联系到膳食安排，把无需加热联系到准备时间与设备条件。']
  };
  function selectReason(mode, animate = true) {
    reasonButtons.forEach(button => {
      const selected = button.dataset.rpReason === mode;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    });
    reasonPanels.forEach(panel => {
      panel.hidden = panel.dataset.rdReasonPanel !== mode;
      if (!panel.hidden && animate) reveal(panel, 5);
    });
    document.querySelector('[data-rd-compare-title]').textContent = reasonCopy[mode][0];
    document.querySelector('[data-rd-compare-copy]').textContent = reasonCopy[mode][1];
    if (animate) document.querySelector('[data-rd-reason-status]').textContent = `已切换为${mode === 'feature' ? '特点说明' : '关联解释'}。推荐方案与适用条件保持不变。`;
  }
  reasonButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectReason(button.dataset.rpReason));
    button.addEventListener('keydown', event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : ['ArrowLeft','ArrowRight'].includes(event.key) ? 1-index : null;
      if (next === null) return;
      event.preventDefault(); selectReason(reasonButtons[next].dataset.rpReason); reasonButtons[next].focus();
    });
  });
  compareButton.addEventListener('click', () => {
    const active = compareButton.getAttribute('aria-pressed') !== 'true';
    compareButton.setAttribute('aria-pressed', String(active));
    compareButton.innerHTML = `${active ? '收起组织标记' : '标出组织差异'} <span aria-hidden="true">${active ? '−' : '＋'}</span>`;
    compareNote.hidden = !active; reasonDemo.classList.toggle('is-comparing', active);
    if (active) reveal(compareNote, 4);
  });

  const reader = document.querySelector('.rd-reader');
  const canvas = reader.querySelector('.rd-reading-canvas');
  const answer = reader.querySelector('.rd-source-answer');
  const source = reader.querySelector('.rd-source-document');
  const scroller = reader.querySelector('[data-rd-source-scroll]');
  const openButton = reader.querySelector('[data-rd-open-source]');
  const backButton = reader.querySelector('[data-rd-back]');
  const zoomButton = reader.querySelector('[data-rd-zoom]');
  const locationButtons = [...document.querySelectorAll('[data-rp-location]')];
  const layoutButtons = [...document.querySelectorAll('[data-rp-layout]')];
  let locationMode = 'home', layoutMode = 'switch';
  let sourceOpen = false, hasOpened = false, scrollOffset = 0, horizontalOffset = 0, positioningFrame;
  const conditionCopy = {
    'home-switch':['普通查阅', '点击“查阅依据”，从原文首页开始查找；建议与原文切换阅读。'],
    'located-switch':['仅段落定位', '点击“查阅依据”，直接到第 4 页相关段落；建议与原文切换阅读。'],
    'home-parallel':['仅并排呈现', '点击“查阅依据”，从原文首页开始查找；建议与原文同时可见。'],
    'located-parallel':['两项同时提供', '点击“查阅依据”，直接到第 4 页相关段落；建议与原文同时可见。']
  };
  function sizeReader() {
    if (currentChapter !== 'sources') return;
    const width = canvas.clientWidth;
    const gap = parseFloat(getComputedStyle(canvas).gap) || 20;
    // A document keeps the same rendering width in all four conditions.
    const column = width >= 620 ? Math.min(600, (width-gap)/2) : Math.min(440, width);
    reader.style.setProperty('--rd-sheet-width', `${Math.floor(column)}px`);
    canvas.classList.toggle('is-narrow', width < 620);
  }
  function updatePageCount() {
    if (!sourceOpen) { reader.querySelector('[data-rd-reader-count]').textContent = ''; return; }
    const top = scroller.getBoundingClientRect().top;
    const pages = [...scroller.querySelectorAll('[data-rd-page]')];
    const page = pages.find(item => item.getBoundingClientRect().bottom > top+25) || pages.at(-1);
    reader.querySelector('[data-rd-reader-count]').textContent = `原文 ${page.dataset.rdPage} / 5`;
  }
  function positionSource(firstOpen) {
    cancelAnimationFrame(positioningFrame);
    positioningFrame = requestAnimationFrame(() => {
      if (!sourceOpen || currentChapter !== 'sources') return;
      let top = scrollOffset;
      if (firstOpen) {
        if (locationMode === 'home') top = 0;
        else {
          const image = scroller.querySelector('[data-rd-page="4"] img');
          top = scroller.scrollTop + image.getBoundingClientRect().top - scroller.getBoundingClientRect().top + image.getBoundingClientRect().height * .1291219411;
        }
      }
      scroller.scrollTo({ top:Math.max(0, top), left:firstOpen ? 0 : horizontalOffset, behavior:'instant' });
      hasOpened = true;
      scrollOffset = scroller.scrollTop; horizontalOffset = scroller.scrollLeft; updatePageCount();
    });
  }
  function updateReader() {
    reader.dataset.rdLayout = layoutMode; reader.dataset.rdOpen = String(sourceOpen);
    reader.dataset.rdDocument = sourceOpen ? 'source' : 'answer';
    source.hidden = !sourceOpen; answer.hidden = sourceOpen && layoutMode === 'switch';
    backButton.textContent = layoutMode === 'parallel' ? '收起原文' : '← 返回建议';
    openButton.setAttribute('aria-expanded', String(sourceOpen));
    reader.querySelector('[data-rd-reader-instruction]').textContent = sourceOpen
      ? layoutMode === 'parallel' ? '建议与原文同时可见，可向前后查阅完整资料' : '正在阅读原文，返回建议时保留查阅位置'
      : '先阅读建议，再从资料依据打开原文';
    locationButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rpLocation === locationMode)));
    layoutButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rpLayout === layoutMode)));
    const copy = conditionCopy[`${locationMode}-${layoutMode}`];
    document.querySelector('[data-rd-condition]').textContent = copy[0];
    document.querySelector('[data-rd-source-description]').textContent = copy[1];
    sizeReader(); updatePageCount();
  }
  function resetReading(animate = true) {
    cancelAnimationFrame(positioningFrame); sourceOpen = false; hasOpened = false; scrollOffset = 0; horizontalOffset = 0;
    scroller.scrollTop = 0; scroller.scrollLeft = 0; scroller.classList.remove('is-zoomed');
    zoomButton.setAttribute('aria-pressed', 'false'); zoomButton.textContent = '放大原文 ＋';
    updateReader(); if (animate) reveal(answer, 5);
  }
  openButton.addEventListener('click', () => {
    if (sourceOpen) { scroller.focus({ preventScroll:true }); return; }
    const firstOpen = !hasOpened; sourceOpen = true;
    updateReader(); positionSource(firstOpen); reveal(source, 9);
    if (layoutMode === 'switch') backButton.focus({ preventScroll:true });
  });
  backButton.addEventListener('click', () => {
    scrollOffset = scroller.scrollTop; horizontalOffset = scroller.scrollLeft; sourceOpen = false;
    updateReader(); reveal(answer, 5); openButton.focus({ preventScroll:true });
  });
  scroller.addEventListener('scroll', () => { if (sourceOpen) { scrollOffset = scroller.scrollTop; horizontalOffset = scroller.scrollLeft; updatePageCount(); } }, { passive:true });
  zoomButton.addEventListener('click', () => {
    const zoom = !scroller.classList.contains('is-zoomed');
    const fraction = scroller.scrollTop / (zoom ? 1 : 1.5);
    scroller.classList.toggle('is-zoomed', zoom);
    zoomButton.setAttribute('aria-pressed', String(zoom)); zoomButton.textContent = zoom ? '还原大小 −' : '放大原文 ＋';
    scroller.scrollTo({ top:fraction*(zoom ? 1.5 : 1), left:0, behavior:'instant' });
    scrollOffset = scroller.scrollTop; updatePageCount();
  });
  function bindFactor(buttons, key) {
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const value = button.dataset[key];
        if (key === 'rpLocation' ? value === locationMode : value === layoutMode) return;
        if (key === 'rpLocation') locationMode = value; else layoutMode = value;
        resetReading();
        document.querySelector('[data-rd-source-description]').textContent = '条件已切换。' + conditionCopy[`${locationMode}-${layoutMode}`][1];
      });
      button.addEventListener('keydown', event => {
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : ['ArrowLeft','ArrowRight'].includes(event.key) ? 1-index : null;
        if (next === null) return;
        event.preventDefault(); buttons[next].click(); buttons[next].focus();
      });
    });
  }
  bindFactor(locationButtons, 'rpLocation'); bindFactor(layoutButtons, 'rpLayout');
  document.querySelector('[data-rd-reset]').addEventListener('click', () => resetReading());
  new ResizeObserver(sizeReader).observe(canvas);
  document.querySelectorAll('.rp-details').forEach(details => {
    details.addEventListener('toggle', () => { details.querySelector('summary span').textContent = '＋'; });
  });
  body.classList.add('rp-enhanced');
  selectReason('feature', false); updateReader(); selectChapter(readChapter());
})();
