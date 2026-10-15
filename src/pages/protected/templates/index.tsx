import { useEffect, useState } from "react";
import {
  FileTextIcon,
  Loader2Icon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { useListDocumentTemplates } from "@/http/generated/document-template/document-template";
import { useProductTour } from "@/hooks/use-product-tour";
import { CreateTemplateDialog } from "./components/create-template-dialog";
import { PlaceholderPanel } from "./components/placeholder-panel";
import { TemplateCard } from "./components/template-card";
import { TemplatesGuide } from "./components/templates-guide";
import { TYPE_LABELS, type TemplateItem } from "./shared";

export default function Templates() {
  const [query, setQuery] = useState("");
  const { startTemplatesTourIfFirstVisit } = useProductTour();

  useEffect(() => {
    startTemplatesTourIfFirstVisit();
  }, [startTemplatesTourIfFirstVisit]);

  const { data: templates, isLoading } = useListDocumentTemplates(undefined);

  const items = (templates ?? []) as TemplateItem[];

  const filtered = query.trim()
    ? items.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          (t.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
          TYPE_LABELS[t.type]?.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  const systemTemplates = filtered.filter((t) => t.isSystem);
  const customTemplates = filtered.filter((t) => !t.isSystem);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Templates de Documento"
        subtitle="Gerencie modelos .docx para geração de documentos"
        actions={
          <div
            className="flex items-center gap-2"
            data-tour="templates-placeholders"
          >
            <PlaceholderPanel />
            <CreateTemplateDialog />
          </div>
        }
      />

      <TemplatesGuide />

      <div className="relative max-w-sm" data-tour="templates-list">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        query ? (
          <EmptyState
            icon={FileTextIcon}
            title="Nenhum template encontrado"
            description="Tente outro termo de busca."
          />
        ) : (
          <EmptyState
            icon={FileTextIcon}
            title="Monte sua biblioteca de modelos"
            description="Use os modelos do sistema ou envie os seus em .docx. Os campos entre chaves são preenchidos com dados do cliente, do caso e do cálculo."
            helpArticle="templates-e-placeholders"
          />
        )
      ) : (
        <div className="space-y-6">
          {systemTemplates.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheckIcon className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Templates do Sistema
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {systemTemplates.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>
            </section>
          )}

          {customTemplates.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Templates Customizados
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {customTemplates.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
