-- =====================================================
-- MIGRACIÓN 003: ACTUALIZACIÓN DE CARGOS INICIALES
-- Descripción: Elimina cargos previos e inserta la lista oficial 2026.
-- Fecha: 2026-03-05
-- =====================================================

-- Desactivar temporalmente FK checks para evitar errores si hay empleados vinculados
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Limpiar referencias en la tabla de usuarios (evitar IDs huérfanos)
UPDATE users SET cargo_id = NULL;

-- 2. Limpiar tabla de cargos
DELETE FROM cargos;

-- 2. Reiniciar contador de autoincremento (opcional, para limpieza de IDs)
ALTER TABLE cargos AUTO_INCREMENT = 1;

-- 3. Insertar nuevos cargos oficiales
INSERT INTO cargos (nombre, sueldo_mensual_base, jornada_diaria_estandar, aplica_auxilio_transporte, clase_riesgo_arl, porcentaje_riesgo_arl, description, created_by) VALUES
('VIVIENTE', 1750905.00, 8, TRUE, 'Riesgo I - 0.522%', 0.522, 'Personal de servicios generales/viviencia', 1),
('OFICIOS VARIOS', 1750905.00, 8, TRUE, 'Riesgo I - 0.522%', 0.522, 'Personal de mantenimiento y oficios varios', 1),
('LIDER SST', 3500000.00, 8, TRUE, 'Riesgo I - 0.522%', 0.522, 'Líder de Seguridad y Salud en el Trabajo', 1),
('CONTADOR', 4500000.00, 8, FALSE, 'Riesgo I - 0.522%', 0.522, 'Responsable del área contable', 1),
('ASISTENTE ADMINISTRATIVO', 2000000.00, 8, TRUE, 'Riesgo I - 0.522%', 0.522, 'Apoyo operativo administrativo', 1),
('GERENTE', 8000000.00, 8, FALSE, 'Riesgo I - 0.522%', 0.522, 'Alta gerencia', 1),
('CEO', 12000000.00, 8, FALSE, 'Riesgo I - 0.522%', 0.522, 'Director Ejecutivo', 1);

-- Reactivar validación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Log de finalización
SELECT 'Migración 003: Cargos actualizados correctamente' AS status;
