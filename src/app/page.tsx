"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase/client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const DEMO_EMAIL = "admin@crm.com";
const DEMO_PASSWORD = "admin123";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) console.error(error);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/user");
    const user = await res.json();

    if (!res.ok) {
      setError(user.error || "Failed to load user");
      setLoading(false);
      return;
    }

    // redirect based on role
    if (user.role === "MANAGER") {
      router.push("/report");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
    setLoading(false);
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <div className="grid min-h-svh bg-white lg:grid-cols-2">
      {/* Form panel */}
      <main className="flex flex-col px-4 py-8 sm:px-10 lg:px-20 lg:py-12">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            CRM Pro
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-120">
            <h1 className="text-[2rem] leading-tight font-bold tracking-tight text-slate-900 sm:text-[2.5rem] sm:leading-[1.15] xl:text-[2.75rem]">
              Sign in to your workspace
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-[1.0625rem]">
              Pick up where you left off with your leads, reminders and
              follow-ups.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-800">
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    disabled={loading}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "login-error" : undefined}
                    className="h-12 rounded-lg border-slate-200 bg-white pl-11 text-base text-slate-900 placeholder:text-slate-400 hover:border-slate-300 md:text-base"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-slate-800">
                  Password
                </Label>
                <div className="relative">
                  <LockKeyhole
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "login-error" : undefined}
                    className="h-12 rounded-lg border-slate-200 bg-white pr-12 pl-11 text-base text-slate-900 placeholder:text-slate-400 hover:border-slate-300 md:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors outline-none hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  id="login-error"
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <p className="leading-5">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <LoaderCircle aria-hidden className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm">
              <p className="text-slate-500">
                Demo account:{" "}
                <span className="font-medium text-slate-900">{DEMO_EMAIL}</span>
                {" / "}
                <span className="font-medium text-slate-900">
                  {DEMO_PASSWORD}
                </span>
              </p>
              <button
                type="button"
                onClick={fillDemo}
                disabled={loading}
                className="rounded-sm font-semibold text-blue-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 cursor-pointer"
              >
                Use demo login
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} CRM Pro. Access is limited to invited
          team members.
        </p>
      </main>

      {/* Brand panel */}
      <BrandPanel />
    </div>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden
      className="flex size-10 items-center justify-center rounded-lg bg-blue-600"
    >
      <TrendingUp className="size-5 text-white" strokeWidth={2.5} />
    </span>
  );
}

const activity = [
  {
    icon: Phone,
    title: "Call, 12 minutes",
    when: "Yesterday",
    body: "Interested in tracking for 40 trucks. Wants pricing before Thursday.",
  },
  {
    icon: FileText,
    title: "Note",
    when: "Monday",
    body: "Final decision goes through their finance team.",
  },
];

const draftPoints = [
  "Send pricing for 40 vehicles",
  "Ask who signs off in finance",
  "Book a demo before Thursday",
];

function BrandPanel() {
  return (
    <aside
      aria-hidden
      className="relative hidden overflow-hidden bg-linear-to-b from-[#0d1a3a] to-[#070e22] lg:flex lg:flex-col lg:pt-[18vh] lg:pl-16 xl:pl-24"
    >
      {/* soft glow behind the preview */}
      <div className="absolute top-1/2 right-0 h-80 w-3/4 rounded-full bg-blue-600/15 blur-3xl" />

      <div className="relative pr-16">
        <h2 className="text-4xl leading-[1.1] font-bold tracking-tight text-white xl:text-5xl">
          Know what was said,
          <br />
          and what happens next.
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300 xl:text-[1.0625rem]">
          Every call, note and reminder lives on the lead, so nobody starts a
          conversation from scratch.
        </p>
      </div>

      {/* Lead preview, bleeds off the right and bottom edges */}
      <div className="relative mt-16 flex-1 rounded-tl-2xl border-t border-l border-white/10 bg-[#0c1838]/80 shadow-2xl shadow-black/40">
        {/* Lead header */}
        <div className="flex items-center gap-4 px-8 py-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-300">
            MH
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white">
              Mariam Hassan
            </p>
            <p className="truncate text-sm text-slate-400">
              Operations lead, Nile Logistics
            </p>
          </div>
          <span className="mr-8 rounded-md border border-blue-400/30 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300">
            Qualified
          </span>
        </div>

        {/* Reminder strip */}
        <div className="flex items-center gap-2.5 border-y border-white/10 bg-amber-400/8 px-8 py-3 text-sm font-medium text-amber-300">
          <Bell className="size-4" />
          Follow up today at 3:00 PM
        </div>

        {/* Activity timeline */}
        <ol className="space-y-5 px-8 pt-6 pr-16">
          {activity.map((item, i) => (
            <li key={item.title} className="relative flex gap-4">
              {i < activity.length - 1 && (
                <span className="absolute top-8 -bottom-5 left-3.25 w-px bg-white/10" />
              )}
              <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0c1838] text-slate-300">
                <item.icon className="size-3.5" />
              </span>
              <div className="min-w-0 pt-0.5 text-sm">
                <p>
                  <span className="font-semibold text-white">{item.title}</span>{" "}
                  <span className="text-slate-500">{item.when}</span>
                </p>
                <p className="mt-1 text-slate-300">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* AI follow-up draft */}
        <div className="mx-8 mt-7 mb-12 max-w-xl rounded-xl border border-blue-500/40 bg-blue-500/8 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="size-4 text-blue-300" />
              Follow-up draft
            </p>
            <p className="text-xs text-slate-400">Waiting for your review</p>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
            {draftPoints.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="size-1.5 shrink-0 rounded-full bg-blue-400" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200">
              <Pencil className="size-3" />
              Edit
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
              <Check className="size-3" />
              Save to lead
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
