-- 1. Eliminar tablas antiguas de nómina previas (Si llegaste a crearlas)
DROP TABLE IF EXISTS volantes_nomina;

-- 2. Crear tabla de Parámetros de nómina
CREATE TABLE IF NOT EXISTS parametros_nomina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ano_vigencia INT NOT NULL UNIQUE,
  smmlv DECIMAL(12,2) NOT NULL,
  auxilio_transporte DECIMAL(12,2) NOT NULL,
  horas_semanales_maximas INT NOT NULL,
  horas_mensuales_promedio INT NOT NULL,
  fecha_cambio_jornada DATE,
  nueva_horas_semanales INT,
  nueva_horas_mensuales INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO parametros_nomina (ano_vigencia, smmlv, auxilio_transporte, horas_semanales_maximas, horas_mensuales_promedio, fecha_cambio_jornada, nueva_horas_semanales, nueva_horas_mensuales) VALUES
(2026, 1750905.00, 249095.00, 44, 220, '2026-07-15', 42, 210);

-- 3. Crear tabla Cargos 
CREATE TABLE IF NOT EXISTS cargos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  sueldo_mensual_base DECIMAL(12,2) NOT NULL,
  jornada_diaria_estandar INT NOT NULL,
  aplica_auxilio_transporte BOOLEAN NOT NULL,
  clase_riesgo_arl VARCHAR(50) NOT NULL,
  porcentaje_riesgo_arl DECIMAL(5,3) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Insertar cargos iniciales
INSERT INTO cargos (nombre, sueldo_mensual_base, jornada_diaria_estandar, aplica_auxilio_transporte, clase_riesgo_arl, porcentaje_riesgo_arl, description, created_by) VALUES
('Asesor Base Mínimo', 1750905.00, 8, TRUE, 'Riesgo I - 0.522%', 0.522, 'Asesor con SMMLV', 1),
('Desarrollador Senior', 4500000.00, 8, FALSE, 'Riesgo I - 0.522%', 0.522, 'Desarrollador de Software', 1),
('Supervisor de Obra', 3500000.00, 10, FALSE, 'Riesgo IV - 4.350%', 4.350, 'Supervisión en campo', 1);

-- 4. Modificar tabla de Usuarios para enlazar Cargos (ALTER TABLE)
ALTER TABLE users ADD COLUMN cargo_id INT DEFAULT NULL AFTER role_id;
-- OJO: Asegúrate que el Constraint de users se llama así en tu servidor
ALTER TABLE users ADD CONSTRAINT fk_users_cargo_id FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL;

