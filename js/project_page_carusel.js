gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   0. Определяем тип устройства (для Lenis и логики ниже)
--------------------------------------------------------- */
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

/* ---------------------------------------------------------
   1. Lenis — плавный скролл.
   На тач-устройствах включаем syncTouch, иначе на iOS
   часто рассинхронизируется с нативным скроллом.
--------------------------------------------------------- */
window.lenis = window.lenis || new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: isTouchDevice,
  touchMultiplier: 1.5,
});

window.lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  window.lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

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
      /* ---------- MOBILE / TABLET: свайп + обычный триггер ---------- */

      // отдаём горизонтальный скролл нативному свайпу.
      // КРИТИЧНО: Lenis перехватывает touch-скролл на всей
      // странице, поэтому без data-lenis-prevent свайп внутри
      // трека просто не доходит до браузера.
      track.setAttribute('data-lenis-prevent', '');
      track.style.overflowX = 'auto';
      track.style.webkitOverflowScrolling = 'touch';
      track.style.scrollSnapType = 'x mandatory';
      // touch-action оставляем 'auto' (по умолчанию) — браузер сам
      // решает по направлению первого движения пальца, куда вести
      // жест: горизонталь остаётся в треке (overflow-x: auto),
      // вертикаль chaining'ом уходит на body/Lenis. Явный pan-x тут
      // был ошибкой — он, наоборот, ЗАПРЕЩАЕТ вертикальную панораму
      // на этом элементе и не даёт скроллу "отпуститься" наверх.
      // contain по горизонтали — чтобы "резиновый" отскок на границах
      // трека не утаскивал за собой скролл всей страницы
      track.style.overscrollBehaviorX = 'contain';
      track.style.overscrollBehaviorY = 'auto';
      items.forEach((item) => {
        item.style.scrollSnapAlign = 'center';
      });
      gsap.set(track, { x: 0, clearProps: 'transform' });

      // тёмное состояние включаем/выключаем по обычному
      // вертикальному прохождению блока, без пина
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
        track.removeAttribute('data-lenis-prevent');
        track.style.overflowX = '';
        track.style.webkitOverflowScrolling = '';
        track.style.scrollSnapType = '';
        track.style.overscrollBehaviorX = '';
        track.style.overscrollBehaviorY = '';
        items.forEach((item) => {
          item.style.scrollSnapAlign = '';
        });
      };
    }
  }
);

/* ---------------------------------------------------------
   4. Пересчёт ScrollTrigger при загрузке/ресайзе.
   matchMedia сам обрабатывает переход между брейкпоинтами,
   но refresh() всё равно нужен на случай догрузки
   картинок/видео, меняющих scrollWidth трека.
--------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  ScrollTrigger.refresh();
});

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