import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  HeartPulse,
  MessageSquare,
  Shield,
  Wifi,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">MEDHealth</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Wifi className="h-4 w-4" />
            Real-time WebSocket monitoring
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
            Healthcare that updates
            <span className="block text-brand-600">the moment it happens</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
            Live vitals from patient monitors, instant clinical alerts, real-time care team
            messaging, and appointment coordination — all synced across every screen in real time.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Launch Care Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Activity,
                title: "Live Vitals",
                desc: "Heart rate, BP, SpO2, and temperature streamed instantly via WebSockets when recorded.",
              },
              {
                icon: Bell,
                title: "Clinical Alerts",
                desc: "Automatic threshold detection triggers real-time alerts to the entire care team.",
              },
              {
                icon: MessageSquare,
                title: "Care Chat",
                desc: "Patient-staff messaging with instant delivery — no page refresh needed.",
              },
              {
                icon: Shield,
                title: "Persistent Records",
                desc: "Every reading stored in a real database, not simulated or fake data.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
