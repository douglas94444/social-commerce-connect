import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, LineChart, Sparkles, Wallet } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/for-creators")({
  head: () => ({
    meta: [
      { title: "For Creators — FulFillly" },
      {
        name: "description",
        content:
          "Pick products you love, post on TikTok, get paid weekly. Real-time earnings, transparent commissions, no DMs with brands.",
      },
      { property: "og:title", content: "For Creators — FulFillly" },
    ],
  }),
  component: ForCreators,
});

const perks = [
  { icon: Sparkles, title: "Curated catalog", body: "Only brands that ship on time." },
  { icon: Coins, title: "Transparent commissions", body: "See your rate before you post." },
  { icon: LineChart, title: "Real-time analytics", body: "Per-video, per-product." },
  { icon: Wallet, title: "Weekly payouts", body: "Pix in BR. Stripe everywhere else." },
];

function ForCreators() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-creator">
          For Creators
        </p>
        <h1 className="max-w-3xl text-balance text-5xl md:text-7xl">
          Post the video. <span className="italic text-creator">Get paid.</span> Skip the chaos.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Browse approved brands, claim a product, post your TikTok. We handle the link, the order,
          the shipping, and your payout. No DMs. No spreadsheets. No waiting.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/signup">Join the waitlist</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-creator/10 text-creator">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-xl">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
