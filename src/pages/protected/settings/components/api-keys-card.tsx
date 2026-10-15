import { CheckIcon, CopyIcon, KeyRoundIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	getListApiKeysQueryKey,
	useCreateApiKey,
	useListApiKeys,
	useRevokeApiKey,
} from "@/http/generated/api-key/api-key";
import { useOrganizations } from "@/hooks/use-organizations";
import { usePlanFeature } from "@/hooks/use-plan-features";
import { queryClient } from "@/lib/react-query";
import { formatDate } from "@/utils/value-format";

/**
 * Chaves de integração da organização.
 *
 * O token completo aparece **uma vez**, no diálogo logo após criar: o back
 * guarda só o sha256, então nem a listagem nem o suporte conseguem mostrá-lo de
 * novo. É por isso que o aviso é tão explícito.
 */
export function ApiKeysCard() {
	const { role } = useOrganizations();
	const canManage = role === "owner" || role === "admin";
	const apiAccess = usePlanFeature("public_api");

	const [name, setName] = useState("");
	const [mode, setMode] = useState<"live" | "test">("live");
	const [issuedToken, setIssuedToken] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [revoking, setRevoking] = useState<{ id: string; name: string } | null>(
		null,
	);

	const { data: keys, isLoading } = useListApiKeys({
		query: { enabled: canManage },
	});

	function refresh() {
		queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
	}

	const { mutate: create, isPending: isCreating } = useCreateApiKey({
		mutation: {
			onSuccess: (issued) => {
				setIssuedToken(issued.token);
				setName("");
				refresh();
			},
			onError: (err) => {
				// A recusa por plano tem mensagem própria do servidor, com o nome do
				// plano que libera — dizer "não conseguimos agora" esconderia o
				// caminho para resolver.
				const status = (err as { response?: { status?: number } })?.response
					?.status;
				const message = (
					err as { response?: { data?: { message?: string } } }
				)?.response?.data?.message;

				toast.error(
					status === 402 && message
						? message
						: "Não conseguimos criar a chave agora.",
				);
			},
		},
	});

	const { mutate: revoke, isPending: isRevoking } = useRevokeApiKey({
		mutation: {
			onSuccess: () => {
				refresh();
				setRevoking(null);
				toast.success("Chave revogada.");
			},
			onError: () => toast.error("Não conseguimos revogar agora."),
		},
	});

	if (!canManage) return null;

	async function copyToken() {
		if (!issuedToken) return;
		await navigator.clipboard.writeText(issuedToken);
		setCopied(true);
		toast.success("Token copiado.");
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-5">
			<div className="flex items-center gap-2">
				<KeyRoundIcon className="size-4 text-muted-foreground" />
				<h3 className="font-semibold text-foreground text-sm">Chaves de API</h3>
			</div>
			<p className="text-muted-foreground text-xs">
				Uma chave permite que o seu sistema peça cálculos de liquidação
				diretamente, sem passar por esta tela. Cada cálculo feito por ela é
				cobrado por uso.
				{/* Documentação é da landing, fora do roteador do app autenticado. */}
				<a
					href="/api"
					className="ml-1 text-primary underline-offset-2 hover:underline"
				>
					Ver documentação
				</a>
			</p>

			{/* Emitir chave é do plano; a chave já emitida continua valendo, e a
			    listagem e a revogação seguem à mão de quem administra. */}
			{apiAccess.allowed ? (
				<div className="flex flex-wrap gap-2">
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Para que é esta chave? Ex.: ERP do escritório"
						className="max-w-xs"
						maxLength={80}
					/>
					<select
						value={mode}
						onChange={(event) => setMode(event.target.value as "live" | "test")}
						className="h-9 rounded-md border border-border bg-background px-3 text-sm"
						aria-label="Ambiente da chave"
					>
						<option value="live">Produção — cobra por cálculo</option>
						<option value="test">Teste — não cobra</option>
					</select>
					<Button
						size="sm"
						disabled={!name.trim() || isCreating}
						onClick={() => create({ data: { name: name.trim(), mode } })}
					>
						Criar chave
					</Button>
				</div>
			) : (
				<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border border-dashed px-4 py-3">
					<p className="text-muted-foreground text-xs">
						A API pública está disponível
						{apiAccess.requiredPlanName
							? ` a partir do plano ${apiAccess.requiredPlanName}.`
							: " nos planos maiores."}
					</p>
					<Button asChild size="sm" variant="outline">
						<Link to="/billing">Ver planos</Link>
					</Button>
				</div>
			)}

			{isLoading ? (
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<Loader2Icon className="size-3.5 animate-spin" /> Carregando...
				</div>
			) : keys && keys.length > 0 ? (
				<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
					{keys.map((key) => (
						<div
							key={key.id}
							className="flex items-center justify-between gap-3 bg-background px-4 py-3"
						>
							<div className="min-w-0">
								<p className="truncate font-medium text-foreground text-sm">
									{key.name}
									{key.mode === "test" && (
										<span className="ml-2 rounded border border-border px-1.5 py-0.5 text-muted-foreground text-xs">
											teste
										</span>
									)}
									{key.revokedAt && (
										<span className="ml-2 text-muted-foreground text-xs">
											revogada
										</span>
									)}
								</p>
								<p className="truncate text-muted-foreground text-xs">
									{key.prefix} ·{" "}
									{key.lastUsedAt
										? `último uso em ${formatDate(key.lastUsedAt)}`
										: "nunca usada"}
								</p>
							</div>
							{!key.revokedAt && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setRevoking({ id: key.id, name: key.name })}
								>
									Revogar
								</Button>
							)}
						</div>
					))}
				</div>
			) : (
				<p className="text-muted-foreground text-xs">
					Nenhuma chave criada ainda.
				</p>
			)}

			<Dialog
				open={Boolean(issuedToken)}
				onOpenChange={(open) => {
					if (!open) setIssuedToken(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Guarde este token agora</DialogTitle>
						<DialogDescription>
							Ele não será exibido de novo. Se você perdê-lo, terá de criar uma
							chave nova.
						</DialogDescription>
					</DialogHeader>
					<div className="overflow-x-auto rounded-lg border border-border bg-background p-3">
						<code className="whitespace-pre text-xs">{issuedToken}</code>
					</div>
					<Button size="sm" onClick={copyToken}>
						{copied ? <CheckIcon /> : <CopyIcon />}
						{copied ? "Copiado" : "Copiar token"}
					</Button>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(revoking)}
				onOpenChange={(open) => {
					if (!open) setRevoking(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revogar "{revoking?.name}"?</AlertDialogTitle>
						<AlertDialogDescription>
							Qualquer integração que use esta chave para de funcionar na hora.
							Não dá para desfazer — só criar uma chave nova.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							disabled={isRevoking}
							onClick={() => revoking && revoke({ id: revoking.id })}
						>
							Revogar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
