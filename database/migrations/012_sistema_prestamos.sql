-- Migración 012: Sistema de Préstamos con Cuotas e Intereses
-- Autor: Carlos Muñoz


SET AUTOCOMMIT = 0;
START TRANSACTION;

-- 1. Tabla Maestra de Préstamos
-- Controla el saldo global, tasa y condiciones del crédito
CREATE TABLE IF NOT EXISTS `OS_PRESTAMOS` (
  `PR_IDPRESTAMO_PK` int NOT NULL AUTO_INCREMENT,
  `US_IDUSUARIO_FK` int NOT NULL,
  `PR_MONTO_SOLICITADO` decimal(12,2) NOT NULL,
  `PR_TASA_INTERES_MENSUAL` decimal(5,2) DEFAULT '0.00' COMMENT 'Porcentaje mensual (ej: 1.5)',
  `PR_NUMERO_CUOTAS` int NOT NULL,
  `PR_TOTAL_A_PAGAR` decimal(12,2) NOT NULL COMMENT 'Monto + Intereses calculados',
  `PR_SALDO_PENDIENTE` decimal(12,2) NOT NULL,
  `PR_FECHA_DESEMBOLSO` date NOT NULL,
  `PR_MOTIVO` text,
  `PR_ESTADO` enum('Activo','Finalizado','Anulado') DEFAULT 'Activo',
  `PR_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `PR_CREADO_POR` int NOT NULL,
  `PR_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PR_IDPRESTAMO_PK`),
  CONSTRAINT `fk_prestamos_usuario` FOREIGN KEY (`US_IDUSUARIO_FK`) REFERENCES `OS_USUARIOS` (`US_IDUSUARIO_PK`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Cuotas Programadas
-- Calendario de descuentos quincenales
CREATE TABLE IF NOT EXISTS `OS_PRESTAMOS_CUOTAS` (
  `PC_IDCUOTA_PK` int NOT NULL AUTO_INCREMENT,
  `PR_IDPRESTAMO_FK` int NOT NULL,
  `PC_NUMERO_CUOTA` int NOT NULL,
  `PC_VALOR_CUOTA` decimal(12,2) NOT NULL,
  `PC_VALOR_INTERES` decimal(12,2) DEFAULT '0.00',
  `PC_VALOR_CAPITAL` decimal(12,2) NOT NULL,
  `PC_PERIODO_ANIO` int NOT NULL,
  `PC_PERIODO_MES` int NOT NULL,
  `PC_QUINCENA` int NOT NULL,
  `PC_ESTADO` enum('Pendiente','Procesado','Pagado_Manual') DEFAULT 'Pendiente',
  `LQ_IDLIQUIDACION_FK` bigint DEFAULT NULL COMMENT 'Relación con el volante de pago donde se descontó',
  PRIMARY KEY (`PC_IDCUOTA_PK`),
  CONSTRAINT `fk_cuotas_prestamo` FOREIGN KEY (`PR_IDPRESTAMO_FK`) REFERENCES `OS_PRESTAMOS` (`PR_IDPRESTAMO_PK`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
