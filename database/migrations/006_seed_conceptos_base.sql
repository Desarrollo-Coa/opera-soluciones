-- =================================================================================
-- MIGRACIÓN 006 - SEED CONCEPTOS BASE DE NÓMINA
-- =================================================================================
-- Problema: La migración 001 creó la tabla conceptos_nomina pero no insertó los
-- conceptos base (DEV001, DEV002, DED001, DED002) que el motor de liquidación
-- necesita para insertar en detalle_liquidacion via FK fk_detalle_concepto.
-- Sin estos registros la liquidación lanza ER_NO_REFERENCED_ROW_2.
-- =================================================================================

INSERT IGNORE INTO conceptos_nomina
    (codigo, nombre, tipo, afecta_ibc_salud, afecta_ibc_pension, afecta_ibc_arl, constitutivo_salario, es_novedad)
VALUES
-- Devengos fijos del sistema (no son novedades, los genera automáticamente la liquidación)
('DEV001', 'Sueldo Básico',            'Devengo',    TRUE,  TRUE,  TRUE,  TRUE,  FALSE),
('DEV002', 'Auxilio de Transporte',    'Devengo',    FALSE, FALSE, FALSE, FALSE, FALSE),

-- Deducciones fijas del sistema (descuentos de ley al empleado)
('DED001', 'Salud (Empleado 4%)',      'Deducción',  FALSE, FALSE, FALSE, FALSE, FALSE),
('DED002', 'Pensión (Empleado 4%)',    'Deducción',  FALSE, FALSE, FALSE, FALSE, FALSE),

-- Conceptos de novedades dinámicas (se registran en novedades_nomina)
('DEV003', 'Bonificación / Comisión', 'Devengo',    TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
('DED003', 'Préstamo / Libranza',     'Deducción',  FALSE, FALSE, FALSE, FALSE, TRUE),
('DED004', 'Otras Deducciones',       'Deducción',  FALSE, FALSE, FALSE, FALSE, TRUE);

-- Verificación: Debe mostrar al menos 7 filas
SELECT codigo, nombre, tipo, es_novedad FROM conceptos_nomina ORDER BY codigo;
 