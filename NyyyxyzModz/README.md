# NyyyxyzModz — Premium Digital Store

Next.js App Router + TypeScript + Prisma + PostgreSQL/Supabase + manual QRIS.

## Run

1. Copy `.env.example` to `.env` and fill your own values.
2. `npm install`
3. `npm run db:generate`
4. `npm run db:validate`
5. `npm run db:push`
6. `npm run db:seed`
7. `npm run dev`

For production/Vercel, configure the same environment variables in Vercel and run Prisma generation during the build.

## Admin

Set `ADMIN_EMAIL` and a bcrypt-compatible `ADMIN_PASSWORD_HASH` in `.env` before seeding. The project intentionally does not ship credentials.

## Payment

Manual QRIS only. There is no Pakasir integration. Orders stay pending until an admin verifies payment. Key assignment happens inside a Prisma transaction and only uses AVAILABLE keys.

## Assets

The supplied banners, product images, and QRIS image are stored in `public/assets` and `public/products`.

## Important

No `.env` file or credential is included. Product/game usage can carry platform/account risks; the storefront does not promise anti-ban or anti-detection.

## Fitur tambahan
Admin sekarang memiliki halaman Categories, Key Restock, Users/Reseller/Credit, Vouchers, Banners, Media, Activity, Settings, serta Orders dan Products yang dapat dikelola. Customer memiliki cart, voucher validation, multi-item order, forgot/reset password, dan email verification opsional via Resend. Reseller dapat membayar order memakai credit jika credit mencukupi. Security middleware menambahkan basic security headers, same-origin protection untuk request mutasi, dan struktur rate-limit helper.

## Testing
Testing/build sengaja tidak dijalankan sesuai permintaan. Jalankan sendiri: `npm install`, `npm run db:generate`, `npm run db:validate`, `npm run db:push`, `npm run db:seed`, lalu `npm run build`.


## Fitur tambahan versi lanjutan
- Admin analytics 30 hari
- CSV export users/products/orders/keys
- Bulk import key TXT/CSV
- Reseller dashboard + credit history
- Credit transaction ledger
- Reserved stock saat checkout dan release saat invoice expired
- Vercel Cron cleanup setiap 5 menit
- Activity SSE realtime dengan fallback
- Supabase Storage upload opsional
- Voucher schedule/toggle/delete
- Banner/category/media management actions
- Product/variant edit/delete
- Settings tambahan
- robots.txt dan sitemap.xml

### Testing
Testing/build sengaja tidak diklaim berhasil. Jalankan sendiri: `npm install`, `npm run db:generate`, `npm run db:validate`, `npm run db:push`, `npm run db:seed`, `npm run build`.
