"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/client/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Invalid credentials');
    router.push('/client/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-yeah-secondary rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Client login</h2>
        {error && <p className="text-rose-400 mb-2">{error}</p>}
        <input className="w-full p-2 mb-2 bg-transparent border" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" className="w-full p-2 mb-4 bg-transparent border" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-rose-500 text-white px-4 py-2 rounded">Sign in</button>
      </form>
    </div>
  );
}
