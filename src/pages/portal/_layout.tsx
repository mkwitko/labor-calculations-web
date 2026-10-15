import { useCheckAuth } from "@/http/generated/auth/auth";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export function PublicPortalLayout() {
  const { data, isLoading } = useCheckAuth();
  const navigate = useNavigate();

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
