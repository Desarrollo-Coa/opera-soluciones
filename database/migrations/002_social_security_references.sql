-- =====================================================
-- MIGRACIÓN DE TABLAS DE REFERENCIA PARA SEGURIDAD SOCIAL Y GEOGRAFÍA
-- =====================================================

-- 1. Crear tablas de referencia
CREATE TABLE IF NOT EXISTS entidades_eps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_minproteccion VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS entidades_arl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS entidades_pension (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS entidades_caja_compensacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS modalidades_trabajo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS departamentos (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS municipios (
    id INT PRIMARY KEY,
    departamento_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entidades_bancarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Insertar datos detallados (EPS)
INSERT IGNORE INTO entidades_eps (nombre, codigo_minproteccion, is_active) VALUES 
('COOSALUD EPS - S', 'ESS024 / EPS042', true),
('NUEVA EPS', 'EPS037 / EPSS41', true),
('MUTUAL SER', 'ESS207 / EPS048', true),
('SALUD MIA EPS', 'EPS046', true),
('ALIANSALUD EPS', 'EPS001', true),
('SALUD TOTAL EPS S.A.', 'EPS002', true),
('EPS SANITAS', 'EPS005', true),
('EPS SURA', 'EPS010', true),
('FAMISANAR EPS', 'EPS017', true),
('SERVICIO OCCIDENTAL DE SALUD EPS - SOS', 'EPS018', true),
('COMFENALCO VALLE EPS', 'EPS012', true),
('COMPENSAR EPS', 'EPS008', true),
('CAPITAL SALUD EPS - S', 'EPSS34', true),
('SAVIA SALUD EPS', 'EPSS40', true),
('ASMET SALUD', 'ESS062', true),
('EPS FAMILIAR DE COLOMBIA', 'CCF033', true),
('DUSAKAWI EPSI', 'EPSI01', true);

-- 3. Insertar datos detallados (ARL)
INSERT IGNORE INTO entidades_arl (nombre, is_active) VALUES 
('ARL SURA (Seguros Generales Suramericana)', true),
('ARL POSITIVA (Positiva Compañía de Seguros)', true),
('ARL AXA COLPATRIA (Axa Colpatria Seguros)', true),
('ARL LIBERTY (Liberty Seguros)', true),
('ARL COLMENA (Colmena Seguros)', true),
('ARL BOLIVAR (Seguros Bolívar)', true),
('LA EQUIDAD SEGUROS', true),
('COMPAÑÍA DE SEGUROS DE VIDA AURORA', true);

-- 4. Insertar datos detallados (Pensión)
INSERT IGNORE INTO entidades_pension (nombre, is_active) VALUES 
('PROTECCIÓN', true),
('PORVENIR', true),
('COLFONDOS', true),
('COLPENSIONES (Régimen de Prima Media)', true),
('SKANDIA (Old Mutual)', true);

-- 5. Insertar datos detallados (Caja de Compensación)
INSERT IGNORE INTO entidades_caja_compensacion (nombre, is_active) VALUES 
('COMFAMA', true),
('COMFENALCO', true),
('COMPENSAR', true),
('CAFAM', true),
('COLSUBSIDIO', true),
('CAJACOPI ATLANTICO', true),
('COMFANDI', true),
('COMFENALCO VALLE', true),
('COMBARRANQUILLA', true),
('COMFACUNDI', true);

-- 6. Insertar datos detallados (Bancos)
INSERT IGNORE INTO entidades_bancarias (nombre, is_active) VALUES 
('BANCOLOMBIA', true),
('BANCO DE BOGOTÁ', true),
('DAVIVIENDA', true),
('BBVA COLOMBIA', true),
('SCOTIABANK COLPATRIA', true),
('ITAU', true),
('BANCO DE OCCIDENTE', true),
('NEQUI', true),
('DAVIPLATA', true),
('BANCO POPULAR', true),
('BANCO FALABELLA', true),
('BANCO AGRARIO', true);

-- 7. Insertar datos detallados (Geografía)
INSERT IGNORE INTO departamentos (id, nombre) VALUES 
(5, 'Antioquia'), (8, 'Atlántico'), (11, 'Bogotá D.C.'), (13, 'Bolívar'), (76, 'Valle del Cauca'),
(15, 'Boyacá'), (19, 'Cauca'), (23, 'Córdoba'), (50, 'Meta'), (52, 'Nariño');

INSERT IGNORE INTO municipios (id, departamento_id, nombre) VALUES 
(5001, 5, 'Medellín'), (8001, 8, 'Barranquilla'), (11001, 11, 'Bogotá D.C.'), (13001, 13, 'Cartagena'), (76001, 76, 'Cali'),
(5002, 5, 'Abejorral'), (5004, 5, 'Abriaquí'), (5021, 5, 'Alejandría');

-- 8. Insertar datos detallados (Modalidades)
INSERT IGNORE INTO modalidades_trabajo (nombre) VALUES 
('Tiempo Completo'), ('Medio Tiempo'), ('Por Horas'), ('Por Contrato'), ('Remoto'), ('Híbrido');

-- 9. Actualizar tabla de usuarios para usar ubicación geográfica
-- (Aseguramos que existan las columnas si no se corrieron antes)
ALTER TABLE users 
MODIFY COLUMN eps_id VARCHAR(50) DEFAULT NULL,
MODIFY COLUMN arl_id VARCHAR(50) DEFAULT NULL,
MODIFY COLUMN pension_fund_id VARCHAR(50) DEFAULT NULL,
MODIFY COLUMN compensation_fund_id VARCHAR(50) DEFAULT NULL;

-- Evitamos errores si las columnas ya existen en una ejecución previa manual
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'departamento_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN departamento_id INT DEFAULT NULL AFTER address'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @columnname = 'municipio_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN municipio_id INT DEFAULT NULL AFTER departamento_id'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
