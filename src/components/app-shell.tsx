"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutTemplate, PanelLeft, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/builder", label: "Builder", icon: PanelLeft },
  { href: "/preview", label: "Preview", icon: FileText },
  { href: "/submissions", label: "Submissions", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/settings", label: "Settings", icon: Settings2 }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-[#111418]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-hidden border-r border-[#222831] bg-[#0f1217] text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(91,141,239,0.22),transparent_48%)]" />
        <div className="relative flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#111418] shadow-[0_18px_34px_rgba(0,0,0,0.34)]">
            <PanelLeft size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold tracking-tight">FormCraft</p>
              <span className="rounded-full bg-[#d8ff63] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#111418]">
                Studio
              </span>
            </div>
            <p className="text-xs text-white/52">No-code form builder</p>
          </div>
        </div>
        <nav className="relative flex-1 space-y-1 px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/36">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition duration-200",
                  active
                    ? "bg-white text-[#111418] shadow-[0_18px_38px_rgba(0,0,0,0.32)]"
                    : "text-white/58 hover:bg-white/[0.07] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 h-6 w-1 rounded-r-full transition",
                    active ? "bg-[#5b8def]" : "bg-transparent group-hover:bg-white/20"
                  )}
                />
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                    active ? "bg-[#111418] text-white" : "bg-white/[0.06] text-white/70 group-hover:bg-white/10 group-hover:text-white"
                  )}
                >
                  <Icon size={17} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="relative flex items-center gap-2 border-t border-white/10 px-5 py-4 text-xs text-white/44">
          <span className="h-2 w-2 rounded-full bg-[#d8ff63]" />
          <span>Local autosave enabled</span>
        </div>
      </aside>
      <div className="lg:pl-72">
        <div className="sticky top-0 z-20 flex min-h-14 items-center gap-2 border-b border-[#d8e0ea] bg-white/86 px-3 backdrop-blur lg:hidden">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#111418] text-white">
            <PanelLeft size={16} />
          </div>
          <div className="formcraft-scrollbar flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                  pathname === item.href ? "bg-[#111418] text-white" : "text-[#4b5563]"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
