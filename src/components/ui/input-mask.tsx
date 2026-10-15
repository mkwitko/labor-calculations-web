import * as React from "react";
import { cn } from "@/lib/utils";

interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: "cpf" | "cnpj" | "cpf-cnpj";
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
}

function formatCPFCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return formatCPF(numbers);
  }
  return formatCNPJ(numbers);
}

function InputMask({
  mask,
  className,
  value,
  onChange,
  ...props
}: InputMaskProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formatted = e.target.value;
    if (mask === "cpf") {
      formatted = formatCPF(e.target.value);
    } else if (mask === "cnpj") {
      formatted = formatCNPJ(e.target.value);
    } else {
      formatted = formatCPFCNPJ(e.target.value);
    }
    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: formatted,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <input
      type="text"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      value={value}
      onChange={handleChange}
      maxLength={mask === "cpf" ? 14 : mask === "cnpj" ? 18 : 18}
      {...props}
    />
  );
}

export { InputMask };
