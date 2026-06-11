"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { currencyCodes } from "@/lib/currencies";
import { cn } from "@/lib/utils";

type CurrencySelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  dark?: boolean;
  label?: string;
};

export function CurrencySelect({ value, onChange, className, dark = false, label = "Currency" }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-[#d8e0ea] bg-white/90 px-3 text-sm font-semibold text-[#111827] shadow-sm transition focus:border-[var(--accent)] focus:bg-white",
          dark && "border-white/15 bg-white/5 text-white",
          className
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <ChevronDown size={15} className={cn("transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-11 z-[80] max-h-56 overflow-y-auto rounded-xl border border-[#d8e0ea] bg-white p-1 shadow-[0_18px_45px_rgba(17,24,39,0.18)]">
          {currencyCodes.map((currency) => (
            <button
              key={currency}
              type="button"
              className={cn(
                "flex h-8 w-full items-center rounded-lg px-2 text-left text-sm font-medium transition hover:bg-[#eef2f7]",
                currency === value ? "bg-[#111418] text-white hover:bg-[#111418]" : "text-[#334155]"
              )}
              onClick={() => {
                onChange(currency);
                setOpen(false);
              }}
            >
              {currency}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
