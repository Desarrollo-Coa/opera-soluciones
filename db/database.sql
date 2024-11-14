-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Crear la tabla de persona_opera
CREATE TABLE IF NOT EXISTS persona_opera (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(255),
    apellidos VARCHAR(255),
    cedula VARCHAR(255) UNIQUE NOT NULL,
    fecha_ingreso DATE,
    fecha_terminacion DATE,
    tiempo_trabajo VARCHAR(255),
    cargo VARCHAR(255),
    eps VARCHAR(255),
    arl VARCHAR(255),
    caja_compensacion VARCHAR(255),
    fondo_pension VARCHAR(255),
    correo VARCHAR(255),
    celular VARCHAR(20),
    direccion TEXT,
    foto_url TEXT,  -- Para la URL de la fotografía almacenada en Supabase Storage
    created_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Crear la tabla de documentos relacionados con el personal
CREATE TABLE IF NOT EXISTS documentos_personal (
    id SERIAL PRIMARY KEY,
    persona_id INT REFERENCES persona_opera(id) ON DELETE CASCADE,
    nombre_documento VARCHAR(255),
    tipo_documento VARCHAR(255),
    archivo_url TEXT,  -- URL del archivo en el bucket de Supabase Storage
    fecha_subida TIMESTAMPTZ DEFAULT current_timestamp
);



-- Insertar personas en la tabla persona_opera con cédulas únicas
INSERT INTO persona_opera (
    nombres, apellidos, cedula, fecha_ingreso, cargo, eps, arl, caja_compensacion, correo, celular, direccion, foto_url
)
VALUES
    ('Juan Caputo', 'Pérez Gómez', '1234567', '2020-01-15', 'CEO Administrador', 'EPS Sura', 'Positiva', 'Comfama', 'juan.caputo@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Guillermo Jose', 'Avendaño Gómez', '6789452', '2020-01-15', 'Socio', 'EPS Sanitas', 'Positiva', 'Comfamiliar', 'Guilloavendaño@example.com', '3456234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Jose David', 'Florez Gonzalez', '7890123', '2020-01-15', 'Operario', 'EPS Sura', 'Positiva', 'Comfama', 'juan.perez@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Alexander', 'Rivera Mendoza', '7474747', '2020-01-15', 'Coordinador de Proyectos', 'EPS Sura', 'Positiva', 'Comfama', 'alexrive@example.com', '374741234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Wendy Saray', 'Avila De La Cruz', '64734838', '2020-01-15', 'Asistente Administrativa', 'EPS Sura', 'Positiva', 'Comfama', 'W.avila@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Nelson', 'Juliao Manzur', '9999998', '2020-01-15', 'Comercial', 'EPS Sura', 'Positiva', 'Comfama', 'nejuma@example.com', '385949494567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Camilo Suarez', 'Pérez Gómez', '1234578', '2020-01-15', 'Operario', 'EPS Sura', 'Positiva', 'Comfama', 'juan.perez@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Jose Suarez', 'Pérez Gómez', '1234589', '2020-01-15', 'Operario', 'EPS Sura', 'Positiva', 'Comfama', 'juan.perez@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Andres Suarez', 'Pérez Gómez', '1234590', '2020-01-15', 'Operario', 'EPS Sura', 'Positiva', 'Comfama', 'juan.perez@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL),
    ('Henry Arevalo', 'Pérez Gómez', '1234591', '2020-01-15', 'Operario', 'EPS Sura', 'Positiva', 'Comfama', 'juan.perez@example.com', '3001234567', 'Calle 123 #45-67, Ciudad', NULL);



-- Desactivar Row Level Security (RLS) en storage.objects
alter table storage.objects disable row level security;



create policy "Allow anyone to upload files"
  on storage.objects
  for insert
  with check (true);  -- No restringe a usuarios autenticados



--   -- Supabase AI is experimental and may produce incorrect answers
-- -- Always verify the output before executing

-- create policy "Allow authenticated users to insert" on documentos_personal for insert
-- with
--   check (auth.role () = 'authenticated');




--  -- Supabase AI is experimental and may produce incorrect answers
-- -- Always verify the output before executing

-- create policy "Allow authenticated users to update their photo" on documentos_personal
-- for update
--   using (auth.uid () = id::text::uuid);

  

  