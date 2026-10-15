import { Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendReferralInvite } from "@/http/generated/referral/referral";

export function InviteForm({ onInvited }: { onInvited: () => void }) {
  const [email, setEmail] = useState("");

  const { mutateAsync: invite, isPending } = useSendReferralInvite();

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await invite({ data: { email } });
      setEmail("");
      toast.success("Convite enviado");
      onInvited();
    } catch {
      // The API rejects duplicates and already-registered e-mails; the message
      // it returns is surfaced by the global error handler.
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-1">
            <Label htmlFor="invite-email">Convidar por e-mail</Label>
            <p className="text-sm text-muted-foreground">
              O colega recebe o convite com seu nome e seu link.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="colega@escritorio.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={isPending || !email}>
              {isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
              Enviar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
