import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyClientToken } from './lib/auth-edge';

type Portal = 'admin' | 'client';

// Anything that shouldn't be subdomain-rewritten: Next internals, all API
// routes (they're called with their real, already-correct paths from the
// frontend, e.g. fetch('/api/admin/clients')), and static files (anything
// whose last path segment contains a dot — favicon.ico, logo2.png, etc.).
function isStaticAssetPath(pathname: string): boolean {
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return true;
  const lastSegment = pathname.split('/').pop() || '';
  return lastSegment.includes('.');
}

function toInternalPath(pathname: string, prefix: Portal): string {
  if (pathname.startsWith(`/${prefix}`)) return pathname; // already prefixed, leave alone
  if (pathname === '/') return `/${prefix}/dashboard`;
  return `/${prefix}${pathname}`;
}

function toVisiblePath(internalPath: string, prefix: Portal): string {
  const stripped = internalPath.slice(`/${prefix}`.length) || '/';
  return stripped === '/dashboard' ? '/' : stripped;
}

export async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const cookieHeader = request.headers.get('cookie') || '';

  const getCookie = (name: string): string | null => {
    const match = cookieHeader.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  let hostPortal: Portal | null = null;
  if (hostname.startsWith('admin.')) hostPortal = 'admin';
  else if (hostname.startsWith('client.')) hostPortal = 'client';

  const shouldRewrite = Boolean(hostPortal) && !isStaticAssetPath(pathname);
  const effectivePathname = shouldRewrite ? toInternalPath(pathname, hostPortal as Portal) : pathname;

  const redirectToLogin = (internalLoginPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = hostPortal ? toVisiblePath(internalLoginPath, hostPortal) : internalLoginPath;
    return NextResponse.redirect(url);
  };

  // Cross-portal hardening: a request arriving on admin.devgenit.com should
  // never be able to reach /api/client/*, and a request on client.devgenit.com
  // should never reach /api/admin/* — even though the frontend never issues
  // such a request in normal use, this closes the door on someone trying it
  // directly.
  if (hostPortal === 'admin' && pathname.startsWith('/api/client')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (hostPortal === 'client' && pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (effectivePathname.startsWith('/api/admin') && !effectivePathname.startsWith('/api/admin/login')) {
    const token = getCookie('admin_session');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (effectivePathname.startsWith('/api/client') && !effectivePathname.startsWith('/api/client/login')) {
    const token = getCookie('client_session');
    if (!token || !(await verifyClientToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (effectivePathname.startsWith('/admin') && effectivePathname !== '/admin/login') {
    const token = getCookie('admin_session');
    if (!token || !(await verifyAdminToken(token))) {
      return redirectToLogin('/admin/login');
    }
  }

  if (effectivePathname.startsWith('/client') && effectivePathname !== '/client/login') {
    const token = getCookie('client_session');
    if (!token || !(await verifyClientToken(token))) {
      return redirectToLogin('/client/login');
    }
  }

  if (shouldRewrite && effectivePathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = effectivePathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}