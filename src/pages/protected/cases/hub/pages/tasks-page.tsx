import { CheckCircle2Icon, CircleIcon, PlusIcon, TrashIcon } from "lucide-react";
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
  getListCaseTasksQueryKey,
  useCreateCaseTask,
  useDeleteCaseTask,
  useListCaseTasks,
  useUpdateCaseTask,
} from "@/http/generated/case-task/case-task";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { useCaseHub } from "../case-hub-layout";

const PRIORITY_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};
const PRIORITY_COLOR: Record<string, string> = {
  baixa: "text-muted-foreground",
  media: "text-blue-600 dark:text-blue-400",
  alta: "text-red-600 dark:text-red-400",
};

export default function CaseTasksPage() {
  const { caseId } = useCaseHub();
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media");

  const { data: tasks } = useListCaseTasks(caseId);
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getListCaseTasksQueryKey(caseId),
    });

  const { mutateAsync: create, isPending } = useCreateCaseTask({
    mutation: { onSuccess: invalidate },
  });
  const { mutateAsync: update } = useUpdateCaseTask({
    mutation: { onSuccess: invalidate },
  });
  const { mutateAsync: remove } = useDeleteCaseTask({
    mutation: { onSuccess: invalidate },
  });

  const add = async () => {
    if (!title.trim()) return;
    await create({
      caseId,
      data: {
        title: title.trim(),
        priority,
        ...(dueAt ? { dueAt } : {}),
      },
    });
    setTitle("");
    setDueAt("");
    setPriority("media");
    toast.success("Tarefa criada");
  };

  const toggle = async (id: string, done: boolean) => {
    await update({
      caseId,
      taskId: id,
      data: { status: done ? "pendente" : "concluida" },
    });
  };

  const list = tasks ?? [];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Nova tarefa (ex: protocolar petição inicial)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1"
        />
        <Input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="sm:w-40"
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as never)}>
          <SelectTrigger className="sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={add} disabled={isPending || !title.trim()}>
          <PlusIcon className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={CheckCircle2Icon}
          title="Nenhuma tarefa ainda"
          description="Organize as providências internas deste caso: juntar documentos, protocolar peças, contatar o cliente."
          helpArticle="tarefas-do-caso"
        />
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {list.map((t) => {
            const done = t.status === "concluida";
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggle(t.id, done)}
                  className="shrink-0"
                >
                  {done ? (
                    <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                  ) : (
                    <CircleIcon className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      done
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span className={PRIORITY_COLOR[t.priority]}>
                      {PRIORITY_LABEL[t.priority]}
                    </span>
                    {t.dueAt && (
                      <span className="text-muted-foreground">
                        · vence {new Date(t.dueAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <ConfirmButton
                  variant="ghost"
                  size="icon-sm"
                  tooltip="Excluir tarefa"
                  title="Excluir tarefa?"
                  description={`"${t.title}" será excluída permanentemente.`}
                  confirmLabel="Excluir"
                  onConfirm={() => remove({ caseId, taskId: t.id })}
                >
                  <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </ConfirmButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
