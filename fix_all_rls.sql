-- Ensure all tables exist and have correct RLS policies

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROYECTOS
CREATE TABLE IF NOT EXISTS "public"."proyectos" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT,
    "estado" TEXT DEFAULT 'activo',
    "fecha_inicio" DATE,
    "fecha_fin" DATE,
    "proveedores" TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "company_id" UUID -- Optional for now, but good for multi-tenancy later
);

-- RLS for Proyectos
ALTER TABLE "public"."proyectos" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."proyectos";
CREATE POLICY "Enable read access for authenticated users" ON "public"."proyectos"
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."proyectos";
CREATE POLICY "Enable insert for authenticated users" ON "public"."proyectos"
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON "public"."proyectos";
CREATE POLICY "Enable update for authenticated users" ON "public"."proyectos"
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."proyectos";
CREATE POLICY "Enable delete for authenticated users" ON "public"."proyectos"
FOR DELETE TO authenticated USING (true);


-- 2. NORMAS
CREATE TABLE IF NOT EXISTS "public"."normas" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "campos" JSONB, -- Stores the fields definition
    "activa" BOOLEAN DEFAULT true,
    "created_by" TEXT, -- Storing the user ID or name
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "public"."normas" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."normas";
CREATE POLICY "Enable all access for authenticated users" ON "public"."normas"
FOR ALL TO authenticated USING (true);


-- 3. PROYECTO_NORMAS (Junction)
CREATE TABLE IF NOT EXISTS "public"."proyecto_normas" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "proyecto_id" UUID REFERENCES "public"."proyectos"("id") ON DELETE CASCADE,
    "norma_id" UUID REFERENCES "public"."normas"("id") ON DELETE CASCADE,
    UNIQUE("proyecto_id", "norma_id")
);

ALTER TABLE "public"."proyecto_normas" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."proyecto_normas";
CREATE POLICY "Enable all access for authenticated users" ON "public"."proyecto_normas"
FOR ALL TO authenticated USING (true);


-- 4. PROYECTO_USUARIOS (Junction)
CREATE TABLE IF NOT EXISTS "public"."proyecto_usuarios" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "proyecto_id" UUID REFERENCES "public"."proyectos"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "role" TEXT,
    UNIQUE("proyecto_id", "user_id")
);

ALTER TABLE "public"."proyecto_usuarios" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."proyecto_usuarios";
CREATE POLICY "Enable all access for authenticated users" ON "public"."proyecto_usuarios"
FOR ALL TO authenticated USING (true);


-- 5. MUESTRAS
CREATE TABLE IF NOT EXISTS "public"."muestras" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "proyecto_id" UUID REFERENCES "public"."proyectos"("id") ON DELETE SET NULL,
    "norma_id" UUID REFERENCES "public"."normas"("id") ON DELETE SET NULL,
    "tecnico_id" UUID REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    "tipo_material" TEXT,
    "ubicacion" TEXT,
    "proveedor" TEXT,
    "qr_code" TEXT,
    "estado" TEXT DEFAULT 'pendiente',
    "resultados" JSONB,
    "fecha_recepcion" TIMESTAMPTZ,
    "fecha_ensayo" TIMESTAMPTZ,
    "fecha_termino" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "public"."muestras" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."muestras";
CREATE POLICY "Enable all access for authenticated users" ON "public"."muestras"
FOR ALL TO authenticated USING (true);


-- 6. INVENTARIO
CREATE TABLE IF NOT EXISTS "public"."inventario" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "ubicacion" TEXT,
    "proyecto_id" UUID REFERENCES "public"."proyectos"("id") ON DELETE SET NULL,
    "cantidad" NUMERIC DEFAULT 0,
    "unidad" TEXT,
    "minimo_stock" NUMERIC DEFAULT 0,
    "ultimo_mantenimiento" DATE,
    "fecha_vencimiento" DATE,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "public"."inventario" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."inventario";
CREATE POLICY "Enable all access for authenticated users" ON "public"."inventario"
FOR ALL TO authenticated USING (true);


-- 7. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "module" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."audit_logs";
CREATE POLICY "Enable all access for authenticated users" ON "public"."audit_logs"
FOR ALL TO authenticated USING (true);


-- 8. AUDITS (Scheduled Audits - New Table)
CREATE TABLE IF NOT EXISTS "public"."audits" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "type" TEXT NOT NULL, -- Interna, Externa, Certificación
    "entity" TEXT,
    "scheduled_date" DATE NOT NULL,
    "auditor" TEXT NOT NULL,
    "status" TEXT NOT NULL, -- Programada, En Proceso, Cerrada, Cancelada
    "findings" TEXT,
    "score" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "public"."audits" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."audits";
CREATE POLICY "Enable all access for authenticated users" ON "public"."audits"
FOR ALL TO authenticated USING (true);


-- 9. TEMPLATES
CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "primary_color" TEXT,
    "show_watermark" BOOLEAN DEFAULT true,
    "show_qr" BOOLEAN DEFAULT true,
    "show_border" BOOLEAN DEFAULT true,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."templates";
CREATE POLICY "Enable all access for authenticated users" ON "public"."templates"
FOR ALL TO authenticated USING (true);
