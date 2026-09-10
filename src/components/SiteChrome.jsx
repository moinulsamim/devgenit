"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SiteChrome({ children, portal = null }) {
  const pathname = usePathname();
  // Portal either by explicit proxy hint (subdomain rewrites keep the
  // visible URL at '/', which this component cannot distinguish by path)
  // or by the real path prefix for direct /admin / /client visits.
  const isPortal = portal === 'admin' || portal === 'client' ||
    pathname.startsWith('/admin') || pathname.startsWith('/client');
  return isPortal ? children : <><Navbar />{children}<Footer /></>;
}