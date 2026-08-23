import { DM_Sans, Poppins, Work_Sans } from "next/font/google";
import SiteChrome from "../components/SiteChrome";
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

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
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
        className={`${poppins.variable} ${workSans.variable} ${dmSans.variable} mx-auto relative bg-yeah-primary text-yeah-text poppins-regular pt-2 selection:bg-slate-800 selection:text-pink-400 cursor-default overflow-x-hidden scroll-smooth`}
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}