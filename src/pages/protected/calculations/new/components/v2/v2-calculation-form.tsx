import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ClientSelectSection } from '../sections/client-select-section'
import { ContractSection } from '../sections/contract-section'
import { FormNavigation } from '../common/form-navigation'
import { PenaltiesSection } from '../sections/penalties-section'
import { PriorNoticeSection } from '../sections/prior-notice-section'
import { RemunerationSection } from '../sections/remuneration-section'
import { RiskAdditivesSection } from '../sections/risk-additives-section'
import { StepIndicator } from '../common/step-indicator'
import { stepTransition, stepVariants } from '../common/step-animation'
import { VerbasSection } from '../sections/verbas-section'
import type { V2CalculationFormData } from './v2-calculation-shema'
import { LivePreview } from './v2-live-preview'
import type { V2CalculationFormProps } from './v2-calculation-type'

const STEP_LABELS = ['Identificação', 'Contrato', 'Remuneração']
const TOTAL_STEPS = 3

export function V2CalculationForm({
	form,
	onSubmit,
	isPending,
	submitLabel,
	pendingLabel,
	onCancel,
	clientLocked,
}: V2CalculationFormProps) {
	const [step, setStep] = useState(1)
	const [direction, setDirection] = useState(1)
	const {
		register,
		control,
		handleSubmit,
		watch,
		trigger,
		clearErrors,
		setValue,
		formState: { errors },
	} = form

	const terminationType = watch('terminationType')
	const isComJustaCausa = terminationType === 'com_justa_causa'

	useEffect(() => {
		if (isComJustaCausa) {
			setValue('priorNoticeWorked', false)
			setValue('priorNoticeDate', '')
			setValue('lastThreeSalariesAvg', '0')
			setValue('unpaid13ths', '0')
			setValue('vacationCount', '0')
		}
	}, [isComJustaCausa, setValue])

	const goNext = async () => {
		let fields: (keyof V2CalculationFormData)[] = []
		if (step === 1) fields = ['clientId']
		if (step === 2) {
			fields = ['terminationType', 'startDate', 'endDate']
			if (!isComJustaCausa && watch('priorNoticeWorked'))
				fields.push('priorNoticeDate')
		}
		if (step === 3) {
			fields = ['baseSalary', 'lastSalary']
			if (!isComJustaCausa) {
				fields.push('lastThreeSalariesAvg', 'unpaid13ths', 'vacationCount')
			}
			fields.push('vacationVencidasCount', 'extraHours', 'nightHours')
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
										setValue('lastThreeSalariesAvg', '0')
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
								<RemunerationSection
									control={control}
									errors={errors}
									hideLastThreeSalariesAvg={isComJustaCausa}
								/>

								<VerbasSection
									control={control}
									watch={watch}
									errors={errors}
									hideComJustaCausaFields={isComJustaCausa}
								/>

								<PenaltiesSection control={control} />

								<LivePreview form={form} />
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
			/>
		</form>
	)
}
