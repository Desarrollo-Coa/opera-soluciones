-- Migración 008: Soporte para pagos quincenales
-- Tabla OS_LIQUIDACIONES: Agregar columna de quincena
ALTER TABLE OS_LIQUIDACIONES ADD COLUMN LQ_QUINCENA INT DEFAULT 1 COMMENT '1 para la primera quincena, 2 para la segunda' AFTER LQ_PERIODO_ANIO;

-- Tabla OS_NOVEDADES: Agregar columna de quincena
ALTER TABLE OS_NOVEDADES ADD COLUMN NO_QUINCENA INT DEFAULT 1 COMMENT '1 o 2 para indicar en qué quincena aplica' AFTER NO_PERIODO_ANIO;

-- Índices para mejorar rendimiento en búsquedas por quincena
ALTER TABLE OS_LIQUIDACIONES ADD INDEX idx_periodo_quincena (LQ_PERIODO_ANIO, LQ_PERIODO_MES, LQ_QUINCENA);
ALTER TABLE OS_NOVEDADES ADD INDEX idx_novedad_periodo_quincena (NO_PERIODO_ANIO, NO_PERIODO_MES, NO_QUINCENA);
