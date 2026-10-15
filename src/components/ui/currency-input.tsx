import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function decimalToDisplay(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  if (isNaN(num) || num === 0) return "";
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const decimal = digits ? String(Number(digits) / 100) : "";
    onChange?.({
      ...e,
      target: { ...e.target, value: decimal },
    } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={decimalToDisplay(value)}
      onChange={handleChange}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}
