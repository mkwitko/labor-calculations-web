import { useState } from "react";
import { ChevronDownIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGenerateDocument } from "@/http/generated/labor-calculation/labor-calculation";
import { useListDocumentTemplates } from "@/http/generated/document-template/document-template";
import type { GetLaborCalculation200 } from "@/http/generated/lexlaboral-server.schemas";
import { exportLiquidationXlsx } from "../export-liquidation-xlsx";
import type { ResultV3 } from "../types";

type ExportType =
  | "parecer_tecnico"
  | "peticao_inicial"
  | "proposta_acordo"
  | "notificacao_extrajudicial"
  | "danos_morais"
  | "aviso_previo_indenizado"
  | "horas_extras_adicionais"
  | "fgts_e_multa"
  | "recurso_ordinario"
  | "contestacao"
  | "rescisao_indireta"
  | "termo_quitacao";

const TEMPLATE_TYPE_LABELS: Record<ExportType, string> = {
  parecer_tecnico: "Parecer Técnico",
  peticao_inicial: "Petição Inicial",
  proposta_acordo: "Proposta de Acordo",
  notificacao_extrajudicial: "Notificação Extrajudicial",
  danos_morais: "Danos Morais",
  aviso_previo_indenizado: "Aviso Prévio Indenizado",
  horas_extras_adicionais: "Horas Extras e Adicionais",
  fgts_e_multa: "FGTS e Multa",
  recurso_ordinario: "Recurso Ordinário",
  contestacao: "Contestação",
  rescisao_indireta: "Rescisão Indireta",
  termo_quitacao: "Termo de Quitação",
};

type Props = {
  calcId: string;
  calc: GetLaborCalculation200;
  resultV3: ResultV3 | null;
};

export function ExportMenu({ calcId, calc, resultV3 }: Props) {
  const [isExporting, setIsExporting] = useState<ExportType | null>(null);
  const [selectDialogType, setSelectDialogType] = useState<ExportType | null>(null);

  const { data: templates = [] } = useListDocumentTemplates(undefined);
  const { mutateAsync: generateDoc } = useGenerateDocument();

  const templatesForType = (type: ExportType) =>
    templates.filter((t) => t.type === type && t.fileKey);

  async function generate(templateId: string) {
    const result = await generateDoc({ id: calcId, data: { templateId } });
    const a = document.createElement("a");
    a.href = result.downloadUrl;
    a.download = result.fileName;
    a.click();
  }

  async function doExport(templateId: string) {
    setIsExporting(selectDialogType ?? ("parecer_tecnico" as ExportType));
    try {
      await generate(templateId);
    } catch {
      toast.error("Erro ao gerar documento. Tente novamente.");
    } finally {
      setIsExporting(null);
      setSelectDialogType(null);
    }
  }

  async function handleExport(templateType: ExportType) {
    const matching = templatesForType(templateType);
    if (matching.length === 0) {
      toast.error(
        "Nenhum template encontrado. Configure modelos de documento em Templates.",
      );
      return;
    }
    if (matching.length === 1) {
      setIsExporting(templateType);
      try {
        await generate(matching[0].id);
      } catch {
        toast.error("Erro ao gerar documento. Tente novamente.");
      } finally {
        setIsExporting(null);
      }
      return;
    }
    setSelectDialogType(templateType);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting !== null}>
            <span className="hidden sm:inline">
              {isExporting ? "Gerando..." : "Exportar"}
            </span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end">
          {resultV3 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Planilha
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  exportLiquidationXlsx(calc, resultV3).catch(() =>
                    toast.error("Erro ao gerar planilha"),
                  )
                }
              >
                <FileIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 truncate">Planilha de liquidação (XLSX)</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Modelos de Documento
          </DropdownMenuLabel>
          {(Object.keys(TEMPLATE_TYPE_LABELS) as ExportType[]).map((type) => {
            const count = templatesForType(type).length;
            return (
              <DropdownMenuItem
                key={type}
                onClick={() => handleExport(type)}
                disabled={isExporting !== null}
              >
                <FileIcon className="mr-2 h-4 w-4" />
                <span className="flex-1 truncate">
                  {isExporting === type ? "Gerando..." : TEMPLATE_TYPE_LABELS[type]}
                </span>
                {count > 1 && (
                  <span className="ml-1 text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectDialogType && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setSelectDialogType(null);
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Selecionar Template</DialogTitle>
              <DialogDescription>
                Escolha qual modelo de {TEMPLATE_TYPE_LABELS[selectDialogType]} usar
                para gerar o documento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1 py-2">
              {templatesForType(selectDialogType).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="w-full flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                  onClick={() => doExport(t.id)}
                  disabled={isExporting !== null}
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    {t.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {t.description}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                      t.isSystem
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.isSystem ? "Sistema" : "Customizado"}
                  </span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
