gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   1. Lenis — плавный скролл.
   Если Lenis уже создан где-то в custom.js и положен в
   window.lenis — переиспользуем его. Если нет — создаём здесь.
--------------------------------------------------------- */
window.lenis = window.lenis || new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
});

// синхронизация Lenis с ScrollTrigger
window.lenis.on('scroll', ScrollTrigger.update);

// прокручиваем Lenis через тикер GSAP — единый rAF-цикл, без рассинхрона
gsap.ticker.add((time) => {
  window.lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ---------------------------------------------------------
   2. Анимации входа/выхода из "тёмного" состояния карусели.
   Здесь же добавляйте анимацию других элементов —
   навигации, текста, лого и т.д. Всё, что должно
   меняться синхронно с фоном body, собираем в эти
   две функции, чтобы onEnter/onEnterBack и
   onLeave/onLeaveBack не дублировали код.
--------------------------------------------------------- */
function enterDarkState() {
  gsap.timeline()
    .to('body', { backgroundColor: '#000000', duration: 1, ease: 'power4.out' }, 0)

    .to('.project_block_carusel', { color: '#ffffff', borderColor: '#ffffff', duration: 1, ease: 'power4.out' }, 0)

    .to('.project_carousel_image', { scale: 0.8, duration: 1, ease: 'power4.out' }, 0)



}

function leaveDarkState() {
  gsap.timeline()
    .to('body', { backgroundColor: '#C6C6CE', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_block_carusel', { color: 'black', borderColor: 'black', duration: 1, ease: 'power4.out' }, 0)
    .to('.project_carousel_image', { scale: 1, duration: 1, ease: 'power4.out' }, 0)
}

/* ---------------------------------------------------------
   3. Горизонтальная карусель с пином.
   Каждый .project_block_carusel — 50% ширины track,
   на экране всегда видно 2 блока.
--------------------------------------------------------- */
function initProjectCarousel() {
  const wrapper = document.querySelector('.project_carousel_wrapper');
  const track = document.querySelector('.project_carousel_track');
  const items = gsap.utils.toArray('.project_block_carusel');

  if (!wrapper || !track || items.length === 0) {
    console.warn(
      'Карусель не инициализирована: не найден .project_carousel_wrapper или .project_carousel_track в DOM.'
    );
    return null;
  }

  // сколько пикселей всего нужно "проскроллить" трек влево,
  // чтобы дойти до последней пары блоков
  const getScrollDistance = () => track.scrollWidth - wrapper.offsetWidth;

  return ScrollTrigger.create({
    trigger: wrapper,
    // блок зафиксируется так, что сверху останется ~75% экрана, а снизу ~25%
    start: 'center center',
    end: () => `+=${getScrollDistance()}`,
    pin: true,            // фиксируем секцию, когда доскроллили до неё
    pinSpacing: true,     // оставляем место под пин, чтобы скролл не "прыгал"
    scrub: 1,             // плавная привязка анимации к скроллу (через Lenis)
    invalidateOnRefresh: true,
    animation: gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
    }),
    // цвет фона body и сопутствующие анимации:
    // тёмное состояние пока секция запинена, обратно — когда вышли из неё
    onEnter: enterDarkState,
    onEnterBack: enterDarkState,
    onLeave: leaveDarkState,
    onLeaveBack: leaveDarkState,
  });
}

let carouselTrigger;

window.addEventListener('DOMContentLoaded', () => {
  carouselTrigger = initProjectCarousel();
  ScrollTrigger.refresh();
});

// картинки/видео в блоках могут догрузиться позже и изменить
// scrollWidth трека — пересчитываем дистанцию после полной загрузки
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});