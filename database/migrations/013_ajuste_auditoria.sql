-- Migración 013: Ajustes de Auditoría y Fechas de Eventos
-- Autor: Carlos Muñoz

SET AUTOCOMMIT = 0;
START TRANSACTION;

-- 1. Añadir Fecha del Evento a Novedades para auditoría precisa
ALTER TABLE `OS_NOVEDADES` 
ADD COLUMN `NO_FECHA_EVENTO` DATE NULL AFTER `CN_IDCONCEPTO_FK`,
COMMENT 'Fecha exacta en la que ocurrió el hecho (comisión, bono, etc)';

-- 2. Asegurar que las cuotas de préstamos tengan una fecha de referencia para el calendario
ALTER TABLE `OS_PRESTAMOS_CUOTAS`
ADD COLUMN `PC_FECHA_ESTIMADA` DATE NULL AFTER `PC_QUINCENA`,
COMMENT 'Fecha sugerida para el descuento en nómina';

COMMIT;
