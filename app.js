if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const resetDefaultEntry = () => {
  if (!location.hash || location.hash === "#top") {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
};

resetDefaultEntry();
window.addEventListener("pageshow", resetDefaultEntry);

const topbar = document.querySelector(".topbar");
const backTop = document.querySelector(".back-top");
const cursorLight = document.querySelector(".cursor-light");
const scrollProgress = document.querySelector(".scroll-progress");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sideLinks = [...document.querySelectorAll(".side-index a")];
const sections = [...document.querySelectorAll(".viewport-section")];
let sectionRailLinks = [];
const revealItems = [...document.querySelectorAll(".reveal")];
const foundationCards = [...document.querySelectorAll(".undergraduate-foundation .foundation-card")];
const readerSection = document.querySelector(".reader-section");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const canAnimate = !motionQuery.matches;

const focusData = {
  human: {
    kicker: "RESEARCH LOGIC",
    title: "研究路径逻辑",
    text: "我的研究围绕“问题如何被识别、变量如何被提取、设计如何被验证”逐步推进。农业机械研究强调产品形态与感知评价，循环家具研究强调用户需求与服务系统，医疗共享研究强调多主体信息关系与原型验证。三类项目共同构成由产品形态、产品服务系统到复杂信息系统的研究递进。",
    methods: ["产品形态评价", "用户需求转译", "服务系统建模", "信息交互验证"]
  },
  machine: {
    kicker: "RESEARCH LOGIC",
    title: "研究路径逻辑",
    text: "我的研究围绕“问题如何被识别、变量如何被提取、设计如何被验证”逐步推进。农业机械研究强调产品形态与感知评价，循环家具研究强调用户需求与服务系统，医疗共享研究强调多主体信息关系与原型验证。三类项目共同构成由产品形态、产品服务系统到复杂信息系统的研究递进。",
    methods: ["产品形态评价", "用户需求转译", "服务系统建模", "信息交互验证"]
  },
  context: {
    kicker: "RESEARCH LOGIC",
    title: "研究路径逻辑",
    text: "我的研究围绕“问题如何被识别、变量如何被提取、设计如何被验证”逐步推进。农业机械研究强调产品形态与感知评价，循环家具研究强调用户需求与服务系统，医疗共享研究强调多主体信息关系与原型验证。三类项目共同构成由产品形态、产品服务系统到复杂信息系统的研究递进。",
    methods: ["产品形态评价", "用户需求转译", "服务系统建模", "信息交互验证"]
  }
};

const methodData = {
  need: {
    kicker: "Method Layer 01",
    title: "需求识别",
    text: "先确认使用者、任务阻力和设计回应。"
  },
  model: {
    kicker: "Method Layer 02",
    title: "变量建模",
    text: "把前期问题整理为可比较的设计变量。"
  },
  translate: {
    kicker: "Method Layer 03",
    title: "参数转译",
    text: "把研究判断转化为形态、界面和流程决策。"
  },
  verify: {
    kicker: "Method Layer 04",
    title: "原型验证",
    text: "回到场景中检验方案是否回应问题。"
  }
};

const portfolioPages = Array.from({ length: 27 }, (_, index) => {
  const page = index + 1;
  let group = "intro";
  let title = "作品集页面";
  if (page >= 4 && page <= 11) {
    group = "tractor";
    title = "小马力拖拉机外观迭代";
  } else if (page >= 12 && page <= 18) {
    group = "furniture";
    title = "二手家具循环服务系统";
  } else if (page >= 19 && page <= 26) {
    group = "medical";
    title = "跨院诊断报告共享系统";
  } else if (page === 27) {
    group = "contact";
    title = "联系信息";
  }
  return { page, group, title };
});

const pageGrid = document.querySelector("#page-grid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const readerCarousel = document.querySelector("#reader-carousel");
let currentPage = 1;
let carouselMotionTimer;

function applyStaggerIndexes() {
  [
    ".timeline-item",
    ".dossier-grid section",
    ".project-lenses article",
    ".studio-gallery button"
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      item.style.setProperty("--i", String(index));
      item.style.setProperty("--stagger-delay", `${Math.min(index, 10) * 38}ms`);
    });
  });
}

function pagePath(kind, page) {
  return `assets/portfolio-20260915/${kind}/page-${String(page).padStart(2, "0")}.webp`;
}

