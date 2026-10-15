import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProductTour } from "@/hooks/use-product-tour";
import { InfoBanner } from "@/components/info-banner";
import { SubscriptionGate } from "@/components/subscription-gate";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { formatCurrency } from "@/utils/value-format";
import {
  type CalculationMode,
  ModeChooser,
} from "./components/sections/mode-chooser";
import { V2CalculationForm } from "./components/v2/v2-calculation-form";
import { V3CalculationForm } from "./components/v3/v3-calculation-form";
import type { CloneSource } from "./@types/clone-source";
import useV3Form from "./components/v3/hooks/use-v3-form";
import useV2Form from "./components/v2/hook/use-v2-form";

export default function NewCalculation() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { cloneFrom?: CloneSource; caseId?: string; clientId?: string; clientName?: string } | null;
  const cloneFrom = state?.cloneFrom;
  const caseId = state?.caseId;
  const lockedClient = caseId && state?.clientId
    ? { id: state.clientId, name: state.clientName ?? "" }
    : undefined;

  const [mode, setMode] = useState<CalculationMode | null>(
    cloneFrom?.calculationVersion === "v3" ? "liquidacao" : null,
  );

  const { v2Form, onV2Submit, isPendingV2 } = useV2Form({ cloneFrom, caseId, lockedClient });
  const { v3Form, onV3Submit, isPendingV3 } = useV3Form({ cloneFrom, caseId, lockedClient });

  const isPending = isPendingV2 || isPendingV3;

  const { startWizardTourIfFirstVisit } = useProductTour();
  useEffect(() => {
    startWizardTourIfFirstVisit();
  }, [startWizardTourIfFirstVisit]);

  return (
    <SubscriptionGate>
      <div className="p-4 md:p-6 w-full space-y-4 md:space-y-6">
        {!mode ? (
          <ModeChooser onSelect={setMode} />
        ) : (
          <>
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Voltar"
                className="mt-0.5"
                onClick={() => navigate("/calculations")}
              >
                <ArrowLeftIcon />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {cloneFrom
                    ? "Clonar Cálculo"
                    : mode === "liquidacao"
                      ? "Nova Liquidação"
                      : "Nova Estimativa"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {cloneFrom
                    ? "Dados pré-preenchidos com o cálculo original — ajuste o que precisar"
                    : mode === "liquidacao"
                      ? "Cálculo completo com correção monetária, juros e descontos"
                      : "Preencha os dados do processo trabalhista"}
                </p>
              </div>
              {!cloneFrom && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setMode(null)}
                  className="ml-auto"
                >
                  Alterar modo
                </Button>
              )}
            </div>

            {/* Era `amber`, a cor de aviso do repo (variante `tip` do
                InfoBanner). Taxa de FGTS e salário mínimo são configuração,
                não aviso. */}
            <InfoBanner>
              O cálculo usará os valores padrão:{" "}
              <span className="font-medium">
                FGTS {env.VITE_DEFAULT_FGTS_RATE}%
              </span>{" "}
              e salário mínimo de{" "}
              <span className="font-medium">
                {formatCurrency(env.VITE_DEFAULT_MINIMUM_WAGE)}
              </span>
              .
            </InfoBanner>

            {mode === "estimativa" ? (
              <V2CalculationForm
                form={v2Form}
                onSubmit={onV2Submit}
                isPending={isPending}
                submitLabel={cloneFrom ? "Criar Cópia" : "Criar Estimativa"}
                pendingLabel="Criando..."
                onCancel={() => navigate("/calculations")}
                clientLocked={!!lockedClient}
              />
            ) : (
              <V3CalculationForm
                form={v3Form}
                onSubmit={onV3Submit}
                isPending={isPending}
                submitLabel={cloneFrom ? "Criar Cópia" : "Criar Liquidação"}
                pendingLabel="Criando..."
                onCancel={() => navigate("/calculations")}
                clientLocked={!!lockedClient}
              />
            )}
          </>
        )}
      </div>
    </SubscriptionGate>
  );
}
