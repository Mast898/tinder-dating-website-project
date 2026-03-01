-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  bio text default '',
  age integer,
  gender text,
  looking_for text,
  city text default '',
  photo_url text default '',
  photos text[] default '{}',
  interests text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can view profiles" on public.profiles
  for select using (true);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);

-- Likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  is_like boolean not null default true,
  created_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

alter table public.likes enable row level security;

create policy "Users can view own likes" on public.likes
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "Users can insert own likes" on public.likes
  for insert with check (auth.uid() = from_user_id);
create policy "Users can delete own likes" on public.likes
  for delete using (auth.uid() = from_user_id);

-- Matches table
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references public.profiles(id) on delete cascade,
  user2_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

alter table public.matches enable row level security;

create policy "Users can view own matches" on public.matches
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Users can insert matches" on public.matches
  for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view messages in their matches" on public.messages
  for select using (
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );
create policy "Users can insert messages in their matches" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );
