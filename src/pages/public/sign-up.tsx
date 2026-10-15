import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHoneypot } from "@/hooks/use-honeypot";
import { useCreateUser } from "@/http/generated/user/user";
import { maskCpf, maskPhone } from "@/pages/protected/calculations/new/components/common/form-utils";
import {
  primaryColor,
  secondaryColor,
  secondaryHoverColor,
} from "@/utils/get-css";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";


import { Logo } from "@/components/logo";
import { OAB_STATES } from "@/constants/brazil";
import { clearReferralCode, readReferralCode } from "@/lib/referral";
import { ReferralBanner } from "./components/referral-banner";
import { safeNextPath } from "@/utils/next-path";

const signUpForm = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    mail: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
    document: z.string().min(11, "Documento inválido"),
    oabState: z.string().min(2, "Selecione o estado"),
    oabNumber: z.string().min(1, "Número OAB obrigatório").regex(/^\d+$/, "Apenas números"),
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpForm>;

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Allowlist fechada de destinos internos — ver `safeNextPath`.
  const nextPath = safeNextPath(searchParams.get("next"));
  // The query string wins over the cookie so a link opened right now is
  // honoured even when an older code is still stored.
  const referralCode = searchParams.get("ref")?.toUpperCase() ?? readReferralCode();
  const { honeypotProps, isBot } = useHoneypot();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<SignUpForm>({
    resolver: standardSchemaResolver(signUpForm),
    defaultValues: {
      name: "",
      mail: "",
      phone: "",
      document: "",
      oabState: "",
      oabNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync: signUpAsync, isPending } = useCreateUser();

  async function onSubmit(data: SignUpForm) {
    if (isBot()) {
      toast.error("Verificação de segurança falhou. Tente novamente.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "As senhas não coincidem",
      });
      return;
    }
    await signUpAsync({
      data: {
        name: data.name,
        mail: data.mail,
        document: data.document,
        oabNumber: `${data.oabState}/${data.oabNumber}`,
        phone: data.phone || undefined,
        password: data.password,
        referralCode: referralCode ?? undefined,
      },
    });

    // The code has done its job; keeping it would attach it to whoever signs up
    // next on this browser.
    clearReferralCode();
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
            Comece sua
            <br />
            <span className="text-blue-300">jornada.</span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Crie sua conta gratuitamente e tenha acesso completo à plataforma em
            segundos.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 pt-2 text-left">
            {[
              "Acesso imediato após o cadastro",
              "Sem necessidade de cartão de crédito",
              "Suporte dedicado para novos usuários",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
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
          flex-1 flex items-start lg:items-center justify-center
          bg-white dark:bg-slate-950
          px-6 py-12 lg:px-12 overflow-y-auto
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
              Criar conta
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preencha os dados abaixo para se cadastrar
            </p>
          </div>

          {referralCode && <ReferralBanner code={referralCode} />}

          {/* Form */}
          <form
            autoComplete="off"
            className="space-y-4 overflow-y-auto max-h-[35rem]"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <input {...honeypotProps} />
            {/* Name */}
            <div className="space-y-3">
              <Label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="name"
              >
                Nome completo
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <UserIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  autoComplete="off"
                  id="name"
                  placeholder="Seu nome completo"
                  {...form.register("name")}
                />
              </InputGroup>
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

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

            {/* Documento */}
            <div className="space-y-3">
              <Label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="document"
              >
                CPF
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <UserIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <Controller
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <InputGroupInput
                      autoComplete="off"
                      id="document"
                      placeholder="000.000.000-00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskCpf(e.target.value))}
                    />
                  )}
                />
              </InputGroup>
              {form.formState.errors.document && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.document.message}
                </p>
              )}
            </div>

            {/* OAB */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                OAB
              </Label>
              <div className="flex gap-2">
                <Controller
                  control={form.control}
                  name="oabState"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-24 shrink-0">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {OAB_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputGroup className="flex-1">
                  <InputGroupAddon>
                    <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    autoComplete="off"
                    id="oabNumber"
                    placeholder="123456"
                    inputMode="numeric"
                    {...form.register("oabNumber")}
                  />
                </InputGroup>
              </div>
              {(form.formState.errors.oabState || form.formState.errors.oabNumber) && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.oabState?.message ?? form.formState.errors.oabNumber?.message}
                </p>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-3">
              <Label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="phone"
              >
                Telefone{" "}
                <span className="font-normal text-slate-400">(opcional)</span>
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <InputGroupInput
                      autoComplete="off"
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    />
                  )}
                />
              </InputGroup>
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="password"
              >
                Senha
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <LockIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  autoComplete="new-password"
                  id="password"
                  placeholder="Mín. 8 caracteres"
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

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="confirmPassword"
              >
                Confirmar senha
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <LockIcon className="w-4 h-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  autoComplete="new-password"
                  id="confirmPassword"
                  placeholder="Repita a senha"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  {...form.register("confirmPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() =>
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                    aria-label={isConfirmPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeOffIcon className="w-4 h-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms notice */}
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Ao criar uma conta, você concorda com nossos{" "}
              <button
                type="button"
                onClick={() => navigate("/terms")}
                className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
              >
                Termos de Uso
              </button>{" "}
              e{" "}
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
              >
                Política de Privacidade
              </button>
              .
            </p>

            {/* Submit */}
            <Button className="w-full gap-2" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
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

          {/* Sign In CTA */}
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Já tem uma conta?
            </p>
            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  // Preserva o convite pela cadeia cadastro → login → aceite:
                  // criar conta não abre sessão (o back não seta cookie).
                  nextPath
                    ? `/authentication?next=${encodeURIComponent(nextPath)}`
                    : "/authentication",
                )
              }
            >
              Entrar na plataforma
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
