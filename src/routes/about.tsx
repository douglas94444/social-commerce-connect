import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FulFillly" },
      {
        name: "description",
        content:
          "FulFillly is building the operating system for social commerce — connecting brands, creators, fulfillment, and TikTok Shop.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">About</p>
        <h1 className="text-5xl md:text-6xl">
          We connect what social commerce <span className="italic">left disconnected.</span>
        </h1>
        <div className="mt-10 space-y-6 text-lg text-muted-foreground">
          <p>
            Brands have inventory. Creators have audience. TikTok has the buyers. But the
            infrastructure that ties them together — logistics, attribution, payouts — is a mess
            of spreadsheets, DMs, and one-off integrations.
          </p>
          <p>
            FulFillly is the operating system for that loop. We give brands a catalog they can ship
            anywhere, creators a transparent marketplace, fulfillment partners a clean queue, and
            TikTok Shop a partner who actually ships on time.
          </p>
          <p>
            We're building the rails for a new generation of commerce. Founders from logistics,
            marketplaces, and creator tools. Headquartered in Brazil, designed for the world.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
