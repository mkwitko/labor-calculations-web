import { useOrgAbilities } from "@/hooks/use-organizations";
import { type HubSubTab, HubSubTabs } from "../components/hub-sub-tabs";
import CaseCalculationsPage from "./calculations-page";
import CaseFinancePage from "./finance-page";
import CaseSettlementsPage from "./settlements-page";

export default function NumerosPage() {
  // Antes o Financeiro era uma aba inteira condicionada; agora é a sub-aba que
  // desaparece. Ninguém ganha nem perde acesso — a API responde 403 de todo
  // modo, e esconder a sub-aba não substitui essa checagem.
  const { canAccessFinance } = useOrgAbilities();

  const items: HubSubTab[] = [
    { value: "calculos", label: "Cálculos", content: <CaseCalculationsPage /> },
    { value: "acordos", label: "Acordos", content: <CaseSettlementsPage /> },
    ...(canAccessFinance
      ? [
          {
            value: "financeiro",
            label: "Financeiro",
            content: <CaseFinancePage />,
          },
        ]
      : []),
  ];

  return <HubSubTabs items={items} />;
}
