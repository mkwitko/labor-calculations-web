import Calculadora from "@/pages/public/calculadora";
import Vacation13thCalculator from "@/pages/public/verba-calculadora/ferias-13/form";
import OvertimeCalculator from "@/pages/public/verba-calculadora/overtime/form";
import type { SeoPageContent } from "./content";

// Qual calculadora a página monta. O layout é o mesmo nas cinco: muda só o
// formulário embutido, porque a intenção de busca é diferente.
function EmbeddedCalculator({ content }: { content: SeoPageContent }) {
	const source = `seo:${content.slug}`;

	if (content.calculator === "horas-extras") {
		return <OvertimeCalculator source={source} embedded />;
	}

	if (content.calculator === "ferias-13") {
		return <Vacation13thCalculator source={source} embedded />;
	}

	return <Calculadora source={source} embedded />;
}

// Página de conteúdo com a calculadora embutida logo depois da introdução — não
// no fim. Quem chega pelo Google veio calcular; o texto existe para o buscador
// entender do que a página trata e para quem quiser conferir o fundamento.
export function SeoCalculatorPage({ content }: { content: SeoPageContent }) {
	const faqJsonLd = JSON.stringify({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: content.faq.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: { "@type": "Answer", text: item.answer },
		})),
	});

	return (
		<article className="mx-auto w-full max-w-2xl px-4 py-10">
			<h1 className="font-semibold text-3xl leading-tight">{content.title}</h1>

			<div className="mt-4 space-y-3 whitespace-pre-line text-muted-foreground">
				{content.intro}
			</div>

			<div className="my-10 rounded-xl border border-border bg-card p-4 md:p-6">
				<EmbeddedCalculator content={content} />
			</div>

			<div className="space-y-8">
				{content.sections.map((section) => (
					<section key={section.title}>
						<h2 className="mb-2 font-semibold text-xl">{section.title}</h2>
						<p className="whitespace-pre-line text-muted-foreground">
							{section.content}
						</p>
					</section>
				))}
			</div>

			<h2 className="mt-10 mb-4 font-semibold text-xl">Perguntas frequentes</h2>
			<div className="space-y-6">
				{content.faq.map((item) => (
					<section key={item.question}>
						<h3 className="mb-1 font-medium">{item.question}</h3>
						<p className="whitespace-pre-line text-muted-foreground">
							{item.answer}
						</p>
					</section>
				))}
			</div>

			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático, sem entrada do usuário
				dangerouslySetInnerHTML={{ __html: faqJsonLd }}
			/>
		</article>
	);
}
