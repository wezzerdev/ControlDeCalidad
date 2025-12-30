-- Enable read access for verification pages (public access)
-- This allows anyone with the link/QR code to view the sample details

-- Policy for 'muestras'
create policy "Public read access for samples"
on public.muestras
for select
to public
using (true);

-- Policy for 'normas' (needed for verification details)
create policy "Public read access for normas"
on public.normas
for select
to public
using (true);

-- Policy for 'proyectos' (needed for verification details)
create policy "Public read access for proyectos"
on public.proyectos
for select
to public
using (true);
