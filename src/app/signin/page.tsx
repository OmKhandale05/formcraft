"use client";

import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Input, Label } from "@/components/ui/input";

const authOptions = [
  { label: "Continue with Google", icon: Mail },
  { label: "Continue with GitHub", icon: GitBranch }
];

const supportLines = ["Build and edit forms visually", "Review submissions from one workspace", "Export schema, code, and embed snippets"];

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f3ee] px-4 py-5 text-[#171717] sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_82%_84%,rgba(47,111,94,0.12),transparent_30%),linear-gradient(135deg,#f8f4ee_0%,#f3eee7_52%,#eef3ef_100%)]" />
      <div className="pointer-events-none absolute left-[-7rem] top-28 h-[28rem] w-[28rem] rounded-full bg-[#ead8c8]/55 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-10 h-[30rem] w-[26rem] rounded-full bg-[#dbe7df]/60 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 border-b border-[#e3d9cd]/70 bg-[#fffaf4]/50 backdrop-blur-xl" />

      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4">
        <BrandLogo />
        <div className="hidden items-center gap-2 rounded-full border border-[#e0d6ca] bg-[#fffaf4]/80 px-3 py-2 text-xs font-bold text-[#5f574f] shadow-sm md:flex">
          <ShieldCheck size={14} className="text-[#2f6f5e]" />
          Secure demo workspace
        </div>
      </div>

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 py-8 lg:grid-cols-[minmax(0,0.72fr)_540px] lg:gap-12 lg:py-0 xl:gap-14">
        <div className="max-w-[590px] lg:-mt-8">
          <p className="mb-5 text-sm font-semibold text-[#2f6f5e]">FormCraft workspace</p>
          <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-[#171717] sm:text-6xl">
            Pick up your forms where you left off.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#625a52]">
            Sign in to edit drafts, review submissions, update themes, and keep your form workflows moving without opening a code editor.
          </p>

          <div className="mt-8 max-w-xl border-t border-[#ded3c7] pt-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8a7f73]">What stays ready for you</p>
            <div className="mt-5 space-y-3">
              {supportLines.map((line) => (
                <div key={line} className="flex items-center gap-3 text-sm font-semibold text-[#4f473f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2f6f5e]" />
                  {line}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 max-w-xl text-sm leading-6 text-[#766d63]">
            Built for teams who want the control of a custom form system with the speed of a visual workspace.
          </p>
        </div>

        <aside className="w-full max-w-[540px] justify-self-center rounded-[30px] border border-[#ded3c7] bg-[#fffaf4]/92 p-4 shadow-[0_30px_85px_rgba(74,58,42,0.18)] backdrop-blur-xl sm:p-5 lg:justify-self-end lg:-mt-2">
          <div className="mb-5 rounded-[24px] border border-[#1f1f1f] bg-[#171717] p-5 text-white shadow-[0_16px_34px_rgba(23,23,23,0.2)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <LockKeyhole size={19} />
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/72">
                Demo access
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">Use your workspace credentials to continue.</p>
          </div>

          <div className="rounded-[24px] border border-[#e1d6ca] bg-white p-4 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email address</Label>
                <Input id="signin-email" type="email" className="mt-2 h-11 rounded-2xl bg-white" placeholder="you@company.com" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="signin-password">Password</Label>
                  <Link href="/builder" className="text-xs font-semibold text-[#2f6f5e] hover:text-[#245949]">
                    Forgot password?
                  </Link>
                </div>
                <Input id="signin-password" type="password" className="mt-2 h-11 rounded-2xl bg-white" placeholder="Enter your password" />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#5f574f]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#cfc2b5] accent-[#2f6f5e]" />
                Keep me signed in
              </label>
            </div>
            <Link
              href="/builder"
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#171717] px-4 text-sm font-black text-white shadow-[0_14px_28px_rgba(23,23,23,0.18)] transition hover:bg-[#2a2a2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Sign in
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e1d6ca]" />
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9a9086]">or</span>
            <span className="h-px flex-1 bg-[#e1d6ca]" />
          </div>

          <div className="space-y-2">
            {authOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.label}
                  href="/builder"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e1d6ca] bg-white px-4 py-3 text-sm font-black text-[#171717] shadow-sm transition hover:border-[#cbbdae] hover:bg-[#fffdf9]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f4efe8] text-[#5f574f]">
                    <Icon size={16} />
                  </span>
                  {option.label}
                </Link>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-[#81786f]">
            New to FormCraft? <Link href="/builder" className="font-bold text-[#2f6f5e]">Create a workspace</Link>
          </p>
        </aside>
      </section>
    </main>
  );
}
