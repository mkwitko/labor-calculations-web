import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { env } from "@/env";
import { toast } from "sonner";
import { getSessionId } from "./session";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.VITE_HTTP_API_URL,
  withCredentials: true,
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  config.headers["x-session-id"] = getSessionId();
  return config;
});

/**
 * Motivo do último logout involuntário. Vive no sessionStorage porque o redirect
 * abaixo recarrega a página inteira e mataria um toast disparado aqui — a tela
 * de login lê e mostra. Credencial errada no login é 400, então todo 401 que
 * chega aqui é sessão que deixou de valer.
 */
export const SIGN_OUT_REASON_KEY = "signOutReason";

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reason = error.response?.data?.message;
      if (typeof reason === "string" && reason.length > 0) {
        sessionStorage.setItem(SIGN_OUT_REASON_KEY, reason);
      }
      // Cliente do portal não tem o que fazer no login do advogado: a rota do
      // request é o que diz de qual dos dois logins a sessão caiu.
      // A url gerada pelo orval é absoluta (traz a baseURL), daí o `includes`.
      const url = error.config?.url ?? "";
      window.location.href = url.includes("/client-portal")
        ? "/portal"
        : "/authentication";
    }
    return Promise.reject(error);
  },
);

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  })
    .then(({ data }) => data)
  .catch((error: AxiosError<{ showError?: boolean; message?: string }>) => {
    if (
      Axios.isAxiosError(error) &&
      error.response?.data?.showError
    ) {
      toast.error(error.response.data.message);
    }

    throw error;
  });

  (promise as unknown as { cancel: () => void }).cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
