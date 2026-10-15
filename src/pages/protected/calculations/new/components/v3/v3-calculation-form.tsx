import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangleIcon, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { HelpTip } from '@/components/help-tip'
import { InfoBanner } from '@/components/info-banner'
import { Switch } from '@/components/ui/switch'
import { AdditionalVerbasSection } from '../../components/sections/additional-verbas-section'
import { ClientSelectSection } from '../../components/sections/client-select-section'
import { ContractSection } from '../../components/sections/contract-section'
import { ContractSummaryBar } from '../../components/common/contract-summary-bar'
import { CustomVerbasSection } from '../../components/sections/custom-verbas-section'
import { FormField } from '../../components/common/form-field'
import { FormNavigation } from '../../components/common/form-navigation'
import { FormSection } from '../../components/common/form-section'
import { PenaltiesSection } from '../../components/sections/penalties-section'
import { PriorNoticeSection } from '../../components/sections/prior-notice-section'
import { RemunerationSection } from '../../components/sections/remuneration-section'
import { RiskAdditivesSection } from '../../components/sections/risk-additives-section'
import { SalaryDifferenceSection } from '../../components/sections/salary-difference-section'
import { StepIndicator } from '../../components/common/step-indicator'
import { UnpaidSalarySection } from '../../components/sections/unpaid-salary-section'
import {
	stepTransition,
	stepVariants,
} from '../../components/common/step-animation'
import { VerbasSection } from '../sections/verbas-section'
import type { V3CalculationFormData } from './v3-calculation-schema'
import { LivePreviewV3 } from './v3-live-preview'
import type { V3CalculationFormProps } from './v3-calculation-type'
import { SalaryPeriodsEditor } from './v3-salary-editor'
import { SalaryModeSelector } from './v3-salary-mode-selector'

const STEP_LABELS = ['Identificação', 'Contrato', 'Remuneração', 'Liquidação']
const TOTAL_STEPS = 4

