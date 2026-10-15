import { CalculatorIcon, ScaleIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export type CalculationMode = 'estimativa' | 'liquidacao'

interface ModeChooserProps {
	onSelect: (mode: CalculationMode) => void
}

export function ModeChooser({ onSelect }: ModeChooserProps) {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-xl font-semibold text-foreground">Novo Cálculo</h1>
				<p className="text-sm text-muted-foreground">
					Escolha o tipo de cálculo para começar
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Card
					className="cursor-pointer hover:border-primary transition-colors group"
					onClick={() => onSelect('estimativa')}
				>
					<CardContent className="p-6 space-y-3">
						<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
							<CalculatorIcon className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold text-foreground text-lg">
							Estimativa
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Cálculo rápido das verbas rescisórias. Ideal para primeiras
							consultas, propostas de acordo e avaliação inicial do caso.
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							<span className="text-xs bg-muted px-2 py-0.5 rounded">
								Sem correção monetária
							</span>
							<span className="text-xs bg-muted px-2 py-0.5 rounded">
								Sem juros
							</span>
							<span className="text-xs bg-muted px-2 py-0.5 rounded">
								Rápido
							</span>
						</div>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:border-primary transition-colors group"
					onClick={() => onSelect('liquidacao')}
				>
					<CardContent className="p-6 space-y-3">
						<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
							<ScaleIcon className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-semibold text-foreground text-lg">
							Liquidação
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Cálculo completo para processos judiciais. Inclui correção
							monetária (IPCA-E), juros de mora, INSS patronal, IRPF, custas
							judiciais e honorários sucumbenciais.
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							<span className="text-xs bg-muted px-2 py-0.5 rounded">
								Correção IPCA-E
							</span>
							<span className="text-xs bg-muted px-2 py-0.5 rounded">
								Juros de mora
							</span>
							<span className="text-xs bg-muted px-2 py-0.5 rounded">
								Completo
							</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
