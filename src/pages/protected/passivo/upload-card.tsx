import {
	AlertTriangleIcon,
	DownloadIcon,
	FileSpreadsheetIcon,
	UploadCloudIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
	appendBatchAssessmentRows,
	createBatchAssessment,
} from "@/http/generated/batch-assessment/batch-assessment";
import {
	downloadPayrollTemplate,
	type ParseResult,
	parsePayrollFile,
} from "./parse-payroll";

/**
 * Teto por requisição, igual ao do backend. Arquivo maior vira várias chamadas
 * contra o mesmo lote — nenhuma delas segurando o servidor por minutos.
 */
const CHUNK = 300;

export function UploadCard({ onCreated }: { onCreated: (id: string) => void }) {
	const [name, setName] = useState("");
	const [fileName, setFileName] = useState<string | null>(null);
	const [parsed, setParsed] = useState<ParseResult | null>(null);
	const [sent, setSent] = useState(0);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleFile(file: File | undefined) {
		if (!file) return;
		setError(null);
		setParsed(null);
		setFileName(file.name);
		try {
			const result = await parsePayrollFile(file);
			setParsed(result);
			if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
		} catch {
			setFileName(null);
			setError("Não conseguimos ler este arquivo. Use CSV ou XLSX.");
		}
	}

	function clearFile() {
		setFileName(null);
		setParsed(null);
		setError(null);
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		multiple: false,
		accept: {
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".xls"],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
				".xlsx",
			],
		},
		onDrop: (accepted) => void handleFile(accepted[0]),
		onDropRejected: () =>
			setError("Formato não aceito. Envie um arquivo CSV ou XLSX."),
		disabled: isSending,
	});

	async function send() {
		if (!parsed || parsed.rows.length === 0) return;
		setIsSending(true);
		setError(null);
		setSent(0);

		try {
			const [first, ...rest] = chunk(parsed.rows, CHUNK);
			const batch = await createBatchAssessment({ name, rows: first });
			setSent(first.length);

			for (const part of rest) {
				await appendBatchAssessmentRows(batch.id, { rows: part });
				setSent((current) => current + part.length);
			}

			onCreated(batch.id);
		} catch (err) {
			// 402 é recusa de plano, e vem com a mensagem certa do servidor: a
			// genérica ("ficou incompleta — confira na lista") mandaria a pessoa
			// procurar uma avaliação que nunca chegou a existir.
			const status = (err as { response?: { status?: number } })?.response
				?.status;
			const message = (
				err as { response?: { data?: { message?: string } } }
			)?.response?.data?.message;

			setError(
				status === 402 && message
					? message
					: "O envio falhou no meio do caminho. A avaliação pode ter ficado incompleta — confira na lista.",
			);
		} finally {
			setIsSending(false);
		}
	}

	const parts = parsed ? Math.ceil(parsed.rows.length / CHUNK) : 0;

	return (
		<Card>
			<CardContent className="space-y-4">
				<div>
					<h2 className="font-medium text-sm">Subir a folha</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						CSV ou XLSX com uma linha por funcionário. Você confere o que foi
						lido antes de calcular.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onClick={downloadPayrollTemplate}>
						<DownloadIcon /> Baixar planilha modelo
					</Button>
				</div>

				{fileName ? (
					<div className="flex items-center gap-3 rounded-lg border border-border p-3">
						<FileSpreadsheetIcon className="size-5 shrink-0 text-muted-foreground" />
						<p className="min-w-0 flex-1 truncate text-sm">{fileName}</p>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Remover arquivo"
							disabled={isSending}
							onClick={clearFile}
						>
							<XIcon />
						</Button>
					</div>
				) : (
					<div
						{...getRootProps()}
						className={cn(
							"flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30",
							isDragActive && "border-primary bg-primary/5",
							isSending && "cursor-not-allowed opacity-60",
						)}
					>
						<input {...getInputProps()} aria-label="Arquivo da folha" />
						<UploadCloudIcon className="size-6 text-muted-foreground" />
						<p className="text-sm">
							{isDragActive
								? "Solte o arquivo aqui"
								: "Arraste a planilha ou clique para selecionar"}
						</p>
						<p className="text-muted-foreground text-xs">CSV, XLSX ou XLS</p>
					</div>
				)}

				{error && <InfoBanner variant="warning">{error}</InfoBanner>}

				{parsed && (
					<div className="space-y-4">
						{/* A contagem vem antes de tudo: é o que a pessoa quer confirmar
						    assim que solta o arquivo. */}
						<div className="rounded-lg border border-border p-4">
							<p className="font-semibold text-lg tabular-nums">
								{parsed.total}{" "}
								<span className="font-normal text-muted-foreground text-sm">
									{parsed.total === 1
										? "funcionário encontrado"
										: "funcionários encontrados"}
								</span>
							</p>
							<p className="mt-1 text-muted-foreground text-sm">
								{parsed.rows.length} prontos para calcular
								{parsed.problems.length > 0 &&
									` · ${parsed.problems.length} com problema`}
							</p>
							{parts > 1 && (
								<p className="mt-2 text-muted-foreground text-xs">
									Como passa de {CHUNK} linhas, o envio será feito em {parts}{" "}
									partes. É automático — só não feche a página.
								</p>
							)}
						</div>

						{parsed.problems.length > 0 && (
							<div className="rounded-lg border border-amber-200 p-4 dark:border-amber-900">
								<p className="flex items-center gap-2 font-medium text-sm">
									<AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
									Linhas que ficarão de fora
								</p>
								<ul className="mt-2 space-y-1 text-muted-foreground text-xs">
									{parsed.problems.slice(0, 8).map((problem) => (
										<li key={`${problem.line}-${problem.reference}`}>
											Linha {problem.line} ({problem.reference}):{" "}
											{problem.reason}
										</li>
									))}
									{parsed.problems.length > 8 && (
										<li>e mais {parsed.problems.length - 8}…</li>
									)}
								</ul>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="batch-name">Nome da avaliação</Label>
							<Input
								id="batch-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Cliente X — folha de julho"
							/>
						</div>

						{isSending && parts > 1 && (
							<div className="space-y-1.5">
								<p className="text-muted-foreground text-xs">
									Calculando {sent} de {parsed.rows.length}
								</p>
								<Progress value={(sent / parsed.rows.length) * 100} />
							</div>
						)}

						<Button
							size="lg"
							disabled={
								isSending || parsed.rows.length === 0 || name.trim().length < 2
							}
							onClick={send}
						>
							<UploadIcon />
							{isSending
								? "Calculando..."
								: `Calcular ${parsed.rows.length} ${parsed.rows.length === 1 ? "funcionário" : "funcionários"}`}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function chunk<T>(items: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		out.push(items.slice(index, index + size));
	}
	return out;
}
