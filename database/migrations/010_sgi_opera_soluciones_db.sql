-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-03-2026 a las 16:36:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
-- Estructura de tabla para la tabla `os_archivos`
--

CREATE TABLE `os_archivos` (
  `AF_IDARCHIVO_PK` int(11) NOT NULL,
  `AF_NOMBRE` varchar(255) NOT NULL,
  `AF_NOMBRE_ORIGINAL` varchar(255) NOT NULL,
  `CF_IDCARPETA_FK` int(11) DEFAULT NULL,
  `AF_RUTA_ARCHIVO` varchar(500) NOT NULL,
  `AF_URL_ARCHIVO` varchar(500) NOT NULL,
  `AF_TAMANO` bigint(20) NOT NULL,
  `AF_TIPO_MIME` varchar(100) NOT NULL,
  `AF_EXTENSION` varchar(10) DEFAULT NULL,
  `AF_DESCRIPCION` text DEFAULT NULL,
  `AF_CREADO_POR` int(11) NOT NULL,
  `AF_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `AF_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `AF_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_archivos_ausencias`
--

CREATE TABLE `os_archivos_ausencias` (
  `AA_IDARCHIVO_PK` int(11) NOT NULL,
  `AU_IDAUSENCIA_FK` int(11) NOT NULL,
  `AA_URL_ARCHIVO` varchar(255) NOT NULL,
  `AA_NOMBRE_ARCHIVO` varchar(255) NOT NULL,
  `AA_TIPO_ARCHIVO` varchar(50) DEFAULT NULL,
  `AA_TAMANO_ARCHIVO` int(11) DEFAULT NULL,
  `AA_FECHA_SUBIDA` datetime DEFAULT current_timestamp(),
  `AA_SUBIDO_POR` int(11) NOT NULL,
  `AA_ACTIVO` tinyint(1) DEFAULT 1,
  `AA_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `AA_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_ausencias`
--

CREATE TABLE `os_ausencias` (
  `AU_IDAUSENCIA_PK` int(11) NOT NULL,
  `US_IDUSUARIO_FK` int(11) NOT NULL,
  `TA_IDTIPO_AUSENCIA_FK` int(11) NOT NULL,
  `AU_FECHA_INICIO` date NOT NULL,
  `AU_FECHA_FIN` date NOT NULL,
  `AU_DESCRIPCION` text DEFAULT NULL,
  `AU_URL_SOPORTE` varchar(255) DEFAULT NULL,
  `AU_USUARIO_REGISTRO_FK` int(11) NOT NULL,
  `AU_FECHA_REGISTRO` timestamp NOT NULL DEFAULT current_timestamp(),
  `AU_ACTIVO` tinyint(1) DEFAULT 1,
  `AU_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `AU_CREADO_POR` int(11) NOT NULL,
  `AU_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `AU_ACTUALIZADO_POR` int(11) DEFAULT NULL,
  `AU_DIAS_AUSENCIA` int(11) GENERATED ALWAYS AS (to_days(`AU_FECHA_FIN`) - to_days(`AU_FECHA_INICIO`) + 1) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_cajas_compensacion`
--

CREATE TABLE `os_cajas_compensacion` (
  `CC_IDCAJA_PK` int(11) NOT NULL,
  `CC_NOMBRE` varchar(100) NOT NULL,
  `CC_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_cargos`
--

CREATE TABLE `os_cargos` (
  `CA_IDCARGO_PK` int(11) NOT NULL,
  `CA_NOMBRE` varchar(100) NOT NULL,
  `CA_SUELDO_BASE` decimal(12,2) NOT NULL,
  `CA_JORNADA_DIARIA` int(11) NOT NULL,
  `CA_APLICA_AUXILIO` tinyint(1) NOT NULL,
  `CA_CLASE_RIESGO_ARL` varchar(50) NOT NULL,
  `CA_PORCENTAJE_RIESGO_ARL` decimal(5,3) NOT NULL,
  `CA_DESCRIPCION` text DEFAULT NULL,
  `CA_ACTIVO` tinyint(1) DEFAULT 1,
  `CA_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `CA_CREADO_POR` int(11) NOT NULL,
  `CA_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CA_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_carpetas`
--

CREATE TABLE `os_carpetas` (
  `CF_IDCARPETA_PK` int(11) NOT NULL,
  `CF_NOMBRE` varchar(255) NOT NULL,
  `CF_IDCARPETA_PADRE_FK` int(11) DEFAULT NULL,
  `CF_RUTA` varchar(500) NOT NULL,
  `CF_DESCRIPCION` text DEFAULT NULL,
  `CF_CREADO_POR` int(11) NOT NULL,
  `CF_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `CF_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `CF_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_conceptos_nomina`
--

CREATE TABLE `os_conceptos_nomina` (
  `CN_IDCONCEPTO_PK` varchar(20) NOT NULL,
  `CN_NOMBRE` varchar(100) NOT NULL,
  `CN_TIPO` enum('Devengo','Deducción','Aporte Empleador','Info') NOT NULL,
  `CN_AFECTA_IBC_SALUD` tinyint(1) DEFAULT 0,
  `CN_AFECTA_IBC_PENSION` tinyint(1) DEFAULT 0,
  `CN_AFECTA_IBC_ARL` tinyint(1) DEFAULT 0,
  `CN_CONSTITUTIVO_SALARIO` tinyint(1) DEFAULT 0,
  `CN_ES_NOVEDAD` tinyint(1) DEFAULT 0,
  `CN_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `CN_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_departamentos`
--

CREATE TABLE `os_departamentos` (
  `DE_IDDEPARTAMENTO_PK` int(11) NOT NULL,
  `DE_NOMBRE` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_detalle_liquidacion`
--

CREATE TABLE `os_detalle_liquidacion` (
  `DL_IDDETALLE_PK` bigint(20) NOT NULL,
  `LQ_IDLIQUIDACION_FK` bigint(20) NOT NULL,
  `CN_IDCONCEPTO_FK` varchar(20) NOT NULL,
  `DL_DESCRIPCION` varchar(150) DEFAULT NULL,
  `DL_CANTIDAD` decimal(10,2) DEFAULT 1.00,
  `DL_VALOR_UNITARIO` decimal(12,2) DEFAULT NULL,
  `DL_VALOR_TOTAL` decimal(12,2) NOT NULL,
  `DL_TIPO` enum('Devengo','Deducción','Aporte Empleador','Info') NOT NULL,
  `DL_AFECTA_IBC_SALUD` tinyint(1) DEFAULT 0,
  `DL_AFECTA_IBC_PENSION` tinyint(1) DEFAULT 0,
  `DL_AFECTA_IBC_ARL` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_documentos`
--

CREATE TABLE `os_documentos` (
  `DO_IDDOCUMENTO_PK` int(11) NOT NULL,
  `US_IDUSUARIO_FK` int(11) NOT NULL,
  `DO_NOMBRE` varchar(255) NOT NULL,
  `DO_URL_ARCHIVO` varchar(500) NOT NULL,
  `TD_IDTIPO_DOCUMENTO_FK` int(11) DEFAULT NULL,
  `DO_DESCRIPCION` text DEFAULT NULL,
  `DO_FECHA_SUBIDA` datetime DEFAULT current_timestamp(),
  `DO_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `DO_CREADO_POR` int(11) NOT NULL,
  `DO_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `DO_ACTUALIZADO_POR` int(11) DEFAULT NULL,
  `DO_FECHA_ELIMINACION` datetime DEFAULT NULL,
  `DO_ELIMINADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_entidades_arl`
--

CREATE TABLE `os_entidades_arl` (
  `AR_IDARL_PK` int(11) NOT NULL,
  `AR_NOMBRE` varchar(150) NOT NULL,
  `AR_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_entidades_bancarias`
--

CREATE TABLE `os_entidades_bancarias` (
  `EB_IDBANCO_PK` int(11) NOT NULL,
  `EB_NOMBRE` varchar(100) NOT NULL,
  `EB_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_entidades_eps`
--

CREATE TABLE `os_entidades_eps` (
  `EP_IDEPS_PK` int(11) NOT NULL,
  `EP_NOMBRE` varchar(100) NOT NULL,
  `EP_CODIGO_MINPROTECCION` varchar(20) DEFAULT NULL,
  `EP_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_entidades_pension`
--

CREATE TABLE `os_entidades_pension` (
  `PE_IDPENSION_PK` int(11) NOT NULL,
  `PE_NOMBRE` varchar(100) NOT NULL,
  `PE_ACTIVO` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_estados_contrato`
--

CREATE TABLE `os_estados_contrato` (
  `EC_IDESTADO_CONTRATO_PK` int(11) NOT NULL,
  `EC_NOMBRE` varchar(50) NOT NULL,
  `EC_DESCRIPCION` text DEFAULT NULL,
  `EC_ACTIVO` tinyint(1) DEFAULT 1,
  `EC_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `EC_CREADO_POR` int(11) NOT NULL,
  `EC_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `EC_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_facturacion`
--

CREATE TABLE `os_facturacion` (
  `FA_IDFACTURA_PK` int(11) NOT NULL,
  `FA_ANIO` int(11) NOT NULL,
  `FA_MES` varchar(20) NOT NULL,
  `FA_NUMERO_FACTURACION` varchar(50) NOT NULL,
  `FA_FECHA` date NOT NULL,
  `FA_CLIENTE` varchar(255) NOT NULL,
  `FA_SERVICIO` varchar(255) NOT NULL,
  `FA_NIT` varchar(50) DEFAULT NULL,
  `FA_VALOR` decimal(12,2) NOT NULL,
  `FA_IVA` decimal(12,2) DEFAULT 0.00,
  `FA_TOTAL` decimal(12,2) NOT NULL,
  `FA_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `FA_CREADO_POR` int(11) NOT NULL,
  `FA_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `FA_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_gastos_mes`
--

CREATE TABLE `os_gastos_mes` (
  `GM_IDGASTO_PK` int(11) NOT NULL,
  `GM_ANIO` int(11) NOT NULL,
  `GM_MES` varchar(20) NOT NULL,
  `GM_FECHA` date NOT NULL,
  `GM_PROVEEDOR` varchar(255) NOT NULL,
  `GM_PAGO` decimal(12,2) NOT NULL,
  `GM_OBJETO` varchar(255) NOT NULL,
  `GM_VALOR_NETO` decimal(12,2) NOT NULL,
  `GM_IVA` decimal(12,2) DEFAULT 0.00,
  `GM_RETENCION` decimal(12,2) DEFAULT 0.00,
  `GM_TOTAL` decimal(12,2) NOT NULL,
  `GM_NIT` varchar(50) DEFAULT NULL,
  `GM_NUMERO_FACTURA` varchar(50) NOT NULL,
  `GM_OBRA` varchar(255) NOT NULL,
  `GM_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `GM_CREADO_POR` int(11) NOT NULL,
  `GM_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `GM_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_liquidaciones`
--

CREATE TABLE `os_liquidaciones` (
  `LQ_IDLIQUIDACION_PK` bigint(20) NOT NULL,
  `US_IDUSUARIO_FK` int(11) NOT NULL,
  `LQ_PERIODO_MES` int(11) NOT NULL,
  `LQ_PERIODO_ANIO` int(11) NOT NULL,
  `LQ_QUINCENA` int(11) DEFAULT 1 COMMENT '1 para la primera quincena, 2 para la segunda',
  `LQ_FECHA_LIQUIDACION` date NOT NULL,
  `LQ_FECHA_PAGO` date DEFAULT NULL,
  `LQ_DIAS_TRABAJADOS` int(11) DEFAULT 30,
  `LQ_DIAS_INCAPACIDAD` int(11) DEFAULT 0,
  `LQ_DIAS_VACACIONES` int(11) DEFAULT 0,
  `LQ_IBC_SALUD` decimal(12,2) NOT NULL,
  `LQ_IBC_PENSION` decimal(12,2) NOT NULL,
  `LQ_IBC_ARL` decimal(12,2) NOT NULL,
  `LQ_TOTAL_DEVENGADO` decimal(12,2) NOT NULL,
  `LQ_TOTAL_DEDUCCIONES` decimal(12,2) NOT NULL,
  `LQ_NETO_PAGAR` decimal(12,2) NOT NULL,
  `LQ_COSTO_EMPRESA` decimal(12,2) NOT NULL,
  `LQ_SALARIO_INTEGRAL` tinyint(1) DEFAULT 0,
  `LQ_SMMLV_BASE` decimal(12,2) NOT NULL,
  `LQ_XML_PILA` text DEFAULT NULL,
  `LQ_OBSERVACIONES` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`LQ_OBSERVACIONES`)),
  `LQ_ESTADO` enum('Borrador','Calculado','Aprobado','Pagado','Anulado') DEFAULT 'Borrador',
  `LQ_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `LQ_CREADO_POR` int(11) NOT NULL,
  `LQ_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_modalidades_trabajo`
--

CREATE TABLE `os_modalidades_trabajo` (
  `MT_IDMODALIDAD_PK` int(11) NOT NULL,
  `MT_NOMBRE` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_municipios`
--

CREATE TABLE `os_municipios` (
  `MU_IDMUNICIPIO_PK` int(11) NOT NULL,
  `DE_IDDEPARTAMENTO_FK` int(11) NOT NULL,
  `MU_NOMBRE` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_novedades`
--

CREATE TABLE `os_novedades` (
  `NO_IDNOVEDAD_PK` bigint(20) NOT NULL,
  `US_IDUSUARIO_FK` int(11) NOT NULL,
  `CN_IDCONCEPTO_FK` varchar(20) NOT NULL,
  `NO_PERIODO_MES` int(11) NOT NULL,
  `NO_PERIODO_ANIO` int(11) NOT NULL,
  `NO_QUINCENA` int(11) DEFAULT 1 COMMENT '1 o 2 para indicar en qué quincena aplica',
  `NO_VALOR_TOTAL` decimal(12,2) NOT NULL,
  `NO_CANTIDAD` decimal(10,2) DEFAULT 1.00,
  `NO_OBSERVACIONES` text DEFAULT NULL,
  `NO_ESTADO` enum('Pendiente','Procesado','Anulado') DEFAULT 'Pendiente',
  `NO_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `NO_CREADO_POR` int(11) NOT NULL,
  `NO_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_parametros_nomina`
--

CREATE TABLE `os_parametros_nomina` (
  `PN_IDPARAMETRO_PK` int(11) NOT NULL,
  `PN_ANIO_VIGENCIA` int(11) NOT NULL,
  `PN_SMMLV` decimal(12,2) NOT NULL,
  `PN_AUXILIO_TRANSPORTE` decimal(12,2) NOT NULL,
  `PN_HORAS_SEMANALES_MAX` int(11) NOT NULL,
  `PN_HORAS_MENSUALES_PROM` int(11) NOT NULL,
  `PN_FECHA_CAMBIO_JORNADA` date DEFAULT NULL,
  `PN_NUEVAS_HORAS_SEMANALES` int(11) DEFAULT NULL,
  `PN_NUEVAS_HORAS_MENSUALES` int(11) DEFAULT NULL,
  `PN_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `PN_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_roles`
--

CREATE TABLE `os_roles` (
  `RO_IDROL_PK` int(11) NOT NULL,
  `RO_NOMBRE` varchar(50) NOT NULL,
  `RO_CODIGO` varchar(30) NOT NULL,
  `RO_DESCRIPCION` text DEFAULT NULL,
  `RO_ACTIVO` tinyint(1) DEFAULT 1,
  `RO_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `RO_CREADO_POR` int(11) NOT NULL,
  `RO_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `RO_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_tipos_ausencia`
--

CREATE TABLE `os_tipos_ausencia` (
  `TA_IDTIPO_AUSENCIA_PK` int(11) NOT NULL,
  `TA_NOMBRE` varchar(100) NOT NULL,
  `TA_DESCRIPCION` text DEFAULT NULL,
  `TA_PORCENTAJE_PAGO` decimal(5,2) NOT NULL DEFAULT 100.00,
  `TA_AFECTA_AUXILIO` tinyint(1) DEFAULT 1,
  `TA_ACTIVO` tinyint(1) DEFAULT 1,
  `TA_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `TA_CREADO_POR` int(11) NOT NULL,
  `TA_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `TA_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_tipos_documento`
--

CREATE TABLE `os_tipos_documento` (
  `TD_IDTIPO_DOCUMENTO_PK` int(11) NOT NULL,
  `TD_NOMBRE` varchar(50) NOT NULL,
  `TD_DESCRIPCION` text DEFAULT NULL,
  `TD_ACTIVO` tinyint(1) DEFAULT 1,
  `TD_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `TD_CREADO_POR` int(11) NOT NULL,
  `TD_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `TD_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_transferencias`
--

CREATE TABLE `os_transferencias` (
  `TR_IDTRANSFERENCIA_PK` int(11) NOT NULL,
  `TR_ANIO` int(11) NOT NULL,
  `TR_MES` varchar(20) NOT NULL,
  `TR_FECHA` date NOT NULL,
  `TR_ACTIVIDAD` varchar(255) NOT NULL,
  `TR_SALE` decimal(12,2) DEFAULT 0.00,
  `TR_ENTRA` decimal(12,2) DEFAULT 0.00,
  `TR_SALDO` decimal(12,2) DEFAULT 0.00,
  `TR_CONCEPTO` varchar(255) DEFAULT NULL,
  `TR_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `TR_CREADO_POR` int(11) NOT NULL,
  `TR_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `TR_ACTUALIZADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `os_usuarios`
--

CREATE TABLE `os_usuarios` (
  `US_IDUSUARIO_PK` int(11) NOT NULL,
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
  `DE_IDDEPARTAMENTO_FK` int(11) DEFAULT NULL,
  `MU_IDMUNICIPIO_FK` int(11) DEFAULT NULL,
  `US_FECHA_CONTRATACION` date DEFAULT NULL,
  `US_FECHA_RETIRO` date DEFAULT NULL,
  `US_HORARIO_TRABAJO` varchar(50) DEFAULT NULL,
  `US_DEPARTAMENTO` varchar(100) DEFAULT NULL,
  `US_IDMANAGER_FK` int(11) DEFAULT NULL,
  `US_TIPO_EMPLEO` enum('Tiempo Completo','Medio Tiempo','Por Horas','Por Contrato') DEFAULT 'Tiempo Completo',
  `EP_IDEPS_FK` varchar(50) DEFAULT NULL,
  `AR_IDARL_FK` varchar(50) DEFAULT NULL,
  `PE_IDPENSION_FK` varchar(50) DEFAULT NULL,
  `CC_IDCAJA_FK` varchar(50) DEFAULT NULL,
  `US_NOMBRE_BANCO` varchar(100) DEFAULT NULL,
  `US_NUMERO_CUENTA` varchar(50) DEFAULT NULL,
  `US_TIPO_CUENTA` enum('Ahorros','Corriente') DEFAULT NULL,
  `US_FOTO_PERFIL` varchar(500) DEFAULT NULL,
  `US_NOTAS` text DEFAULT NULL,
  `US_ACTIVO` tinyint(1) DEFAULT 1,
  `RO_IDROL_FK` int(11) DEFAULT NULL,
  `CA_IDCARGO_FK` int(11) DEFAULT NULL,
  `EC_IDESTADO_CONTRATO_FK` int(11) DEFAULT NULL,
  `US_FECHA_CREACION` datetime DEFAULT current_timestamp(),
  `US_CREADO_POR` int(11) NOT NULL,
  `US_FECHA_ACTUALIZACION` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `US_ACTUALIZADO_POR` int(11) DEFAULT NULL,
  `US_FECHA_ELIMINACION` datetime DEFAULT NULL,
  `US_ELIMINADO_POR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `os_archivos`
--
ALTER TABLE `os_archivos`
  ADD PRIMARY KEY (`AF_IDARCHIVO_PK`),
  ADD KEY `idx_file_system_files_folder` (`CF_IDCARPETA_FK`),
  ADD KEY `idx_file_system_files_path` (`AF_RUTA_ARCHIVO`(191)),
  ADD KEY `idx_file_system_files_active` (`AF_ACTIVO`),
  ADD KEY `idx_file_system_files_mime_type` (`AF_TIPO_MIME`),
  ADD KEY `created_by` (`AF_CREADO_POR`),
  ADD KEY `idx_os_archivo_carpeta` (`CF_IDCARPETA_FK`),
  ADD KEY `idx_os_archivo_ruta` (`AF_RUTA_ARCHIVO`(191)),
  ADD KEY `idx_os_archivo_activo` (`AF_ACTIVO`),
  ADD KEY `idx_os_archivo_mime` (`AF_TIPO_MIME`);

--
-- Indices de la tabla `os_archivos_ausencias`
--
ALTER TABLE `os_archivos_ausencias`
  ADD PRIMARY KEY (`AA_IDARCHIVO_PK`),
  ADD KEY `idx_archivos_ausencias_ausencia` (`AU_IDAUSENCIA_FK`),
  ADD KEY `idx_archivos_ausencias_active` (`AA_ACTIVO`),
  ADD KEY `idx_archivos_ausencias_fecha_subida` (`AA_FECHA_SUBIDA`),
  ADD KEY `fk_archivos_ausencias_uploaded_by` (`AA_SUBIDO_POR`),
  ADD KEY `idx_os_arch_aus_ausencia` (`AU_IDAUSENCIA_FK`),
  ADD KEY `idx_os_arch_aus_activo` (`AA_ACTIVO`),
  ADD KEY `idx_os_arch_aus_fecha` (`AA_FECHA_SUBIDA`);

--
-- Indices de la tabla `os_ausencias`
--
ALTER TABLE `os_ausencias`
  ADD PRIMARY KEY (`AU_IDAUSENCIA_PK`),
  ADD KEY `idx_ausencias_colaborador` (`US_IDUSUARIO_FK`),
  ADD KEY `idx_ausencias_tipo` (`TA_IDTIPO_AUSENCIA_FK`),
  ADD KEY `idx_ausencias_fecha_inicio` (`AU_FECHA_INICIO`),
  ADD KEY `idx_ausencias_fecha_fin` (`AU_FECHA_FIN`),
  ADD KEY `idx_ausencias_activo` (`AU_ACTIVO`),
  ADD KEY `idx_ausencias_fecha_registro` (`AU_FECHA_REGISTRO`),
  ADD KEY `fk_ausencias_usuario_registro` (`AU_USUARIO_REGISTRO_FK`),
  ADD KEY `fk_ausencias_created_by` (`AU_CREADO_POR`),
  ADD KEY `fk_ausencias_updated_by` (`AU_ACTUALIZADO_POR`),
  ADD KEY `idx_os_ausencias_usuario` (`US_IDUSUARIO_FK`),
  ADD KEY `idx_os_ausencias_tipo` (`TA_IDTIPO_AUSENCIA_FK`),
  ADD KEY `idx_os_ausencias_inicio` (`AU_FECHA_INICIO`),
  ADD KEY `idx_os_ausencias_fin` (`AU_FECHA_FIN`),
  ADD KEY `idx_os_ausencias_dias` (`AU_DIAS_AUSENCIA`),
  ADD KEY `idx_os_ausencias_activo` (`AU_ACTIVO`),
  ADD KEY `idx_os_ausencias_fecha_reg` (`AU_FECHA_REGISTRO`);

--
-- Indices de la tabla `os_cajas_compensacion`
--
ALTER TABLE `os_cajas_compensacion`
  ADD PRIMARY KEY (`CC_IDCAJA_PK`),
  ADD UNIQUE KEY `nombre` (`CC_NOMBRE`);

--
-- Indices de la tabla `os_cargos`
--
ALTER TABLE `os_cargos`
  ADD PRIMARY KEY (`CA_IDCARGO_PK`),
  ADD UNIQUE KEY `nombre` (`CA_NOMBRE`);

--
-- Indices de la tabla `os_carpetas`
--
ALTER TABLE `os_carpetas`
  ADD PRIMARY KEY (`CF_IDCARPETA_PK`),
  ADD KEY `idx_file_folders_parent` (`CF_IDCARPETA_PADRE_FK`),
  ADD KEY `idx_file_folders_path` (`CF_RUTA`(191)),
  ADD KEY `idx_file_folders_active` (`CF_ACTIVO`),
  ADD KEY `created_by` (`CF_CREADO_POR`),
  ADD KEY `idx_os_carpeta_padre` (`CF_IDCARPETA_PADRE_FK`),
  ADD KEY `idx_os_carpeta_ruta` (`CF_RUTA`(191)),
  ADD KEY `idx_os_carpeta_activo` (`CF_ACTIVO`);

--
-- Indices de la tabla `os_conceptos_nomina`
--
ALTER TABLE `os_conceptos_nomina`
  ADD PRIMARY KEY (`CN_IDCONCEPTO_PK`);

--
-- Indices de la tabla `os_departamentos`
--
ALTER TABLE `os_departamentos`
  ADD PRIMARY KEY (`DE_IDDEPARTAMENTO_PK`),
  ADD UNIQUE KEY `nombre` (`DE_NOMBRE`);

--
-- Indices de la tabla `os_detalle_liquidacion`
--
ALTER TABLE `os_detalle_liquidacion`
  ADD PRIMARY KEY (`DL_IDDETALLE_PK`),
  ADD KEY `fk_dl_liquidacion` (`LQ_IDLIQUIDACION_FK`),
  ADD KEY `fk_dl_concepto` (`CN_IDCONCEPTO_FK`);

--
-- Indices de la tabla `os_documentos`
--
ALTER TABLE `os_documentos`
  ADD PRIMARY KEY (`DO_IDDOCUMENTO_PK`),
  ADD KEY `idx_os_doc_usuario` (`US_IDUSUARIO_FK`),
  ADD KEY `idx_os_doc_tipo` (`TD_IDTIPO_DOCUMENTO_FK`),
  ADD KEY `idx_os_doc_eliminado` (`DO_FECHA_ELIMINACION`);

--
-- Indices de la tabla `os_entidades_arl`
--
ALTER TABLE `os_entidades_arl`
  ADD PRIMARY KEY (`AR_IDARL_PK`),
  ADD UNIQUE KEY `nombre` (`AR_NOMBRE`);

--
-- Indices de la tabla `os_entidades_bancarias`
--
ALTER TABLE `os_entidades_bancarias`
  ADD PRIMARY KEY (`EB_IDBANCO_PK`),
  ADD UNIQUE KEY `nombre` (`EB_NOMBRE`);

--
-- Indices de la tabla `os_entidades_eps`
--
ALTER TABLE `os_entidades_eps`
  ADD PRIMARY KEY (`EP_IDEPS_PK`),
  ADD UNIQUE KEY `nombre` (`EP_NOMBRE`);

--
-- Indices de la tabla `os_entidades_pension`
--
ALTER TABLE `os_entidades_pension`
  ADD PRIMARY KEY (`PE_IDPENSION_PK`),
  ADD UNIQUE KEY `nombre` (`PE_NOMBRE`);

--
-- Indices de la tabla `os_estados_contrato`
--
ALTER TABLE `os_estados_contrato`
  ADD PRIMARY KEY (`EC_IDESTADO_CONTRATO_PK`),
  ADD UNIQUE KEY `name` (`EC_NOMBRE`),
  ADD KEY `idx_contract_statuses_active` (`EC_ACTIVO`),
  ADD KEY `idx_os_estados_activo` (`EC_ACTIVO`);

--
-- Indices de la tabla `os_facturacion`
--
ALTER TABLE `os_facturacion`
  ADD PRIMARY KEY (`FA_IDFACTURA_PK`),
  ADD KEY `idx_libro_gastos_year` (`FA_ANIO`),
  ADD KEY `idx_libro_gastos_mes` (`FA_MES`),
  ADD KEY `idx_libro_gastos_year_mes` (`FA_ANIO`,`FA_MES`),
  ADD KEY `idx_libro_gastos_fecha` (`FA_FECHA`),
  ADD KEY `idx_libro_gastos_cliente` (`FA_CLIENTE`),
  ADD KEY `idx_libro_gastos_nit` (`FA_NIT`),
  ADD KEY `idx_libro_gastos_servicio` (`FA_SERVICIO`),
  ADD KEY `idx_os_fa_anio` (`FA_ANIO`),
  ADD KEY `idx_os_fa_mes` (`FA_MES`),
  ADD KEY `idx_os_fa_anio_mes` (`FA_ANIO`,`FA_MES`),
  ADD KEY `idx_os_fa_fecha` (`FA_FECHA`),
  ADD KEY `idx_os_fa_cliente` (`FA_CLIENTE`),
  ADD KEY `idx_os_fa_nit` (`FA_NIT`);

--
-- Indices de la tabla `os_gastos_mes`
--
ALTER TABLE `os_gastos_mes`
  ADD PRIMARY KEY (`GM_IDGASTO_PK`),
  ADD KEY `idx_payroll_mes_a_mes_year` (`GM_ANIO`),
  ADD KEY `idx_payroll_mes_a_mes_mes` (`GM_MES`),
  ADD KEY `idx_payroll_mes_a_mes_year_mes` (`GM_ANIO`,`GM_MES`),
  ADD KEY `idx_payroll_mes_a_mes_fecha` (`GM_FECHA`),
  ADD KEY `idx_payroll_mes_a_mes_proveedor` (`GM_PROVEEDOR`),
  ADD KEY `idx_payroll_mes_a_mes_nit` (`GM_NIT`),
  ADD KEY `idx_payroll_mes_a_mes_obra` (`GM_OBRA`),
  ADD KEY `idx_os_gm_anio` (`GM_ANIO`),
  ADD KEY `idx_os_gm_mes` (`GM_MES`),
  ADD KEY `idx_os_gm_anio_mes` (`GM_ANIO`,`GM_MES`),
  ADD KEY `idx_os_gm_fecha` (`GM_FECHA`),
  ADD KEY `idx_os_gm_proveedor` (`GM_PROVEEDOR`),
  ADD KEY `idx_os_gm_nit` (`GM_NIT`),
  ADD KEY `idx_os_gm_obra` (`GM_OBRA`);

--
-- Indices de la tabla `os_liquidaciones`
--
ALTER TABLE `os_liquidaciones`
  ADD PRIMARY KEY (`LQ_IDLIQUIDACION_PK`),
  ADD UNIQUE KEY `uk_lq_liquidacion` (`US_IDUSUARIO_FK`,`LQ_PERIODO_ANIO`,`LQ_PERIODO_MES`,`LQ_QUINCENA`),
  ADD KEY `fk_lq_creador` (`LQ_CREADO_POR`),
  ADD KEY `idx_periodo_quincena` (`LQ_PERIODO_ANIO`,`LQ_PERIODO_MES`,`LQ_QUINCENA`);

--
-- Indices de la tabla `os_modalidades_trabajo`
--
ALTER TABLE `os_modalidades_trabajo`
  ADD PRIMARY KEY (`MT_IDMODALIDAD_PK`),
  ADD UNIQUE KEY `nombre` (`MT_NOMBRE`);

--
-- Indices de la tabla `os_municipios`
--
ALTER TABLE `os_municipios`
  ADD PRIMARY KEY (`MU_IDMUNICIPIO_PK`),
  ADD KEY `fk_mu_departamento` (`DE_IDDEPARTAMENTO_FK`);

--
-- Indices de la tabla `os_novedades`
--
ALTER TABLE `os_novedades`
  ADD PRIMARY KEY (`NO_IDNOVEDAD_PK`),
  ADD KEY `fk_no_empleado` (`US_IDUSUARIO_FK`),
  ADD KEY `fk_no_concepto` (`CN_IDCONCEPTO_FK`),
  ADD KEY `idx_novedad_periodo_quincena` (`NO_PERIODO_ANIO`,`NO_PERIODO_MES`,`NO_QUINCENA`);

--
-- Indices de la tabla `os_parametros_nomina`
--
ALTER TABLE `os_parametros_nomina`
  ADD PRIMARY KEY (`PN_IDPARAMETRO_PK`),
  ADD UNIQUE KEY `ano_vigencia` (`PN_ANIO_VIGENCIA`);

--
-- Indices de la tabla `os_roles`
--
ALTER TABLE `os_roles`
  ADD PRIMARY KEY (`RO_IDROL_PK`),
  ADD UNIQUE KEY `name` (`RO_NOMBRE`),
  ADD UNIQUE KEY `code` (`RO_CODIGO`),
  ADD UNIQUE KEY `idx_os_roles_codigo` (`RO_CODIGO`),
  ADD KEY `idx_user_roles_active` (`RO_ACTIVO`),
  ADD KEY `idx_user_roles_code` (`RO_CODIGO`),
  ADD KEY `idx_os_roles_activo` (`RO_ACTIVO`);

--
-- Indices de la tabla `os_tipos_ausencia`
--
ALTER TABLE `os_tipos_ausencia`
  ADD PRIMARY KEY (`TA_IDTIPO_AUSENCIA_PK`),
  ADD KEY `idx_tipos_ausencia_active` (`TA_ACTIVO`),
  ADD KEY `fk_tipos_ausencia_created_by` (`TA_CREADO_POR`),
  ADD KEY `fk_tipos_ausencia_updated_by` (`TA_ACTUALIZADO_POR`),
  ADD KEY `idx_os_tipos_ausencia_activo` (`TA_ACTIVO`);

--
-- Indices de la tabla `os_tipos_documento`
--
ALTER TABLE `os_tipos_documento`
  ADD PRIMARY KEY (`TD_IDTIPO_DOCUMENTO_PK`),
  ADD UNIQUE KEY `name` (`TD_NOMBRE`),
  ADD KEY `idx_document_types_active` (`TD_ACTIVO`),
  ADD KEY `idx_os_tipos_doc_activo` (`TD_ACTIVO`);

--
-- Indices de la tabla `os_transferencias`
--
ALTER TABLE `os_transferencias`
  ADD PRIMARY KEY (`TR_IDTRANSFERENCIA_PK`),
  ADD KEY `idx_transferencias_year` (`TR_ANIO`),
  ADD KEY `idx_transferencias_mes` (`TR_MES`),
  ADD KEY `idx_transferencias_year_mes` (`TR_ANIO`,`TR_MES`),
  ADD KEY `idx_transferencias_fecha` (`TR_FECHA`),
  ADD KEY `idx_transferencias_actividad` (`TR_ACTIVIDAD`),
  ADD KEY `idx_transferencias_concepto` (`TR_CONCEPTO`),
  ADD KEY `idx_os_tr_anio` (`TR_ANIO`),
  ADD KEY `idx_os_tr_mes` (`TR_MES`),
  ADD KEY `idx_os_tr_anio_mes` (`TR_ANIO`,`TR_MES`),
  ADD KEY `idx_os_tr_fecha` (`TR_FECHA`),
  ADD KEY `idx_os_tr_actividad` (`TR_ACTIVIDAD`),
  ADD KEY `idx_os_tr_concepto` (`TR_CONCEPTO`);

--
-- Indices de la tabla `os_usuarios`
--
ALTER TABLE `os_usuarios`
  ADD PRIMARY KEY (`US_IDUSUARIO_PK`),
  ADD UNIQUE KEY `email` (`US_EMAIL`),
  ADD UNIQUE KEY `idx_os_usu_email` (`US_EMAIL`),
  ADD UNIQUE KEY `document_number` (`US_NUMERO_DOCUMENTO`),
  ADD UNIQUE KEY `idx_os_usu_num_doc` (`US_NUMERO_DOCUMENTO`),
  ADD KEY `idx_os_usu_rol` (`RO_IDROL_FK`),
  ADD KEY `idx_os_usu_estado_contrato` (`EC_IDESTADO_CONTRATO_FK`),
  ADD KEY `idx_os_usu_eliminado` (`US_FECHA_ELIMINACION`),
  ADD KEY `idx_os_usu_tipo_doc` (`US_TIPO_DOCUMENTO`),
  ADD KEY `idx_os_usu_fecha_nac` (`US_FECHA_NACIMIENTO`),
  ADD KEY `idx_os_usu_fecha_contratacion` (`US_FECHA_CONTRATACION`),
  ADD KEY `idx_os_usu_fecha_retiro` (`US_FECHA_RETIRO`),
  ADD KEY `idx_os_usu_departamento` (`US_DEPARTAMENTO`),
  ADD KEY `idx_os_usu_manager` (`US_IDMANAGER_FK`),
  ADD KEY `idx_os_usu_activo` (`US_ACTIVO`),
  ADD KEY `idx_os_usu_tipo_empleo` (`US_TIPO_EMPLEO`),
  ADD KEY `fk_us_cargo` (`CA_IDCARGO_FK`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `os_archivos`
--
ALTER TABLE `os_archivos`
  MODIFY `AF_IDARCHIVO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_archivos_ausencias`
--
ALTER TABLE `os_archivos_ausencias`
  MODIFY `AA_IDARCHIVO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_ausencias`
--
ALTER TABLE `os_ausencias`
  MODIFY `AU_IDAUSENCIA_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_cajas_compensacion`
--
ALTER TABLE `os_cajas_compensacion`
  MODIFY `CC_IDCAJA_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_cargos`
--
ALTER TABLE `os_cargos`
  MODIFY `CA_IDCARGO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_carpetas`
--
ALTER TABLE `os_carpetas`
  MODIFY `CF_IDCARPETA_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_detalle_liquidacion`
--
ALTER TABLE `os_detalle_liquidacion`
  MODIFY `DL_IDDETALLE_PK` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_documentos`
--
ALTER TABLE `os_documentos`
  MODIFY `DO_IDDOCUMENTO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_entidades_arl`
--
ALTER TABLE `os_entidades_arl`
  MODIFY `AR_IDARL_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_entidades_bancarias`
--
ALTER TABLE `os_entidades_bancarias`
  MODIFY `EB_IDBANCO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_entidades_eps`
--
ALTER TABLE `os_entidades_eps`
  MODIFY `EP_IDEPS_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_entidades_pension`
--
ALTER TABLE `os_entidades_pension`
  MODIFY `PE_IDPENSION_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_estados_contrato`
--
ALTER TABLE `os_estados_contrato`
  MODIFY `EC_IDESTADO_CONTRATO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_facturacion`
--
ALTER TABLE `os_facturacion`
  MODIFY `FA_IDFACTURA_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_gastos_mes`
--
ALTER TABLE `os_gastos_mes`
  MODIFY `GM_IDGASTO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_liquidaciones`
--
ALTER TABLE `os_liquidaciones`
  MODIFY `LQ_IDLIQUIDACION_PK` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_modalidades_trabajo`
--
ALTER TABLE `os_modalidades_trabajo`
  MODIFY `MT_IDMODALIDAD_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_novedades`
--
ALTER TABLE `os_novedades`
  MODIFY `NO_IDNOVEDAD_PK` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_parametros_nomina`
--
ALTER TABLE `os_parametros_nomina`
  MODIFY `PN_IDPARAMETRO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_roles`
--
ALTER TABLE `os_roles`
  MODIFY `RO_IDROL_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_tipos_ausencia`
--
ALTER TABLE `os_tipos_ausencia`
  MODIFY `TA_IDTIPO_AUSENCIA_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_tipos_documento`
--
ALTER TABLE `os_tipos_documento`
  MODIFY `TD_IDTIPO_DOCUMENTO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_transferencias`
--
ALTER TABLE `os_transferencias`
  MODIFY `TR_IDTRANSFERENCIA_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `os_usuarios`
--
ALTER TABLE `os_usuarios`
  MODIFY `US_IDUSUARIO_PK` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `os_archivos`
--
ALTER TABLE `os_archivos`
  ADD CONSTRAINT `fk_af_carpeta` FOREIGN KEY (`CF_IDCARPETA_FK`) REFERENCES `os_carpetas` (`CF_IDCARPETA_PK`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_af_creado_por` FOREIGN KEY (`AF_CREADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`);

--
-- Filtros para la tabla `os_archivos_ausencias`
--
ALTER TABLE `os_archivos_ausencias`
  ADD CONSTRAINT `fk_aa_ausencia` FOREIGN KEY (`AU_IDAUSENCIA_FK`) REFERENCES `os_ausencias` (`AU_IDAUSENCIA_PK`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_aa_subido_por` FOREIGN KEY (`AA_SUBIDO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`);

--
-- Filtros para la tabla `os_ausencias`
--
ALTER TABLE `os_ausencias`
  ADD CONSTRAINT `fk_au_actualizado_por` FOREIGN KEY (`AU_ACTUALIZADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_au_creado_por` FOREIGN KEY (`AU_CREADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`),
  ADD CONSTRAINT `fk_au_tipo_ausencia` FOREIGN KEY (`TA_IDTIPO_AUSENCIA_FK`) REFERENCES `os_tipos_ausencia` (`TA_IDTIPO_AUSENCIA_PK`),
  ADD CONSTRAINT `fk_au_usuario` FOREIGN KEY (`US_IDUSUARIO_FK`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_au_usuario_reg` FOREIGN KEY (`AU_USUARIO_REGISTRO_FK`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`);

--
-- Filtros para la tabla `os_carpetas`
--
ALTER TABLE `os_carpetas`
  ADD CONSTRAINT `fk_cf_creado_por` FOREIGN KEY (`CF_CREADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`),
  ADD CONSTRAINT `fk_cf_padre` FOREIGN KEY (`CF_IDCARPETA_PADRE_FK`) REFERENCES `os_carpetas` (`CF_IDCARPETA_PK`) ON DELETE CASCADE;

--
-- Filtros para la tabla `os_detalle_liquidacion`
--
ALTER TABLE `os_detalle_liquidacion`
  ADD CONSTRAINT `fk_dl_concepto` FOREIGN KEY (`CN_IDCONCEPTO_FK`) REFERENCES `os_conceptos_nomina` (`CN_IDCONCEPTO_PK`) ON DELETE NO ACTION,
  ADD CONSTRAINT `fk_dl_liquidacion` FOREIGN KEY (`LQ_IDLIQUIDACION_FK`) REFERENCES `os_liquidaciones` (`LQ_IDLIQUIDACION_PK`) ON DELETE CASCADE;

--
-- Filtros para la tabla `os_documentos`
--
ALTER TABLE `os_documentos`
  ADD CONSTRAINT `fk_do_tipo_doc` FOREIGN KEY (`TD_IDTIPO_DOCUMENTO_FK`) REFERENCES `os_tipos_documento` (`TD_IDTIPO_DOCUMENTO_PK`),
  ADD CONSTRAINT `fk_do_usuario` FOREIGN KEY (`US_IDUSUARIO_FK`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE CASCADE;

--
-- Filtros para la tabla `os_liquidaciones`
--
ALTER TABLE `os_liquidaciones`
  ADD CONSTRAINT `fk_lq_creador` FOREIGN KEY (`LQ_CREADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE NO ACTION,
  ADD CONSTRAINT `fk_lq_empleado` FOREIGN KEY (`US_IDUSUARIO_FK`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE CASCADE;

--
-- Filtros para la tabla `os_municipios`
--
ALTER TABLE `os_municipios`
  ADD CONSTRAINT `fk_mu_departamento` FOREIGN KEY (`DE_IDDEPARTAMENTO_FK`) REFERENCES `os_departamentos` (`DE_IDDEPARTAMENTO_PK`) ON DELETE CASCADE;

--
-- Filtros para la tabla `os_novedades`
--
ALTER TABLE `os_novedades`
  ADD CONSTRAINT `fk_no_concepto` FOREIGN KEY (`CN_IDCONCEPTO_FK`) REFERENCES `os_conceptos_nomina` (`CN_IDCONCEPTO_PK`) ON DELETE NO ACTION,
  ADD CONSTRAINT `fk_no_empleado` FOREIGN KEY (`US_IDUSUARIO_FK`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE CASCADE;

--
-- Filtros para la tabla `os_tipos_ausencia`
--
ALTER TABLE `os_tipos_ausencia`
  ADD CONSTRAINT `fk_ta_actualizado_por` FOREIGN KEY (`TA_ACTUALIZADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ta_creado_por` FOREIGN KEY (`TA_CREADO_POR`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`);

--
-- Filtros para la tabla `os_usuarios`
--
ALTER TABLE `os_usuarios`
  ADD CONSTRAINT `fk_us_cargo` FOREIGN KEY (`CA_IDCARGO_FK`) REFERENCES `os_cargos` (`CA_IDCARGO_PK`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_us_estado_cont` FOREIGN KEY (`EC_IDESTADO_CONTRATO_FK`) REFERENCES `os_estados_contrato` (`EC_IDESTADO_CONTRATO_PK`),
  ADD CONSTRAINT `fk_us_manager` FOREIGN KEY (`US_IDMANAGER_FK`) REFERENCES `os_usuarios` (`US_IDUSUARIO_PK`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_us_rol` FOREIGN KEY (`RO_IDROL_FK`) REFERENCES `os_roles` (`RO_IDROL_PK`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
