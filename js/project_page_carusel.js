gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   1. Lenis уже создаётся в custom.js — переиспользуем через
   window.lenis. Добавь там: window.lenis = lenis;
--------------------------------------------------------- */
function withLenis(callback) {
  if (window.lenis) {
    callback(window.lenis);
    return;
  }
  const waitForLenis = setInterval(() => {
    if (window.lenis) {
      clearInterval(waitForLenis);
      callback(window.lenis);
    }
  }, 50);
}

function enterDarkState() {
  gsap.timeline()
    .to('body', { backgroundColor: '#000000', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: '#ffffff', borderColor: '#ffffff', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_wrapper', { color: '#ffffff', borderColor: '#ffffff', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_image', { scale: 0.8, duration: 1, ease: 'power4.out' }, 0);
}

function leaveDarkState() {
  gsap.timeline()
    .to('body', { backgroundColor: '#C6C6CE', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: 'black', borderColor: 'black', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_wrapper', { color: '#ffffff', borderColor: 'black', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_image', { scale: 1, duration: 1, ease: 'power4.out' }, 0);
}

const mm = gsap.matchMedia();

withLenis(() => {
mm.add(
  {
    isDesktop: '(min-width: 1024px)',
    isMobile: '(max-width: 1023px)',
  },
  (context) => {
    const { isDesktop } = context.conditions;

    const wrapper = document.querySelector('.project_carousel_wrapper');
    const track = document.querySelector('.project_carousel_track');
    const items = gsap.utils.toArray('.project_block_carusel');

    if (!wrapper || !track || items.length === 0) {
      console.warn('Карусель не инициализирована: не найден .project_carousel_wrapper или .project_carousel_track в DOM.');
      return;
    }

    if (isDesktop) {
      /* ---------- DESKTOP: пин + горизонтальный драйв ---------- */

      track.style.overflowX = '';
      track.style.removeProperty('-webkit-overflow-scrolling');
      gsap.set(track, { x: 0 });

      const getScrollDistance = () => track.scrollWidth - wrapper.offsetWidth;

      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'center center',
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
        }),
        onEnter: enterDarkState,
        onEnterBack: enterDarkState,
        onLeave: leaveDarkState,
        onLeaveBack: leaveDarkState,
      });

      return () => trigger.kill();
    } else {
      /* ---------- MOBILE / TABLET: только drag + снэп к ближайшему блоку ---------- */

      track.style.overflowX = '';
      track.style.webkitOverflowScrolling = '';
      track.style.scrollSnapType = '';
      track.style.touchAction = 'pan-y'; // вертикаль отдаём браузеру нативно с самого начала
      items.forEach((item) => {
        item.style.scrollSnapAlign = '';
      });

      const getMaxDrag = () => Math.max(0, track.scrollWidth - wrapper.offsetWidth);

      let currentX = 0;
      gsap.set(track, { x: 0 });

      let startX = 0;
      let startY = 0;
      let startTrackX = 0;
      let axisLock = null; // null | 'x' | 'y'

      // порог в px: на сколько надо потянуть, чтобы перейти к
      // следующему/предыдущему блоку, а не вернуться на место
      const SNAP_THRESHOLD = 50;

      function onTouchStart(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTrackX = currentX;
        axisLock = null;
      }

      function onTouchMove(e) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        if (axisLock === null) {
          if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
            return; // ещё не понятно, куда жест — ждём
          }
          axisLock = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
        }

        if (axisLock === 'y') {
          // вертикальный жест — ничего не делаем, отдаём браузеру/Lenis
          return;
        }

        // горизонтальный жест — двигаем трек вручную, страницу не трогаем
        e.preventDefault();
        const maxDrag = getMaxDrag();
        let next = startTrackX + deltaX;
        // лёгкое сопротивление за границами
        if (next > 0) next = next * 0.3;
        if (next < -maxDrag) next = -maxDrag + (next + maxDrag) * 0.3;
        currentX = next;
        gsap.set(track, { x: next });
      }

      function onTouchEnd() {
        if (axisLock === 'x') {
          snapToNearestItem(startTrackX, currentX);
        }
        axisLock = null;
      }

      function getCurrentIndex(x) {
        let closestIndex = 0;
        let closestDist = Infinity;
        items.forEach((item, i) => {
          const dist = Math.abs(item.offsetLeft + x);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        });
        return closestIndex;
      }

      function snapToNearestItem(fromX, toX) {
        const maxDrag = getMaxDrag();
        if (maxDrag <= 0 || items.length === 0) return;

        const baseIndex = getCurrentIndex(toX);
        const dragDistance = toX - fromX; // < 0 — тянули влево (вперёд), > 0 — вправо (назад)

        let targetIndex = baseIndex;

        // если потянули достаточно далеко — двигаем на блок в сторону жеста,
        // даже если "ближайший" по факту ещё текущий
        if (Math.abs(dragDistance) > SNAP_THRESHOLD) {
          if (dragDistance < 0 && targetIndex < items.length - 1) {
            // тянули влево -> вперёд, но только если ближайший индекс ещё не "обогнал" жест
            const baseItem = items[baseIndex];
            const isStillOnBaseFromStart = getCurrentIndex(fromX) === baseIndex;
            if (isStillOnBaseFromStart) targetIndex = baseIndex + 1;
          } else if (dragDistance > 0 && targetIndex > 0) {
            const isStillOnBaseFromStart = getCurrentIndex(fromX) === baseIndex;
            if (isStillOnBaseFromStart) targetIndex = baseIndex - 1;
          }
        }

        targetIndex = Math.min(items.length - 1, Math.max(0, targetIndex));

        const targetItem = items[targetIndex];
        let next = -targetItem.offsetLeft;
        next = Math.max(-maxDrag, Math.min(0, next));

        currentX = next;
        gsap.to(track, { x: next, duration: 0.4, ease: 'power3.out' });
      }

      track.addEventListener('touchstart', onTouchStart, { passive: true });
      track.addEventListener('touchmove', onTouchMove, { passive: false });
      track.addEventListener('touchend', onTouchEnd, { passive: true });
      track.addEventListener('touchcancel', onTouchEnd, { passive: true });

      // на mobile/tablet фон body НЕ меняется — тёмное состояние
      // только для десктопа (см. ветку isDesktop выше).

      return () => {
        track.removeEventListener('touchstart', onTouchStart);
        track.removeEventListener('touchmove', onTouchMove);
        track.removeEventListener('touchend', onTouchEnd);
        track.removeEventListener('touchcancel', onTouchEnd);
        track.style.touchAction = '';
        gsap.set(track, { clearProps: 'transform' });
      };
    }
  }
);

ScrollTrigger.refresh();
});

/* ---------------------------------------------------------
   4. Дополнительный пересчёт ScrollTrigger при полной загрузке
   и ресайзе.
--------------------------------------------------------- */
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});