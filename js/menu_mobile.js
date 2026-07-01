
document.addEventListener("DOMContentLoaded", () => {


  function lockScroll() {
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.dataset.scrollY = scrollY;
    document.body.classList.add("no-scroll");
}

function unlockScroll() {
    const scrollY = document.body.dataset.scrollY || 0;
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo(0, parseInt(scrollY));
}


    // начальное состояние меню
    gsap.set(".nav-overplay", {
        scaleY: 0,

    });


    gsap.set(".nav-overplay a", {
        y: "100%",
        opacity: 0,
        display: "block"
    });


    const menuTl = gsap.timeline({
        paused: true
    });

    menuTl


    .to(".nav-overplay-absolute", {
        display: "flex"
    })
    .to(".nav-overplay", {
        display: "block",
        scaleY: 1,
        duration: 0.3,
        ease: "power4.out"
    })



    .to(".nav-overplay", {
        width: "100vw", 
        duration: 0.3,
        ease: "power4.out"
    })

    .to(".nav-overplay", {
        delay: 0.1,
        height: "100vh", 
        duration: 0.3,
        ease: "power4.out"
    })




    .to(".nav-overplay a", {
        y: "0%", 
        opacity: 1,
        duration: 0.5,
        ease: "power4.out",
        stagger: 0.2,
    })



.to(".line-1", {
    y: 6,
    rotate: 45,
    transformOrigin: "center center",
    duration: 0.3
}, 0)

.to(".line-2", {
    width: "100%",
    y: 0,
    rotate: -45,
    transformOrigin: "center center",
    duration: 0.3
}, 0)

    menuTl.eventCallback("onReverseComplete", () => {
        gsap.set(".nav-overplay", {
            display: "none"
        });
        unlockScroll();
    });

    let isOpen = false;
    document.querySelector(".menu-toggle").addEventListener("click", (e) => {
        e.preventDefault();
        if (isOpen) {
            menuTl.reverse();
        } else {
            lockScroll();
            menuTl.play();
        }
        isOpen = !isOpen;
    });
});
