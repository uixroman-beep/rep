
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});


document.addEventListener("DOMContentLoaded", () => {

const box = document.querySelector("#box");
const preloader_overplay = document.querySelector("#preloader_overplay");
const preloader_time_line = gsap.timeline();

// блокируем скролл сразу, пока идёт прелоадер
document.documentElement.classList.add("no-scroll");
document.body.classList.add("no-scroll");

gsap.set(".logo .overflow-hidden > div", {
  x: '100%',
});
gsap.set(
  ".header_nav .overflow-hidden > div, .contact_and_lang .overflow-hidden > div, roof_studio .overflow-hidden > div",
  {
    x: "-100%"
  }
);
gsap.set(box, {
  scaleX: 0,
  opacity: 0,
  rotation: -90
});

preloader_time_line.to(box, {
  opacity: 1,
  duration: 0.000001,
  ease: "power4.out"
})

.to(box, {
    delay: 0.2,
  scaleX: 1, 
  duration: 1,
  ease: "power4.out"
})


.to(box, {
  delay: 0.5,
  rotation: 0, 
  duration: 0.5,
  ease: "power4.out"
})

.to(box, {
  delay: 0.5,
  backgroundColor: "#C6C6CE",
  duration: 1,
  ease: "power4.out"
})

.to(preloader_overplay, {
  backgroundColor: "#000000",
  duration: 0.3,
  ease: "power4.out"
}, "<")

.to('.all_content', {
   opacity: 1,
  duration: 0.000001,
  ease: "power4.out"
})

.to(box, {
   width: "100%",
  duration: 0.5,
  ease: "power4.out"
})

.to(box, {
   height: "100%",
  duration: 1,
  ease: "power4.out"
})




.to(".logo .overflow-hidden > div", {
   x: "0",
  duration: 2,
  stagger: 0.1,
  ease: "power4.out"
},"-=0.4")

.to(".header_nav .overflow-hidden > div, .contact_and_lang .overflow-hidden > div", {
 x: "0",
  duration: 1,
  stagger: 0.1,
  ease: "power4.out"
}, "-=1.8")


.to(".video_block", {
  opacity: "1",
  duration: 1,
  ease: "power4.out"
}, "-=2")


.to("#studio", {
  opacity: "1",
  duration: 1,
  ease: "power4.out"
}, "-=1")



.to("#preloader_overplay", {
  opacity: 0,           
  duration: 0.6,
  ease: "power2.out",
  onComplete: () => {
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    gsap.set("#preloader_overplay", { visibility: "hidden" });
  }
});

});