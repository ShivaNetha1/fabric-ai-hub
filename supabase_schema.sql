-- Drop existing triggers and functions if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop existing tables in correct order
drop table if exists public.orders cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.products cascade;
drop table if exists public.buyers cascade;
drop table if exists public.suppliers cascade;
drop table if exists public.profiles cascade;

-- 1. Create Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role text check (role in ('buyer', 'supplier')) not null,
  full_name text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Create Suppliers Table
create table public.suppliers (
  id uuid references public.profiles(id) on delete cascade primary key,
  name text not null,
  business_type text,
  contact_info text,
  address text,
  city text not null,
  country text not null,
  since integer check (since > 1900),
  verified boolean default false not null,
  rating numeric(3,2) default 5.0 check (rating >= 0 and rating <= 5),
  orders_count integer default 0 not null,
  response_hours integer default 24 check (response_hours >= 0),
  categories text[] default '{}'::text[] not null,
  fabric_types text[] default '{}'::text[] not null,
  certificates text[] default '{}'::text[] not null,
  about text,
  hours text,
  phone text
);

-- 3. Create Buyers Table
create table public.buyers (
  id uuid references public.profiles(id) on delete cascade primary key,
  company_name text,
  industry text,
  business_type text,
  typical_budget text,
  preferred_materials text[] default '{}'::text[] not null,
  typical_volume text
);

-- 4. Create Products Table
create table public.products (
  id text primary key, -- Woven-level clean strings e.g. 'mulberry-silk-charmeuse'
  name text not null,
  subtitle text,
  material text not null,
  composition text not null,
  image_url text not null,
  gallery_urls text[] default '{}'::text[] not null,
  price_per_metre numeric(10,2) not null check (price_per_metre >= 0),
  currency text default '₹' not null,
  moq integer not null check (moq >= 0),
  gsm integer not null check (gsm >= 0),
  width_cm integer not null check (width_cm >= 0),
  colors jsonb default '[]'::jsonb not null, -- Array of {name, hex}
  supplier_id uuid references public.suppliers(id) on delete cascade not null,
  rating numeric(3,2) default 5.0 check (rating >= 0 and rating <= 5),
  reviews_count integer default 0 not null,
  lead_time_days integer not null check (lead_time_days >= 0),
  availability text not null check (availability in ('In stock', 'Low stock', 'Made to order')),
  certifications text[] default '{}'::text[] not null,
  sustainable boolean default false not null,
  tags text[] default '{}'::text[] not null,
  description text not null,
  stock_metres integer not null check (stock_metres >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. Create Cart Items Table
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id text references public.products(id) on delete cascade not null,
  metres integer not null check (metres > 0),
  colour text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, product_id, colour)
);

-- 6. Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  supplier_id uuid references public.suppliers(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  colour text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(10,2) not null,
  total_amount numeric(10,2) not null,
  status text check (status in ('Pending', 'Accepted', 'Preparing', 'Ready for Dispatch', 'Completed')) default 'Pending' not null,
  placed_at timestamptz default timezone('utc'::text, now()) not null,
  eta_date timestamptz,
  shipping_address text
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.buyers enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- profiles policies
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- suppliers policies
create policy "Allow public read access to suppliers" on public.suppliers
  for select using (true);

create policy "Allow suppliers to update their own record" on public.suppliers
  for update using (auth.uid() = id);

-- buyers policies
create policy "Allow public read access to buyers" on public.buyers
  for select using (true);

create policy "Allow buyers to update their own record" on public.buyers
  for update using (auth.uid() = id);

-- products policies
create policy "Allow public read access to products" on public.products
  for select using (true);

create policy "Allow suppliers to manage their own products" on public.products
  for all using (
    auth.uid() = supplier_id and 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'supplier'
    )
  );

-- cart_items policies
create policy "Allow users to view their own cart items" on public.cart_items
  for select using (auth.uid() = user_id);

create policy "Allow users to manage their own cart items" on public.cart_items
  for all using (auth.uid() = user_id);

-- orders policies
create policy "Allow buyers to view their placed orders" on public.orders
  for select using (auth.uid() = buyer_id);

