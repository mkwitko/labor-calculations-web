import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  contentWidth?: string;
  align?: "start" | "end" | "center";
  className?: string;
}

export function FilterSelect({
  options,
  value,
  onChange,
  placeholder,
  contentWidth = "w-48",
  align = "start",
  className,
}: FilterSelectProps) {
  const selected = options.find((o) => o.value === value);
  const label =
    selected?.label ?? placeholder ?? options[0]?.label ?? "Selecionar";
  const isActive = !!value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1.5 text-sm font-normal",
            isActive && "border-primary/40 text-primary bg-primary/5",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDownIcon className="w-3 h-3 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentWidth}>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(value === opt.value && "font-medium bg-muted")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
