import {
  CheckCircle2Icon,
  EyeIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDownloadDocumentTemplate,
  useValidateDocumentTemplate,
} from "@/http/generated/document-template/document-template";

// Preview a template .docx rendered to HTML (mammoth) + a validation report
// (valid/invalid/missing placeholders) from the backend.
export function PreviewValidateDialog({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { refetch: fetchDownload } = useDownloadDocumentTemplate(templateId, {
    query: { enabled: false },
  });
  const { mutateAsync: validate, data: validation } =
    useValidateDocumentTemplate();

  const load = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const [{ data: dl }] = await Promise.all([
        fetchDownload(),
        validate({ id: templateId }).catch(() => undefined),
      ]);
      if (dl?.downloadUrl) {
        const res = await fetch(dl.downloadUrl);
        const buffer = await res.arrayBuffer();
        // Lazy-load the heavy docx→HTML + sanitizer libs only on preview.
        const [mammoth, { default: DOMPurify }] = await Promise.all([
          import("mammoth"),
          import("dompurify"),
        ]);
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setHtml(DOMPurify.sanitize(result.value));
      }
    } catch {
      toast.error("Não foi possível carregar o preview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Pré-visualizar e validar"
        title="Pré-visualizar e validar"
        onClick={load}
      >
        <EyeIcon className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className=" max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{templateName}</DialogTitle>
          </DialogHeader>

          {validation && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${validation.valid
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
              >
                {validation.valid ? (
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                ) : (
                  <XCircleIcon className="w-3.5 h-3.5" />
                )}
                {validation.valid ? "Válido" : "Atenção"}
              </span>
              {validation.invalidPlaceholders.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                  Inválidos: {validation.invalidPlaceholders.join(", ")}
                </span>
              )}
              {validation.missingRequired.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  Faltando: {validation.missingRequired.join(", ")}
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2Icon className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : html ? (
            <div
              className="prose prose-sm max-w-none border border-border rounded-lg p-6 bg-white text-black"
              // sanitized with DOMPurify above before rendering
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem conteúdo para pré-visualizar.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