function renderPages() {
  pageGrid.innerHTML = "";
  if (readerCarousel) {
    readerCarousel.innerHTML = "";
  }
  portfolioPages.forEach((item) => {
    const card = document.createElement("button");
    card.className = "page-card";
    card.type = "button";
    card.dataset.group = item.group;
    card.dataset.page = String(item.page);
    card.innerHTML = `
      <img loading="lazy" src="${pagePath("thumbs", item.page)}" alt="作品集第 ${item.page} 页">
      <span>Page ${String(item.page).padStart(2, "0")}</span>
      <strong>${item.title}</strong>
    `;
    card.addEventListener("click", () => selectReaderPage(item.page));
    pageGrid.appendChild(card);

    if (readerCarousel) {
      const carouselCard = document.createElement("button");
      carouselCard.className = "carousel-card is-offstage";
      carouselCard.type = "button";
      carouselCard.dataset.group = item.group;
      carouselCard.dataset.page = String(item.page);
      carouselCard.setAttribute("aria-hidden", "true");
      carouselCard.innerHTML = `
        <img loading="lazy" decoding="async" src="${pagePath("hires", item.page)}" alt="作品集第 ${item.page} 页高清图">
        <figcaption>
          <span>Page ${String(item.page).padStart(2, "0")}</span>
          <strong>${item.title}</strong>
        </figcaption>
      `;
      carouselCard.addEventListener("click", () => {
        if (item.page === currentPage) {
          openLightbox(item.page);
        } else {
          selectReaderPage(item.page);
        }
      });
      readerCarousel.appendChild(carouselCard);
    }
  });
}

