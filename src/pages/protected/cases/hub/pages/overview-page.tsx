import { SummaryTab } from "../../components/tabs/summary-tab";
import { useCaseHub } from "../case-hub-layout";

export default function CaseOverviewPage() {
  const { caseData } = useCaseHub();
  return <SummaryTab data={caseData} />;
}
