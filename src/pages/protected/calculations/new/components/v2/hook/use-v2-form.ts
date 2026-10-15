import { linkCalculationToCase } from '@/http/generated/case/case'
import { getListLaborCalculationQueryKey, useCreateLaborCalculation } from '@/http/generated/labor-calculation/labor-calculation'
import { captureEvent } from '@/lib/analytics'
import { queryClient } from '@/lib/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { CloneSource } from '../../../@types/clone-source'
import { buildV2Defaults } from '../data/v2-default'
import {
	type V2CalculationFormData,
	v2CalculationSchema,
} from '../v2-calculation-shema'

export default function useV2Form({
	cloneFrom,
	caseId,
	lockedClient,
}: {
	cloneFrom: CloneSource | undefined
	caseId?: string
	lockedClient?: { id: string; name: string }
}) {
	const navigate = useNavigate()
	const { mutateAsync: mutateV2, isPending: isPendingV2 } =
		useCreateLaborCalculation({
			mutation: {
				onSuccess: async ({ id }) => {
					const promises = []
					if (caseId) {
						promises.push(linkCalculationToCase(caseId, id))
					}
					promises.push(queryClient.invalidateQueries({
						queryKey: getListLaborCalculationQueryKey()
					}))
					await Promise.all(promises)
					captureEvent("calculation_created", { version: "v2", linkedToCase: !!caseId })
					navigate(`/calculations/${id}`)

				},
			},
		})

	const v2Form = useForm<V2CalculationFormData>({
		resolver: zodResolver(v2CalculationSchema),
		defaultValues: buildV2Defaults(cloneFrom, lockedClient),
	})

	async function onV2Submit(data: V2CalculationFormData) {
		const isComJustaCausa = data.terminationType === 'com_justa_causa'
		await mutateV2({
			data: {
				...(data.clientId ? { clientId: data.clientId } : {}),
				clientName: data.clientName ?? '',
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

	return {
		v2Form,
		isPendingV2,
		onV2Submit,
	}
}
