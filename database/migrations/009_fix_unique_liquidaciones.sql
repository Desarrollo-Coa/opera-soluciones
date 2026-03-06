-- Migración 009: Corrección de índice único para soporte quincenal
-- El índice uk_lq_liquidacion anterior solo consideraba Usuario, Año y Mes.
-- Ahora incluimos LQ_QUINCENA para permitir dos liquidaciones por mes.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Crear un índice temporal para que la FK no se bloquee al borrar el único
-- MySQL no permite borrar un índice si es el único que soporta una llave foránea.
CREATE INDEX idx_temp_lq_usu ON OS_LIQUIDACIONES (US_IDUSUARIO_FK);

-- 2. Eliminar el índice único antiguo
ALTER TABLE OS_LIQUIDACIONES DROP INDEX uk_lq_liquidacion;

-- 3. Crear el nuevo índice único que incluye la quincena
ALTER TABLE OS_LIQUIDACIONES 
ADD UNIQUE KEY uk_lq_liquidacion (US_IDUSUARIO_FK, LQ_PERIODO_ANIO, LQ_PERIODO_MES, LQ_QUINCENA);

-- 4. Borrar el índice temporal (ya no es necesario pues el nuevo UK cubre la columna US_IDUSUARIO_FK)
DROP INDEX idx_temp_lq_usu ON OS_LIQUIDACIONES;

SET FOREIGN_KEY_CHECKS = 1;

-- Mensaje de éxito
SELECT 'Migración 009 completada: Índice único de liquidaciones actualizado correctamente.' AS status;
