'use strict';
(() => {
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const one = (selector) => document.querySelector(selector);
  function setupTabs(attribute, panelPrefix, route) {
    const tabs = all(`[data-${attribute}]`);
    if (!tabs.length) return;
    const activate = (key, update = false, focus = false) => {
      if (!tabs.some(tab => tab.dataset[attribute] === key)) key = tabs[0].dataset[attribute];
      tabs.forEach(tab => {
        const selected = tab.dataset[attribute] === key;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
        if (selected && focus) tab.focus();
      });
      if (update && route) {
        const url = new URL(location.href);
        if (route === 'hash') url.hash = `${panelPrefix}${key}`;
        else url.searchParams.set('project', key);
        if (url.href !== location.href) history.pushState(null, '', url);
        document.getElementById(`${panelPrefix}${key}`)?.scrollIntoView({block:'start',behavior:'instant'});
      }
    };
    const fromRoute = () => {
      const key = route === 'hash' ? location.hash.replace(`#${panelPrefix}`, '') : new URL(location.href).searchParams.get('project');
      activate(key || tabs[0].dataset[attribute]);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset[attribute], true));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); activate(tabs[next].dataset[attribute], true, true); }
      });
    });
    if (route) { fromRoute(); window.addEventListener('popstate', fromRoute); if (route === 'hash') window.addEventListener('hashchange', fromRoute); }
  }
  setupTabs('work', 'work-', null);
  setupTabs('paper', 'paper-', 'hash');
  setupTabs('project', 'project-', 'query');

  const portfolioPages = Array.from({length:27}, (_, index) => ({src:`assets/portfolio-20260915/hires/page-${String(index+1).padStart(2,'0')}.webp`, caption:`作品集第${index+1}页`}));
  let readerPage = 1;
  const reader = one('.reader-main');
  function setReader(page, scroll = false) {
    if (!reader) return;
    readerPage = (page + 26) % 27 + 1;
    const item = portfolioPages[readerPage-1];
    reader.dataset.zoom = item.src;
    reader.dataset.caption = item.caption;
    reader.setAttribute('aria-label', `放大：${item.caption}`);
    const img = reader.querySelector('img'); img.src = item.src; img.alt = item.caption;
    one('#reader-counter').textContent = `${String(readerPage).padStart(2,'0')} / 27`;
    all('[data-reader-page]').forEach(button => {
      const selected = Number(button.dataset.readerPage) === readerPage;
      button.setAttribute('aria-pressed', String(selected));
      if (selected && scroll) button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    });
  }
  all('[data-reader-page]').forEach(button => button.addEventListener('click', () => setReader(Number(button.dataset.readerPage))));
  one('[data-reader-prev]')?.addEventListener('click', () => setReader(readerPage-1, true));
  one('[data-reader-next]')?.addEventListener('click', () => setReader(readerPage+1, true));

  const dialog = one('.image-dialog');
  let gallery = [], galleryIndex = 0, returnFocus = null;
  function showImage(index) {
    galleryIndex = (index + gallery.length) % gallery.length;
    const item = gallery[galleryIndex];
    one('#zoom-image').src = item.src;
    one('#zoom-image').alt = item.caption;
    one('#zoom-caption').textContent = item.caption;
    one('#zoom-count').textContent = `${galleryIndex+1} / ${gallery.length}`;
    const canvas = one('.dialog-canvas'); canvas.scrollTop = 0; canvas.scrollLeft = 0;
    all('[data-zoom-prev], [data-zoom-next]').forEach(button => button.hidden = gallery.length < 2);
  }
  all('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    returnFocus = button;
    if (button.dataset.gallery === 'reader') {
      gallery = portfolioPages;
      galleryIndex = readerPage-1;
    } else {
      const buttons = all('[data-zoom]').filter(item => item.dataset.gallery === button.dataset.gallery && !item.closest('[hidden]'));
      gallery = buttons.map(item => ({src:item.dataset.zoom, caption:item.dataset.caption}));
      galleryIndex = buttons.indexOf(button);
    }
    showImage(galleryIndex);
    dialog.showModal();
    one('[data-zoom-close]').focus();
  }));
  one('[data-zoom-close]')?.addEventListener('click', () => dialog.close());
  one('[data-zoom-prev]')?.addEventListener('click', () => showImage(galleryIndex-1));
  one('[data-zoom-next]')?.addEventListener('click', () => showImage(galleryIndex+1));
  dialog?.addEventListener('close', () => returnFocus?.focus({preventScroll:true}));
  dialog?.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); }});
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(galleryIndex-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(galleryIndex+1); }
  });
})();
