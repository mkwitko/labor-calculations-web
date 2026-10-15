import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoTabs } from "../constants";
import { AppFrame, AppFrameRow } from "./app-frame";
import { SectionHeading } from "./section-heading";

/**
 * A seção que faz o trabalho pesado da página: mostra as quatro coisas que o
 * produto faz, cada uma com a tela de exemplo ao lado do texto.
 *
 * Ficou como abas, e não como quatro seções empilhadas, porque quem chega quer
 * uma delas — o advogado que veio pelo cálculo não precisa rolar por passivo e
 * gestão para ver a conta. O id continua `como-funciona`: a navegação e o
 * rodapé já apontam para cá.
 */
export function ProductDemoSection() {
  const [active, setActive] = useState(demoTabs[0].id);

  return (
    <section id="como-funciona" className="px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="Como funciona"
          title="Veja o produto antes de criar a conta"
          description="Quatro trabalhos, o mesmo motor de cálculo por baixo."
        />

        <Tabs
          value={active}
          onValueChange={setActive}
          className="mx-auto max-w-5xl"
        >
          <TabsList
            variant="line"
            className="mx-auto h-auto! flex-wrap justify-center gap-2"
          >
            {demoTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-9! flex-none rounded-full border-border! border px-4 data-active:border-primary/30! data-active:bg-primary/8!"
              >
                <tab.icon aria-hidden="true" className="size-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {demoTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-10">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
              >
                <div>
                  <h3 className="font-bold text-xl tracking-tight md:text-2xl">
                    {tab.title}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {tab.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {tab.steps.map((step) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" />
                        </span>
                        <span className="text-foreground text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <AppFrame caption={tab.caption}>
                  <div>
                    {tab.rows.map((row) => (
                      <AppFrameRow
                        key={row.label}
                        label={row.label}
                        value={row.value}
                        muted={row.muted}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-border/60 border-t pt-4">
                    <span className="font-semibold text-sm">
                      {tab.footer.label}
                    </span>
                    <span className="font-bold text-lg text-primary tabular-nums">
                      {tab.footer.value}
                    </span>
                  </div>
                </AppFrame>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
