import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ScaleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { seoPages } from "../calculadora/content";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { faq, hero, steps, verbas } from "./content";

export default function TrabalhadorLanding() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar isScrolled audience="trabalhador" />

			<section className="px-4 pt-16 pb-12 md:pt-24 md:pb-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="container mx-auto max-w-3xl text-center"
				>
					<span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 font-medium text-primary text-sm">
						<ScaleIcon className="size-3.5" />
						Calculadora de rescisão
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

					<Link
						to="/calculadora"
						className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary to-primary/90 px-8 py-3.5 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
					>
						Calcular minha rescisão
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</motion.div>
			</section>

			<section className="bg-muted/20 px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-4xl">
					<h2 className="text-center font-bold text-2xl tracking-tight md:text-3xl">
						Como funciona
					</h2>
					<div className="mt-10 grid gap-6 md:grid-cols-3">
						{steps.map((item) => (
							<div key={item.step}>
								<span className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
									{item.step}
								</span>
								<h3 className="mt-4 font-semibold text-base">{item.title}</h3>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-4xl">
					<h2 className="text-center font-bold text-2xl tracking-tight md:text-3xl">
						O que entra na conta
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
						Cada uma aparece separada no resultado, com o artigo de lei que a
						sustenta.
					</p>
					<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{verbas.map((verba) => (
							<Card key={verba.name}>
								<CardContent>
									<p className="font-medium text-sm">{verba.name}</p>
									<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
										{verba.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* A explicação da faixa é o que evita a decepção depois: quem espera um
			    número exato e recebe menos culpa quem calculou. */}
			<section className="bg-muted/20 px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight md:text-3xl">
						Por que o resultado é uma faixa
					</h2>
					<div className="mt-6 grid gap-4 md:grid-cols-2">
						<Card>
							<CardContent>
								<p className="font-medium text-sm">O valor mais baixo</p>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									É o que se prova com documento: saldo de salário, aviso prévio,
									13º, férias com o terço, FGTS e a multa de 40%. Sai do
									contracheque, da carteira e do extrato.
								</p>
							</CardContent>
						</Card>
						<Card className="border-amber-200 dark:border-amber-900">
							<CardContent>
								<p className="font-medium text-sm">O valor mais alto</p>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
									Inclui o que depende de prova: hora extra habitual, adicional
									noturno, insalubridade, periculosidade. Cai por terra sem
									cartão de ponto, testemunha ou perícia — e é exatamente aí que
									um advogado faz diferença.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<section className="px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-3xl text-center">
					<h2 className="font-bold text-2xl tracking-tight md:text-3xl">
						Calculadoras por situação
					</h2>
					<div className="mt-8 flex flex-wrap justify-center gap-2">
						{seoPages.map((page) => (
							<Link
								key={page.slug}
								to={`/calculadora/${page.slug}`}
								className="rounded-full border border-border bg-background px-4 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
							>
								{page.title}
							</Link>
						))}
					</div>
				</div>
			</section>

			<section className="bg-muted/20 px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight md:text-3xl">
						Perguntas frequentes
					</h2>
					<div className="mt-8 space-y-6">
						{faq.map((item) => (
							<div key={item.question}>
								<h3 className="font-medium">{item.question}</h3>
								<p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
									{item.answer}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-2xl text-center">
					<h2 className="font-bold text-2xl tracking-tight md:text-3xl">
						Leva dois minutos e é grátis
					</h2>
					<Link
						to="/calculadora"
						className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary to-primary/90 px-8 py-3.5 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
					>
						Calcular minha rescisão
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
					<p className="mt-6 text-muted-foreground text-xs leading-relaxed">
						O resultado é uma estimativa e não substitui consultoria jurídica.
						Não indicamos advogados nem recebemos por indicação — você escolhe
						para quem levar o seu cálculo.
					</p>
				</div>
			</section>

			<Footer />
		</div>
	);
}