function selectReaderPage(page, options = {}) {
  const { scrollThumb = true } = options;
  currentPage = Math.max(1, Math.min(portfolioPages.length, page));
  const meta = portfolioPages[currentPage - 1];
  readerSection?.style.setProperty("--reader-bg", `url("${pagePath("hires", currentPage)}")`);
  document.querySelectorAll(".page-card").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.page) === currentPage);
  });
  if (scrollThumb) {
    document.querySelector(`.page-card[data-page="${currentPage}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }
  cueCarouselMotion();
  renderCarousel();
}

function cueCarouselMotion() {
  if (!readerCarousel) return;
  readerCarousel.classList.remove("is-moving");
  void readerCarousel.offsetWidth;
  readerCarousel.classList.add("is-moving");
  window.clearTimeout(carouselMotionTimer);
  carouselMotionTimer = window.setTimeout(() => {
    readerCarousel.classList.remove("is-moving");
  }, 1120);
}

function renderCarousel() {
  if (!readerCarousel) return;
  const pages = visiblePages();
  const index = pages.indexOf(currentPage);
  const safeIndex = index >= 0 ? index : 0;
  const slots = [
    { offset: -2, className: "is-far-left" },
    { offset: -1, className: "is-left" },
    { offset: 0, className: "is-center" },
    { offset: 1, className: "is-right" },
    { offset: 2, className: "is-far-right" }
  ];
  const slotByPage = new Map();
  slots.forEach((slot) => {
    const page = pages[(safeIndex + slot.offset + pages.length) % pages.length];
    if (!slotByPage.has(page)) {
      slotByPage.set(page, slot.className);
    }
  });
  readerCarousel.querySelectorAll(".carousel-card").forEach((card) => {
    const page = Number(card.dataset.page);
    const className = slotByPage.get(page);
    card.className = `carousel-card ${className || "is-offstage"}`;
    card.disabled = !className;
    card.setAttribute("aria-hidden", className ? "false" : "true");
  });
}

function openLightbox(page) {
  currentPage = Math.max(1, Math.min(portfolioPages.length, page));
  const meta = portfolioPages[currentPage - 1];
  lightboxImage.src = pagePath("hires", currentPage);
  lightboxImage.alt = `作品集第 ${currentPage} 页高清图`;
  lightboxCaption.textContent = `Page ${String(currentPage).padStart(2, "0")} / ${meta.title}`;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  selectReaderPage(currentPage, { scrollThumb: false });
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function visiblePages() {
  return portfolioPages.map((item) => item.page);
}

function stepLightbox(direction) {
  const pages = visiblePages();
  const index = pages.indexOf(currentPage);
  const safeIndex = index >= 0 ? index : 0;
  const nextIndex = (safeIndex + direction + pages.length) % pages.length;
  openLightbox(pages[nextIndex]);
}

function stepReader(direction) {
  const pages = visiblePages();
  const index = pages.indexOf(currentPage);
  const safeIndex = index >= 0 ? index : 0;
  const nextIndex = (safeIndex + direction + pages.length) % pages.length;
  selectReaderPage(pages[nextIndex]);
}

function updateChrome() {
  const solid = window.scrollY > 80;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  topbar.classList.toggle("is-solid", solid);
  backTop.classList.toggle("is-visible", window.scrollY > 650);
  scrollProgress.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;

  let current = "top";
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 6 && sections.length) {
    current = sections[sections.length - 1].dataset.section || sections[sections.length - 1].id;
  }
  for (const section of sections) {
    if (current !== "contact" && section.getBoundingClientRect().top < window.innerHeight * 0.45) {
      current = section.dataset.section || section.id || "top";
    }
  }
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  sideLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  sectionRailLinks.forEach((link) => {
    const isActive = link.dataset.sectionLink === current;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  document.body.dataset.section = current;
}

function swapContent(panel, update) {
  if (!panel) {
    update();
    return;
  }
  if (panel.dataset.swapTimer) {
    window.clearTimeout(Number(panel.dataset.swapTimer));
  }
  panel.classList.add("is-swapping");
  const timer = window.setTimeout(() => {
    update();
    requestAnimationFrame(() => panel.classList.remove("is-swapping"));
    delete panel.dataset.swapTimer;
  }, 140);
  panel.dataset.swapTimer = String(timer);
}

function updateFocusPanel(key) {
  const data = focusData[key];
  swapContent(document.querySelector(".cockpit-panel"), () => {
    const kicker = document.querySelector("#focus-kicker");
    const title = document.querySelector("#focus-title");
    const text = document.querySelector("#focus-text");
    const methods = document.querySelector("#focus-methods");
    if (!kicker || !title || !text || !methods || !data) return;
    kicker.textContent = data.kicker;
    title.textContent = data.title;
    text.textContent = data.text;
    methods.innerHTML = data.methods.map((method) => `<span>${method}</span>`).join("");
  });
}

function updateMethodPanel(key) {
  const data = methodData[key];
  const panel = document.querySelector(".method-detail");
  if (!panel || !data) return;
  swapContent(panel, () => {
    const kicker = document.querySelector("#method-kicker");
    const title = document.querySelector("#method-title");
    const text = document.querySelector("#method-text");
    if (!kicker || !title || !text) return;
    kicker.textContent = data.kicker;
    title.textContent = data.title;
    text.textContent = data.text;
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

revealItems
  .filter((item) => !foundationCards.includes(item))
  .forEach((item) => revealObserver.observe(item));

const revealFoundationCards = () => {
  const revealLine = window.innerHeight * 0.86;

  foundationCards.forEach((card) => {
    if (card.classList.contains("visible")) return;

    const bounds = card.getBoundingClientRect();
    if (bounds.top <= revealLine && bounds.bottom >= 0) {
      card.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealFoundationCards, { passive: true });
window.addEventListener("resize", revealFoundationCards);
requestAnimationFrame(revealFoundationCards);

document.querySelectorAll(".node").forEach((node) => {
  node.addEventListener("click", () => {
    document.querySelectorAll(".node").forEach((item) => item.classList.remove("active"));
    node.classList.add("active");
    updateFocusPanel(node.dataset.focus);
  });
});

const studioTabs = [...document.querySelectorAll(".studio-tabs button")];
const studioPanels = [...document.querySelectorAll(".studio")];
let activeStudioPanel = studioPanels.find((panel) => panel.classList.contains("active"));
let studioSwitching = false;
let pendingStudioButton = null;

const studioExitDuration = canAnimate ? 170 : 0;
const studioEnterDuration = canAnimate ? 330 : 0;
const waitForStudioMotion = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
const waitForStudioPaint = () => new Promise((resolve) => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
});

function updateStudioControls(button) {
  studioTabs.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
    item.tabIndex = isActive ? 0 : -1;
  });

  const overviewLink = document.querySelector(".project-overview-link");
  if (overviewLink) overviewLink.href = `projects.html?project=${button.dataset.studio}`;
}

function clearStudioMotion(panel) {
  panel?.classList.remove(
    "is-leaving-left",
    "is-leaving-right",
    "is-entering-left",
    "is-entering-right",
    "studio-exit-left",
    "studio-exit-right",
    "studio-enter-from-left",
    "studio-enter-from-right",
    "studio-entering"
  );
}

async function runStudioSwitch(initialButton) {
  const studioShell = document.querySelector(".studio-shell");
  let targetButton = initialButton;
  let currentPanel = activeStudioPanel || studioPanels.find((panel) => panel.classList.contains("active"));
  let nextPanel = document.querySelector(`#studio-${targetButton.dataset.studio}`);
  if (!nextPanel || nextPanel === currentPanel) return;

  studioSwitching = true;
  studioShell?.classList.add("is-switching");

  let currentIndex = Math.max(0, studioPanels.indexOf(currentPanel));
  let nextIndex = studioPanels.indexOf(nextPanel);
  let direction = nextIndex > currentIndex ? "right" : "left";

  studioPanels.forEach((panel) => {
    clearStudioMotion(panel);
    if (panel !== currentPanel) {
      panel.classList.remove("active");
      panel.setAttribute("aria-hidden", "true");
    }
  });

  if (currentPanel) {
    currentPanel.classList.add(`studio-exit-${direction}`);
    await waitForStudioMotion(studioExitDuration);
  }

  /* During the short exit, coalesce rapid clicks and reveal only the latest requested project. */
  if (pendingStudioButton) {
    targetButton = pendingStudioButton;
    pendingStudioButton = null;
    nextPanel = document.querySelector(`#studio-${targetButton.dataset.studio}`);
    nextIndex = studioPanels.indexOf(nextPanel);
    direction = nextIndex > currentIndex ? "right" : "left";
  }

  currentPanel?.classList.remove("active");
  currentPanel?.setAttribute("aria-hidden", "true");
  clearStudioMotion(currentPanel);

  if (!nextPanel) {
    studioSwitching = false;
    studioShell?.classList.remove("is-switching");
    return;
  }

  clearStudioMotion(nextPanel);
  nextPanel.classList.add("active", `studio-enter-from-${direction}`);
  nextPanel.setAttribute("aria-hidden", "false");
  activeStudioPanel = nextPanel;

  if (canAnimate) {
    await waitForStudioPaint();
    nextPanel.classList.add("studio-entering");
    nextPanel.classList.remove(`studio-enter-from-${direction}`);
    await waitForStudioMotion(studioEnterDuration);
  }

  clearStudioMotion(nextPanel);
  studioShell?.classList.remove("is-switching");
  studioSwitching = false;

  const queuedButton = pendingStudioButton;
  pendingStudioButton = null;
  if (queuedButton) {
    const queuedPanel = document.querySelector(`#studio-${queuedButton.dataset.studio}`);
    if (queuedPanel && queuedPanel !== activeStudioPanel) runStudioSwitch(queuedButton);
  }
}

function activateStudio(button) {
  const nextPanel = document.querySelector(`#studio-${button.dataset.studio}`);
  const currentPanel = activeStudioPanel || studioPanels.find((panel) => panel.classList.contains("active"));
  if (!nextPanel) return;

  updateStudioControls(button);
  if (studioSwitching) {
    pendingStudioButton = button;
    return;
  }
  if (nextPanel === currentPanel) return;
  runStudioSwitch(button);
}

studioTabs.forEach((button, index) => {
  button.addEventListener("click", () => activateStudio(button));
  button.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % studioTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + studioTabs.length) % studioTabs.length;
    if (nextIndex === index) return;
    event.preventDefault();
    studioTabs[nextIndex].focus();
    activateStudio(studioTabs[nextIndex]);
  });
});

