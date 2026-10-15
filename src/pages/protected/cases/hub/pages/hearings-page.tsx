import { HearingsTab } from "../../components/tabs/hearings-tab";
import { useCaseHub } from "../case-hub-layout";

export default function CaseHearingsPage() {
  const { caseData, caseId } = useCaseHub();
  return (
    <HearingsTab
      caseId={caseId}
      hearings={caseData.hearings}
      deadlines={caseData.deadlines}
    />
  );
}
