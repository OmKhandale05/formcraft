import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-[#d8e0ea] bg-white/90 px-3 text-sm text-[#111827] shadow-sm transition placeholder:text-[#98a2b3] focus:border-[var(--accent)] focus:bg-white",
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
        "min-h-24 w-full rounded-xl border border-[#d8e0ea] bg-white/90 px-3 py-2 text-sm text-[#111827] shadow-sm transition placeholder:text-[#98a2b3] focus:border-[var(--accent)] focus:bg-white",
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
        "h-10 w-full rounded-xl border border-[#d8e0ea] bg-white/90 px-3 text-sm text-[#111827] shadow-sm transition focus:border-[var(--accent)] focus:bg-white",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-[#283140]", className)} {...props} />;
}