document.querySelectorAll(".studio-gallery button").forEach((button) => {
  button.addEventListener("click", () => openLightbox(Number(button.dataset.page)));
});

function initInteractiveSurfaces() {
  const precisePointer = canAnimate && window.matchMedia("(pointer: fine)").matches;

  const pointerSurfaces = document.querySelectorAll([
    ".studio-gallery button",
    ".page-card",
    ".carousel-card",
    ".project-overview-link",
    ".paper-actions a"
  ].join(","));
  pointerSurfaces.forEach((surface) => surface.classList.add("pointer-reactive"));

  if (!precisePointer) return;

  pointerSurfaces.forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      surface.style.setProperty("--pointer-x", `${x * 100}%`);
      surface.style.setProperty("--pointer-y", `${y * 100}%`);
      surface.style.setProperty("--pointer-shift-x", `${(x - 0.5) * 5}px`);
      surface.style.setProperty("--pointer-shift-y", `${(y - 0.5) * 5}px`);
    }, { passive: true });
    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--pointer-shift-x");
      surface.style.removeProperty("--pointer-shift-y");
    });
  });

  /* Keep the support cells clean; the complete board shares the pressure response below. */
  document.querySelectorAll(".support-matrix > section").forEach((section) => {
    section.classList.remove("ambient-surface");
    section.style.removeProperty("--surface-x");
    section.style.removeProperty("--surface-y");
    section.querySelectorAll(":scope > .surface-sheen").forEach((sheen) => sheen.remove());
  });

  /* Evidence cards use a physical press response without a cursor-following sheen. */
  document.querySelectorAll(".foundation-card > .surface-sheen, .paper-list li > .surface-sheen").forEach((sheen) => sheen.remove());

  /* Reuse the hero-console tilt model at a quieter amplitude so the pointer side feels pressed. */
  const pressureCards = document.querySelectorAll(".foundation-card, .paper-list li, .support-matrix");
  let activePressureCard = null;
  let activePressureReset = null;
  pressureCards.forEach((card) => {
    const enablePressure = () => card.classList.add("pointer-pressure-card");

    /* Foundation cards reveal with transform, so enable pointer transforms only after that entrance completes. */
    if (card.matches(".foundation-card") && !card.classList.contains("visible")) {
      const revealWatcher = new MutationObserver(() => {
        if (!card.classList.contains("visible")) return;
        revealWatcher.disconnect();
        window.setTimeout(enablePressure, 940);
      });
      revealWatcher.observe(card, { attributes: true, attributeFilter: ["class"] });
    } else {
      enablePressure();
    }

    let pressureFrame = 0;

    const updatePressure = (event) => {
      if (!card.classList.contains("pointer-pressure-card")) return;
      if (activePressureReset && activePressureCard !== card) activePressureReset();
      activePressureCard = card;
      activePressureReset = resetPressure;
      window.cancelAnimationFrame(pressureFrame);
      pressureFrame = window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
        const tiltRange = card.matches(".support-matrix") ? 1.3 : card.matches(".foundation-card") ? 3.6 : 3.0;
        const rotateY = (x - 0.5) * tiltRange;
        const rotateX = (0.5 - y) * tiltRange;

        card.style.setProperty("--press-rx", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--press-ry", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--press-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--press-y", `${(y * 100).toFixed(1)}%`);
        card.classList.add("is-pointer-pressed");
      });
    };

    const resetPressure = () => {
      window.cancelAnimationFrame(pressureFrame);
      card.style.removeProperty("--press-rx");
      card.style.removeProperty("--press-ry");
      card.style.removeProperty("--press-x");
      card.style.removeProperty("--press-y");
      card.classList.remove("is-pointer-pressed");
      if (activePressureCard === card) {
        activePressureCard = null;
        activePressureReset = null;
      }
    };

    card.addEventListener("pointerenter", updatePressure, { passive: true });
    card.addEventListener("pointermove", updatePressure, { passive: true });
    card.addEventListener("pointerleave", resetPressure, { passive: true });
    card.addEventListener("pointercancel", resetPressure, { passive: true });
  });

  document.addEventListener("pointermove", (event) => {
    if (activePressureCard && !activePressureCard.contains(event.target)) activePressureReset?.();
  }, { passive: true });
  window.addEventListener("blur", () => activePressureReset?.());

  const ambientSurfaces = document.querySelectorAll([
    ".timeline-item",
    ".research-card",
    ".phase-card",
    ".contribution-grid section"
  ].join(","));

  ambientSurfaces.forEach((surface) => {
    surface.classList.add("ambient-surface");
    if (!surface.querySelector(":scope > .surface-sheen")) {
      const sheen = document.createElement("span");
      sheen.className = "surface-sheen";
      sheen.setAttribute("aria-hidden", "true");
      surface.appendChild(sheen);
    }

    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty("--surface-x", `${event.clientX - rect.left}px`);
      surface.style.setProperty("--surface-y", `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
}

function initResearchTrace() {
  const research = document.querySelector("#research");
  if (!research) return;

  const overviewCards = [...research.querySelectorAll(".research-card")];
  const methodCards = [...research.querySelectorAll(".method-card")];
  const allTraceCards = [...overviewCards, ...methodCards];

  const setTrace = (index) => {
    research.classList.add("is-tracing");
    research.style.setProperty("--research-step", String(index));
    research.style.setProperty("--research-progress", `${(index / Math.max(1, methodCards.length - 1)) * 100}%`);
    methodCards.forEach((card, cardIndex) => {
      card.classList.toggle("is-trace-active", cardIndex === index);
      card.classList.toggle("is-trace-past", cardIndex < index);
    });
  };

  const clearTrace = () => {
    research.classList.remove("is-tracing");
    research.style.removeProperty("--research-step");
    research.style.removeProperty("--research-progress");
    methodCards.forEach((card) => card.classList.remove("is-trace-active", "is-trace-past"));
  };

  methodCards.forEach((card, index) => {
    card.addEventListener("pointerenter", () => setTrace(index));
  });

  overviewCards.forEach((card, index) => {
    const mappedIndex = Math.round(index * (methodCards.length - 1) / Math.max(1, overviewCards.length - 1));
    card.addEventListener("pointerenter", () => setTrace(mappedIndex));
  });

  allTraceCards.forEach((card) => card.addEventListener("pointerleave", (event) => {
    if (!research.contains(event.relatedTarget)) clearTrace();
  }));
  research.addEventListener("pointerleave", clearTrace);
}

function initHeroConsoleGlow() {
  const consolePanel = document.querySelector(".hero-console");
  if (!consolePanel || !canAnimate || window.matchMedia("(pointer: coarse)").matches) return;
  consolePanel.addEventListener("pointermove", (event) => {
    const rect = consolePanel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 4.2;
    const rotateX = (0.5 - y) * 4.2;
    consolePanel.style.setProperty("--px", `${(x * 100).toFixed(1)}%`);
    consolePanel.style.setProperty("--py", `${(y * 100).toFixed(1)}%`);
    consolePanel.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    consolePanel.classList.add("is-live");
  }, { passive: true });
  consolePanel.addEventListener("pointerleave", () => {
    consolePanel.style.transform = "";
    consolePanel.classList.remove("is-live");
  });
}

function initCountUpMetrics() {
  const metrics = [...document.querySelectorAll("[data-countup]")];
  if (!metrics.length) return;

  const renderValue = (element, value) => {
    const decimals = Number(element.dataset.countDecimals || 0);
    const prefix = element.dataset.countPrefix || "";
    const suffix = element.dataset.countSuffix || "";
    const formatted = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
    element.textContent = `${prefix}${formatted}${suffix}`;
  };

  if (!canAnimate) {
    metrics.forEach((element) => {
      renderValue(element, Number(element.dataset.countTarget || 0));
      element.classList.add("is-counted");
    });
    return;
  }

  const startCount = (element) => {
    if (element.dataset.countupPlayed === "true") return;
    element.dataset.countupPlayed = "true";

    const target = Number(element.dataset.countTarget || 0);
    const decimals = Number(element.dataset.countDecimals || 0);
    /* Extend the readable count by 30%, while preserving the existing stagger. */
    const duration = Math.max(420, Number(element.dataset.countDuration || 900) * 1.3);
    const delay = Math.max(0, Number(element.dataset.countDelay || 0));

    window.setTimeout(() => {
      const startTime = performance.now();
      element.style.setProperty("--countup-duration", `${duration}ms`);
      element.classList.add("is-counting");
      renderValue(element, 0);

      const tick = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = decimals > 0
          ? target * eased
          : Math.min(target, Math.round(target * eased));
        renderValue(element, progress === 1 ? target : value);

        if (progress < 1) {
          requestAnimationFrame(tick);
          return;
        }

        element.classList.remove("is-counting");
        element.classList.add("is-counted");
      };

      requestAnimationFrame(tick);
    }, delay);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      startCount(entry.target);
    });
  }, { threshold: 0.55, rootMargin: "0px 0px -6% 0px" });

  metrics.forEach((element) => observer.observe(element));
}

function initScrollChoreography() {
  const sequenceObserverOptions = {
    threshold: 0.01,
    /* Start just before the group reaches the viewport, so no visible flash. */
    rootMargin: "0px 0px 6% 0px"
  };

  const markOrchestrated = (...elements) => {
    elements.filter(Boolean).forEach((element) => element.classList.add("motion-orchestrated"));
  };

  const registerSequence = (root, items, options = {}) => {
    const sequenceItems = items.filter(Boolean);
    if (!root || !sequenceItems.length) return;

    root.dataset.motionSequence = "";
    sequenceItems.forEach((item) => {
      item.dataset.motionItem = "";
    });

    if (!canAnimate || typeof Element.prototype.animate !== "function") return;

    const duration = options.duration || 720;
    const stagger = options.stagger || 90;
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY ?? 20;
    const startScale = options.startScale || 0.988;
    const easing = options.easing || "cubic-bezier(.16, 1, .3, 1)";
    const opacityEasing = options.opacityEasing;
    const useTransform = options.useTransform === true;

    const play = () => {
      if (root.dataset.motionPlayed === "true") return;
      root.dataset.motionPlayed = "true";

      const orderedItems = options.order === "visual-left-to-right"
        ? [...sequenceItems].sort((itemA, itemB) => {
            const rectA = itemA.getBoundingClientRect();
            const rectB = itemB.getBoundingClientRect();
            return rectA.left - rectB.left || rectA.top - rectB.top;
          })
        : sequenceItems;

      orderedItems.forEach((item, index) => {
        const restorePointerPressure = useTransform && item.classList.contains("pointer-pressure-card");
        if (restorePointerPressure) {
          item.classList.remove("pointer-pressure-card", "is-pointer-pressed");
        }

        item.style.willChange = useTransform ? "opacity, transform" : "opacity, translate, scale";
        const delay = index * stagger;
        const animations = [];
        const motionStart = useTransform
          ? { transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${startScale})` }
          : {
              translate: `${offsetX}px ${offsetY}px`,
              scale: startScale
            };
        const motionEnd = useTransform
          ? { transform: "translate3d(0, 0, 0) scale(1)" }
          : {
              translate: "0 0",
              scale: 1
            };

        const cleanupMotion = () => {
          if (restorePointerPressure) item.classList.add("pointer-pressure-card");
          item.style.removeProperty("will-change");
        };

        if (opacityEasing) {
          animations.push(
            item.animate([
              motionStart,
              motionEnd
            ], {
              duration,
              delay,
              easing,
              fill: "both"
            }),
            item.animate([
              { opacity: 0 },
              { opacity: 1 }
            ], {
              duration,
              delay,
              easing: opacityEasing,
              fill: "both"
            })
          );
        } else {
          animations.push(item.animate([
            {
              opacity: 0,
              translate: `${offsetX}px ${offsetY}px`,
              scale: startScale
            },
            {
              opacity: 1,
              translate: "0 0",
              scale: 1
            }
          ], {
            duration,
            delay,
            easing,
            fill: "both"
          }));
        }

        Promise.all(animations.map((animation) => animation.finished)).then(() => {
          animations.forEach((animation) => animation.cancel());
          cleanupMotion();
        }).catch(() => {
          cleanupMotion();
        });
      });
    };

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      play();
    }, {
      ...sequenceObserverOptions,
      rootMargin: options.rootMargin || sequenceObserverOptions.rootMargin
    });

    observer.observe(root);
  };

  const dossier = document.querySelector(".resume-dossier");
  const dossierHead = dossier?.querySelector(".dossier-head");
  const paperList = dossier?.querySelector(".paper-list");
  const supportMatrix = dossier?.querySelector(".support-matrix");
  markOrchestrated(dossier);

  registerSequence(
    dossier,
    [dossierHead],
    {
      duration: 940,
      offsetY: 12,
      startScale: 0.998,
      easing: "cubic-bezier(.22, 1, .36, 1)"
    }
  );

  registerSequence(
    paperList,
    [...(paperList?.querySelectorAll(":scope > li") || [])],
    {
      duration: 556,
      stagger: 278,
      offsetX: 0,
      offsetY: 26,
      startScale: 0.994,
      easing: "cubic-bezier(.22, .61, .36, 1)",
      opacityEasing: "cubic-bezier(.45, 0, .55, 1)",
      rootMargin: "0px 0px 14% 0px",
      useTransform: true,
      order: "visual-left-to-right"
    }
  );

  registerSequence(
    supportMatrix,
    [
      supportMatrix?.querySelector(".support-matrix-head"),
      ...(supportMatrix?.querySelectorAll(":scope > section") || [])
    ],
    {
      duration: 920,
      stagger: 88,
      offsetY: 10,
      startScale: 0.998,
      easing: "cubic-bezier(.22, 1, .36, 1)"
    }
  );

  const research = document.querySelector("#research");
  const researchHeading = research?.querySelector(":scope > .section-heading");
  const researchCards = [...(research?.querySelectorAll(".research-cards .research-card") || [])];
  const logicPanel = research?.querySelector(".research-logic-panel");
  const researchChain = research?.querySelector(".research-chain");
  const methodCards = [...(researchChain?.querySelectorAll(":scope > .method-card") || [])];

  markOrchestrated(
    researchHeading,
    research?.querySelector(".research-cards"),
    logicPanel,
    researchChain
  );

  registerSequence(
    research,
    [researchHeading, ...researchCards, logicPanel],
    { duration: 740, stagger: 86, offsetY: 20, startScale: 0.991 }
  );

  registerSequence(
    researchChain,
    methodCards,
    { duration: 680, stagger: 78, offsetY: 16, startScale: 0.994 }
  );
}

