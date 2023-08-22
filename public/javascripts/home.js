var tl = gsap.timeline({
    scrollTrigger:{
        trigger:"#home",
        pin:true,
        scrub:5,
        start:"top top",
        scroller:"#main"
        }
    })

    tl
    .to(".text",{
    left:"-70%",
    duration:4
    },"a")
    .to(".line",{
    duration:4,
    left:"60%"
    },"a")