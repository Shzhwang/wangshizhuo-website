'use strict';
(() => {
  const buttons = [...document.querySelectorAll('.paper-switch-nav button')];
  const panels = [...document.querySelectorAll('.paper-panel')];
  function activatePaper(id, update = false) {
    if (!panels.some(panel => panel.dataset.paperPanel === id)) id = buttons[0].dataset.paper;
    buttons.forEach(button => {
      const active = button.dataset.paper === id;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
      button.setAttribute('aria-controls',`paper-${button.dataset.paper}`);
    });
    panels.forEach(panel => {
      const active = panel.dataset.paperPanel === id;
      panel.classList.toggle('active',active);
      panel.setAttribute('aria-hidden',String(!active));
      panel.hidden = !active;
    });
    if (update) {
      const hash = `#paper-${id}`;
      if (location.hash !== hash) history.pushState(null,'',hash);
      document.getElementById(`paper-${id}`).scrollIntoView({block:'start',behavior:'instant'});
    }
  }
  const route = () => activatePaper(location.hash.replace('#paper-',''));
  buttons.forEach((button,index) => {
    button.addEventListener('click',() => activatePaper(button.dataset.paper,true));
    button.addEventListener('keydown',event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index+1)%buttons.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index+buttons.length-1)%buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length-1;
      if (next !== undefined) {event.preventDefault();buttons[next].focus();activatePaper(buttons[next].dataset.paper,true);}
    });
  });
  window.addEventListener('hashchange',route);
  window.addEventListener('popstate',route);
  route();
  const dialog = document.querySelector('.paper-figure-dialog');
  const zoomButtons = [...document.querySelectorAll('[data-figure]')];
  let gallery = [], current = 0, opener;
  const show = index => {
    current=(index+gallery.length)%gallery.length;
    const button=gallery[current], img=document.querySelector('#paper-figure-image');
    img.src=button.dataset.figure;img.alt=button.dataset.caption;
    document.querySelector('#paper-figure-caption').textContent=button.dataset.caption;
    document.querySelector('#paper-figure-count').textContent=`${current+1} / ${gallery.length}`;
    document.querySelector('.paper-dialog-canvas').scrollTop=0;
  };
  zoomButtons.forEach(button=>button.addEventListener('click',()=>{
    opener=button;
    const seen=new Set();
    gallery=zoomButtons.filter(item=>{
      if(item.dataset.gallery!==button.dataset.gallery||seen.has(item.dataset.figure))return false;
      seen.add(item.dataset.figure);return true;
    });
    show(gallery.findIndex(item=>item.dataset.figure===button.dataset.figure));dialog.showModal();document.querySelector('[data-close-figure]').focus();
  }));
  document.querySelector('[data-close-figure]').addEventListener('click',()=>dialog.close());
  document.querySelector('[data-prev-figure]').addEventListener('click',()=>show(current-1));
  document.querySelector('[data-next-figure]').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}
    if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}
  });
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
})();
