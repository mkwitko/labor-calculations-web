import { useListOrganizations } from "@/http/generated/organization/organization";

export type OrgRole = "owner" | "admin" | "lawyer" | "staff" | "intern";

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Titular",
  admin: "Sócio",
  lawyer: "Advogado associado",
  staff: "Administrativo",
  intern: "Estagiário",
};

/** Papéis que podem ser atribuídos pela interface. `owner` não está aqui: o back recusa. */
export const ASSIGNABLE_ROLES: Exclude<OrgRole, "owner">[] = [
  "admin",
  "lawyer",
  "staff",
  "intern",
];

/**
 * A organização ativa não é estado do front: ela vem do cookie de sessão,
 * resolvida pelo back a cada request. Este hook só lê o que o back já decidiu.
 */
export function useOrganizations() {
  // O `queryClient` desliga `refetchOnMount` e `refetchOnWindowFocus` para o
  // app inteiro. Aqui isso não serve: papel e titularidade mudam no navegador
  // de OUTRA pessoa, então nada invalida este cache na sessão de quem foi
  // promovido — o menu ficava com o papel antigo até um reload completo. É uma
  // linha por organização; revalidar é barato e é o que sustenta todo gate de
  // interface.
  const { data, isLoading } = useListOrganizations({
    query: {
      staleTime: 30_000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  });

  const organizations = data?.data ?? [];
  const current = organizations.find((organization) => organization.isCurrent);

  return {
    organizations,
    current,
    role: (current?.role ?? null) as OrgRole | null,
    isLoading,
    /** Advogado solo: não há para onde trocar, então o switcher não aparece. */
    isSingle: organizations.length <= 1,
  };
}

/**
 * Espelho da matriz de `src/services/tenant/visibility.ts` do back, usado
 * **só para esconder o que o papel não pode fazer**. A autoridade é a API, que
 * devolve 403 (verbo negado) ou 404 (invisível) de todo modo — isto existe para
 * a interface não oferecer caminho que termina em erro.
 */
export function useOrgAbilities() {
  const { role, isLoading } = useOrganizations();

  return {
    role,
    isLoading,
    seesAllCases: role === "owner" || role === "admin" || role === "staff",
    canWriteCases: role === "owner" || role === "admin" || role === "lawyer",
    canAccessFinance: role === "owner" || role === "admin" || role === "staff",
    canManageMembers: role === "owner" || role === "admin",
    isOwner: role === "owner",
  };
}
