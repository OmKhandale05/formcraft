import { Check, ChevronDown } from "lucide-react";
import { Children, isValidElement, useEffect, useId, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
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

type OptionElement = ReactElement<{
  children?: ReactNode;
  disabled?: boolean;
  value?: string | number | readonly string[];
}>;

function optionText(children: ReactNode) {
  return Children.toArray(children).join("");
}

export function Select({ className, children, id, value, defaultValue, onChange, onBlur, disabled, name, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(String(value ?? defaultValue ?? ""));
  const currentValue = String(value ?? internalValue);
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const option = child as OptionElement;
      const optionValue = option.props.value ?? optionText(option.props.children);
      return {
        disabled: Boolean(option.props.disabled),
        label: optionText(option.props.children),
        value: String(optionValue)
      };
    });
  const selected = options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const selectValue = (nextValue: string) => {
    setInternalValue(nextValue);
    onChange?.({ target: { name, value: nextValue } } as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <select
        id={selectId}
        name={name}
        value={currentValue}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={() => {}}
        {...props}
      >
        {children}
      </select>
      <button
        type="button"
        aria-controls={`${selectId}-menu`}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-[#cfd9e7] bg-[#fbfcfe] pl-3 pr-2.5 text-left text-sm text-[#111827]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(17,24,39,0.05)] transition disabled:pointer-events-none disabled:opacity-50",
          "hover:border-[#b9c6d7] hover:bg-white focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,87,213,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]",
          className,
          open && "border-[var(--accent)] bg-white shadow-[0_0_0_3px_rgba(49,87,213,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]"
        )}
        onBlur={() => onBlur?.({ target: { name, value: currentValue } } as FocusEvent<HTMLSelectElement>)}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn("min-w-0 truncate font-medium", !selected?.value && "text-[#98a2b3]")}>{selected?.label || "Select option"}</span>
        <ChevronDown size={16} className={cn("shrink-0 text-[#667085] transition", open && "rotate-180 text-[var(--accent)]")} />
      </button>
      {open && (
        <div
          id={`${selectId}-menu`}
          role="listbox"
          className="absolute left-0 top-[calc(100%+0.375rem)] z-[90] max-h-64 w-full min-w-[220px] overflow-y-auto rounded-xl border border-[#cfd9e7] bg-white p-1.5 shadow-[0_24px_60px_rgba(17,24,39,0.18)]"
        >
          {options.map((option) => {
            const active = option.value === currentValue;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition disabled:pointer-events-none disabled:opacity-45",
                  active ? "bg-[#eef3ff] font-semibold text-[#1d3fbf]" : "text-[#334155] hover:bg-[#f5f7fb]"
                )}
                onClick={() => selectValue(option.value)}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {active && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-[#283140]", className)} {...props} />;
}
