"use client";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  subtextClassName?: string;
  subtext?: string;
  showText?: boolean;
  dark?: boolean;
};

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  subtextClassName,
  subtext = "No-code form builder",
  showText = true,
  dark = false
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[18px] shadow-[0_14px_30px_rgba(23,23,23,0.18)]",
          dark ? "bg-white text-[#171717]" : "bg-[#171717] text-white",
          markClassName
        )}
      >
        <span className={cn("absolute inset-0", dark ? "bg-[#fffaf4]" : "bg-[#171717]")} />
        <span className="absolute left-[11px] top-[9px] h-[25px] w-[20px] rounded-[7px] border border-current/70" />
        <span
          className={cn(
            "absolute right-[10px] top-[9px] h-[9px] w-[9px] rounded-bl-[6px]",
            dark ? "bg-[#2f6f5e]" : "bg-[#c9a875]"
          )}
        />
        <span className="absolute left-[17px] top-[15px] h-[15px] w-[2px] rounded-full bg-current" />
        <span className="absolute left-[17px] top-[15px] h-[2px] w-[10px] rounded-full bg-current" />
        <span className="absolute left-[17px] top-[21px] h-[2px] w-[8px] rounded-full bg-current/80" />
      </div>

      {showText ? (
        <span className="min-w-0">
          <span className={cn("block text-sm font-black leading-5", dark ? "text-white" : "text-[#171717]", textClassName)}>
            FormCraft
          </span>
          <span className={cn("block text-xs font-medium", dark ? "text-white/52" : "text-[#6f675f]", subtextClassName)}>
            {subtext}
          </span>
        </span>
      ) : null}
    </div>
  );
}
