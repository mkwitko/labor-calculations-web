import { formatCurrency } from "@/utils/value-format";

export type Line = {
	name: string;
	legalRef?: string;
	total: number;
	certainty: string;
};

export function sumLines(lines: Line[]): number {
	return lines.reduce((total, line) => total + line.total, 0);
}

export function VerbaList({ lines }: { lines: Line[] }) {
	return (
		<ul className="divide-y divide-border">
			{lines.map((line) => (
				<li
					key={line.name}
					className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
				>
					<div className="min-w-0">
						<p className="text-sm">{line.name}</p>
						{line.legalRef && (
							<p className="text-muted-foreground text-xs">{line.legalRef}</p>
						)}
					</div>
					<span className="whitespace-nowrap font-medium text-sm tabular-nums">
						{formatCurrency(line.total)}
					</span>
				</li>
			))}
		</ul>
	);
}
