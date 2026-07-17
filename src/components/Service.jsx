import React, { useEffect } from "react";
import Title from "./Title";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import {
  Palette,
  LayoutGrid,
  Globe,
  Smartphone,
  Server,
  Cloud,
  ShoppingCart,
  Layers,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    name: "Graphic design",
    det: "Brand identity, logo systems, and marketing visuals designed for consistency across every touchpoint.",
    icon: Palette,
    tags: ["Figma", "Illustrator"],
  },
  {
    name: "UX / UI design",
    det: "Wireframes to high-fidelity prototypes, built around real user flows and tested before a line of code is written.",
    icon: LayoutGrid,
    tags: ["Figma", "Prototyping"],
  },
  {
    name: "Web application",
    det: "Responsive, fast-loading web apps built on modern frameworks with clean, maintainable code.",
    icon: Globe,
    tags: ["React", "Next.js"],
  },
  {
    name: "Mobile application",
    det: "Native-feel iOS and Android apps, from a single codebase or fully native depending on what the product needs.",
    icon: Smartphone,
    tags: ["Flutter", "React native"],
  },
  {
    name: "Backend and API",
    det: "Secure, scalable APIs and server architecture built to handle real production traffic, not just demos.",
    icon: Server,
    tags: ["Node.js", "PostgreSQL"],
  },
  {
    name: "Cloud and DevOps",
    det: "CI/CD pipelines, containerized deployments, and infrastructure that scales without surprise downtime.",
    icon: Cloud,
    tags: ["AWS", "Docker"],
  },
  {
    name: "E-commerce",
    det: "Storefronts, checkout flows, and payment integrations built to convert, not just display products.",
    icon: ShoppingCart,
    tags: ["Shopify", "Stripe"],
  },
  {
    name: "Custom software / SaaS",
    det: "From MVP to multi-tenant platform, built around your business logic instead of a generic template.",
    icon: Layers,
    tags: ["Multi-tenant", "MVP"],
  },
  {
    name: "Maintenance and support",
    det: "Bug fixes, updates, and monitoring after launch, so the product you shipped keeps working.",
    icon: ShieldCheck,
    tags: ["SLA-based", "Monitoring"],
  },
];

function NewService() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray(".service-card");

    gsap.fromTo(
      cards,
      { y: 60, opacity: 0 },
      {
        scrollTrigger: {
          trigger: "#service",
          start: "top 80%",
          end: "top 40%",
          scrub: 1,
        },
        y: 0,
        opacity: 1,
        stagger: 0.08,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      ".service-header",
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: "#service",
          start: "top 85%",
          end: "top 60%",
          scrub: 1,
        },
        y: 0,
        opacity: 1,
        ease: "power2.out",
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/10 ring-1 ring-blue-200/20 rounded-2xl" id="service">
      {/* Header */}
      <div className="service-header max-w-7xl mx-auto text-center mb-14">
        <p className="text-blue-500 text-sm font-semibold tracking-wide mb-3">
          What we do
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Services built to ship real products
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
          From first pixel to production infrastructure, one team handles the full
          stack.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service, idx) => (
          <ServiceCard
            key={idx}
            title={service.name}
            message={service.det}
            Icon={service.icon}
            tags={service.tags}
          />
        ))}
      </div>
    </div>
  );
}

const ServiceCard = ({ title, message, Icon, tags }) => {
  return (
    <div className="service-card group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-7 hover:border-[#3a3a3a] transition-colors duration-300">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-blue-400 mb-5 group-hover:text-blue-300 transition-colors duration-300">
        <Icon size={20} strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="text-white text-lg font-bold mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        {message}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 text-xs font-medium text-gray-300 bg-[#222222] border border-[#2a2a2a] rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewService;