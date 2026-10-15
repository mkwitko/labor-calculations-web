import { HubSubTabs } from "../components/hub-sub-tabs";
import CaseDocumentsPage from "./documents-page";
import CaseMovementsPage from "./movements-page";

export default function AutosPage() {
  return (
    <HubSubTabs
      items={[
        {
          value: "documentos",
          label: "Documentos",
          content: <CaseDocumentsPage />,
        },
        {
          value: "andamentos",
          label: "Andamentos",
          content: <CaseMovementsPage />,
        },
      ]}
    />
  );
}
