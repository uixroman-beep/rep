gsap.registerPlugin(ScrollTrigger);


gsap.fromTo("#bgVideo",
  {
    scale: "1.1",
    filter: "grayscale(0%)",


  },
  {
    scale: "1",
    filter: "grayscale(0%)",
    scrollTrigger: {
      trigger: ".header",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);



gsap.fromTo(".title_studio",
  {
    filter: "blur(5px)",
    clipPath: "inset(0% 0% 100% 0%)"
  },
  {
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",
    scrollTrigger: {
      trigger: ".title_studio",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);



ScrollTrigger.create({
  trigger: "#studio",
  start: "top top",
  end: "bottom 40%",
  pin: ".Est",
  pinSpacing: false,
  invalidateOnRefresh: true,

});

ScrollTrigger.create({
  trigger: "#studio",
  start: "top top",
  end: "bottom 60%",
  pin: ".we_are",
  pinSpacing: false,
  invalidateOnRefresh: true,

});


gsap.to(".we_are", {
  keyframes: {
    "0%":   { filter: "blur(100px)", scale: 5, opacity: 1 },
    "60%":  { filter: "blur(0px)",  scale: 1, opacity: 1 },
    "80%":  { filter: "blur(0px)",  scale: 1, opacity: 1 },
    "100%": { filter: "blur(0px)",  scale: 1, opacity: 0 },
  },
  scrollTrigger: {
    trigger: "#studio",
    start: "top bottom",
    end: "bottom 40%",
    scrub: 0.2,
    invalidateOnRefresh: true,
  }
});


gsap.fromTo(".Est",
  {  scale:1 },
  {
    keyframes: {

      "20%": {  opacity: 1  },
      "98%": {  opacity: 1  },


      "100%": {  opacity: 0  },
    },
    scrollTrigger: {
      trigger: "#studio",
      start: "top bottom",
      end: "bottom 40%",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


//Projects

gsap.fromTo(".projects_title",
  {
    filter: "blur(5px)",
    clipPath: "inset(0% 0% 100% 0%)"
  },
  {
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",
    scrollTrigger: {
      trigger: ".projects_title",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


gsap.utils.toArray(".projects_table").forEach((el) => {
  gsap.fromTo(el,
    { filter: "blur(5px)" },
    {
      filter: "blur(0px)",

      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "top 70%",
        scrub: 0.2,
        invalidateOnRefresh: true,

      }
    }
  );
});


//Clients

gsap.fromTo(".clients_title",
  {
    filter: "blur(5px)",
    clipPath: "inset(0% 0% 100% 0%)"
  },
  {
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",
    scrollTrigger: {
      trigger: ".clients_title",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


gsap.utils.toArray(".clients_block div").forEach((el) => {
  gsap.fromTo(el,
    { filter: "blur(5px)", clipPath: "inset(0% 0% 100% 0%)", scale: 0.98 },
    {
      filter: "blur(0px)",
      clipPath: "inset(0% 0% 0% 0%)",
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "top 70%",
        scrub: 0.2,
        invalidateOnRefresh: true,

      }
    }
  );
});



gsap.utils.toArray(".statistic_block").forEach((el) => {
  gsap.fromTo(el,
    { filter: "blur(5px)", clipPath: "inset(0% 0% 100% 0%)" },
    {
      filter: "blur(0px)",
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "top 70%",
        scrub: 0.2,
        invalidateOnRefresh: true,

      }
    }
  );
});


//Awards

gsap.fromTo(".awards_title",
  {
    filter: "blur(5px)",
    clipPath: "inset(0% 0% 100% 0%)"
  },
  {
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",
    scrollTrigger: {
      trigger: ".awards_title",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);




gsap.utils.toArray(".awards_block div").forEach((el) => {
  gsap.fromTo(el,
    { filter: "blur(5px)",
      opacity: 0,
clipPath: "inset(0% 0% 100% 0%)",
    },
    {
      filter: "blur(0px)",
      opacity: 1,
clipPath: "inset(0% 0% 0% 0%)",


      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "top 70%",
        scrub: 0.2,
        invalidateOnRefresh: true,

      }
    }
  );
});


//Contacts

gsap.fromTo(".contacts_title",
  {
    filter: "blur(5px)",
    clipPath: "inset(0% 0% 100% 0%)"
  },
  {
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",
    scrollTrigger: {
      trigger: ".contacts_title",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


gsap.utils.toArray(".contact_block div label").forEach((el) => {
  gsap.fromTo(el,
    {
    filter: "blur(5px)",
    clipPath: "inset(0% 0% 100% 0%)"
    },
    {
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",

      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "top 50%",
        scrub: 0.2,
        invalidateOnRefresh: true,

      }
    }
  );
});

gsap.fromTo(".contact_block  input",
  {
 opacity: 0,

  },

  {
 opacity: 1,

    scrollTrigger: {
      trigger: ".contact_block  input",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


gsap.fromTo(".send_bt",
  {
 opacity: 0,

     filter: "blur(5px)",

  },

  {
 opacity: 1,

     filter: "blur(0px)",

    scrollTrigger: {
      trigger: ".send_bt",
      start: "top bottom",
      end: "bottom 85%",
      scrub: 0.2,
      invalidateOnRefresh: true,


    }
  }
);


