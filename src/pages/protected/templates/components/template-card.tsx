import { useRef, useState } from "react";
import {
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  Loader2Icon,
  PencilIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getListDocumentTemplatesQueryKey,
  useDeleteDocumentTemplate,
  useDownloadDocumentTemplate,
  useDuplicateDocumentTemplate,
  useUpdateDocumentTemplate,
  useValidateDocumentTemplate,
} from "@/http/generated/document-template/document-template";
import { AXIOS_INSTANCE } from "@/lib/api";
import { queryClient } from "@/lib/react-query";
import { DOCX_MIME, MAX_FILE_BYTES, TYPE_LABELS, type TemplateItem } from "../shared";
import { GenerateDocumentDialog } from "./generate-document-dialog";
import { PreviewValidateDialog } from "./preview-validate-dialog";

function invalidate() {
  queryClient.invalidateQueries({ queryKey: getListDocumentTemplatesQueryKey() });
}

function UploadFileButton({ template }: { template: TemplateItem }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: validate } = useValidateDocumentTemplate();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Arquivo excede 5MB");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const { data: uploadData } = await AXIOS_INSTANCE.post(
        `/document-templates/${template.id}/upload-url`,
        { mimeType: DOCX_MIME, sizeBytes: file.size }
      );

      if (uploadData?.message) {
        toast.error(uploadData.message);
        return;
      }

      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": DOCX_MIME },
      });

      const validation = await validate({ id: template.id });

      if (!validation.valid) {
        const parts: string[] = [];
        if (validation.invalidPlaceholders.length > 0) {
          parts.push(`inválidos: ${validation.invalidPlaceholders.map((p: string) => `{${p}}`).join(", ")}`);
        }
        if (validation.missingRequired.length > 0) {
          parts.push(`obrigatórios faltando: ${validation.missingRequired.map((p: string) => `{${p}}`).join(", ")}`);
        }
        if (validation.placeholders.length === 0) {
          parts.unshift("Nenhuma tag encontrada no documento");
        }
        toast.warning(`Problemas no template — ${parts.join(" | ")}`);
      } else {
        toast("Arquivo enviado — placeholders OK");
      }

      invalidate();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(msg ?? "Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isUploading || template.isSystem}
      onClick={() => fileRef.current?.click()}
      title={template.isSystem ? "Duplique o template primeiro" : "Enviar arquivo .docx"}
    >
      {isUploading ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <UploadIcon className="w-4 h-4" />
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={handleFileChange}
      />
    </Button>
  );
}

function EditTemplateNameDialog({ template }: { template: TemplateItem }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");

  const { mutate: update, isPending } = useUpdateDocumentTemplate({
    mutation: {
      onSuccess: () => {
        toast("Template atualizado");
        invalidate();
        setOpen(false);
      },
      onError: () => toast.error("Erro ao atualizar template"),
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    update({
      id: template.id,
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <PencilIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>Altere o nome e descrição do template</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descrição</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTemplateButton({ template }: { template: TemplateItem }) {
  const { mutate: deleteTemplate, isPending } = useDeleteDocumentTemplate({
    mutation: {
      onSuccess: () => {
        toast("Template excluído");
        invalidate();
      },
      onError: () => toast.error("Erro ao excluir template"),
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <TrashIcon className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir template?</AlertDialogTitle>
          <AlertDialogDescription>
            O template &ldquo;{template.name}&rdquo; será excluído permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteTemplate({ id: template.id })}
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DownloadReferenceButton({ template }: { template: TemplateItem }) {
  const { refetch, isFetching } = useDownloadDocumentTemplate(template.id, {
    query: { enabled: false },
  });

  async function handleDownload() {
    const { data } = await refetch();
    if (data?.downloadUrl) {
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = `${template.name}.docx`;
      a.target = "_blank";
      a.click();
    } else {
      toast.error("Erro ao obter link de download");
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isFetching || !template.fileKey}
      onClick={handleDownload}
      title="Baixar referência"
    >
      {isFetching ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <DownloadIcon className="w-4 h-4" />
      )}
    </Button>
  );
}

function DuplicateTemplateButton({ template }: { template: TemplateItem }) {
  const { mutate: duplicate, isPending } = useDuplicateDocumentTemplate({
    mutation: {
      onSuccess: () => {
        toast("Cópia criada como template customizado");
        invalidate();
      },
      onError: () => toast.error("Erro ao duplicar template"),
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() =>
        duplicate({
          id: template.id,
          data: { name: `${template.name} (cópia)` },
        })
      }
      title="Criar cópia"
    >
      {isPending ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <CopyIcon className="w-4 h-4" />
      )}
    </Button>
  );
}

export function TemplateCard({ template }: { template: TemplateItem }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground truncate">
              {template.name}
            </h3>
            {template.isSystem && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                Sistema
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="mt-1.5 text-[10px]">
            {TYPE_LABELS[template.type] ?? template.type}
          </Badge>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {template.fileKey && (
            <>
              <PreviewValidateDialog
                templateId={template.id}
                templateName={template.name}
              />
              <GenerateDocumentDialog
                templateId={template.id}
                templateName={template.name}
              />
            </>
          )}
          <DownloadReferenceButton template={template} />
          {template.isSystem && <DuplicateTemplateButton template={template} />}
          {!template.isSystem && (
            <>
              <UploadFileButton template={template} />
              <EditTemplateNameDialog template={template} />
              <DeleteTemplateButton template={template} />
            </>
          )}
        </div>
      </div>

      {template.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      )}

      {!template.isSystem && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileTextIcon className="w-3.5 h-3.5" />
          <span>
            {template.fileKey ? "Arquivo .docx vinculado" : "Sem arquivo vinculado"}
          </span>
        </div>
      )}
    </div>
  );
}
