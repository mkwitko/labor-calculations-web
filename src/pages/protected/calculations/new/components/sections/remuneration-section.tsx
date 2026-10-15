import { type Control, Controller } from 'react-hook-form'
import { CurrencyInput } from '@/components/ui/currency-input'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'

// interface RemunerationSectionProps<T extends Record<string, any>> {
// 	control: Control<T>
// 	errors: Record<string, any>
// 	hideLastThreeSalariesAvg?: boolean
// }

export function RemunerationSection<T extends Record<string, any>>({
	control,
	errors,
	hideLastThreeSalariesAvg = false,
}: any) {
	return (
		<FormSection title="Remuneração" description="Valores em reais (R$)">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<FormField
					label="Salário base"
					htmlFor="baseSalary"
					error={errors.baseSalary?.message}
				>
					<Controller
						name={'baseSalary'}
						control={control}
						render={({ field }) => (
							<CurrencyInput
								id="baseSalary"
								placeholder="0,00"
								value={field.value ?? ''}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						)}
					/>
				</FormField>
				<FormField
					label="Último salário"
					htmlFor="lastSalary"
					error={errors.lastSalary?.message}
				>
					<Controller
						name={'lastSalary'}
						control={control}
						render={({ field }) => (
							<CurrencyInput
								id="lastSalary"
								placeholder="0,00"
								value={field.value ?? ''}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						)}
					/>
				</FormField>
				{!hideLastThreeSalariesAvg && (
					<FormField
						label="Média 3 últimos salários"
						htmlFor="lastThreeSalariesAvg"
						error={errors.lastThreeSalariesAvg?.message}
					>
						<Controller
							name={'lastThreeSalariesAvg'}
							control={control}
							render={({ field }) => (
								<CurrencyInput
									id="lastThreeSalariesAvg"
									placeholder="0,00"
									value={field.value ?? ''}
									onChange={(e) => field.onChange(e.target.value)}
								/>
							)}
						/>
					</FormField>
				)}
			</div>
		</FormSection>
	)
}
