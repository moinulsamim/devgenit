import React, { useEffect } from "react";
import Title from "./Title";
import webapp from "/service/webapp.png";
import mobileapp from "/service/mobile.png";
import design from "/service/design.png";
import uiux from "/service/uiux.svg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
// no pob
const service = [
  {
    name: "Web Application",

    det: "Our web application at DevGenit combines cutting-edge technology with seamless usability. From intuitive interfaces to lightning-fast performance, we're here to elevate your online journey.",
    img: webapp,
    color: "to-blue-500",
    shadow: "shadow-blue-500/30",
  },
  {
    name: "Mobile Application",
    det: "Empower your business with our mobile app development solutions. We create sleek, functional apps that seamlessly integrate into users' lives, delivering convenience and value on the go.",
    img: mobileapp,
    color: "to-pink-500",
    shadow: "shadow-pink-500/30",
  },
  {
    name: "Graphic Design",
    det: "Unlock the power of visual storytelling with our graphic design services. From captivating logos to stunning brand identities, we bring your vision to life with creativity and precision.",
    img: design,
    color: "to-green-500",
    shadow: "shadow-green-500/30",
  },
  {
    name: "UX/UI",
    det: "Elevate user experiences with our UX/UI design expertise. We craft intuitive interfaces that engage and delight users, driving meaningful interactions and conversions.",
    color: "to-yellow-500",
    shadow: "shadow-yellow-500/30",
    img: uiux,
  },
];
// root component ta kotto soto dekhso :)
function NewService() {
  useEffect(() => {
    const gsapcard = document.querySelectorAll(".gsap-card");
    const img = document.querySelectorAll(".img");
    let target = gsap.utils.toArray(gsapcard);
    let imgT = gsap.utils.toArray(img);
    gsap.registerPlugin(ScrollTrigger);
    target.forEach((g, id) => {
      gsap.fromTo(
        g,
        {
          x: id % 2 != 0 ? -200 : 200,
          opacity: 0,
          ease: "none",
        },
        {
          scrollTrigger: {
            trigger: g,
            start: "top center",
            end: "top center",
            scrub: 2,
          },
          x: 0,
          origin: "",
          opacity: 1,
          ease: "none",
          duration: 2,
          pointerEvents: "auto",
        }
      );
    });
    imgT.forEach((g, id) => {
      gsap.fromTo(
        g,
        {
          x: id % 2 != 0 ? 200 : -200,
          y: 150,
          opacity: 0,
          ease: "none",
          rotate: -45,

          transformOrigin: "100% 100%",
        },
        {
          scrollTrigger: {
            trigger: g,
            start: "top 1000px",
            end: "top 700px",
            scrub: 1,
          },
          x: 0,
          y: 0,
          opacity: 1,
          ease: "none",
          duration: 0.5,
          rotate: 0,
          pointerEvents: "auto",
        }
      );
    });
  }, []);
  return (
    <div className="scroll-my-14" id="service">
      <Title text="Services we provide" color="bg-purple-500" />
      <div className="max-w-7xl grid lg:grid-cols-2 gap-5 mx-auto">
        {service.map((ele, id) => (
          <ServiceCard
            key={id}
            id={id}
            message={ele.det}
            title={ele.name}
            imgSrc={ele.img}
            color={ele.color}
            shadow={ele.shadow}
          />
        ))}
      </div>
    </div>
  );
}

// ekhon shuno, ei je card ta dekhso, emon 4ta hbe na 5ta?

// reality....
const ServiceCard = ({ title, message, imgSrc, color, shadow }) => {
  return (
    <div className="w-full my-14 md:my-4 relative text-wrap gsap-card">
      <div
        className={`relative px-10 overflow-hidden bg-gray-900 shadow-2xl ${shadow} pt-10 rounded-3xl lg:gap-x-20`}
      >
        {/* effect */}
        <div
          className={`absolute rounded-full w-96 h-96 scale-75 md:scale-125 -top-1/2 lg:-top-1/3 opacity-70 bg-gradient-to-tr blur-3xl from-purple-500/10 ${color} animate-pulse -left-20 `}
        ></div>
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:py-14 lg:text-left">
          <h2 className="text-3xl text-left font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="my-6 text-sm sm:text-lg leading-8 text-gray-300 text-left">
            {message}
          </p>
        </div>
        {/* image */}
        <div className="relative scale-75 h-48 lg:h-80 -mt-10">
 
          <img
            className="img lg:absolute translate-x-1/2 lg:translate-x-0 left-0 -top-20 lg:w-[57rem] lg:max-w-none"
            src={imgSrc}
            alt="App screenshot"
            width={1080}
            height={1080}
          />
        </div>
      </div>
    </div>
  );
};
export default NewService;
