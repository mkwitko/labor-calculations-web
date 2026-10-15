import { HubSubTabs } from "../components/hub-sub-tabs";
import CaseMessagesPage from "./messages-page";
import CaseNotesPage from "./notes-page";
import CaseOverviewPage from "./overview-page";
import CasePartiesPage from "./parties-page";

export default function CasoPage() {
  return (
    <HubSubTabs
      items={[
        { value: "geral", label: "Visão geral", content: <CaseOverviewPage /> },
        { value: "partes", label: "Partes", content: <CasePartiesPage /> },
        {
          value: "mensagens",
          label: "Mensagens",
          content: <CaseMessagesPage />,
        },
        { value: "notas", label: "Notas", content: <CaseNotesPage /> },
      ]}
    />
  );
}
