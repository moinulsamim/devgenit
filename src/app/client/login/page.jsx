"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Server must return a generic, safe message here —
        // never forward raw DB/auth error strings to the client.
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/client/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F4ED] p-4">
      <div className="w-full max-w-sm bg-[#FCFBF8] rounded-2xl shadow-sm border border-black/5 p-8">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#1C2536] text-white flex items-center justify-center text-xs font-bold">
            D.
          </div>
          <div>
            <p className="font-bold text-[#1C2536] text-[15px] leading-none">
              devgenit.
            </p>
            <p className="text-[10px] tracking-widest text-[#9C978D] font-medium mt-1">
              CLIENT ACCESS
            </p>
          </div>
        </div>

        {/* Heading */}
        <p className="text-[10px] tracking-widest text-[#9C978D] font-medium mb-2">
          YOUR PERSONAL WORKSPACE
        </p>
        <h1 className="text-3xl font-bold text-[#1C2536] mb-2">
          Welcome back.
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in with the credentials provided by DevGenit.
        </p>

        {error && (
          <p role="alert" className="text-sm text-rose-500 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={submit} noValidate>
          <label
            htmlFor="client-email"
            className="block text-[10px] tracking-widest text-[#9C978D] font-medium mb-1"
          >
            CLIENT EMAIL
          </label>
          <input
            id="client-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-[#F7F4ED] border border-black/5 text-sm text-[#1C2536] focus:outline-none focus:ring-2 focus:ring-[#1C2536]/20 disabled:opacity-60"
          />

          <label
            htmlFor="client-password"
            className="block text-[10px] tracking-widest text-[#9C978D] font-medium mb-1"
          >
            PASSWORD
          </label>
          <input
            id="client-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#F7F4ED] border border-black/5 text-sm text-[#1C2536] focus:outline-none focus:ring-2 focus:ring-[#1C2536]/20 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#1C2536] text-white font-semibold text-sm hover:bg-[#151b28] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Open my workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}