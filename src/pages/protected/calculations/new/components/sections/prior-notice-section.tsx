import { type Control, Controller, type UseFormWatch } from 'react-hook-form'
import { DatePicker } from '@/components/ui/date-picker'
import { Switch } from '@/components/ui/switch'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'

// interface PriorNoticeSectionProps<T extends Record<string, any>> {
//   control: Control<T>;
//   watch: UseFormWatch<T>;
//   errors: Record<string, any>;
// }

export function PriorNoticeSection<T extends Record<string, any>>({
	control,
	watch,
	errors,
}: any) {
	const priorNoticeWorked = watch('priorNoticeWorked') as boolean | undefined

	return (
		<FormSection title="Aviso Prévio">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-foreground">
						Aviso prévio trabalhado
					</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						O funcionário cumpriu o aviso prévio
					</p>
				</div>
				<Controller
					name={'priorNoticeWorked'}
					control={control}
					render={({ field }) => (
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					)}
				/>
			</div>

			{priorNoticeWorked && (
				<FormField
					label="Data do aviso prévio"
					error={errors.priorNoticeDate?.message}
					className="mt-4"
				>
					<Controller
						name={'priorNoticeDate'}
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
			)}
		</FormSection>
	)
}
