import { Outlet } from "react-router-dom";
import { usePageview } from "@/hooks/use-pageview";

export function LandingLayout() {
  usePageview();

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}