import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/orders")({
  head: () => ({ meta: [{ title: "Orders — FulFillly" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Orders</h1>
      <Card className="grid place-items-center p-16 text-center">
        <p className="font-display text-xl">No orders yet</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Once your TikTok Shop is connected, new orders will land here in real time via webhook.
        </p>
      </Card>
    </div>
  );
}
