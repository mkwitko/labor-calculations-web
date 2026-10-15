import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCheckAuth } from "@/http/generated/auth/auth";
import { usePageview } from "@/hooks/use-pageview";

export function PublicLayout() {
  const { data, isLoading } = useCheckAuth();
  const navigate = useNavigate();

  usePageview();

  useEffect(() => {
    if (!data) return;
    if (data.isAuthenticated) {
      navigate("/home");
      return;
    }
  }, [data, navigate]);

  if (isLoading) return null;

  return (
    <main className="flex h-screen w-full items-center justify-center bg-muted">
      <Outlet />
    </main>
  );
}
