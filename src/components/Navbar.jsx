"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { HiMiniXMark } from "react-icons/hi2";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Services",
      href: "/service",
    },
    {
      name: "Projects",
      href: "/project",
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="select-none w-full px-6 py-2.5 z-[100] fixed top-0 left-0 right-0 max-lg:backdrop-blur-2xl max-lg:border-b-[0.1px] border-b-rose-100/20">
      <div className="max-w-7xl mx-auto flex text-xl items-center justify-between py-2">
        <Link href="/" className="flex">
          <div className="flex">
            <Image className="object-scale-down" src="/logo2.png" alt="logo" width={40} height={40} priority />
            <span className="font-bold pl-1.5 mt-3.5">DevGenit</span>
          </div>
        </Link>

        <nav className="hidden space-x-8 rounded-full bg-slate-700/30 p-1.5 border border-yeah-text/30 lg:flex items-center backdrop-blur">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-5 py-1 text-sm uppercase font-thin transition-colors z-20 hover:bg-slate-50 hover:text-slate-800 rounded-full ${
                pathname === item.href
                  ? "bg-slate-50 text-slate-800"
                  : "text-slate-100"
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={handleTabClick}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="contact hidden lg:block rounded-full bg-rose-500 text-rose-100 px-5 py-2.5 text-sm font-medium e shadow-sm hover:bg-rose-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          onClick={() => {
            router.push("/contact");
          }}
        >
          Contact
        </button>
        <div className="lg:hidden">
          <CiMenuFries
            onClick={toggleMenu}
            className="h-6 w-6 cursor-pointer e"
          />
        </div>
        {isMenuOpen && (
          <div className="fixed inset-x-0 top-0 left-0 min-h-screen bg-black/20 z-50 transform p-2 lg:hidden backdrop-blur-md transition-all">
            <div className="divide-y-2 divide-gray-500 rounded-lg bg-yeah-secondary shadow-md shadow-yeah-secondary/20 ring-1 ring-yeah-secondary ring-opacity-50">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-end">
                    <div className="flex items-end">
                      <Image className="object-bottom scale-75" src="/logo2.png" alt="logo" width={50} height={50} />
                      <span className="font-bold text-white">DevGenit</span>
                    </div>
                  </Link>
                  <div className="-mr-2">
                    <button
                      type="button"
                      onClick={toggleMenu}
                      className="inline-flex items-center justify-center rounded-md p-2 text-yeah-text hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      <HiMiniXMark className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-4">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex items-center rounded-md p-3 text-sm font-semibold transition hover:bg-yeah-primary/30 text-white  "
                        onClick={() => {
                          handleTabClick();
                          toggleMenu();
                        }}
                      >
                        <span className="ml-3 text-base font-medium ">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
                <button
                  className="contact rounded-full w-full bg-rose-500 text-rose-100 px-5 py-2 mt-5 text-sm font-semibold e shadow-sm hover:bg-rose-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  type="button"
                  onClick={() => {
                    router.push("/contact");
                  }}
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
