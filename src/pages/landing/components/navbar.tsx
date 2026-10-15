import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AUDIENCES } from "../audiences";
import { scrollToSection } from "../utils/scroll";

const navItems = [
  { id: "como-funciona", label: "Como funciona" },
  { id: "features", label: "Recursos" },
  { id: "seguranca", label: "Confiança" },
  { id: "precos", label: "Preços" },
  { id: "faq", label: "FAQ" },
];

function BrandMark() {
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-xs md:size-9 md:text-sm">
      LL
    </span>
  );
}

export function Navbar({
  isScrolled,
  audience = "advogado",
}: {
  isScrolled: boolean;
  /** Muda o destino do botão principal; a navegação em si é a mesma. */
  audience?: "advogado" | "trabalhador" | "rh";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isWorker = audience === "trabalhador";
  const isRh = audience === "rh";
  const isLawyer = audience === "advogado";
  const primaryTo = isWorker
    ? "/calculadora"
    : isRh
      ? "/rh/calculadora"
      : "/authentication/sign-up";
  const primaryLabel = isWorker
    ? "Calcular grátis"
    : isRh
      ? "Calcular custo"
      : "Começar grátis";

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "h-16 border-border/60 border-b bg-background/95 shadow-sm backdrop-blur-md"
          : "h-20 border-border/30 border-b bg-background/85 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto h-full px-4">
        <div className="flex h-full items-center justify-between gap-4">
          <Link
            to="/"
            onClick={(event) => {
              if (isLawyer) scrollToSection("top", event);
            }}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <BrandMark />
            <span className="font-bold text-base text-foreground transition-colors group-hover:text-primary md:text-lg">
              LexLaboral
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {isLawyer &&
              navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={(event) => scrollToSection(item.id, event)}
                  className="group relative rounded-lg px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                >
                  {item.label}
                  <span className="absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
                </button>
              ))}

            {(isWorker || isRh) && (
              <Link
                to={isRh ? "/rh/calculadora" : "/calculadora"}
                className="rounded-lg px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                Calculadora
              </Link>
            )}

            {/* Troca de público no topo: quem caiu na página errada sai dela em
                um clique, sem a página ter que perguntar isso no meio do texto. */}
            {AUDIENCES.filter((a) => a.id !== audience && !a.soon).map((a) => (
              <Link
                key={a.id}
                to={a.path}
                className="rounded-lg px-3 py-2 font-medium text-primary text-sm underline-offset-4 transition-colors hover:underline"
              >
                {a.prompt}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <ModeToggle />
            <Link
              to="/authentication"
              className="px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              to={primaryTo}
              className="rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground text-sm shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
            >
              {primaryLabel}
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to={primaryTo}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm shadow-sm"
            >
              {primaryLabel}
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-muted/50"
                  aria-label="Abrir menu"
                >
                  <Menu className="size-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2.5">
                    <BrandMark />
                    <span className="font-bold text-lg">LexLaboral</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="mt-2 flex flex-col gap-1 px-4">
                  {isLawyer &&
                    navItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setMobileOpen(false);
                          setTimeout(() => scrollToSection(item.id), 150);
                        }}
                        className="w-full rounded-lg px-4 py-3 text-left font-medium text-base text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        {item.label}
                      </button>
                    ))}

                  {AUDIENCES.filter((a) => a.id !== audience && !a.soon).map(
                    (a) => (
                      <Link
                        key={a.id}
                        to={a.path}
                        onClick={() => setMobileOpen(false)}
                        className="w-full rounded-lg px-4 py-3 text-left font-medium text-base text-primary transition-colors hover:bg-muted/50"
                      >
                        {a.prompt}
                      </Link>
                    ),
                  )}
                </nav>

                <div className="mt-6 flex flex-col gap-2 border-border/50 border-t px-4 pt-6">
                  <div className="flex items-center justify-between px-4 py-2 text-muted-foreground text-sm">
                    Tema
                    <ModeToggle />
                  </div>
                  <Link
                    to="/authentication"
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-lg px-4 py-3 text-left font-medium text-base text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/authentication/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-lg bg-primary px-4 py-3 text-center font-semibold text-base text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    Começar 7 dias grátis
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
