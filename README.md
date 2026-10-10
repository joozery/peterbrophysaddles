This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Demo shopping flow

- `/shop`: sample product catalog and add-to-cart
- `/products/[slug]`: product details and quantity selector
- `/cart`: quantities, removal, stock checks and totals
- `/checkout`: demonstration checkout only; no real payment provider
- `/orders/[id]`: locally saved demo order confirmation
- `/admin/inventory`: demonstration stock editor and order list

Prices are sample AUD amounts, not verified product prices. Product imagery is AI-generated.
Cart, stock and demo orders are saved in this browser's localStorage. Shipping form details are not saved or transmitted.
Checkout rechecks demo stock, reduces it and clears the cart. This browser-only implementation does not provide shared inventory, concurrency guarantees, owner authentication or real orders/payments.

Before production: connect a database and authenticated admin area, reserve/decrement stock transactionally on the server, connect a payment provider with verified webhooks and idempotent order handling, and configure real prices, shipping and taxes. Never use browser-stored prices or stock as the authority for a real order.
