import Image from "next/image";
import cbg from "../assets/cbg.png";
import { MdEmail, MdLocationPin } from "react-icons/md";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";

function Contact() {
  return (
    <div className="w-full my-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-7xl px-4 rounded-lg my-20 ring-2 bg-slate-900/80 backdrop-blur relative">
          <div className="w-48 h-48 absolute bg-purple-700 opacity-60 scale-125 rounded-full blur-2xl right-0 top-1/2"></div>
          <div className="w-60 rotate-12 h-24 absolute bg-violet-700 opacity-0 lg:opacity-60 scale-125 rounded-full blur-2xl left-0 top-1/3"></div>

          {/* Hero Map */}
          <div className="flex flex-col space-y-8 pb-10 pt-12 md:pt-24">
            <div className="mx-auto max-w-max rounded-full border bg-gray-100 text-gray-900 ring-2 ring-gray-800 p-1 px-3">
              <p className="text-center text-xs font-semibold leading-normal md:text-sm">
                Share your thoughts
              </p>
            </div>
            <p className="text-center text-3xl font-bold text-gray-100 md:text-5xl md:leading-10">
              Love to hear from you
            </p>
            <p className="mx-auto max-w-4xl text-center text-base text-gray-600 md:text-xl">
              Stay connected with us to explore new opportunities and build
              strong relationships. Let&apos;s collaborate and create something
              incredible together!
            </p>
          </div>
          <div className="mx-auto max-w-7xl py-5">
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-x-4 gap-y-10">
              <Image
                alt="Contact us"
                className="max-h-full w-full max-w-md rounded-lg object-cover lg:block"
                src={cbg}
                width={500}
                height={500}
              />
              <div className="flex items-center justify-center">
                <div className="px-2 md:px-12 space-y-6">
                  <p className="text-2xl font-bold text-gray-100 md:text-4xl">
                    Get in touch
                  </p>
                  <p className="mt-4 text-lg text-gray-600">
                    Our friendly team would love to hear from you.
                  </p>
                  <div>
                    <ul>
                      <li className="flex items-center gap-2 text-gray-400">
                        <FaWhatsapp />
                        <a href="tel:008801581491903">+8801581491903</a>
                      </li>
                      <li className="flex items-center gap-2 text-gray-400">
                        <FaFacebook />
                        <a href="https://www.facebook.com/profile.php?id=61560197414891">
                          DevGenit
                        </a>
                      </li>
                      <li className="flex items-center gap-2 text-gray-400">
                        <MdEmail />
                        <a href="mailto:connect@devgenit.com">
                          connect@devgenit.com
                        </a>
                      </li>
                      <li className="flex items-start gap-2 text-gray-400">
                        <MdLocationPin transform="translate(0,2)" />
                        81/54, 1 no. Smritidhara Road, Dania, Dhaka - 1236
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
