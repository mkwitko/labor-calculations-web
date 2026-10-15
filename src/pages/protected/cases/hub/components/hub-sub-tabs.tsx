import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type HubSubTab = {
  value: string;
  label: string;
  content: ReactNode;
};

/**
 * Segundo nível de navegação do hub de caso. A seleção vive em `?tab=` para
 * que os redirects das rotas antigas possam apontar direto para a sub-aba
 * certa e para que o link seja compartilhável.
 *
 * A primeira entrada é o default: `?tab=` ausente ou inválido cai nela.
 */
export function HubSubTabs({ items }: { items: HubSubTab[] }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("tab");
  const active = items.some((i) => i.value === requested)
    ? (requested as string)
    : items[0].value;

  const select = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === items[0].value) next.delete("tab");
    else next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  if (items.length === 1) return <>{items[0].content}</>;

  return (
    <Tabs value={active} onValueChange={select}>
      <TabsList>
        {items.map((i) => (
          <TabsTrigger key={i.value} value={i.value}>
            {i.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((i) => (
        <TabsContent key={i.value} value={i.value} className="mt-4">
          {i.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
