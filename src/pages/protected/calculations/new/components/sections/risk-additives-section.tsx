import { type Control, Controller } from 'react-hook-form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'

// interface RiskAdditivesSectionProps<T extends Record<string, any>> {
// 	control: Control<T>
// 	errors: Record<string, any>
// }

export function RiskAdditivesSection<T extends Record<string, any>>({
	control,
	errors,
}: any) {
	return (
		<FormSection title="Adicionais de Risco">
			<FormField
				label="Nível de insalubridade"
				error={errors.insalubrityLevel?.message}
			>
				<Controller
					name={'insalubrityLevel'}
					control={control}
					render={({ field }) => (
						<Select value={String(field.value)} onValueChange={field.onChange}>
							<SelectTrigger>
								<SelectValue placeholder="Selecionar..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">Inexistente (0%)</SelectItem>
								<SelectItem value="10">Mínimo (10%)</SelectItem>
								<SelectItem value="20">Médio (20%)</SelectItem>
								<SelectItem value="40">Máximo (40%)</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
			</FormField>

			<div className="flex items-center justify-between mt-4">
				<div>
					<p className="text-sm font-medium text-foreground">
						Trabalho em condição de periculosidade
					</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						Adicional de periculosidade de 30% sobre o salário base
					</p>
				</div>
				<Controller
					name={'dangerousWork'}
					control={control}
					render={({ field }) => (
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					)}
				/>
			</div>
		</FormSection>
	)
}
