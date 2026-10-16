import { useRef, useState } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getListDocumentTemplatesQueryKey,
  useCreateDocumentTemplate,
  useValidateDocumentTemplate,
} from "@/http/generated/document-template/document-template";
import type { CreateDocumentTemplateBodyType } from "@/http/generated/labor-calculations-api.schemas";
import { AXIOS_INSTANCE } from "@/lib/api";
import { queryClient } from "@/lib/react-query";
import { DOCX_MIME, MAX_FILE_BYTES, TYPE_LABELS } from "../shared";

export function CreateTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("customizado");
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutateAsync: validate } = useValidateDocumentTemplate();

  const { mutate: createTemplate, isPending: isCreating } =
    useCreateDocumentTemplate({
      mutation: {
        onSuccess: async (result) => {
          if (selectedFile && result.id) {
            try {
              const { data: uploadData } = await AXIOS_INSTANCE.post(
                `/document-templates/${result.id}/upload-url`,
                {
                  mimeType: DOCX_MIME,
                  sizeBytes: selectedFile.size,
                }
              );
              await fetch(uploadData.uploadUrl, {
                method: "PUT",
                body: selectedFile,
                headers: { "Content-Type": DOCX_MIME },
              });

              const validation = await validate({ id: result.id });
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
                toast.warning(`Template criado, mas com problemas — ${parts.join(" | ")}`);
              } else {
                toast("Template criado com arquivo — placeholders OK");
              }
            } catch {
              toast.error("Template criado, mas falha ao enviar arquivo");
            }
          } else {
            toast("Template criado");
          }
          queryClient.invalidateQueries({
            queryKey: getListDocumentTemplatesQueryKey(),
          });
          resetForm();
          setOpen(false);
        },
        onError: () => toast.error("Erro ao criar template"),
      },
    });

  function resetForm() {
    setName("");
    setDescription("");
    setType("customizado");
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createTemplate({
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
        type: type as CreateDocumentTemplateBodyType,
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Template</DialogTitle>
            <DialogDescription>
              Anexe um documento .docx com campos entre chaves. Ao gerar, cada
              campo é substituído pelo dado real do cálculo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">Nome</Label>
              <Input
                id="tpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Petição Inicial Personalizada"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpl-type">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="tpl-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpl-desc">Descrição</Label>
              <Textarea
                id="tpl-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional do template..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Arquivo .docx</Label>
              <input
                ref={fileRef}
                type="file"
                accept=".docx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > MAX_FILE_BYTES) {
                    toast.error("Arquivo excede 5MB");
                    e.target.value = "";
                    return;
                  }
                  setSelectedFile(f ?? null);
                }}
                className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                No .docx, escreva os campos entre chaves onde o dado deve
                aparecer — ex: {`{clientName}`}, {`{totalValue}`},{" "}
                {`{lawyerName}`}. Veja a lista completa em “Referência de
                Placeholders”. Máx. 5MB.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
