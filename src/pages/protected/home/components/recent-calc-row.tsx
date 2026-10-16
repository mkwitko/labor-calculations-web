
import { ListLaborCalculation200DataItem } from '@/http/generated/labor-calculations-api.schemas'
import { formatCurrency, formatDate, getTerminationTypeLabel } from '@/utils/value-format'
import { ArrowRightIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface RecentCalcRowProps {
  calc: ListLaborCalculation200DataItem
}

export function RecentCalcRow({ calc }: RecentCalcRowProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/calculations/${calc.id}`)}
      className="w-full flex items-center justify-between px-4 py-3.5 md:px-5 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{calc.clientName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {getTerminationTypeLabel(calc.terminationType)} · {formatDate(calc.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {calc.totalValue != null && (
          <span className="text-sm font-medium text-foreground tabular-nums">
            {formatCurrency(calc.totalValue)}
          </span>
        )}
        <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  )
}
