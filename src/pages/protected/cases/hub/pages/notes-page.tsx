import { NotesTab } from "../../components/tabs/notes-tab";
import { useCaseHub } from "../case-hub-layout";

export default function CaseNotesPage() {
  const { caseId } = useCaseHub();
  return <NotesTab caseId={caseId} />;
}
