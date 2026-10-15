import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CheckIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useResetPasswordClient } from "@/http/generated/client-portal/client-portal";
import { primaryColor, secondaryColor, secondaryHoverColor } from "@/utils/get-css";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/\d/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string().min(1, "Obrigatório"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function PortalResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // O token identifica o cliente sozinho — o `clientId` saiu do link e do corpo
  // de propósito: aceitá-lo deixaria quem tem um token trocar a senha alheia.
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const { mutateAsync: resetPassword, isPending } = useResetPasswordClient();

  async function onSubmit(data: FormData) {
    await resetPassword({ data: { token, newPassword: data.newPassword } });
    setDone(true);
  }

  if (!token) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Link inválido</h2>
          <p className="text-sm text-muted-foreground">
            O link de recuperação é inválido ou expirou. Solicite um novo.
          </p>
          <Button variant="outline" onClick={() => navigate("/portal/forgot-password")}>
            Solicitar novo link
          </Button>
        </div>
      </div>
    );
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
            <LockIcon className="w-7 h-7 text-white/80" />
          </div>
          <h1
            className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
          >
            Nova<br /><span className="text-blue-300">senha.</span>
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950 px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm space-y-8">
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Senha redefinida</h2>
              <p className="text-sm text-muted-foreground">
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </p>
              <Button onClick={() => navigate("/portal")}>Ir para login</Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Redefinir senha</h2>
                <p className="text-sm text-muted-foreground">Crie uma nova senha para sua conta.</p>
              </div>

              <form autoComplete="off" className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-3">
                  <Label className="text-sm font-medium" htmlFor="newPassword">Nova senha</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      {...form.register("newPassword")}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton type="button" size="icon-xs" variant="ghost" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {form.formState.errors.newPassword && (
                    <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium" htmlFor="confirmPassword">Confirmar senha</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      {...form.register("confirmPassword")}
                    />
                  </InputGroup>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button className="w-full gap-2" disabled={isPending} type="submit">
                  {isPending ? (
                    <><Loader2Icon className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><CheckIcon className="w-4 h-4" /> Redefinir senha</>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
