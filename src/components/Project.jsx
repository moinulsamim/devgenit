"use client";

import { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

const projects = [
  { src: "/projects/chem/hero-laptop.png", alt: "Chem laptop view" },
  { src: "/projects/chem/res.png", alt: "Chem responsive view" },
  { src: "/projects/gwl/restrans.png", alt: "GWL responsive view" },
  { src: "/projects/gwl/laptop.png", alt: "GWL laptop view" },
];
function Project() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

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
    <>
      <div className="min-h-[80vh] flex justify-center items-center flex-col text-center relative z-10 max-lg:space-y-6 mb-20">
        <h1 className="font-bold text-3xl lg:text-5xl xl:text-6xl bg-clip-text bg-gradient-to-r from-orange-400 via-rose-700 via-40% to-80% to-blue-600 text-transparent md:p-20 scrollLeft leading-8 tracking-tight">
          Turning Visions Into <br /> Reality
        </h1>
        <p className="scrollRight hero-text text-xs md:text-lg">
          Each project reflects our passion for innovation and excellence.
          <br />
          Explore our work and see creativity come to life!
        </p>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 w-52 h-32 bg-gradient-to-b from-red-700 to-sky-700 opacity-80 rounded-full blur-3xl anime-hue"></div>
      </div>
      <div className="projects-list">
        <ProjectCard project={projects} />
      </div>
    </>
  );
}

const ProjectCard = ({ project }) => {
  useEffect(() => {
    const img = document.querySelectorAll(".card-img");
    let imgT = gsap.utils.toArray(img);
    gsap.registerPlugin(ScrollTrigger);

    imgT.forEach((box, bid) => {
      gsap.fromTo(
        box,
        {
          opacity: 0,
          x: bid % 2 == 0 ? -500 : 500,
          y:200,
          ease: "none",
          scrollTrigger: {
            trigger: box,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 2,
          },
        },
        {
          opacity: 1,
          x:0,
          y:0,
          scrollTrigger: {
            trigger: box,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 2,
          },
          duration: 1,
        }
      );
    });
  }, []);
  return (
    <div className="project-card">
      <div className="project-images grid grid-cols-1 lg:grid-cols-2 gap-5">
        {project.map((image, index) => (
          <Image
            className="card-img rounded-md w-full aspect-auto object-fill h-fit mx-auto bg-gradient-to-b from-transparent via-cyan-800/70"
            key={`laptop${index}`}
            src={image.src}
            alt={image.alt}
            width={800}
            height={600}
          />
        ))}
      </div>
      <div className="h-[10vh]"></div>
    </div>
  );
};

export default Project;
