-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql-191117-db.mysql-191117:10031
-- Tiempo de generación: 06-03-2026 a las 21:28:55
-- Versión del servidor: 8.0.26
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sgi_opera_soluciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ARCHIVOS`
--

CREATE TABLE `OS_ARCHIVOS` (
  `AF_IDARCHIVO_PK` int NOT NULL,
  `AF_NOMBRE` varchar(255) NOT NULL,
  `AF_NOMBRE_ORIGINAL` varchar(255) NOT NULL,
  `CF_IDCARPETA_FK` int DEFAULT NULL,
  `AF_RUTA_ARCHIVO` varchar(500) NOT NULL,
  `AF_URL_ARCHIVO` varchar(500) NOT NULL,
  `AF_TAMANO` bigint NOT NULL,
  `AF_TIPO_MIME` varchar(100) NOT NULL,
  `AF_EXTENSION` varchar(10) DEFAULT NULL,
  `AF_DESCRIPCION` text,
  `AF_CREADO_POR` int NOT NULL,
  `AF_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `AF_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `AF_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ARCHIVOS_AUSENCIAS`
--

CREATE TABLE `OS_ARCHIVOS_AUSENCIAS` (
  `AA_IDARCHIVO_PK` int NOT NULL,
  `AU_IDAUSENCIA_FK` int NOT NULL,
  `AA_URL_ARCHIVO` varchar(255) NOT NULL,
  `AA_NOMBRE_ARCHIVO` varchar(255) NOT NULL,
  `AA_TIPO_ARCHIVO` varchar(50) DEFAULT NULL,
  `AA_TAMANO_ARCHIVO` int DEFAULT NULL,
  `AA_FECHA_SUBIDA` datetime DEFAULT CURRENT_TIMESTAMP,
  `AA_SUBIDO_POR` int NOT NULL,
  `AA_ACTIVO` tinyint(1) DEFAULT '1',
  `AA_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `AA_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_AUSENCIAS`
--

