import { DocumentsTab } from "../../components/tabs/documents-tab";
import { useCaseHub } from "../case-hub-layout";

export default function CaseDocumentsPage() {
  const { caseData, caseId } = useCaseHub();
  return <DocumentsTab caseId={caseId} documents={caseData.documents ?? []} />;
}
