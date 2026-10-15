import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "lucide-react";
import { queryClient } from "@/lib/react-query";
import { getGetSubscriptionQueryKey } from "@/http/generated/billing/billing";

export default function BillingSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey() });
    const t = setTimeout(() => navigate("/billing", { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
        <CheckCircleIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Assinatura ativada!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Seu plano foi configurado com sucesso. Redirecionando...
        </p>
      </div>
    </div>
  );
}
