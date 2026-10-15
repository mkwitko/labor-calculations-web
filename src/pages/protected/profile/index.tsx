import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilIcon, XIcon, UserIcon, CheckIcon, MailIcon, PaletteIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAuthenticatedUser,
  useUpdateUser,
  getGetAuthenticatedUserQueryKey,
} from "@/http/generated/user/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandingUpload } from "@/components/branding-upload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/react-query";
import {
  maskCpf,
  maskPhone,
} from "@/pages/protected/calculations/new/components/common/form-utils";

import { OAB_STATES } from "@/constants/brazil";
import { apiErrorMessage } from "@/utils/api-error";
import { toast } from "sonner";

const schema = z
  .object({
    name: z.string().min(1, "Obrigatório"),
    document: z.string().optional(),
    officeName: z.string().optional(),
    oabState: z.string().optional(),
    oabNumber: z.string().regex(/^\d*$/, "Apenas números").optional(),
    phone: z.string().optional(),
    logoUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
    address: z.string().optional(),
    website: z.string().url("URL inválida").or(z.literal("")).optional(),
    bio: z.string().optional(),
  })
  // A OAB é um campo só, partido em dois controles. O envio monta `UF/número` e
  // descartava tudo quando faltava uma das metades — a pessoa preenchia, salvava
  // e a OAB simplesmente não ia, sem erro nenhum na tela.
  .superRefine((data, ctx) => {
    const hasState = Boolean(data.oabState);
    const hasNumber = Boolean(data.oabNumber);

    if (hasState === hasNumber) return;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasState ? "oabNumber" : "oabState"],
      message: hasState
        ? "Informe o número da OAB"
        : "Selecione o estado da OAB",
    });
  });

type FormData = z.infer<typeof schema>;

function parseOab(oabNumber: string | null | undefined): { state: string; number: string } {
  if (!oabNumber) return { state: "", number: "" };
  const parts = oabNumber.split("/");
  if (parts.length === 2) return { state: parts[0], number: parts[1] };
  return { state: "", number: oabNumber };
}

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

function ProfileForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Logotipo</Label>
        <BrandingUpload
          asset="logo"
          value={watch("logoUrl") ?? ""}
          onChange={(url) => setValue("logoUrl", url, { shouldDirty: true })}
        />
        {errors.logoUrl && (
          <p className="text-xs text-destructive">{errors.logoUrl.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="João da Silva" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="document">CPF</Label>
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
        </div>

        <div className="space-y-3">
          <Label htmlFor="officeName">Nome do escritório</Label>
          <Input
            id="officeName"
            placeholder="Silva & Associados"
            {...register("officeName")}
          />
        </div>

        <div className="space-y-3">
          <Label>OAB</Label>
          <div className="flex gap-2">
            <Controller
              control={control}
              name="oabState"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-24 shrink-0">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {OAB_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              placeholder="123456"
              inputMode="numeric"
              {...register("oabNumber")}
            />
          </div>
          {(errors.oabState || errors.oabNumber) && (
            <p className="text-xs text-destructive">
              {errors.oabState?.message ?? errors.oabNumber?.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="phone">Telefone</Label>
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
        </div>

        <div className="space-y-3">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            placeholder="Rua das Flores, 100 — São Paulo"
            {...register("address")}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            placeholder="https://seusite.com.br"
            {...register("website")}
          />
          {errors.website && (
            <p className="text-xs text-destructive">{errors.website.message}</p>
          )}
        </div>

      </div>

      <div className="space-y-3">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Uma breve descrição sobre você ou seu escritório"
          rows={3}
          {...register("bio")}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} size="sm">
          <CheckIcon />
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <XIcon />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function BrandKitSection({
  user,
  onSave,
  isPending,
}: {
  user: { id: string; brandPrimaryColor?: string | null; letterheadUrl?: string | null };
  onSave: (data: { brandPrimaryColor?: string; letterheadUrl?: string | null }) => void;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [color, setColor] = useState(user.brandPrimaryColor ?? "#7e14ff");
  const [letterheadUrl, setLetterheadUrl] = useState(user.letterheadUrl ?? "");

  function handleSave() {
    onSave({
      brandPrimaryColor: color,
      letterheadUrl: letterheadUrl || null,
    });
    setEditing(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
            <PaletteIcon className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">Brand Kit</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <PencilIcon />
            Editar
          </Button>
        )}
      </div>
      <div className="px-5">
        {editing ? (
          <div className="py-5 space-y-5">
            <div className="space-y-2">
              <Label>Papel timbrado</Label>
              <BrandingUpload
                asset="letterhead"
                value={letterheadUrl}
                onChange={setLetterheadUrl}
                allowPdf
              />
              <p className="text-xs text-muted-foreground">
                Imagem de fundo para documentos (PNG/JPG/WEBP ou PDF)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Cor principal</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <Input
                  value={color}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value);
                  }}
                  className="w-32 font-mono"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usado nos cabeçalhos dos documentos gerados
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                <CheckIcon />
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setColor(user.brandPrimaryColor ?? "#7e14ff");
                  setLetterheadUrl(user.letterheadUrl ?? "");
                  setEditing(false);
                }}
              >
                <XIcon />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-0.5 py-3.5 border-b border-border">
              <span className="text-xs text-muted-foreground">Cor principal</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-5 h-5 rounded border border-border"
                  style={{ backgroundColor: user.brandPrimaryColor ?? "#7e14ff" }}
                />
                <span className="text-sm font-medium font-mono text-foreground">
                  {user.brandPrimaryColor ?? "#7e14ff"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 py-3.5">
              <span className="text-xs text-muted-foreground">Papel timbrado</span>
              {user.letterheadUrl ? (
                user.letterheadUrl.toLowerCase().endsWith(".pdf") ? (
                  <a
                    href={user.letterheadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-sm font-medium text-primary hover:underline"
                  >
                    Ver PDF
                  </a>
                ) : (
                  <img
                    src={user.letterheadUrl}
                    alt="Papel timbrado"
                    className="ml-auto h-12 max-w-[140px] object-contain"
                  />
                )
              ) : (
                <span className="ml-auto text-sm text-muted-foreground italic">—</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const [editing, setEditing] = useState(false);

  const { data, isLoading } = useGetAuthenticatedUser();
  const user = data?.data;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetAuthenticatedUserQueryKey() });

  const { mutateAsync: update, isPending } = useUpdateUser({
    mutation: {
      onSuccess: () => {
        invalidate();
        setEditing(false);
        toast.success("Perfil salvo");
      },
      // Erro de validação do back não passa pelo toast global (não vem de
      // `HttpException`, então chega sem `showError`), e o formulário
      // simplesmente continuava aberto como se nada tivesse acontecido.
      onError: (error) => {
        const message = apiErrorMessage(
          error,
          "Não foi possível salvar o perfil.",
        );
        if (message) toast.error(message);
      },
    },
  });

  async function handleSubmit(formData: FormData) {
    if (!user) return;
    const oabNumber =
      formData.oabState && formData.oabNumber
        ? `${formData.oabState}/${formData.oabNumber}`
        : undefined;
    await update({
      id: user.id,
      data: {
        name: formData.name,
        document: formData.document || undefined,
        officeName: formData.officeName || undefined,
        oabNumber,
        phone: formData.phone || undefined,
        logoUrl: formData.logoUrl || undefined,
        address: formData.address || undefined,
        website: formData.website || undefined,
        bio: formData.bio || undefined,
      },
    });
  }

  async function handleBrandKitSave(brandData: {
    brandPrimaryColor?: string;
    letterheadUrl?: string | null;
  }) {
    if (!user) return;
    await update({ id: user.id, data: brandData });
  }

  function buildDefaultValues(): FormData {
    const oab = parseOab(user?.oabNumber);
    return {
      name: user?.name ?? "",
      document: user?.document ?? "",
      officeName: user?.officeName ?? "",
      oabState: oab.state,
      oabNumber: oab.number,
      phone: user?.phone ?? "",
      logoUrl: user?.logoUrl ?? "",
      address: user?.address ?? "",
      website: user?.website ?? "",
      bio: user?.bio ?? "",
    };
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 mx-auto w-full">
      <PageHeader
        title="Meu Perfil"
        subtitle="Dados do advogado exibidos nos documentos gerados"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Informações Pessoais
              </p>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <PencilIcon />
                Editar
              </Button>
            )}
          </div>

          <div className="px-5">
            {editing && user ? (
              <div className="py-5">
                <ProfileForm
                  defaultValues={buildDefaultValues()}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditing(false)}
                  isPending={isPending}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 py-3.5 border-b border-border">
                  <MailIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">E-mail</span>
                  <span className="ml-auto text-sm font-medium text-foreground">
                    {user?.mail}
                  </span>
                </div>
                <Field label="Nome completo" value={user?.name} />
                <Field label="CPF" value={user?.document} />
                <Field label="Nome do escritório" value={user?.officeName} />
                <Field label="OAB" value={user?.oabNumber} />
                <Field label="Telefone" value={user?.phone} />
                <Field label="Endereço" value={user?.address} />
                <Field label="Website" value={user?.website} />
                <div className="flex items-center gap-2 py-3.5 border-b border-border">
                  <span className="text-xs text-muted-foreground">Logotipo</span>
                  {user?.logoUrl ? (
                    <img
                      src={user.logoUrl}
                      alt="Logotipo"
                      className="ml-auto h-10 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="ml-auto text-sm text-muted-foreground italic">
                      —
                    </span>
                  )}
                </div>
                <Field label="Bio" value={user?.bio} />
              </>
            )}
          </div>
        </div>

        {user && (
          <BrandKitSection
            user={user}
            onSave={handleBrandKitSave}
            isPending={isPending}
          />
        )}
        </div>
      )}
    </div>
  );
}
