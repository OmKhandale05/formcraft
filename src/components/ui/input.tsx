import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-[#cfd9e7] bg-[#fbfcfe] px-3 text-sm text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(17,24,39,0.05)] transition placeholder:text-[#98a2b3] hover:border-[#b9c6d7] focus:border-[var(--accent)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(49,87,213,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-[#cfd9e7] bg-[#fbfcfe] px-3 py-2 text-sm text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(17,24,39,0.05)] transition placeholder:text-[#98a2b3] hover:border-[#b9c6d7] focus:border-[var(--accent)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(49,87,213,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "formcraft-select h-10 w-full appearance-none rounded-lg border border-[#cfd9e7] bg-[#fbfcfe] py-0 pl-3 pr-10 text-sm text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(17,24,39,0.05)] transition hover:border-[#b9c6d7] focus:border-[var(--accent)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(49,87,213,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-[#283140]", className)} {...props} />;
}
