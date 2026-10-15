import {
  AlertTriangleIcon,
  ClipboardListIcon,
  CoinsIcon,
  HandshakeIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import {
  useGetLaborCalculationStats,
  useListLaborCalculation,
} from "@/http/generated/labor-calculation/labor-calculation";
import { formatCurrency } from "@/utils/value-format";
import { ActionInbox } from "./components/action-inbox";
import { FinanceSummary } from "./components/finance-summary";
import { NextActionCard } from "./components/next-action-card";
import { RecentCalcRow } from "./components/recent-calc-row";
import { RecentList } from "./components/recent-list";
import { StatCard } from "./components/stat-card";
import { UpcomingPanel } from "./components/upcoming-panel";

export default function Home() {
  const navigate = useNavigate();
  const { data: stats } = useGetLaborCalculationStats();
  const { data: recentData } = useListLaborCalculation({ limit: 5 });
  const recent = recentData?.data ?? [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader title="Painel" subtitle="Visão geral do escritório" />

      <NextActionCard />

      {/* Zona 1 — agir agora. Pendência e agenda respondem à mesma pergunta
          ("o que é hoje"), mas empilhadas em largura total: cada linha carrega
          título, data e caso, e a meia-largura truncava tudo. */}
      <div className="space-y-3 md:space-y-4">
        <ActionInbox />
        <UpcomingPanel />
      </div>

      {/* Zona 2 — trabalho recente. */}
      <RecentList
        title="Cálculos Recentes"
        onViewAll={() => navigate("/calculations")}
        empty={recent.length === 0}
        emptyIcon={<ClipboardListIcon className="w-10 h-10" />}
        emptyText="Nenhum cálculo ainda"
      >
        {recent.map((calc) => (
          <RecentCalcRow key={calc.id} calc={calc} />
        ))}
      </RecentList>

      {/* Zona 3 — números, subordinada. Os dois DistributionBar (status e tipo
          de rescisão) saíram: dado de vitrine competindo com a fila de
          pendências. Os componentes ficam no repo, sem uso. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUpIcon className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-100 dark:bg-blue-950"
          label="Processos Ativos"
          value={stats?.activeCount ?? 0}
          suffix="em andamento"
        />
        <StatCard
          icon={<CoinsIcon className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-100 dark:bg-emerald-950"
          label="Valor em Aberto"
          value={formatCurrency(stats?.activeValue) || "R$ 0,00"}
          suffix="em cálculos ativos"
          largeValue
        />
        <StatCard
          icon={<AlertTriangleIcon className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-100 dark:bg-red-950"
          label="Prescrição em Risco"
          value={stats?.prescriptionRisk ?? 0}
          suffix="vence em 60 dias"
        />
        <StatCard
          icon={<HandshakeIcon className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-100 dark:bg-amber-950"
          label="Acordos Fechados"
          value={stats?.acordosFechados ?? 0}
          suffix="processos encerrados"
        />
      </div>

      <FinanceSummary />
    </div>
  );
}
