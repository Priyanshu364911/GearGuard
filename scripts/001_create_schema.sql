-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'technician' check (role in ('admin', 'manager', 'technician')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance teams table
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team members junction table
create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Create equipment categories table
create table if not exists public.equipment_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create equipment table
create table if not exists public.equipment (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  serial_number text unique,
  category_id uuid references public.equipment_categories(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  assigned_technician_id uuid references public.profiles(id) on delete set null,
  department text,
  assigned_employee text,
  purchase_date date,
  warranty_expiry date,
  location text,
  status text default 'active' check (status in ('active', 'maintenance', 'scrapped')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance requests table
create table if not exists public.maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  description text,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  category_id uuid references public.equipment_categories(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('corrective', 'preventive')),
  stage text default 'new' check (stage in ('new', 'in_progress', 'repaired', 'scrap')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  scheduled_date timestamp with time zone,
  completed_date timestamp with time zone,
  duration_hours numeric(5,2),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists idx_equipment_team on public.equipment(team_id);
create index if not exists idx_equipment_category on public.equipment(category_id);
create index if not exists idx_equipment_status on public.equipment(status);
create index if not exists idx_requests_equipment on public.maintenance_requests(equipment_id);
create index if not exists idx_requests_team on public.maintenance_requests(team_id);
create index if not exists idx_requests_stage on public.maintenance_requests(stage);
create index if not exists idx_requests_scheduled on public.maintenance_requests(scheduled_date);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.equipment_categories enable row level security;
alter table public.equipment enable row level security;
alter table public.maintenance_requests enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for teams (all authenticated users can view)
create policy "Authenticated users can view teams"
  on public.teams for select
  using (auth.uid() is not null);

create policy "Admins and managers can manage teams"
  on public.teams for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- RLS Policies for team_members
create policy "Authenticated users can view team members"
  on public.team_members for select
  using (auth.uid() is not null);

create policy "Admins and managers can manage team members"
  on public.team_members for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- RLS Policies for equipment_categories
create policy "Authenticated users can view categories"
  on public.equipment_categories for select
  using (auth.uid() is not null);

create policy "Admins and managers can manage categories"
  on public.equipment_categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- RLS Policies for equipment
create policy "Authenticated users can view equipment"
  on public.equipment for select
  using (auth.uid() is not null);

create policy "Admins and managers can manage equipment"
  on public.equipment for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- RLS Policies for maintenance_requests
create policy "Authenticated users can view requests"
  on public.maintenance_requests for select
  using (auth.uid() is not null);

create policy "Authenticated users can create requests"
  on public.maintenance_requests for insert
  with check (auth.uid() is not null and requested_by = auth.uid());

create policy "Assigned technicians can update requests"
  on public.maintenance_requests for update
  using (
    auth.uid() = assigned_to or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete requests"
  on public.maintenance_requests for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );
