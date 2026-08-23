"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Invalid credentials');
    router.push('/admin/dashboard');
  }

  return <div className="admin-login min-h-screen bg-[#f1f6f4] px-5 py-10 flex items-center justify-center"><form onSubmit={submit} className="admin-card w-full max-w-[630px] px-8 py-10 sm:px-14 sm:py-14"><div className="flex items-center gap-4"><span className="w-11 h-11 rounded-xl bg-[#c8eee5] text-[var(--admin-ink)] text-2xl font-semibold flex items-center justify-center">D</span><div><strong className="block text-2xl tracking-tight">devgenit</strong><span className="text-xs tracking-[.2em] text-[#80918e]">ADMIN CONSOLE</span></div></div><div className="mt-14"><p className="admin-label">Private operations console</p><h1 className="text-5xl font-light tracking-tight mt-5">Admin sign in.</h1><p className="text-[#728181] text-lg mt-4">Use the dedicated DevGenit administrator credential.</p></div>{error && <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="mt-10 space-y-7"><label className="block"><span className="admin-label text-sm font-medium tracking-[.12em]">Admin username</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-3 w-full h-14 rounded-xl border border-[#ccd8d5] px-4 outline-none focus:border-[var(--admin-teal)] focus:ring-2 focus:ring-[#c8eee5]" /></label><label className="block"><span className="admin-label text-sm font-medium tracking-[.12em]">Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-3 w-full h-14 rounded-xl border border-[#ccd8d5] px-4 outline-none focus:border-[var(--admin-teal)] focus:ring-2 focus:ring-[#c8eee5]" /></label><button className="w-full h-14 rounded-xl bg-[var(--admin-teal)] text-white font-semibold hover:bg-[#247b6d]">Enter admin console</button></div></form></div>;
}