create policy "Allow suppliers to view received orders" on public.orders
  for select using (auth.uid() = supplier_id);

create policy "Allow buyers to place orders" on public.orders
  for insert with check (
    auth.uid() = buyer_id and 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'buyer'
    )
  );

create policy "Allow suppliers to update order statuses" on public.orders
  for update using (
    auth.uid() = supplier_id and 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'supplier'
    )
  );

-- ==========================================
-- AUTH SIGNUP TRIGGER SETUP
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  full_name_val text;
  company_name_val text;
begin
  -- Extract metadata values from signup
  user_role := coalesce(new.raw_user_meta_data->>'role', 'buyer');
  full_name_val := coalesce(new.raw_user_meta_data->>'full_name', '');
  company_name_val := coalesce(new.raw_user_meta_data->>'company_name', '');

  -- Insert profile
  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, user_role, full_name_val);

  -- Insert specific sub-role records
  if user_role = 'supplier' then
    insert into public.suppliers (id, name, city, country, since, verified, categories, certificates)
    values (
      new.id,
      case when company_name_val <> '' then company_name_val else 'New Mill House' end,
      'Ahmedabad', -- defaults that can be updated in dashboard
      'India',
      extract(year from now())::integer,
      false,
      '{"Cotton"}'::text[],
      '{"OEKO-TEX"}'::text[]
    );
  else
    insert into public.buyers (id, company_name)
    values (
      new.id,
      case when company_name_val <> '' then company_name_val else 'New Buyer Agency' end
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- SEED DATA (MOCK SUPPLIERS AND PRODUCTS)
-- ==========================================

-- Seed Mock Auth Users
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
values 
  ('11111111-1111-1111-1111-111111111111', 'arvind@loomly.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"supplier","company_name":"Arvind Weaving House"}', now(), now(), 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'kanchi@loomly.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"supplier","company_name":"Kanchi Silk Mills"}', now(), now(), 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'baltic@loomly.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"supplier","company_name":"Baltic Linen Works"}', now(), now(), 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', 'milano@loomly.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"supplier","company_name":"Milano Lana Tessuti"}', now(), now(), 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Update the auto-created supplier profiles with correct mock data
update public.suppliers set city = 'Ahmedabad', country = 'India', since = 1994, verified = true, rating = 4.9, orders_count = 12480, response_hours = 2, categories = '{"Cotton", "Denim", "Yarn-dyed"}'::text[], certificates = '{"GOTS", "OEKO-TEX 100", "ISO 9001"}'::text[], about = 'Three generations of vertically integrated cotton weaving. 42 air-jet looms, in-house dyeing and a 90,000 metre monthly capacity serving apparel brands across 18 countries.', hours = 'Mon–Sat · 09:00–19:00 IST', phone = '+91 79 4001 2200' where id = '11111111-1111-1111-1111-111111111111';
update public.suppliers set city = 'Kanchipuram', country = 'India', since = 1981, verified = true, rating = 4.8, orders_count = 6120, response_hours = 4, categories = '{"Silk", "Blends", "Jacquard"}'::text[], certificates = '{"Silk Mark", "OEKO-TEX 100"}'::text[], about = 'Master silk house specialising in mulberry charmeuse, dupion and hand-guided jacquard for luxury ateliers and bridal labels.', hours = 'Mon–Fri · 10:00–18:30 IST', phone = '+91 44 2722 8890' where id = '22222222-2222-2222-2222-222222222222';
update public.suppliers set city = 'Vilnius', country = 'Lithuania', since = 2006, verified = true, rating = 4.9, orders_count = 3840, response_hours = 6, categories = '{"Linen", "Hemp", "Home textiles"}'::text[], certificates = '{"Masters of Linen", "GOTS", "EU Flax"}'::text[], about = 'European flax spun and woven within 300 km of the field. Stonewashed finishes, low-water dyeing and full traceability to the harvest lot.', hours = 'Mon–Fri · 08:00–17:00 EET', phone = '+370 5 210 4488' where id = '33333333-3333-3333-3333-333333333333';
update public.suppliers set city = 'Biella', country = 'Italy', since = 1967, verified = true, rating = 5.0, orders_count = 2210, response_hours = 8, categories = '{"Wool", "Suiting", "Cashmere"}'::text[], certificates = '{"RWS", "ISO 14001"}'::text[], about = 'Biella wool mill producing Super 120s–180s suiting for tailoring houses. Water sourced from the Alpine basin, closed-loop finishing.', hours = 'Mon–Fri · 09:00–17:30 CET', phone = '+39 015 840 2211' where id = '44444444-4444-4444-4444-444444444444';

-- Seed Products
insert into public.products (id, name, subtitle, material, composition, image_url, price_per_metre, moq, gsm, width_cm, colors, supplier_id, rating, reviews_count, lead_time_days, availability, certifications, sustainable, tags, description, stock_metres)
values 
  ('organic-cotton-poplin', 'Organic Cotton Poplin 120 GSM', 'Combed compact yarn · shirting weight', 'Cotton', '100% GOTS organic cotton', '/fabric-cotton.jpg', 212.00, 300, 120, 148, '[{"name": "Ivory", "hex": "#F4F1EA"}, {"name": "Sky", "hex": "#BBD3F0"}, {"name": "Slate", "hex": "#54617A"}]'::jsonb, '11111111-1111-1111-1111-111111111111', 4.8, 214, 12, 'In stock', '{"GOTS", "OEKO-TEX 100"}'::text[], true, '{"Shirting", "Breathable", "Bestseller"}'::text[], 'A crisp, high-thread-count poplin woven from combed compact organic yarn. Holds a press beautifully, resists pilling and finishes with a dry, matte hand — the default choice for premium formal shirting programmes.', 42800),
  ('mulberry-silk-charmeuse', 'Mulberry Silk Charmeuse 19 MM', 'Grade 6A filament · liquid drape', 'Silk', '100% mulberry silk', '/fabric-silk.jpg', 1480.00, 100, 86, 114, '[{"name": "Sapphire", "hex": "#1E40AF"}, {"name": "Onyx", "hex": "#111827"}, {"name": "Champagne", "hex": "#E8DCC4"}]'::jsonb, '22222222-2222-2222-2222-222222222222', 4.9, 96, 18, 'Made to order', '{"Silk Mark", "OEKO-TEX 100"}'::text[], false, '{"Luxury", "Eveningwear", "Low MOQ"}'::text[], 'Nineteen-momme charmeuse with a mirror face and matte reverse. Reactive-dyed in small lots for colour depth that survives twenty washes without bleeding.', 6400),
  ('european-flax-linen', 'European Flax Linen 185 GSM', 'Stonewashed · garment-ready', 'Linen', '100% EU flax linen', '/fabric-linen.jpg', 486.00, 200, 185, 150, '[{"name": "Sand", "hex": "#E3CBA5"}, {"name": "Sage", "hex": "#9CA98C"}, {"name": "Chalk", "hex": "#F2EFE9"}]'::jsonb, '33333333-3333-3333-3333-333333333333', 4.9, 158, 15, 'In stock', '{"Masters of Linen", "GOTS", "EU Flax"}'::text[], true, '{"Resort", "Traceable", "Stonewashed"}'::text[], 'Field-to-fabric traceable flax, enzyme washed to a lived-in softness on arrival. Shrinkage pre-stabilised to under 3% so cutting tables need no compensation.', 21500),
  ('selvedge-denim-13oz', 'Selvedge Denim 13.5 oz', 'Rope-dyed indigo · shuttle loom', 'Denim', '98% cotton · 2% elastane', '/fabric-denim.jpg', 742.00, 400, 458, 92, '[{"name": "Raw Indigo", "hex": "#1B2A4A"}, {"name": "Washed", "hex": "#4A6491"}]'::jsonb, '11111111-1111-1111-1111-111111111111', 4.7, 132, 22, 'Low stock', '{"OEKO-TEX 100", "ISO 9001"}'::text[], false, '{"Heritage", "Shuttle loom", "Fades well"}'::text[], 'Rope-dyed on vintage shuttle looms for an authentic slubby character and clean selvedge ID. Develops high-contrast fades from month three of wear.', 3120),
  ('super-130s-wool', 'Super 130s Wool Suiting', 'Biella spun · year-round weight', 'Wool', '100% RWS merino wool', '/fabric-wool.jpg', 2260.00, 60, 260, 152, '[{"name": "Charcoal", "hex": "#333A45"}, {"name": "Navy", "hex": "#1F2A44"}, {"name": "Grey Mélange", "hex": "#8A909B"}]'::jsonb, '44444444-4444-4444-4444-444444444444', 5.0, 74, 26, 'Made to order', '{"RWS", "ISO 14001"}'::text[], true, '{"Tailoring", "Super 130s", "Low MOQ"}'::text[], 'A four-season worsted with natural stretch recovery and a quiet lustre. Cut and sewn by tailoring houses in Naples, London and Tokyo.', 1840)
on conflict (id) do nothing;

-- ==========================================
-- STORAGE BUCKETS SETUP & POLICIES
-- ==========================================

-- Create storage bucket if not exists
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Enable public read access
create policy "Allow public read access to product-images" on storage.objects
  for select using (bucket_id = 'product-images');

-- Enable uploads for authenticated users
create policy "Allow authenticated uploads to product-images" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and
    auth.role() = 'authenticated'
  );

