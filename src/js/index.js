import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { copyText } from "./utils/index";
import { mapEach } from "./utils/dom";
import Time from "./components/Time";

const toContactButtons = document.querySelectorAll(".contact-scroll");
const footer = document.getElementById("js-footer");
const scrollEl = document.querySelector("[data-scroll-container]");
const emailButton = document.querySelector("button.email");
const toCopyText = document.querySelector(".to-copy span");
const time = new Time();

gsap.registerPlugin(ScrollTrigger);

// Smooth scroll with momentum/inertia effect
class SmoothScroll {
  constructor() {
    this.bindMethods();
    
    this.data = {
      current: 0,
      target: 0,
      ease: 0.07,
    };
    
    this.dom = {
      scrollable: document.querySelector("[data-scroll-container]"),
    };
    
    this.rAF = null;
    this.lastHeight = 0;
    this.init();
  }
  
  bindMethods() {
    this.run = this.run.bind(this);
    this.resize = this.resize.bind(this);
    this.checkHeight = this.checkHeight.bind(this);
  }
  
  setHeight() {
    // Get actual scrollable height
    const height = this.dom.scrollable.getBoundingClientRect().height;
    // Only update if height changed significantly (more than 10px)
    if (Math.abs(height - this.lastHeight) > 10) {
      this.lastHeight = height;
      document.body.style.height = `${height}px`;
      ScrollTrigger.refresh();
    }
  }
  
  checkHeight() {
    // Continuously check height for dynamic content
    this.setHeight();
  }
  
  resize() {
    this.setHeight();
  }
  
  run() {
    this.data.target = window.scrollY;
    this.data.current += (this.data.target - this.data.current) * this.data.ease;
    this.data.current = Math.round(this.data.current * 100) / 100;
    
    // Clamp current to prevent over-scrolling
    const maxScroll = Math.max(0, this.lastHeight - window.innerHeight);
    this.data.current = Math.max(0, Math.min(this.data.current, maxScroll));
    
    this.dom.scrollable.style.transform = `translate3d(0, ${-this.data.current}px, 0)`;
    
    this.rAF = requestAnimationFrame(this.run);
  }
  
  init() {
    this.dom.scrollable.style.position = "fixed";
    this.dom.scrollable.style.top = "0";
    this.dom.scrollable.style.left = "0";
    this.dom.scrollable.style.width = "100%";
    this.dom.scrollable.style.willChange = "transform";
    
    // Initial height calculation
    this.setHeight();
    
    // Set height after images and fonts load
    window.addEventListener("load", () => {
      this.setHeight();
      // Recalculate multiple times to catch late-loading content
      setTimeout(() => this.setHeight(), 100);
      setTimeout(() => this.setHeight(), 500);
      setTimeout(() => this.setHeight(), 1000);
      setTimeout(() => this.setHeight(), 2000);
    });
    
    // Use ResizeObserver to detect content size changes
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.setHeight();
      });
      resizeObserver.observe(this.dom.scrollable);
    }
    
    // Also check periodically for the first few seconds
    let checkCount = 0;
    const heightChecker = setInterval(() => {
      this.checkHeight();
      checkCount++;
      if (checkCount > 10) clearInterval(heightChecker);
    }, 500);
    
    window.addEventListener("resize", this.resize);
    this.run();
  }
}

// Initialize smooth scroll after DOM is ready
let smoothScrollInstance = null;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    smoothScrollInstance = new SmoothScroll();
  });
} else {
  smoothScrollInstance = new SmoothScroll();
}

export default class Home {
  constructor() {
    this.init();
    this.heroTextAnimation();
    this.homeIntro();
    this.homeAnimations();
    this.homeActions();
  }

  init() {
    // Show the page
    gsap.to(scrollEl, {
      autoAlpha: 1,
      duration: 0.5
    });
  }

  homeActions() {
    mapEach(toContactButtons, (button) => {
      button.onclick = () => {
        footer.scrollIntoView({ behavior: 'smooth' });
      };
    });

    emailButton.addEventListener("click", (e) => {
      copyText(e);
      toCopyText.textContent = "copied";

      setTimeout(() => {
        toCopyText.textContent = "Click To Copy";
      }, 2000);
    });
  }

  homeIntro() {
    const tl = gsap.timeline();

    tl.from(".home__nav", {
      duration: 0.5,
      delay: 0.3,
      opacity: 0,
      yPercent: -100,
      ease: "power4.out",
    })
      .from(".hero__title [title-overflow]", {
        duration: 0.7,
        yPercent: 100,
        stagger: {
          amount: 0.2,
        },
        ease: "power4.out",
      })
      .from(
        ".hero__title .bottom__right",
        {
          duration: 1,
          yPercent: 100,
          opacity: 0,
          ease: "power4.out",
        },
        "<20%"
      )
      .set(".hero__title .overflow", { overflow: "unset" })
      .from(
        ".hero__title .mobile",
        {
          duration: 0.7,
          yPercent: 100,
          stagger: {
            amount: 0.2,
          },
          ease: "power4.out",
        },
        "-=1.4"
      );
  }

  homeAnimations() {
    gsap.to(".home__projects__line", { autoAlpha: 1 });
    gsap.utils.toArray(".home__projects__line").forEach((el) => {
      const line = el.querySelector("span");
      gsap.from(line, {
        duration: 1.5,
        scrollTrigger: {
          trigger: el,
        },
        scaleX: 0,
      });
    });

    // Project titles scroll animation - alternating directions
    gsap.utils.toArray(".home__projects__project").forEach((el, index) => {
      const title = el.querySelector(".home__projects__project__title");
      const isEven = index % 2 === 0;
      
      gsap.to(title, {
        scrollTrigger: {
          trigger: el,
          scrub: 1.5,
          start: "top center",
          end: "bottom top",
        },
        x: isEven ? 150 : -150,
        ease: "none",
      });
    });

    gsap.utils.toArray("[data-fade-in]").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
        },
        duration: 1.5,
        yPercent: 100,
        opacity: 0,
        ease: "power4.out",
      });
    });

    if (window.innerWidth <= 768) {
      gsap.utils.toArray(".home__projects__project").forEach((el) => {
        const text = el.querySelector(".title__main");
        const link = el.querySelector(".project__link");
        gsap.from([text, link], {
          scrollTrigger: {
            trigger: el,
          },
          duration: 1.5,
          yPercent: 100,
          stagger: {
            amount: 0.2,
          },
          ease: "power4.out",
        });
      });

      const awardsTl = gsap.timeline({
        defaults: {
          ease: "power1.out",
        },
        scrollTrigger: {
          trigger: ".home__awards",
        },
      });
      awardsTl.from(".awards__title span", {
        duration: 1,
        opacity: 0,
        yPercent: 100,
        stagger: {
          amount: 0.2,
        },
      });
    }
  }

  heroTextAnimation() {
    const scrollTriggerConfig = {
      trigger: ".hero__title",
      scrub: 0.5, // Lower scrub for tighter sync
      start: "top top",
      end: "bottom top",
    };

    // Create a timeline for perfectly synced animations
    const heroTl = gsap.timeline({
      scrollTrigger: scrollTriggerConfig,
    });

    // All animations happen together in the timeline
    heroTl.to(".hero__title__left", {
      x: -150,
      ease: "none",
    }, 0)
    .to(".hero__title__dash.desktop", {
      scaleX: 3,
      ease: "none",
    }, 0)
    .to(".hero__title__right", {
      x: 150,
      ease: "none",
    }, 0);
  }
}

new Home();
