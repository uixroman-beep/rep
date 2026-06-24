(() => {
  const studio = document.querySelector("#studio");
  const cursor = document.querySelector("#cursor-studio");
  if (!studio || !cursor) return;

  const COUNT = 14;
  const trail = [];

  let mouseX = 0;
  let mouseY = 0;
  let cx = 0;
  let cy = 0;

  let active = false;

  // =========================
  // TRAIL INIT
  // =========================
  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("div");
    el.className = "trail-dot";
    document.body.appendChild(el);

    trail.push({
      el,
      x: 0,
      y: 0,
      setX: gsap.quickSetter(el, "x", "px"),
      setY: gsap.quickSetter(el, "y", "px"),
      setScale: gsap.quickSetter(el, "scale"),
      setOpacity: gsap.quickSetter(el, "opacity"),
    });
  }

  // =========================
  // CURSOR (FIXED)
  // =========================

  const setCursorX = gsap.quickSetter(cursor, "x", "px");
  const setCursorY = gsap.quickSetter(cursor, "y", "px");

  // ВАЖНО: НЕ убиваем видимость на старте
  gsap.set(cursor, {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
  });

  // =========================
  // MAGNETS
  // =========================
  const magnets = document.querySelectorAll("[data-magnetic]");

  function magnetOffset(e, el, strength = 0.08) {
    const r = el.getBoundingClientRect();
    return {
      dx: (e.clientX - (r.left + r.width / 2)) * strength,
      dy: (e.clientY - (r.top + r.height / 2)) * strength,
    };
  }

  // =========================
  // ENTER / LEAVE
  // =========================

  function enter(e) {
    gsap.killTweensOf(cursor);
    gsap.killTweensOf(trail.map(t => t.el));

    active = true;

    mouseX = cx = e.clientX;
    mouseY = cy = e.clientY;

    gsap.to(cursor, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
    });

    trail.forEach(t => {
      t.x = mouseX;
      t.y = mouseY;

      t.setX(mouseX);
      t.setY(mouseY);
      t.setScale(1);
      t.setOpacity(1);
    });
  }

  function leave() {
    gsap.killTweensOf(cursor);
    gsap.killTweensOf(trail.map(t => t.el));

    active = false;

    gsap.to(cursor, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
    });

    trail.forEach(t => {
      t.setOpacity(0);
      t.setScale(0);
    });
  }

  studio.addEventListener("pointerenter", enter);
  studio.addEventListener("pointerleave", leave);

  studio.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // =========================
  // MAIN LOOP
  // =========================

  gsap.ticker.add(() => {
    if (!active) return;

    const smooth = 0.18;

    cx += (mouseX - cx) * smooth;
    cy += (mouseY - cy) * smooth;

    setCursorX(cx);
    setCursorY(cy);

    magnets.forEach(el => {
      const { dx, dy } = magnetOffset(
        { clientX: mouseX, clientY: mouseY },
        el,
        0.08
      );
      gsap.set(el, { x: dx, y: dy });
    });

    let tx = mouseX;
    let ty = mouseY;

    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const f = Math.max(0.05, 0.22 - i * 0.01);

      t.x += (tx - t.x) * f;
      t.y += (ty - t.y) * f;

      tx = t.x;
      ty = t.y;

      t.setX(t.x);
      t.setY(t.y);
      t.setScale(Math.max(0.2, 1 - i * 0.05));
      t.setOpacity(Math.max(0.05, 1 - i * 0.06));
    }
  });
})();