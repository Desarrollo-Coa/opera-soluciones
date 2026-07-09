-- ============================================================================
-- SGI Opera Soluciones - Migración 020
-- Fecha: 2026-07-08
-- Descripción: Fechas explícitas para el historial de puestos
-- ============================================================================

-- Agregar columnas necesarias
ALTER TABLE `OS_HISTORIAL_PUESTOS`
    ADD COLUMN HP_FECHA_FIN DATE NULL AFTER HP_FECHA_ASIGNACION,
    ADD COLUMN HP_FECHA_ACCION DATETIME DEFAULT CURRENT_TIMESTAMP AFTER PU_IDPUESTO_FK;

-- Como HP_FECHA_ASIGNACION era DATETIME y se usaba como fecha de acción y de asignación,
-- pasaremos los valores antiguos de HP_FECHA_ASIGNACION a HP_FECHA_ACCION.
UPDATE `OS_HISTORIAL_PUESTOS` SET HP_FECHA_ACCION = HP_FECHA_ASIGNACION;

-- Cambiar el tipo de HP_FECHA_ASIGNACION a DATE para manejar solo fechas explícitas
ALTER TABLE `OS_HISTORIAL_PUESTOS` MODIFY COLUMN HP_FECHA_ASIGNACION DATE NOT NULL;
