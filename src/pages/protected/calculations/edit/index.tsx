import { Button } from '@/components/ui/button'
import { useUpdateLaborCalculationV3 } from '@/http/generated/labor-calculation-v3/labor-calculation-v3'
import {
	getGetLaborCalculationQueryKey,
	getListLaborCalculationQueryKey,
	useGetLaborCalculation,
	useUpdateLaborCalculation,
} from '@/http/generated/labor-calculation/labor-calculation'
import { queryClient } from '@/lib/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { V2CalculationForm } from '../new/components/v2/v2-calculation-form'
import {
	type V2CalculationFormData,
	v2CalculationSchema,
} from '../new/components/v2/v2-calculation-shema'
import { buildNewVerbasPayload } from '../new/components/v3/hooks/build-new-verbas-payload'
import { periodsToSalaryHistory } from '../new/components/v3/hooks/periods-to-salary-history'
import { V3CalculationForm } from '../new/components/v3/v3-calculation-form'
import {
	type V3CalculationFormData,
	v3CalculationSchema,
} from '../new/components/v3/v3-calculation-schema'

function toDateString(value: string | Date | null | undefined): string {
	if (!value) return ''
	return new Date(value).toISOString().split('T')[0]
}

function toMonthString(value: string | Date | null | undefined): string {
	return toDateString(value).slice(0, 7)
}

