create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists league_members (
  league_id uuid references leagues(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);
create table if not exists races (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references leagues(id) on delete cascade,
  name text not null,
  lock_at timestamptz,
  meeting_key int,
  session_key int,
  created_at timestamptz not null default now()
);
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references races(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  driver text not null,
  created_at timestamptz not null default now(),
  unique (race_id, user_id)
);
create table if not exists session_results (
  session_key int not null,
  driver_number int not null,
  position int,
  dnf boolean default false,
  updated_at timestamptz not null default now(),
  primary key (session_key, driver_number)
);
