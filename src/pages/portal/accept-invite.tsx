import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  Loader2Icon,
  LockIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  useAcceptClientPortalInvite,
  useGetClientPortalInvite,
  useLinkClientPortalInvite,
} from "@/http/generated/client-portal/client-portal";

const createSchema = z
  .object({
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/\d/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string().min(1, "Obrigatório"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Senha que já existe: exigir a força atual recusaria a senha de quem a criou
// antes da regra — a mesma razão pela qual o back valida só `min(1)` aqui.
const linkSchema = z.object({
  password: z.string().min(1, "Obrigatório"),
  // O campo não aparece no vínculo — fica no schema só para os dois caminhos
  // compartilharem o mesmo tipo de formulário.
  confirmPassword: z.string(),
});

type FormData = z.infer<typeof createSchema>;

export default function PortalAcceptInvite() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const { data, isLoading, isError } = useGetClientPortalInvite(token, {
    query: { enabled: Boolean(token), retry: false },
  });

  // Três telas saem do mesmo link. `alreadyActive` é cadastro que já tem senha:
  // o convite não serve mais para nada e pedir senha nova aqui seria trocar a
  // senha em uso sem a pessoa provar quem é. `hasOtherAccounts` é o mesmo
  // e-mail com conta em outro escritório: pedimos a senha que ela **já** usa e
  // o aceite vira vínculo, para um login só valer nos dois escritórios.
  const isLinking = Boolean(data?.hasOtherAccounts);

  const form = useForm<FormData>({
    resolver: standardSchemaResolver(isLinking ? linkSchema : createSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutateAsync: acceptInvite, isPending: isAccepting } =
    useAcceptClientPortalInvite();
  const { mutateAsync: linkInvite, isPending: isLinkPending } =
    useLinkClientPortalInvite();

  const isPending = isAccepting || isLinkPending;

  async function onSubmit(values: FormData) {
    // O erro já vira toast no interceptor do axios; aqui só não deixamos a
    // recusa marcar a tela como concluída.
    try {
      if (isLinking) {
        await linkInvite({ data: { token, password: values.password } });
      } else {
        await acceptInvite({ data: { token, password: values.password } });
      }
      setDone(true);
    } catch {
      form.resetField("password");
      form.resetField("confirmPassword");
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Link inválido
          </h2>
          <p className="text-sm text-muted-foreground">
            Este link de primeiro acesso é inválido ou já expirou. Peça um novo
            ao seu advogado.
          </p>
          <Button variant="outline" onClick={() => navigate("/portal")}>
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  if (data.alreadyActive) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Você já tem acesso
          </h2>
          <p className="text-sm text-muted-foreground">
            Este e-mail já tem senha no portal de {data.officeName}. Entre com a
            senha que você usa — se não lembrar, use "esqueci minha senha".
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/portal")}>
              Entrar no portal
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/portal/forgot-password")}
            >
              Esqueci minha senha
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        {done ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Tudo pronto
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLinking
                ? `${data.officeName} agora aparece no seu login. Entre com a senha que você já usa.`
                : "Sua senha foi criada. Entre no portal para acompanhar o seu processo."}
            </p>
            <Button onClick={() => navigate("/portal")}>Entrar no portal</Button>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center">
              {data.logoUrl && (
                <img
                  src={data.logoUrl}
                  alt={data.officeName}
                  className="mx-auto h-12 object-contain"
                />
              )}
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Olá, {data.clientName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLinking
                  ? `${data.officeName} criou seu acesso ao portal. Confirme a senha que você já usa para liberá-lo.`
                  : `${data.officeName} criou seu acesso ao portal. Escolha uma senha para entrar.`}
              </p>
            </div>

            {/*
              Texto fixo quando não há outra conta de portal: quem também é
              advogado no JurisPro estranha ter senha pedida de novo, e o portal
              é login separado mesmo. Fixo de propósito — condicionar a existir
              conta de advogado com este e-mail contaria isso a quem tem o link.
            */}
            <div className="flex gap-2.5 rounded-lg border border-border bg-muted/50 p-3">
              <InfoIcon className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {isLinking
                  ? "Você já usa o portal com este e-mail em outro escritório. Digite essa mesma senha: um login só passa a valer para todos."
                  : "A senha do portal é separada de qualquer outra senha que você use no JurisPro."}
              </p>
            </div>

            <form
              autoComplete="off"
              className="space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-3">
                <Label className="text-sm font-medium" htmlFor="password">
                  {isLinking ? "Sua senha do portal" : "Sua senha"}
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <LockIcon className="w-4 h-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isLinking
                        ? "A senha que você já usa"
                        : "Mínimo 8 caracteres"
                    }
                    {...form.register("password")}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeOffIcon className="w-4 h-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {!isLinking && (
                <div className="space-y-3">
                  <Label
                    className="text-sm font-medium"
                    htmlFor="confirmPassword"
                  >
                    Confirmar senha
                  </Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      {...form.register("confirmPassword")}
                    />
                  </InputGroup>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              <Button className="w-full gap-2" disabled={isPending} type="submit">
                {isPending ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    {isLinking ? "Liberar meu acesso" : "Criar minha senha"}
                  </>
                )}
              </Button>
            </form>

            {isLinking && (
              <button
                type="button"
                onClick={() => navigate("/portal/forgot-password")}
                className="block mx-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Não lembro a senha que uso
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
