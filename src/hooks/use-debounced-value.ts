import { useEffect, useState } from "react";

/**
 * Atrasa a propagação de um valor. Usado para não disparar uma query por
 * tecla digitada na busca. Não existe outro debounce no repo: a lista de
 * casos ainda consulta a cada tecla e pode adotar este hook depois.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
