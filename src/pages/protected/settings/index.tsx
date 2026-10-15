import { BellIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  useGetAuthenticatedUser,
  useGetUserPrefs,
  useUpdateUserPrefs,
} from '@/http/generated/user/user'
import { queryClient } from '@/lib/react-query'
import { getGetUserPrefsQueryKey } from '@/http/generated/user/user'
import { toast } from 'sonner'
import { GoogleCalendarCard } from './components/google-calendar-card'
import { MonetaryIndicesCard } from './components/monetary-indices-card'
import { WidgetCard } from './components/widget-card'
import { ApiKeysCard } from './components/api-keys-card'
import { ApiUsageCard } from './components/api-usage-card'

function ReminderSettings() {
  const { data: prefs } = useGetUserPrefs()
  const { mutate: updatePrefs } = useUpdateUserPrefs({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserPrefsQueryKey() })
      },
      onError: () => toast.error('Erro ao salvar preferências'),
    },
  })

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BellIcon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Lembretes por e-mail</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Escolha quais e-mails o LexLaboral envia para você.
      </p>
      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-background">
          <div>
            <Label htmlFor="remind-d3" className="text-sm font-medium text-foreground">
              D-3 (3 dias antes)
            </Label>
            <p className="text-xs text-muted-foreground">Resumo de eventos nos próximos 3 dias</p>
          </div>
          <Switch
            id="remind-d3"
            checked={prefs?.remindD3 ?? true}
            onCheckedChange={(checked) => updatePrefs({ data: { remindD3: checked } })}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-background">
          <div>
            <Label htmlFor="remind-d1" className="text-sm font-medium text-foreground">
              D-1 (véspera)
            </Label>
            <p className="text-xs text-muted-foreground">Alerta dos eventos do dia seguinte</p>
          </div>
          <Switch
            id="remind-d1"
            checked={prefs?.remindD1 ?? true}
            onCheckedChange={(checked) => updatePrefs({ data: { remindD1: checked } })}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-background">
          <div>
            <Label htmlFor="onb-nudge" className="text-sm font-medium text-foreground">
              E-mails de boas-vindas
            </Label>
            <p className="text-xs text-muted-foreground">
              Duas dicas curtas nos primeiros dias, para ajudar a começar
            </p>
          </div>
          {/* O campo é opt-**out** e o interruptor mostra "receber": um
              interruptor rotulado "não receber" se lê errado. */}
          <Switch
            id="onb-nudge"
            checked={!(prefs?.onbNudgeOptOut ?? false)}
            onCheckedChange={(checked) =>
              updatePrefs({ data: { onbNudgeOptOut: !checked } })
            }
          />
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { data: me } = useGetAuthenticatedUser()
  const isAdmin = me?.data?.isAdmin === true

  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      <PageHeader
        title="Configurações"
        subtitle={`Preferências e agenda${isAdmin ? ' e índices monetários' : ''}`}
      />

      <ReminderSettings />

      <GoogleCalendarCard />

      {/* Só titular e sócio veem: a chave vai para o HTML do site do escritório
          e rotacionar derruba o código publicado. O card se esconde sozinho. */}
      <WidgetCard />
      <ApiUsageCard />
      <ApiKeysCard />

      {/* Índices são globais (afetam todos os cálculos) → só admin edita. */}
      {isAdmin && <MonetaryIndicesCard />}
    </div>
  )
}
