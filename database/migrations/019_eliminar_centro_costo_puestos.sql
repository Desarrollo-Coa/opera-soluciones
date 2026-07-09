-- ==========================================================
-- SGI Opera Soluciones - Migración 019
-- Eliminar columna Centro de Costo de Puestos Físicos
-- ==========================================================

ALTER TABLE `OS_PUESTOS`
DROP COLUMN `PU_CENTRO_COSTO`;
