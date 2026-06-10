"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutTemplate, Paintbrush, PanelLeft } from "lucide-react";
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
    <div className="min-h-screen bg-[#f7f8fb] text-[#15161a]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#dce1e8] bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-[#e7ebf0] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#15161a] text-white">
            <PanelLeft size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">FormCraft</p>
            <p className="text-xs text-[#68707d]">No-code form studio</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                  active ? "bg-[#eef4ff] text-[#1749ba]" : "text-[#4b5563] hover:bg-[#f1f4f8] hover:text-[#111827]"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-[#dce1e8] bg-[#f8fafc] p-4">
          <p className="text-sm font-semibold text-[#1f2937]">Portfolio-ready</p>
          <p className="mt-1 text-xs leading-5 text-[#68707d]">
            Drag-and-drop UX, schema rendering, validation and local persistence in one product surface.
          </p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="sticky top-0 z-20 flex min-h-14 items-center gap-2 border-b border-[#dce1e8] bg-white/90 px-3 backdrop-blur lg:hidden">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#15161a] text-white">
            <PanelLeft size={16} />
          </div>
          <div className="formcraft-scrollbar flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                  pathname === item.href ? "bg-[#eef4ff] text-[#1749ba]" : "text-[#4b5563]"
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
