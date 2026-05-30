"use client";

import { FormEvent, useState } from "react";
import { HeartPulse, Lock, User } from "lucide-react";
import type { SessionUser } from "@/lib/session";

type Props = {
  onLogin: (user: SessionUser) => void;
};

export function LoginModal({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, passkey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      onLogin({ id: data.id, name: data.name, role: data.role });
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Staff Login</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your doctor credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="doctor-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Doctor&apos;s name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="doctor-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Sarah Smith"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label htmlFor="passkey" className="mb-1.5 block text-sm font-medium text-slate-700">
              4-digit passkey
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="passkey"
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm tracking-[0.3em] outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <p className="text-center text-xs text-slate-400">
            Demo: Dr. Jaideep / 1111 · Dr. Sarah Smith / 1234 · Dr. Raj Patel / 5678
          </p>

          <button
            type="submit"
            disabled={loading || passkey.length !== 4 || !name.trim()}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
