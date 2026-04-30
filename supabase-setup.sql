-- Run this in your Supabase SQL Editor

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  cgpa decimal(3,1),
  gre_score integer,
  ielts_score decimal(3,1),
  target_country text,
  target_degree text,
  budget_inr text,
  work_experience_months integer default 0,
  target_universities text[],
  field_of_study text,
  intake_year integer,
  intake_season text,
  loan_readiness_score integer default 0,
  readiness_score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();