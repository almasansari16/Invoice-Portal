# Invoicing System (Next.js + Prisma + PostgreSQL)

Customer/agent management, automatic invoice numbers, shipment details, USD/PKR invoices,
PDF download + print, company logo, invoice search/edit, customer-wise history,
Excel/CSV export, and login.

## Stack
- Next.js 14 (App Router) — frontend + API routes
- Prisma ORM + PostgreSQL (Neon / Supabase)
- NextAuth (email/password login, Admin/Staff roles)
- @react-pdf/renderer (PDF), exceljs (Excel/CSV)

## 1. Local setup

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET
npx prisma db push          # creates tables in PostgreSQL
npm run db:seed             # creates first admin user + default settings
npm run db:seed:demo        # optional: demo company, 8 customers, 24 invoices
npm run dev                 # http://localhost:3000
```

Default admin comes from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Change the password after first login
and set company name, logo, address and bank details in **Company Settings**.

Invoice numbers look like `INV-2026-000001`; the prefix is editable in settings.

## 2. Deploy on a VPS (recommended)

```bash
# server: Ubuntu, Node 18/20+, MySQL, Nginx
git clone <your-repo> /var/www/invoicing && cd /var/www/invoicing
npm install
cp .env.example .env   # set DATABASE_URL, NEXTAUTH_URL=https://yourdomain.com, NEXTAUTH_SECRET
npx prisma migrate deploy   # or: npx prisma db push
npm run db:seed
npm run build
npm i -g pm2
pm2 start npm --name invoicing -- start
pm2 save && pm2 startup
```

Nginx reverse proxy:

```nginx
server {
  server_name yourdomain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
Then enable HTTPS: `certbot --nginx -d yourdomain.com`.

## 3. Deploy on shared hosting

Next.js needs **Node.js**, so the host must support it (cPanel → **Setup Node.js App**, e.g. Hostinger,
Namecheap, many local hosts). Plain PHP-only hosting will not work.

1. Create a MySQL database + user in cPanel; put credentials in `DATABASE_URL`.
2. Build locally or on the server (`npm run build`). `next.config.js` uses `output: "standalone"`.
3. In **Setup Node.js App**: choose Node 18+, application root = project folder,
   startup file = `server.js` (create it, below), then add the env variables from `.env`.
4. Run `npx prisma db push` and `npm run db:seed` from the cPanel terminal.

`server.js`:
```js
const { createServer } = require("http");
const next = require("next");
const app = next({ dev: false });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
});
```

If your host has no Node.js support, use a small VPS instead (~$5/month).

## Notes
- Logo is stored in the database as a data URL, so no file-write permissions are needed on the server.
- Only Admin users can edit Company Settings. To add staff, create users via `prisma studio` (`npm run db:studio`)
  with a bcrypt-hashed password, or extend the seed script.
- Back up your MySQL database regularly.
