import { FileDownIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateDocumentFromTemplate } from "@/http/generated/document-template/document-template";
import { useListLaborCalculation } from "@/http/generated/labor-calculation/labor-calculation";

// Generate a document from a template using a selected calculation (which
// auto-resolves its linked case + client on the backend), then download it.
export function GenerateDocumentDialog({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const [open, setOpen] = useState(false);
  const [calculationId, setCalculationId] = useState<string>("");

  const { data: calcData } = useListLaborCalculation(
    { limit: 50 },
    { query: { enabled: open } },
  );
  const calculations = calcData?.data ?? [];

  const { mutateAsync: generate, isPending } = useGenerateDocumentFromTemplate();

  const handleGenerate = async () => {
    if (!calculationId) return;
    try {
      const result = await generate({
        id: templateId,
        data: { calculationId },
      });
      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Documento gerado");
      setOpen(false);
    } catch {
      toast.error(
        "Não foi possível gerar. Verifique se o cálculo cobre os campos do template.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Gerar documento" title="Gerar documento">
          <SparklesIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar documento</DialogTitle>
          <DialogDescription>
            Gerar <strong>{templateName}</strong> a partir de um cálculo. Os
            dados do caso e do cliente vinculados são preenchidos
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Select value={calculationId} onValueChange={setCalculationId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cálculo" />
            </SelectTrigger>
            <SelectContent>
              {calculations.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.clientName} ·{" "}
                  {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {calculations.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Nenhum cálculo disponível. Crie um cálculo primeiro.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={!calculationId || isPending}
          >
            {isPending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <FileDownIcon className="w-4 h-4" />
            )}
            Gerar e baixar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
