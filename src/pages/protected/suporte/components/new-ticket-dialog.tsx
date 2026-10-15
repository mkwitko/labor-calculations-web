import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSupportTicket,
  useGetSupportUploadUrl,
} from "@/http/generated/support/support";
import { cn } from "@/lib/utils";
import { KIND_DESCRIPTIONS, KIND_LABELS, type SupportKind } from "../labels";
import { useSupportUpload } from "../use-support-upload";
import { AttachmentPicker, PendingAttachments } from "./attachment-picker";

const KINDS: SupportKind[] = ["duvida", "problema", "sugestao"];

const MAX_BODY = 5_000;

/**
 * Abrir chamado.
 *
 * O contexto (rota de onde saiu, versão, navegador) vai junto sem ninguém
 * digitar: é o que evita a primeira rodada de "em que tela foi?" em todo
 * atendimento.
 */
export function NewTicketDialog({
  open,
  onOpenChange,
  onCreated,
  defaultKind = "duvida",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (ticketId: string) => void;
  defaultKind?: SupportKind;
}) {
  const location = useLocation();
  const [kind, setKind] = useState<SupportKind>(defaultKind);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { mutateAsync: create, isPending } = useCreateSupportTicket();
  const { mutateAsync: requestUploadUrl } = useGetSupportUploadUrl();

  const upload = useSupportUpload((file) =>
    requestUploadUrl({ data: file }).then((result) => ({
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
    })),
  );

  // O tipo escolhido no atalho ("Tenho uma ideia") só chega como prop, e prop
  // não reescreve estado: sem isto, o diálogo abria sempre no tipo da primeira
  // montagem e o atalho de sugestão caía em "Dúvida".
  useEffect(() => {
    if (open) setKind(defaultKind);
  }, [open, defaultKind]);

  function reset() {
    setKind(defaultKind);
    setSubject("");
    setBody("");
    upload.reset();
  }

  async function submit() {
    if (subject.trim().length < 3 || !body.trim() || upload.uploading) return;

    try {
      const created = await create({
        data: {
          kind,
          subject: subject.trim(),
          body: body.trim(),
          context: {
            // A rota anterior, não `/suporte`: o que interessa é onde a pessoa
            // estava quando o problema apareceu.
            path:
              (location.state as { from?: string })?.from ?? location.pathname,
            userAgent: navigator.userAgent.slice(0, 400),
          },
          attachments: upload.attachments,
        },
      });

      toast.success(
        kind === "sugestao"
          ? "Sugestão enviada. Você acompanha o andamento por aqui."
          : "Chamado aberto. Respondemos por aqui e por e-mail.",
      );
      reset();
      onOpenChange(false);
      onCreated(created.id);
    } catch {
      toast.error("Não conseguimos enviar agora. Tente de novo em instantes.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Falar com o LexLaboral</DialogTitle>
          <DialogDescription>
            Respondemos aqui dentro e avisamos por e-mail quando houver resposta.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium text-sm">
            Sobre o que você quer falar?
          </legend>
          <div className="grid gap-2">
            {KINDS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                aria-pressed={kind === option}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition-colors",
                  kind === option
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <span className="font-medium text-sm">
                  {KIND_LABELS[option]}
                </span>
                <span className="block text-muted-foreground text-xs">
                  {KIND_DESCRIPTIONS[option]}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="support-subject">Assunto</Label>
          <Input
            id="support-subject"
            value={subject}
            maxLength={160}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={
              kind === "sugestao"
                ? "Ex.: importar a planilha de cálculo do TRT"
                : "Ex.: o total da liquidação não bate com o demonstrativo"
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-body">
            {kind === "problema"
              ? "O que aconteceu, e o que você esperava?"
              : "Conte com as suas palavras"}
          </Label>
          <Textarea
            id="support-body"
            value={body}
            maxLength={MAX_BODY}
            rows={6}
            onChange={(event) => setBody(event.target.value)}
            placeholder={
              kind === "problema"
                ? "Se puder, diga o número do cálculo ou do caso — a gente chega mais rápido."
                : ""
            }
          />
          <p className="text-right text-muted-foreground text-xs">
            {body.length}/{MAX_BODY}
          </p>
        </div>

        <div className="space-y-2">
          <PendingAttachments
            pending={upload.pending}
            onRemove={upload.remove}
          />
          <div className="flex items-center gap-2">
            <AttachmentPicker onAdd={upload.add} disabled={isPending} />
            <span className="text-muted-foreground text-xs">
              Print, vídeo da tela ou documento — até 5 arquivos, 25MB cada.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={
              isPending ||
              upload.uploading ||
              subject.trim().length < 3 ||
              !body.trim()
            }
          >
            {isPending ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
