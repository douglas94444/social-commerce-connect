import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Settings — FulFillly" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Settings</h1>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-xl">TikTok Shop</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your TikTok Shop to import products and receive orders automatically.
          </p>
        </div>
        <Button disabled>Connect TikTok Shop — coming next phase</Button>
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-xl">Warehouse address</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used as the origin for shipping calculations and label generation.
          </p>
        </div>
        <Button variant="outline" disabled>
          Add address — coming next phase
        </Button>
      </Card>
    </div>
  );
}
