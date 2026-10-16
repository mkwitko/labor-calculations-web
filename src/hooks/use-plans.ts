import { useListBillingPlans } from "@/http/generated/billing/billing";
import type {
  ListBillingPlans200DataItem,
  ListBillingPlans200DataItemCode,
} from "@/http/generated/labor-calculations-api.schemas";

/**
 * O escritório assina um **plano com teto de pessoas**, e o plano vive no
 * Stripe: preço e teto vêm da mesma fonte. Este hook é a única porta de entrada
 * do preço na interface — nenhum componente escreve valor. Antes disso a landing
 * prometia R$ 97 enquanto a fatura cobrava R$ 100.
 */

export type PlanCode = ListBillingPlans200DataItemCode;
export type PlanInterval = "monthly" | "yearly";
export type Plan = ListBillingPlans200DataItem;
export type PlanPrice = { priceId: string; amountCents: number };

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}

/** "1 pessoa", "até 15 pessoas" — o teto como o usuário o lê. */
export function seatLabel(maxMembers: number): string {
  return maxMembers === 1 ? "1 pessoa" : `até ${maxMembers} pessoas`;
}

export interface PlanDisplay {
  /** Valor em destaque, sempre no equivalente mensal. */
  headline: string;
  period: string;
  footnote: string | null;
  savingsBadge: string | null;
}

/**
 * Como o plano aparece na tela. O anual é mostrado no equivalente mensal porque
 * é assim que ele se compara ao mensal; o total do ano vai na nota, para o
 * número cobrado não ficar escondido.
 *
 * Mora aqui, e não nos componentes, porque a landing e a tela de assinatura
 * mostram a mesma coisa — duas cópias divergiriam na primeira mudança de preço.
 */
export function describePlan(
  plan: Plan,
  interval: PlanInterval,
): PlanDisplay | null {
  const price = plan[interval];

  if (!price) return null;

  if (interval === "monthly") {
    return {
      headline: formatBRL(price.amountCents),
      period: "/mês",
      footnote: null,
      savingsBadge: null,
    };
  }

  const savings = plan.monthly
    ? plan.monthly.amountCents * 12 - price.amountCents
    : 0;

  return {
    headline: formatBRL(Math.round(price.amountCents / 12)),
    period: "/mês",
    footnote: `${formatBRL(price.amountCents)} cobrados por ano`,
    savingsBadge: savings > 0 ? `Economize ${formatBRL(savings)}` : null,
  };
}

export function usePlans() {
  const { data, isLoading, isError } = useListBillingPlans({
    query: {
      // Preço muda de mês em mês; o backend já cacheia dez minutos. Não faz
      // sentido revalidar a cada foco de janela numa landing.
      staleTime: 10 * 60 * 1000,
      retry: 1,
    },
  });

  const plans = data?.data ?? [];
  const extraMember = data?.extraMember ?? { monthly: null, yearly: null };

  return {
    /** Já vêm ordenados por `rank` — a landing desenha os cards nessa ordem. */
    plans,
    /** Preço do advogado adicional, quando o excedente está configurado. */
    extraMember,
    planByCode: (code: PlanCode): Plan | undefined =>
      plans.find((plan) => plan.code === code),
    isLoading,
    /** Sem preço legível a tela precisa dizer isso, não inventar um número. */
    isUnavailable: isError || (!isLoading && plans.length === 0),
  };
}
