import { errors } from "../content";

export function ErrorTable() {
	return (
		<div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
			{errors.map((error) => (
				<div
					key={error.status}
					className="flex flex-col gap-1 bg-card px-5 py-4 sm:flex-row sm:gap-5"
				>
					<span className="font-mono font-semibold text-foreground text-sm sm:w-16">
						{error.status}
					</span>
					<div>
						<p className="font-medium text-foreground text-sm">{error.title}</p>
						<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
							{error.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
