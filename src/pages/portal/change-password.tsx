import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  getCheckClientAuthQueryKey,
  useChangeClientPassword,
} from "@/http/generated/client-portal/client-portal";
import { queryClient } from "@/lib/react-query";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CheckIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Obrigatório"),
    newPassword: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/\d/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, "Obrigatório"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function PortalChangePassword() {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const { mutateAsync: changePassword, isPending } = useChangeClientPassword({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getCheckClientAuthQueryKey() });
        navigate("/portal/inicio");
      },
    },
  });

  async function onSubmit(data: FormData) {
    await changePassword({
      data: { currentPassword: data.currentPassword, newPassword: data.newPassword },
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Crie sua senha
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Por segurança, defina uma nova senha antes de continuar.
          </p>
        </div>

        <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="currentPassword">
              Senha atual
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <LockIcon className="w-4 h-4 text-slate-400" />
              </InputGroupAddon>
              <InputGroupInput
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Últimos 5 dígitos do CPF"
                {...form.register("currentPassword")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="button" size="icon-xs" variant="ghost" aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-red-500">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="newPassword">
              Nova senha
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <LockIcon className="w-4 h-4 text-slate-400" />
              </InputGroupAddon>
              <InputGroupInput
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                {...form.register("newPassword")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="button" size="icon-xs" variant="ghost" aria-label={showNew ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {form.formState.errors.newPassword && (
              <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
              Confirmar senha
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <LockIcon className="w-4 h-4 text-slate-400" />
              </InputGroupAddon>
              <InputGroupInput
                id="confirmPassword"
                type={showNew ? "text" : "password"}
                placeholder="Repita a nova senha"
                {...form.register("confirmPassword")}
              />
            </InputGroup>
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending ? (
              <><Loader2Icon className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : (
              <><CheckIcon className="w-4 h-4" /> Salvar senha</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
