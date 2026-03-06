-- =====================================================
-- MIGRACIÓN 004: ELIMINACIÓN DE CAMPOS REDUNDANTES EN USERS
-- Descripción: Elimina campos que ahora se gestionan mediante la tabla de cargos (Sistema Nómina 2026).
-- Fecha: 2026-03-05
-- =====================================================

-- Eliminamos los campos que ahora son centralizados en la tabla 'cargos'
-- position -> cargos.nombre
-- salary   -> cargos.sueldo_mensual_base

-- NOTA: Mantenemos 'arl_id' en users porque representa la entidad (Sura, Positiva) 
-- mientras que en 'cargos' almacenamos la clase y porcentaje de riesgo para el cálculo.

ALTER TABLE users 
  DROP COLUMN position,
  DROP COLUMN salary;

-- Mantenemos work_schedule por si existen turnos específicos por usuario.


SELECT 'Migración 004: Limpieza de campos redundantes en users completada' AS status;
