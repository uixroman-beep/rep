gsap.registerPlugin(ScrollTrigger);



ScrollTrigger.create({
  trigger: ".parameter_blocks",
  start: "top 40%",
  end: "bottom top",
  pin: ".parameter_blocks",
  pinSpacing: false,
  invalidateOnRefresh: true,

});


gsap.fromTo(".parameter_block",
  {
    filter: "blur(5px)",




  },
  {
      filter: "blur(0px)",


    scrollTrigger: {
      trigger: ".parameter_block",
  start: "top bottom",
  end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


gsap.fromTo(".parameter_block_info",
  {

clipPath: "inset(0% 0% 100% 0%)",




  },
  {
clipPath: "inset(0% 0% 0% 0%)",


    scrollTrigger: {
      trigger: ".parameter_block_info",
  start: "top 40%",
  end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);



/*gsap.fromTo(".parameter_block",
  {
    filter: "blur(5px)"


  },
  {
      filter: "blur(0px)",


    scrollTrigger: {
      trigger: ".parameter_block",
      start: "top top",
  end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);*/


gsap.utils.toArray(".inner_page_text").forEach((el) => {
  gsap.fromTo(el,
    { filter: "blur(5px)", clipPath: "inset(0% 0% 100% 0%)", scale: 0.95,
    y:50, },
    {
      filter: "blur(0px)", scale: 1,
      y:0,
      clipPath: "inset(0% 0% 0% 0%)",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom center",
        scrub: 0.2,
        invalidateOnRefresh: true,
      }
    }
  );
});

gsap.utils.toArray(".inner_page_img").forEach((el) => {
  gsap.fromTo(el,
    { scale: 1.5,     clipPath: "inset(50% 0% 50% 0%)",},
    {
      scale: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom center",
        scrub: 0.2,
        invalidateOnRefresh: true,
      }
    }
  );
});


gsap.utils.toArray(".video_inner_page").forEach((el) => {
  gsap.fromTo(el,
    { scale: 1.5},
    {
      scale: 1,

      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom center",
        scrub: 0.2,
        invalidateOnRefresh: true,
      }
    }
  );
});