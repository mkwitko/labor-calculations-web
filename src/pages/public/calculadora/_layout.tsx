import { ScaleIcon } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageview } from "@/hooks/use-pageview";

// Casca de aplicação da calculadora pública. Ela não vive dentro da landing (que
// fala com o advogado) nem dentro do app autenticado: é um produto próprio, com
// cabeçalho, rodapé e regras de confiança próprios.
export function CalculadoraLayout() {
	usePageview();

	return (
		<div className="flex min-h-screen flex-col bg-muted/20">
			<header className="sticky top-0 z-40 w-full border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
					<Link to="/" className="flex items-center gap-2">
						<span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-primary/20 shadow-sm">
							<ScaleIcon className="size-4 text-primary-foreground" />
						</span>
						<span className="font-bold text-base">LexLaboral</span>
					</Link>

					<span className="hidden h-5 w-px bg-border sm:block" />
					<span className="hidden text-muted-foreground text-sm sm:block">
						Calculadora de rescisão
					</span>

					<div className="ml-auto flex items-center gap-1">
						<Button variant="ghost" size="sm" asChild className="hidden sm:flex">
							<Link to="/">Sou advogado</Link>
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-1">
				<Outlet />
			</main>

			<footer className="border-border border-t bg-background">
				<div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-6">
					<p className="text-muted-foreground text-xs leading-relaxed">
						Esta calculadora entrega uma estimativa a partir dos dados que você
						informar. Não confere documentos, não é consultoria jurídica e não
						garante recebimento — o valor final depende de prova e, havendo
						processo, de decisão judicial.
					</p>
					<div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground text-xs">
						<Link to="/privacidade" className="hover:text-foreground">
							Privacidade
						</Link>
						<Link to="/termos" className="hover:text-foreground">
							Termos de uso
						</Link>
						<Link to="/lgpd" className="hover:text-foreground">
							LGPD
						</Link>
						<span className="ml-auto">
							© {new Date().getFullYear()} LexLaboral
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
