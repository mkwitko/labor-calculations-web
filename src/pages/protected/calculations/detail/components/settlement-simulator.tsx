import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSimulateSettlement,
  useCreateSettlement,
  getListSettlementsQueryKey,
} from "@/http/generated/settlements/settlements";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/value-format";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, Save } from "lucide-react";
import { toast } from "sonner";

const AGREEMENT_RATES = [60, 65, 70, 75, 80, 85, 90, 95, 100];

type Props = {
  calculationId: string;
};

export default function SettlementSimulator({ calculationId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [agreementRate, setAgreementRate] = useState(85);
  const [feeType, setFeeType] = useState<"percentage" | "fixed">("percentage");
  const [feeValue, setFeeValue] = useState(30);

  const queryClient = useQueryClient();
  const { mutate: simulate, data, isPending } = useSimulateSettlement();
  const { mutate: createSettlement, isPending: isSaving } = useCreateSettlement(
    {
      mutation: {
        onSuccess: () => {
          toast.success("Simulação salva com sucesso");
          queryClient.invalidateQueries({
            queryKey: getListSettlementsQueryKey(calculationId),
          });
        },
        onError: () => {
          toast.error("Erro ao salvar simulação");
        },
      },
    },
  );

  const handleSimulate = useCallback(() => {
    simulate({
      id: calculationId,
      data: {
        agreementRate: agreementRate / 100,
        feeType,
        feeValue,
      },
    });
  }, [calculationId, agreementRate, feeType, feeValue, simulate]);

  const handleSave = useCallback(() => {
    createSettlement({
      laborCalculationId: calculationId,
      data: {
        agreementRate: agreementRate / 100,
        feeType,
        feeValue,
      },
    });
  }, [calculationId, agreementRate, feeType, feeValue, createSettlement]);

  return (
    <Card className="border-border">
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Simulador de Acordo
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Taxa de Acordo
              </label>
              <span className="text-sm font-bold text-primary tabular-nums">
                {agreementRate}%
              </span>
            </div>
            <Slider
              value={[agreementRate]}
              onValueChange={(value) => setAgreementRate(value[0])}
              min={60}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {AGREEMENT_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={`hover:text-foreground ${
                    agreementRate === rate ? "text-primary font-medium" : ""
                  }`}
                  onClick={() => setAgreementRate(rate)}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">
                Tipo de Honorário
              </label>
              <Select
                value={feeType}
                onValueChange={(value: "percentage" | "fixed") =>
                  setFeeType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">
                {feeType === "percentage" ? "Percentual (%)" : "Valor (R$)"}
              </label>
              <Input
                type="number"
                value={feeValue}
                onChange={(e) => setFeeValue(Number(e.target.value))}
                min={0}
                max={feeType === "percentage" ? 100 : undefined}
              />
            </div>
          </div>

          <Button
            onClick={handleSimulate}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulando...
              </>
            ) : (
              "Simular Acordo"
            )}
          </Button>

          {data && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Valor Total Calculado
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(data.totalCalculatedValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Taxa de Acordo
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {data.agreementRate * 100}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Valor do Acordo
                  </p>
                  <p className="text-sm font-bold text-primary tabular-nums">
                    {formatCurrency(data.agreementValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Honorários</p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(data.feeAmount)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Líquido para o Cliente
                  </span>
                  <span className="text-lg font-bold tabular-nums">
                    {formatCurrency(data.netToClient)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Tempo Estimado:
                  </span>
                  <Badge variant="outline">{data.estimatedTime}</Badge>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Simulação
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
