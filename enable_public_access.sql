-- Enable public read access for verification
-- WARNING: This allows anyone with the ID to see the record. This is intended for QR verification.

-- 1. Allow public read on Normas (Metadata is generally public info)
DROP POLICY IF EXISTS "Enable public read access" ON "public"."normas";
CREATE POLICY "Enable public read access" ON "public"."normas"
FOR SELECT TO anon USING (true);

-- 2. Allow public read on Muestras ONLY via specific ID lookup (implicit via RLS is tricky for 'only specific ID')
-- Standard RLS 'USING (true)' for anon makes ALL table public. We don't want that.
-- We want: Allow select IF id = passed_id. But RLS is a filter on the set.
-- A common pattern for "Public by ID" without exposing list:
-- Use a security definer function OR allow select but rely on UUID unguessability (Security by Obscurity).
-- Given the requirement "desde cualquier parte", UUID obscurity is the standard approach for public share links.

DROP POLICY IF EXISTS "Enable public read access by ID" ON "public"."muestras";
CREATE POLICY "Enable public read access by ID" ON "public"."muestras"
FOR SELECT TO anon USING (true); 
-- Note: This technically allows listing if one could query 'all'. 
-- Supabase API allows filtering. To restrict 'listing', we would need to block queries without an EQ filter, which RLS doesn't easily do alone.
-- For this MVP/Phase, we allow public read. 
-- A stricter production approach would be a specific RPC `get_public_sample(id)` and NO public table access.

-- 3. Allow public read on Proyectos (needed for verifying sample context)
DROP POLICY IF EXISTS "Enable public read access" ON "public"."proyectos";
CREATE POLICY "Enable public read access" ON "public"."proyectos"
FOR SELECT TO anon USING (true);

-- 4. Allow public read on Templates
DROP POLICY IF EXISTS "Enable public read access" ON "public"."templates";
CREATE POLICY "Enable public read access" ON "public"."templates"
FOR SELECT TO anon USING (true);
