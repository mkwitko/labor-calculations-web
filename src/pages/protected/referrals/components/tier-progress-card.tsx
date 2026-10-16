import { TrophyIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  GetReferralSummary200DataNextTier,
  GetReferralSummary200DataTier,
} from "@/http/generated/labor-calculations-api.schemas";

const TIERS = [
  { label: "Bronze", from: 1, percentOff: 10 },
  { label: "Prata", from: 3, percentOff: 25 },
  { label: "Ouro", from: 5, percentOff: 40 },
  { label: "Diamante", from: 8, percentOff: 60 },
];

export function TierProgressCard({
  tier,
  nextTier,
  qualifiedCount,
}: {
  tier: GetReferralSummary200DataTier;
  nextTier: GetReferralSummary200DataNextTier;
  qualifiedCount: number;
}) {
  // Progress runs from the current tier's entry point to the next one, so the
  // bar measures the step being climbed rather than the whole ladder.
  const floor = TIERS.filter((t) => qualifiedCount >= t.from).at(-1)?.from ?? 0;
  const ceiling = qualifiedCount + (nextTier?.missing ?? 0);
  const progress = nextTier
    ? ((qualifiedCount - floor) / (ceiling - floor || 1)) * 100
    : 100;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-4 w-4 text-primary" />
              <p className="font-medium text-foreground">Nível {tier.label}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {qualifiedCount === 0
                ? "Nenhuma indicação ativa ainda"
                : `${qualifiedCount} indicação(ões) ativa(s)`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-foreground">
              {tier.percentOff}%
            </p>
            <p className="text-xs text-muted-foreground">de desconto</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            {nextTier
              ? `Faltam ${nextTier.missing} para ${nextTier.label} (${nextTier.percentOff}% de desconto).`
              : "Você está no nível máximo do programa."}
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIERS.map((t) => {
            const reached = qualifiedCount >= t.from;

            return (
              <li
                key={t.label}
                className={
                  reached
                    ? "rounded-md border border-primary/30 bg-primary/5 p-2"
                    : "rounded-md border border-border p-2"
                }
              >
                <p className="text-xs font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  {t.from}+ ativas · {t.percentOff}%
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
