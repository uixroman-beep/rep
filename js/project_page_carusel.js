gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   1. Lenis уже создаётся в custom.js (там же висит lerp,
   обработка .no-scroll и т.д.) — здесь НЕ создаём второй
   инстанс, а просто переиспользуем существующий через
   window.lenis.

   ВАЖНО: в custom.js нужно добавить window.lenis = lenis;
   сразу после "lenis = new Lenis({ ... });", иначе тут
   window.lenis будет undefined (let/const не попадают в
   window автоматически, в отличие от var).
--------------------------------------------------------- */
function withLenis(callback) {
  if (window.lenis) {
    callback(window.lenis);
    return;
  }
  // на случай, если этот скрипт выполнился раньше, чем
  // custom.js успел создать Lenis на DOMContentLoaded
  const waitForLenis = setInterval(() => {
    if (window.lenis) {
      clearInterval(waitForLenis);
      callback(window.lenis);
    }
  }, 50);
}

/* ---------------------------------------------------------
   2. Анимации входа/выхода из "тёмного" состояния.
--------------------------------------------------------- */
function enterDarkState() {
  gsap.timeline()
    .to('body', { backgroundColor: '#000000', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: '#ffffff', borderColor: '#ffffff', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_image', { scale: 0.8, duration: 1, ease: 'power4.out' }, 0);
}

function leaveDarkState() {
  gsap.timeline()
    .to('body', { backgroundColor: '#C6C6CE', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: 'black', borderColor: 'black', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_image', { scale: 1, duration: 1, ease: 'power4.out' }, 0);
}

/* ---------------------------------------------------------
   3. Карусель с responsive-логикой через matchMedia.

   Desktop (>=1024px): прежнее поведение — пин секции +
   горизонтальный драйв трека через scrub-анимацию.

   Mobile/Tablet (<1024px): пин ОТКЛЮЧЕН. Трек двигается
   вручную через touch (drag), а тап по карточке без
   значимого сдвига пальца листает к следующему блоку.
--------------------------------------------------------- */
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
      console.warn(
        'Карусель не инициализирована: не найден .project_carousel_wrapper или .project_carousel_track в DOM.'
      );
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
      /* ---------- MOBILE / TABLET: ручной drag + тап-листание ---------- */

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
      let tapOnInteractive = false;
      let maxMovement = 0; // максимальное смещение пальца за жест (по любой оси)
      const AXIS_THRESHOLD = 8; // px, после скольки пикселей фиксируем ось жеста
      const TAP_THRESHOLD = 10; // px — если палец сдвинулся меньше, это тап, а не свайп

      function onTouchStart(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTrackX = currentX;
        axisLock = null;
        maxMovement = 0;
        tapOnInteractive = !!e.target.closest('a, button');
      }

      function onTouchMove(e) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        maxMovement = Math.max(maxMovement, Math.abs(deltaX), Math.abs(deltaY));

        if (axisLock === null) {
          if (Math.abs(deltaX) < AXIS_THRESHOLD && Math.abs(deltaY) < AXIS_THRESHOLD) {
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
        if (next > 0) next = next * 0.3;
        if (next < -maxDrag) next = -maxDrag + (next + maxDrag) * 0.3;
        currentX = next;
        gsap.set(track, { x: next });
      }

      function onTouchEnd() {
        if (maxMovement < TAP_THRESHOLD && !tapOnInteractive) {
          // палец почти не двигался за весь жест — это тап, а не свайп.
          // Листаем трек к следующему блоку.
          goToNextItem();
        } else if (axisLock === 'x') {
          const maxDrag = getMaxDrag();
          const clamped = Math.min(0, Math.max(-maxDrag, currentX));
          currentX = clamped;
          gsap.to(track, { x: clamped, duration: 0.4, ease: 'power3.out' });
        }
        axisLock = null;
      }

      // --- точное определение текущего и следующего блока ---
      // Ищем блок, ближайший к текущей позиции трека, и едем к offsetLeft
      // СЛЕДУЮЩЕГО блока — точное попадание независимо от gap/ширины карточек.

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
        return closestIndex;
      }

      function goToNextItem() {
        const maxDrag = getMaxDrag();
        if (maxDrag <= 0 || items.length === 0) return;

        const currentIndex = getCurrentIndex();
        const nextIndex = Math.min(items.length - 1, currentIndex + 1);
        const nextItem = items[nextIndex];

        let next = -nextItem.offsetLeft;
        next = Math.max(-maxDrag, Math.min(0, next)); // не выходим за границы трека
        currentX = next;
        gsap.to(track, { x: next, duration: 0.5, ease: 'power3.out' });
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
   и ресайзе — на случай догрузки картинок/видео, меняющих
   scrollWidth трека, либо смены ориентации экрана.
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