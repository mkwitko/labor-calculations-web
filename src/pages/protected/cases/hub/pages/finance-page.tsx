import { Loader2Icon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getGetCaseFeeAgreementQueryKey,
  useGetCaseFeeAgreement,
  useUpsertCaseFeeAgreement,
} from "@/http/generated/case-finance/case-finance";
import { queryClient } from "@/lib/react-query";
import { formatCurrency } from "@/utils/value-format";
import { useCaseHub } from "../case-hub-layout";
import { InstallmentsManager } from "./installments-manager";

type FeeType = "percentual" | "fixo" | "exito";

export default function CaseFinancePage() {
  const { caseId, caseData } = useCaseHub();
  const { data: fee } = useGetCaseFeeAgreement(caseId);

  const [feeType, setFeeType] = useState<FeeType>("percentual");
  const [percent, setPercent] = useState("");
  const [fixedValue, setFixedValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (fee) {
      setFeeType(fee.feeType as FeeType);
      setPercent(fee.percent != null ? String(fee.percent) : "");
      setFixedValue(fee.fixedValue != null ? String(fee.fixedValue) : "");
      setNotes(fee.notes ?? "");
    }
  }, [fee]);

  const { mutateAsync: save, isPending } = useUpsertCaseFeeAgreement({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCaseFeeAgreementQueryKey(caseId),
        });
        toast.success("Contrato de honorários salvo");
      },
    },
  });

  const submit = () =>
    save({
      caseId,
      data: {
        feeType,
        percent: feeType === "fixo" ? null : Number(percent) || null,
        fixedValue:
          feeType === "fixo"
            ? Number(fixedValue.replace(",", ".")) || null
            : null,
        notes: notes || undefined,
      },
    });

  const acceptedSettlements = (caseData.settlements ?? []).filter(
    (s) => s.status === "accepted",
  );

  const valorCausa = caseData.valorCausa ? Number(caseData.valorCausa) : null;
  const estimated =
    feeType !== "fixo" && valorCausa && percent
      ? (valorCausa * Number(percent)) / 100
      : feeType === "fixo" && fixedValue
        ? Number(fixedValue.replace(",", "."))
        : null;

  return (
    <div className="space-y-4 max-w-2xl">
      <InfoBanner variant="info">
        <span className="font-semibold">Contrato de honorários.</span> Registre
        o modelo de cobrança do escritório para este caso. Acordos e parcelas
        são gerenciados na aba Acordos.
      </InfoBanner>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de honorário</Label>
            <Select value={feeType} onValueChange={(v) => setFeeType(v as FeeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">Percentual (%)</SelectItem>
                <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                <SelectItem value="exito">Percentual de êxito (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {feeType === "fixo" ? (
            <div className="space-y-2">
              <Label>Valor fixo (R$)</Label>
              <CurrencyInput
                placeholder="0,00"
                value={fixedValue}
                onChange={(e) => setFixedValue(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Percentual (%)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                min={0}
                max={100}
                placeholder="30"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
            </div>
          )}
        </div>

        {estimated != null && (
          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm">
            Honorário estimado:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(estimated)}
            </span>
            {feeType !== "fixo" && valorCausa && (
              <span className="text-muted-foreground">
                {" "}
                ({percent}% de {formatCurrency(valorCausa)})
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            rows={3}
            placeholder="Condições, forma de pagamento, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button onClick={submit} disabled={isPending}>
          {isPending ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <SaveIcon className="w-4 h-4" />
          )}
          Salvar
        </Button>
      </div>

      {acceptedSettlements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Acordos e parcelas
          </h3>
          {acceptedSettlements.map((s) => (
            <InstallmentsManager
              key={s.id}
              settlementId={s.id}
              agreementValue={Number(s.agreementValue)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
