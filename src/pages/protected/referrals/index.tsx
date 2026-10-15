import { Loader2Icon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  getGetReferralSummaryQueryKey,
  useGetReferralSummary,
} from "@/http/generated/referral/referral";
import { queryClient } from "@/lib/react-query";
import { InviteForm } from "./components/invite-form";
import { ReferralLinkCard } from "./components/referral-link-card";
import { ReferralList } from "./components/referral-list";
import { TierProgressCard } from "./components/tier-progress-card";

export default function Referrals() {
  const { data, isLoading } = useGetReferralSummary();

  function refresh() {
    queryClient.invalidateQueries({
      queryKey: getGetReferralSummaryQueryKey(),
    });
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const summary = data.data;

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <PageHeader
        title="Indicações"
        subtitle="Indique colegas e reduza sua mensalidade. Quem entra pelo seu convite recebe de volta a primeira mensalidade."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferralLinkCard code={summary.code} link={summary.link} />
        <InviteForm onInvited={refresh} />
      </div>

      <TierProgressCard
        tier={summary.tier}
        nextTier={summary.nextTier}
        qualifiedCount={summary.qualifiedCount}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Suas indicações
        </h3>
        <ReferralList referrals={summary.referrals} />
      </div>
    </div>
  );
}
