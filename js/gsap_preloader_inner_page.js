
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});


document.addEventListener("DOMContentLoaded", () => {




gsap.set(
  ".header_nav .overflow-hidden > div, .contact_and_lang .overflow-hidden > div, roof_studio .overflow-hidden > div",
  {
    x: "-100%"
  }
);


const title_inner_page = gsap.timeline();


title_inner_page.to('.all_content', {
   opacity: 1,
  duration: 0.000001,
  ease: "power4.out"
})


.to(".header_nav .overflow-hidden > div, .contact_and_lang .overflow-hidden > div", {
 x: "0",
  duration: 1,
  stagger: 0.1,
  ease: "power4.out"
})










.from('.title-inner-page', {
  opacity: 0,

  duration: 2,
  filter: "blur(5px)",

  ease: "power4.out"
},"-=0.4")


.from('.content_inner_page', {

  opacity: 0,
  duration: 2,
  filter: "blur(50px)",
  ease: "power4.out"
},"-=1.5")

});