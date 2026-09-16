(function initHeroLightField() {
  const canvas = document.querySelector("[data-hero-light-field]");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const hero = canvas.closest(".hero");
  const context = canvas.getContext("2d", { alpha: true });
  if (!hero || !context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const beams = [
    { angle: 1.98, width: 0.048, alpha: 0.16, blur: 44, speed: 0.00045, phase: 0.4, drift: 0.060 },
    { angle: 2.14, width: 0.112, alpha: 0.23, blur: 70, speed: 0.00035, phase: 1.7, drift: 0.075 },
    { angle: 2.31, width: 0.180, alpha: 0.26, blur: 96, speed: 0.00027, phase: 3.1, drift: 0.066 },
    { angle: 2.49, width: 0.102, alpha: 0.20, blur: 72, speed: 0.00037, phase: 4.5, drift: 0.082 },
    { angle: 2.67, width: 0.044, alpha: 0.14, blur: 46, speed: 0.00042, phase: 5.6, drift: 0.064 }
  ];

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let lastFrameTime = 0;
  const frameInterval = 1000 / 30;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    drawFrame(reducedMotion.matches ? 0 : performance.now());
  }

  function drawAreaLight(options) {
    const {
      centerX,
      centerY,
      radius,
      scaleX,
      scaleY,
      innerColor,
      middleColor,
      outerColor
    } = options;
    context.save();
    context.translate(centerX, centerY);
    context.scale(scaleX, scaleY);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);

    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.38, middleColor);
    gradient.addColorStop(0.72, outerColor);
    gradient.addColorStop(1, "rgba(19, 52, 80, 0)");

    context.fillStyle = gradient;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.restore();
  }

  function drawAmbientGlow(time) {
    const pulse = 0.96 + Math.sin(time * 0.00031) * 0.04;
    const diagonal = Math.hypot(width, height);

    drawAreaLight({
      centerX: width * (0.68 + Math.sin(time * 0.00031) * 0.070),
      centerY: height * (0.23 + Math.cos(time * 0.00027) * 0.060),
      radius: diagonal * 0.64,
      scaleX: 1.38,
      scaleY: 0.88,
      innerColor: `rgba(188, 226, 248, ${0.165 * pulse})`,
      middleColor: `rgba(101, 166, 208, ${0.100 * pulse})`,
      outerColor: `rgba(48, 103, 143, ${0.032 * pulse})`
    });

    drawAreaLight({
      centerX: width * (0.41 + Math.cos(time * 0.00025 + 1.2) * 0.080),
      centerY: height * (0.65 + Math.sin(time * 0.00029 + 0.8) * 0.055),
      radius: diagonal * 0.56,
      scaleX: 1.48,
      scaleY: 0.86,
      innerColor: `rgba(106, 174, 215, ${0.100 * pulse})`,
      middleColor: `rgba(61, 125, 169, ${0.056 * pulse})`,
      outerColor: `rgba(34, 79, 116, ${0.018 * pulse})`
    });

    drawAreaLight({
      centerX: width * (0.83 + Math.sin(time * 0.00039 + 2.4) * 0.045),
      centerY: height * (0.08 + Math.cos(time * 0.00034 + 1.6) * 0.035),
      radius: diagonal * 0.30,
      scaleX: 1.24,
      scaleY: 0.72,
      innerColor: `rgba(222, 242, 253, ${0.145 * pulse})`,
      middleColor: `rgba(136, 192, 226, ${0.060 * pulse})`,
      outerColor: `rgba(69, 130, 172, ${0.012 * pulse})`
    });
  }

  function drawBeam(beam, time, index) {
    const cycle = time * beam.speed + beam.phase;
    const originX = width * (0.96 + Math.sin(cycle * 0.73) * 0.085);
    const originY = height * (-0.14 + Math.cos(cycle * 0.61) * 0.080);
    const angle = beam.angle + Math.sin(cycle) * beam.drift;
    const length = Math.hypot(width, height) * 1.38;
    const nearWidth = Math.max(width, height) * 0.012;
    const farWidth = length * beam.width;
    const shimmer = 0.90 + Math.sin(cycle * 1.31 + index) * 0.10;
    const gradient = context.createLinearGradient(0, 0, length, 0);

    gradient.addColorStop(0, "rgba(214, 241, 255, 0)");
    gradient.addColorStop(0.10, `rgba(205, 237, 255, ${beam.alpha * 0.62 * shimmer})`);
    gradient.addColorStop(0.36, `rgba(151, 205, 238, ${beam.alpha * shimmer})`);
    gradient.addColorStop(0.68, `rgba(91, 157, 202, ${beam.alpha * 0.40 * shimmer})`);
    gradient.addColorStop(0.90, `rgba(52, 112, 158, ${beam.alpha * 0.07 * shimmer})`);
    gradient.addColorStop(1, "rgba(38, 86, 126, 0)");

    context.save();
    context.translate(originX, originY);
    context.rotate(angle);
    context.filter = `blur(${beam.blur}px)`;
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(0, -nearWidth);
    context.lineTo(length, -farWidth);
    context.lineTo(length, farWidth);
    context.lineTo(0, nearWidth);
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawFrame(time) {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "screen";
    drawAmbientGlow(time);
    beams.forEach((beam, index) => drawBeam(beam, time, index));
    context.globalCompositeOperation = "destination-in";
    const edgeFade = context.createLinearGradient(0, 0, 0, height);
    edgeFade.addColorStop(0, "rgba(0, 0, 0, 1)");
    edgeFade.addColorStop(0.72, "rgba(0, 0, 0, 1)");
    edgeFade.addColorStop(0.94, "rgba(0, 0, 0, 0.42)");
    edgeFade.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = edgeFade;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
  }

  function animate(time) {
    if (time - lastFrameTime >= frameInterval) {
      drawFrame(time);
      lastFrameTime = time;
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function updateAnimationState() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastFrameTime = 0;
    if (reducedMotion.matches || document.visibilityState !== "visible") {
      drawFrame(0);
    } else {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(hero);
  reducedMotion.addEventListener("change", updateAnimationState);
  document.addEventListener("visibilitychange", updateAnimationState);
  resizeCanvas();
  updateAnimationState();
})();
