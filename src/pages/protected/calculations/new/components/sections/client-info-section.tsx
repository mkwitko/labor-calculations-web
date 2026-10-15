import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Controller, UseFormReturn } from 'react-hook-form'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'
import { maskCpf } from '../common/form-utils'
import { V2CalculationFormData } from '../v2/v2-calculation-shema'

interface ClientInfoSectionProps {
	form: UseFormReturn<V2CalculationFormData>
}

export function ClientInfoSection({ form }: ClientInfoSectionProps) {
	const {
		control,
		register,
		formState: { errors },
	} = form
	return (
		<>
			<FormSection title="Identificação">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<FormField
						label="Nome do cliente"
						htmlFor="clientName"
						error={errors.clientName?.message}
					>
						<Input
							id="clientName"
							placeholder="Nome completo"
							{...register('clientName')}
						/>
					</FormField>
					<FormField label="CPF / Documento" htmlFor="clientDocument">
						<Controller
							name={'clientDocument'}
							control={control}
							render={({ field }) => (
								<Input
									id="clientDocument"
									placeholder="000.000.000-00"
									value={field.value ?? ''}
									onChange={(e) => field.onChange(maskCpf(e.target.value))}
								/>
							)}
						/>
					</FormField>
				</div>
			</FormSection>

			<FormSection title="Observações">
				<FormField label="Notas do caso" htmlFor="observations">
					<Textarea
						id="observations"
						placeholder="Informações adicionais sobre o processo..."
						rows={3}
						{...register('observations')}
					/>
				</FormField>
			</FormSection>
		</>
	)
}
