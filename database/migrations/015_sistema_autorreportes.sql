-- ============================================================================
-- SGI Opera Soluciones - Migración 015
-- Fecha: 2026-06-30
-- Descripción: Creación de tabla para el sistema de Autorreportes
-- ============================================================================

CREATE TABLE IF NOT EXISTS OS_AUTORREPORTES (
    AR_IDAUTORREPORTE_PK INT AUTO_INCREMENT PRIMARY KEY,
    US_IDUSUARIO_FK INT NOT NULL,
    AR_TIPO ENUM('INICIO', 'FIN', 'DESCANSO') NOT NULL,
    AR_FECHA_HORA DATETIME NOT NULL,
    AR_FECHA_REGISTRO DATE NOT NULL,
    AR_URL_FOTO VARCHAR(500) NULL,
    AR_ACTIVO BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (US_IDUSUARIO_FK) REFERENCES OS_USUARIOS(US_IDUSUARIO_PK) ON DELETE CASCADE,
    INDEX idx_autorreporte_fecha (AR_FECHA_REGISTRO),
    INDEX idx_autorreporte_usuario (US_IDUSUARIO_FK)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
