-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'technician')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to call the function on user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Apply updated_at trigger to all tables
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.teams;
create trigger set_updated_at
  before update on public.teams
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.equipment;
create trigger set_updated_at
  before update on public.equipment
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.maintenance_requests;
create trigger set_updated_at
  before update on public.maintenance_requests
  for each row
  execute function public.handle_updated_at();
