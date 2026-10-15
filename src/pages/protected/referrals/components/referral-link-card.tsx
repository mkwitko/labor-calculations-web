import { CheckIcon, CopyIcon, MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function whatsappUrl(link: string): string {
  const message = `Uso o LexLaboral para cálculos trabalhistas e gestão de casos. Entrando por este link você recebe de volta o valor da primeira mensalidade: ${link}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function ReferralLinkCard({
  code,
  link,
}: {
  code: string;
  link: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Seu link</p>
          <p className="text-sm text-muted-foreground">
            Código <span className="font-mono font-medium">{code}</span> — vale
            para sempre, pode compartilhar em grupos.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={link} className="font-mono text-sm" />
          <div className="flex gap-2">
            <Button onClick={copy} variant="secondary" className="flex-1 sm:flex-none">
              {copied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              Copiar
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <a href={whatsappUrl(link)} target="_blank" rel="noreferrer">
                <MessageCircleIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
