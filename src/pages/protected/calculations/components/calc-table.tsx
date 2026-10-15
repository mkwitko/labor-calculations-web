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
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getListLaborCalculationQueryKey,
  useDeleteLaborCalculation,
  useRestoreLaborCalculation,
} from '@/http/generated/labor-calculation/labor-calculation'
import type { ListLaborCalculation200DataItem } from '@/http/generated/lexlaboral-server.schemas'
import { queryClient } from '@/lib/react-query'
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getTerminationTypeLabel,
} from '@/utils/value-format'
import { EmptyState } from '@/components/empty-state'
import {
  ClipboardListIcon,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  SearchXIcon,
  TrashIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'em_andamento':
      return 'secondary'
    case 'proposta_enviada':
      return 'outline'
    case 'acordo_fechado':
      return 'default'
    case 'ajuizado':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getVersionLabel(version?: string) {
  if (version === 'v2') return 'Estimativa'
  if (version === 'v3') return 'Liquidação'
  return '—'
}

interface Props {
  items: ListLaborCalculation200DataItem[]
  isFiltered?: boolean
}

export function CalcTable({ items, isFiltered = false }: Props) {
  const navigate = useNavigate()
  const { mutateAsync: deleteCalc } = useDeleteLaborCalculation()
  const { mutateAsync: restoreCalc } = useRestoreLaborCalculation()

  async function handleDelete(calc: ListLaborCalculation200DataItem, e: React.MouseEvent) {
    e.stopPropagation()
    await deleteCalc({ id: calc.id })
    queryClient.invalidateQueries({ queryKey: getListLaborCalculationQueryKey() })
    toast(`Cálculo de ${calc.clientName} excluído`, {
      duration: 30000,
      action: {
        label: 'Desfazer',
        onClick: async () => {
          await restoreCalc({ id: calc.id })
          queryClient.invalidateQueries({ queryKey: getListLaborCalculationQueryKey() })
        },
      },
    })
  }

  if (items.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          icon={SearchXIcon}
          title="Nenhum resultado"
          description="Tente ajustar a busca ou o filtro."
        />
      )
    }
    return (
      <EmptyState
        icon={ClipboardListIcon}
        title="Faça seu primeiro cálculo"
        description="A liquidação trabalhista aplica correção monetária, juros e descontos sobre as verbas rescisórias, passo a passo."
        action={{
          label: 'Novo cálculo',
          icon: PlusIcon,
          onClick: () => navigate('/calculations/new'),
        }}
        helpArticle="como-fazer-um-calculo"
      />
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden divide-y divide-border">
        {items.map((calc) => (
          <button
            key={calc.id}
            type="button"
            onClick={() => navigate(`/calculations/${calc.id}`)}
            className="w-full text-left px-4 py-4 hover:bg-muted/40 transition-colors active:bg-muted/60"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm text-foreground leading-snug">
                {calc.clientName}
              </p>
              <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                {calc.totalValue != null ? formatCurrency(calc.totalValue) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5 gap-2">
              <p className="text-xs text-muted-foreground">
                {getTerminationTypeLabel(calc.terminationType)}
                {' · '}
                {getVersionLabel(calc.calculationVersion)}
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(calc.createdAt)}
              </p>
            </div>
            {calc.status && (
              <div className="flex items-center gap-1 mt-1">
                <Badge variant={getStatusVariant(calc.status)}>{getStatusLabel(calc.status)}</Badge>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Desktop: table */}
      <table className="hidden md:table w-full text-sm mt-4">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
            <th className="text-left font-medium pb-3 px-6">Cliente</th>
            <th className="text-left font-medium pb-3 px-6">Tipo</th>
            <th className="text-left font-medium pb-3 px-6">Rescisão</th>
            <th className="text-left font-medium pb-3 px-6">Criado em</th>
            <th className="text-right font-medium pb-3 px-6">Valor Total</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((calc) => (
            <tr
              key={calc.id}
              className="group border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
              onClick={() => navigate(`/calculations/${calc.id}`)}
            >
              <td className="py-3.5 px-6">
                <p className="font-medium text-foreground">{calc.clientName}</p>
              </td>
              <td className="py-3.5 px-6 text-muted-foreground">
                {getVersionLabel(calc.calculationVersion)}
              </td>
              <td className="py-3.5 px-6 text-foreground">
                {getTerminationTypeLabel(calc.terminationType)}
              </td>
              <td className="py-3.5 px-6 text-muted-foreground whitespace-nowrap">
                {formatDate(calc.createdAt)}
              </td>
              <td className="py-3.5 px-6 text-right font-medium text-foreground tabular-nums">
                {calc.totalValue != null ? formatCurrency(calc.totalValue) : '—'}
              </td>
              <td className="py-3.5 pr-4 text-right w-32">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar cálculo"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/calculations/${calc.id}/edit`)
                    }}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Duplicar cálculo"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/calculations/new', { state: { cloneFrom: calc } })
                    }}
                  >
                    <CopyIcon />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir cálculo"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TrashIcon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cálculo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O cálculo de {calc.clientName} será excluído. Você poderá desfazer essa ação.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={(e) => handleDelete(calc, e)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}