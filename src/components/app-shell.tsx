"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutTemplate, Paintbrush, PanelLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/builder", label: "Builder", icon: PanelLeft },
  { href: "/preview", label: "Preview", icon: FileText },
  { href: "/submissions", label: "Submissions", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/settings", label: "Theme", icon: Paintbrush }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-[#111418]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#111418] text-white lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#111418] shadow-[0_16px_34px_rgba(0,0,0,0.28)]">
            <PanelLeft size={18} />
          </div>
          <div>
            <p className="text-base font-semibold">FormCraft</p>
            <p className="text-xs text-white/55">No-code form studio</p>
          </div>
        </div>
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-white/65">
            <Sparkles size={14} />
            Workspace health
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-lg font-semibold">12</p>
              <p className="text-[11px] text-white/45">field types</p>
            </div>
            <div>
              <p className="text-lg font-semibold">5</p>
              <p className="text-[11px] text-white/45">templates</p>
            </div>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                  active ? "bg-white text-[#111418] shadow-lg shadow-black/20" : "text-white/62 hover:bg-white/[0.07] hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-semibold text-white">Portfolio-ready</p>
          <p className="mt-1 text-xs leading-5 text-white/52">
            Drag-and-drop UX, schema rendering, validation and local persistence in one product surface.
          </p>
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