function initHeroTypewriter() {
  const texts = [
    "2027年设计学博士申请",
    "智能产品设计研究",
    "用户研究与系统分析",
    "量化设计与参数转译",
    "产品服务系统研究",
    "复杂场景协同设计"
  ];

  const target = document.querySelector("[data-hero-typewriter]");
  if (!target) return;
  if (target.dataset.typewriterReady === "true") return;
  target.dataset.typewriterReady = "true";

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const TYPE_SPEED = 95;
  const DELETE_SPEED = 55;
  const HOLD_TIME = 1400;
  const NEXT_DELAY = 260;

  function tick() {
    const currentText = texts[textIndex];

    if (!isDeleting) {
      charIndex += 1;
      target.textContent = currentText.slice(0, charIndex);

      if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(tick, HOLD_TIME);
        return;
      }

      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex -= 1;
      target.textContent = currentText.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(tick, NEXT_DELAY);
        return;
      }

      setTimeout(tick, DELETE_SPEED);
    }
  }

  target.textContent = "";
  tick();
}

document.querySelector(".reader-prev")?.addEventListener("click", () => stepReader(-1));
document.querySelector(".reader-next")?.addEventListener("click", () => stepReader(1));

document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
document.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
document.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.classList.contains("is-open")) {
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
    return;
  }
  const readerVisible = readerSection && readerSection.getBoundingClientRect().top < window.innerHeight * 0.45
    && readerSection.getBoundingClientRect().bottom > window.innerHeight * 0.45;
  if (!readerVisible) return;
  if (event.key === "ArrowLeft") stepReader(-1);
  if (event.key === "ArrowRight") stepReader(1);
});