-- 5. Crear tabla de Catálogo de Conceptos de Nómina
CREATE TABLE IF NOT EXISTS conceptos_nomina (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('Devengo', 'Deducción', 'Aporte Empleador', 'Info') NOT NULL,
    afecta_ibc_salud BOOLEAN DEFAULT FALSE,
    afecta_ibc_pension BOOLEAN DEFAULT FALSE,
    afecta_ibc_arl BOOLEAN DEFAULT FALSE,
    constitutivo_salario BOOLEAN DEFAULT FALSE,
    es_novedad BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar conceptos base del sistema (requeridos por FK fk_detalle_concepto en detalle_liquidacion)
-- Sin estos registros la liquidación falla con ER_NO_REFERENCED_ROW_2
INSERT IGNORE INTO conceptos_nomina
    (codigo, nombre, tipo, afecta_ibc_salud, afecta_ibc_pension, afecta_ibc_arl, constitutivo_salario, es_novedad)
VALUES
('DEV001', 'Sueldo Básico',            'Devengo',   TRUE,  TRUE,  TRUE,  TRUE,  FALSE),
('DEV002', 'Auxilio de Transporte',    'Devengo',   FALSE, FALSE, FALSE, FALSE, FALSE),
('DED001', 'Salud (Empleado 4%)',      'Deducción', FALSE, FALSE, FALSE, FALSE, FALSE),
('DED002', 'Pensión (Empleado 4%)',    'Deducción', FALSE, FALSE, FALSE, FALSE, FALSE),
('DEV003', 'Bonificación / Comisión', 'Devengo',   TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
('DED003', 'Préstamo / Libranza',     'Deducción', FALSE, FALSE, FALSE, FALSE, TRUE),
('DED004', 'Otras Deducciones',       'Deducción', FALSE, FALSE, FALSE, FALSE, TRUE);


-- 6. Crear tablas maestras y de detalle para emisión de volantes (Liquidaciones)
CREATE TABLE IF NOT EXISTS liquidaciones_nomina (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    periodo_mes INT NOT NULL,
    periodo_anio INT NOT NULL,
    fecha_liquidacion DATE NOT NULL,
    fecha_pago DATE NULL,
    dias_trabajados INT DEFAULT 30,
    dias_incapacidad INT DEFAULT 0,
    dias_vacaciones INT DEFAULT 0,
    ibc_salud DECIMAL(12,2) NOT NULL,
    ibc_pension DECIMAL(12,2) NOT NULL,
    ibc_arl DECIMAL(12,2) NOT NULL,
    total_devengado DECIMAL(12,2) NOT NULL,
    total_deducciones DECIMAL(12,2) NOT NULL,
    neto_pagar DECIMAL(12,2) NOT NULL,
    costo_total_empresa DECIMAL(12,2) NOT NULL,
    salario_integral BOOLEAN DEFAULT FALSE,
    valor_smmlv_base DECIMAL(12,2) NOT NULL,
    xml_pila TEXT NULL,
    observaciones JSON NULL,
    estado ENUM('Borrador','Calculado','Aprobado','Pagado','Anulado') DEFAULT 'Borrador',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_liquidacion (empleado_id, periodo_anio, periodo_mes),
    CONSTRAINT fk_liquidaciones_emp FOREIGN KEY (empleado_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_liquidaciones_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS detalle_liquidacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    liquidacion_id BIGINT NOT NULL,
    concepto_codigo VARCHAR(20) NOT NULL, 
    descripcion VARCHAR(150),
    cantidad DECIMAL(10,2) DEFAULT 1.00,
    valor_unitario DECIMAL(12,2),
    valor_total DECIMAL(12,2) NOT NULL,
    tipo ENUM('Devengo', 'Deducción', 'Aporte Empleador', 'Info') NOT NULL,
    afecta_ibc_salud BOOLEAN DEFAULT FALSE,
    afecta_ibc_pension BOOLEAN DEFAULT FALSE,
    afecta_ibc_arl BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_detalle_liq FOREIGN KEY (liquidacion_id) REFERENCES liquidaciones_nomina(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_concepto FOREIGN KEY (concepto_codigo) REFERENCES conceptos_nomina(codigo) ON DELETE RESTRICT
);

-- 7. Crear tabla de novedades y bonos eventuales
CREATE TABLE IF NOT EXISTS novedades_nomina (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    concepto_codigo VARCHAR(20) NOT NULL,
    periodo_mes INT NOT NULL,
    periodo_anio INT NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    cantidad DECIMAL(10,2) DEFAULT 1.00,
    observaciones TEXT,
    estado ENUM('Pendiente', 'Procesado', 'Anulado') DEFAULT 'Pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_novedades_emp FOREIGN KEY (empleado_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_novedades_con FOREIGN KEY (concepto_codigo) REFERENCES conceptos_nomina(codigo) ON DELETE RESTRICT
);


-- 8. Alterar tabla tipos_ausencia (Eliminar columna obsoleta y reemplazar por porcentajes)
ALTER TABLE tipos_ausencia DROP COLUMN es_remunerada;
ALTER TABLE tipos_ausencia ADD COLUMN porcentaje_pago DECIMAL(5,2) NOT NULL DEFAULT 100.00 AFTER descripcion;
ALTER TABLE tipos_ausencia ADD COLUMN afecta_auxilio_transporte BOOLEAN DEFAULT TRUE AFTER porcentaje_pago;

-- 9. Borramos los tipos de ausencias que traía el Backup que eran temporales
DELETE FROM tipos_ausencia; 

-- 10. Insertamos explícitamente los únicos 3 válidos en el código final
INSERT INTO tipos_ausencia (id, nombre, descripcion, porcentaje_pago, afecta_auxilio_transporte, created_by) VALUES
(1, 'Ausencia', 'Ausencia injustificada o permiso no remunerado', 0.00, TRUE, 1),
(2, 'Incapacidad', 'Incapacidad común o laboral', 66.67, TRUE, 1),
(3, 'Vacaciones', 'Disfrute de días de vacaciones (pago en liquidación)', 0.00, TRUE, 1);
