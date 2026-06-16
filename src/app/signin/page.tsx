"use client";

import Link from "next/link";
import { ArrowRight, GitBranch, LockKeyhole, Mail, PanelLeft, ShieldCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";

const authOptions = [
  { label: "Continue with Google", icon: Mail },
  { label: "Continue with GitHub", icon: GitBranch }
];

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-5 text-[#111418] sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111418] text-white shadow-[0_14px_28px_rgba(17,20,24,0.18)]">
            <PanelLeft size={17} />
          </span>
          <span>
            <span className="block text-sm font-bold text-[#111418]">FormCraft</span>
            <span className="text-xs text-[#667085]">No-code form builder</span>
          </span>
        </div>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-6 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
          <div className="rounded-3xl border border-[#d8e0ea] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d8e0ea] bg-[#fbfcfe] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
              <ShieldCheck size={14} />
              Secure workspace
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#111418] sm:text-5xl">
              Welcome back to FormCraft.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
              Manage forms, review submissions, customize themes, and keep your workspace organized from one clean dashboard.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Forms", "Build and customize"],
                ["Responses", "Review and export"],
                ["Themes", "Control every detail"]
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
                <p className="text-sm text-[#667085]">Sign in to continue to your workspace.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5e9ef] bg-[#fbfcfe] p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email address</Label>
                  <Input id="signin-email" type="email" className="mt-2 bg-white" placeholder="you@company.com" />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link href="/builder" className="text-xs font-semibold text-[#3157d5] hover:text-[#1d3fbf]">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="signin-password" type="password" className="mt-2 bg-white" placeholder="Enter your password" />
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#465366]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#cfd9e7]" />
                  Keep me signed in
                </label>
              </div>
              <Link
                href="/builder"
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[#111418] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(17,20,24,0.18)] transition hover:bg-[#20242b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Sign in
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e5e9ef]" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">or</span>
              <span className="h-px flex-1 bg-[#e5e9ef]" />
            </div>

            <div className="space-y-2">
              {authOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={option.label}
                    href="/builder"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e5e9ef] bg-white px-4 py-3 text-sm font-semibold text-[#111418] transition hover:border-[#c5d0dc] hover:bg-[#fbfcfe]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#465366]">
                      <Icon size={16} />
                    </span>
                    {option.label}
                  </Link>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-[#8a94a6]">
              New to FormCraft? <Link href="/builder" className="font-semibold text-[#3157d5]">Create a workspace</Link>
            </p>
          </aside>
      </section>
    </main>
  );
}
