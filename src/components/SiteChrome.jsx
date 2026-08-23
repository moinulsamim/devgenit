"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith('/admin') || pathname.startsWith('/client');
  return isPortal ? children : <><Navbar />{children}<Footer /></>;
}