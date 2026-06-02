const topbar = document.querySelector(".topbar");
const backTop = document.querySelector(".back-top");
const cursorLight = document.querySelector(".cursor-light");
const scrollProgress = document.querySelector(".scroll-progress");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sideLinks = [...document.querySelectorAll(".side-index a")];
const sections = [...document.querySelectorAll(".viewport-section")];
const revealItems = [...document.querySelectorAll(".reveal")];
const readerSection = document.querySelector(".reader-section");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const canAnimate = !motionQuery.matches;

const focusData = {
  human: {
    kicker: "Human Lens",
    title: "从用户需求识别进入设计问题",
    text: "从真实使用经验中提炼问题，让设计判断有依据。",
    methods: ["理解需求", "识别问题", "形成判断"]
  },
  machine: {
    kicker: "Machine Lens",
    title: "把产品、服务和界面拆成可推导的设计变量",
    text: "把形态、界面、触点和流程整理为可比较的设计变量。",
    methods: ["整理变量", "推导方案", "组织系统"]
  },
  context: {
    kicker: "Context Lens",
    title: "在真实约束中验证设计是否成立",
    text: "回到真实情境，检查方案边界和设计判断是否成立。",
    methods: ["回到场景", "检验边界", "优化方案"]
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
const pageScrubber = document.querySelector("#page-scrubber");
const pageOutput = document.querySelector("#page-output");
const readerCarousel = document.querySelector("#reader-carousel");
let currentPage = 1;
let currentFilter = "all";
let carouselMotionTimer;
let readerWheelLocked = false;
let readerDragStart = null;

function applyStaggerIndexes() {
  [
    ".timeline-item",
    ".dossier-grid section",
    ".project-lenses article",
    ".reader-toolbar > *",
    ".studio-gallery button"
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      item.style.setProperty("--i", String(index));
      item.style.setProperty("--stagger-delay", `${Math.min(index, 10) * 38}ms`);
    });
  });
}

function pagePath(kind, page) {
  return `assets/${kind}/page-${String(page).padStart(2, "0")}.webp`;
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
        <img src="${pagePath("hires", item.page)}" alt="作品集第 ${item.page} 页高清图">
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

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".reader-toolbar button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
  document.querySelectorAll(".page-card").forEach((card) => {
    const show = filter === "all" || card.dataset.group === filter;
    card.hidden = !show;
  });
  const pages = visiblePages();
  if (!pages.includes(currentPage)) {
    selectReaderPage(pages[0] || 1, { scrollThumb: false });
  } else {
    selectReaderPage(currentPage, { scrollThumb: false });
  }
}

function selectReaderPage(page, options = {}) {
  const { scrollThumb = true } = options;
  currentPage = Math.max(1, Math.min(27, page));
  const meta = portfolioPages[currentPage - 1];
  if (pageScrubber && pageOutput) {
    pageScrubber.value = String(currentPage);
    pageOutput.textContent = `Page ${String(currentPage).padStart(2, "0")}`;
  }
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
  currentPage = Math.max(1, Math.min(27, page));
  const meta = portfolioPages[currentPage - 1];
  lightboxImage.src = pagePath("hires", currentPage);
  lightboxImage.alt = `作品集第 ${currentPage} 页高清图`;
  lightboxCaption.textContent = `Page ${String(currentPage).padStart(2, "0")} / ${meta.title}`;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  if (pageScrubber && pageOutput) {
    pageScrubber.value = String(currentPage);
    pageOutput.textContent = `Page ${String(currentPage).padStart(2, "0")}`;
  }
  selectReaderPage(currentPage, { scrollThumb: false });
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function visiblePages() {
  return portfolioPages
    .filter((item) => currentFilter === "all" || item.group === currentFilter)
    .map((item) => item.page);
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
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 6) {
    current = "contact";
  }
  for (const section of sections) {
    if (current !== "contact" && section.getBoundingClientRect().top < window.innerHeight * 0.45) {
      current = section.dataset.section || section.id;
    }
  }
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  sideLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
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
    document.querySelector("#focus-kicker").textContent = data.kicker;
    document.querySelector("#focus-title").textContent = data.title;
    document.querySelector("#focus-text").textContent = data.text;
    document.querySelector("#focus-methods").innerHTML = data.methods.map((method) => `<span>${method}</span>`).join("");
  });
}

