-- ============================================================================
-- 1. Add student limit per level
-- 2. Create storage bucket for school documents (pdf template + stamp)
-- ============================================================================

-- ── Level student limit ─────────────────────────────────────────────────────
alter table public.levels
  add column if not exists max_students int not null default 0;

-- ── Storage bucket for school documents ─────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'school-documents', 'school-documents', true, 10485760, array['application/pdf', 'image/png']
where not exists (select 1 from storage.buckets where id = 'school-documents');

-- Policy: authenticated users can list / view / upload files in the bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Authenticated can view school-documents'
  ) then
    create policy "Authenticated can view school-documents"
      on storage.objects for select
      using (bucket_id = 'school-documents' and auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Authenticated can upload school-documents'
  ) then
    create policy "Authenticated can upload school-documents"
      on storage.objects for insert
      with check (bucket_id = 'school-documents' and auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Authenticated can delete school-documents'
  ) then
    create policy "Authenticated can delete school-documents"
      on storage.objects for delete
      using (bucket_id = 'school-documents' and auth.role() = 'authenticated');
  end if;
end;
$$;

-- ── Settings rows for document references ───────────────────────────────────
insert into public.settings (key, value)
values
  ('pdf_template', '{"url": "", "filename": "", "updated_at": ""}'),
  ('stamp', '{"url": "", "filename": "", "updated_at": ""}')
on conflict (key) do nothing;
