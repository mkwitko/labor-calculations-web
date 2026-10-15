import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type { SignInClient201OrganizationsItem } from "@/http/generated/lexlaboral-server.schemas";
import {
  getCheckClientAuthQueryKey,
  useCheckClientAuth,
  useSignInClient,
} from "@/http/generated/client-portal/client-portal";
import { SIGN_OUT_REASON_KEY } from "@/lib/api";
import { queryClient } from "@/lib/react-query";
import {
  primaryColor,
  secondaryColor,
  secondaryHoverColor,
} from "@/utils/get-css";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  mail: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function PortalLogin() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Preenchido só quando o mesmo e-mail e senha valem em mais de um
  // escritório: aí a pessoa escolhe qual e o login vai de novo, com o id.
  const [offices, setOffices] = useState<
    SignInClient201OrganizationsItem[] | null
  >(null);
  const { data: authData, isFetching: isCheckingAuth } = useCheckClientAuth();

  // Mesmo aviso do login do advogado: quem é mandado para cá por sessão que
  // deixou de valer (ou conta bloqueada) precisa saber por quê. A chave é
  // consumida na leitura, então recarregar não repete o aviso.
  useEffect(() => {
    const reason = sessionStorage.getItem(SIGN_OUT_REASON_KEY);
    if (!reason) return;
    sessionStorage.removeItem(SIGN_OUT_REASON_KEY);
    toast.info(reason);
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;
    if (authData?.isAuthenticated) {
      if (authData.mustChangePassword) {
        navigate("/portal/change-password", { replace: true });
      } else {
        navigate("/portal/inicio", { replace: true });
      }
    }
  }, [isCheckingAuth, authData?.isAuthenticated, authData?.mustChangePassword]);

  const form = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { mail: "", password: "" },
  });

  const { mutateAsync: signIn, isPending } = useSignInClient({
    mutation: {
      onSuccess: async (data) => {
        if (data.status === "choose_organization") {
          setOffices(data.organizations);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: getCheckClientAuthQueryKey() });
        if (data.mustChangePassword) {
          navigate("/portal/change-password");
        } else {
          navigate("/portal/inicio");
        }
      },
    },
  });

  async function onSubmit(data: FormData) {
    await signIn({ data: { mail: data.mail, password: data.password } });
  }

  async function enterOffice(organizationId: string) {
    const { mail, password } = form.getValues();
    await signIn({ data: { mail, password, organizationId } });
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col lg:flex-row font-sans">
      {/* ── Left panel: branding ── */}
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
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              `radial-gradient(ellipse at 20% 50%, ${primaryColor} 0%, transparent 60%),` +
              `radial-gradient(ellipse at 80% 20%, ${secondaryColor} 0%, transparent 50%),` +
              `radial-gradient(ellipse at 60% 80%, ${secondaryHoverColor} 0%, transparent 55%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-16 right-16 w-32 h-32 rounded-full border border-white/10 animate-pulse" />
        <div className="absolute bottom-24 left-12 w-20 h-20 rounded-full border border-white/10 animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 right-8 w-12 h-12 rotate-45 border border-white/10" />

        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/80" />
          </div>

          <h1
            className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
          >
            Portal do
            <br />
            <span className="text-blue-300">Cliente.</span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Acesse seus cálculos trabalhistas e acompanhe o andamento do seu processo.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            {["Seguro", "Transparente", "Simples"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10 backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-slate-500 text-xs">
          © {new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.
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
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <div className="w-5 h-5 rounded bg-white/80" />
            </div>
          </div>

          {offices ? (
            <OfficePicker
              offices={offices}
              isPending={isPending}
              onPick={enterOffice}
              onBack={() => setOffices(null)}
            />
          ) : (
          <>
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Acessar portal
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Entre com o e-mail e a senha que você cadastrou
            </p>
          </div>

          {/* Form */}
          <form autoComplete="off" className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            {/* E-mail */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="mail">
                E-mail
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon className="w-4 h-4 text-slate-400" />
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

            {/* Password */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                Senha
              </Label>
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
                    {isPasswordVisible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button className="w-full gap-2" disabled={isPending} type="submit">
              {isPending ? (
                <><Loader2Icon className="w-4 h-4 animate-spin" /> Entrando...</>
              ) : (
                <>Entrar <ArrowRightIcon className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/portal/forgot-password")}
            className="block mx-auto text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Esqueceu a senha?
          </button>
          </>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-950 px-2 text-slate-400">ou</span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/authentication")}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              É advogado? Acesse a plataforma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Aparece só quando o mesmo e-mail e senha valem em mais de um escritório —
 * situação real de quem já foi cliente de dois advogados. A lista chega do
 * servidor depois da senha bater, nunca antes.
 */
function OfficePicker({
  offices,
  isPending,
  onPick,
  onBack,
}: {
  offices: SignInClient201OrganizationsItem[];
  isPending: boolean;
  onPick: (organizationId: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Qual escritório?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Seu e-mail tem acesso a mais de um. Escolha por onde quer entrar agora.
        </p>
      </div>

      <div className="space-y-2">
        {offices.map((office) => (
          <button
            key={office.id}
            type="button"
            disabled={isPending}
            onClick={() => onPick(office.id)}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3 text-left text-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-900 disabled:opacity-60"
          >
            <BuildingIcon className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="flex-1 font-medium text-slate-900 dark:text-white">
              {office.name}
            </span>
            {isPending ? (
              <Loader2Icon className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <ArrowRightIcon className="w-4 h-4 text-slate-400" />
            )}
          </button>
        ))}
      </div>

      <Button variant="outline" className="w-full gap-2" onClick={onBack}>
        <ArrowLeftIcon className="w-4 h-4" />
        Usar outro e-mail
      </Button>
    </div>
  );
}
