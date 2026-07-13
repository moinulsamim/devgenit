import { useEffect, useState } from "react";
import cbg from "../assets/cbg.png";
import { database } from "../../firebase.config";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdEmail, MdError, MdLocationPin } from "react-icons/md";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";

function Contact() {
  const { user } = useAuth();
  const [toast, setToast] = useState("");
  const [clientData, setData] = useState({
    displayName: "",
    email: "",
    phone: "",
    message: "",
  });
  function handleInput(e) {
    setData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const colRef = collection(database, "message");

    try {
      await addDoc(colRef, {
        ...clientData,
        serverTime: serverTimestamp(),
      })
        .then((res) => {
          if (res) console.log("__SUCCESS__");
          setToast("Message delivered");
        })
        .catch((error) => {
          console.log("Failed to send Message to ADMIN");
          setToast("Failed to send Message");
        });
    } catch (error) {
      console.log(error?.message, "Failed to send Message to ADMIN");
      setToast("Failed to send Message");
    }
  }
  useEffect(() => {
    if (toast.length) {
      const loop = setTimeout(() => {
        // setToast("");
        clearCache();
      }, 5000);
      return () => clearTimeout(loop);
    }
  }, [toast]);

  const clearCache = () => {
    setData({
      displayName: "",
      email: "",
      message: "",
      phone: "",
    });
  };
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
              strong relationships. Let's collaborate and create something
              incredible together!
            </p>
          </div>
          <div className="mx-auto max-w-7xl py-5">
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-x-4 gap-y-10">
               
              <img
                alt="Contact us"
                className="max-h-full w-full max-w-md rounded-lg object-cover lg:block"
                src={cbg}
                width={500}
                height={500}
              />
              {/* contact from */}
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
                        <MdLocationPin transform="translate(0,2)"/>
                        81/54, 1 no. Smritidhara Road, Dania, Dhaka - 1236
                      </li>
                    </ul>
                  </div>
                  <form
                    hidden
                    className="mt-8 space-y-4"
                    onSubmit={handleSubmit}
                  >
                    <div className="grid w-full  items-center gap-1.5">
                      <label
                        className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="displayName"
                      >
                        Full Name
                      </label>
                      <input
                        className="text-slate-100 flex h-10 w-full rounded-md border  bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1  focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50  border-gray-700   focus:ring-offset-gray-900"
                        type="text"
                        id="displayName"
                        name="displayName"
                        placeholder="Full Name"
                        required
                        value={clientData.displayName}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="grid w-full  items-center gap-1.5">
                      <label
                        className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        className="text-slate-100 flex h-10 w-full rounded-md border  bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1  focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50  border-gray-700     focus:ring-offset-gray-900"
                        type="email"
                        id="email"
                        name="email"
                        value={clientData.email}
                        placeholder="Email"
                        onChange={handleInput}
                        required
                      />
                    </div>
                    <div className="grid w-full  items-center gap-1.5">
                      <label
                        className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="phone"
                      >
                        Phone number
                      </label>
                      <input
                        className="text-slate-100 flex h-10 w-full rounded-md border  bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1  focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50  border-gray-700     focus:ring-offset-gray-900"
                        type="tel"
                        id="phone"
                        value={clientData.phone}
                        name="phone"
                        placeholder="Phone number"
                        onChange={handleInput}
                        required
                      />
                    </div>
                    <div className="grid w-full  items-center gap-1.5">
                      <label
                        className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="message"
                      >
                        Message
                      </label>
                      <textarea
                        className="text-slate-100 flex h-26 w-full rounded-md border  bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1  focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50  border-gray-700  resize-none   focus:ring-offset-gray-900"
                        id="message"
                        name="message"
                        placeholder="Leave us a message"
                        onChange={handleInput}
                        value={clientData.message}
                        required
                        rows={3}
                      />
                    </div>
                    {toast.length ? (
                      <p
                        className={`w-full h-auto px-5 py-2 my-4 ring-2 text-left font-thin capitalize rounded-md ${
                          !toast.includes("delivered")
                            ? "bg-rose-800/45 text-rose-400/80 ring-rose-400"
                            : "bg-green-800/45 text-green-400/80 ring-green-400"
                        } flex items-center gap-2`}
                      >
                        {toast.includes("delivered") ? (
                          <FaRegCheckCircle />
                        ) : (
                          <MdError />
                        )}
                        <p className="tracking-wide">
                          {toast.split("").map((char, ci) => (
                            <AnimatedText char={char} id={ci} key={`c_${ci}`} />
                          ))}
                        </p>
                      </p>
                    ) : (
                      <button
                        type="submit"
                        className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        Send Message
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const AnimatedText = ({ char, id }) => {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const loop = setTimeout(() => {
      setAnimate(true);
    }, 500);

    return () => clearTimeout(loop);
  }, [animate]);

  return (
    <span
      // key={id}
      className={`transition-opacity duration-500 ${
        animate ? "opacity-100" : "opacity-0"
      } `}
      style={{
        transitionDelay: `${id * 30}ms`,
      }}
    >
      {char}
    </span>
  );
};

export default Contact;
