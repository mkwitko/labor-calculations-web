import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/utils/value-format";
import { VerbaBreakdownTable } from "./verba-breakdown-table";

const verbas = [
	{
		name: "Aviso Prévio",
		legalRef: "CLT art. 487",
		bruto: 100,
		corrigido: 110,
		juros: 5,
		total: 115,
	},
	{ name: "Zerada", total: 0, bruto: 0 },
];

describe("VerbaBreakdownTable", () => {
	it("mostra nome, base legal e total; esconde verba zerada", () => {
		render(<VerbaBreakdownTable verbas={verbas} />);
		expect(screen.getByText("Aviso Prévio")).toBeInTheDocument();
		expect(screen.getByText("CLT art. 487")).toBeInTheDocument();
		expect(screen.queryByText("Zerada")).not.toBeInTheDocument();
	});

	it("só mostra colunas intermediárias pedidas", () => {
		render(<VerbaBreakdownTable verbas={verbas} columns={["bruto"]} />);
		expect(screen.getByText("Bruto")).toBeInTheDocument();
		expect(screen.queryByText("Juros")).not.toBeInTheDocument();
	});

	it("soma o rodapé por coluna quando footerLabel é passado", () => {
		render(
			<VerbaBreakdownTable
				verbas={[
					{ name: "A", bruto: 100, corrigido: 110, juros: 5, total: 115 },
					{ name: "B", bruto: 200, corrigido: 220, juros: 10, total: 230 },
				]}
				columns={["bruto", "corrigido", "juros"]}
				footerLabel="Subtotal Verbas"
			/>,
		);
		expect(screen.getByText("Subtotal Verbas")).toBeInTheDocument();
		// Totais: bruto 300, corrigido 330, juros 15, total 345. O matcher não
		// passa pelo normalizador do testing-library, então o NBSP do
		// formatCurrency precisa virar espaço comum aqui.
		const money = (n: number) => formatCurrency(n).replace(/\u00a0/g, " ");
		expect(screen.getByText(money(300))).toBeInTheDocument();
		expect(screen.getByText(money(345))).toBeInTheDocument();
	});
});
