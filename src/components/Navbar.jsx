import { useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { HiMiniXMark } from "react-icons/hi2";
import logo2 from "/logo2.png";

const route = window.location;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([
    {
      name: "Home",
      href: "/",
      active: true,
    },
    {
      name: "Services",
      href: "/service",
      active: false,
    },
    {
      name: "Projects",
      href: "/project",
      active: false,
    },
    // {
    //   name: "Meet us",
    //   href: "/meet-the-team",
    //   active: false,
    // },
  ]);
  const [selectedTab, setSelectedTab] = useState(
    localStorage.getItem("curTab") || "Home"
  );
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleTabClick = (name) => {
    localStorage.setItem("curTab", name);
    setSelectedTab(name);
    setIsMenuOpen(false);
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.name === name
          ? { ...item, active: true }
          : { ...item, active: false }
      )
    );
  };
  return (
    <div className="select-none w-full px-6 py-2.5 z-[100] fixed top-0 left-0 right-0 max-lg:backdrop-blur-2xl max-lg:border-b-[0.1px] border-b-rose-100/20">
      <div className="max-w-7xl mx-auto flex text-xl items-center justify-between py-2">
        <a href="/">
          <div className="flex">
            <img
              className="object-scale-down"
              src={logo2}
              alt="logo"
              width={40}
            />
            <span className="font-bold pl-1.5 mt-3.5">DevGenit</span>
          </div>
        </a>

        <nav className="hidden space-x-8 rounded-full bg-slate-700/30 p-1.5 border border-yeah-text/30 lg:flex items-center backdrop-blur">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`px-5 py-1 text-sm uppercase font-thin transition-colors z-20 hover:bg-slate-50 hover:text-slate-800 rounded-full ${
                selectedTab === item.name
                  ? "bg-slate-50 text-slate-800"
                  : "text-slate-100"
              }`}
              aria-current={selectedTab === item.name ? "page" : undefined}
              rel="prefetch"
              onClick={() => handleTabClick(item.name)}
            >
              {item.name}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="contact hidden lg:block rounded-full bg-rose-500 text-rose-100 px-5 py-2.5 text-sm font-medium e shadow-sm hover:bg-rose-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          onClick={(e) => {
            route.assign("/contact");
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
                  <a href="/">
                    <div className="flex items-end">
                      <img
                        className="object-bottom scale-75"
                        src={logo2}
                        alt="logo"
                        width={50}
                      />
                      <span className="font-bold text-white">DevGenit</span>
                    </div>
                  </a>
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
                      <a
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex items-center rounded-md p-3 text-sm font-semibold transition hover:bg-yeah-primary/30 text-white  "
                        onClick={() => {
                          handleTabClick(item.name);
                          toggleMenu();
                        }}
                      >
                        <span className="ml-3 text-base font-medium ">
                          {item.name}
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>
                <button
                  className="contact rounded-full w-full bg-rose-500 text-rose-100 px-5 py-2 mt-5 text-sm font-semibold e shadow-sm hover:bg-rose-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  type="button"
                  onClick={(e) => {
                    route.assign("/contact");
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
