import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/http/generated/auth/auth";
import { SIGN_OUT_REASON_KEY } from "@/lib/api";
import { queryClient } from "@/lib/react-query";
import { apiErrorMessage } from "@/utils/api-error";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { useHoneypot } from "@/hooks/use-honeypot";
import {
  primaryColor,
  secondaryColor,
  secondaryHoverColor,
} from "@/utils/get-css";
import { safeNextPath } from "@/utils/next-path";

const signInForm = z.object({
  mail: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type SignInForm = z.infer<typeof signInForm>;

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Allowlist fechada de destinos internos — ver `safeNextPath`.
  const nextPath = safeNextPath(searchParams.get("next"));
  const { honeypotProps, isBot } = useHoneypot();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Quem chega aqui expulso por uma sessão que deixou de valer merece saber por
  // quê. A chave é consumida na leitura: recarregar a tela não repete o aviso.
  useEffect(() => {
    const reason = sessionStorage.getItem(SIGN_OUT_REASON_KEY);
    if (!reason) return;
    sessionStorage.removeItem(SIGN_OUT_REASON_KEY);
    toast.info(reason);
  }, []);

  const form = useForm<SignInForm>({
    resolver: standardSchemaResolver(signInForm),
    defaultValues: { password: "", mail: "" },
  });

  const { mutateAsync: signInAsync, isPending } = useSignIn({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        navigate(nextPath ?? "/home", { replace: true });
      },
      // Sem isto o login falhava calado: o toast global do interceptor só
      // dispara quando o back marca `showError`, e nem 429, nem 5xx, nem queda
      // de rede passam por ali.
      onError: (error) => {
        const message = apiErrorMessage(error, "Não foi possível entrar.");
        if (message) toast.error(message);
      },
    },
  });

  async function onSubmit(data: SignInForm) {
    if (isBot()) {
      toast.error("Verificação de segurança falhou. Tente novamente.");
      return;
    }

    // `onError` já avisou o usuário; sem o catch a rejeição sobe como
    // unhandled e polui o console.
    await signInAsync({ data }).catch(() => {});
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col lg:flex-row font-sans">
      {/* ── Left panel: visual/branding ── */}
      <div
        className="
          hidden lg:flex
          lg:w-1/2
          relative overflow-hidden
          bg-slate-900
          flex-col items-center justify-center
          p-12
        "
      >
        {/* Decorative mesh background */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              `radial-gradient(ellipse at 20% 50%, ${primaryColor} 0%, transparent 60%),` +
              `radial-gradient(ellipse at 80% 20%, ${secondaryColor} 0%, transparent 50%),` +
              `radial-gradient(ellipse at 60% 80%, ${secondaryHoverColor} 0%, transparent 55%)`,
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating abstract shapes */}
        <div className="absolute top-16 right-16 w-32 h-32 rounded-full border border-white/10 animate-pulse" />
        <div className="absolute bottom-24 left-12 w-20 h-20 rounded-full border border-white/10 animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 right-8 w-12 h-12 rotate-45 border border-white/10" />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center space-y-6">
          {/* Logo */}
          <img
            src="/logo-white.png"
            alt="Lex Laboral"
            className="mx-auto w-14 h-14 mb-8 object-contain"
          />

          <h1
            className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
          >
            Bem‑vindo de
            <br />
            <span className="text-blue-300">volta.</span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Acesse sua conta para continuar de onde parou e gerenciar tudo em um
            só lugar.
          </p>

          {/* Social proof chips */}
          <div className="flex items-center justify-center gap-3 pt-4">
            {["Seguro", "Confiável", "Rápido"].map((tag) => (
              <span
                key={tag}
                className="
                  px-3 py-1 rounded-full text-xs font-medium
                  bg-white/10 text-white/70 border border-white/10
                  backdrop-blur
                "
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <p className="absolute bottom-6 text-slate-500 text-xs">
          © {new Date().getFullYear()} Sua Empresa. Todos os direitos
          reservados.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div
        className="
          flex-1 flex items-center justify-center
          bg-white dark:bg-slate-950
          px-6 py-12 lg:px-12
        "
      >
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile-only logo */}
          <div className="flex lg:hidden justify-center">
            <Logo className="w-10 h-10" />
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Acessar plataforma
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preencha suas credenciais para continuar
            </p>
          </div>

          {/* Form */}
          <form
            autoComplete="off"
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <input {...honeypotProps} />
            {/* E-mail */}
            <div className="space-y-3">
              <Label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="mail"
              >
                E-mail
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  autoComplete="off"
                  id="mail"
                  placeholder="seu@email.com"
                  type="email"
                  {...form.register("mail")}
                />
              </InputGroup>
              {form.formState.errors.mail && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.mail.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="
                    text-xs text-blue-600 dark:text-blue-400
                    hover:text-blue-700 dark:hover:text-blue-300
                    hover:underline underline-offset-2
                    transition-colors
                  "
                >
                  Esqueci minha senha
                </button>
              </div>
              <InputGroup>
                <InputGroupAddon>
                  <LockIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  autoComplete="new-password"
                  id="password"
                  placeholder="••••••••"
                  type={isPasswordVisible ? "text" : "password"}
                  {...form.register("password")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                    aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {isPasswordVisible ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeOffIcon className="w-4 h-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button className="w-full gap-2" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-950 px-2 text-slate-400">
                ou
              </span>
            </div>
          </div>

          {/* Register CTA */}
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ainda não tem uma conta?
            </p>
            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={() => navigate("sign-up")}
            >
              Criar conta gratuitamente
            </Button>
          </div>

          {/* Client portal CTA */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/portal")}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              É um cliente? Acesse o portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
