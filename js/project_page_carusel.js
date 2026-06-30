gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   1. Lenis уже создаётся в custom.js — переиспользуем через
   window.lenis. Добавь там: window.lenis = lenis;
--------------------------------------------------------- */
function withLenis(callback) {
  if (window.lenis) {
    console.log('[carousel debug] window.lenis уже существует, запускаем сразу');
    callback(window.lenis);
    return;
  }
  console.log('[carousel debug] window.lenis ещё не существует, ждём...');
  const waitForLenis = setInterval(() => {
    if (window.lenis) {
      clearInterval(waitForLenis);
      console.log('[carousel debug] window.lenis появился, запускаем');
      callback(window.lenis);
    }
  }, 50);
}

function enterDarkState() {
  console.log('[carousel debug] enterDarkState()');
  gsap.timeline()
    .to('body', { backgroundColor: '#000000', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: '#ffffff', borderColor: '#ffffff', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_image', { scale: 0.8, duration: 1, ease: 'power4.out' }, 0);
}

function leaveDarkState() {
  console.log('[carousel debug] leaveDarkState()');
  gsap.timeline()
    .to('body', { backgroundColor: '#C6C6CE', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: 'black', borderColor: 'black', duration: 1, ease: 'power4.out' }, 0)
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
    const { isDesktop, isMobile } = context.conditions;
    console.log('[carousel debug] matchMedia сработал. isDesktop =', isDesktop, 'isMobile =', isMobile);

    const wrapper = document.querySelector('.project_carousel_wrapper');
    const track = document.querySelector('.project_carousel_track');
    const items = gsap.utils.toArray('.project_block_carusel');

    console.log('[carousel debug] wrapper найден:', !!wrapper, wrapper);
    console.log('[carousel debug] track найден:', !!track, track);
    console.log('[carousel debug] items.length =', items.length);

    if (!wrapper || !track || items.length === 0) {
      console.warn('[carousel debug] СТОП: не найден .project_carousel_wrapper / .project_carousel_track / нет items в DOM.');
      return;
    }

    if (isDesktop) {
      console.log('[carousel debug] ветка DESKTOP');

      track.style.overflowX = '';
      track.style.removeProperty('-webkit-overflow-scrolling');
      gsap.set(track, { x: 0 });

      const getScrollDistance = () => track.scrollWidth - wrapper.offsetWidth;
      console.log('[carousel debug] getScrollDistance() при инициализации =', getScrollDistance());

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

      return () => {
        console.log('[carousel debug] DESKTOP cleanup, kill trigger');
        trigger.kill();
      };
    } else {
      console.log('[carousel debug] ветка MOBILE/TABLET — вешаем touch-обработчики на track');

      track.style.overflowX = '';
      track.style.webkitOverflowScrolling = '';
      track.style.scrollSnapType = '';
      track.style.touchAction = 'pan-y';
      items.forEach((item) => {
        item.style.scrollSnapAlign = '';
      });

      items.forEach((item, i) => {
        console.log(`[carousel debug] item[${i}] offsetLeft =`, item.offsetLeft, 'width =', item.getBoundingClientRect().width);
      });

      const getMaxDrag = () => Math.max(0, track.scrollWidth - wrapper.offsetWidth);
      console.log('[carousel debug] track.scrollWidth =', track.scrollWidth, 'wrapper.offsetWidth =', wrapper.offsetWidth, 'maxDrag =', getMaxDrag());

      let currentX = 0;
      gsap.set(track, { x: 0 });

      let startX = 0;
      let startY = 0;
      let startTrackX = 0;
      let axisLock = null;
      let tapOnInteractive = false;
      let maxMovement = 0;
      const AXIS_THRESHOLD = 8;
      const TAP_THRESHOLD = 10;

      function onTouchStart(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTrackX = currentX;
        axisLock = null;
        maxMovement = 0;
        tapOnInteractive = !!e.target.closest('a, button');
        console.log('[carousel debug] touchstart. target =', e.target, 'tapOnInteractive =', tapOnInteractive, 'startX/Y =', startX, startY);
      }

      function onTouchMove(e) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        maxMovement = Math.max(maxMovement, Math.abs(deltaX), Math.abs(deltaY));

        if (axisLock === null) {
          if (Math.abs(deltaX) < AXIS_THRESHOLD && Math.abs(deltaY) < AXIS_THRESHOLD) {
            return;
          }
          axisLock = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
          console.log('[carousel debug] axisLock зафиксирован как', axisLock, 'deltaX =', deltaX, 'deltaY =', deltaY);
        }

        if (axisLock === 'y') return;

        e.preventDefault();
        const maxDrag = getMaxDrag();
        let next = startTrackX + deltaX;
        if (next > 0) next = next * 0.3;
        if (next < -maxDrag) next = -maxDrag + (next + maxDrag) * 0.3;
        currentX = next;
        gsap.set(track, { x: next });
      }

      function onTouchEnd() {
        console.log('[carousel debug] touchend. axisLock =', axisLock, 'maxMovement =', maxMovement, 'tapOnInteractive =', tapOnInteractive, 'TAP_THRESHOLD =', TAP_THRESHOLD);

        if (maxMovement < TAP_THRESHOLD && !tapOnInteractive) {
          console.log('[carousel debug] -> распознано как ТАП, вызываем goToNextItem()');
          goToNextItem();
        } else if (axisLock === 'x') {
          console.log('[carousel debug] -> распознано как горизонтальный СВАЙП, доводим до края');
          const maxDrag = getMaxDrag();
          const clamped = Math.min(0, Math.max(-maxDrag, currentX));
          currentX = clamped;
          gsap.to(track, { x: clamped, duration: 0.4, ease: 'power3.out' });
        } else {
          console.log('[carousel debug] -> вертикальный жест или тап по interactive-элементу, ничего не делаем');
        }
        axisLock = null;
      }

      function getCurrentIndex() {
        let closestIndex = 0;
        let closestDist = Infinity;
        items.forEach((item, i) => {
          const dist = Math.abs(item.offsetLeft + currentX);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        });
        console.log('[carousel debug] getCurrentIndex() -> currentX =', currentX, 'closestIndex =', closestIndex);
        return closestIndex;
      }

      function goToNextItem() {
        const maxDrag = getMaxDrag();
        console.log('[carousel debug] goToNextItem(). maxDrag =', maxDrag, 'items.length =', items.length);

        if (maxDrag <= 0) {
          console.warn('[carousel debug] СТОП: maxDrag <= 0 — трек не шире wrapper, листать некуда. Проверь CSS-ширину track/items.');
          return;
        }
        if (items.length === 0) {
          console.warn('[carousel debug] СТОП: items.length === 0');
          return;
        }

        const currentIndex = getCurrentIndex();
        const nextIndex = Math.min(items.length - 1, currentIndex + 1);
        const nextItem = items[nextIndex];

        console.log('[carousel debug] currentIndex =', currentIndex, 'nextIndex =', nextIndex, 'nextItem.offsetLeft =', nextItem.offsetLeft);

        if (currentIndex === nextIndex) {
          console.warn('[carousel debug] ВНИМАНИЕ: currentIndex === nextIndex — мы уже на последнем блоке, листать некуда.');
        }

        let next = -nextItem.offsetLeft;
        next = Math.max(-maxDrag, Math.min(0, next));
        console.log('[carousel debug] едем к x =', next);
        currentX = next;
        gsap.to(track, { x: next, duration: 0.5, ease: 'power3.out' });
      }

      track.addEventListener('touchstart', onTouchStart, { passive: true });
      track.addEventListener('touchmove', onTouchMove, { passive: false });
      track.addEventListener('touchend', onTouchEnd, { passive: true });
      track.addEventListener('touchcancel', onTouchEnd, { passive: true });

      console.log('[carousel debug] touch-обработчики навешаны на track');

      return () => {
        console.log('[carousel debug] MOBILE cleanup, снимаем обработчики');
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

window.addEventListener('load', () => {
  console.log('[carousel debug] window load -> ScrollTrigger.refresh()');
  ScrollTrigger.refresh();
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.log('[carousel debug] resize -> ScrollTrigger.refresh()');
    ScrollTrigger.refresh();
  }, 200);
});