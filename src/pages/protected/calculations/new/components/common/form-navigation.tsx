import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface FormNavigationProps {
	step: number
	totalSteps: number
	isPending: boolean
	submitLabel: string
	pendingLabel: string
	onPrev: () => void
	onNext: () => void
	onCancel: () => void
	onSubmit: () => void
	confirmTitle?: string
	confirmDescription?: string
}

export function FormNavigation({
	step,
	totalSteps,
	isPending,
	submitLabel,
	pendingLabel,
	onPrev,
	onNext,
	onCancel,
	onSubmit,
	confirmTitle = 'Criar cálculo?',
	confirmDescription = 'Verifique os dados antes de confirmar. O cálculo será gerado com base nas informações preenchidas.',
}: FormNavigationProps) {
	return (
		<div className="sticky bottom-0 z-10 -mx-4 md:-mx-6 -mb-4 md:-mb-6 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 md:px-6 py-3 supports-[backdrop-filter]:backdrop-blur-sm">
			<div>
				{step > 1 && (
					<Button type="button" variant="ghost" onClick={onPrev}>
						← Anterior
					</Button>
				)}
			</div>
			<div className="flex items-center gap-3">
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button type="button" variant="outline">
							Cancelar
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent size="sm">
						<AlertDialogHeader>
							<AlertDialogTitle>Cancelar criação?</AlertDialogTitle>
							<AlertDialogDescription>
								Os dados preenchidos serão perdidos.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Continuar editando</AlertDialogCancel>
							<AlertDialogAction variant="destructive" onClick={onCancel}>
								Cancelar
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{step < totalSteps ? (
					<Button type="button" onClick={onNext}>
						Próximo →
					</Button>
				) : (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button type="button" disabled={isPending}>
								{isPending ? pendingLabel : submitLabel}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent size="sm">
							<AlertDialogHeader>
								<AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
								<AlertDialogDescription>
									{confirmDescription}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Revisar</AlertDialogCancel>
								<AlertDialogAction onClick={onSubmit}>
									{submitLabel}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>
		</div>
	)
}
