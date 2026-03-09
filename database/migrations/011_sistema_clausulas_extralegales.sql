-- Migración para el sistema de Cláusulas Extralegales
-- Autor: Carlos Muñoz  


SET AUTOCOMMIT = 0;
START TRANSACTION;

-- 1. Insertar el concepto de nómina para Auxilio de Rodamiento si no existe
INSERT INTO `OS_CONCEPTOS_NOMINA` (`CN_IDCONCEPTO_PK`, `CN_NOMBRE`, `CN_TIPO`, `CN_AFECTA_IBC_SALUD`, `CN_AFECTA_IBC_PENSION`, `CN_AFECTA_IBC_ARL`, `CN_CONSTITUTIVO_SALARIO`, `CN_ES_NOVEDAD`) 
VALUES ('DEV004', 'Auxilio de Rodamiento', 'Devengo', 0, 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE `CN_NOMBRE` = 'Auxilio de Rodamiento';

-- 2. Tabla de definiciones de cláusulas (Maestro)
CREATE TABLE IF NOT EXISTS `OS_CLAUSULAS` (
  `CL_IDCLAUSULA_PK` int NOT NULL AUTO_INCREMENT,
  `CL_NOMBRE` varchar(100) NOT NULL,
  `CL_DESCRIPCION` text,
  `CN_IDCONCEPTO_FK` varchar(20) NOT NULL,
  `CL_ACTIVO` tinyint(1) DEFAULT '1',
  `CL_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `CL_CREADO_POR` int NOT NULL,
  `CL_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CL_IDCLAUSULA_PK`),
  KEY `fk_clausulas_concepto` (`CN_IDCONCEPTO_FK`),
  CONSTRAINT `fk_clausulas_concepto` FOREIGN KEY (`CN_IDCONCEPTO_FK`) REFERENCES `OS_CONCEPTOS_NOMINA` (`CN_IDCONCEPTO_PK`)
) ;

-- 3. Tabla de asignación de cláusulas a usuarios
CREATE TABLE IF NOT EXISTS `OS_USUARIOS_CLAUSULAS` (
  `UC_IDUSUARIOCLAUSULA_PK` int NOT NULL AUTO_INCREMENT,
  `US_IDUSUARIO_FK` int NOT NULL,
  `CL_IDCLAUSULA_FK` int NOT NULL,
  `UC_MONTO_MENSUAL` decimal(12,2) NOT NULL,
  `UC_FECHA_INICIO` date NOT NULL,
  `UC_FECHA_FIN` date DEFAULT NULL,
  `UC_ACTIVO` tinyint(1) DEFAULT '1',
  `UC_NOTAS_AUDITORIA` text,
  `UC_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `UC_CREADO_POR` int NOT NULL,
  `UC_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UC_IDUSUARIOCLAUSULA_PK`),
  KEY `idx_uc_usuario` (`US_IDUSUARIO_FK`),
  KEY `idx_uc_clausula` (`CL_IDCLAUSULA_FK`),
  KEY `idx_uc_activo` (`UC_ACTIVO`),
  CONSTRAINT `fk_uc_usuario_rel` FOREIGN KEY (`US_IDUSUARIO_FK`) REFERENCES `OS_USUARIOS` (`US_IDUSUARIO_PK`),
  CONSTRAINT `fk_uc_clausula_rel` FOREIGN KEY (`CL_IDCLAUSULA_FK`) REFERENCES `OS_CLAUSULAS` (`CL_IDCLAUSULA_PK`)
) ;

-- 4. Semilla inicial de cláusulas (Auxilio de Rodamiento por defecto)
INSERT INTO `OS_CLAUSULAS` (`CL_NOMBRE`, `CL_DESCRIPCION`, `CN_IDCONCEPTO_FK`, `CL_CREADO_POR`)
VALUES ('Auxilio de Rodamiento', 'Compensación extralegal por el uso de vehículo propio para labores de la empresa.', 'DEV004', 1);

COMMIT;
