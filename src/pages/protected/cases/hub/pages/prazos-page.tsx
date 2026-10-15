import { HubSubTabs } from "../components/hub-sub-tabs";
import CaseHearingsPage from "./hearings-page";
import CaseTasksPage from "./tasks-page";

export default function PrazosPage() {
  return (
    <HubSubTabs
      items={[
        {
          value: "audiencias",
          label: "Audiências e prazos",
          content: <CaseHearingsPage />,
        },
        { value: "tarefas", label: "Tarefas", content: <CaseTasksPage /> },
      ]}
    />
  );
}
