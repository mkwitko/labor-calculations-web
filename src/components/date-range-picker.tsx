import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  numberOfMonths?: number;
  align?: "start" | "end" | "center";
  className?: string;
}

function formatRange(range: DateRange, placeholder: string): string {
  if (range.from && range.to) {
    return `${format(range.from, "dd/MM/yy")} – ${format(range.to, "dd/MM/yy")}`;
  }
  if (range.from) return `A partir de ${format(range.from, "dd/MM/yy")}`;
  return placeholder;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Período",
  numberOfMonths = 2,
  align = "start",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const isActive = !!value.from;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1.5 text-sm font-normal",
            isActive && "border-primary/40 text-primary bg-primary/5",
            className,
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{formatRange(value, placeholder)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          locale={ptBR}
          selected={{ from: value.from, to: value.to }}
          onSelect={(range) => onChange({ from: range?.from, to: range?.to })}
          numberOfMonths={numberOfMonths}
          initialFocus
        />
        {/* Footer always rendered to avoid height jump — button just disabled when nothing selected */}
        <div className="border-t border-border px-3 py-2.5 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled={!isActive}
            className="h-7 text-xs"
            onClick={() => {
              onChange({ from: undefined, to: undefined });
              setOpen(false);
            }}
          >
            Limpar período
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
