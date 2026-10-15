import { ChevronDownIcon, HelpCircleIcon } from "lucide-react";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * Espelho em prosa de `buildEmployerResult` (jurispro-back). Se a regra de
 * composição mudar lá, este texto muda junto.
 */
export function MethodologyPanel() {
	const [open, setOpen] = useState(false);

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm hover:bg-muted/30 transition-colors">
				<HelpCircleIcon className="size-4 text-muted-foreground" />
				<span className="flex-1 text-left font-medium">
					Como calculamos estes números
				</span>
				<ChevronDownIcon
					className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</CollapsibleTrigger>
			<CollapsibleContent className="space-y-3 rounded-b-lg border border-t-0 border-border px-4 py-3 text-muted-foreground text-sm">
				<p>
					<strong className="text-foreground">Custo de desligar</strong> é o
					cheque de hoje: as verbas que se provam com documento (saldo de
					salário, aviso prévio, 13º, férias + 1/3, FGTS e multa de 40%) mais
					os encargos patronais (INSS empresa e SAT/RAT) sobre as bases do
					período.
				</p>
				<p>
					<strong className="text-foreground">Exposição em reclamação</strong>{" "}
					é o cenário ruim: o custo de desligar somado às verbas que dependem
					de prova (horas extras, adicional noturno, insalubridade,
					periculosidade) e ao custo do processo — custas judiciais e
					honorários de sucumbência.
				</p>
				<p>
					<strong className="text-foreground">Diferença</strong> é exposição
					menos custo: o que está em jogo entre desligar com a documentação em
					ordem e discutir tudo em juízo. Cada linha usa a mesma tabela de
					índices do lote, então os valores são comparáveis entre si.
				</p>
				<p className="text-xs">
					Clique em um funcionário para ver o demonstrativo verba a verba.
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}
