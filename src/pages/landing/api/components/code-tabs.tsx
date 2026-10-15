import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { snippets } from "../content";

/**
 * Exemplo copiável em três linguagens. Copiar é a ação principal: quem lê a
 * página quer o primeiro request funcionando, não ler código na tela.
 */
export function CodeTabs() {
	const [active, setActive] = useState(snippets[0].id);
	const [copied, setCopied] = useState(false);

	const current =
		snippets.find((snippet) => snippet.id === active) ?? snippets[0];

	async function copy() {
		await navigator.clipboard.writeText(current.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card">
			<div className="flex items-center justify-between gap-2 border-border border-b px-2 py-2">
				<div className="flex gap-1">
					{snippets.map((snippet) => (
						<button
							key={snippet.id}
							type="button"
							onClick={() => setActive(snippet.id)}
							className={
								snippet.id === active
									? "rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs"
									: "rounded-md px-3 py-1.5 font-medium text-muted-foreground text-xs hover:text-foreground"
							}
						>
							{snippet.label}
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={copy}
					className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground text-xs hover:text-foreground"
				>
					{copied ? (
						<CheckIcon className="size-3.5" />
					) : (
						<CopyIcon className="size-3.5" />
					)}
					{copied ? "Copiado" : "Copiar"}
				</button>
			</div>

			<pre className="overflow-x-auto bg-background p-4 text-xs leading-relaxed">
				<code>{current.code}</code>
			</pre>
		</div>
	);
}
