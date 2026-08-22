import { Poppins, Work_Sans } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata = {
  title: "DevGenit",
  description: "DevGenit marketing site",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${workSans.variable} mx-auto relative bg-yeah-primary text-yeah-text poppins-regular pt-2 selection:bg-slate-800 selection:text-pink-400 cursor-default overflow-x-hidden scroll-smooth`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}