import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 border font-medium transition disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "primary" && "border-transparent bg-[#111418] text-white shadow-[0_12px_24px_rgba(17,20,24,0.18)] hover:bg-[#20242b]",
        variant === "secondary" && "border-[#d8e0ea] bg-white/90 text-[#20242b] shadow-sm hover:border-[#c5d0dc] hover:bg-white",
        variant === "ghost" && "border-transparent bg-transparent text-[#546173] hover:bg-[#edf1f6] hover:text-[#111418]",
        variant === "danger" && "border-transparent bg-[#fff1f2] text-[#be123c] hover:bg-[#ffe4e6]",
        size === "sm" && "h-8 rounded-lg px-3 text-sm",
        size === "md" && "h-10 rounded-xl px-4 text-sm",
        size === "icon" && "h-9 w-9 rounded-lg p-0",
        className
      )}
      {...props}
    />
  );
}
