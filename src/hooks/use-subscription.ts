import { useGetSubscription } from "@/http/generated/billing/billing";

function calcDaysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function useSubscription() {
  const query = useGetSubscription();
  const status = query.data?.data.status ?? "none";
  const trialEnd = query.data?.data.trialEnd ?? null;
  const currentPeriodEnd = query.data?.data.currentPeriodEnd ?? null;
  const cancelAtPeriodEnd = query.data?.data.cancelAtPeriodEnd ?? null;

  const isTrial = status === "trialing";
  const isActive = status === "active";
  const isSubscribed = isActive || isTrial;
  const trialDaysLeft = isTrial ? calcDaysLeft(trialEnd) : null;
  const isExpired =
    !isSubscribed &&
    status !== "none" &&
    status !== "incomplete" &&
    status !== "incomplete_expired";
  const hasNoSubscription = status === "none";

  return {
    ...query,
    status,
    isSubscribed,
    isActive,
    isTrial,
    isExpired,
    hasNoSubscription,
    trialEnd,
    trialDaysLeft,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  };
}
