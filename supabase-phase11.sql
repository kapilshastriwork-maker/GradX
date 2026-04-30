-- Application Tracker table
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  university_name text not null,
  program text not null,
  country text,
  deadline date,
  status text default 'Researching',
  application_fee_usd integer default 0,
  fee_paid boolean default false,
  notes text,
  offer_received boolean default false,
  offer_deadline date,
  scholarship_applied boolean default false,
  priority text default 'Target',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.applications enable row level security;

create policy "Users can manage own applications"
  on public.applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Document Vault table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  file_name text,
  file_size integer,
  status text default 'Uploaded',
  expiry_date date,
  notes text,
  is_verified boolean default false,
  source text default 'Manual',
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Users can manage own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);