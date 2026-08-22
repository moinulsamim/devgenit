"use client";

import React, { useEffect } from "react";
import Title from "./Title";
import { FaHtml5, FaFigma, FaCss3Alt, FaNodeJs, FaReact } from "react-icons/fa";
import {
  BiLogoJavascript,
  BiLogoTailwindCss,
} from "react-icons/bi";

import { RiNextjsFill } from "react-icons/ri";
import {
  SiVite,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiFlutter,
  SiMysql,
} from "react-icons/si";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function Technology() {
  const technology = [
    { title: "HTML", icon: <FaHtml5 /> },
    { title: "CSS", icon: <FaCss3Alt /> },
    { title: "JavaScript", icon: <BiLogoJavascript /> },
    { title: "NodeJs", icon: <FaNodeJs /> },
    { title: "NextJS", icon: <RiNextjsFill /> },
    { title: "ViteJS", icon: <SiVite /> },
    { title: "ReactJS", icon: <FaReact /> },
    { title: "TailwindCSS", icon: <BiLogoTailwindCss /> },
    { title: "Flutter", icon: <SiFlutter /> },
    { title: "SQL", icon: <SiMysql /> },
    { title: "Figma", icon: <FaFigma /> },
    { title: "Adobe AI", icon: <SiAdobeillustrator /> },
    { title: "Adobe PS", icon: <SiAdobephotoshop /> },
  ];

  useEffect(() => {
    const tech = document.querySelectorAll(".techno");
    let target = gsap.utils.toArray(tech);
    gsap.registerPlugin(ScrollTrigger);
    target.forEach((g, id) => {
      gsap.fromTo(
        g,
        {
          y: id % 2 != 0 ? -100 : 50,
          opacity: 0,
          ease: "none",
          pointerEvents: "none",
        },
        {
          scrollTrigger: {
            trigger: g,
            start: "top 1000px",
            end: "top center",
            scrub: 2,
          },

          y: 0,
          opacity: 1,
          ease: "none",
          duration: 1,
          pointerEvents: "auto",
        }
      );
    });
  }, []);

  return (
    // yahoo
    <div className="my-40 py-10" id="techno">
      <Title text="Technology" color="bg-orange-400" />
      <div className="overflow-hidden relative m-auto">
        <div className="flex flex-wrap max-w-screen-md gap-10 items-center justify-center w-full mx-auto rounded-full py-5">
          {technology.map((tech, id) => {
            return (
              <div
              key={`tech_${id}`}
                className="techno grid justify-center items-center text-center w-auto p-3 mx-5 shadow-lg shadow-blue-400/70 rounded-full text-slate-200 "
                style={{
                  filter: `hue-rotate(${5 * id}deg)`,
                }}
              >
                <span className={`text-5xl  `}>{tech.icon}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// eivabe protteker theme onujai color hbe. ekhon dewar dorkar nai. ami hover er sob colior pore dibo. shadhow random dewar dorkar nai. mul color er sathe match kore na
export default Technology;
