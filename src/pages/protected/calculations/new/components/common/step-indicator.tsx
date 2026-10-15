import { CheckIcon } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
	labels: string[]
	current: number
}

export function StepIndicator({ labels, current }: StepIndicatorProps) {
	return (
		<div className="flex items-start w-full">
			{labels.map((label, i) => {
				const num = i + 1
				const done = num < current
				const active = num === current
				return (
					<Fragment key={i}>
						<div className="flex flex-col items-center gap-1.5">
							<div
								className={cn(
									'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
									done
										? 'bg-primary border-primary text-primary-foreground'
										: active
											? 'border-primary text-primary'
											: 'border-border text-muted-foreground',
								)}
							>
								{done ? <CheckIcon className="w-3.5 h-3.5" /> : num}
							</div>
							<span
								className={cn(
									'text-xs font-medium',
									active
										? 'text-primary'
										: done
											? 'text-foreground'
											: 'text-muted-foreground',
								)}
							>
								{label}
							</span>
						</div>
						{i < labels.length - 1 && (
							<div
								className={cn(
									'flex-1 h-px mt-4 mx-2',
									done ? 'bg-primary' : 'bg-border',
								)}
							/>
						)}
					</Fragment>
				)
			})}
		</div>
	)
}
