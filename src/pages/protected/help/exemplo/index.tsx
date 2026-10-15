import { ArrowLeftIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXAMPLE_CASE as c } from "./data";

// Demonstração read-only de um caso povoado. Não é reuso do hub de caso: as 17
// telas do hub dependem de hooks de rede por caseId, e extrair apresentação de
// todas elas para servir esta página custaria mais do que ela vale. O layout é
// duplicado de propósito.
const TABS = ["Caso", "Números", "Prazos", "Autos"] as const;
type Tab = (typeof TABS)[number];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export default function ExampleCase() {
  const [tab, setTab] = useState<Tab>("Caso");

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <InfoIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Este é um caso de demonstração
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Os dados são fictícios e nada aqui pode ser editado. Serve para você
            ver como um processo fica organizado no LexLaboral.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link to="/cases/new">Criar meu primeiro caso</Link>
        </Button>
      </div>

      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Voltar">
          <Link to="/ajuda">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground">{c.title}</h1>
          <p className="text-sm text-muted-foreground">
            {c.processNumber} — {c.vara}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Caso" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Card title="Visão geral">
            <Row label="Fase" value={c.phase} />
            <Row label="Tipo de ação" value={c.actionType} />
            <Row label="Tribunal" value={c.court} />
            <Row label="Aberto em" value={c.openedAt} />
          </Card>
          <Card title="Partes">
            <Row label={c.client.role} value={c.client.name} />
            <Row label="CPF" value={c.client.document} />
            <Row label={c.defendant.role} value={c.defendant.name} />
            <Row label="CNPJ" value={c.defendant.document} />
          </Card>
          <Card title="Contrato de trabalho">
            <Row label="Admissão" value={c.contract.admission} />
            <Row label="Rescisão" value={c.contract.termination} />
            <Row label="Último salário" value={c.contract.lastSalary} />
            <Row label="Motivo" value={c.contract.terminationType} />
          </Card>
        </div>
      )}

      {tab === "Números" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Card title={`Cálculo — ${c.calculation.kind}`}>
            {c.calculation.lines.map((l) => (
              <Row key={l.label} label={l.label} value={l.value} />
            ))}
            <div className="flex items-baseline justify-between gap-4 pt-3">
              <span className="text-sm font-semibold text-foreground">
                Total
              </span>
              <span className="text-lg font-semibold text-foreground">
                {c.calculation.total}
              </span>
            </div>
          </Card>
          <Card title="Financeiro">
            <Row label="Honorário" value={c.fee.kind} />
            <Row label="Percentual" value={c.fee.percent} />
            <Row label="Estimativa" value={c.fee.estimate} />
          </Card>
        </div>
      )}

      {tab === "Prazos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Card title="Audiência">
            <Row label={c.hearing.kind} value={c.hearing.at} />
            <Row label="Local" value={c.hearing.place} />
          </Card>
          <Card title="Prazo">
            <Row label={c.deadline.kind} value={c.deadline.dueAt} />
            <Row label="Situação" value={c.deadline.status} />
          </Card>
          <Card title="Tarefa interna">
            <Row label={c.task.label} value={c.task.status} />
          </Card>
        </div>
      )}

      {tab === "Autos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Card title="Documento gerado">
            <Row label="Arquivo" value={c.document.name} />
            <Row label="Modelo" value={c.document.template} />
            <Row label="Gerado em" value={c.document.createdAt} />
          </Card>
          <Card title="Andamento processual">
            <Row label={c.movement.at} value={c.movement.description} />
          </Card>
        </div>
      )}
    </div>
  );
}
