import Link from "next/link";
import { FaFacebook, FaLinkedin } from "react-icons/fa6";
import { MdEmail, MdLocationPin, MdPhone } from "react-icons/md";

export default function Footer() {
  const date = new Date();
  let year = date.getUTCFullYear();

  return (
    <div className="px-6">
      <footer className="bg-yeah-secondary rounded-xl max-w-7xl lg:mx-auto w-full mb-2 py-10">
        <div className="lg:space-y-16 mx-auto px-10">
          <div className="grid grid-cols-1 gap-10 lg:gap-5 lg:grid-cols-3 justify-evenly ">
            <div>
              <div>
                <p className="text-4xl poppins-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-30% to-rose-600">
                    <Link href="/">DevGenit</Link>
                </p>
              </div>
              <div className="space-y-3 my-6">
                <p className="lg:max-w-xs text-gray-500">Get in touch</p>

                <ul className="flex gap-6">
                  <li>
                    <a
                      href="https://www.facebook.com/profile.php?id=61560197414891"
                      rel="noreferrer"
                      target="_blank"
                      className=" transition hover:opacity-75"
                    >
                      <FaFacebook color="#1877F2" size={"1.3rem"} />
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://www.linkedin.com/company/devgenit/"
                      rel="noreferrer"
                      target="_blank"
                      className=" transition hover:opacity-75"
                    >
                      <FaLinkedin color="#0077b5" size={"1.3rem"} />
                    </a>
                  </li>
                </ul>
                <div className="contact-info pt-7">
                  <p className="lg:max-w-xs text-gray-400 flex gap-2 items-center">
                    <MdPhone color="#aaa" />
                    {"+8801581491903"}
                  </p>
                  <p className="lg:max-w-xs text-gray-400 flex gap-2 items-center">
                    <MdEmail color="#aaa" />
                    {"devgenit@gmail.com"}
                  </p>
                  <p className="flex items-center gap-2 text-gray-400">
                    <MdLocationPin />
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-2 ">
              <div>
                <p className="font-medium text-gray-100">Company</p>

                <ul className="mt-6 space-y-4 text-sm text-gray-400">
                  {/* <li>
                    <a
                      href="/meet-the-team"
                      className=" transition hover:opacity-75"
                    >
                      {" "}
                      Meet the Team{" "}
                    </a>
                  </li> */}

                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      Accounts Review{" "}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-100">Helpful Links</p>

                <ul className="mt-6 space-y-4 text-sm text-gray-400">
                  <li>
                    <Link href="/contact" className=" transition hover:opacity-75">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      FAQs{" "}
                    </a>
                  </li>

                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      Live Chat{" "}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-100">Legal</p>

                <ul className="mt-6 space-y-4 text-sm text-gray-400">
                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      Accessibility{" "}
                    </a>
                  </li>

                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      Returns Policy{" "}
                    </a>
                  </li>

                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      Refund Policy{" "}
                    </a>
                  </li>

                  <li>
                    <a href="#" className=" transition hover:opacity-75">
                      {" "}
                      Hiring Statistics{" "}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="font-light text-sm text-white text-center w-full mt-10">
            All rights reserved by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-500 font-bold">
              DevGenit
            </span>{" "}
            &copy; {year == 2024 ? year : `2024 - ` + year.toString()}
            {". "}
          </p>
        </div>
      </footer>
    </div>
  );
}
// naUI er ekta IDea aise mathay
