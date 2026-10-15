import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { storeReferralCode } from "@/lib/referral";

/**
 * Landing point of a shared referral link (`/r/MAUR7X2K`). It only records the
 * code and forwards to signup — the invited person never sees this screen.
 */
export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) storeReferralCode(code);
  }, [code]);

  if (!code) return <Navigate to="/authentication/sign-up" replace />;

  return (
    <Navigate
      to={`/authentication/sign-up?ref=${encodeURIComponent(code)}`}
      replace
    />
  );
}