CREATE TABLE `OS_AUSENCIAS` (
  `AU_IDAUSENCIA_PK` int NOT NULL,
  `US_IDUSUARIO_FK` int NOT NULL,
  `TA_IDTIPO_AUSENCIA_FK` int NOT NULL,
  `AU_FECHA_INICIO` date NOT NULL,
  `AU_FECHA_FIN` date NOT NULL,
  `AU_DESCRIPCION` text,
  `AU_URL_SOPORTE` varchar(255) DEFAULT NULL,
  `AU_USUARIO_REGISTRO_FK` int NOT NULL,
  `AU_FECHA_REGISTRO` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `AU_ACTIVO` tinyint(1) DEFAULT '1',
  `AU_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `AU_CREADO_POR` int NOT NULL,
  `AU_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `AU_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_CAJAS_COMPENSACION`
--

CREATE TABLE `OS_CAJAS_COMPENSACION` (
  `CC_IDCAJA_PK` int NOT NULL,
  `CC_NOMBRE` varchar(100) NOT NULL,
  `CC_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_CARGOS`
--

CREATE TABLE `OS_CARGOS` (
  `CA_IDCARGO_PK` int NOT NULL,
  `CA_NOMBRE` varchar(100) NOT NULL,
  `CA_SUELDO_BASE` decimal(12,2) NOT NULL,
  `CA_JORNADA_DIARIA` int NOT NULL,
  `CA_APLICA_AUXILIO` tinyint(1) NOT NULL,
  `CA_CLASE_RIESGO_ARL` varchar(50) NOT NULL,
  `CA_PORCENTAJE_RIESGO_ARL` decimal(5,3) NOT NULL,
  `CA_DESCRIPCION` text,
  `CA_ACTIVO` tinyint(1) DEFAULT '1',
  `CA_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `CA_CREADO_POR` int NOT NULL,
  `CA_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CA_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_CARPETAS`
--

CREATE TABLE `OS_CARPETAS` (
  `CF_IDCARPETA_PK` int NOT NULL,
  `CF_NOMBRE` varchar(255) NOT NULL,
  `CF_IDCARPETA_PADRE_FK` int DEFAULT NULL,
  `CF_RUTA` varchar(500) NOT NULL,
  `CF_DESCRIPCION` text,
  `CF_CREADO_POR` int NOT NULL,
  `CF_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `CF_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CF_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_CONCEPTOS_NOMINA`
--

CREATE TABLE `OS_CONCEPTOS_NOMINA` (
  `CN_IDCONCEPTO_PK` varchar(20) NOT NULL,
  `CN_NOMBRE` varchar(100) NOT NULL,
  `CN_TIPO` enum('Devengo','Deducción','Aporte Empleador','Info') NOT NULL,
  `CN_AFECTA_IBC_SALUD` tinyint(1) DEFAULT '0',
  `CN_AFECTA_IBC_PENSION` tinyint(1) DEFAULT '0',
  `CN_AFECTA_IBC_ARL` tinyint(1) DEFAULT '0',
  `CN_CONSTITUTIVO_SALARIO` tinyint(1) DEFAULT '0',
  `CN_ES_NOVEDAD` tinyint(1) DEFAULT '0',
  `CN_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `CN_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_DEPARTAMENTOS`
--

CREATE TABLE `OS_DEPARTAMENTOS` (
  `DE_IDDEPARTAMENTO_PK` int NOT NULL,
  `DE_NOMBRE` varchar(100) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_DETALLE_LIQUIDACION`
--

CREATE TABLE `OS_DETALLE_LIQUIDACION` (
  `DL_IDDETALLE_PK` bigint NOT NULL,
  `LQ_IDLIQUIDACION_FK` bigint NOT NULL,
  `CN_IDCONCEPTO_FK` varchar(20) NOT NULL,
  `DL_DESCRIPCION` varchar(150) DEFAULT NULL,
  `DL_CANTIDAD` decimal(10,2) DEFAULT '1.00',
  `DL_VALOR_UNITARIO` decimal(12,2) DEFAULT NULL,
  `DL_VALOR_TOTAL` decimal(12,2) NOT NULL,
  `DL_TIPO` enum('Devengo','Deducción','Aporte Empleador','Info') NOT NULL,
  `DL_AFECTA_IBC_SALUD` tinyint(1) DEFAULT '0',
  `DL_AFECTA_IBC_PENSION` tinyint(1) DEFAULT '0',
  `DL_AFECTA_IBC_ARL` tinyint(1) DEFAULT '0'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_DOCUMENTOS`
--

CREATE TABLE `OS_DOCUMENTOS` (
  `DO_IDDOCUMENTO_PK` int NOT NULL,
  `US_IDUSUARIO_FK` int NOT NULL,
  `DO_NOMBRE` varchar(255) NOT NULL,
  `DO_URL_ARCHIVO` varchar(500) NOT NULL,
  `TD_IDTIPO_DOCUMENTO_FK` int DEFAULT NULL,
  `DO_DESCRIPCION` text,
  `DO_FECHA_SUBIDA` datetime DEFAULT CURRENT_TIMESTAMP,
  `DO_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `DO_CREADO_POR` int NOT NULL,
  `DO_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `DO_ACTUALIZADO_POR` int DEFAULT NULL,
  `DO_FECHA_ELIMINACION` datetime DEFAULT NULL,
  `DO_ELIMINADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ENTIDADES_ARL`
--

CREATE TABLE `OS_ENTIDADES_ARL` (
  `AR_IDARL_PK` int NOT NULL,
  `AR_NOMBRE` varchar(150) NOT NULL,
  `AR_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ENTIDADES_BANCARIAS`
--

CREATE TABLE `OS_ENTIDADES_BANCARIAS` (
  `EB_IDBANCO_PK` int NOT NULL,
  `EB_NOMBRE` varchar(100) NOT NULL,
  `EB_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ENTIDADES_EPS`
--

CREATE TABLE `OS_ENTIDADES_EPS` (
  `EP_IDEPS_PK` int NOT NULL,
  `EP_NOMBRE` varchar(100) NOT NULL,
  `EP_CODIGO_MINPROTECCION` varchar(20) DEFAULT NULL,
  `EP_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ENTIDADES_PENSION`
--

CREATE TABLE `OS_ENTIDADES_PENSION` (
  `PE_IDPENSION_PK` int NOT NULL,
  `PE_NOMBRE` varchar(100) NOT NULL,
  `PE_ACTIVO` tinyint(1) DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ESTADOS_CONTRATO`
--

CREATE TABLE `OS_ESTADOS_CONTRATO` (
  `EC_IDESTADO_CONTRATO_PK` int NOT NULL,
  `EC_NOMBRE` varchar(50) NOT NULL,
  `EC_DESCRIPCION` text,
  `EC_ACTIVO` tinyint(1) DEFAULT '1',
  `EC_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `EC_CREADO_POR` int NOT NULL,
  `EC_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `EC_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_FACTURACION`
--

CREATE TABLE `OS_FACTURACION` (
  `FA_IDFACTURA_PK` int NOT NULL,
  `FA_ANIO` int NOT NULL,
  `FA_MES` varchar(20) NOT NULL,
  `FA_NUMERO_FACTURACION` varchar(50) NOT NULL,
  `FA_FECHA` date NOT NULL,
  `FA_CLIENTE` varchar(255) NOT NULL,
  `FA_SERVICIO` varchar(255) NOT NULL,
  `FA_NIT` varchar(50) DEFAULT NULL,
  `FA_VALOR` decimal(12,2) NOT NULL,
  `FA_IVA` decimal(12,2) DEFAULT '0.00',
  `FA_TOTAL` decimal(12,2) NOT NULL,
  `FA_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `FA_CREADO_POR` int NOT NULL,
  `FA_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `FA_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_GASTOS_MES`
--

CREATE TABLE `OS_GASTOS_MES` (
  `GM_IDGASTO_PK` int NOT NULL,
  `GM_ANIO` int NOT NULL,
  `GM_MES` varchar(20) NOT NULL,
  `GM_FECHA` date NOT NULL,
  `GM_PROVEEDOR` varchar(255) NOT NULL,
  `GM_PAGO` decimal(12,2) NOT NULL,
  `GM_OBJETO` varchar(255) NOT NULL,
  `GM_VALOR_NETO` decimal(12,2) NOT NULL,
  `GM_IVA` decimal(12,2) DEFAULT '0.00',
  `GM_RETENCION` decimal(12,2) DEFAULT '0.00',
  `GM_TOTAL` decimal(12,2) NOT NULL,
  `GM_NIT` varchar(50) DEFAULT NULL,
  `GM_NUMERO_FACTURA` varchar(50) NOT NULL,
  `GM_OBRA` varchar(255) NOT NULL,
  `GM_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `GM_CREADO_POR` int NOT NULL,
  `GM_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `GM_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_LIQUIDACIONES`
--

CREATE TABLE `OS_LIQUIDACIONES` (
  `LQ_IDLIQUIDACION_PK` bigint NOT NULL,
  `US_IDUSUARIO_FK` int NOT NULL,
  `LQ_PERIODO_MES` int NOT NULL,
  `LQ_PERIODO_ANIO` int NOT NULL,
  `LQ_QUINCENA` int DEFAULT '1' COMMENT '1 para la primera quincena, 2 para la segunda',
  `LQ_FECHA_LIQUIDACION` date NOT NULL,
  `LQ_FECHA_PAGO` date DEFAULT NULL,
  `LQ_DIAS_TRABAJADOS` int DEFAULT '30',
  `LQ_DIAS_INCAPACIDAD` int DEFAULT '0',
  `LQ_DIAS_VACACIONES` int DEFAULT '0',
  `LQ_IBC_SALUD` decimal(12,2) NOT NULL,
  `LQ_IBC_PENSION` decimal(12,2) NOT NULL,
  `LQ_IBC_ARL` decimal(12,2) NOT NULL,
  `LQ_TOTAL_DEVENGADO` decimal(12,2) NOT NULL,
  `LQ_TOTAL_DEDUCCIONES` decimal(12,2) NOT NULL,
  `LQ_NETO_PAGAR` decimal(12,2) NOT NULL,
  `LQ_COSTO_EMPRESA` decimal(12,2) NOT NULL,
  `LQ_SALARIO_INTEGRAL` tinyint(1) DEFAULT '0',
  `LQ_SMMLV_BASE` decimal(12,2) NOT NULL,
  `LQ_XML_PILA` text,
  `LQ_OBSERVACIONES` json DEFAULT NULL,
  `LQ_ESTADO` enum('Borrador','Calculado','Aprobado','Pagado','Anulado') DEFAULT 'Borrador',
  `LQ_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `LQ_CREADO_POR` int NOT NULL,
  `LQ_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_MODALIDADES_TRABAJO`
--

CREATE TABLE `OS_MODALIDADES_TRABAJO` (
  `MT_IDMODALIDAD_PK` int NOT NULL,
  `MT_NOMBRE` varchar(50) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_MUNICIPIOS`
--

CREATE TABLE `OS_MUNICIPIOS` (
  `MU_IDMUNICIPIO_PK` int NOT NULL,
  `DE_IDDEPARTAMENTO_FK` int NOT NULL,
  `MU_NOMBRE` varchar(100) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_NOVEDADES`
--

CREATE TABLE `OS_NOVEDADES` (
  `NO_IDNOVEDAD_PK` bigint NOT NULL,
  `US_IDUSUARIO_FK` int NOT NULL,
  `CN_IDCONCEPTO_FK` varchar(20) NOT NULL,
  `NO_PERIODO_MES` int NOT NULL,
  `NO_PERIODO_ANIO` int NOT NULL,
  `NO_QUINCENA` int DEFAULT '1' COMMENT '1 o 2 para indicar en qué quincena aplica',
  `NO_VALOR_TOTAL` decimal(12,2) NOT NULL,
  `NO_CANTIDAD` decimal(10,2) DEFAULT '1.00',
  `NO_OBSERVACIONES` text,
  `NO_ESTADO` enum('Pendiente','Procesado','Anulado') DEFAULT 'Pendiente',
  `NO_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `NO_CREADO_POR` int NOT NULL,
  `NO_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_PARAMETROS_NOMINA`
--

CREATE TABLE `OS_PARAMETROS_NOMINA` (
  `PN_IDPARAMETRO_PK` int NOT NULL,
  `PN_ANIO_VIGENCIA` int NOT NULL,
  `PN_SMMLV` decimal(12,2) NOT NULL,
  `PN_AUXILIO_TRANSPORTE` decimal(12,2) NOT NULL,
  `PN_HORAS_SEMANALES_MAX` int NOT NULL,
  `PN_HORAS_MENSUALES_PROM` int NOT NULL,
  `PN_FECHA_CAMBIO_JORNADA` date DEFAULT NULL,
  `PN_NUEVAS_HORAS_SEMANALES` int DEFAULT NULL,
  `PN_NUEVAS_HORAS_MENSUALES` int DEFAULT NULL,
  `PN_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `PN_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_ROLES`
--

CREATE TABLE `OS_ROLES` (
  `RO_IDROL_PK` int NOT NULL,
  `RO_NOMBRE` varchar(50) NOT NULL,
  `RO_CODIGO` varchar(30) NOT NULL,
  `RO_DESCRIPCION` text,
  `RO_ACTIVO` tinyint(1) DEFAULT '1',
  `RO_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `RO_CREADO_POR` int NOT NULL,
  `RO_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `RO_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_TIPOS_AUSENCIA`
--

CREATE TABLE `OS_TIPOS_AUSENCIA` (
  `TA_IDTIPO_AUSENCIA_PK` int NOT NULL,
  `TA_NOMBRE` varchar(100) NOT NULL,
  `TA_DESCRIPCION` text,
  `TA_PORCENTAJE_PAGO` decimal(5,2) NOT NULL DEFAULT '100.00',
  `TA_AFECTA_AUXILIO` tinyint(1) DEFAULT '1',
  `TA_ACTIVO` tinyint(1) DEFAULT '1',
  `TA_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `TA_CREADO_POR` int NOT NULL,
  `TA_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TA_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_TIPOS_DOCUMENTO`
--

CREATE TABLE `OS_TIPOS_DOCUMENTO` (
  `TD_IDTIPO_DOCUMENTO_PK` int NOT NULL,
  `TD_NOMBRE` varchar(50) NOT NULL,
  `TD_DESCRIPCION` text,
  `TD_ACTIVO` tinyint(1) DEFAULT '1',
  `TD_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `TD_CREADO_POR` int NOT NULL,
  `TD_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TD_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_TRANSFERENCIAS`
--

CREATE TABLE `OS_TRANSFERENCIAS` (
  `TR_IDTRANSFERENCIA_PK` int NOT NULL,
  `TR_ANIO` int NOT NULL,
  `TR_MES` varchar(20) NOT NULL,
  `TR_FECHA` date NOT NULL,
  `TR_ACTIVIDAD` varchar(255) NOT NULL,
  `TR_SALE` decimal(12,2) DEFAULT '0.00',
  `TR_ENTRA` decimal(12,2) DEFAULT '0.00',
  `TR_SALDO` decimal(12,2) DEFAULT '0.00',
  `TR_CONCEPTO` varchar(255) DEFAULT NULL,
  `TR_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `TR_CREADO_POR` int NOT NULL,
  `TR_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TR_ACTUALIZADO_POR` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OS_USUARIOS`
--

CREATE TABLE `OS_USUARIOS` (
  `US_IDUSUARIO_PK` int NOT NULL,
  `US_NOMBRE` varchar(100) NOT NULL,
  `US_APELLIDO` varchar(100) NOT NULL,
  `US_EMAIL` varchar(150) NOT NULL,
  `US_PASSWORD_HASH` varchar(255) NOT NULL,
  `US_TIPO_DOCUMENTO` enum('CC','CE','TI','RC','PA') DEFAULT 'CC',
  `US_NUMERO_DOCUMENTO` varchar(20) DEFAULT NULL,
  `US_FECHA_NACIMIENTO` date DEFAULT NULL,
  `US_GENERO` enum('M','F','O') DEFAULT NULL,
  `US_ESTADO_CIVIL` enum('Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión Libre') DEFAULT NULL,
  `US_CONTACTO_EMERGENCIA_NOMBRE` varchar(100) DEFAULT NULL,
  `US_CONTACTO_EMERGENCIA_TELEFONO` varchar(20) DEFAULT NULL,
  `US_TELEFONO` varchar(20) DEFAULT NULL,
  `US_DIRECCION` varchar(255) DEFAULT NULL,
  `DE_IDDEPARTAMENTO_FK` int DEFAULT NULL,
  `MU_IDMUNICIPIO_FK` int DEFAULT NULL,
  `US_FECHA_CONTRATACION` date DEFAULT NULL,
  `US_FECHA_RETIRO` date DEFAULT NULL,
  `US_HORARIO_TRABAJO` varchar(50) DEFAULT NULL,
  `US_DEPARTAMENTO` varchar(100) DEFAULT NULL,
  `US_IDMANAGER_FK` int DEFAULT NULL,
  `US_TIPO_EMPLEO` enum('Tiempo Completo','Medio Tiempo','Por Horas','Por Contrato') DEFAULT 'Tiempo Completo',
  `EP_IDEPS_FK` varchar(50) DEFAULT NULL,
  `AR_IDARL_FK` varchar(50) DEFAULT NULL,
  `PE_IDPENSION_FK` varchar(50) DEFAULT NULL,
  `CC_IDCAJA_FK` varchar(50) DEFAULT NULL,
  `US_NOMBRE_BANCO` varchar(100) DEFAULT NULL,
  `US_NUMERO_CUENTA` varchar(50) DEFAULT NULL,
  `US_TIPO_CUENTA` enum('Ahorros','Corriente') DEFAULT NULL,
  `US_FOTO_PERFIL` varchar(500) DEFAULT NULL,
  `US_NOTAS` text,
  `US_ACTIVO` tinyint(1) DEFAULT '1',
  `RO_IDROL_FK` int DEFAULT NULL,
  `CA_IDCARGO_FK` int DEFAULT NULL,
  `EC_IDESTADO_CONTRATO_FK` int DEFAULT NULL,
  `US_FECHA_CREACION` datetime DEFAULT CURRENT_TIMESTAMP,
  `US_CREADO_POR` int NOT NULL,
  `US_FECHA_ACTUALIZACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `US_ACTUALIZADO_POR` int DEFAULT NULL,
  `US_FECHA_ELIMINACION` datetime DEFAULT NULL,
  `US_ELIMINADO_POR` int DEFAULT NULL
) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `OS_ARCHIVOS`
--
ALTER TABLE `OS_ARCHIVOS`
  ADD PRIMARY KEY (`AF_IDARCHIVO_PK`),
  ADD KEY `idx_file_system_files_folder` (`CF_IDCARPETA_FK`),
  ADD KEY `idx_file_system_files_path` (`AF_RUTA_ARCHIVO`(191)),
  ADD KEY `idx_file_system_files_active` (`AF_ACTIVO`),
  ADD KEY `idx_file_system_files_mime_type` (`AF_TIPO_MIME`),
  ADD KEY `created_by` (`AF_CREADO_POR`);

--
-- Indices de la tabla `OS_ARCHIVOS_AUSENCIAS`
--
ALTER TABLE `OS_ARCHIVOS_AUSENCIAS`
  ADD PRIMARY KEY (`AA_IDARCHIVO_PK`),
  ADD KEY `idx_archivos_ausencias_ausencia` (`AU_IDAUSENCIA_FK`),
  ADD KEY `idx_archivos_ausencias_active` (`AA_ACTIVO`),
  ADD KEY `idx_archivos_ausencias_fecha_subida` (`AA_FECHA_SUBIDA`),
  ADD KEY `fk_archivos_ausencias_uploaded_by` (`AA_SUBIDO_POR`);

--
-- Indices de la tabla `OS_AUSENCIAS`
--
ALTER TABLE `OS_AUSENCIAS`
  ADD PRIMARY KEY (`AU_IDAUSENCIA_PK`),
  ADD KEY `idx_ausencias_colaborador` (`US_IDUSUARIO_FK`),
  ADD KEY `idx_ausencias_tipo` (`TA_IDTIPO_AUSENCIA_FK`),
  ADD KEY `idx_ausencias_fecha_inicio` (`AU_FECHA_INICIO`),
  ADD KEY `idx_ausencias_fecha_fin` (`AU_FECHA_FIN`),
  ADD KEY `idx_ausencias_activo` (`AU_ACTIVO`),
  ADD KEY `idx_ausencias_fecha_registro` (`AU_FECHA_REGISTRO`),
  ADD KEY `fk_ausencias_usuario_registro` (`AU_USUARIO_REGISTRO_FK`),
  ADD KEY `fk_ausencias_created_by` (`AU_CREADO_POR`),
  ADD KEY `fk_ausencias_updated_by` (`AU_ACTUALIZADO_POR`);

--
-- Indices de la tabla `OS_CAJAS_COMPENSACION`
--
ALTER TABLE `OS_CAJAS_COMPENSACION`
  ADD PRIMARY KEY (`CC_IDCAJA_PK`),
  ADD UNIQUE KEY `nombre` (`CC_NOMBRE`);

--
-- Indices de la tabla `OS_CARGOS`
--
ALTER TABLE `OS_CARGOS`
  ADD PRIMARY KEY (`CA_IDCARGO_PK`),
  ADD UNIQUE KEY `nombre` (`CA_NOMBRE`);

--
-- Indices de la tabla `OS_CARPETAS`
--
ALTER TABLE `OS_CARPETAS`
  ADD PRIMARY KEY (`CF_IDCARPETA_PK`),
  ADD KEY `idx_file_folders_parent` (`CF_IDCARPETA_PADRE_FK`),
  ADD KEY `idx_file_folders_path` (`CF_RUTA`(191)),
  ADD KEY `idx_file_folders_active` (`CF_ACTIVO`),
  ADD KEY `created_by` (`CF_CREADO_POR`);

--
-- Indices de la tabla `OS_CONCEPTOS_NOMINA`
--
ALTER TABLE `OS_CONCEPTOS_NOMINA`
  ADD PRIMARY KEY (`CN_IDCONCEPTO_PK`);

--
-- Indices de la tabla `OS_CLAUSULAS`
--
ALTER TABLE `OS_CLAUSULAS`
  ADD PRIMARY KEY (`CL_IDCLAUSULA_PK`),
  ADD KEY `fk_clausulas_concepto` (`CN_IDCONCEPTO_FK`);

--
-- Indices de la tabla `OS_DEPARTAMENTOS`
--
ALTER TABLE `OS_DEPARTAMENTOS`
  ADD PRIMARY KEY (`DE_IDDEPARTAMENTO_PK`),
  ADD UNIQUE KEY `nombre` (`DE_NOMBRE`);

--
-- Indices de la tabla `OS_DETALLE_LIQUIDACION`
--
ALTER TABLE `OS_DETALLE_LIQUIDACION`
  ADD PRIMARY KEY (`DL_IDDETALLE_PK`),
  ADD KEY `fk_detalle_liq` (`LQ_IDLIQUIDACION_FK`),
  ADD KEY `fk_detalle_concepto` (`CN_IDCONCEPTO_FK`);

--
-- Indices de la tabla `OS_DOCUMENTOS`
--
ALTER TABLE `OS_DOCUMENTOS`
  ADD PRIMARY KEY (`DO_IDDOCUMENTO_PK`);

--
-- Indices de la tabla `OS_ENTIDADES_ARL`
--
ALTER TABLE `OS_ENTIDADES_ARL`
  ADD PRIMARY KEY (`AR_IDARL_PK`),
  ADD UNIQUE KEY `nombre` (`AR_NOMBRE`);

--
-- Indices de la tabla `OS_ENTIDADES_BANCARIAS`
--
ALTER TABLE `OS_ENTIDADES_BANCARIAS`
  ADD PRIMARY KEY (`EB_IDBANCO_PK`),
  ADD UNIQUE KEY `nombre` (`EB_NOMBRE`);

--
-- Indices de la tabla `OS_ENTIDADES_EPS`
--
ALTER TABLE `OS_ENTIDADES_EPS`
  ADD PRIMARY KEY (`EP_IDEPS_PK`),
  ADD UNIQUE KEY `nombre` (`EP_NOMBRE`);

--
-- Indices de la tabla `OS_ENTIDADES_PENSION`
--
ALTER TABLE `OS_ENTIDADES_PENSION`
  ADD PRIMARY KEY (`PE_IDPENSION_PK`),
  ADD UNIQUE KEY `nombre` (`PE_NOMBRE`);

--
-- Indices de la tabla `OS_ESTADOS_CONTRATO`
--
ALTER TABLE `OS_ESTADOS_CONTRATO`
  ADD PRIMARY KEY (`EC_IDESTADO_CONTRATO_PK`),
  ADD UNIQUE KEY `name` (`EC_NOMBRE`),
  ADD KEY `idx_contract_statuses_active` (`EC_ACTIVO`),
  ADD KEY `idx_os_estados_activo` (`EC_ACTIVO`);

--
-- Indices de la tabla `OS_FACTURACION`
--
ALTER TABLE `OS_FACTURACION`
  ADD PRIMARY KEY (`FA_IDFACTURA_PK`),
  ADD KEY `idx_libro_gastos_year` (`FA_ANIO`),
  ADD KEY `idx_libro_gastos_mes` (`FA_MES`),
  ADD KEY `idx_libro_gastos_year_mes` (`FA_ANIO`,`FA_MES`),
  ADD KEY `idx_libro_gastos_fecha` (`FA_FECHA`),
  ADD KEY `idx_libro_gastos_cliente` (`FA_CLIENTE`),
  ADD KEY `idx_libro_gastos_nit` (`FA_NIT`),
  ADD KEY `idx_libro_gastos_servicio` (`FA_SERVICIO`);

--
-- Indices de la tabla `OS_GASTOS_MES`
--
ALTER TABLE `OS_GASTOS_MES`
  ADD PRIMARY KEY (`GM_IDGASTO_PK`),
  ADD KEY `idx_payroll_mes_a_mes_year` (`GM_ANIO`),
  ADD KEY `idx_payroll_mes_a_mes_mes` (`GM_MES`),
  ADD KEY `idx_payroll_mes_a_mes_year_mes` (`GM_ANIO`,`GM_MES`),
  ADD KEY `idx_payroll_mes_a_mes_fecha` (`GM_FECHA`),
  ADD KEY `idx_payroll_mes_a_mes_proveedor` (`GM_PROVEEDOR`),
  ADD KEY `idx_payroll_mes_a_mes_nit` (`GM_NIT`),
  ADD KEY `idx_payroll_mes_a_mes_obra` (`GM_OBRA`);

--
-- Indices de la tabla `OS_LIQUIDACIONES`
--
ALTER TABLE `OS_LIQUIDACIONES`
  ADD PRIMARY KEY (`LQ_IDLIQUIDACION_PK`),
  ADD UNIQUE KEY `uk_lq_liquidacion` (`US_IDUSUARIO_FK`,`LQ_PERIODO_ANIO`,`LQ_PERIODO_MES`,`LQ_QUINCENA`),
  ADD KEY `fk_liquidaciones_creator` (`LQ_CREADO_POR`),
  ADD KEY `idx_periodo_quincena` (`LQ_PERIODO_ANIO`,`LQ_PERIODO_MES`,`LQ_QUINCENA`),
  ADD KEY `idx_temp_lq_usu` (`US_IDUSUARIO_FK`);

--
-- Indices de la tabla `OS_MODALIDADES_TRABAJO`
--
ALTER TABLE `OS_MODALIDADES_TRABAJO`
  ADD PRIMARY KEY (`MT_IDMODALIDAD_PK`),
  ADD UNIQUE KEY `nombre` (`MT_NOMBRE`);

--
-- Indices de la tabla `OS_MUNICIPIOS`
--
ALTER TABLE `OS_MUNICIPIOS`
  ADD PRIMARY KEY (`MU_IDMUNICIPIO_PK`),
  ADD KEY `departamento_id` (`DE_IDDEPARTAMENTO_FK`);

--
-- Indices de la tabla `OS_NOVEDADES`
--
ALTER TABLE `OS_NOVEDADES`
  ADD PRIMARY KEY (`NO_IDNOVEDAD_PK`),
  ADD KEY `fk_novedades_emp` (`US_IDUSUARIO_FK`),
  ADD KEY `fk_novedades_con` (`CN_IDCONCEPTO_FK`),
  ADD KEY `idx_novedad_periodo_quincena` (`NO_PERIODO_ANIO`,`NO_PERIODO_MES`,`NO_QUINCENA`);

--
-- Indices de la tabla `OS_PARAMETROS_NOMINA`
--
ALTER TABLE `OS_PARAMETROS_NOMINA`
  ADD PRIMARY KEY (`PN_IDPARAMETRO_PK`),
  ADD UNIQUE KEY `ano_vigencia` (`PN_ANIO_VIGENCIA`);

--
-- Indices de la tabla `OS_ROLES`
--
ALTER TABLE `OS_ROLES`
  ADD PRIMARY KEY (`RO_IDROL_PK`),
  ADD UNIQUE KEY `name` (`RO_NOMBRE`),
  ADD UNIQUE KEY `code` (`RO_CODIGO`),
  ADD UNIQUE KEY `idx_os_roles_codigo` (`RO_CODIGO`),
  ADD KEY `idx_user_roles_active` (`RO_ACTIVO`),
  ADD KEY `idx_user_roles_code` (`RO_CODIGO`),
  ADD KEY `idx_os_roles_activo` (`RO_ACTIVO`);

--
-- Indices de la tabla `OS_TIPOS_AUSENCIA`
--
ALTER TABLE `OS_TIPOS_AUSENCIA`
  ADD PRIMARY KEY (`TA_IDTIPO_AUSENCIA_PK`),
  ADD KEY `idx_tipos_ausencia_active` (`TA_ACTIVO`),
  ADD KEY `fk_tipos_ausencia_created_by` (`TA_CREADO_POR`),
  ADD KEY `fk_tipos_ausencia_updated_by` (`TA_ACTUALIZADO_POR`);

--
-- Indices de la tabla `OS_TIPOS_DOCUMENTO`
--
ALTER TABLE `OS_TIPOS_DOCUMENTO`
  ADD PRIMARY KEY (`TD_IDTIPO_DOCUMENTO_PK`),
  ADD UNIQUE KEY `name` (`TD_NOMBRE`),
  ADD KEY `idx_document_types_active` (`TD_ACTIVO`),
  ADD KEY `idx_os_tipos_doc_activo` (`TD_ACTIVO`);

--
-- Indices de la tabla `OS_TRANSFERENCIAS`
--
ALTER TABLE `OS_TRANSFERENCIAS`
  ADD PRIMARY KEY (`TR_IDTRANSFERENCIA_PK`),
  ADD KEY `idx_transferencias_year` (`TR_ANIO`),
  ADD KEY `idx_transferencias_mes` (`TR_MES`),
  ADD KEY `idx_transferencias_year_mes` (`TR_ANIO`,`TR_MES`),
  ADD KEY `idx_transferencias_fecha` (`TR_FECHA`),
  ADD KEY `idx_transferencias_actividad` (`TR_ACTIVIDAD`),
  ADD KEY `idx_transferencias_concepto` (`TR_CONCEPTO`);

--
-- Indices de la tabla `OS_USUARIOS`
--
ALTER TABLE `OS_USUARIOS`
  ADD PRIMARY KEY (`US_IDUSUARIO_PK`),
  ADD UNIQUE KEY `email` (`US_EMAIL`),
  ADD UNIQUE KEY `idx_os_usu_email` (`US_EMAIL`),
  ADD UNIQUE KEY `document_number` (`US_NUMERO_DOCUMENTO`),
  ADD KEY `fk_users_cargo_id` (`CA_IDCARGO_FK`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `OS_ARCHIVOS`
--
ALTER TABLE `OS_ARCHIVOS`
  MODIFY `AF_IDARCHIVO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ARCHIVOS_AUSENCIAS`
--
ALTER TABLE `OS_ARCHIVOS_AUSENCIAS`
  MODIFY `AA_IDARCHIVO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_AUSENCIAS`
--
ALTER TABLE `OS_AUSENCIAS`
  MODIFY `AU_IDAUSENCIA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_CAJAS_COMPENSACION`
--
ALTER TABLE `OS_CAJAS_COMPENSACION`
  MODIFY `CC_IDCAJA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_CARGOS`
--
ALTER TABLE `OS_CARGOS`
  MODIFY `CA_IDCARGO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_CARPETAS`
--
ALTER TABLE `OS_CARPETAS`
  MODIFY `CF_IDCARPETA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_DETALLE_LIQUIDACION`
--
ALTER TABLE `OS_DETALLE_LIQUIDACION`
  MODIFY `DL_IDDETALLE_PK` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_DOCUMENTOS`
--
ALTER TABLE `OS_DOCUMENTOS`
  MODIFY `DO_IDDOCUMENTO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ENTIDADES_ARL`
--
ALTER TABLE `OS_ENTIDADES_ARL`
  MODIFY `AR_IDARL_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ENTIDADES_BANCARIAS`
--
ALTER TABLE `OS_ENTIDADES_BANCARIAS`
  MODIFY `EB_IDBANCO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ENTIDADES_EPS`
--
ALTER TABLE `OS_ENTIDADES_EPS`
  MODIFY `EP_IDEPS_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ENTIDADES_PENSION`
--
ALTER TABLE `OS_ENTIDADES_PENSION`
  MODIFY `PE_IDPENSION_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ESTADOS_CONTRATO`
--
ALTER TABLE `OS_ESTADOS_CONTRATO`
  MODIFY `EC_IDESTADO_CONTRATO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_FACTURACION`
--
ALTER TABLE `OS_FACTURACION`
  MODIFY `FA_IDFACTURA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_GASTOS_MES`
--
ALTER TABLE `OS_GASTOS_MES`
  MODIFY `GM_IDGASTO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_LIQUIDACIONES`
--
ALTER TABLE `OS_LIQUIDACIONES`
  MODIFY `LQ_IDLIQUIDACION_PK` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_MODALIDADES_TRABAJO`
--
ALTER TABLE `OS_MODALIDADES_TRABAJO`
  MODIFY `MT_IDMODALIDAD_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_NOVEDADES`
--
ALTER TABLE `OS_NOVEDADES`
  MODIFY `NO_IDNOVEDAD_PK` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_PARAMETROS_NOMINA`
--
ALTER TABLE `OS_PARAMETROS_NOMINA`
  MODIFY `PN_IDPARAMETRO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_ROLES`
--
ALTER TABLE `OS_ROLES`
  MODIFY `RO_IDROL_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_TIPOS_AUSENCIA`
--
ALTER TABLE `OS_TIPOS_AUSENCIA`
  MODIFY `TA_IDTIPO_AUSENCIA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_TIPOS_DOCUMENTO`
--
ALTER TABLE `OS_TIPOS_DOCUMENTO`
  MODIFY `TD_IDTIPO_DOCUMENTO_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_TRANSFERENCIAS`
--
ALTER TABLE `OS_TRANSFERENCIAS`
  MODIFY `TR_IDTRANSFERENCIA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_USUARIOS`
--
ALTER TABLE `OS_USUARIOS`
  MODIFY `US_IDUSUARIO_PK` int NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `OS_CLAUSULAS`
--
ALTER TABLE `OS_CLAUSULAS`
  MODIFY `CL_IDCLAUSULA_PK` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OS_USUARIOS_CLAUSULAS`
--
ALTER TABLE `OS_USUARIOS_CLAUSULAS`
  MODIFY `UC_IDUSUARIOCLAUSULA_PK` int NOT NULL AUTO_INCREMENT;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;