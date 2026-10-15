import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftIcon } from "lucide-react";
import { useCreateClient, getListClientsQueryKey } from "@/http/generated/client/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/react-query";
import { FormField } from "../calculations/new/components/common/form-field";
import { maskCpf, maskPhone } from "../calculations/new/components/common/form-utils";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  document: z.string().optional(),
  mail: z.string().email("E-mail inválido").or(z.literal("")).optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewClient() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      document: "",
      mail: "",
      phone: "",
      notes: "",
    },
  });

  const { mutate: create, isPending } = useCreateClient({
    mutation: {
      onSuccess: ({ id }) => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        navigate(`/clients/${id}`);
      },
    },
  });

  function onSubmit(data: FormData) {
    create({
      data: {
        name: data.name,
        document: data.document || undefined,
        mail: data.mail || undefined,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
      },
    });
  }

  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label="Voltar"
          className="mt-0.5 shrink-0"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeftIcon />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Novo Cliente</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um cliente para vinculá-lo a cálculos trabalhistas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Identificação</h3>

          <FormField label="Nome *" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Nome completo"
              {...register("name")}
            />
          </FormField>

          <FormField label="CPF" htmlFor="document" error={errors.document?.message}>
            <Controller
              control={control}
              name="document"
              render={({ field }) => (
                <Input
                  id="document"
                  placeholder="000.000.000-00"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(maskCpf(e.target.value))}
                />
              )}
            />
          </FormField>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Contato</h3>

          <FormField label="E-mail" htmlFor="mail" error={errors.mail?.message}>
            <Input
              id="mail"
              type="email"
              placeholder="cliente@email.com"
              {...register("mail")}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="phone" error={errors.phone?.message}>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(maskPhone(e.target.value))}
                />
              )}
            />
          </FormField>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Observações</h3>

          <FormField label="Notas internas" htmlFor="notes" error={errors.notes?.message}>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre este cliente..."
              rows={4}
              {...register("notes")}
            />
          </FormField>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 md:-mx-6 -mb-4 md:-mb-6 flex items-center gap-3 border-t border-border bg-background/95 px-4 md:px-6 py-3 supports-[backdrop-filter]:backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/clients")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
