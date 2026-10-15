import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useListLaborCalculation } from "@/http/generated/labor-calculation/labor-calculation";
import {
  formatCurrency,
  formatDate,
  getTerminationTypeLabel,
} from "@/utils/value-format";
import {
  CalculatorIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  XIcon,
} from "lucide-react";

/**
 * Escolhe um cálculo já feito para nascer junto com o caso. Só lista os do
 * cliente selecionado — vincular cálculo de outra pessoa ao caso é sempre
 * engano, não atalho.
 *
 * Cálculo que já pertence a outro caso aparece desabilitado: selecioná-lo o
 * moveria de lugar, e mover não pode ser efeito colateral de criar.
 */
export function CalculationPicker({
  clientId,
  value,
  onChange,
}: {
  clientId: string;
  value: string;
  onChange: (calculationId: string) => void;
}) {
  const { data, isLoading } = useListLaborCalculation(
    { clientId, limit: 50 },
    { query: { enabled: Boolean(clientId) } },
  );

  const calculations = data?.data ?? [];
  const selected = calculations.find((calc) => calc.id === value);

  if (!clientId) {
    return (
      <p className="text-xs text-muted-foreground">
        Selecione o cliente primeiro para ver os cálculos dele.
      </p>
    );
  }

  if (!isLoading && calculations.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Este cliente ainda não tem cálculos. Você pode vincular depois, pela aba
        Cálculos do caso.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex flex-1 min-w-0 items-center justify-between rounded-lg border border-input bg-transparent px-3 h-9 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 hover:border-input/80"
          >
            {selected ? (
              <span className="text-foreground truncate">
                {getTerminationTypeLabel(selected.terminationType)}
                {selected.totalValue != null && (
                  <span className="text-muted-foreground">
                    {" · "}
                    {formatCurrency(Number(selected.totalValue))}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {isLoading ? "Carregando cálculos..." : "Nenhum (opcional)"}
              </span>
            )}
            <ChevronsUpDownIcon className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-2" align="start">
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {calculations.map((calc) => {
              const linkedElsewhere = Boolean(calc.caseId);

              return (
                <button
                  key={calc.id}
                  type="button"
                  disabled={linkedElsewhere}
                  onClick={() => onChange(calc.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors enabled:hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <CalculatorIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getTerminationTypeLabel(calc.terminationType)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {linkedElsewhere
                        ? "Já vinculado a outro caso"
                        : `${formatDate(calc.createdAt)}${
                            calc.totalValue != null
                              ? ` · ${formatCurrency(Number(calc.totalValue))}`
                              : ""
                          }`}
                    </p>
                  </div>

                  {value === calc.id && (
                    <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Remover cálculo"
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-input text-muted-foreground hover:text-foreground hover:border-input/80 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