function updateMethodPanel(key) {
  const data = methodData[key];
  swapContent(document.querySelector(".method-detail"), () => {
    document.querySelector("#method-kicker").textContent = data.kicker;
    document.querySelector("#method-title").textContent = data.title;
    document.querySelector("#method-text").textContent = data.text;
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

revealItems.forEach((item) => revealObserver.observe(item));

document.querySelectorAll(".node").forEach((node) => {
  node.addEventListener("click", () => {
    document.querySelectorAll(".node").forEach((item) => item.classList.remove("active"));
    node.classList.add("active");
    updateFocusPanel(node.dataset.focus);
  });
});

document.querySelectorAll(".research-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".research-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    updateFocusPanel(card.dataset.focus);
  });
});

document.querySelectorAll(".method-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".method-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    updateMethodPanel(card.dataset.method);
  });
});

document.querySelectorAll(".studio-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".studio-tabs button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".studio").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#studio-${button.dataset.studio}`).classList.add("active");
  });
});

document.querySelectorAll(".studio-gallery button").forEach((button) => {
  button.addEventListener("click", () => openLightbox(Number(button.dataset.page)));
});

document.querySelectorAll(".reader-toolbar button").forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

function initInteractiveSurfaces() {
  if (!canAnimate || window.matchMedia("(pointer: coarse)").matches) return;
  const surfaces = document.querySelectorAll([
    ".profile-card",
    ".resume-strip div",
    ".timeline-item",
    ".dossier-grid section",
    ".research-card",
    ".method-card",
    ".studio-gallery button",
    ".page-card",
    ".contact-card"
  ].join(","));

  surfaces.forEach((surface) => {
    surface.classList.add("interactive-surface");
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 4.2;
      const rotateX = (0.5 - y) * 4.2;
      surface.style.setProperty("--px", `${x * 100}%`);
      surface.style.setProperty("--py", `${y * 100}%`);
      surface.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    }, { passive: true });
    surface.addEventListener("pointerleave", () => {
      surface.style.transform = "";
    });
  });
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

function initReaderGestures() {
  if (!readerCarousel) return;

  readerCarousel.addEventListener("pointerdown", (event) => {
    readerDragStart = { x: event.clientX, y: event.clientY };
    readerCarousel.classList.add("is-dragging");
  });

  readerCarousel.addEventListener("pointerup", (event) => {
    if (!readerDragStart) return;
    const deltaX = event.clientX - readerDragStart.x;
    const deltaY = event.clientY - readerDragStart.y;
    readerCarousel.classList.remove("is-dragging");
    readerDragStart = null;
    if (Math.abs(deltaX) > 54 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      stepReader(deltaX < 0 ? 1 : -1);
    }
  });

  readerCarousel.addEventListener("pointercancel", () => {
    readerDragStart = null;
    readerCarousel.classList.remove("is-dragging");
  });

  readerCarousel.addEventListener("wheel", (event) => {
    if (readerWheelLocked || Math.abs(event.deltaY) < 22) return;
    const rect = readerCarousel.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.88 && rect.bottom > window.innerHeight * 0.12;
    if (!inView) return;
    event.preventDefault();
    readerWheelLocked = true;
    stepReader(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => {
      readerWheelLocked = false;
    }, 680);
  }, { passive: false });
}

if (pageScrubber && pageOutput) {
  pageScrubber.addEventListener("input", () => {
    const page = Number(pageScrubber.value);
    pageOutput.textContent = `Page ${String(page).padStart(2, "0")}`;
  });
  pageScrubber.addEventListener("change", () => selectReaderPage(Number(pageScrubber.value)));
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
window.addEventListener("load", () => {
  const target = location.hash ? document.querySelector(location.hash) : null;
  if (target) {
    setTimeout(() => {
      target.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
      updateChrome();
    }, 80);
  }
});
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

renderPages();
applyStaggerIndexes();
applyFilter("all");
selectReaderPage(1, { scrollThumb: false });
initInteractiveSurfaces();
initHeroConsoleGlow();
initReaderGestures();
updateChrome();
