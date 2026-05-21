
# FulFillly — Plano de Construção

Plataforma B2B2C que conecta Brands, Creators, Fulfillment e TikTok Shop. A spec original assume Next.js/Prisma/Redis/BullMQ/Vercel; este projeto roda em **TanStack Start v1 + Lovable Cloud (Supabase) + Cloudflare Workers**. O plano abaixo preserva 100% do produto, traduzindo apenas a stack.

## Tradução de stack (uma vez só)

| Spec original | Equivalente neste projeto |
|---|---|
| Next.js App Router / `app/api/.../route.ts` | TanStack Start, rotas em `src/routes/`, server routes em `src/routes/api/` |
| Server Actions (`"use server"`) | `createServerFn` em `src/lib/*.functions.ts` |
| Prisma + `npx prisma db push` | Migrations SQL geridas pelo Lovable Cloud + tipos gerados |
| Supabase Auth direto | Lovable Cloud Auth (mesmo Supabase, wrapper) — Email/senha + Google via broker |
| RBAC por checagem em código | Tabela `user_roles` + função `has_role()` security-definer + RLS por tenant (`brand_id` / `creator_id`) |
| BullMQ + Redis (jobs) | `pg_cron` no Postgres chamando endpoints `/api/public/jobs/*` com HMAC |
| Webhooks (`/api/webhooks/tiktok`) | Server route `src/routes/api/public/webhooks/tiktok.ts` com verificação de assinatura |
| TikTok Shop API direto | Conector **TikTok** do Lovable via `connector-gateway.lovable.dev/tiktok/*` (gateway lida com OAuth refresh) |
| Stripe Connect | Integração Stripe via secret `STRIPE_SECRET_KEY` + server functions |
| Resend (e-mail) | Conector **Resend** |
| Cloudflare R2 / Supabase Storage | Supabase Storage (já incluso no Cloud) |
| `globalThis` / in-memory state | Sempre persistir em Postgres (Workers são stateless) |

Branding: **FulFillly**. Paleta inspirada no brief (vermelho TikTok + ciano), mas vamos refinar com tokens semânticos em `src/styles.css` (oklch), nunca cores hard-coded em componentes.

## Fase 0 — Fundação visual e marca (sem Cloud)

- Definir tokens em `src/styles.css`: paleta FulFillly (primary vermelho, secondary ciano, accents por persona: brand=indigo, creator=purple, fulfillment=amber, admin=neutral), tipografia (par display + body distintivo, evitar Inter genérico), raios, sombras, gradientes.
- Substituir o placeholder em `src/routes/index.tsx` por **landing page real** do FulFillly: hero, como funciona (Brand → Fulfillment → Creator → TikTok → Customer), revenue streams, prova social, CTA waitlist.
- Rotas públicas adicionais: `/about`, `/for-brands`, `/for-creators`, `/pricing`, `/contact`. Cada uma com `head()` próprio (title/description/og).
- Componentes shadcn já estão instalados — vamos usar e estilizar via variantes, não sobrescrever inline.
- Header/Footer compartilhados, com links pra `/login` e `/signup`.

**Entregável:** site público do FulFillly navegável. **Não precisa de Cloud.**

## Fase 1 — Auth, roles e tenancy (precisa de Cloud)

- Migration: enum `app_role` (`brand_owner`, `brand_member`, `creator`, `admin`, `fulfillment_operator`), tabela `user_roles`, função `has_role(uuid, app_role)` security-definer.
- Tabelas `brands` e `creators` (tenant roots) com `user_id` FK pra `auth.users`, RLS scoped por `auth.uid()`.
- Trigger `handle_new_user` cria registro mínimo em `brands` ou `creators` conforme role escolhido no signup.
- Páginas: `/login`, `/signup` (com seletor "Sou marca / Sou creator"), `/onboarding/brand`, `/onboarding/creator`.
- Auth: email/senha + Google (via broker Lovable — `lovable.auth.signInWithOAuth("google", ...)` + `configure_social_auth`).
- `src/start.ts` recebe `attachSupabaseAuth` para anexar bearer token em server fns.
- Layout protegido `src/routes/_authenticated.tsx` com `beforeLoad` + redirect.
- Layouts por persona: `_authenticated/brand/`, `_authenticated/creator/`, `_authenticated/fulfillment/`, `_authenticated/admin/` (cada um valida role via `has_role`).

**Entregável:** signup → role → onboarding → dashboard vazio da persona certa.

## Fase 2 — Schema completo (migrations)

Traduz todo o schema Prisma para SQL com RLS por tenant. Tabelas:

- **Catalog:** `products`, `product_variants`
- **Inventory:** `inventory`, `inventory_movements`
- **Creator marketplace:** `creator_applications`, `creator_products`, `creator_campaigns`
- **Orders:** `orders`, `order_items`, `order_events`
- **Commissions:** `creator_earnings`
- **Marketplaces:** `marketplace_connections`, `marketplace_products`, `sync_logs`
- **Fulfillment:** `fulfillment_tasks`
- **Analytics:** `daily_analytics`

Regras universais: `created_at`/`updated_at`/`deleted_at` (soft delete), índices em FKs + enums + filtros frequentes, RLS via `has_role` + tenant_id matching, snapshots denormalizados em `order_items`.

## Fase 3 — Brand Dashboard (CRUD core)

