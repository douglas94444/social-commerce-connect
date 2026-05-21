import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppSidebar } from "@/components/app/AppSidebar";
import { OnboardingBanner } from "@/components/app/OnboardingBanner";
import { OrderNotifications } from "@/components/app/OrderNotifications";
import { getOnboardingStatus } from "@/lib/fulfillment.functions";
import { isOnboardingExemptPath } from "@/lib/onboarding";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Painel — FulFillly" }] }),
  component: AppLayout,
});

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const fetchStatus = useServerFn(getOnboardingStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => fetchStatus(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  if (data && !data.requiredComplete && !isOnboardingExemptPath(location.pathname)) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <OnboardingGate>
      <div className="flex min-h-screen bg-muted/20">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <OnboardingBanner />
          <OrderNotifications />
          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </OnboardingGate>
  );
}
