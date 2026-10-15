import { AppHeader } from "@/components/header";
import { AppSidebar, MobileNavSheet } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { SubscriptionBanner } from "@/components/subscription-banner";
import { useCheckAuth } from "@/http/generated/auth/auth";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { identifyUser } from "@/lib/analytics";
import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { usePageview } from "@/hooks/use-pageview";
import { useProductTour } from "@/hooks/use-product-tour";

export function AppLayout() {
  const { data, isFetching } = useCheckAuth()
  const { data: me } = useGetAuthenticatedUser()
  const navigate = useNavigate()

  const location = useLocation()

  // Tie the analytics session to the authenticated lawyer.
  useEffect(() => {
    const user = me?.data
    if (user?.id) identifyUser(user.id, { email: user.mail, name: user.name })
  }, [me])

  usePageview()
  useKeyboardShortcuts()
  const { startIfFirstVisit } = useProductTour()

  useEffect(() => {
    if (isFetching) return

    if (!data?.isAuthenticated) {
      navigate('/authentication')
      return
    }

    if (location.pathname === '/') {
      navigate('/home', { replace: true })
    }
  }, [isFetching, data?.isAuthenticated, navigate, location.pathname])

  useEffect(() => {
    if (!isFetching && data?.isAuthenticated) {
      startIfFirstVisit()
    }
  }, [isFetching, data?.isAuthenticated, startIfFirstVisit])

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <AppSidebar />
      <MobileNavSheet />

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="shrink-0">
          <AppHeader />
          <SubscriptionBanner />
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain outline-none"
        >
          <Outlet />
        </main>
      </div>

      <CommandPalette />
    </div>
  )
}