- Layout com sidebar (Products, Orders, Creators, Marketplaces, Analytics, Settings).
- **Products:** lista paginada, criar/editar/arquivar, upload de imagens (Supabase Storage), variantes, SKU único por brand, commission rate override.
- **Inventory:** view consolidada por warehouse, movimentações manuais, alertas de baixo estoque.
- **Creator applications:** aprovar/rejeitar candidaturas.
- **Settings:** dados empresa, default commission rate, subscription tier (mock por enquanto).

Tudo via `createServerFn` com `requireSupabaseAuth` + validação Zod.

## Fase 4 — Creator Dashboard

- Layout mobile-first (creators usam celular), cores roxas.
- **Browse:** catálogo de produtos de brands aprovadas, filtros por categoria/comissão.
- **My Products:** produtos que está promovendo, com `affiliate_code` único, métricas (views, clicks, orders, revenue).
- **Campaigns:** vincular URL/ID de vídeo TikTok a uma campanha; performance trackeada.
- **Earnings:** widget proeminente — pending / approved / paid, histórico, integração Stripe Connect (onboarding).
- **Profile:** handles sociais, bio, pix/banco.

## Fase 5 — Integração TikTok Shop

- Conectar conector **TikTok** do Lovable (gateway abstrai OAuth).
- Tela em `/brand/marketplaces` para "Connect TikTok Shop".
- Server fns:
  - `syncProductToTikTok(productId)` — POST gateway products
  - `syncInventory(productId)` — update stock
  - `pollTikTokOrders()` — fallback ao webhook
- **Webhook handler** em `src/routes/api/public/webhooks/tiktok.ts`:
  - Verifica assinatura HMAC com `TIKTOK_WEBHOOK_SECRET`
  - Eventos: `order.created`, `order.cancelled`, `order.refunded`, `product.update`
  - Persiste em `orders` + `order_events`, enfileira fulfillment task
- Tabela `marketplace_connections` guarda estado por brand.
- `sync_logs` para auditoria.

Nota importante: o TikTok Partner approval (o doc longo que você compartilhou antes) roda **em paralelo**. Enquanto não aprovado, o gateway do Lovable + conector funciona pra dev/MVP; quando aprovado, troca credenciais.

## Fase 6 — Fulfillment Dashboard

- Layout kanban: Picking → Packing → Shipping → Done, cores âmbar.
- Input para scanner (barcode reader) em cada task.
- Geração de etiqueta de envio (placeholder; integração Correios/Melhor Envio em fase posterior).
- Atualização de tracking volta pro TikTok via gateway.
- Server fn `completeFulfillmentTask` faz: marca task done, atualiza `order.status`, envia tracking ao marketplace, dispara webhook interno pra commission engine.

## Fase 7 — Commissions, Analytics, Admin

- **Commission engine:** trigger no Postgres ao mudar `orders.status` para `DELIVERED` → cria `creator_earnings` (PENDING → APPROVED após N dias → PAID via Stripe Connect transfer).
- **Daily analytics rollup:** `pg_cron` diário chamando `/api/public/jobs/rollup-analytics` (HMAC-protected) que popula `daily_analytics` por brand/creator.
- **Admin panel:** lista brands/creators, suspende contas, vê GMV global, logs de sync, fila de fulfillment tasks pendentes.
- Recharts para dashboards (já temos shadcn chart).

## Fase 8 — Pagamentos e polimento

- Stripe Checkout para subscription tiers das brands (`payments--enable_stripe_payments`).
- Stripe Connect Express para payouts a creators.
- E-mails transacionais via conector **Resend**: novo pedido, comissão aprovada, payout enviado.
- SEO completo: sitemap, JSON-LD, og:images por rota.
- Auditoria de segurança (`security--run_security_scan`) e fix de findings.

## Riscos e mudanças vs. spec original que você precisa aprovar

1. **Sem BullMQ/Redis** — não dá pra rodar workers persistentes em Workers. Substituição: `pg_cron` + endpoints `/api/public/jobs/*` para tarefas agendadas, e processamento síncrono dentro do webhook handler do TikTok (são milissegundos). Para volumes >10k pedidos/dia que a spec menciona, isso pode precisar de fila externa (Inngest tem conector Lovable; vale como upgrade futuro).
2. **Sem Prisma** — usamos client Supabase tipado. A DX é diferente mas comparável; o tipo é gerado automaticamente das migrations.
3. **TikTok via gateway Lovable** — abstrai OAuth refresh, mas algumas chamadas raras da API podem não estar mapeadas; cairíamos em fetch direto caso preciso.
4. **Multi-warehouse e batch tracking** ficam no schema mas a UI inicial assume `warehouse_id = "default"`.
5. **Realtime subscriptions** (Supabase Realtime) entram só na Fase 6 (kanban de fulfillment).

## Tamanho estimado

Cada fase é 1–3 turnos de implementação. Fase 0 é o que posso fazer agora mesmo enquanto você habilita o Cloud.

## O que preciso de você para começar

1. ✅ Confirmar nome **FulFillly** (com 2 L's mesmo?).
2. 🔓 **Habilitar Lovable Cloud** antes da Fase 1.
3. 🎨 Aprovar abordagem de paleta (vermelho TikTok + ciano + accents por persona) ou pedir direções visuais alternativas.
4. ▶️ Confirmar que devo arrancar pela **Fase 0 (landing pública + marca)** assim que aprovar este plano.
