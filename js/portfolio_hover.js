document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".table_stroke");

  let activePreview = null;
  let activeRow = null;

  let mouseX = 0;
  let mouseY = 0;

  let zCounter = 1;

  const state = new Map();

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  rows.forEach((row) => {
    const preview = row.querySelector(".preview");
    const img = preview?.querySelector("img");

    if (!preview || !img) return;

    let w = 0;
    let h = 0;

    function updateSize() {
      w = img.offsetWidth / 2 || 0;
      h = img.offsetHeight / 2 || 0;
    }

    if (img.complete) updateSize();
    else img.addEventListener("load", updateSize);

    const xTo = gsap.quickTo(preview, "x", {
      duration: 0.2,
      ease: "power3.out",
    });

    const yTo = gsap.quickTo(preview, "y", {
      duration: 0.2,
      ease: "power3.out",
    });

    state.set(row, {
      preview,
      xTo,
      yTo,
      w,
      h,
    });

    row.addEventListener("mouseenter", () => {
      activePreview = preview;
      activeRow = row;

      zCounter++;
      preview.style.zIndex = zCounter;

      updateSize();

      gsap.killTweensOf(preview);
      gsap.set(preview, {
        opacity: 0,
        scale: 0,
      });

      gsap.to(preview, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
      });
    });

    row.addEventListener("mouseleave", () => {
      if (!preview) return;

      gsap.to(preview, {
        opacity: 0,
        scale: 1.02,
        duration: 0.35,
        delay: 2,
        ease: "power3.out",
      });

      activePreview = null;
      activeRow = null;
    });
  });

  // единый render loop
  gsap.ticker.add(() => {
    if (!activePreview || !activeRow) return;

    const data = state.get(activeRow);
    if (!data) return;


    const rowRect = activeRow.getBoundingClientRect();
    const localX = mouseX - rowRect.left;
    const localY = mouseY - rowRect.top;

    data.xTo(localX - data.w);
    data.yTo(localY - data.h);
  });
});    