export function V3CalculationForm({
	form,
	onSubmit,
	isPending,
	submitLabel,
	pendingLabel,
	onCancel,
	clientLocked,
}: V3CalculationFormProps) {
	const [step, setStep] = useState(1)
	const [direction, setDirection] = useState(1)
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [showLiquidacaoAdvanced, setShowLiquidacaoAdvanced] = useState(false)
	const {
		control,
		handleSubmit,
		watch,
		trigger,
		clearErrors,
		setValue,
		formState: { errors },
	} = form

	const terminationType = watch('terminationType')
	const salaryMode = watch('salaryMode')
	const isComJustaCausa = terminationType === 'com_justa_causa'

	const goNext = async () => {
		let fields: (keyof V3CalculationFormData)[] = []
		if (step === 1) fields = ['clientId']
		if (step === 2) {
			fields = ['terminationType', 'startDate', 'endDate']
			if (!isComJustaCausa && watch('priorNoticeWorked'))
				fields.push('priorNoticeDate')
		}
		if (step === 3) {
			if (salaryMode === 'simplificado') {
				fields = ['baseSalary', 'lastSalary', 'lastThreeSalariesAvg']
			} else {
				fields = ['salaryPeriods']
			}
			if (!isComJustaCausa) {
				fields.push('unpaid13ths', 'vacationCount')
			}
			fields.push('vacationVencidasCount', 'extraHours', 'nightHours')
			if (watch('salaryDifferenceEnabled'))
				fields.push('salaryDifferencePeriods')
			if (watch('customVerbas')?.length) fields.push('customVerbas')
			if (watch('unpaidSalariesEnabled')) fields.push('unpaidSalaries')
		}
		const valid = await trigger(fields)
		if (valid) {
			clearErrors()
			setDirection(1)
			setStep((s) => s + 1)
		}
	}

	const goPrev = () => {
		setDirection(-1)
		setStep((s) => s - 1)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<StepIndicator labels={STEP_LABELS} current={step} />

			{step === 1 && (
				<InfoBanner variant="tip">
					<span className="font-semibold">Como funciona:</span> em 4 passos você
					informa cliente, contrato, remuneração e liquidação. Passe o mouse
					sobre os ícones <span className="font-mono">?</span> para entender cada
					verba. Um preview do valor aparece enquanto você preenche.
				</InfoBanner>
			)}

			{step >= 3 && (
				<ContractSummaryBar
					clientName={watch('clientName')}
					startDate={watch('startDate')}
					endDate={watch('endDate')}
					terminationType={terminationType}
				/>
			)}

			<div className="overflow-hidden">
				<AnimatePresence mode="wait" custom={direction}>
					<motion.div
						key={step}
						custom={direction}
						variants={stepVariants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={stepTransition}
						className="space-y-4"
					>
						{step === 1 && <ClientSelectSection form={form} locked={clientLocked} />}

						{step === 2 && (
							<>
								<ContractSection
									form={form}
									showDates
									onComJustaCausa={() => {
										setValue('priorNoticeWorked', false)
										setValue('priorNoticeDate', '')
										setValue('unpaid13ths', '0')
										setValue('vacationCount', '0')
									}}
								/>

								{!isComJustaCausa && (
									<PriorNoticeSection
										control={control}
										watch={watch}
										errors={errors}
									/>
								)}

								<RiskAdditivesSection control={control} errors={errors} />
							</>
						)}

						{step === 3 && (
							<>
								<FormSection
									title="Remuneração"
									description="Valores em reais (R$)"
								>
									<SalaryModeSelector
										value={salaryMode ?? 'simplificado'}
										onChange={(mode) => {
											setValue('salaryMode', mode)
											if (mode === 'historico') {
												setValue('salaryPeriods', [])
											} else {
												setValue('salaryPeriods', undefined)
											}
										}}
									/>

									{salaryMode === 'simplificado' ? (
										<div className="mt-4">
											<RemunerationSection
												control={control}
												errors={errors}
												hideLastThreeSalariesAvg={isComJustaCausa}
											/>
										</div>
									) : (
										<div className="mt-4">
											<SalaryPeriodsEditor form={form} />
										</div>
									)}
								</FormSection>

								<VerbasSection
									control={control}
									watch={watch}
									errors={errors}
									hideComJustaCausaFields={isComJustaCausa}
								/>

								<button
									type="button"
									onClick={() => setShowAdvanced((v) => !v)}
									className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
								>
									<ChevronDownIcon
										className={`w-4 h-4 transition-transform ${showAdvanced ? '' : '-rotate-90'}`}
									/>
									Opções avançadas
									<span className="text-xs font-normal text-muted-foreground">
										(saldo de salário, equiparação, multas, outras verbas)
									</span>
								</button>

								{showAdvanced && (
									<div className="space-y-4">
										<UnpaidSalarySection form={form} />
										<SalaryDifferenceSection form={form} />
										<CustomVerbasSection form={form} />
										<AdditionalVerbasSection form={form} />
										<PenaltiesSection control={control} showArt467 />
									</div>
								)}

								<LivePreviewV3 form={form} />
							</>
						)}

						{step === 4 && (
							<>
								<div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 px-3.5 py-3">
									<AlertTriangleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
									<p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
										<span className="font-semibold">Liquidação:</span> Cálculo
										completo com correção monetária (IPCA-E), juros de mora,
										INSS patronal, IRPF, custas judiciais e honorários
										sucumbenciais.
									</p>
								</div>

								<FormSection title="Datas do Processo">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<FormField
											label="Data do ajuizamento"
											error={errors.filingDate?.message}
										>
											<Controller
												name="filingDate"
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
										<FormField
											label="Data da liquidação"
											error={errors.liquidationDate?.message}
										>
											<Controller
												name="liquidationDate"
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

									<div className="flex items-center justify-between mt-4">
										<div>
											<p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5">
										Aplicar prescrição quinquenal
										<HelpTip title="Prescrição quinquenal (CF art. 7º, XXIX)">Verbas com mais de 5 anos do ajuizamento são atingidas pela prescrição. Ativando, o cálculo corta o que vier antes da data-limite. Desligado por padrão porque a prescrição não é reconhecida de ofício.</HelpTip>
									</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{(() => {
													const base =
														watch('filingDate') || watch('liquidationDate')
													if (!base)
														return 'Corta verbas anteriores a 5 anos do ajuizamento (CF art. 7º, XXIX)'
													const d = new Date(base)
													d.setFullYear(d.getFullYear() - 5)
													const mm = String(d.getMonth() + 1).padStart(2, '0')
													return `Verbas anteriores a ${mm}/${d.getFullYear()} serão cortadas (CF art. 7º, XXIX)`
												})()}
											</p>
										</div>
										<Controller
											name="applyPrescricaoQuinquenal"
											control={control}
											render={({ field }) => (
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											)}
										/>
									</div>
								</FormSection>

								<button
									type="button"
									onClick={() => setShowLiquidacaoAdvanced((v) => !v)}
									className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
								>
									<ChevronDownIcon
										className={`w-4 h-4 transition-transform ${showLiquidacaoAdvanced ? '' : '-rotate-90'}`}
									/>
									Alíquotas e parâmetros
									<span className="text-xs font-normal text-muted-foreground">
										(já preenchidos com os padrões)
									</span>
								</button>

								{showLiquidacaoAdvanced && (
								<FormSection title="Alíquotas e Parâmetros">
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										<FormField
											label="% Adicional noturno"
											hint="Padrão: 20%"
											error={errors.nightAdditionalPercent?.message}
										>
											<Controller
												name="nightAdditionalPercent"
												control={control}
												render={({ field }) => (
													<Input
														type="number"
														inputMode="decimal"
														step="0.5"
														min={0}
														max={100}
														placeholder="20"
														value={field.value ?? 20}
														onChange={(e) =>
															field.onChange(
																e.target.value === ''
																	? undefined
																	: Number(e.target.value),
															)
														}
													/>
												)}
											/>
										</FormField>
										<FormField
											label="Alíquota SAT/RAT (%)"
											hint="Padrão: 3%"
											error={errors.satRate?.message}
										>
											<Controller
												name="satRate"
												control={control}
												render={({ field }) => (
													<Input
														type="number"
														inputMode="decimal"
														step="0.5"
														min={0}
														max={100}
														placeholder="3"
														value={field.value ?? 3}
														onChange={(e) =>
															field.onChange(
																e.target.value === ''
																	? undefined
																	: Number(e.target.value),
															)
														}
													/>
												)}
											/>
										</FormField>
										<FormField
											label="INSS patronal (%)"
											hint="Padrão: 20%"
											error={errors.employerInssRate?.message}
										>
											<Controller
												name="employerInssRate"
												control={control}
												render={({ field }) => (
													<Input
														type="number"
														inputMode="decimal"
														step="0.5"
														min={0}
														max={100}
														placeholder="20"
														value={field.value ?? 20}
														onChange={(e) =>
															field.onChange(
																e.target.value === ''
																	? undefined
																	: Number(e.target.value),
															)
														}
													/>
												)}
											/>
										</FormField>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
										<FormField
											label="Honorários sucumbenciais (%)"
											hint="Padrão: 15%"
											error={errors.honorariosRate?.message}
										>
											<Controller
												name="honorariosRate"
												control={control}
												render={({ field }) => (
													<Input
														type="number"
														inputMode="decimal"
														step="0.5"
														min={0}
														max={100}
														placeholder="15"
														value={field.value ?? 15}
														onChange={(e) =>
															field.onChange(
																e.target.value === ''
																	? undefined
																	: Number(e.target.value),
															)
														}
													/>
												)}
											/>
										</FormField>
										<FormField
											label="Dependentes IRPF"
											hint="Nº de dependentes para dedução IRPF"
											error={errors.irpfDependents?.message}
										>
											<Controller
												name="irpfDependents"
												control={control}
												render={({ field }) => (
													<Input
														type="number"
														inputMode="numeric"
														step="1"
														min={0}
														placeholder="0"
														value={field.value ?? 0}
														onChange={(e) =>
															field.onChange(
																e.target.value === ''
																	? undefined
																	: Number(e.target.value),
															)
														}
													/>
												)}
											/>
										</FormField>
									</div>
								</FormSection>
							)}
						</>
					)}
				</motion.div>
				</AnimatePresence>
			</div>

			<FormNavigation
				step={step}
				totalSteps={TOTAL_STEPS}
				isPending={isPending}
				submitLabel={submitLabel}
				pendingLabel={pendingLabel}
				onPrev={goPrev}
				onNext={goNext}
				onCancel={onCancel}
				onSubmit={() => handleSubmit(onSubmit)()}
				confirmTitle="Criar liquidação?"
				confirmDescription="Verifique os dados antes de confirmar. O cálculo de liquidação será gerado com correção monetária, juros e descontos."
			/>
		</form>
	)
}
