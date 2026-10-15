import { motion } from "framer-motion";
import { ArrowRight, BuildingIcon, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { faq, hero, numbers, risks } from "./content";

export default function RhLanding() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar isScrolled audience="rh" />

			<section className="px-4 pt-16 pb-12 md:pt-24 md:pb-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="container mx-auto max-w-3xl text-center"
				>
					<span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 font-medium text-primary text-sm">
						<BuildingIcon className="size-3.5" />
						Empresas e RH
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
						to="/rh/calculadora"
						className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary to-primary/90 px-8 py-3.5 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
					>
						Calcular custo de desligamento
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</motion.div>
			</section>

			<section className="bg-muted/20 px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-4xl">
					<h2 className="text-center font-bold text-2xl tracking-tight md:text-3xl">
						Três números, não um
					</h2>
					<div className="mt-10 grid gap-4 md:grid-cols-3">
						{numbers.map((item) => (
							<Card key={item.title}>
								<CardContent>
									<p className="font-medium text-sm">{item.title}</p>
									<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
										{item.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			<section className="px-4 py-16 md:py-20">
				<div className="container mx-auto max-w-3xl">
					<h2 className="font-bold text-2xl tracking-tight md:text-3xl">
						Onde o passivo costuma nascer
					</h2>
					<p className="mt-3 text-muted-foreground">
						Quatro situações que aparecem na maioria das reclamações — e que se
						resolvem com documento, antes de virarem processo.
					</p>
					<div className="mt-8 space-y-4">
						{risks.map((item) => (
							<Card key={item.title}>
								<CardContent>
									<p className="font-medium text-sm">{item.title}</p>
									<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
										{item.description}
									</p>
								</CardContent>
							</Card>
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
								<p className="mt-1.5 whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
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
						Seis perguntas, dois minutos
					</h2>
					<Link
						to="/rh/calculadora"
						className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary to-primary/90 px-8 py-3.5 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
					>
						Calcular custo de desligamento
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
					<p className="mt-6 text-muted-foreground text-xs leading-relaxed">
						Estimativa: não substitui parecer jurídico, auditoria de folha nem
						avaliação de contingência para balanço.
					</p>
				</div>
			</section>

			<Footer />
		</div>
	);
}