window.addEventListener("mousemove", (event) => {
  if (canAnimate) {
    const mx = (event.clientX / window.innerWidth - 0.5).toFixed(4);
    const my = (event.clientY / window.innerHeight - 0.5).toFixed(4);
    document.documentElement.style.setProperty("--mx", mx);
    document.documentElement.style.setProperty("--my", my);
  }
  cursorLight.style.transform = `translate(${event.clientX - 180}px, ${event.clientY - 180}px)`;
}, { passive: true });

window.addEventListener("scroll", updateChrome, { passive: true });
window.addEventListener("resize", updateChrome, { passive: true });

const scrollToSection = (target) => {
  const headerOffset = document.querySelector(".site-header")?.offsetHeight || 68;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 24;
  window.scrollTo({ top, behavior: "auto" });
};

window.addEventListener("load", () => {
  const target = location.hash ? document.querySelector(location.hash) : null;
  if (target) {
    setTimeout(() => {
      scrollToSection(target);
      updateChrome();
    }, 80);
  } else {
    resetDefaultEntry();
    updateChrome();
  }
});
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

renderPages();
applyStaggerIndexes();
selectReaderPage(1, { scrollThumb: false });
initInteractiveSurfaces();
initResearchTrace();
initHeroConsoleGlow();
initCountUpMetrics();
initScrollChoreography();
initHeroTypewriter();
updateChrome();
