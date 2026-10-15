import { CheckCircle2, CodeIcon } from "lucide-react";
import { env } from "@/env";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { CodeTabs } from "./components/code-tabs";
import { EndpointList } from "./components/endpoint-list";
import { ErrorTable } from "./components/error-table";
import { billing, environments, faq, hero, steps } from "./content";

/**
 * A referência e o download da spec são do **servidor da API**, não rotas do
 * front: em desenvolvimento eles moram em outra origem, então o link sai da
 * mesma variável que o cliente HTTP usa.
 */
const REFERENCE_URL = `${env.VITE_HTTP_API_URL}/docs/api`;
const OPENAPI_URL = `${env.VITE_HTTP_API_URL}/openapi/v1.json`;

export default function ApiDocsPage() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar isScrolled />

			<section className="px-4 pt-16 pb-12 md:pt-24">
				<div className="container mx-auto max-w-3xl text-center">
					<span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 font-medium text-primary text-sm">
						<CodeIcon className="size-3.5" />
						{hero.badge}
					</span>

					<h1 className="mt-6 font-bold text-3xl leading-tight tracking-tight md:text-5xl">
						{hero.title}
					</h1>

					<p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
						{hero.subtitle}
					</p>

					<ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
						{hero.reassurances.map((item) => (
							<li
								key={item}
								className="flex items-center gap-1.5 text-muted-foreground text-sm"
							>
								<CheckCircle2 className="size-4 text-primary" />
								{item}
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">
						Comece em três passos
					</h2>

					<ol className="mt-6 space-y-4">
						{steps.map((step, index) => (
							<li
								key={step.title}
								className="flex gap-4 rounded-xl border border-border bg-card p-5"
							>
								<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xs">
									{index + 1}
								</span>
								<div>
									<p className="font-semibold text-foreground text-sm">
										{step.title}
									</p>
									<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
										{step.description}
									</p>
								</div>
							</li>
						))}
					</ol>

					<div className="mt-8">
						<CodeTabs />
					</div>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">Endpoints</h2>
					<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
						Dois endpoints. Abaixo, o que cada um faz e quais campos mudam o
						resultado — a referência OpenAPI tem a lista completa, campo por
						campo.
					</p>
					<div className="mt-6">
						<EndpointList />
					</div>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">Ambientes</h2>

					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						{environments.map((environment) => (
							<div
								key={environment.prefix}
								className="rounded-xl border border-border bg-card p-5"
							>
								<p className="font-semibold text-foreground text-sm">
									{environment.title}
								</p>
								<code className="mt-1 block font-mono text-muted-foreground text-xs">
									{environment.prefix}…
								</code>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									{environment.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">Erros e limites</h2>
					<div className="mt-6">
						<ErrorTable />
					</div>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">{billing.title}</h2>
					<ul className="mt-6 space-y-3">
						{billing.bullets.map((bullet) => (
							<li
								key={bullet}
								className="flex gap-2 text-muted-foreground text-sm leading-relaxed"
							>
								<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
								{bullet}
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">
						Referência completa
					</h2>
					<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
						Os dois endpoints, campo por campo, com o esquema de autenticação e
						exemplos de resposta.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<a
							href={REFERENCE_URL}
							className="rounded-xl bg-gradient-to-b from-primary to-primary/90 px-6 py-3 font-semibold text-primary-foreground text-sm shadow-lg shadow-primary/25"
						>
							Abrir a referência
						</a>
						<a
							href={OPENAPI_URL}
							className="rounded-xl border border-border px-6 py-3 font-semibold text-foreground text-sm"
						>
							Baixar o OpenAPI
						</a>
					</div>
				</div>
			</section>

			<section className="px-4 py-12">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight">
						Perguntas frequentes
					</h2>
					<dl className="mt-6 space-y-5">
						{faq.map((item) => (
							<div key={item.question}>
								<dt className="font-semibold text-foreground text-sm">
									{item.question}
								</dt>
								<dd className="mt-1 text-muted-foreground text-sm leading-relaxed">
									{item.answer}
								</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			<Footer />
		</div>
	);
}
