-- ============================================================================
-- SGI Opera Soluciones - Migración 017
-- Fecha: 2026-06-30
-- Descripción: Añadir columnas de geolocalización a los autorreportes
-- ============================================================================

ALTER TABLE OS_AUTORREPORTES
    ADD COLUMN AR_LATITUD DECIMAL(10, 8) NULL AFTER AR_URL_FOTO,
    ADD COLUMN AR_LONGITUD DECIMAL(11, 8) NULL AFTER AR_LATITUD;
