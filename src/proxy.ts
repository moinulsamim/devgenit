import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyClientToken } from './lib/auth-edge';

export async function proxy(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const cookieHeader = request.headers.get('cookie') || '';

  const getCookie = (name: string): string | null => {
    const match = cookieHeader.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    const token = getCookie('admin_session');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (pathname.startsWith('/api/client') && !pathname.startsWith('/api/client/login')) {
    const token = getCookie('client_session');
    if (!token || !(await verifyClientToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = getCookie('admin_session');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname.startsWith('/client') && pathname !== '/client/login') {
    const token = getCookie('client_session');
    if (!token || !(await verifyClientToken(token))) {
      return NextResponse.redirect(new URL('/client/login', request.url));
    }
  }

  return NextResponse.next();
}