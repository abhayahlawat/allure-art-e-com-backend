## Allure Art E-Com Backend

Simple Express API using Supabase for data and Razorpay for payments.

### Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install deps and run dev:
```
npm i
npm run dev
```

### Endpoints
- `POST /api/orders/create-order`: Create Razorpay order and DB draft
- `POST /api/orders/verify`: Verify signature after payment; marks order paid
- `GET /api/orders/:id`: Fetch order with items

### Supabase Tables
Run these SQL snippets in Supabase SQL editor.

```
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  email text null,
  status text not null check (status in ('created','paid','failed')),
  amount bigint not null, -- paise
  currency text not null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text null,
  razorpay_signature text null,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null,
  title text not null,
  artist text not null,
  image text null,
  unit_price_inr bigint not null,
  quantity int not null,
  created_at timestamptz not null default now()
);
```

### Profiles table

```
create table if not exists profiles (
  user_id uuid primary key,
  email text null,
  display_name text null,
  phone text null,
  updated_at timestamptz not null default now()
);
```


