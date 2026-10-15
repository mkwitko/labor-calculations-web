import { AlertTriangleIcon, InfoIcon } from 'lucide-react'
import {
	type Control,
	Controller,
	type FieldErrors,
	type FieldValues,
	type UseFormReturn,
} from 'react-hook-form'
import { DatePicker } from '@/components/ui/date-picker'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'
import type { ContractSectionType } from '../../schema/labor-calculation-common-schema'
import type { V2CalculationFormData } from '../v2/v2-calculation-shema'

function calcAvisoPrevio(startDate: string, endDate: string): { days: number; years: number } | null {
	if (!startDate || !endDate) return null
	const start = new Date(startDate)
	const end = new Date(endDate)
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null
	const msPerYear = 1000 * 60 * 60 * 24 * 365.25
	const years = Math.floor((end.getTime() - start.getTime()) / msPerYear)
	const additionalDays = Math.min(years * 3, 60)
	return { days: 30 + additionalDays, years }
}

export function ContractSection<
	T extends ContractSectionType & FieldValues,
>({
	form,
	showDates,
	onComJustaCausa,
}: {
	form: UseFormReturn<T>
	showDates: boolean
	onComJustaCausa: () => void
}) {
	const watch = form.watch as (name: string) => string
	const control = form.control as unknown as Control<V2CalculationFormData>
	const errors = form.formState.errors as FieldErrors<V2CalculationFormData>
	const terminationType = watch('terminationType')
	const isComJustaCausa = terminationType === 'com_justa_causa'
	const startDate = watch('startDate')
	const endDate = watch('endDate')
	const avisoPrevio = showDates && !isComJustaCausa ? calcAvisoPrevio(startDate, endDate) : null

	return (
		<FormSection title="Contrato de Trabalho">
			<FormField
				label="Tipo de rescisão"
				error={errors.terminationType?.message}
			>
				<Controller
					name={'terminationType'}
					control={control}
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={(v) => {
								field.onChange(v)
								if (v === 'com_justa_causa') {
									onComJustaCausa?.()
								}
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecionar..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="sem_justa_causa">Sem justa causa</SelectItem>
								<SelectItem value="com_justa_causa">Com justa causa</SelectItem>
								<SelectItem value="pedido_demissao">
									Pedido de demissão
								</SelectItem>
								<SelectItem value="rescisao_indireta">
									Rescisão indireta
								</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
			</FormField>

			{isComJustaCausa && (
				<div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-3.5 py-3 mt-3">
					<AlertTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
					<p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
						<span className="font-semibold">Com justa causa:</span> Aviso
						prévio, 13º proporcional, férias proporcionais e média salarial
						serão excluídos automaticamente. Somente férias vencidas, saldo de
						salário, adicionais de risco e horas extras/noturnas são devidos.
					</p>
				</div>
			)}

			{showDates && (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
						<FormField label="Data de admissão" error={errors.startDate?.message}>
							<Controller
								name={'startDate'}
								control={control}
								render={({ field }) => (
									<DatePicker
										value={field.value}
										onChange={field.onChange}
										placeholder="dd/mm/aaaa"
									/>
								)}
							/>
						</FormField>
						<FormField label="Data de demissão" error={errors.endDate?.message}>
							<Controller
								name={'endDate'}
								control={control}
								render={({ field }) => (
									<DatePicker
										value={field.value}
										onChange={field.onChange}
										placeholder="dd/mm/aaaa"
									/>
								)}
							/>
						</FormField>
					</div>
					{avisoPrevio && (
						<div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-muted/60 border border-border">
							<InfoIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
							<p className="text-xs text-muted-foreground">
								<span className="font-medium text-foreground">Aviso prévio estimado:</span>{' '}
								{avisoPrevio.days} dias
								{' '}({avisoPrevio.years} ano{avisoPrevio.years !== 1 ? 's' : ''} de serviço · Lei 12.506/2011)
							</p>
						</div>
					)}
				</>
			)}
		</FormSection>
	)
}
