import { useState, useEffect } from "react";
import { Share2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useShareLaborCalculation } from "@/http/generated/labor-calculation/labor-calculation";

interface ShareDialogProps {
  calculationId: string;
  clientDocument?: string;
}

export function ShareDialog({
  calculationId,
  clientDocument,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareOption, setShareOption] = useState<"cpf" | "custom">("cpf");
  const [customCode, setCustomCode] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const getLastFiveDigits = (doc?: string) => {
    if (!doc) return "";
    const cleaned = doc.replace(/\D/g, "");
    return cleaned.slice(-5);
  };

  const lastFiveDigits = getLastFiveDigits(clientDocument);
  const hasCpf = lastFiveDigits.length === 5;

  useEffect(() => {
    if (!hasCpf) setShareOption("custom");
  }, [hasCpf]);

  const { mutateAsync: createShare, isPending } = useShareLaborCalculation({
    mutation: {
      onSuccess: () => {
        const url = `${window.location.origin}/share/${calculationId}`;
        setShareUrl(url);
        toast.success("Link criado com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao criar link");
      },
    },
  });

  async function handleCreateShare() {
    const code = shareOption === "cpf" ? lastFiveDigits : customCode;

    if (!code || code.length < 4) {
      toast.error("O código deve ter pelo menos 4 caracteres");
      return;
    }

    try {
      await createShare({
        id: calculationId,
        data: { shareCode: code },
      });
    } catch {}
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2Icon className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Cálculo</DialogTitle>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Crie um link compartilhável para que outros usuários possam
              visualizar este cálculo sem fazer login.
            </p>

            <div className="space-y-3">
              {hasCpf && (
                <button
                  type="button"
                  onClick={() => setShareOption("cpf")}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    shareOption === "cpf"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <p className="text-sm font-normal">
                    Usar 5 últimos dígitos do CPF ({lastFiveDigits})
                  </p>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShareOption("custom")}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  shareOption === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                }`}
              >
                <p className="text-sm font-normal">
                  Definir uma senha personalizada
                </p>
              </button>
            </div>

            {shareOption === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="code">Senha de acesso</Label>
                <Input
                  id="code"
                  placeholder="Mínimo 4 caracteres"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={handleCreateShare}
              disabled={
                isPending || (shareOption === "custom" && customCode.length < 4)
              }
              className="w-full"
            >
              {isPending ? "Criando..." : "Gerar Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com a senha:{" "}
              <strong>
                {shareOption === "cpf" ? lastFiveDigits : customCode}
              </strong>
            </p>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button onClick={copyToClipboard} variant="secondary">
                Copiar Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              A senha não está no link. Você deve informar a senha separadamente.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
