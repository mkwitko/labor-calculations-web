import Axios from "axios";

type ApiErrorBody = { message?: string; showError?: boolean };

/**
 * Mensagem de erro para exibir, ou `null` quando não há o que exibir.
 *
 * O interceptor de `lib/api.ts` já mostra um toast quando o back marca
 * `showError: true` — devolver `null` nesse caso evita o toast duplicado.
 *
 * Sobra o que o interceptor não cobre e que hoje falha em silêncio: erro de
 * validação do zod e 429 do rate limit (nenhum dos dois passa por
 * `HttpException`, então vêm sem `showError`), 5xx, e falha de rede — inclusive
 * a que o Cloudflare devolve quando a origem está fora, que não traz corpo
 * nenhum.
 */
export function apiErrorMessage(
  error: unknown,
  fallback: string,
): string | null {
  if (!Axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  const body = error.response?.data;

  if (body?.showError) {
    return null;
  }

  if (!error.response) {
    return "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.";
  }

  if (error.response.status === 429) {
    return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  }

  if (error.response.status >= 500) {
    return "O servidor não respondeu como esperado. Tente novamente em instantes.";
  }

  return body?.message ?? fallback;
}
