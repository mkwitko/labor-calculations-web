import { endpoints } from "../content";

/**
 * Os endpoints explicados em prosa, campo por campo.
 *
 * Existe além da referência OpenAPI porque a referência responde "quais campos
 * existem" e não "quais importam": obrigatório inerte, unidade de percentual e
 * o que é total do contrato contra o que é por mês são justamente onde quem
 * integra erra.
 */
export function EndpointList() {
	return (
		<div className="space-y-6">
			{endpoints.map((endpoint) => (
				<article
					key={endpoint.path}
					className="overflow-hidden rounded-xl border border-border bg-card"
				>
					<header className="flex flex-wrap items-center gap-2 border-border border-b px-5 py-4">
						<span className="rounded-md bg-primary px-2 py-1 font-mono font-semibold text-primary-foreground text-xs">
							{endpoint.method}
						</span>
						<code className="overflow-x-auto font-mono text-foreground text-sm">
							{endpoint.path}
						</code>
						<span className="ml-auto text-muted-foreground text-xs">
							{endpoint.billing}
						</span>
					</header>

					<div className="space-y-5 px-5 py-5">
						<div>
							<h3 className="font-semibold text-foreground text-sm">
								{endpoint.title}
							</h3>
							<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
								{endpoint.description}
							</p>
						</div>

						<FieldGroup label="Campos obrigatórios" fields={endpoint.required} />

						{endpoint.optional.length > 0 && (
							<FieldGroup
								label="Campos opcionais que mudam o resultado"
								fields={endpoint.optional}
							/>
						)}

						<div>
							<p className="font-medium text-foreground text-xs uppercase tracking-wide">
								Resposta
							</p>
							<ul className="mt-2 space-y-1.5">
								{endpoint.returns.map((item) => (
									<li
										key={item}
										className="text-muted-foreground text-sm leading-relaxed"
									>
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</article>
			))}
		</div>
	);
}

function FieldGroup({
	label,
	fields,
}: {
	label: string;
	fields: Array<{ name: string; type: string; note: string }>;
}) {
	return (
		<div>
			<p className="font-medium text-foreground text-xs uppercase tracking-wide">
				{label}
			</p>
			<dl className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
				{fields.map((field) => (
					<div
						key={field.name}
						className="flex flex-col gap-1 bg-background px-4 py-3 sm:flex-row sm:gap-4"
					>
						<dt className="sm:w-64 sm:shrink-0">
							<code className="font-mono text-foreground text-xs">
								{field.name}
							</code>
							<span className="ml-2 text-muted-foreground text-xs">
								{field.type}
							</span>
						</dt>
						<dd className="text-muted-foreground text-sm leading-relaxed">
							{field.note}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
