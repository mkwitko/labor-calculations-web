import { Controller } from 'react-hook-form'
import { HelpTip } from '@/components/help-tip'
import { Switch } from '@/components/ui/switch'
import { FormSection } from '../common/form-section'

export function PenaltiesSection({ control, showArt467 }: any) {
	return (
		<FormSection title="Multas e Penalidades">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5">
							Multa por atraso no pagamento (Art. 477, §8º CLT)
							<HelpTip title="Art. 477, §8º CLT">
								Multa de 1 salário do empregado quando as verbas rescisórias não
								são pagas no prazo legal (até 10 dias corridos da rescisão).
							</HelpTip>
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							1 salário base — quando não pago em até 10 dias úteis
						</p>
					</div>
					<Controller
						name={'applyArt477Fine'}
						control={control}
						render={({ field }) => (
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						)}
					/>
				</div>

				{showArt467 && (
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5">
								Multa de 50% sobre verbas incontroversas (Art. 467 CLT)
								<HelpTip title="Art. 467 CLT">
									Se as verbas rescisórias incontroversas não forem pagas na
									primeira audiência, incide acréscimo de 50% sobre elas. Aqui
									aplicamos sobre férias, 13º, aviso prévio e multa de 40% do
									FGTS (valores já corrigidos, sem juros).
								</HelpTip>
							</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								+50% sobre férias, 13º, aviso prévio e multa 40% FGTS — quando
								não pagas na 1ª audiência
							</p>
						</div>
						<Controller
							name={'applyArt467'}
							control={control}
							render={({ field }) => (
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
					</div>
				)}
			</div>
		</FormSection>
	)
}
