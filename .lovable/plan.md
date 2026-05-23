# FulFillly — TikTok Shop Fulfillment (estado atual)

SaaS focado: **marcas conectam TikTok Shop, recebem pedidos, geram etiquetas Melhor Envio e confirmam envio (RTS)**. Sem marketplace de criadores, sem e-mail na v1.

## Stack

TanStack Start + Supabase + Cloudflare Workers. TikTok Shop Partner API direta (`src/lib/tiktok/`). Melhor Envio via `shipping.functions.ts`. Notificações in-app (Realtime/toast).

## Status por fase

| Fase | Conteúdo | Status |
|------|----------|--------|
| 0 | Landing, marketing | ✅ |
| 1 | Auth email/senha, gate, signup → brand | ✅ |
| 2 | Schema brands/products/orders/sync_logs + RLS | ✅ |
| 3 | TikTok OAuth, import catálogo, sync estoque | ✅ |
| 4 | Dashboard, catálogo, configurações armazém | ✅ |
| 5 | Webhook pedidos + lista/detalhe pedidos | ✅ (sem e-mail) |
| 6 | Melhor Envio cotação + etiqueta | ✅ |
| 7 | Confirmar envio + RTS TikTok | ✅ |
| 8 | Jobs refresh token + polling | ✅ |
| — | Polimento (OG, Stripe, Google OAuth) | 🔜 futuro |

## Rotas principais

```text
src/routes/
├── login.tsx, signup.tsx
├── _authenticated/app/
│   ├── index.tsx          # fila
│   ├── products.tsx       # catálogo + import/sync TikTok
│   ├── orders.tsx, orders.$id.tsx
│   ├── setup.tsx          # integrações OAuth
│   ├── onboarding.tsx
│   └── settings.tsx
└── api/
    ├── public/tiktok/webhook.ts
    ├── public/tiktok/oauth/callback.ts
    └── jobs/
        ├── refresh-tokens.ts
        └── poll-orders.ts
```

## Server libs

- `tiktok.functions.ts` — connect, import, sync stock, disconnect
- `tiktok.server.ts` — OAuth callback, RTS, polling (só servidor)
- `shipping.functions.ts` — Melhor Envio
- `fulfillment.functions.ts` — brand, pedidos, produtos, dashboard

## Deploy e ops

Ver **[docs/RUNBOOK.md](../docs/RUNBOOK.md)** para secrets, URLs TikTok, jobs cron e checklist E2E.

## Decisões de produto

- **Melhor Envio** — transportadora padrão BR
- **Sem Resend** na v1 — notificações só no painel
- **TikTok Partner** — credenciais reais necessárias para produção (sandbox para dev)
