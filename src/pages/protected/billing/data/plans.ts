import type { PlanCode } from "@/hooks/use-plans";

/**
 * Só a copy. **Nome, preço e teto vêm do Stripe** (`usePlans`) — valor escrito à
 * mão aqui foi o que fez a tela anunciar R$ 97 enquanto a fatura cobrava R$ 100.
 */

const CORE_FEATURES = [
  "Cálculos trabalhistas ilimitados",
  "Geração de PDF com memória de cálculo",
  "Verbas rescisórias completas",
  "Portal do cliente",
];

export const PLAN_FEATURES: Record<PlanCode, string[]> = {
  solo: [...CORE_FEATURES, "Suporte por e-mail"],
  banca: [
    ...CORE_FEATURES,
    "Papéis e permissões por pessoa",
    "Suporte por e-mail",
  ],
  escritorio: [
    ...CORE_FEATURES,
    "Papéis e permissões por pessoa",
    "Passivo trabalhista em lote",
    "Prioridade no suporte",
  ],
  max: [
    ...CORE_FEATURES,
    "Papéis e permissões por pessoa",
    "Passivo trabalhista em lote",
    "API pública para integrações",
    "Prioridade no suporte",
  ],
};

/** O plano em destaque na grade. Escolha comercial, não regra de cobrança. */
export const POPULAR_PLAN_CODE: PlanCode = "banca";
