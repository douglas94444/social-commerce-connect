import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Progress } from "@/components/ui/progress";
import { getOnboardingStatus } from "@/lib/fulfillment.functions";

export function OnboardingBanner() {
  const fetchStatus = useServerFn(getOnboardingStatus);
  const { data } = useQuery({ queryKey: ["onboarding-status"], queryFn: () => fetchStatus() });

  if (!data || data.requiredComplete) return null;

  const pct = Math.round((data.stepsComplete / data.totalRequiredSteps) * 100);

  return (
    <div className="border-b border-border bg-primary/5 px-8 py-3">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">
            Complete a configuração para receber pedidos automaticamente ({data.stepsComplete}/
            {data.totalRequiredSteps})
          </p>
          <Progress value={pct} className="mt-2 h-1.5 max-w-md" />
        </div>
        <Link
          to="/app/onboarding"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Continuar configuração →
        </Link>
      </div>
    </div>
  );
}
