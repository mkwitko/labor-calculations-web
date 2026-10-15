import { PlusIcon, TrashIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getListCasePartiesQueryKey,
  useCreateCaseParty,
  useDeleteCaseParty,
  useListCaseParties,
} from "@/http/generated/case-party/case-party";
import { queryClient } from "@/lib/react-query";
import { useCaseHub } from "../case-hub-layout";

const ROLE_LABEL: Record<string, string> = {
  reclamante: "Reclamante",
  reclamada: "Reclamada",
  testemunha: "Testemunha",
  paradigma: "Paradigma",
  perito: "Perito",
  advogado_contrario: "Advogado contrário",
  outro: "Outro",
};

export default function CasePartiesPage() {
  const { caseId } = useCaseHub();
  const [role, setRole] = useState<string>("reclamada");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");

  const { data: parties } = useListCaseParties(caseId);
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getListCasePartiesQueryKey(caseId),
    });

  const { mutateAsync: create, isPending } = useCreateCaseParty({
    mutation: { onSuccess: invalidate },
  });
  const { mutateAsync: remove } = useDeleteCaseParty({
    mutation: { onSuccess: invalidate },
  });

  const add = async () => {
    if (!name.trim()) return;
    await create({
      caseId,
      data: {
        role: role as never,
        name: name.trim(),
        ...(document ? { document } : {}),
        ...(phone ? { phone } : {}),
      },
    });
    setName("");
    setDocument("");
    setPhone("");
    toast.success("Parte adicionada");
  };

  const list = parties ?? [];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Nome / razão social"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="CPF/CNPJ (opcional)"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
        />
        <Button onClick={add} disabled={isPending || !name.trim()}>
          <PlusIcon className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Nenhuma parte cadastrada"
          description="Registre a reclamada, testemunhas, paradigma (equiparação) e outros envolvidos no processo."
          helpArticle="partes-e-envolvidos"
        />
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs font-medium rounded bg-muted px-2 py-0.5 text-muted-foreground shrink-0 w-32">
                {ROLE_LABEL[p.role] ?? p.role}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{p.name}</p>
                {(p.document || p.phone) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {[p.document, p.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <ConfirmButton
                variant="ghost"
                size="icon-sm"
                tooltip="Remover parte"
                title="Remover parte?"
                description={`"${p.name}" será removido deste caso.`}
                confirmLabel="Remover"
                onConfirm={() => remove({ caseId, partyId: p.id })}
              >
                <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </ConfirmButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