-- Enable updates for authenticated users
create policy "Allow authenticated updates to product-images" on storage.objects
  for update using (
    bucket_id = 'product-images' and
    auth.role() = 'authenticated'
  );

-- Enable deletions for authenticated users
create policy "Allow authenticated deletions to product-images" on storage.objects
  for delete using (
    bucket_id = 'product-images' and
    auth.role() = 'authenticated'
  );

-- ==========================================
-- ORDER STATUS CONSTRAINT MIGRATION
-- ==========================================

-- Update existing orders using legacy status
update public.orders set status = 'Ready for Dispatch' where status = 'Dispatch';

-- Drop constraint if exists
alter table public.orders drop constraint if exists orders_status_check;

-- Add updated check constraint
alter table public.orders add constraint orders_status_check check (status in ('Pending', 'Accepted', 'Preparing', 'Ready for Dispatch', 'Completed'));

-- ==========================================
-- PGVECTOR SETUP & SEMANTIC PRODUCT SEARCH
-- ==========================================

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Add embedding column to products table
alter table public.products add column if not exists embedding vector(384);

-- 3. Create semantic match function
create or replace function public.match_products (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id text,
  name text,
  subtitle text,
  material text,
  composition text,
  image_url text,
  price_per_metre numeric,
  moq int,
  gsm int,
  width_cm int,
  availability text,
  certifications text[],
  sustainable boolean,
  tags text[],
  description text,
  stock_metres int,
  supplier_id uuid,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query
  select
    p.id,
    p.name,
    p.subtitle,
    p.material,
    p.composition,
    p.image_url,
    p.price_per_metre,
    p.moq,
    p.gsm,
    p.width_cm,
    p.availability,
    p.certifications,
    p.sustainable,
    p.tags,
    p.description,
    p.stock_metres,
    p.supplier_id,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  join public.profiles pr on pr.id = p.supplier_id
  where p.embedding is not null 
    and pr.onboarding_completed = true 
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ==========================================
-- ONBOARDING FLOW MIGRATION
-- ==========================================

-- Add onboarding completion flag to profiles
alter table public.profiles add column if not exists onboarding_completed boolean default false not null;

-- Add MOQ and company logo columns to suppliers
alter table public.suppliers add column if not exists moq integer default 0;
alter table public.suppliers add column if not exists logo_url text;

-- Add RLS insert policy fallbacks
drop policy if exists "Allow users to insert their own supplier record" on public.suppliers;
create policy "Allow users to insert their own supplier record" on public.suppliers
  for insert with check (auth.uid() = id);

drop policy if exists "Allow users to insert their own buyer record" on public.buyers;
create policy "Allow users to insert their own buyer record" on public.buyers
  for insert with check (auth.uid() = id);

-- Mark seeded profiles as onboarding_completed = true so their products are visible
update public.profiles set onboarding_completed = true where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
