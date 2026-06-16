"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Database,
  GitBranch,
  KeyRound,
  Layers3,
  LockKeyhole,
  Mail,
  PanelLeft,
  Palette,
  ShieldCheck,
  Workflow
} from "lucide-react";
import { Input, Label } from "@/components/ui/input";

const authOptions = [
  { label: "Continue with Google", icon: Mail },
  { label: "Continue with GitHub", icon: GitBranch }
];

const productStats = [
  { label: "Forms live", value: "24", icon: Layers3 },
  { label: "Submissions", value: "1.8k", icon: Database },
  { label: "Health score", value: "96%", icon: BarChart3 }
];

const previewRows = [
  { label: "Contact details", tone: "bg-[#fff7ed] text-[#9a3412]", width: "w-[72%]" },
  { label: "Logic rules", tone: "bg-[#ecfdf5] text-[#047857]", width: "w-[56%]" },
  { label: "Theme tokens", tone: "bg-[#eef2ff] text-[#3730a3]", width: "w-[64%]" }
];

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f6f8] px-4 py-5 text-[#111418] sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(200,241,105,0.26),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(20,184,166,0.16),transparent_32%),linear-gradient(180deg,#fbfcfd_0%,#f4f6f8_48%,#eef4f1_100%)]" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-[34rem] rotate-[-10deg] rounded-[4rem] bg-white/52 blur-2xl" />
      <div className="pointer-events-none absolute right-[-9rem] top-28 h-[28rem] w-[32rem] rotate-12 rounded-[5rem] bg-[#dce8ff]/46 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-11rem] left-[18%] h-[24rem] w-[44rem] rounded-full bg-[#dff8ea]/58 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.18)_34%,rgba(17,20,24,0.04)_100%)]" />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-32 border-b border-white/70 bg-white/42 backdrop-blur-2xl" />

      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111418] text-white shadow-[0_18px_40px_rgba(17,20,24,0.22)] ring-1 ring-white/60">
            <PanelLeft size={18} />
          </span>
          <span>
            <span className="block text-sm font-black text-[#111418]">FormCraft</span>
            <span className="text-xs font-medium text-[#667085]">No-code form builder</span>
          </span>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-[#465366] shadow-sm backdrop-blur md:flex">
          <ShieldCheck size={14} className="text-[#047857]" />
          Secure local workspace
        </div>
      </div>

      <section className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/78 shadow-[0_28px_90px_rgba(17,24,39,0.12)] backdrop-blur-xl">
            <div className="border-b border-[#e7ecf2] bg-[linear-gradient(135deg,#ffffff_0%,#f4f8fb_54%,#eef7f2_100%)] p-6 sm:p-8">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9e4ee] bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#667085] shadow-sm">
                <KeyRound size={14} className="text-[#111418]" />
                Team access
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight text-[#111418] sm:text-6xl">
                Sign in to your form command center.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#5d6675] sm:text-base">
                Build forms, tune themes, review submissions, and ship polished no-code workflows from one focused workspace.
              </p>
            </div>

            <div className="grid gap-0 border-b border-[#e7ecf2] bg-white/70 sm:grid-cols-3">
              {productStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="border-[#e7ecf2] p-5 sm:border-r sm:last:border-r-0">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e1e7ef] bg-[#f8fafc] text-[#111418]">
                      <Icon size={17} />
                    </div>
                    <p className="text-2xl font-black tracking-tight text-[#111418]">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7b8494]">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-[1.05fr_0.95fr] sm:p-6">
              <div className="rounded-3xl border border-[#dce4ee] bg-[#111418] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">Live builder</p>
                    <p className="mt-1 text-sm font-bold">Lead generation form</p>
                  </div>
                  <span className="rounded-full bg-[#c8f169] px-2.5 py-1 text-xs font-black text-[#152000]">Saved</span>
                </div>
                <div className="space-y-3">
                  {previewRows.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${row.tone}`}>{row.label}</span>
                        <span className="h-2 w-2 rounded-full bg-[#c8f169]" />
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className={`h-2 rounded-full bg-white/75 ${row.width}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: Workflow, title: "Logic-ready", copy: "Conditional fields and multi-step flows." },
                  { icon: Palette, title: "Design control", copy: "Fonts, radius, focus states, and presets." },
                  { icon: ShieldCheck, title: "Submission safe", copy: "Local demo data with exportable responses." }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-3xl border border-[#dce4ee] bg-white/82 p-4 shadow-sm">
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#111418]">
                          <Icon size={17} />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-[#111418]">{item.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-[#667085]">{item.copy}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-white/80 bg-white/86 p-4 shadow-[0_30px_90px_rgba(17,24,39,0.16)] backdrop-blur-xl sm:p-5">
          <div className="mb-5 rounded-3xl border border-[#e1e7ef] bg-[linear-gradient(135deg,#111418_0%,#252a33_100%)] p-5 text-white shadow-[0_18px_45px_rgba(17,20,24,0.22)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/14">
                <LockKeyhole size={20} />
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70 ring-1 ring-white/12">
                Private beta
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">Use your workspace credentials to continue.</p>
          </div>

          <div className="rounded-3xl border border-[#e1e7ef] bg-[#fbfcfe] p-4 shadow-sm">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email address</Label>
                <Input id="signin-email" type="email" className="mt-2 h-11 rounded-2xl bg-white" placeholder="you@company.com" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="signin-password">Password</Label>
                  <Link href="/builder" className="text-xs font-semibold text-[#3157d5] hover:text-[#1d3fbf]">
                    Forgot password?
                  </Link>
                </div>
                <Input id="signin-password" type="password" className="mt-2 h-11 rounded-2xl bg-white" placeholder="Enter your password" />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#465366]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#cfd9e7] accent-[#111418]" />
                Keep me signed in
              </label>
            </div>
            <Link
              href="/builder"
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#111418] px-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(17,20,24,0.2)] transition hover:-translate-y-0.5 hover:bg-[#20242b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Sign in
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e1e7ef]" />
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">or</span>
            <span className="h-px flex-1 bg-[#e1e7ef]" />
          </div>

          <div className="space-y-2">
            {authOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.label}
                  href="/builder"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e1e7ef] bg-white px-4 py-3 text-sm font-black text-[#111418] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c5d0dc] hover:bg-[#fbfcfe]"
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
            New to FormCraft? <Link href="/builder" className="font-bold text-[#3157d5]">Create a workspace</Link>
          </p>
        </aside>
      </section>
    </main>
  );
}