export default function EditCalculation() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	if (!id) return <Navigate to="/calculations" />

	const { data: calc, isLoading } = useGetLaborCalculation(id)

	const { mutateAsync: mutateV2, isPending: isPendingV2 } =
		useUpdateLaborCalculation({
			mutation: {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: getListLaborCalculationQueryKey(),
					})
					queryClient.invalidateQueries({
						queryKey: getGetLaborCalculationQueryKey(id),
					})
					navigate(`/calculations/${id}`)
				},
			},
		})

	const { mutateAsync: mutateV3, isPending: isPendingV3 } =
		useUpdateLaborCalculationV3({
			mutation: {
				onSuccess: async () => {
					await Promise.all([queryClient.invalidateQueries({
						queryKey: getListLaborCalculationQueryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: getGetLaborCalculationQueryKey(id),
					})])
					navigate(`/calculations/${id}`)
				},
			},
		})

	const isV3 = calc?.calculationVersion === 'v3'
	const isPending = isPendingV2 || isPendingV3

	const v2Form = useForm<V2CalculationFormData>({
		resolver: zodResolver(v2CalculationSchema),
		values:
			calc && !isV3
				? {
					clientId: calc.clientId ?? '',
					clientName: calc.clientName,
					clientDocument: calc.clientDocument ?? '',
					terminationType:
						calc.terminationType as V2CalculationFormData['terminationType'],
					startDate: toDateString(calc?.startDate),
					endDate: toDateString(calc?.endDate),
					priorNoticeWorked: calc?.priorNoticeWorked ?? false,
					priorNoticeDate: toDateString(calc?.priorNoticeDate),
					baseSalary: String(calc?.baseSalary),
					lastSalary: String(calc?.lastSalary),
					lastThreeSalariesAvg: String(calc?.lastThreeSalariesAvg),
					unpaid13ths: String(calc?.unpaid13ths),
					vacationCount: String(calc?.vacationCount),
					vacationVencidasCount: String(calc.vacationVencidasCount ?? 0),
					extraHours: String(calc?.extraHours),
					nightHours: String(calc?.nightHours),
					insalubrityLevel: String(
						calc?.insalubrityLevel,
					) as V2CalculationFormData['insalubrityLevel'],
					dangerousWork: calc?.dangerousWork,
					applyArt477Fine: calc.applyArt477Fine ?? false,
					observations: calc.observations ?? '',
				}
				: undefined,
	})

	const v3Form = useForm<V3CalculationFormData>({
		resolver: zodResolver(v3CalculationSchema),
		values:
			calc && isV3
				? {
					salaryMode: 'simplificado',
					clientId: calc.clientId ?? '',
					clientName: calc.clientName,
					clientDocument: calc.clientDocument ?? '',
					terminationType:
						calc.terminationType as V3CalculationFormData['terminationType'],
					startDate: toDateString(calc?.startDate),
					endDate: toDateString(calc?.endDate),
					priorNoticeWorked: calc?.priorNoticeWorked ?? false,
					priorNoticeDate: toDateString(calc?.priorNoticeDate),
					baseSalary: String(calc?.baseSalary),
					lastSalary: String(calc?.lastSalary),
					lastThreeSalariesAvg: String(calc?.lastThreeSalariesAvg),
					unpaid13ths: String(calc?.unpaid13ths),
					vacationCount: String(calc?.vacationCount),
					vacationVencidasCount: String(calc?.vacationVencidasCount ?? 0),
					extraHours: String(calc?.extraHours),
					nightHours: String(calc?.nightHours),
					insalubrityLevel: String(
						calc?.insalubrityLevel,
					) as V3CalculationFormData['insalubrityLevel'],
					dangerousWork: calc?.dangerousWork ?? false,
					applyArt477Fine: calc?.applyArt477Fine ?? false,
					observations: calc.observations ?? '',
					filingDate: toDateString(calc?.filingDate) || undefined,
					liquidationDate: toDateString(calc?.liquidationDate) || undefined,
					nightAdditionalPercent: calc?.nightAdditionalPercent ?? 20,
					satRate: calc?.satRate != null ? calc?.satRate * 100 : 3,
					employerInssRate:
						calc?.employerInssRate != null
							? calc?.employerInssRate * 100
							: 20,
					honorariosRate:
						calc?.honorariosRate != null ? calc?.honorariosRate * 100 : 15,
					irpfDependents: calc?.irpfDependents ?? 0,
					applyArt467: calc?.applyArt467 ?? false,
					applyPrescricaoQuinquenal: calc?.applyPrescricaoQuinquenal ?? false,
					salaryDifferenceEnabled:
						Boolean(calc?.salaryDifferenceType) &&
						(calc?.salaryDifferencePeriods?.length ?? 0) > 0,
					salaryDifferenceType: calc?.salaryDifferenceType ?? 'equiparacao',
					salaryDifferenceMode: calc?.salaryDifferencePeriods?.length
						? calc.salaryDifferencePeriods.every(
							(p) => p.receivedSalary === 0,
						)
							? 'valor'
							: 'paradigma'
						: 'paradigma',
					paradigmName: calc?.paradigmName ?? '',
					salaryDifferenceApplyReflexos:
						calc?.salaryDifferenceApplyReflexos ?? true,
					salaryDifferencePeriods: (calc?.salaryDifferencePeriods ?? []).map(
						(p) => ({
							startMonth: toMonthString(p.startMonth),
							endMonth: toMonthString(p.endMonth),
							value: String(p.dueSalary),
						}),
					),
					customVerbas: (calc?.customVerbas ?? []).map((v) => ({
						name: v.name,
						monthlyValue: String(v.monthlyValue),
						startMonth: toMonthString(v.startMonth),
						endMonth: toMonthString(v.endMonth),
						nature: v.nature,
					})),
					unpaidSalariesEnabled: (calc?.unpaidSalaries?.length ?? 0) > 0,
					unpaidSalaries: (calc?.unpaidSalaries ?? []).map((u) => ({
						month: toMonthString(u.month),
						daysWorked: String(u.daysWorked),
					})),
					intervalIntrajornadaHours: calc?.intervalIntrajornadaHours
						? String(calc.intervalIntrajornadaHours)
						: '',
					transferAdditionalMonths: calc?.transferAdditionalMonths
						? String(calc.transferAdditionalMonths)
						: '',
					applyDsrOnExtra: calc?.applyDsrOnExtra ?? false,
					stabilityMonths: calc?.stabilityMonths
						? String(calc.stabilityMonths)
						: '',
					fgtsAlreadyDeposited: calc?.fgtsAlreadyDeposited
						? String(calc.fgtsAlreadyDeposited)
						: '',
					amountsAlreadyPaid: calc?.amountsAlreadyPaid
						? String(calc.amountsAlreadyPaid)
						: '',
				}
				: undefined,
	})

	async function onV2Submit(data: V2CalculationFormData) {
		const isComJustaCausa = data.terminationType === 'com_justa_causa'
		await mutateV2({
			id: id as string,
			data: {
				clientName: data.clientName,
				clientId: data.clientId,
				clientDocument: data.clientDocument || undefined,
				observations: data.observations || undefined,
				terminationType: data.terminationType,
				startDate: data.startDate,
				endDate: data.endDate,
				priorNoticeWorked: isComJustaCausa ? false : data.priorNoticeWorked,
				priorNoticeDate: isComJustaCausa
					? undefined
					: data.priorNoticeDate || undefined,
				baseSalary: Number(data.baseSalary?.replace(',', '.')),
				lastSalary: Number(data.lastSalary?.replace(',', '.')),
				lastThreeSalariesAvg: Number(
					(isComJustaCausa ? '0' : (data.lastThreeSalariesAvg ?? '0')).replace(
						',',
						'.',
					),
				),
				unpaid13ths: isComJustaCausa ? 0 : Number(data.unpaid13ths ?? '0'),
				vacationCount: isComJustaCausa ? 0 : Number(data.vacationCount ?? '0'),
				vacationVencidasCount: Number(data.vacationVencidasCount),
				extraHours: Number(data.extraHours),
				nightHours: Number(data.nightHours),
				insalubrityLevel: Number(data.insalubrityLevel) as 10 | 20 | 40,
				dangerousWork: data.dangerousWork,
				applyArt477Fine: data.applyArt477Fine,
			},
		})
	}

	async function onV3Submit(data: V3CalculationFormData) {
		const isHistorico = data.salaryMode === 'historico'
		const salaryHistory = isHistorico
			? periodsToSalaryHistory(data.salaryPeriods ?? [])
			: undefined

		const baseSalary = isHistorico
			? (salaryHistory?.[0]?.baseSalary ?? 0)
			: Number((data.baseSalary ?? '0').replace(',', '.'))
		const lastSalary = isHistorico
			? (salaryHistory?.[salaryHistory.length - 1]?.lastSalary ?? 0)
			: Number((data.lastSalary ?? '0').replace(',', '.'))
		const lastThreeSalariesAvg = isHistorico
			? (() => {
				if (!salaryHistory || salaryHistory.length === 0) return 0
				const last3 = salaryHistory.slice(-3)
				return last3.reduce((sum, s) => sum + s.lastSalary, 0) / last3.length
			})()
			: Number((data.lastThreeSalariesAvg ?? '0').replace(',', '.'))

		await mutateV3({
			id: id as string,
			data: {
				clientName: data.clientName,
				clientId: data.clientId,
				clientDocument: data.clientDocument || undefined,
				observations: data.observations || undefined,
				terminationType: data.terminationType,
				startDate: data.startDate,
				endDate: data.endDate,
				priorNoticeWorked: data.priorNoticeWorked,
				priorNoticeDate: data.priorNoticeDate || undefined,
				baseSalary,
				lastSalary,
				lastThreeSalariesAvg,
				unpaid13ths: Number(data.unpaid13ths),
				vacationCount: Number(data.vacationCount),
				vacationVencidasCount: Number(data.vacationVencidasCount),
				extraHours: Number(data.extraHours),
				nightHours: Number(data.nightHours),
				insalubrityLevel: Number(data.insalubrityLevel) as 10 | 20 | 40,
				dangerousWork: data.dangerousWork,
				applyArt477Fine: data.applyArt477Fine,
				filingDate: data.filingDate || undefined,
				liquidationDate: data.liquidationDate || undefined,
				nightAdditionalPercent: data.nightAdditionalPercent,
				satRate: data.satRate,
				employerInssRate: data.employerInssRate,
				honorariosRate: data.honorariosRate,
				irpfDependents: data.irpfDependents,
				salaryHistory: salaryHistory?.length ? salaryHistory : undefined,
				// update semantics: undefined keeps stored data — send null/[] to clear
				...(() => {
					const payload = buildNewVerbasPayload(data)
					return {
						...payload,
						salaryDifference: payload.salaryDifference ?? null,
						customVerbas: payload.customVerbas ?? [],
						unpaidSalaries: payload.unpaidSalaries ?? [],
					}
				})(),
			},
		})
	}

	if (isLoading) {
		return (
			<div className="p-6 flex items-center justify-center h-40">
				<p className="text-sm text-muted-foreground">Carregando...</p>
			</div>
		)
	}

	return (
		<div className="p-4 md:p-6 w-full space-y-4 md:space-y-6">
			<div className="flex items-start gap-3">
				<Button
					variant="ghost"
					size="icon-sm"
					type="button"
					aria-label="Voltar"
					className="mt-0.5"
					onClick={() => navigate(-1)}
				>
					<ArrowLeftIcon />
				</Button>
				<div>
					<h1 className="text-xl font-semibold text-foreground">
						Editar {isV3 ? 'Liquidação' : 'Estimativa'}
					</h1>
					<p className="text-sm text-muted-foreground">
						Altere os dados e o cálculo será refeito automaticamente
					</p>
				</div>
			</div>

			{isV3 ? (
				<V3CalculationForm
					form={v3Form}
					onSubmit={onV3Submit}
					isPending={isPending}
					submitLabel="Salvar alterações"
					pendingLabel="Salvando..."
					onCancel={() => navigate(`/calculations/${id}`)}
				/>
			) : (
				<V2CalculationForm
					form={v2Form}
					onSubmit={onV2Submit}
					isPending={isPending}
					submitLabel="Salvar alterações"
					pendingLabel="Salvando..."
					onCancel={() => navigate(`/calculations/${id}`)}
				/>
			)}
		</div>
	)
}
