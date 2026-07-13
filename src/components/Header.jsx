import React, { useEffect } from "react";
import dots from "/dots.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function Header() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".jumpUp", {
      scrollTrigger: {
        trigger: ".jumpUp",
        start: "top 250px",
        end: "top 50px",
        scrub: 2,
      },
      y: -500,
      opacity: 0,
      ease: "none",
      duration: 0.1,
    });
    gsap.to(".scrollLeft", {
      scrollTrigger: {
        trigger: ".scrollLeft",
        start: "top 150px",
        end: "top 50px",
        scrub: 2,
      },
      x: -500,
      opacity: 0,
      ease: "none",
      duration: 0.1,
    });
    gsap.to(".scrollRight", {
      scrollTrigger: {
        trigger: ".scrollRight",
        start: "top 300px",
        end: "top 50px",
        scrub: 2,
      },
      x: 500,
      opacity: 0,
      ease: "none",
      duration: 0.1,
    });
  }, []);

  return (
    <div className="relative h-screen">
      {dots && (
        <img
          className="pointer-events-none absolute opacity-5 top-0 left-1/2 -translate-x-1/2 w-screen max-w-screen-lg"
          src={dots}
          alt=""
        />
      )}

      <div className="mx-auto -translate-y-32 max-w-7xl flex justify-center items-center h-full">
        <div className="absolute rounded-full w-60 h-60 opacity-70 bg-gradient-to-tr blur-3xl from-purple-500/10 to-purple-500 animate-pulse left-1/2 -translate-x-1/2"></div>

        <div className="relative flex justify-center items-center overflow-hidden px-0 pt-16 sm:rounded-3xl md:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24">
          <div className="mx-auto max-w-2xl text-center lg:flex-auto lg:py-12 ">
            <h2 className="scrollLeft font-bold tracking-tight text-white">
              <p className="  text-3xl md:text-5xl poppins-bold">
                <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent">
                  Craft
                </span>{" "}
                software that thrives,
                <br />
                <span className="bg-gradient-to-r from-orange-500 from-20% to-rose-600 to-65% bg-clip-text text-transparent">
                  Elevate{" "}
                </span>
                Your Business with Code.
              </p>
            </h2>
            <p className="scrollRight mt-6 text-sm md:text-lg leading-8 text-gray-300">
              Innovating today for a smarter tomorrow. Join us on the journey to
              technological excellence.
            </p>
            <div className="jumpUp mt-10 flex items-center justify-center gap-x-6">
              <a
                className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-full text-sm px-3.5 py-2 font-medium text-gray-100 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white relative"
                href="#service"
              >
                Get Started
              </a>
              <a
                href="#chooseUs"
                className="text-sm font-semibold leading-6 text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute right-[28%] top-0 hidden h-[150px] w-[200px] rotate-12 rounded-3xl bg-gradient-to-l from-blue-600 to-sky-400 opacity-20 blur-3xl filter dark:block dark:opacity-30 lg:top-44 lg:-right-20 lg:h-72 lg:w-[350px] xl:h-80 xl:w-[500px]"></div>
      </div>
    </div>
  );
}
// ami emon dure dure effect korte chai

export default Header;
