# NyyyxyzModz Vercel Deployment

## Requirements

- Node.js compatible with the repository toolchain
- A PostgreSQL database, such as Supabase PostgreSQL
- A Vercel project connected to this repository
- Optional: Resend for verification and password-reset email
- Optional: Supabase Storage for admin media uploads

Do not commit `.env` files, database URLs, password hashes, API keys, or service-role keys.

## Install and validate locally

```text
npm install
npm run db:validate
npm run db:generate
npm run lint
npm run build
```

## Environment variables

### Required

- `DATABASE_URL`: PostgreSQL connection used by Prisma at runtime.
- `DIRECT_URL`: direct PostgreSQL connection used by Prisma database operations.
- `ADMIN_EMAIL`: admin email used by the seed script.
- `ADMIN_PASSWORD_HASH`: bcrypt hash used by the seed script. Never use plaintext.
- `NEXT_PUBLIC_SITE_URL`: canonical application URL used by auth links, robots, and sitemap.
- `NEXT_PUBLIC_ADMIN_WHATSAPP_1`: public WhatsApp contact number shown to customers.
- `NEXT_PUBLIC_ADMIN_WHATSAPP_2`: second public WhatsApp contact number.
- `CRON_SECRET`: secret used to authorize reservation cleanup in production.

### Optional

- `RESEND_API_KEY`: enables Resend email delivery.
- `RESEND_FROM`: sender identity for Resend, when `RESEND_API_KEY` is configured.
- `SUPABASE_URL`: Supabase project URL for media uploads.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase Storage credential.
- `SUPABASE_STORAGE_BUCKET`: Storage bucket name; defaults to `media`.
- `NODE_ENV`: set automatically by Vercel; use `development` locally when needed.

Only the `NEXT_PUBLIC_*` values are intended for browser exposure. `DATABASE_URL`, `DIRECT_URL`, `ADMIN_PASSWORD_HASH`, `CRON_SECRET`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must remain server-only.

There is no separate `AUTH_SECRET` or `NEXTAUTH_SECRET` in this project because the current session implementation uses database-backed random session tokens and does not read those variables.

## Database setup

1. Create the Vercel project environment variables for Preview and Production.
2. Set `DATABASE_URL` and `DIRECT_URL` to the appropriate PostgreSQL connection strings.
3. From a trusted local environment, run:

```text
npm run db:validate
npm run db:generate
npm run db:push
npm run db:seed
```

Do not run seed against production unless the seed data is explicitly intended for that database. The seed uses `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` when both are configured.

## Vercel setup

1. Import the existing project into Vercel.
2. Keep the project root at the directory containing `package.json`, `prisma/`, and `app/`.
3. Use the default Next.js build configuration. The repository build command is `npm run build`.
4. Add environment variables separately for Development, Preview, and Production.
5. Add `CRON_SECRET` to the same environment where the cron runs.
6. Vercel Cron calls `/api/cron/cleanup` every five minutes as configured in `vercel.json`. The route requires `Authorization: Bearer <CRON_SECRET>` in production.
7. Do not expose `SUPABASE_SERVICE_ROLE_KEY` or any database credential as `NEXT_PUBLIC_*`.

## Manual QRIS

Payment remains manual QRIS. The QRIS image is an existing public asset at `/assets/qris.png`. No payment gateway credential or additional QRIS environment variable is required. Orders remain pending until an authorized admin verifies payment.

## Optional email

Without `RESEND_API_KEY`, registration marks email as verified and password-reset requests do not send email. Configure Resend before production if email verification and password recovery are required. The API key is server-only.

## Optional media storage

Without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, media upload returns a clear configuration error and the rest of the application remains available. Configure both values and `SUPABASE_STORAGE_BUCKET` when admin uploads are required.

## Post-deployment smoke test

Check these public routes after deployment:

- `/`
- `/products`
- `/help`
- `/login`
- `/register`
- `/robots.txt`
- `/sitemap.xml`

Then verify manually in a protected staging/preview environment:

- customer registration/login/logout
- product detail and server-priced checkout
- manual QRIS invoice flow
- admin payment verification and key delivery
- expired reservation cleanup
- reseller credit purchase
- voucher limits
- optional Resend email
- optional Supabase media upload

Vercel deployment, real payment, Resend delivery, Supabase Storage, and production Cron require manual environment-specific verification.
