import { Input } from '@/components/ui/input'
import { Controller } from 'react-hook-form'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'

// interface VerbasSectionProps<T extends Record<string, any>> {
//   control: Control<T>;
//   watch: UseFormWatch<T>;
//   errors: Record<string, any>;
//   hideComJustaCausaFields?: boolean;
// }

export function VerbasSection<T extends Record<string, any>>({
	control,
	watch: _watch,
	errors,
	hideComJustaCausaFields = false,
}: any) {
	return (
		<FormSection title="Verbas a Apurar">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{!hideComJustaCausaFields && (
					<FormField
						label="13º salários não pagos"
						htmlFor="unpaid13ths"
						error={errors.unpaid13ths?.message}
					>
						<Controller
							name={'unpaid13ths'}
							control={control}
							render={({ field }) => (
								<Input
									id="unpaid13ths"
									type="text"
									inputMode="numeric"
									placeholder="0"
									value={field.value}
									onChange={(e) =>
										field.onChange(e.target.value.replace(/\D/g, ''))
									}
								/>
							)}
						/>
					</FormField>
				)}
				{!hideComJustaCausaFields && (
					<FormField
						label="Férias proporcionais (períodos)"
						htmlFor="vacationCount"
						error={errors.vacationCount?.message}
					>
						<Controller
							name={'vacationCount'}
							control={control}
							render={({ field }) => (
								<Input
									id="vacationCount"
									type="text"
									inputMode="numeric"
									placeholder="0"
									value={field.value}
									onChange={(e) =>
										field.onChange(e.target.value.replace(/\D/g, ''))
									}
								/>
							)}
						/>
					</FormField>
				)}
				<FormField
					label="Férias vencidas em dobro (Art. 137 CLT)"
					htmlFor="vacationVencidasCount"
					error={errors.vacationVencidasCount?.message}
					hint="Períodos que venceram sem ser concedidas — incluídos em dobro"
					className={hideComJustaCausaFields ? 'sm:col-span-2' : ''}  // 👈
				>
					<Controller
						name={'vacationVencidasCount'}
						control={control}
						render={({ field }) => (
							<Input
								id="vacationVencidasCount"
								type="text"
								inputMode="numeric"
								placeholder="0"
								value={field.value}
								onChange={(e) =>
									field.onChange(e.target.value.replace(/\D/g, ''))
								}
							/>
						)}
					/>
				</FormField>
				<FormField
					label="Horas extras (total no período)"
					htmlFor="extraHours"
					error={errors.extraHours?.message}
				>
					<Controller
						name={'extraHours'}
						control={control}
						render={({ field }) => (
							<Input
								id="extraHours"
								type="text"
								inputMode="decimal"
								placeholder="0"
								value={field.value}
								onChange={(e) =>
									field.onChange(
										e.target.value
											.replace(/[^0-9.]/g, '')
											.replace(/(\..*)\./g, '$1'),
									)
								}
							/>
						)}
					/>
				</FormField>
				<FormField
					label="Horas noturnas"
					htmlFor="nightHours"
					error={errors.nightHours?.message}
				>
					<Controller
						name={'nightHours'}
						control={control}
						render={({ field }) => (
							<Input
								id="nightHours"
								type="text"
								inputMode="decimal"
								placeholder="0"
								value={field.value}
								onChange={(e) =>
									field.onChange(
										e.target.value
											.replace(/[^0-9.]/g, '')
											.replace(/(\..*)\./g, '$1'),
									)
								}
							/>
						)}
					/>
				</FormField>
			</div>
		</FormSection>
	)
}
