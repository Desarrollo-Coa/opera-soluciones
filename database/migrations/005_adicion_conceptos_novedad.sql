-- =================================================================================
-- MIGRACIÓN 005 - ADICIÓN DE CONCEPTOS DE NOVEDAD Y AJUSTE DE REGLAS DE NÓMINA
-- =================================================================================
-- Descripción: Inserta los conceptos dinámicos para el registro de novedades (Bonos, Descuentos).
-- Fecha: 2026-03-05
-- =================================================================================

-- Insertar nuevos conceptos en el catálogo (usando IGNORE para evitar errores si ya existen)
INSERT IGNORE INTO conceptos_nomina (codigo, nombre, tipo, afecta_ibc_salud, afecta_ibc_pension, afecta_ibc_arl, constitutivo_salario, es_novedad) VALUES
('DEV003', 'Bonificación / Comisión', 'Devengo', TRUE, TRUE, TRUE, TRUE, TRUE),
('DED003', 'Préstamo / Libranza', 'Deducción', FALSE, FALSE, FALSE, FALSE, TRUE),
('DED004', 'Otras Deducciones', 'Deducción', FALSE, FALSE, FALSE, FALSE, TRUE);

-- Nota: Estos conceptos permiten que el motor de liquidación procese valores variables
-- registrados previamente en la tabla novedades_nomina para cada periodo mensual.
