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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getGetClientQueryKey,
  getListClientsQueryKey,
  useDeleteClient,
  useGetClient,
  useUpdateClient,
} from "@/http/generated/client/client";
import { useListLaborCalculation } from "@/http/generated/labor-calculation/labor-calculation";
import { UpdateClientBody } from "@/http/generated/labor-calculations-api.schemas";
import { queryClient } from "@/lib/react-query";
import { formatCurrency, formatDate, getStatusLabel, getTerminationTypeLabel } from "@/utils/value-format";
import { ArrowLeftIcon, CheckIcon, PencilIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { maskCpf, maskPhone } from "../calculations/new/components/common/form-utils";
import { PortalAccessCard } from "./components/portal-access-card";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5 py-3.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">
        {value || <span className="text-muted-foreground italic">—</span>}
      </span>
    </div>
  );
}

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateClientBody>({});

  const { data: client, isLoading } = useGetClient(clientId!);

  const { data: calcsResponse } = useListLaborCalculation({ limit: 100 });
  const linkedCalcs = (calcsResponse?.data ?? []).filter(
    (c) => (c as { clientId?: string }).clientId === clientId,
  );

  const { mutate: update, isPending: isUpdating } = useUpdateClient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(clientId!) });
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        setIsEditing(false);
      },
    },
  });

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        navigate("/clients");
      },
    },
  });

  function startEditing() {
    if (!client) return;
    setForm({
      name: client.name,
      document: client.document ?? undefined,
      mail: client.mail ?? undefined,
      phone: client.phone ?? undefined,
      notes: client.notes ?? undefined,
    });
    setIsEditing(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    update({ clientId: clientId!, data: form });
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Cliente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Voltar"
            className="shrink-0"
            onClick={() => navigate("/clients")}
          >
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">{client.name}</h1>
            <p className="text-sm text-muted-foreground">
              {client._count.laborCalculations} cálculo(s) vinculado(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <PencilIcon />
              Editar
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <TrashIcon />
                <span className="hidden sm:inline">Excluir</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                <AlertDialogDescription>
                  O cliente <strong>{client.name}</strong> será removido. Os cálculos
                  vinculados a ele não serão excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => deleteClient({ clientId: clientId! })}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Dados do Cliente</h3>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cancelar"
                  onClick={() => setIsEditing(false)}
                >
                  <XIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Salvar"
                  disabled={isUpdating}
                  onClick={handleSave}
                >
                  <CheckIcon />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="document">CPF</Label>
                <Input
                  id="document"
                  value={form.document ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, document: maskCpf(e.target.value) || undefined }))
                  }
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="mail">E-mail</Label>
                <Input
                  id="mail"
                  type="email"
                  value={form.mail ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mail: e.target.value || undefined }))
                  }
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: maskPhone(e.target.value) || undefined }))
                  }
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value || undefined }))
                  }
                />
              </div>
            </form>
          ) : (
            <>
              <Field label="Nome" value={client.name} />
              <Field label="CPF" value={client.document} />
              <Field label="E-mail" value={client.mail} />
              <Field label="Telefone" value={client.phone} />
              <Field label="Observações" value={client.notes} />
              <Field label="Cadastrado em" value={formatDate(client.createdAt)} />
            </>
          )}
        </div>

        <PortalAccessCard clientId={client.id} hasMail={Boolean(client.mail)} />

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cálculos Vinculados</h3>
          {linkedCalcs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum cálculo vinculado a este cliente.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedCalcs.map((calc) => (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => navigate(`/calculations/${calc.id}`)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getTerminationTypeLabel(calc.terminationType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStatusLabel(calc.status)} · {formatDate(calc.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground ml-3 shrink-0">
                    {calc.totalValue != null ? formatCurrency(Number(calc.totalValue)) : "—"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
