import { CalculationsTab } from "../../components/tabs/calculations-tab";
import { useCaseHub } from "../case-hub-layout";

export default function CaseCalculationsPage() {
  const { caseData, caseId } = useCaseHub();
  return (
    <CalculationsTab
      caseId={caseId}
      clientId={caseData.client?.id}
      clientName={caseData.client?.name}
      calculations={caseData.calculations}
    />
  );
}
