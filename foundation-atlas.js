(() => {
  const atlas = document.querySelector('#profile.foundation-atlas');
  if (!atlas) return;
  const tabs = [...atlas.querySelectorAll('.practice-tab')];
  const panels = [...atlas.querySelectorAll('.practice-page')];
  const index = atlas.querySelector('.practice-index');
  if (tabs.length !== panels.length || !tabs.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const easing = 'cubic-bezier(.22,1,.36,1)';
  let current = 0;
  let entranceTimer;
  let running = [];

  const stopMotion = () => {
    clearTimeout(entranceTimer);
    running.forEach(animation => animation.cancel());
    running = [];
    panels.forEach(panel => panel.classList.remove('is-entering'));
  };
  const animate = (element, frames, duration = 460, delay = 0) => {
    if (reducedMotion.matches || !element?.animate) return;
    const animation = element.animate(frames, { duration, delay, easing, fill: 'backwards' });
    running.push(animation);
    const release = () => { running = running.filter(item => item !== animation); };
    animation.finished.then(release, release);
  };
  const enter = (panel, direction = 1) => {
    if (reducedMotion.matches) return;
    panel.classList.add('is-entering');
    [...panel.querySelector('.practice-copy').children].forEach((item, i) => {
      animate(item, [{ opacity: .15, transform: `translateX(${direction * 22}px)` }, { opacity: 1, transform: 'translateX(0)' }], 430, i * 28);
    });
    animate(panel.querySelector('.practice-visual'), [{ opacity: .35, transform: `translateX(${direction * 30}px) scale(.985)` }, { opacity: 1, transform: 'translateX(0) scale(1)' }], 520);
    panel.querySelectorAll('.process-node').forEach((node, i) => {
      animate(node, [{ opacity: .25, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], 420, 90 + i * 45);
    });
    const paper = panel.querySelector('.field-paper-front');
    if (paper) animate(paper, [{ transform: 'rotate(-5deg) translateY(18px)' }, { transform: 'rotate(0deg) translateY(0)' }], 650, 60);
    entranceTimer = setTimeout(() => panel.classList.remove('is-entering'), 950);
  };

  const select = (tab, focus = false, motion = true) => {
    const nextIndex = tabs.indexOf(tab);
    const changed = nextIndex !== current;
    const direction = nextIndex >= current ? 1 : -1;
    if (changed) stopMotion();
    current = nextIndex;
    atlas.dataset.practice = tab.dataset.practice;
    const target = tab.getAttribute('aria-controls');
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.id === target;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
      if (!active) panel.querySelectorAll('details[open]').forEach(detail => { detail.open = false; });
    });
    if (focus) tab.focus({ preventScroll: true });
    if (changed && motion) enter(panels[current], direction);
  };

  index.setAttribute('role', 'tablist');
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
  panels.forEach(panel => { panel.setAttribute('role', 'tabpanel'); });
  atlas.classList.add('is-enhanced');
  select(tabs[0], false, false);

  const notes = {
    'practice-field': [
      '围绕地方工艺的生产与传承，记录现场情况，为调研报告积累材料。',
      '整理走访记录与背景资料，归纳产业现状、主要困境及其关联。',
      '将调研材料组织为报告，并进一步转化为论文，初步建立研究写作能力。'
    ],
    'practice-team': [
      '围绕项目目标梳理实践内容与实施安排，形成可供团队共同推进的方案。',
      '承担项目文书与材料组织，把实践方案表达为结构清晰的申报内容。',
      '协调成员分工与阶段任务，在团队实践中训练项目统筹和执行能力。',
      '归纳实践记录、文创成果与项目材料，组织可用于申报和展示的成果内容。'
    ],
    'practice-industry': [
      '通过竞品分析与用户研究整理设计输入，为智能装备和工程机械的外观方案提供依据。',
      '围绕企业需求进行概念推演、方案比较与调整，累计参与 20 余项设计提案。',
      '部分方案进入企业后续结构设计与方案深化阶段，积累设计落地与工程协同经验。'
    ]
  };
  panels.forEach(panel => {
    const nodes = [...panel.querySelectorAll('.process-node')];
    const note = panel.querySelector('.process-note');
    note.id = `${panel.id}-note`;
    const selectStep = node => {
      if (node.getAttribute('aria-pressed') === 'true') return;
      const step = Number(node.dataset.step);
      nodes.forEach(item => {
        const active = item === node;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const map = panel.querySelector('.team-map');
      if (map) map.dataset.activeStep = step;
      note.querySelector('.process-note-index').textContent = String(step + 1).padStart(2, '0');
      note.querySelector('p').textContent = notes[panel.id][step];
      animate(note.querySelector('p'), [{ opacity: .2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], 280);
    };
    nodes.forEach((node, i) => {
      node.setAttribute('aria-controls', note.id);
      node.addEventListener('click', () => selectStep(node));
      node.addEventListener('keydown', event => {
        const delta = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
        if (!delta) return;
        event.preventDefault();
        const next = nodes[(i + delta + nodes.length) % nodes.length];
        next.focus({ preventScroll: true });
        selectStep(next);
      });
    });
  });

  const paper = atlas.querySelector('.field-paper');
  let pointerFrame = 0;
  if (paper) {
    paper.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !hoverPointer.matches) return;
      const bounds = paper.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        paper.style.setProperty('--tilt-x', `${-y * 5}deg`);
        paper.style.setProperty('--tilt-y', `${x * 5}deg`);
      });
    });
    paper.addEventListener('pointerleave', () => {
      cancelAnimationFrame(pointerFrame);
      paper.style.removeProperty('--tilt-x');
      paper.style.removeProperty('--tilt-y');
    });
  }
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    stopMotion();
    cancelAnimationFrame(pointerFrame);
    paper?.style.removeProperty('--tilt-x');
    paper?.style.removeProperty('--tilt-y');
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      enter(panels[current]);
      observer.disconnect();
    }, { threshold: .18 });
    observer.observe(atlas);
  }
})();
