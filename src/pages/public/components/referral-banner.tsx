import { GiftIcon } from "lucide-react";
import { useResolveReferralCode } from "@/http/generated/referral/referral";

/**
 * Shown on signup when the visitor arrived through a referral link. It names
 * the colleague who invited them and states the cashback, so the perk is
 * visible at the moment the form asks for effort.
 */
export function ReferralBanner({ code }: { code: string }) {
  const { data } = useResolveReferralCode(code);

  const referrerName = data?.data.referrerName;

  if (!data?.data.valid || !referrerName) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <GiftIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="space-y-0.5 text-sm">
        <p className="font-medium text-foreground">
          Convite de {referrerName}
        </p>
        <p className="text-muted-foreground">
          Você recebe de volta o valor da sua primeira mensalidade em crédito
          após 30 dias de assinatura.
        </p>
      </div>
    </div>
  );
}
