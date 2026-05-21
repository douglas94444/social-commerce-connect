# FulFillly — Refoco em TikTok Shop Fulfillment

Pivot do plano anterior (B2B2C com creators) para um SaaS focado: **marcas conectam TikTok Shop, recebem pedidos, geram etiquetas e atualizam tracking — só isso**. Sem creator marketplace, sem comissões, sem multi-marketplace.

## O que muda vs. plano anterior

**Removido:** Creator dashboard, applications, campaigns, earnings, Stripe Connect payouts, multi-marketplace, admin global, kanban de fulfillment colaborativo.

**Mantido:** Landing pública (já feita na Fase 0), auth, brand dashboard, integração TikTok, schema de pedidos, geração de etiqueta, webhooks.

**Adicionado/foco:** Onboarding TikTok OAuth em 5 min, importação automática de produtos, Melhor Envio (etiquetas BR), email de "novo pedido" via Resend.

## Stack (igual ao já decidido)

TanStack Start + Lovable Cloud (Supabase) + Cloudflare Workers. TikTok via gateway Lovable, Melhor Envio via fetch direto + secret, Resend via conector. `pg_cron` para refresh de token e polling de fallback. Webhooks em `src/routes/api/public/webhooks/tiktok.ts` com HMAC.

## Fases

### Fase 1 — Auth simples (1 persona: brand)
- Enum `app_role`: só `brand_owner` e `admin` (drop creator/fulfillment).
- Tabelas: `user_roles`, função `has_role`, tabela `brands` (com colunas TikTok já previstas).
- Trigger `handle_new_user` cria `brand` automaticamente no signup.
- `/login`, `/signup` (sem seletor de persona — todo signup = brand).
- Google via broker Lovable + `configure_social_auth`.
- `attachSupabaseAuth` em `src/start.ts`.
- Layout `_authenticated.tsx` com `beforeLoad` redirect.

### Fase 2 — Schema enxuto
Quatro tabelas (espelhando a spec do usuário):
- `brands` — campos TikTok (`tiktok_shop_id`, `tiktok_access_token`, `tiktok_refresh_token`, `tiktok_token_expires_at`), `warehouse_address jsonb`.
- `products` — `tiktok_product_id` unique, `sku`, `price`, `stock`, `image_url`.
- `orders` — `tiktok_order_id` unique, `customer_*`, `shipping_address jsonb`, `items jsonb` (denormalizado), `status` enum (`pending|processing|shipped|delivered|cancelled`), `tracking_number`, `shipping_label_url`, `must_ship_by`.
- `sync_logs` — auditoria de chamadas TikTok.

RLS: tudo scoped por `brand_id` via `has_role` + match com `auth.uid()`.

### Fase 3 — Conexão TikTok + import de produtos
- Tela `/app/connect-tiktok` com botão "Conectar TikTok Shop".
- Server fn `connectTikTokShop` — chama gateway, salva tokens em `brands`.
- Server fn `importProducts` — `GET /api/products/search` via gateway, popula `products`.
- Server fn `syncStock(productId)` — atualiza estoque local + `POST /api/products/stocks/update`.
- `pg_cron` diário refresh de tokens próximos do expire.

### Fase 4 — Dashboard da marca
Sidebar: Dashboard, Produtos, Pedidos, Configurações.
- **Dashboard:** cards (pedidos hoje, pendentes, GMV semana, estoque baixo).
- **Produtos:** tabela com SKU, estoque editável inline, botão "Sync estoque".
- **Configurações:** endereço do warehouse (origem do frete), reconectar TikTok.

### Fase 5 — Webhook de pedidos + lista
- `src/routes/api/public/webhooks/tiktok.ts` — verifica HMAC com `TIKTOK_WEBHOOK_SECRET`, processa `order.created`, `order.cancelled`.
- Persiste em `orders` com snapshot completo dos items.
- Dispara email "Novo pedido" via conector Resend.
- Tela `/app/orders` — lista paginada, filtros status/data, busca.
- Tela `/app/orders/$id` — detalhes completos, timeline, endereço, items.

### Fase 6 — Etiqueta de envio (Melhor Envio)
- Secret `MELHOR_ENVIO_TOKEN` (sandbox primeiro).
- Server fn `calculateShipping(orderId)` — POST `/api/v2/me/shipment/calculate` com origem (warehouse) + destino (order.shipping_address) + dimensões padrão.
- Server fn `generateLabel(orderId, serviceId)` — fluxo `cart → checkout → generate → print` → URL do PDF salva em `orders.shipping_label_url`.
- Botão "Gerar Etiqueta" na tela do pedido, modal pra escolher transportadora.

### Fase 7 — Confirmar envio + tracking
- Botão "Marcar como enviado" → modal com input de tracking_number + carrier.
- Server fn `confirmShipment` — atualiza order, chama gateway TikTok `POST /api/fulfillment/rts` com tracking, escreve em `sync_logs`, status vira `shipped`.
- Email de confirmação ao cliente (opcional, via Resend).
- `pg_cron` polling fallback diário pra pedidos que possam ter perdido webhook.

### Fase 8 — Polimento
- SEO já feito na Fase 0; adicionar OG images nas rotas públicas.
- Stripe subscription pra brand tiers (Starter/Pro) via `payments--enable_stripe_payments`.
- Security scan + linter Supabase.
- Documentação de onboarding TikTok Partner (continua em paralelo).

## Riscos vs. spec original do usuário

1. **Cálculo de frete:** Melhor Envio é a escolha mais simples no BR. Se a marca quiser Correios direto, exige contrato — fica como upgrade.
2. **TikTok Partner approval:** o gateway Lovable cobre dev/MVP. Produção real depende de aprovação como Solution Partner (em paralelo).
3. **Multi-warehouse:** schema permite (jsonb), mas UI inicial assume um endereço só.
4. **Webhooks vs. polling:** webhooks são primários; `pg_cron` é fallback de segurança.

## Detalhes técnicos relevantes

```text
src/
├── routes/
│   ├── (public)        ✅ feito na Fase 0
│   ├── login.tsx, signup.tsx
│   ├── _authenticated.tsx              # gate
│   ├── _authenticated/app/
│   │   ├── index.tsx                   # dashboard
│   │   ├── products.tsx
│   │   ├── orders.tsx
│   │   ├── orders.$id.tsx
│   │   ├── connect-tiktok.tsx
│   │   └── settings.tsx
│   └── api/public/
│       ├── webhooks/tiktok.ts          # HMAC + insert
│       └── jobs/refresh-tokens.ts      # pg_cron target
├── lib/
│   ├── tiktok.functions.ts             # gateway calls
│   ├── orders.functions.ts
│   ├── products.functions.ts
│   ├── shipping.functions.ts           # Melhor Envio
│   └── email.functions.ts              # Resend
```

Secrets necessários: `TIKTOK_WEBHOOK_SECRET`, `MELHOR_ENVIO_TOKEN`, conector TikTok, conector Resend.

## O que preciso de você

1. ✅ Confirmar o foco: **só fulfillment de TikTok Shop, sem creators**.
2. 🇧🇷 **Melhor Envio** como transportadora padrão (vs. Frenet, Kangu, Correios contrato)?
3. ▶️ Posso começar pela **Fase 1 (Auth)** assim que aprovar?
