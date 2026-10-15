import { PublicPortalLayout } from "@/pages/portal/_layout";
import { Suspense, lazy } from "react";
import { Navigate, createBrowserRouter, useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { RouteErrorBoundary } from "@/components/route-error-boundary";
import { initAnalytics } from "@/lib/analytics";
import { initSentry } from "@/lib/sentry";
import { seoPages } from "@/pages/landing/calculadora/content";

// Layouts
const AppLayout = lazy(() => import("@/pages/protected/_layout").then((m) => ({ default: m.AppLayout })));
const PublicLayout = lazy(() => import("@/pages/public/_layout").then((m) => ({ default: m.PublicLayout })));
const LandingLayout = lazy(() => import("@/pages/landing/_layout").then((m) => ({ default: m.LandingLayout })));
const PortalLayout = lazy(() => import("@/pages/portal/authenticated/_layout").then((m) => ({ default: m.PortalLayout })));

// Landing
const Landing = lazy(() => import("@/pages/landing"));
const PrivacyPage = lazy(() => import("@/pages/landing/legal/privacy"));
const TermsPage = lazy(() => import("@/pages/landing/legal/terms"));
const LgpdPage = lazy(() => import("@/pages/landing/legal/lgpd"));
const MethodologyPage = lazy(() => import("@/pages/landing/metodologia"));
const TrabalhadorLanding = lazy(() => import("@/pages/landing/trabalhador"));
const RhLanding = lazy(() => import("@/pages/landing/rh"));
const ApiDocsPage = lazy(() => import("@/pages/landing/api"));
const CalculadoraRh = lazy(() => import("@/pages/public/calculadora-rh"));
const CalculadoraRhResultado = lazy(
	() => import("@/pages/public/calculadora-rh/resultado"),
);
const Calculadora = lazy(() => import("@/pages/public/calculadora"));
const WidgetCalculadora = lazy(() => import("@/pages/public/widget"));
const CalculadoraLayout = lazy(() =>
	import("@/pages/public/calculadora/_layout").then((m) => ({
		default: m.CalculadoraLayout,
	})),
);
const CalculadoraResultado = lazy(
	() => import("@/pages/public/calculadora/resultado"),
);
const SeoCalculatorPage = lazy(() =>
	import("@/pages/landing/calculadora/seo-page").then((m) => ({
		default: m.SeoCalculatorPage,
	})),
);

// Public
const SignIn = lazy(() => import("@/pages/public/sign-in"));
const SignUp = lazy(() => import("@/pages/public/sign-up"));
const SharedCalculation = lazy(() => import("@/pages/public/shared-calculation"));
const ReferralRedirect = lazy(() => import("@/pages/public/referral-redirect"));
const InviteAccept = lazy(() => import("@/pages/public/invite-accept"));

// Protected
const Home = lazy(() => import("@/pages/protected/home"));
const Cases = lazy(() => import("@/pages/protected/cases"));
const NewCase = lazy(() => import("@/pages/protected/cases/new"));
const CaseHubLayout = lazy(() => import("@/pages/protected/cases/hub/case-hub-layout"));
const CasoPage = lazy(() => import("@/pages/protected/cases/hub/pages/caso-page"));
const NumerosPage = lazy(() => import("@/pages/protected/cases/hub/pages/numeros-page"));
const PrazosPage = lazy(() => import("@/pages/protected/cases/hub/pages/prazos-page"));
const AutosPage = lazy(() => import("@/pages/protected/cases/hub/pages/autos-page"));

const Agenda = lazy(() => import("@/pages/protected/agenda"));

const Calculations = lazy(() => import("@/pages/protected/calculations"));
const NewCalculation = lazy(() => import("@/pages/protected/calculations/new"));
const EditCalculation = lazy(() => import("@/pages/protected/calculations/edit"));
const CalculationDetail = lazy(() => import("@/pages/protected/calculations/detail"));
const Passivo = lazy(() => import("@/pages/protected/passivo"));
const DoMeuSite = lazy(() => import("@/pages/protected/do-meu-site"));

const Clients = lazy(() => import("@/pages/protected/clients"));
const ClientDetail = lazy(() => import("@/pages/protected/clients/detail"));
const NewClient = lazy(() => import("@/pages/protected/clients/new"));


const Templates = lazy(() => import("@/pages/protected/templates"));

const Billing = lazy(() => import("@/pages/protected/billing"));
const BillingSuccess = lazy(() => import("@/pages/protected/billing/success"));
const BillingCancel = lazy(() => import("@/pages/protected/billing/cancel"));
const Referrals = lazy(() => import("@/pages/protected/referrals"));

const Profile = lazy(() => import("@/pages/protected/profile"));
const Settings = lazy(() => import("@/pages/protected/settings"));
const Team = lazy(() => import("@/pages/protected/team"));
const Shortcuts = lazy(() => import("@/pages/protected/settings/shortcuts"));
const HelpCenter = lazy(() => import("@/pages/protected/help"));
const AdminFunil = lazy(() => import("@/pages/protected/admin/funil"));
const AdminSuporte = lazy(() => import("@/pages/protected/admin/suporte"));
const Suporte = lazy(() => import("@/pages/protected/suporte"));
const SuporteDetail = lazy(() => import("@/pages/protected/suporte/detail"));
const ExampleCase = lazy(() => import("@/pages/protected/help/exemplo"));

// Admin

// Portal
const PortalLogin = lazy(() => import("@/pages/portal/login"));
const PortalChangePassword = lazy(() => import("@/pages/portal/change-password"));
const PortalCalculations = lazy(() => import("@/pages/portal/authenticated/calculations"));
const PortalCalculationDetail = lazy(() => import("@/pages/portal/authenticated/calculations/[id]"));
const PortalDashboard = lazy(() => import("@/pages/portal/authenticated/dashboard"));
const PortalCases = lazy(() => import("@/pages/portal/authenticated/cases"));
const PortalCaseDetail = lazy(() => import("@/pages/portal/authenticated/cases/[caseId]"));
const PortalForgotPassword = lazy(() => import("@/pages/portal/forgot-password"));
const PortalResetPassword = lazy(() => import("@/pages/portal/reset-password"));
const PortalAcceptInvite = lazy(() => import("@/pages/portal/accept-invite"));

const withSuspense = (component: React.ReactNode) => (
  <Suspense fallback={null}>
    {component}
  </Suspense>
);

/**
 * Redirect das rotas antigas de aba do hub de caso, que eram dez e viraram
 * quatro. Precisa ser componente porque só aqui dá para ler `:caseId` e montar
 * o path absoluto com a sub-aba certa em `?tab=` — `Navigate` com path
 * relativo não resolve o parâmetro.
 */
function CaseTabRedirect({ to, tab }: { to: string; tab?: string }) {
  const { caseId } = useParams<{ caseId: string }>();
  const base = to ? `/cases/${caseId}/${to}` : `/cases/${caseId}`;
  return <Navigate to={tab ? `${base}?tab=${tab}` : base} replace />;
}

// Initialize Sentry before the router is created so navigation tracing and the
// route error boundary are wired into the instrumented router.
initSentry();
// A PostHog sobe em seguida, na fila de ociosidade: `capture_exceptions` só
// observa depois de inicializada, e as páginas públicas não disparavam evento
// nenhum até alguém começar um cálculo.
initAnalytics();
const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
  {
    path: "/",
    element: withSuspense(<LandingLayout />),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(<Landing />),
      },
      {
        path: "privacidade",
        element: withSuspense(<PrivacyPage />),
      },
      {
        path: "termos",
        element: withSuspense(<TermsPage />),
      },
      {
        path: "lgpd",
        element: withSuspense(<LgpdPage />),
      },
      {
        path: "metodologia",
        element: withSuspense(<MethodologyPage />),
      },
      {
        path: "api",
        element: withSuspense(<ApiDocsPage />),
      },
      {
        path: "trabalhador",
        element: withSuspense(<TrabalhadorLanding />),
      },
      {
        path: "rh",
        element: withSuspense(<RhLanding />),
      },
      ...seoPages.map((page) => ({
        path: `calculadora/${page.slug}`,
        element: withSuspense(<SeoCalculatorPage content={page} />),
      })),
    ],
  },

  // A calculadora do trabalhador tem casca própria: nem a landing (que fala com
  // o advogado) nem o app autenticado servem. As páginas de SEO seguem sob o
  // LandingLayout, porque lá o wizard é conteúdo dentro do artigo.
  {
    path: "/calculadora",
    element: withSuspense(<CalculadoraLayout />),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(<Calculadora source="site" />),
      },
      {
        path: "r/:token",
        element: withSuspense(<CalculadoraResultado />),
      },
    ],
  },

  // O widget roda dentro de um iframe no site do escritório: sem casca nenhuma,
  // e fora do PublicLayout, que expulsaria para /home o advogado logado testando
  // o próprio widget.
  {
    path: "/widget/calculadora",
    element: withSuspense(<WidgetCalculadora />),
    errorElement: <RouteErrorBoundary />,
  },

  // A calculadora de RH divide a casca com a do trabalhador: mesma marca, mesmo
  // rodapé com a ressalva de estimativa, público diferente.
  {
    path: "/rh/calculadora",
    element: withSuspense(<CalculadoraLayout />),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(<CalculadoraRh source="rh" />),
      },
      {
        path: "r/:token",
        element: withSuspense(<CalculadoraRhResultado />),
      },
    ],
  },

  {
    path: "/authentication",
    element: withSuspense(<PublicLayout />),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(<SignIn />),
      },
      {
        path: "sign-up",
        element: withSuspense(<SignUp />),
      },
    ],
  },

  {
    path: "/share/:id",
    element: withSuspense(<SharedCalculation />),
    errorElement: <RouteErrorBoundary />,
  },

  // Referral links shared by users. Records the code and forwards to signup.
  {
    path: "/r/:code",
    element: withSuspense(<ReferralRedirect />),
  },
  {
    // Caminho acordado com o back: `buildInviteUrl` monta
    // `${CLIENT_URL}/convite/${token}`. Mudar aqui quebra convite já enviado.
    path: "/convite/:token",
    element: withSuspense(<InviteAccept />),
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/reset-password",
    element: <Navigate to="/portal/reset-password" />,
  },

  {
    path: "/portal",
    element: withSuspense(<PublicPortalLayout />),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(<PortalLogin />),
      },
      {
        path: "forgot-password",
        element: withSuspense(<PortalForgotPassword />),
      },
      {
        path: "reset-password",
        element: withSuspense(<PortalResetPassword />),
      },
      {
        // Rota fixa acordada com o back — `buildClientInviteUrl` monta
        // `${CLIENT_URL}/portal/convite/${token}`. Mudar o caminho quebra todo
        // convite já enviado.
        path: "convite/:token",
        element: withSuspense(<PortalAcceptInvite />),
      },
      {
        element: withSuspense(<PortalLayout />),
        children: [
          {
            path: "inicio",
            element: withSuspense(<PortalDashboard />),
          },
          {
            path: "change-password",
            element: withSuspense(<PortalChangePassword />),
          },
          {
            path: "calculos",
            element: withSuspense(<PortalCalculations />),
          },
          {
            path: "calculos/:id",
            element: withSuspense(<PortalCalculationDetail />),
          },
          {
            path: "casos",
            element: withSuspense(<PortalCases />),
          },
          {
            path: "casos/:caseId",
            element: withSuspense(<PortalCaseDetail />),
          },
        ],
      },
    ],
  },

  {
    path: "",
    element: withSuspense(<AppLayout />),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/home",
        element: withSuspense(<Home />),
      },
      {
        path: "/cases",
        element: withSuspense(<Cases />),
      },
      {
        path: "/cases/new",
        element: withSuspense(<NewCase />),
      },
      {
        path: "/cases/:caseId",
        element: withSuspense(<CaseHubLayout />),
        children: [
          { index: true, element: withSuspense(<CasoPage />) },
          { path: "numeros", element: withSuspense(<NumerosPage />) },
          { path: "prazos", element: withSuspense(<PrazosPage />) },
          { path: "autos", element: withSuspense(<AutosPage />) },

          // Rotas antigas das dez abas planas. Mantidas como redirect para não
          // quebrar link salvo nem histórico do navegador.
          { path: "calculos", element: <CaseTabRedirect to="numeros" /> },
          { path: "acordos", element: <CaseTabRedirect to="numeros" tab="acordos" /> },
          { path: "financeiro", element: <CaseTabRedirect to="numeros" tab="financeiro" /> },
          { path: "audiencias", element: <CaseTabRedirect to="prazos" /> },
          { path: "tarefas", element: <CaseTabRedirect to="prazos" tab="tarefas" /> },
          { path: "documentos", element: <CaseTabRedirect to="autos" /> },
          { path: "andamentos", element: <CaseTabRedirect to="autos" tab="andamentos" /> },
          { path: "partes", element: <CaseTabRedirect to="" tab="partes" /> },
          { path: "notas", element: <CaseTabRedirect to="" tab="notas" /> },
        ],
      },
      {
        path: "/agenda",
        element: withSuspense(<Agenda />),
      },
      {
        path: "/calculations",
        element: withSuspense(<Calculations />),
      },
      {
        path: "/calculations/new",
        element: withSuspense(<NewCalculation />),
      },
      {
        path: "/calculations/:id",
        element: withSuspense(<CalculationDetail />),
      },
      {
        path: "/calculations/:id/edit",
        element: withSuspense(<EditCalculation />),
      },
      {
        path: "/clients",
        element: withSuspense(<Clients />),
      },
      {
        path: "/clients/new",
        element: withSuspense(<NewClient />),
      },
      {
        path: "/clients/:clientId",
        element: withSuspense(<ClientDetail />),
      },
      {
        path: "/workflow",
        element: <Navigate to="/cases?view=kanban" replace />,
      },
      {
        path: "/library/templates",
        element: withSuspense(<Templates />),
      },
      {
        // Legacy path — templates moved under /library
        path: "/templates",
        element: <Navigate to="/library/templates" replace />,
      },
      {
        path: "/billing",
        element: withSuspense(<Billing />),
      },
      {
        path: "/billing/success",
        element: withSuspense(<BillingSuccess />),
      },
      {
        path: "/billing/cancel",
        element: withSuspense(<BillingCancel />),
      },
      {
        path: "/indicacoes",
        element: withSuspense(<Referrals />),
      },
      {
        path: "/equipe",
        element: withSuspense(<Team />),
      },
      {
        path: "/profile",
        element: withSuspense(<Profile />),
      },
      {
        path: "/settings",
        element: withSuspense(<Settings />),
      },
      {
        path: "/settings/atalhos",
        element: withSuspense(<Shortcuts />),
      },
      {
        path: "/passivo",
        element: withSuspense(<Passivo />),
      },
      {
        path: "/do-meu-site",
        element: withSuspense(<DoMeuSite />),
      },
      {
        path: "/ajuda",
        element: withSuspense(<HelpCenter />),
      },
      {
        path: "/suporte",
        element: withSuspense(<Suporte />),
      },
      {
        path: "/suporte/:id",
        element: withSuspense(<SuporteDetail />),
      },
      {
        path: "/ajuda/exemplo",
        element: withSuspense(<ExampleCase />),
      },
      // Painel do dono do produto: sem link na navegação, gateado por isAdmin
      // no backend. Esconder o item não protege nada — a API é que recusa.
      {
        path: "/admin/funil",
        element: withSuspense(<AdminFunil />),
      },
      {
        path: "/admin/suporte",
        element: withSuspense(<AdminSuporte />),
      },
    ],
  },
]);