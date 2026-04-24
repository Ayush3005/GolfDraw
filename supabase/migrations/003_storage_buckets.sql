-- Create bucket for winner proofs
insert into storage.buckets (id, name, public)
values ('winner-proofs', 'winner-proofs', true)
on conflict (id) do nothing;

-- Set up access control for the bucket
create policy "Anyone can view winner proofs"
  on storage.objects for select
  using ( bucket_id = 'winner-proofs' );

create policy "Authenticated users can upload winner proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'winner-proofs' 
    and auth.role() = 'authenticated'
  );
