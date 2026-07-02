 



let lenis;
let shouldStop = document.body.classList.contains("no-scroll");

document.addEventListener("DOMContentLoaded", () => {
 lenis = new Lenis({
  smooth: true,
  lerp: 0.05,
 });
 window.lenis = lenis;



 if (shouldStop) {
  lenis.stop();
 } else {
  lenis.start();
 }

 lenis.on("scroll", ScrollTrigger.update);
 gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
 });
 gsap.ticker.lagSmoothing(0);
 ScrollTrigger.refresh();


});



const observer = new MutationObserver((mutations) => {
 mutations.forEach((mutation) => {
  if (mutation.attributeName === "class") {
shouldStop = document.body.classList.contains("no-scroll");
if (lenis) {
 shouldStop ? lenis.stop() : lenis.start();
}
  }
 });
});

observer.observe(document.body, {
 attributes: true,
 attributeFilter: ["class"],
});