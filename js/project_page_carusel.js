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

   Desktop (>=992px): прежнее поведение — пин секции +
   горизонтальный драйв трека через scrub-анимацию.

   Mobile/Tablet (<992px): пин ОТКЛЮЧЕН (на телефонах пин
   горизонтальных секций почти всегда даёт прыжки/залипания
   и конфликтует с нативным свайпом). Вместо этого:
     - трек становится обычным горизонтально скроллящимся
       блоком (overflow-x: auto, со свайпом пальцем),
     - тёмное состояние body включается/выключается по
       обычному вертикальному ScrollTrigger без pin.
--------------------------------------------------------- */
const mm = gsap.matchMedia();

withLenis(() => {
mm.add(
  {
    // 1024px — стандартная граница "планшет / десктоп". Phones и
    // tablets (включая то, что у вас в разметке переключается по
    // md: на 768px) получают touch-скролл; pin + горизонтальный
    // драйв остаётся только настоящему десктопу.
    // Если у вас другая граница для десктопа — поменяйте оба числа.
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

      // на десктопе убеждаемся, что нативный overflow-x не мешает gsap-анимации
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

      // возвращаем функцию очистки — matchMedia вызовет её
      // автоматически при переходе на mobile-брейкпоинт
      return () => trigger.kill();
    } else {
      /* ---------- MOBILE / TABLET: ручной drag трека через touch ----------
         Вместо нативного overflow-x используем тот же принцип, что и
         на десктопе — двигаем track через transform: translateX.
         Разница только в том, кто "водит" анимацию: на десктопе это
         делает scroll (через scrub), на мобильном — палец пользователя.

         Ключевой момент против предыдущих багов: ось жеста (горизонталь
         или вертикаль) определяется один раз в начале каждого touch-
         жеста по первым нескольким пикселям движения:
           - если жест горизонтальный — preventDefault() и двигаем
             track вручную через GSAP;
           - если жест вертикальный — НИЧЕГО не делаем и НЕ вызываем
             preventDefault, жест полностью уходит браузеру/Lenis,
             страница скроллится как обычна, без всякого "захвата".
         Поскольку решение принимается заново на КАЖДЫЙ новый touchstart,
         после того как трек докручен до конца, следующий вертикальный
         свайп — это уже новый, чистый жест, который браузер обработает
         штатно с первого же пикселя. */

      // wrapper уже имеет overflow-hidden в разметке (project_carousel_wrapper),
      // поэтому track просто переполняет его по горизонтали — обрезка идёт
      // средствами CSS, а не overflow-x на самом track.
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
      const AXIS_THRESHOLD = 8; // px, после скольки пикселей фиксируем ось жеста

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
          if (Math.abs(deltaX) < AXIS_THRESHOLD && Math.abs(deltaY) < AXIS_THRESHOLD) {
            return; // ещё не понятно, куда жест — ждём
          }
          axisLock = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
        }

        if (axisLock === 'y') {
          // вертикальный жест — ничего не делаем, отдаём браузеру/Lenis
          console.log('[carousel debug] vertical gesture detected, не вмешиваемся. window.scrollY =', window.scrollY);
          return;
        }

        // горизонтальный жест — двигаем трек вручную, страницу не трогаем
        e.preventDefault();
        const maxDrag = getMaxDrag();
        let next = startTrackX + deltaX;
        // лёгкое сопротивление за границами, без полной "резины"
        if (next > 0) next = next * 0.3;
        if (next < -maxDrag) next = -maxDrag + (next + maxDrag) * 0.3;
        currentX = next;
        gsap.set(track, { x: next });
      }

      function onTouchEnd() {
        if (axisLock === 'x') {
          const maxDrag = getMaxDrag();
          const clamped = Math.min(0, Math.max(-maxDrag, currentX));
          currentX = clamped;
          gsap.to(track, { x: clamped, duration: 0.4, ease: 'power3.out' });

          // дотащили трек до последнего блока — возвращаем дефолтный
          // фон и больше не мешаем нормальному вертикальному скроллу
          if (maxDrag > 0 && Math.abs(clamped + maxDrag) < 2) {
            leaveDarkState();
          } else if (Math.abs(clamped) < 2) {
            // вернулись к первому блоку — снова тёмное состояние
            enterDarkState();
          }
        }
        axisLock = null;
      }

      track.addEventListener('touchstart', onTouchStart, { passive: true });
      track.addEventListener('touchmove', onTouchMove, { passive: false });
      track.addEventListener('touchend', onTouchEnd, { passive: true });
      track.addEventListener('touchcancel', onTouchEnd, { passive: true });

      // тёмное состояние включаем при входе в секцию (обычный
      // вертикальный ScrollTrigger). Выключаем НЕ по позиции
      // скролла (как было раньше — это не совпадало с прогрессом
      // карусели), а явно из onTouchEnd выше, когда трек реально
      // докручен до последнего блока. onLeave/onLeaveBack оставляем
      // как страховку — если секция полностью ушла из вьюпорта,
      // в любом случае сбрасываем фон.
      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top center',
        end: 'bottom center',
        onEnter: enterDarkState,
        onEnterBack: enterDarkState,
        onLeave: leaveDarkState,
        onLeaveBack: leaveDarkState,
      });

      return () => {
        trigger.kill();
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