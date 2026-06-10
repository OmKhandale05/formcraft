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
        variant === "primary" && "border-transparent bg-[var(--accent)] text-white hover:brightness-95",
        variant === "secondary" && "border-[#dce1e8] bg-white text-[#1f2937] hover:bg-[#f7f8fb]",
        variant === "ghost" && "border-transparent bg-transparent text-[#4b5563] hover:bg-[#eef2f7]",
        variant === "danger" && "border-transparent bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]",
        size === "sm" && "h-8 rounded-md px-3 text-sm",
        size === "md" && "h-10 rounded-lg px-4 text-sm",
        size === "icon" && "h-9 w-9 rounded-lg p-0",
        className
      )}
      {...props}
    />
  );
}
