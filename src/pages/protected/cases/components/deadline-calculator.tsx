import { CalculatorIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { HelpTip } from "@/components/help-tip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCalculateDeadline } from "@/http/generated/deadline/deadline";

// Smart deadline calculator: counts business days (skips weekends + national
// holidays) from a base date, following the CLT/CPC publication rule.
export function DeadlineCalculator() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState("8");
  const [result, setResult] = useState<string | null>(null);

  const { mutateAsync: calculate, isPending } = useCalculateDeadline();

  const run = async () => {
    if (!startDate || !days) return;
    const res = await calculate({
      data: {
        startDate,
        businessDays: Number(days),
        startNextBusinessDay: true,
      },
    });
    setResult(res.dueAt);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalculatorIcon className="w-4 h-4" />
          Calcular prazo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            Calculadora de prazo
            <HelpTip title="Prazo processual">
              Conta em dias úteis a partir do dia seguinte à intimação/publicação
              (art. 775 CLT / art. 224 CPC), pulando fins de semana e feriados
              nacionais.
            </HelpTip>
          </DialogTitle>
          <DialogDescription>
            Informe a data da intimação/publicação e o prazo em dias úteis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data base</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Dias úteis</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={run}
            disabled={isPending || !startDate}
            className="w-full"
          >
            {isPending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <CalculatorIcon className="w-4 h-4" />
            )}
            Calcular
          </Button>

          {result && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Vencimento</p>
              <p className="text-lg font-bold text-primary">
                {new Date(result).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
