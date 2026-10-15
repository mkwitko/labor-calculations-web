import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function displayToISO(display: string): string | undefined {
  if (display.length < 10) return undefined;
  const parsed = parse(display, "dd/MM/yyyy", new Date());
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : undefined;
}

function isoToDisplay(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return isValid(date) ? format(date, "dd/MM/yyyy") : "";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [display, setDisplay] = React.useState(() => (value ? isoToDisplay(value) : ""));
  const focusedRef = React.useRef(false);

  React.useEffect(() => {
    if (!focusedRef.current) {
      setDisplay(value ? isoToDisplay(value) : "");
    }
  }, [value]);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskDate(e.target.value);
    setDisplay(masked);
    const iso = displayToISO(masked);
    if (iso) onChange?.(iso);
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (date) {
      setDisplay(format(date, "dd/MM/yyyy"));
      onChange?.(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  }

  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleTextChange}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => { focusedRef.current = false; }}
        placeholder={placeholder}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 pr-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
