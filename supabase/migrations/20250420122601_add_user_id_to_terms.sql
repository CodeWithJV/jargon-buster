-- Add user_id column to terms table
alter table public.terms
add column user_id uuid references auth.users(id) on delete cascade;

-- Add index for user_id for performance
create index idx_terms_user_id on public.terms(user_id);

-- Enable Row Level Security (RLS) on the terms table
alter table public.terms enable row level security;

-- Policy: Allow users to view their own terms
create policy "Allow individual read access" on public.terms
for select using (auth.uid() = user_id);

-- Policy: Allow users to insert their own terms
create policy "Allow individual insert access" on public.terms
for insert with check (auth.uid() = user_id);

-- Policy: Allow users to update their own terms
create policy "Allow individual update access" on public.terms
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policy: Allow users to delete their own terms
create policy "Allow individual delete access" on public.terms
for delete using (auth.uid() = user_id);

-- Optional: Backfill user_id for existing terms if needed (requires a logged-in user context or admin privileges)
-- update public.terms set user_id = auth.uid() where user_id is null;
-- Note: Backfilling might need to be done manually or via a script depending on existing data and auth context.
