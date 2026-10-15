import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useListClients } from '@/http/generated/client/client'
import type { ListClients200DataItem } from '@/http/generated/lexlaboral-server.schemas'
import { ExternalLinkIcon, SearchIcon, UserIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ClientInfoSectionType } from '../../schema/labor-calculation-common-schema'
import { FormField } from '../common/form-field'
import { FormSection } from '../common/form-section'

interface Props<T extends ClientInfoSectionType & FieldValues> {
  form: UseFormReturn<T>
  locked?: boolean
}

export function ClientSelectSection<T extends ClientInfoSectionType & FieldValues>({
  form,
  locked,
}: Props<T>) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const setValue = form.setValue as (name: keyof ClientInfoSectionType, value: string | undefined) => void
  const watch = form.watch as (name: string) => string | undefined
  const register = form.register as (name: string) => object
  const errors = form.formState.errors as {
    clientId?: { message?: string }
    observations?: { message?: string }
  }

  const clientId = watch('clientId')
  const clientName = watch('clientName')
  const clientDocument = watch('clientDocument')

  const { data: response } = useListClients({ limit: 100 })
  const clients = response?.data ?? []

  const filtered = query.trim()
    ? clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.document ?? '').includes(query) ||
        (c.mail ?? '').toLowerCase().includes(query.toLowerCase()),
    )
    : clients

  function selectClient(client: ListClients200DataItem) {
    setValue('clientId', client.id)
    setValue('clientName', client.name)
    setValue('clientDocument', client.document ?? undefined)
    setQuery('')
    setOpen(false)
  }

  function clearClient() {
    setValue('clientId', undefined)
    setValue('clientName', undefined)
    setValue('clientDocument', undefined)
    setQuery('')
  }

  return (
    <>
      <FormSection title="Identificação">
        <FormField
          label="Cliente"
          htmlFor="clientId"
          error={errors.clientId?.message}
        >
          {clientId ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{clientName}</p>
                {clientDocument && (
                  <p className="text-xs text-muted-foreground">{clientDocument}</p>
                )}
              </div>
              {!locked && (
                <button
                  type="button"
                  onClick={clearClient}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="clientId"
                  placeholder="Buscar cliente por nome ou CPF..."
                  className="pl-9"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setTimeout(() => setOpen(false), 150)}
                  autoComplete="off"
                />
              </div>

              {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      Nenhum cliente encontrado
                    </div>
                  ) : (
                    <ul className="max-h-52 overflow-y-auto">
                      {filtered.map((client) => (
                        <li key={client.id}>
                          <button
                            type="button"
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                            onMouseDown={() => selectClient(client)}
                          >
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserIcon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {client.name}
                              </p>
                              {client.document && (
                                <p className="text-xs text-muted-foreground">{client.document}</p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t border-border px-3 py-2">
                    <a
                      href="/clients/new"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                      Criar novo cliente
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </FormField>
      </FormSection>

      <FormSection title="Observações">
        <FormField label="Notas do caso" htmlFor="observations">
          <Textarea
            id="observations"
            placeholder="Informações adicionais sobre o processo..."
            rows={3}
            {...register('observations')}
          />
        </FormField>
      </FormSection>
    </>
  )
}
