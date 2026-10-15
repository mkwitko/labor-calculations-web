import { SettlementsTab } from "../../components/tabs/settlements-tab";
import { useCaseHub } from "../case-hub-layout";

export default function CaseSettlementsPage() {
  const { caseData } = useCaseHub();
  return <SettlementsTab settlements={caseData.settlements} />;
}
