"use client";

import Link from "next/link";
import { ArrowRight, GitBranch, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const authOptions = [
  { label: "Google", helper: "Mock provider", icon: Mail },
  { label: "GitHub", helper: "Mock provider", icon: GitBranch },
  { label: "Email link", helper: "Mock flow", icon: Mail }
];

export default function SignInPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-[#f6f7f9] px-4 py-6 sm:px-6">
        <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
          <div className="rounded-3xl border border-[#d8e0ea] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-[#fbfcfe] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
              <ShieldCheck size={14} />
              Demo workspace
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#111418] sm:text-5xl">
              Sign in without slowing down the product demo.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
              FormCraft keeps the portfolio preview open, while this page shows how authentication would fit into the SaaS experience.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Open demo", "No account required"],
                ["Local data", "Saved in browser"],
                ["Auth-ready", "Future backend slot"]
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-4">
                  <p className="text-sm font-bold text-[#111418]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-[#d8e0ea] bg-white p-5 shadow-[0_24px_70px_rgba(17,24,39,0.1)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111418] text-white shadow-[0_16px_32px_rgba(17,20,24,0.18)]">
                <LockKeyhole size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111418]">Welcome back</h2>
                <p className="text-sm text-[#667085]">Continue as a demo user.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-4">
              <p className="text-sm font-bold text-[#111418]">Portfolio preview mode</p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                Authentication is intentionally mocked so recruiters can explore the full builder instantly.
              </p>
              <Link
                href="/builder"
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[#111418] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(17,20,24,0.18)] transition hover:bg-[#20242b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Continue as demo user
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {authOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.label}
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border border-[#e5e9ef] bg-white px-4 py-3 text-left opacity-70"
                    disabled
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#465366]">
                        <Icon size={16} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#111418]">{option.label}</span>
                        <span className="text-xs text-[#667085]">{option.helper}</span>
                      </span>
                    </span>
                    <span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                      Soon
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-[#8a94a6]">
              Real authentication can be connected later with Supabase, Clerk, Auth.js, or Firebase.
            </p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
