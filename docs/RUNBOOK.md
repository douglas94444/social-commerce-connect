# FulFillly — Runbook de produção

## Pré-requisitos

1. **Supabase** — projeto com migrations aplicadas (`supabase db push` ou SQL no dashboard).
2. **TikTok Shop Partner** — app com OAuth redirect e webhook configurados.
3. **Melhor Envio** — token API (sandbox ou produção).
4. **Cloudflare Workers** — app `fulfillly` com secrets.

## Migrations (ordem)

1. `20260521115207_*` — schema base
2. `20260521120000_*` — políticas INSERT orders/sync_logs
3. `20260521140000_*` — `brands.tiktok_shop_cipher`
4. `20260521150000_*` — índice único `products(brand_id, sku)`

## Secrets no Worker (`wrangler secret put`)

| Secret | Obrigatório |
|--------|-------------|
| `SUPABASE_URL` | Sim |
| `SUPABASE_PUBLISHABLE_KEY` | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim (webhook, OAuth, jobs) |
| `TIKTOK_APP_KEY`, `TIKTOK_APP_SECRET`, `TIKTOK_SERVICE_ID` | Sim |
| `TIKTOK_WEBHOOK_SECRET` | Sim |
| `MELHOR_ENVIO_TOKEN` | Sim (etiquetas) |
| `CRON_SECRET` | Sim (jobs) |
| `APP_ORIGIN` | Sim (URL pública, ex. `https://fulfillly....workers.dev`) |
| `TIKTOK_OAUTH_STATE_SECRET` | Opcional |

## URLs no TikTok Partner Center

- **OAuth redirect:** `https://SEU_DOMINIO/api/public/tiktok/oauth/callback`
- **Webhook:** `https://SEU_DOMINIO/api/public/tiktok/webhook`

## Supabase Auth

Em **Authentication → URL Configuration**, inclua:

- Site URL: `https://SEU_DOMINIO`
- Redirect URLs: `https://SEU_DOMINIO/**`, `http://localhost:3000/**`

## Deploy

```bash
npm run build
npm run deploy
```

O deploy usa `dist/server/wrangler.json` gerado pelo build.

**Produção atual:** https://fulfillly.douglaspinheirosantos94.workers.dev

### Secrets já configurados no Worker

- `SUPABASE_URL` (var no wrangler)
- `SUPABASE_PUBLISHABLE_KEY`
- `APP_ORIGIN` → URL do Worker acima
- `CRON_SECRET` → gere o seu com `npx wrangler secret put CRON_SECRET --config dist/server/wrangler.json`

### Secrets que você ainda precisa adicionar

No [Supabase Dashboard](https://supabase.com/dashboard/project/sgsyadxeutselxseqfej/settings/api) copie a **service_role** e rode:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --config dist/server/wrangler.json
```

Depois, quando tiver credenciais TikTok / Melhor Envio:

```bash
npx wrangler secret put TIKTOK_APP_KEY --config dist/server/wrangler.json
npx wrangler secret put TIKTOK_APP_SECRET --config dist/server/wrangler.json
npx wrangler secret put TIKTOK_SERVICE_ID --config dist/server/wrangler.json
npx wrangler secret put TIKTOK_WEBHOOK_SECRET --config dist/server/wrangler.json
npx wrangler secret put MELHOR_ENVIO_TOKEN --config dist/server/wrangler.json
```

## Supabase Auth (redirect)

No projeto `sgsyadxeutselxseqfej`, em **Authentication → URL Configuration**:

- **Site URL:** `https://fulfillly.douglaspinheirosantos94.workers.dev`
- **Redirect URLs:** `https://fulfillly.douglaspinheirosantos94.workers.dev/**`, `http://localhost:3000/**`

## Jobs (cron externo)

Chamar com `Authorization: Bearer $CRON_SECRET`:

| Rota | Frequência sugerida |
|------|---------------------|
| `POST /api/jobs/refresh-tokens` | Diário |
| `POST /api/jobs/poll-orders` | A cada 6–12h (fallback se webhook falhar) |

Exemplo:

```bash
curl -X POST "https://SEU_DOMINIO/api/jobs/refresh-tokens" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

## Fluxo de aceite (staging)

1. Signup → onboarding → conectar TikTok → salvar armazém → acessar `/app`
2. Importar catálogo → produtos no painel
3. Pedido via webhook ou polling → fila + toast
4. Pedido → cotar Melhor Envio → gerar etiqueta → confirmar envio (RTS TikTok)
5. Sync estoque: ícone ↻ no catálogo (produtos com `tiktok_product_id`)

## Troubleshooting

| Sintoma | Verificar |
|---------|-----------|
| 503 no webhook | `TIKTOK_WEBHOOK_SECRET` e assinatura no Partner |
| OAuth falha | `APP_ORIGIN`, redirect URI idêntico no Partner e callback |
| Etiqueta falha | `MELHOR_ENVIO_TOKEN`, endereço do armazém completo |
| RTS falha | Token TikTok, `tiktok_shop_cipher`, IDs de transportadora |
| Gate bloqueia `/app` | `tiktok_shop_id` + `warehouse_address` em `brands` |

## Fora do escopo v1

- E-mail (Resend)
- Google OAuth
- Stripe / billing
