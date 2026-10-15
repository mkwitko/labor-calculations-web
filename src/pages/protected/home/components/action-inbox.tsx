import {
  AlarmClockIcon,
  CheckSquareIcon,
  FileClockIcon,
  HandshakeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetDashboardActionItems } from "@/http/generated/dashboard/dashboard";
import { cn } from "@/lib/utils";

// Actionable inbox on the dashboard: what needs the lawyer's attention now.
export function ActionInbox() {
  const navigate = useNavigate();
  const { data } = useGetDashboardActionItems();
  if (!data) return null;

  const items = [
    {
      label: "Documentos aguardando aprovação",
      value: data.documentsAwaitingApproval,
      icon: FileClockIcon,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400",
      to: "/cases",
    },
    {
      label: "Acordos respondidos pelo cliente",
      value: data.settlementsResponded,
      icon: HandshakeIcon,
      color:
        "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400",
      to: "/cases",
    },
    {
      label: "Tarefas em aberto",
      value: data.openTasks,
      icon: CheckSquareIcon,
      color:
        "text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400",
      to: "/cases",
    },
    {
      label: "Prazos vencidos",
      value: data.overdueDeadlines,
      icon: AlarmClockIcon,
      color: "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400",
      to: "/agenda",
    },
  ];

  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Precisam da sua atenção
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              disabled={item.value === 0}
              className={cn(
                "flex flex-col gap-2 px-4 py-4 text-left transition-colors",
                item.value > 0
                  ? "hover:bg-muted/40"
                  : "opacity-50 cursor-default",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  item.color,
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
