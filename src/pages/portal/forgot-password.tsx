import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowLeftIcon, Loader2Icon, MailIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useForgotPasswordClient } from "@/http/generated/client-portal/client-portal";
import { primaryColor, secondaryColor, secondaryHoverColor } from "@/utils/get-css";

const schema = z.object({
  mail: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export default function PortalForgotPassword() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const form = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { mail: "" },
  });

  const { mutateAsync: forgotPassword, isPending } = useForgotPasswordClient();

  async function onSubmit(data: FormData) {
    await forgotPassword({ data: { mail: data.mail } });
    setSent(true);
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col lg:flex-row font-sans">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col items-center justify-center p-12"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              `radial-gradient(ellipse at 20% 50%, ${primaryColor} 0%, transparent 60%),` +
              `radial-gradient(ellipse at 80% 20%, ${secondaryColor} 0%, transparent 50%),` +
              `radial-gradient(ellipse at 60% 80%, ${secondaryHoverColor} 0%, transparent 55%)`,
          }}
        />
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/80" />
          </div>
          <h1
            className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
          >
            Recuperar<br /><span className="text-blue-300">senha.</span>
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950 px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex lg:hidden justify-center">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <div className="w-5 h-5 rounded bg-white/80" />
            </div>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <MailIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">E-mail enviado</h2>
              <p className="text-sm text-muted-foreground">
                Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.
                Cliente de mais de um escritório recebe um link para cada, com o nome do escritório
                no e-mail.
              </p>
              <Button variant="outline" onClick={() => navigate("/portal")} className="gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Voltar ao login
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Esqueceu a senha?</h2>
                <p className="text-sm text-muted-foreground">
                  Informe seu e-mail para receber as instruções de recuperação.
                </p>
              </div>

              <form autoComplete="off" className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-3">
                  <Label className="text-sm font-medium" htmlFor="mail">E-mail</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <MailIcon className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      autoComplete="off"
                      id="mail"
                      type="email"
                      placeholder="seu@email.com"
                      {...form.register("mail")}
                    />
                  </InputGroup>
                  {form.formState.errors.mail && (
                    <p className="text-xs text-red-500">{form.formState.errors.mail.message}</p>
                  )}
                </div>

                <Button className="w-full gap-2" disabled={isPending} type="submit">
                  {isPending ? (
                    <><Loader2Icon className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => navigate("/portal")}
                className="block mx-auto text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
