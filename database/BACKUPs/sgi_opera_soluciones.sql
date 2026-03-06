-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql-191117-db.mysql-191117:10031
-- Tiempo de generación: 05-03-2026 a las 17:01:37
-- Versión del servidor: 8.0.26
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


-- Eliminar la base de datos si existe
-- DROP DATABASE IF EXISTS `sgi_opera_soluciones`;

-- Crear la base de datos nuevamente
-- CREATE DATABASE `sgi_opera_soluciones`
--  DEFAULT CHARACTER SET utf8mb4
--  COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos
USE `sgi_opera_soluciones`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sgi_opera_soluciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_ausencias`
--

CREATE TABLE `archivos_ausencias` (
  `id_archivo` int NOT NULL,
  `id_ausencia` int NOT NULL,
  `url_archivo` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `tipo_archivo` varchar(50) DEFAULT NULL,
  `tamano_archivo` int DEFAULT NULL,
  `fecha_subida` datetime DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ausencias`
--

CREATE TABLE `ausencias` (
  `id_ausencia` int NOT NULL,
  `id_colaborador` int NOT NULL,
  `id_tipo_ausencia` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias_ausencia` int GENERATED ALWAYS AS (((to_days(`fecha_fin`) - to_days(`fecha_inicio`)) + 1)) STORED,
  `descripcion` text,
  `soporte_url` varchar(255) DEFAULT NULL,
  `id_usuario_registro` int NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contract_statuses`
--

CREATE TABLE `contract_statuses` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `contract_statuses`
--

INSERT INTO `contract_statuses` (`id`, `name`, `description`, `is_active`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 'Activo', 'Contrato activo y vigente', 1, '2025-10-20 21:30:54', 1, NULL),
(2, 'Inactivo', 'Contrato inactivo o suspendido', 1, '2025-10-20 21:30:54', 1, NULL),
(3, 'Terminado', 'Contrato terminado', 1, '2025-10-20 21:30:54', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documents`
--

CREATE TABLE `documents` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `document_type_id` int DEFAULT NULL,
  `description` text,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `document_types`
--

CREATE TABLE `document_types` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `document_types`
--

INSERT INTO `document_types` (`id`, `name`, `description`, `is_active`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 'Contrato', 'Contratos de empleo y acuerdos laborales', 1, '2025-10-20 21:30:54', 1, NULL),
(2, 'Hoja de vida', 'Currículum vitae y documentos de perfil profesional', 1, '2025-10-20 21:30:54', 1, NULL),
(3, 'Volantes de pago', 'Comprobantes de nómina y pagos salariales', 1, '2025-10-20 21:30:54', 1, NULL),
(4, 'Exámenes médicos', 'Certificados médicos y exámenes de salud ocupacional', 1, '2025-10-20 21:30:54', 1, NULL),
(5, 'Seguridad social', 'Documentos de afiliación y aportes a seguridad social', 1, '2025-10-20 21:30:54', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `file_folders`
--

CREATE TABLE `file_folders` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `path` varchar(500) NOT NULL,
  `description` text,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ;

--
-- Volcado de datos para la tabla `file_folders`
--

INSERT INTO `file_folders` (`id`, `name`, `parent_id`, `path`, `description`, `created_by`, `created_at`, `is_active`) VALUES
(1, 'CONTABLE', NULL, '/CONTABLE/', '', 1, '2025-10-24 09:34:37', 1),
(2, 'INFANTERIA', NULL, '/INFANTERIA/', '', 1, '2025-10-24 09:34:46', 1),
(3, 'RRHH', NULL, '/RRHH/', '', 1, '2025-10-24 09:34:54', 1),
(4, 'SGSST - OPERA SOLUCIONES', NULL, '/SGSST - OPERA SOLUCIONES/', '', 1, '2025-10-24 09:35:27', 1),
(5, 'EXTRACTOS', 1, '/CONTABLE/EXTRACTOS/', '', 1, '2025-10-24 09:38:31', 1),
(6, '2024', 5, '/CONTABLE/EXTRACTOS/2024/', '', 1, '2025-10-24 09:38:44', 1),
(7, '2025', 5, '/CONTABLE/EXTRACTOS/2025/', '', 1, '2025-10-24 09:38:50', 1),
(8, '2025', 7, '/CONTABLE/EXTRACTOS/2025/2025/', '', 1, '2025-10-24 09:47:35', 1),
(9, 'CONTRATOS TRABAJADORES', 3, '/RRHH/CONTRATOS TRABAJADORES/', '', 1, '2025-10-24 10:06:56', 1),
(10, 'PROCESO CONTRATACION MIGUEL POLO', 3, '/RRHH/PROCESO CONTRATACION MIGUEL POLO/', '', 1, '2025-10-24 10:08:33', 1),
(11, 'RENUNCIA TRABAJADORES', 3, '/RRHH/RENUNCIA TRABAJADORES/', '', 1, '2025-10-24 10:09:46', 1),
(12, 'JHON FREDY HERRERA', 11, '/RRHH/RENUNCIA TRABAJADORES/JHON FREDY HERRERA/', '', 1, '2025-10-24 10:13:02', 1),
(13, 'JHON JAIRO HERRERA', 11, '/RRHH/RENUNCIA TRABAJADORES/JHON JAIRO HERRERA/', '', 1, '2025-10-24 10:13:15', 1),
(14, 'VALENTINA FERRER', 11, '/RRHH/RENUNCIA TRABAJADORES/VALENTINA FERRER/', '', 1, '2025-10-24 10:13:32', 1),
(15, 'aura', NULL, '/aura/', '', 1, '2025-11-21 11:50:18', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `file_system_files`
--

CREATE TABLE `file_system_files` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `folder_id` int DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_extension` varchar(10) DEFAULT NULL,
  `description` text,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ;

--
-- Volcado de datos para la tabla `file_system_files`
--

INSERT INTO `file_system_files` (`id`, `name`, `original_name`, `folder_id`, `file_path`, `file_url`, `file_size`, `mime_type`, `file_extension`, `description`, `created_by`, `created_at`, `is_active`) VALUES
(1, '43620def-f7cb-4fdb-b79f-cc25de798a23_084768.pdf.pdf', '3 Extracto Marzo.pdf', 6, '/CONTABLE/EXTRACTOS/2024/43620def-f7cb-4fdb-b79f-cc25de798a23_084768.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/43620def-f7cb-4fdb-b79f-cc25de798a23_084768.pdf.pdf', 257961, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:44:44', 1),
(2, '291b1b57-c9fd-435f-a575-374d0e78c2fc_096825.pdf.pdf', '5 Extracto Mayo.pdf', 6, '/CONTABLE/EXTRACTOS/2024/291b1b57-c9fd-435f-a575-374d0e78c2fc_096825.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/291b1b57-c9fd-435f-a575-374d0e78c2fc_096825.pdf.pdf', 258054, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:44:56', 1),
(3, '2fd1f3ab-a35b-4119-9d20-5e53275e4158_105834.pdf.pdf', '6 Extrato junio.pdf', 6, '/CONTABLE/EXTRACTOS/2024/2fd1f3ab-a35b-4119-9d20-5e53275e4158_105834.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/2fd1f3ab-a35b-4119-9d20-5e53275e4158_105834.pdf.pdf', 258005, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:45:05', 1),
(4, '4614aec6-6252-4f1b-9082-2dc4d858d4fd_117511.pdf.pdf', '7 Extrato julio.pdf', 6, '/CONTABLE/EXTRACTOS/2024/4614aec6-6252-4f1b-9082-2dc4d858d4fd_117511.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/4614aec6-6252-4f1b-9082-2dc4d858d4fd_117511.pdf.pdf', 258536, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:45:17', 1),
(5, '5e1e7217-66d4-45ea-8a32-1d057eb1b40f_129173.pdf.pdf', '8 Extracto Agosto.pdf', 6, '/CONTABLE/EXTRACTOS/2024/5e1e7217-66d4-45ea-8a32-1d057eb1b40f_129173.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/5e1e7217-66d4-45ea-8a32-1d057eb1b40f_129173.pdf.pdf', 258214, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:45:29', 1),
(6, '812ac86a-8d03-4b9a-8c5e-59fb1d4b7dbb_137260.pdf.pdf', '10 Extracto Octubre.pdf', 6, '/CONTABLE/EXTRACTOS/2024/812ac86a-8d03-4b9a-8c5e-59fb1d4b7dbb_137260.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/812ac86a-8d03-4b9a-8c5e-59fb1d4b7dbb_137260.pdf.pdf', 258614, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:45:37', 1),
(7, '750293e4-44ad-4d1a-a078-1382ef780f11_148354.pdf.pdf', '11 Extracto Noviembre.pdf', 6, '/CONTABLE/EXTRACTOS/2024/750293e4-44ad-4d1a-a078-1382ef780f11_148354.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/750293e4-44ad-4d1a-a078-1382ef780f11_148354.pdf.pdf', 258609, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:45:48', 1),
(8, 'dd34df65-7e20-46ca-af01-d59592c4fc0c_157250.pdf.pdf', '12 Extrato diciembre.pdf', 6, '/CONTABLE/EXTRACTOS/2024/dd34df65-7e20-46ca-af01-d59592c4fc0c_157250.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/dd34df65-7e20-46ca-af01-d59592c4fc0c_157250.pdf.pdf', 291226, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:45:57', 1),
(9, '89cdf19f-6d1d-4754-9487-2f3249cf1c08_355254.pdf.pdf', '01 Extracto Enero.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/89cdf19f-6d1d-4754-9487-2f3249cf1c08_355254.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/89cdf19f-6d1d-4754-9487-2f3249cf1c08_355254.pdf.pdf', 258552, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:49:15', 1),
(10, 'c22dc647-db0b-49d5-a314-bfe345304647_363096.pdf.pdf', '02 Extracto Febrero.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/c22dc647-db0b-49d5-a314-bfe345304647_363096.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/c22dc647-db0b-49d5-a314-bfe345304647_363096.pdf.pdf', 290576, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:49:23', 1),
(11, 'e0cbb016-aa94-4180-99a0-8ec59e941bc1_371365.pdf.pdf', '03 Extracto Marzo.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/e0cbb016-aa94-4180-99a0-8ec59e941bc1_371365.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/e0cbb016-aa94-4180-99a0-8ec59e941bc1_371365.pdf.pdf', 290588, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:49:31', 1),
(12, 'a33175b5-a3f5-459b-8c58-7130a43071d6_380050.pdf.pdf', '04 Extracto Abril.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/a33175b5-a3f5-459b-8c58-7130a43071d6_380050.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/a33175b5-a3f5-459b-8c58-7130a43071d6_380050.pdf.pdf', 290745, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:49:40', 1),
(13, '735f764b-c366-46e4-9b6a-274d66e7d777_389675.pdf.pdf', '05 Extracto Mayo.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/735f764b-c366-46e4-9b6a-274d66e7d777_389675.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/735f764b-c366-46e4-9b6a-274d66e7d777_389675.pdf.pdf', 290502, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:49:49', 1),
(14, '54dbdb3e-872d-41e1-9895-58acdc698e0b_398351.pdf.pdf', '06.  Extracto Junio.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/54dbdb3e-872d-41e1-9895-58acdc698e0b_398351.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/54dbdb3e-872d-41e1-9895-58acdc698e0b_398351.pdf.pdf', 290849, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:49:58', 1),
(15, 'af57108a-f3df-43a9-8665-a6b40ac02515_408807.pdf.pdf', '07. Extracto Julio.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/af57108a-f3df-43a9-8665-a6b40ac02515_408807.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/af57108a-f3df-43a9-8665-a6b40ac02515_408807.pdf.pdf', 292941, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:50:08', 1),
(16, 'eb1b3072-fa70-44c0-82e2-28cec36d297c_424051.pdf.pdf', '08. Extracto Agosto.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/eb1b3072-fa70-44c0-82e2-28cec36d297c_424051.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/eb1b3072-fa70-44c0-82e2-28cec36d297c_424051.pdf.pdf', 293440, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:50:24', 1),
(17, '42e57796-b64c-43af-863f-367879ca0c42_432854.pdf.pdf', '09. Extracto Septiembre.pdf', 8, '/CONTABLE/EXTRACTOS/2025/2025/42e57796-b64c-43af-863f-367879ca0c42_432854.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/42e57796-b64c-43af-863f-367879ca0c42_432854.pdf.pdf', 292969, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:50:33', 1),
(18, 'fb7ced72-0c9d-48e7-ab0b-f109ee8d951b_561367.xlsx.xlsx', '~$Libro de gastos.xlsx', 1, '/CONTABLE/fb7ced72-0c9d-48e7-ab0b-f109ee8d951b_561367.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/fb7ced72-0c9d-48e7-ab0b-f109ee8d951b_561367.xlsx.xlsx', 165, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:52:41', 1),
(19, 'fb0b4a12-30dd-48ce-9f26-255cf652cbf9_570537.xlsx.xlsx', 'bancos.xlsx', 1, '/CONTABLE/fb0b4a12-30dd-48ce-9f26-255cf652cbf9_570537.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/fb0b4a12-30dd-48ce-9f26-255cf652cbf9_570537.xlsx.xlsx', 43840, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:52:50', 1),
(20, 'c00fc00b-d8f4-49bf-9679-d601486bf52e_579352.xlsx.xlsx', 'Facturacion Recurrente 2024.xlsx', 1, '/CONTABLE/c00fc00b-d8f4-49bf-9679-d601486bf52e_579352.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/c00fc00b-d8f4-49bf-9679-d601486bf52e_579352.xlsx.xlsx', 25682, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:52:59', 1),
(21, '72398c97-a78f-4e49-bd33-3b9847caf2fc_588753.xlsx.xlsx', 'Facturacion Recurrente 2025.xlsx', 1, '/CONTABLE/72398c97-a78f-4e49-bd33-3b9847caf2fc_588753.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/72398c97-a78f-4e49-bd33-3b9847caf2fc_588753.xlsx.xlsx', 46586, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:53:08', 1),
(22, 'cbcdd49a-939d-437c-a794-8f63ff4bde4c_599050.xlsx.xlsx', 'Libro de gastos.xlsx', 1, '/CONTABLE/cbcdd49a-939d-437c-a794-8f63ff4bde4c_599050.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/cbcdd49a-939d-437c-a794-8f63ff4bde4c_599050.xlsx.xlsx', 68603, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:53:19', 1),
(23, '4ce77aa8-edbb-4c6f-ab5e-715cf5170994_757448.xlsx.xlsx', 'Acta Obra infanteria.xlsx', 2, '/INFANTERIA/4ce77aa8-edbb-4c6f-ab5e-715cf5170994_757448.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/4ce77aa8-edbb-4c6f-ab5e-715cf5170994_757448.xlsx.xlsx', 189092, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:55:57', 1),
(24, 'd4374b86-a3a9-4a02-9b1d-19bed08befdd_765556.pdf.pdf', 'ANEXO OFERTA MERCANTIL N 2025SU0280 ENTRE CEMENTOS ARGOS Y OPERA SOLUCIONES SAS. - firmado.pdf', 2, '/INFANTERIA/d4374b86-a3a9-4a02-9b1d-19bed08befdd_765556.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/d4374b86-a3a9-4a02-9b1d-19bed08befdd_765556.pdf.pdf', 579136, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:56:05', 1),
(25, 'bbba085d-0bdc-4ce3-9635-7653c8c80b4c_772689.pdf.pdf', 'Comprobante_Transferencia_Boton1755291362642.pdf', 2, '/INFANTERIA/bbba085d-0bdc-4ce3-9635-7653c8c80b4c_772689.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/bbba085d-0bdc-4ce3-9635-7653c8c80b4c_772689.pdf.pdf', 858484, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:56:12', 1),
(26, '562514a5-36c0-4178-bd42-5cd1c5de695b_780250.xlsx.xlsx', 'COTIZACION  MODULOS COVEÑAS BIM3.xlsx', 2, '/INFANTERIA/562514a5-36c0-4178-bd42-5cd1c5de695b_780250.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/562514a5-36c0-4178-bd42-5cd1c5de695b_780250.xlsx.xlsx', 117864, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:56:20', 1),
(27, '06bf8e25-9358-452b-98b7-b394afbfab19_787478.xlsx.xlsx', 'COTIZACION BIM14.xlsx', 2, '/INFANTERIA/06bf8e25-9358-452b-98b7-b394afbfab19_787478.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/06bf8e25-9358-452b-98b7-b394afbfab19_787478.xlsx.xlsx', 15695, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:56:27', 1),
(28, '03b34c4c-9294-4456-8c39-b29327b6c0ca_797230.xlsx.xlsx', 'cronograma de trabajo.xlsx', 2, '/INFANTERIA/03b34c4c-9294-4456-8c39-b29327b6c0ca_797230.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/03b34c4c-9294-4456-8c39-b29327b6c0ca_797230.xlsx.xlsx', 26511, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:56:37', 1),
(29, '560571b1-bcf9-442b-aa7c-749bd860a1d1_804804.pdf.pdf', 'CUM_4334721_16721208.pdf', 2, '/INFANTERIA/560571b1-bcf9-442b-aa7c-749bd860a1d1_804804.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/560571b1-bcf9-442b-aa7c-749bd860a1d1_804804.pdf.pdf', 437191, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:56:44', 1),
(30, '53d3496f-e46a-4fa5-ae5c-31e39125d4ea_812385.docx.docx', 'OFERTA MERCANTIL FINAL INF.docx', 2, '/INFANTERIA/53d3496f-e46a-4fa5-ae5c-31e39125d4ea_812385.docx.docx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/53d3496f-e46a-4fa5-ae5c-31e39125d4ea_812385.docx.docx', 262965, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', '', 1, '2025-10-24 09:56:52', 1),
(31, '78ad7dc6-18e0-46fa-a3d9-a87b38c77c7c_826366.docx.docx', 'OFERTA MERCANTIL.docx', 2, '/INFANTERIA/78ad7dc6-18e0-46fa-a3d9-a87b38c77c7c_826366.docx.docx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/78ad7dc6-18e0-46fa-a3d9-a87b38c77c7c_826366.docx.docx', 287335, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', '', 1, '2025-10-24 09:57:06', 1),
(32, 'c91c65b8-80d6-438c-98da-c2d0dd0e814d_841226.pdf.pdf', 'Prefactura Corozal.pdf', 2, '/INFANTERIA/c91c65b8-80d6-438c-98da-c2d0dd0e814d_841226.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/c91c65b8-80d6-438c-98da-c2d0dd0e814d_841226.pdf.pdf', 57358, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:57:21', 1),
(33, '6a476bde-c3c1-45a3-b9f5-875d5b183232_848008.pdf.pdf', 'Prefactura Coveñas.pdf', 2, '/INFANTERIA/6a476bde-c3c1-45a3-b9f5-875d5b183232_848008.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/6a476bde-c3c1-45a3-b9f5-875d5b183232_848008.pdf.pdf', 48624, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:57:28', 1),
(34, '95b12ca2-d982-47ed-b700-4ac4794d6bc2_857135.xlsx.xlsx', 'Prefactura.xlsx', 2, '/INFANTERIA/95b12ca2-d982-47ed-b700-4ac4794d6bc2_857135.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/95b12ca2-d982-47ed-b700-4ac4794d6bc2_857135.xlsx.xlsx', 1239582, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:57:37', 1),
(35, 'f3f8c419-725d-49ab-a6dc-d1a1e30ab822_858363.xlsx.xlsx', 'Prefactura.xlsx', 2, '/INFANTERIA/f3f8c419-725d-49ab-a6dc-d1a1e30ab822_858363.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/f3f8c419-725d-49ab-a6dc-d1a1e30ab822_858363.xlsx.xlsx', 1239582, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 09:57:38', 1),
(36, '52165d56-1fd3-451d-b264-8e4c30667b12_866726.pdf.pdf', 'Propuesta Infanteria.pdf', 2, '/INFANTERIA/52165d56-1fd3-451d-b264-8e4c30667b12_866726.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/52165d56-1fd3-451d-b264-8e4c30667b12_866726.pdf.pdf', 1961479, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:57:46', 1),
(37, '09359708-ba3e-489c-ae4a-ba631500a417_968096.pdf.pdf', 'PURCHASE_4501573897_CO02_7019137_20250814_140910.pdf', 2, '/INFANTERIA/09359708-ba3e-489c-ae4a-ba631500a417_968096.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/09359708-ba3e-489c-ae4a-ba631500a417_968096.pdf.pdf', 62145, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:59:28', 1),
(38, 'efcd5447-bad5-48e7-a05e-1af32caf0c5b_969452.pdf.pdf', 'PURCHASE_4501573897_CO02_7019137_20250814_140910.pdf', 2, '/INFANTERIA/efcd5447-bad5-48e7-a05e-1af32caf0c5b_969452.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/efcd5447-bad5-48e7-a05e-1af32caf0c5b_969452.pdf.pdf', 62145, 'application/pdf', 'pdf', '', 1, '2025-10-24 09:59:29', 1),
(39, '8194c617-a87b-48ad-9635-9d4cf29d2604_037187.pdf.pdf', 'PURCHASE_4501573901_CO02_7019137_20250814_141305.pdf', 2, '/INFANTERIA/8194c617-a87b-48ad-9635-9d4cf29d2604_037187.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/8194c617-a87b-48ad-9635-9d4cf29d2604_037187.pdf.pdf', 61745, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:00:37', 1),
(40, '3bc666da-670d-4dea-8826-f5c4b668c9b2_044702.pdf.pdf', 'RCE_1029920_14154968.pdf', 2, '/INFANTERIA/3bc666da-670d-4dea-8826-f5c4b668c9b2_044702.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/3bc666da-670d-4dea-8826-f5c4b668c9b2_044702.pdf.pdf', 438739, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:00:44', 1),
(41, '12e70503-e12b-4cce-8f53-f666dbc43689_052824.pptx.pptx', 'Servicios varios Cementos Argos.pptx', 2, '/INFANTERIA/12e70503-e12b-4cce-8f53-f666dbc43689_052824.pptx.pptx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/12e70503-e12b-4cce-8f53-f666dbc43689_052824.pptx.pptx', 1173164, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'pptx', '', 1, '2025-10-24 10:00:52', 1),
(42, '9f8e387e-4cbc-4e53-8324-1d2c86272066_183095.pdf.pdf', 'Propuesta Infanteria PPT.pdf', 2, '/INFANTERIA/9f8e387e-4cbc-4e53-8324-1d2c86272066_183095.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/9f8e387e-4cbc-4e53-8324-1d2c86272066_183095.pdf.pdf', 1736915, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:03:03', 1),
(43, '5bf1aecd-70c8-4c93-a332-0131cf79e904_346208.xlsx.xlsx', 'costos Rondero.xlsx', 3, '/RRHH/5bf1aecd-70c8-4c93-a332-0131cf79e904_346208.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/5bf1aecd-70c8-4c93-a332-0131cf79e904_346208.xlsx.xlsx', 11868, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 10:05:46', 1),
(44, 'be1a4703-4afc-48dc-a28a-06210e00c962_354931.xlsx.xlsx', 'dotacion.xlsx', 3, '/RRHH/be1a4703-4afc-48dc-a28a-06210e00c962_354931.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/be1a4703-4afc-48dc-a28a-06210e00c962_354931.xlsx.xlsx', 19448, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 10:05:55', 1),
(45, '28fbb647-6901-4e39-a52d-a902e93f01b7_361606.xlsx.xlsx', 'Personal.xlsx', 3, '/RRHH/28fbb647-6901-4e39-a52d-a902e93f01b7_361606.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/28fbb647-6901-4e39-a52d-a902e93f01b7_361606.xlsx.xlsx', 10409, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 10:06:01', 1),
(46, '2c6152ea-dc37-49c0-9b3d-282f5f0e19b9_368962.xlsx.xlsx', 'Proceso.xlsx', 3, '/RRHH/2c6152ea-dc37-49c0-9b3d-282f5f0e19b9_368962.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/2c6152ea-dc37-49c0-9b3d-282f5f0e19b9_368962.xlsx.xlsx', 94786, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 10:06:09', 1),
(47, 'cd4b1125-b3f2-45a2-991f-f39f63605759_379476.pptx.pptx', 'REGLAMENTO INTERNO DE TRABAJO OPERA  2025.pptx', 3, '/RRHH/cd4b1125-b3f2-45a2-991f-f39f63605759_379476.pptx.pptx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/cd4b1125-b3f2-45a2-991f-f39f63605759_379476.pptx.pptx', 669617, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'pptx', '', 1, '2025-10-24 10:06:19', 1),
(48, '80972a32-3908-4a92-96e5-b6f2435e9b3c_432380.docx.docx', '~$NTRATO DE TRABAJO} - copia.docx', 3, '/RRHH/80972a32-3908-4a92-96e5-b6f2435e9b3c_432380.docx.docx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/80972a32-3908-4a92-96e5-b6f2435e9b3c_432380.docx.docx', 162, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', '', 1, '2025-10-24 10:07:12', 0),
(49, '5bd5cfdd-3c80-434a-ac83-7c6ecd29f13a_468933.docx.docx', '~$NTRATO DE TRABAJO} - copia.docx', 9, '/RRHH/CONTRATOS TRABAJADORES/5bd5cfdd-3c80-434a-ac83-7c6ecd29f13a_468933.docx.docx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/5bd5cfdd-3c80-434a-ac83-7c6ecd29f13a_468933.docx.docx', 162, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', '', 1, '2025-10-24 10:07:49', 1),
(50, 'da2d7eb2-6b47-4bd7-afc6-6cc97f8b2b0e_478129.docx.docx', 'CONTRATO DE TRABAJO} - SISO.docx', 9, '/RRHH/CONTRATOS TRABAJADORES/da2d7eb2-6b47-4bd7-afc6-6cc97f8b2b0e_478129.docx.docx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/da2d7eb2-6b47-4bd7-afc6-6cc97f8b2b0e_478129.docx.docx', 70524, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', '', 1, '2025-10-24 10:07:58', 1),
(51, 'e3e3f3df-c1b4-4e3f-8199-ffddfe078d45_485262.docx.docx', 'CONTRATO DE TRABAJO}.docx', 9, '/RRHH/CONTRATOS TRABAJADORES/e3e3f3df-c1b4-4e3f-8199-ffddfe078d45_485262.docx.docx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/e3e3f3df-c1b4-4e3f-8199-ffddfe078d45_485262.docx.docx', 69903, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', '', 1, '2025-10-24 10:08:05', 1),
(52, 'bb027d3e-2ff6-4a3b-a248-1825299169a5_535685.jpg.jpg', 'ADRES.jpg', 10, '/RRHH/PROCESO CONTRATACION MIGUEL POLO/bb027d3e-2ff6-4a3b-a248-1825299169a5_535685.jpg.jpg', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/bb027d3e-2ff6-4a3b-a248-1825299169a5_535685.jpg.jpg', 263260, 'image/jpeg', 'jpg', '', 1, '2025-10-24 10:08:55', 1),
(53, '00d22bc2-91fd-4661-b280-a70dcf2af75a_543274.pdf.pdf', 'AFILIACION DE ARL.pdf', 10, '/RRHH/PROCESO CONTRATACION MIGUEL POLO/00d22bc2-91fd-4661-b280-a70dcf2af75a_543274.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/00d22bc2-91fd-4661-b280-a70dcf2af75a_543274.pdf.pdf', 279885, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:09:03', 1),
(54, 'ff2a5c0b-49f4-412e-b30a-60600fae9634_551302.pdf.pdf', 'Certificado de afiliación de Cesantías.pdf', 10, '/RRHH/PROCESO CONTRATACION MIGUEL POLO/ff2a5c0b-49f4-412e-b30a-60600fae9634_551302.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/ff2a5c0b-49f4-412e-b30a-60600fae9634_551302.pdf.pdf', 43366, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:09:11', 1),
(55, '85616c99-7f0c-4944-a48e-be4e8828d079_558560.pdf.pdf', 'Constancia de Afiliación Pensión Obligatoria.pdf', 10, '/RRHH/PROCESO CONTRATACION MIGUEL POLO/85616c99-7f0c-4944-a48e-be4e8828d079_558560.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/85616c99-7f0c-4944-a48e-be4e8828d079_558560.pdf.pdf', 43659, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:09:18', 1),
(56, 'e25ab90b-ad14-43cf-87f5-8b739afa2172_832656.pdf.pdf', 'CARTA DE RENUNCIA 1.pdf', 12, '/RRHH/RENUNCIA TRABAJADORES/JHON FREDY HERRERA/e25ab90b-ad14-43cf-87f5-8b739afa2172_832656.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/e25ab90b-ad14-43cf-87f5-8b739afa2172_832656.pdf.pdf', 318480, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:13:52', 1),
(57, '4d0fd2b6-c902-4d07-956e-aabe4ae31c80_839055.xlsx.xlsx', 'LIQUIDACION JHON FREDY HERRERA - copia.xlsx', 12, '/RRHH/RENUNCIA TRABAJADORES/JHON FREDY HERRERA/4d0fd2b6-c902-4d07-956e-aabe4ae31c80_839055.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/4d0fd2b6-c902-4d07-956e-aabe4ae31c80_839055.xlsx.xlsx', 8796, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 10:13:59', 1),
(58, '22146e80-42ed-4334-8a33-bc6c6be0aab5_858429.pdf.pdf', 'Barranquilla 02 de Julio 2025 Opera SAS.pdf', 13, '/RRHH/RENUNCIA TRABAJADORES/JHON JAIRO HERRERA/22146e80-42ed-4334-8a33-bc6c6be0aab5_858429.pdf.pdf', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/22146e80-42ed-4334-8a33-bc6c6be0aab5_858429.pdf.pdf', 91617, 'application/pdf', 'pdf', '', 1, '2025-10-24 10:14:18', 1),
(59, '8a50ed65-1520-419e-bae8-e42a879eabf7_864688.xlsx.xlsx', 'Liquidacion Jhon Jairo.xlsx', 13, '/RRHH/RENUNCIA TRABAJADORES/JHON JAIRO HERRERA/8a50ed65-1520-419e-bae8-e42a879eabf7_864688.xlsx.xlsx', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/file-system/8a50ed65-1520-419e-bae8-e42a879eabf7_864688.xlsx.xlsx', 9930, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', '', 1, '2025-10-24 10:14:24', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libro_gastos_facturacion`
--

CREATE TABLE `libro_gastos_facturacion` (
  `id` int NOT NULL,
  `year` int NOT NULL,
  `mes` varchar(20) NOT NULL,
  `numero_facturacion` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `cliente` varchar(255) NOT NULL,
  `servicio` varchar(255) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `valor` decimal(12,2) NOT NULL,
  `iva` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `libro_gastos_facturacion`
--

INSERT INTO `libro_gastos_facturacion` (`id`, `year`, `mes`, `numero_facturacion`, `fecha`, `cliente`, `servicio`, `nit`, `valor`, `iva`, `total`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 2025, 'FEBRERO', '49', '2025-02-06', 'Mercantil Galerazamba & CIA SAS', 'oficios varios', '860522583-3', '5146500.00', NULL, '5146500.00', '2025-10-21 04:49:00', 1, NULL),
(2, 2025, 'FEBRERO', '50', '2025-02-06', 'Inmobiliaria Baru SAS en Liquidacion', 'oficios varios', '900695115-5', '15439500.00', NULL, '15439500.00', '2025-10-21 04:49:00', 1, NULL),
(3, 2025, 'FEBRERO', '51', '2025-02-10', 'Cementos Argos SAS', 'Cerca', '890100251-0', '20000000.00', NULL, '20000000.00', '2025-10-21 04:49:00', 1, NULL),
(4, 2025, 'FEBRERO', '52', '2025-02-17', 'Cementos Argos SAS', 'Cerca', '890100251-0', '20000000.00', NULL, '20000000.00', '2025-10-21 04:49:00', 1, NULL),
(5, 2025, 'MARZO', '53', '2025-03-25', 'Smart', 'equipos apoyo Joa', '900085539', '24593669.00', '406330.00', '24999999.00', '2025-10-21 04:49:00', 1, NULL),
(6, 2025, 'MARZO', '54', '2025-03-25', 'Cementos Argos SAS', 'Cerca', '890100251-0', '9955001.00', '122866.00', '10077867.00', '2025-10-21 04:49:00', 1, NULL),
(7, 2025, 'ABRIL', '55', '2025-04-02', 'Mercantil Galerazamba & CIA SAS', 'oficios varios', '860522583-3', '5146500.00', NULL, '5146500.00', '2025-10-21 04:49:00', 1, NULL),
(8, 2025, 'ABRIL', '56', '2025-04-02', 'Inmobiliaria Baru SAS en Liquidacion', 'oficios varios', '900695115-5', '20586001.00', NULL, '20586001.00', '2025-10-21 04:49:00', 1, NULL),
(9, 2025, 'ABRIL', '57', '2025-04-02', 'Mercantil Galerazamba & CIA SAS', 'oficios varios', '860522583-3', '5146500.00', NULL, '5146500.00', '2025-10-21 04:49:00', 1, NULL),
(10, 2025, 'ABRIL', '58', '2025-04-02', 'Inmobiliaria Baru SAS en Liquidacion', 'oficios varios', '900695115-5', '20586001.00', NULL, '20586001.00', '2025-10-21 04:49:00', 1, NULL),
(11, 2025, 'ABRIL', '59', '2025-04-02', 'Cementos Argos SAS', 'Cerca', '890100251-0', '3570000.00', NULL, '3570000.00', '2025-10-21 04:49:00', 1, NULL),
(12, 2025, 'ABRIL', '60', '2025-04-15', 'Cementos Argos SAS', 'oficios varios', '890100251-0', '5146500.00', NULL, '5146500.00', '2025-10-21 04:49:00', 1, NULL),
(13, 2025, 'MAYO', '61', '2025-05-01', 'Inmobiliaria Baru SAS en Liquidacion', 'oficios varios', '900695115-5', '20586001.00', NULL, '20586001.00', '2025-10-21 04:49:00', 1, NULL),
(14, 2025, 'MAYO', '62', '2025-05-01', 'Mercantil Galerazamba & CIA SAS', 'oficios varios', '860522583-2', '20586001.00', NULL, '20586001.00', '2025-10-21 04:49:00', 1, NULL),
(15, 2025, 'MAYO', '63', '2025-05-01', 'Mercantil Galerazamba & CIA SAS', 'oficios varios', '860522583-3', '5146500.00', NULL, '5146500.00', '2025-10-21 04:49:00', 1, NULL),
(16, 2025, 'MAYO', '64', '2025-05-08', 'Cementos Argos SAS', 'oficios varios', '890100251-0', '5146500.00', NULL, '5146500.00', '2025-10-21 04:49:00', 1, NULL),
(17, 2025, 'MAYO', '65', '2025-05-28', 'concretos argos', 'cercado', '860350697-4', '11953920.00', NULL, '11953920.00', '2025-10-21 04:49:00', 1, NULL),
(18, 2025, 'JUNIO', '66', '2025-06-03', 'Zona Franca Argos', 'Lancha', '900164755-0', '3700000.00', NULL, '3700000.00', '2025-10-21 04:49:00', 1, NULL),
(19, 2025, 'JUNIO', '67', '2025-06-03', 'Inmobiliaria Baru', 'Oficios Varios', '900695115-5', '20202160.00', NULL, '20202160.00', '2025-10-21 04:49:00', 1, NULL),
(20, 2025, 'JUNIO', '68', '2025-06-03', 'Mercantil Galera Zamba ', 'Oficios Varios', '860522583-2', '5050540.00', NULL, '5050540.00', '2025-10-21 04:49:00', 1, NULL),
(21, 2025, 'JUNIO', '69', '2025-06-05', 'Cementos Argos ', 'Oficios Varios', '890100251-0', '10101080.00', NULL, '10101080.00', '2025-10-21 04:49:00', 1, NULL),
(22, 2025, 'JUNIO', '70', '2025-06-08', 'Concretos Argos', 'Cercados', '860350697-4', '11772221.00', NULL, '11772221.00', '2025-10-21 04:49:00', 1, NULL),
(23, 2025, 'JUNIO', '71', '2025-06-10', 'Cementos Argos ', 'Cercados', '890100251-0', '11772221.00', NULL, '11772221.00', '2025-10-21 04:49:00', 1, NULL),
(24, 2025, 'AGOSTO', '72', '2025-08-13', 'Cementos Argos', 'Lancha', '890100251-0', '3500000.00', NULL, '3500000.00', '2025-10-21 04:49:00', 1, NULL),
(25, 2025, 'AGOSTO', '73', '2025-08-13', 'Mercantil Galera Zamba Junio', 'Oficios Varios', '860522583-2', '5050540.00', NULL, '5050540.00', '2025-10-21 04:49:00', 1, NULL),
(26, 2025, 'AGOSTO', '74', '2025-08-13', 'Inmobiliaria Baru Junio', 'Oficios Varios', '900695115-5', '20202160.00', NULL, '20202160.00', '2025-10-21 04:49:00', 1, NULL),
(27, 2025, 'AGOSTO', '75', '2025-08-13', 'Mercantil Galera Zamba Julio', 'Oficios Varios', '860522583-2', '5050540.00', NULL, '5050540.00', '2025-10-21 04:49:00', 1, NULL),
(28, 2025, 'AGOSTO', '76', '2025-08-13', 'Inmobiliaria Baru Julio', 'Oficios Varios', '900695115-5', '20202160.00', NULL, '20202160.00', '2025-10-21 04:49:00', 1, NULL),
(29, 2025, 'AGOSTO', '77', '2025-08-20', 'Cementos Argos (Remplaza)', 'Oficios Varios', '890100251-0', '12626350.00', NULL, '12626350.00', '2025-10-21 04:49:00', 1, NULL),
(30, 2025, 'AGOSTO', '78', '2025-08-29', 'Cementos Argos', 'Obra infanteria Argos', '890100251-0', '119796144.00', '989620.00', '120785764.00', '2025-10-21 04:49:00', 1, NULL),
(31, 2025, 'AGOSTO', '79', '2025-08-30', 'Cementos Argos', 'Obra infanteria Argos', '890100251-1', '105296553.00', '869841.00', '106166394.00', '2025-10-21 04:49:00', 1, NULL),
(32, 2025, 'SEPTIEMBRE', '80', '2025-09-02', 'Cementos Argos', 'Oficios Varios', '890100251-0', '15151620.00', '287880.00', '15439500.00', '2025-10-21 04:49:00', 1, NULL),
(33, 2025, 'SEPTIEMBRE', '81', '2025-09-02', 'Cementos Argos', 'Oficios Varios', '860522583-2', '12626350.00', '239900.00', '12866250.00', '2025-10-21 04:49:00', 1, NULL),
(34, 2025, 'SEPTIEMBRE', '82', '2025-09-16', 'Inmobiliaria Baru Julio', 'Oficios Varios', '900695115-5', '15151620.00', NULL, '15151620.00', '2025-10-21 04:49:00', 1, NULL),
(35, 2025, 'SEPTIEMBRE', '83', '2025-09-16', 'Mercantil Galera Zamba Julio', 'Oficios Varios', '860522583-2', '5050540.00', NULL, '5050540.00', '2025-10-21 04:49:00', 1, NULL),
(36, 2025, 'SEPTIEMBRE', '84', '2025-09-26', 'Cementos Argos', 'Obra infanteria Argos', '890100251-0', '119796144.00', '989620.00', '120785764.00', '2025-10-21 04:49:00', 1, NULL),
(37, 2025, 'SEPTIEMBRE', '85', '2025-09-26', 'Cementos Argos', 'Obra infanteria Argos', '890100251-0', '105296553.00', '869841.00', '106166394.00', '2025-10-21 04:49:00', 1, NULL),
(38, 2025, 'SEPTIEMBRE', '86', '2025-09-30', 'Cementos Argos', 'Vaquuero Ganado', '890100251-0', '5050540.00', '95960.26', '5146500.26', '2025-10-21 04:49:00', 1, NULL),
(39, 2025, 'SEPTIEMBRE', '87', '2025-09-30', 'Cementos Argos', 'Nispero', '890100251-0', '5050540.00', '95960.26', '5146500.26', '2025-10-21 04:49:00', 1, NULL),
(40, 2025, 'SEPTIEMBRE', '88', '2025-09-30', 'Cementos Argos', 'San Juan ', '890100251-0', '5050540.00', '95960.26', '5146500.26', '2025-10-21 04:49:00', 1, NULL),
(41, 2025, 'SEPTIEMBRE', '89', '2025-09-30', 'Cementos Argos', 'Varios Cercado', '890100251-0', '700000.00', '13300.00', '713300.00', '2025-10-21 04:49:00', 1, NULL),
(42, 2025, 'SEPTIEMBRE', '90', '2025-09-02', 'Cementos Argos', 'Oficios Varios', '890100251-0', '15151620.00', '287880.00', '15439500.00', '2025-10-21 04:49:00', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payroll_mes_a_mes`
--

CREATE TABLE `payroll_mes_a_mes` (
  `id` int NOT NULL,
  `year` int NOT NULL,
  `mes` varchar(20) NOT NULL,
  `fecha` date NOT NULL,
  `proveedor` varchar(255) NOT NULL,
  `pago` decimal(12,2) NOT NULL,
  `objeto` varchar(255) NOT NULL,
  `valor_neto` decimal(12,2) NOT NULL,
  `iva` decimal(12,2) DEFAULT '0.00',
  `retencion` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `numero_factura` varchar(50) NOT NULL,
  `obra` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_ausencia`
--

CREATE TABLE `tipos_ausencia` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `es_remunerada` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `tipos_ausencia`
--

INSERT INTO `tipos_ausencia` (`id`, `nombre`, `descripcion`, `es_remunerada`, `is_active`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 'Vacaciones', 'Días de descanso por vacaciones anuales', 1, 1, '2025-10-20 21:30:56', 1, NULL),
(2, 'Enfermedad General', 'Incapacidad por enfermedad común', 1, 1, '2025-10-20 21:30:56', 1, NULL),
(3, 'Enfermedad Laboral', 'Incapacidad por accidente o enfermedad laboral', 1, 1, '2025-10-20 21:30:56', 1, NULL),
(4, 'Maternidad', 'Licencia de maternidad', 1, 1, '2025-10-20 21:30:56', 1, NULL),
(5, 'Paternidad', 'Licencia de paternidad', 1, 1, '2025-10-20 21:30:56', 1, NULL),
(6, 'Duelo', 'Licencia por fallecimiento de familiar', 1, 1, '2025-10-20 21:30:56', 1, NULL),
(7, 'Permiso No Remunerado', 'Permiso sin goce de salario', 0, 1, '2025-10-20 21:30:56', 1, NULL),
(8, 'Permiso Personal', 'Permiso por asuntos personales', 0, 1, '2025-10-20 21:30:56', 1, NULL),
(9, 'No Presentado', 'Ausencia sin justificación - no se presentó a trabajar', 0, 1, '2025-10-20 21:30:56', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transferencias_pagos`
--

CREATE TABLE `transferencias_pagos` (
  `id` int NOT NULL,
  `year` int NOT NULL,
  `mes` varchar(20) NOT NULL,
  `fecha` date NOT NULL,
  `actividad` varchar(255) NOT NULL,
  `sale` decimal(12,2) DEFAULT '0.00',
  `entra` decimal(12,2) DEFAULT '0.00',
  `saldo` decimal(12,2) DEFAULT '0.00',
  `concepto` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `transferencias_pagos`
--

INSERT INTO `transferencias_pagos` (`id`, `year`, `mes`, `fecha`, `actividad`, `sale`, `entra`, `saldo`, `concepto`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 2025, 'ENERO', '2025-01-01', 'Pasan', NULL, NULL, '81241825.03', NULL, '2025-10-21 04:32:13', 1, NULL),
(2, 2025, 'ENERO', '2025-01-09', 'ABONO INTERESES AHORROS', NULL, '2003.22', '81243828.25', NULL, '2025-10-21 04:32:13', 1, NULL),
(3, 2025, 'ENERO', '2025-01-10', 'IMPTO GOBIERNO 4*1000', '56.80', NULL, '81243771.45', NULL, '2025-10-21 04:32:13', 1, NULL),
(4, 2025, 'ENERO', '2025-01-10', 'CUOTA DE MANEJO TARJETO DEBITO', '14200.00', NULL, '81229571.45', NULL, '2025-10-21 04:32:13', 1, NULL),
(5, 2025, 'ENERO', '2025-01-12', 'ABONO INTERESES AHORROS', NULL, '667.62', '81230239.07', NULL, '2025-10-21 04:32:13', 1, NULL),
(6, 2025, 'ENERO', '2025-01-01', 'Pasan', NULL, NULL, '81241825.03', NULL, '2025-10-21 04:47:46', 1, NULL),
(7, 2025, 'ENERO', '2025-01-09', 'ABONO INTERESES AHORROS', NULL, '2003.22', '81243828.25', NULL, '2025-10-21 04:47:46', 1, NULL),
(8, 2025, 'ENERO', '2025-01-10', 'IMPTO GOBIERNO 4*1000', '56.80', NULL, '81243771.45', NULL, '2025-10-21 04:47:46', 1, NULL),
(9, 2025, 'ENERO', '2025-01-10', 'CUOTA DE MANEJO TARJETO DEBITO', '14200.00', NULL, '81229571.45', NULL, '2025-10-21 04:47:46', 1, NULL),
(10, 2025, 'ENERO', '2025-01-12', 'ABONO INTERESES AHORROS', NULL, '667.62', '81230239.07', NULL, '2025-10-21 04:47:46', 1, NULL),
(11, 2025, 'ENERO', '2025-01-13', 'IMPTO GOBIERNO 4*1000', '3200.00', NULL, '81227039.07', NULL, '2025-10-21 04:47:46', 1, NULL),
(12, 2025, 'ENERO', '2025-01-13', 'trasferencia Pymes Diego..', '800000.00', NULL, '80427039.07', 'Comicion', '2025-10-21 04:47:46', 1, NULL),
(13, 2025, 'ENERO', '2025-01-14', 'ABONO INTERESES AHORROS', NULL, '440.68', '80427479.75', NULL, '2025-10-21 04:47:46', 1, NULL),
(14, 2025, 'ENERO', '2025-01-15', 'IMPTO GOBIERNO 4*1000', '9960.84', NULL, '80417518.91', NULL, '2025-10-21 04:47:46', 1, NULL),
(15, 2025, 'ENERO', '2025-01-15', 'Nomina trasferencia pymes', '830070.00', NULL, '79587448.91', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(16, 2025, 'ENERO', '2025-01-15', 'Nomina trasferencia pymes', '830070.00', NULL, '78757378.91', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(17, 2025, 'ENERO', '2025-01-15', 'Nomina trasferencia pymes', '830070.00', NULL, '77927308.91', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(18, 2025, 'ENERO', '2025-01-21', 'ABONO INTERESES AHORROS', NULL, '1494.49', '77928803.40', NULL, '2025-10-21 04:47:46', 1, NULL),
(19, 2025, 'ENERO', '2025-01-22', 'ABONO INTERESES AHORROS', NULL, '213.15', '77929016.55', NULL, '2025-10-21 04:47:46', 1, NULL),
(20, 2025, 'ENERO', '2025-01-22', 'IMPTO GOBIERNO 4*1000', '508.00', NULL, '77928508.55', NULL, '2025-10-21 04:47:46', 1, NULL),
(21, 2025, 'ENERO', '2025-01-22', 'trasferencia Pymes EXAMENES VALENTINA', '127000.00', NULL, '77801508.55', 'Examen medico', '2025-10-21 04:47:46', 1, NULL),
(22, 2025, 'ENERO', '2025-01-23', 'pago proveerdor Argos', NULL, '7023264.00', '84824772.55', NULL, '2025-10-21 04:47:46', 1, NULL),
(23, 2025, 'ENERO', '2025-01-27', 'ABONO INTERESES AHORROS', NULL, '1.16', '84825934.50', NULL, '2025-10-21 04:47:46', 1, NULL),
(24, 2025, 'ENERO', '2025-01-28', 'IMPTO GOBIERNO 4*1000', '11512.00', NULL, '84814422.50', NULL, '2025-10-21 04:47:46', 1, NULL),
(25, 2025, 'ENERO', '2025-01-28', 'COMPRA EN ALKOSTO BA', '2878000.00', NULL, '81936422.50', 'Computador e Impresora', '2025-10-21 04:47:46', 1, NULL),
(26, 2025, 'ENERO', '2025-01-29', 'ABONO INTERESES AHORROS', NULL, '448.96', '81936871.46', NULL, '2025-10-21 04:47:46', 1, NULL),
(27, 2025, 'ENERO', '2025-01-30', 'ABONO INTERESES AHORROS', NULL, '221.21', '81937092.67', NULL, '2025-10-21 04:47:46', 1, NULL),
(28, 2025, 'ENERO', '2025-01-30', 'IMPTO GOBIERNO 4*1000', '4758.00', NULL, '81932334.67', NULL, '2025-10-21 04:47:46', 1, NULL),
(29, 2025, 'ENERO', '2025-01-30', 'COMPRA EN TAURO PAPE', '83700.00', NULL, '81848634.67', NULL, '2025-10-21 04:47:46', 1, NULL),
(30, 2025, 'ENERO', '2025-01-30', 'TRANSFERENCIA VIRTUAL PYME', '1105800.00', NULL, '80742834.67', 'Aportes en Linea', '2025-10-21 04:47:46', 1, NULL),
(31, 2025, 'ENERO', '2025-01-31', 'ABONO INTERESES AHORROS', NULL, '215.70', '80743050.37', NULL, '2025-10-21 04:47:46', 1, NULL),
(32, 2025, 'ENERO', '2025-01-31', 'IMPTO GOBIERNO 4*1000', '8010.17', NULL, '80735040.20', NULL, '2025-10-21 04:47:46', 1, NULL),
(33, 2025, 'ENERO', '2025-01-31', 'TRANSFERENCIA VIRTUAL PYME RELOJ GUILLO', '1299000.00', NULL, '79436040.20', 'Regalo Gillermo', '2025-10-21 04:47:46', 1, NULL),
(34, 2025, 'ENERO', '2025-01-31', 'TRANSFERENCIA VIRTUAL PYME', '216500.00', NULL, '79219540.20', 'Pago camara comercio', '2025-10-21 04:47:46', 1, NULL),
(35, 2025, 'ENERO', '2025-01-31', 'TRANSFERENCIA VIRTUAL PYME', '487044.00', NULL, '78732496.20', 'pago nomina Valentina', '2025-10-21 04:47:46', 1, NULL),
(36, 2025, 'FEBRERO', '2025-02-01', 'IMPTO GOBIERNO 4*1000', '14635.00', NULL, '78717860.24', NULL, '2025-10-21 04:47:46', 1, NULL),
(37, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', '650000.00', NULL, '78067860.24', 'Pago de Marta', '2025-10-21 04:47:46', 1, NULL),
(38, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', '836330.00', NULL, '77231530.24', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(39, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', '500000.00', NULL, '76731530.24', 'Pago de Ana', '2025-10-21 04:47:46', 1, NULL),
(40, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', '836330.00', NULL, '75895200.24', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(41, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', '836330.00', NULL, '75058870.24', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(42, 2025, 'FEBRERO', '2025-02-03', 'ABONO INTERESES AHORROS', NULL, '616.00', '75059487.16', NULL, '2025-10-21 04:47:46', 1, NULL),
(43, 2025, 'FEBRERO', '2025-02-04', 'ABONO INTERESES AHORROS', NULL, '203.00', '75059691.15', NULL, '2025-10-21 04:47:46', 1, NULL),
(44, 2025, 'FEBRERO', '2025-02-04', 'IMPTO GOBIERNO 4*1000', '2400.00', NULL, '75057291.15', NULL, '2025-10-21 04:47:46', 1, NULL),
(45, 2025, 'FEBRERO', '2025-02-04', 'TRANSFERENCIA VIRTUAL PYME', '600000.00', NULL, '74457291.15', NULL, '2025-10-21 04:47:46', 1, NULL),
(46, 2025, 'FEBRERO', '2025-02-05', 'ABONO INTERESES AHORROS', NULL, '203.00', '74457494.77', NULL, '2025-10-21 04:47:46', 1, NULL),
(47, 2025, 'FEBRERO', '2025-02-05', 'IMPTO GOBIERNO 4*1000', '536.00', NULL, '74456958.77', NULL, '2025-10-21 04:47:46', 1, NULL),
(48, 2025, 'FEBRERO', '2025-02-05', 'TRANSFERENCIA VIRTUAL PYME', '134000.00', NULL, '74322958.77', 'Pago de Imp. Ana', '2025-10-21 04:47:46', 1, NULL),
(49, 2025, 'FEBRERO', '2025-02-06', 'PAGO DE POV ZONA FRANCA ARG', NULL, '23431200.00', '97754158.77', NULL, '2025-10-21 04:47:46', 1, NULL),
(50, 2025, 'FEBRERO', '2025-02-09', 'ABONO INTERESES AHORROS', NULL, '1071.27', '97755230.04', NULL, '2025-10-21 04:47:46', 1, NULL),
(51, 2025, 'FEBRERO', '2025-02-10', 'PAGO DE POV ROSALES SAS', NULL, '28093596.00', '125848826.04', NULL, '2025-10-21 04:47:46', 1, NULL),
(52, 2025, 'FEBRERO', '2025-02-11', 'ABONO INTERESES AHORROS', NULL, '1034.36', '125849860.40', NULL, '2025-10-21 04:47:46', 1, NULL),
(53, 2025, 'FEBRERO', '2025-02-12', 'IMPTO GOBIERNO 4*1000', '5218.40', NULL, '125844642.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(54, 2025, 'FEBRERO', '2025-02-12', 'TRANSFERENCIA VIRTUAL PYME', '1304600.00', NULL, '124540042.00', 'Aportes en Linea', '2025-10-21 04:47:46', 1, NULL),
(55, 2025, 'FEBRERO', '2025-02-13', 'ABONO INTERESES AHORROS', NULL, '1023.61', '124541065.61', NULL, '2025-10-21 04:47:46', 1, NULL),
(56, 2025, 'FEBRERO', '2025-02-14', 'IMPTO GOBIERNO 4*1000', '16357.16', NULL, '124524708.45', NULL, '2025-10-21 04:47:46', 1, NULL),
(57, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '123694638.45', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(58, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', '754810.00', NULL, '122939828.45', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(59, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '122109758.45', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(60, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '121279688.45', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(61, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '120449618.45', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(62, 2025, 'FEBRERO', '2025-02-14', 'CUOTA DE MANEJO TARJETA DEBITO', '14200.00', NULL, '120435418.45', NULL, '2025-10-21 04:47:46', 1, NULL),
(63, 2025, 'FEBRERO', '2025-02-15', 'ABONO INTERESES AHORROS', NULL, '989.00', '120436408.33', NULL, '2025-10-21 04:47:46', 1, NULL),
(64, 2025, 'FEBRERO', '2025-02-16', 'ABONO INTERESES AHORROS', NULL, '490.24', '120436898.57', NULL, '2025-10-21 04:47:46', 1, NULL),
(65, 2025, 'FEBRERO', '2025-02-16', 'IMPTO GOBIERNO 4*1000', '4557.20', NULL, '120432341.37', NULL, '2025-10-21 04:47:46', 1, NULL),
(66, 2025, 'FEBRERO', '2025-02-16', 'COMPRA EN HOMCENTER', '1139300.00', NULL, '119293041.37', NULL, '2025-10-21 04:47:46', 1, NULL),
(67, 2025, 'FEBRERO', '2025-02-17', 'IMPTO GOBIERNO 4*1000', '1601.00', NULL, '119291439.57', NULL, '2025-10-21 04:47:46', 1, NULL),
(68, 2025, 'FEBRERO', '2025-02-17', 'COMPRA EN CARLOS SUA', '400450.00', NULL, '118890989.57', 'Almuerzos bey routh 93', '2025-10-21 04:47:46', 1, NULL),
(69, 2025, 'FEBRERO', '2025-02-19', 'ABONO INTERESES AHORROS', NULL, '1465.00', '118892455.34', NULL, '2025-10-21 04:47:46', 1, NULL),
(70, 2025, 'FEBRERO', '2025-02-20', 'IMPTO GOBIERNO 4*1000', '959.20', NULL, '118891496.14', NULL, '2025-10-21 04:47:46', 1, NULL),
(71, 2025, 'FEBRERO', '2025-02-20', 'COMPRA EN HOMCENTER', '239800.00', NULL, '118651696.14', NULL, '2025-10-21 04:47:46', 1, NULL),
(72, 2025, 'FEBRERO', '2025-02-23', 'ABONO INTERESES AHORROS', NULL, '1950.43', '118653646.57', NULL, '2025-10-21 04:47:46', 1, NULL),
(73, 2025, 'FEBRERO', '2025-02-24', 'IMPTO GOBIERNO 4*1000', '3829.20', NULL, '118649817.37', NULL, '2025-10-21 04:47:46', 1, NULL),
(74, 2025, 'FEBRERO', '2025-02-24', 'TRANSFERENCIA VIRTUAL PYME', '957300.00', NULL, '117692517.37', 'Compra de Dotacion', '2025-10-21 04:47:46', 1, NULL),
(75, 2025, 'FEBRERO', '2025-02-27', 'ABONO INTERESES AHORROS', NULL, '1934.00', '117694452.03', NULL, '2025-10-21 04:47:46', 1, NULL),
(76, 2025, 'FEBRERO', '2025-02-28', 'ABONO INTERESES AHORROS', NULL, '466.00', '117694918.89', NULL, '2025-10-21 04:47:46', 1, NULL),
(77, 2025, 'FEBRERO', '2025-02-28', 'IMPTO GOBIERNO 4*1000', '16300.36', NULL, '117678618.53', NULL, '2025-10-21 04:47:46', 1, NULL),
(78, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '116848548.53', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(79, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '116018478.53', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(80, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', '754810.00', NULL, '115263668.53', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(81, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '114433598.53', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(82, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', '830070.00', NULL, '113603528.53', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(83, 2025, 'MARZO', '2025-03-06', 'ABONO INTERESES AHORROS', NULL, '2801.18', '113606329.71', NULL, '2025-10-21 04:47:46', 1, NULL),
(84, 2025, 'MARZO', '2025-03-07', 'IMPTO GOBIERNO 4*1000', '904.40', NULL, '113605425.31', NULL, '2025-10-21 04:47:46', 1, NULL),
(85, 2025, 'MARZO', '2025-03-07', 'COMPRA EN HOMECENTER', '226100.00', NULL, '113379325.31', 'casa policia', '2025-10-21 04:47:46', 1, NULL),
(86, 2025, 'MARZO', '2025-03-09', 'ABONO INTERESES AHORROS', NULL, '1397.82', '113380723.13', NULL, '2025-10-21 04:47:46', 1, NULL),
(87, 2025, 'MARZO', '2025-03-10', 'PAGO DE PROV ROSALES SAS', NULL, '5133965.00', '118514688.13', NULL, '2025-10-21 04:47:46', 1, NULL),
(88, 2025, 'MARZO', '2025-03-12', 'ABONO INTERESES AHORROS', NULL, '1461.13', '118516149.26', NULL, '2025-10-21 04:47:46', 1, NULL),
(89, 2025, 'MARZO', '2025-03-12', 'ABONO INTERESES AHORROS', NULL, '486.43', '118516635.69', NULL, '2025-10-21 04:47:46', 1, NULL),
(90, 2025, 'MARZO', '2025-03-13', 'IMPTO GOBIERNO 4*1000', '602.67', NULL, '118516033.02', NULL, '2025-10-21 04:47:46', 1, NULL),
(91, 2025, 'MARZO', '2025-03-13', 'COMPRA EN ASADOS DON', '150669.00', NULL, '118365364.02', 'ALMUERZO CONGUILLO', '2025-10-21 04:47:46', 1, NULL),
(92, 2025, 'MARZO', '2025-03-13', 'ABONO INTERESES AHORROS', NULL, '486.37', '118365850.39', NULL, '2025-10-21 04:47:46', 1, NULL),
(93, 2025, 'MARZO', '2025-03-14', 'IMPTO GOBIERNO 4*1000', '56.80', NULL, '118365793.59', NULL, '2025-10-21 04:47:46', 1, NULL),
(94, 2025, 'MARZO', '2025-03-14', 'CUOTA MANEJO TARJETA DEBITO', '14200.00', NULL, '118351593.59', NULL, '2025-10-21 04:47:46', 1, NULL),
(95, 2025, 'MARZO', '2025-03-14', 'IMPTO GOBIERNO 4*1000', '16300.36', NULL, '118335293.23', NULL, '2025-10-21 04:47:46', 1, NULL),
(96, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '830070.00', NULL, '117505223.23', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(97, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '830070.00', NULL, '116675153.23', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(98, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '754810.00', NULL, '115920343.23', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(99, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '830070.00', NULL, '115090273.23', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(100, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '830070.00', NULL, '114260203.23', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(101, 2025, 'MARZO', '2025-03-19', 'ABONO INTERESES AHORROS', NULL, '2347.81', '114262551.04', NULL, '2025-10-21 04:47:46', 1, NULL),
(102, 2025, 'MARZO', '2025-03-20', 'IMPTO GOBIERNO 4*1000', '18000.00', NULL, '114244551.04', NULL, '2025-10-21 04:47:46', 1, NULL),
(103, 2025, 'MARZO', '2025-03-20', 'TRANSFERENCIA CTA SUC VIRTUAL', '1500000.00', NULL, '112744551.04', 'lanchas', '2025-10-21 04:47:46', 1, NULL),
(104, 2025, 'MARZO', '2025-03-20', 'TRANSFERENCIA CTA SUC VIRTUAL', '3000000.00', NULL, '109744551.04', 'casa policia', '2025-10-21 04:47:46', 1, NULL),
(105, 2025, 'MARZO', '2025-03-24', 'ABONO INTERESES AHORROS', NULL, '2255.02', '109746806.06', NULL, '2025-10-21 04:47:46', 1, NULL),
(106, 2025, 'MARZO', '2025-03-25', 'IMPTO GOBIERNO 4*1000', '93053.26', NULL, '109653752.80', NULL, '2025-10-21 04:47:46', 1, NULL),
(107, 2025, 'MARZO', '2025-03-25', 'COMPREA EN M COCINA A', '263315.00', NULL, '109390437.80', 'Almuerzo juan Pablo', '2025-10-21 04:47:46', 1, NULL),
(108, 2025, 'MARZO', '2025-03-25', 'TRANSFERENCIA CTA SUC VIRTUAL', '23000000.00', NULL, '86390437.80', 'Pago Joao', '2025-10-21 04:47:46', 1, NULL),
(109, 2025, 'MARZO', '2025-03-27', 'ABONO INTERESES AHORROS', NULL, '710.04', '86391147.84', NULL, '2025-10-21 04:47:46', 1, NULL),
(110, 2025, 'MARZO', '2025-03-28', 'PAGO INTERBANC SMART DEVELOPME', NULL, '24508127.00', '110899274.84', NULL, '2025-10-21 04:47:46', 1, NULL),
(111, 2025, 'MARZO', '2025-03-28', 'ABONO INTERESES AHORROS', NULL, '451.05', '110899725.89', NULL, '2025-10-21 04:47:46', 1, NULL),
(112, 2025, 'MARZO', '2025-03-28', 'IMPTO GOBIERNO 4*1000', '4553.72', NULL, NULL, NULL, '2025-10-21 04:47:46', 1, NULL),
(113, 2025, 'MARZO', '2025-03-28', 'COMPRA EN PARMESSANO', '138432.00', NULL, '110756740.17', 'ALMUERZO CONGUILLO', '2025-10-21 04:47:46', 1, NULL),
(114, 2025, 'MARZO', '2025-03-28', 'TRANSFERENCIA CTA SUC VIRTUAL', '1000000.00', NULL, '109756740.17', 'Pago Joao', '2025-10-21 04:47:46', 1, NULL),
(115, 2025, 'MARZO', '2025-03-29', 'IMPTO GOBIERNO 4*1000', '15708.76', NULL, '109741031.41', NULL, '2025-10-21 04:47:46', 1, NULL),
(116, 2025, 'MARZO', '2025-03-29', 'COMPREA EN TIENDA ALT', '136100.00', NULL, '109604931.41', NULL, '2025-10-21 04:47:46', 1, NULL),
(117, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '1656900.00', NULL, '108039031.41', 'aportes en linea', '2025-10-21 04:47:46', 1, NULL),
(118, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '555583.00', NULL, '107483448.41', 'De res cartagena', '2025-10-21 04:47:46', 1, NULL),
(119, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '665203.00', NULL, '106818245.41', 'valentina', '2025-10-21 04:47:46', 1, NULL),
(120, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '652160.00', NULL, '106166085.41', 'Pasaje Guillermo medellin', '2025-10-21 04:47:46', 1, NULL),
(121, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '352245.00', NULL, '105813840.00', 'valentina', '2025-10-21 04:47:46', 1, NULL),
(122, 2025, 'MARZO', '2025-03-30', 'ABONO INTERESES AHORROS', NULL, '869.70', '105814710.11', NULL, '2025-10-21 04:47:46', 1, NULL),
(123, 2025, 'MARZO', '2025-03-31', 'ABONO INTERESES AHORROS', NULL, '423.15', '105815133.26', NULL, '2025-10-21 04:47:46', 1, NULL),
(124, 2025, 'MARZO', '2025-03-31', 'IMPTO GOBIERNO 4*1000', '11344.40', NULL, '105803788.86', NULL, '2025-10-21 04:47:46', 1, NULL),
(125, 2025, 'MARZO', '2025-03-31', 'TRANSFERENCIA CTA SUC VIRTUAL', '2211000.00', NULL, '103592788.86', 'obra baru', '2025-10-21 04:47:46', 1, NULL),
(126, 2025, 'MARZO', '2025-03-31', 'TRANSFERENCIA CTA SUC VIRTUAL', '625100.00', NULL, '102967688.86', 'camara de comercio', '2025-10-21 04:47:46', 1, NULL),
(127, 2025, 'ABRIL', '2025-04-01', 'Abono intereses ahorros ', NULL, '2729.00', '102967961.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(128, 2025, 'ABRIL', '2025-04-01', 'Impuesto gobierno 4x1000', '13281.00', NULL, '102954680.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(129, 2025, 'ABRIL', '2025-04-01', 'tranferencia CTA suc virtual', '830070.00', NULL, '102124610.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(130, 2025, 'ABRIL', '2025-04-01', 'tranferencia CTA suc virtual', '830070.00', NULL, '101294540.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(131, 2025, 'ABRIL', '2025-04-01', 'tranferencia CTA suc virtual', '830070.00', NULL, '100464470.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(132, 2025, 'ABRIL', '2025-04-01', 'tranferencia CTA suc virtual', '830070.00', NULL, '99634400.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(133, 2025, 'ABRIL', '2025-04-02', 'Abono intereses ahorros ', NULL, '271.00', '99634672.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(134, 2025, 'ABRIL', '2025-04-02', 'Impuesto gobierno 4x1000', '2400.00', NULL, '99632272.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(135, 2025, 'ABRIL', '2025-04-02', 'tranferencia CTA suc virtual', '600000.00', NULL, '99032272.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(136, 2025, 'ABRIL', '2025-04-03', 'pago proveedores cementos argos', NULL, '19261238.00', '118293510.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(137, 2025, 'ABRIL', '2025-04-03', 'Abono intereses ahorros ', NULL, '4861.00', '118293996.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(138, 2025, 'ABRIL', '2025-04-04', 'pago proveedor rosales sas', NULL, '18730078.00', '137024074.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(139, 2025, 'ABRIL', '2025-04-04', 'Abono intereses ahorros ', NULL, '5177.00', '137024591.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(140, 2025, 'ABRIL', '2025-04-04', 'Impuesto gobierno 4x1000', '44000.00', NULL, '136980591.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(141, 2025, 'ABRIL', '2025-04-04', 'tranferencia CTA suc virtual', '11000000.00', NULL, '125980591.00', 'abono deuda Juan Caputo', '2025-10-21 04:47:46', 1, NULL),
(142, 2025, 'ABRIL', '2025-04-05', 'Abono intereses ahorros ', NULL, '5119.00', '125981103.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(143, 2025, 'ABRIL', '2025-04-05', 'Impuesto gobierno 4x1000', '5600.00', NULL, '125975503.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(144, 2025, 'ABRIL', '2025-04-05', 'tranferencia CTA suc virtual', '1400000.00', NULL, '124575503.00', 'Ana Maria Contadora', '2025-10-21 04:47:46', 1, NULL),
(145, 2025, 'ABRIL', '2025-04-06', 'Impuesto gobierno 4x1000', '4868.00', NULL, '124575017.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(146, 2025, 'ABRIL', '2025-04-06', 'compra homecenter', '121700.00', NULL, '124453317.00', 'obra home center', '2025-10-21 04:47:46', 1, NULL),
(147, 2025, 'ABRIL', '2025-04-10', 'Abono intereses ahorros ', NULL, '2557.00', '124455874.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(148, 2025, 'ABRIL', '2025-04-11', 'pago proveedores rosales ', NULL, '14046086.00', '138501960.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(149, 2025, 'ABRIL', '2025-04-11', 'Abono intereses ahorros ', NULL, '5691.00', '138502529.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(150, 2025, 'ABRIL', '2025-04-11', 'Impuesto gobierno 4x1000', '5680.00', NULL, '138502472.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(151, 2025, 'ABRIL', '2025-04-11', 'Cuota de manejo tarjeta Deb', '14200.00', NULL, '138488272.00', 'cuota tarjeta debito', '2025-10-21 04:47:46', 1, NULL),
(152, 2025, 'ABRIL', '2025-04-12', 'Impuesto gobierno 4x1000', '6094.00', NULL, '1388482178.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(153, 2025, 'ABRIL', '2025-04-12', 'tranferencia CTA suc virtual', '1523500.00', NULL, '136958678.00', 'Aportes en linea', '2025-10-21 04:47:46', 1, NULL),
(154, 2025, 'ABRIL', '2025-04-14', 'Abono intereses ahorros ', NULL, '1688.00', '136960367.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(155, 2025, 'ABRIL', '2025-04-15', 'Abono intereses ahorros ', NULL, '5558.00', '136960922.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(156, 2025, 'ABRIL', '2025-04-15', 'Impuesto gobierno 4x1000', '6768.00', NULL, '136954154.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(157, 2025, 'ABRIL', '2025-04-15', 'tranferencia CTA suc virtual', '1692000.00', NULL, '135262154.00', 'Obra Casa', '2025-10-21 04:47:46', 1, NULL),
(158, 2025, 'ABRIL', '2025-04-16', 'Impuesto gobierno 4x1000', '13281.00', NULL, '135248873.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(159, 2025, 'ABRIL', '2025-04-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '134418803.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(160, 2025, 'ABRIL', '2025-04-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '133588733.00', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(161, 2025, 'ABRIL', '2025-04-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '132758663.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(162, 2025, 'ABRIL', '2025-04-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '131928593.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(163, 2025, 'ABRIL', '2025-04-20', 'Abono intereses ahorros ', NULL, '2710.00', '131931304.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(164, 2025, 'ABRIL', '2025-04-21', 'pago proveedores rosales ', NULL, '12317893.00', '144249197.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(165, 2025, 'ABRIL', '2025-04-21', 'Abono intereses ahorros ', NULL, '5928.00', '144249790.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(166, 2025, 'ABRIL', '2025-04-22', 'Abono intereses ahorros ', NULL, '5902.00', '144250380.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(167, 2025, 'ABRIL', '2025-04-22', 'Impuesto gobierno 4x1000', '2453.00', NULL, '144247927.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(168, 2025, 'ABRIL', '2025-04-22', 'tranferencia CTA suc virtual', '79700.00', NULL, '144168227.00', 'Obra piso', '2025-10-21 04:47:46', 1, NULL),
(169, 2025, 'ABRIL', '2025-04-22', 'tranferencia CTA suc virtual', '454000.00', NULL, '143714227.00', 'Compra construtec, cementos blanco ', '2025-10-21 04:47:46', 1, NULL),
(170, 2025, 'ABRIL', '2025-04-22', 'tranferencia CTA suc virtual', '79700.00', NULL, '143634527.00', 'Obra piso', '2025-10-21 04:47:46', 1, NULL),
(171, 2025, 'ABRIL', '2025-04-23', 'Abono intereses ahorros ', NULL, '5808.00', '143635108.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(172, 2025, 'ABRIL', '2025-04-23', 'Impuesto gobierno 4x1000', '9180.00', NULL, '143625928.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(173, 2025, 'ABRIL', '2025-04-23', 'tranferencia CTA suc virtual', '2295000.00', NULL, '141330928.00', 'Casa Ponal- enviado a Guillermo', '2025-10-21 04:47:46', 1, NULL),
(174, 2025, 'ABRIL', '2025-04-24', 'Impuesto gobierno 4x1000', '2452.00', NULL, '141328476.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(175, 2025, 'ABRIL', '2025-04-24', 'tranferencia CTA suc virtual', '73000.00', NULL, '141225476.00', 'Obra Cementos', '2025-10-21 04:47:46', 1, NULL),
(176, 2025, 'ABRIL', '2025-04-24', 'tranferencia CTA suc virtual', '540000.00', NULL, '140715476.00', 'Puerta ventana/ventana baño', '2025-10-21 04:47:46', 1, NULL),
(177, 2025, 'ABRIL', '2025-04-27', 'Abono intereses ahorros ', NULL, '2313.00', '140717789.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(178, 2025, 'ABRIL', '2025-04-28', 'pago proveedor cementos ', NULL, '9661238.00', '150379027.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(179, 2025, 'ABRIL', '2025-04-28', 'Abono intereses ahorros ', NULL, '6179.00', '150379645.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(180, 2025, 'ABRIL', '2025-04-29', 'Abono intereses ahorros ', NULL, '6161.00', '150380261.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(181, 2025, 'ABRIL', '2025-04-29', 'Impuesto gobierno 4x1000', '1760.00', NULL, '150378501.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(182, 2025, 'ABRIL', '2025-04-29', 'tranferencia CTA suc virtual', '440000.00', NULL, '149938501.00', 'Obra Ventanas', '2025-10-21 04:47:46', 1, NULL),
(183, 2025, 'ABRIL', '2025-04-30', 'Abono intereses ahorros ', NULL, '6123.00', '149939113.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(184, 2025, 'ABRIL', '2025-04-30', 'Impuesto gobierno 4x1000', '3681.00', NULL, '149935432.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(185, 2025, 'ABRIL', '2025-04-30', 'tranferencia CTA suc virtual', '920349.00', NULL, '149015083.00', 'Compra de porcelanato beige ', '2025-10-21 04:47:46', 1, NULL),
(186, 2025, 'MAYO', '2025-05-01', 'Abono intereses ahorros ', NULL, '612.00', '149015965.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(187, 2009, 'MAYO', '2009-05-02', 'Abono intereses ahorros ', NULL, '598.00', '149016294.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(188, 2025, 'MAYO', '2025-05-02', 'Impuesto gobierno 4x1000', '13281.00', NULL, '149003013.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(189, 2025, 'MAYO', '2025-05-02', 'tranferencia CTA suc virtual', '830070.00', NULL, '148172943.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(190, 2025, 'MAYO', '2025-05-02', 'tranferencia CTA suc virtual', '830070.00', NULL, '147342873.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(191, 2025, 'MAYO', '2025-05-02', 'tranferencia CTA suc virtual', '830070.00', NULL, '146512803.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(192, 2025, 'MAYO', '2025-05-02', 'tranferencia CTA suc virtual', '830070.00', NULL, '145862733.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(193, 2025, 'MAYO', '2025-05-03', 'Impuesto gobierno 4x1000', '5600.00', NULL, '145677133.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(194, 2025, 'MAYO', '2025-05-03', 'tranferencia CTA suc virtual', '1400000.00', NULL, '144277133.00', 'Ventanas baru', '2025-10-21 04:47:46', 1, NULL),
(195, 2025, 'MAYO', '2025-05-04', 'Abono intereses ahorros ', NULL, '1185.00', '144278319.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(196, 2025, 'MAYO', '2025-05-05', 'pago de proveedor rosales sas', NULL, '15401895.00', '159680214.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(197, 2025, 'MAYO', '2025-05-07', 'Abono intereses ahorros ', NULL, '1968.00', '159682182.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(198, 2025, 'MAYO', '2025-05-08', 'Abono intereses ahorros ', NULL, '652.00', '159682834.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(199, 2025, 'MAYO', '2025-05-08', 'Impuesto gobierno 4x1000', NULL, '4000.00', '159678834.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(200, 2025, 'MAYO', '2025-05-08', 'tranferencia CTA suc virtual', NULL, '1000000.00', '158678834.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(201, 2025, 'MAYO', '2025-05-09', 'pago de proveedor rosales sas', NULL, '1535860.00', '160214694.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(202, 2025, 'MAYO', '2025-05-09', 'pago de proveedor rosales sas', NULL, '19000000.00', '179214694.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(203, 2025, 'MAYO', '2025-05-13', 'Abono intereses ahorros ', NULL, '3682.00', '179218377.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(204, 2025, 'MAYO', '2025-05-14', 'Impuesto gobierno 4x1000', '5680.00', NULL, '179218377.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(205, 2025, 'MAYO', '2025-05-14', 'Cuota de manejo tarheta Deb', '14200.00', NULL, '179204120.00', 'cuota tarjeta debito', '2025-10-21 04:47:46', 1, NULL),
(206, 2025, 'MAYO', '2025-05-15', 'Abono intereses ahorros ', NULL, '1472.00', '179205593.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(207, 2025, 'MAYO', '2025-05-16', 'pago de proveedor rosales sas', NULL, '10267930.00', '189473523.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(208, 2025, 'MAYO', '2025-05-16', 'Abono intereses ahorros ', NULL, '7649.00', '189474288.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(209, 2025, 'MAYO', '2025-05-16', 'Impuesto gobierno 4x1000', '13281.00', NULL, '189461007.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(210, 2025, 'MAYO', '2025-05-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '188630937.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(211, 2025, 'MAYO', '2025-05-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '187800867.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(212, 2025, 'MAYO', '2025-05-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '186970797.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(213, 2025, 'MAYO', '2025-05-16', 'tranferencia CTA suc virtual', '830070.00', NULL, '186140727.00', 'nomina', '2025-10-21 04:47:46', 1, NULL),
(214, 2025, 'MAYO', '2025-05-17', 'Impuesto gobierno 4x1000', '3485.00', NULL, '186137242.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(215, 2025, 'MAYO', '2025-05-17', 'compra homecenter', '871270.00', NULL, '185265972.00', 'Compra home center ', '2025-10-21 04:47:46', 1, NULL),
(216, 2025, 'MAYO', '2025-05-21', 'Abono intereses ahorros ', NULL, '3806.00', '185269779.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(217, 2025, 'MAYO', '2025-05-22', 'pago de proveedor cementos argos', NULL, '3338820.00', '188608599.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(218, 2025, 'MAYO', '2025-05-22', 'Impuesto gobierno 4x1000', '1400.00', NULL, '188607199.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(219, 2025, 'MAYO', '2025-05-22', 'tranferencia CTA suc virtual', '350000.00', NULL, '188257199.00', 'Compra puerta ventana ', '2025-10-21 04:47:46', 1, NULL),
(220, 2025, 'MAYO', '2025-05-25', 'Abono intereses ahorros ', NULL, '3094.00', '188260293.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(221, 2025, 'MAYO', '2025-05-26', 'Impuesto gobierno 4x1000', '10000.00', NULL, '188250293.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(222, 2025, 'MAYO', '2025-05-26', 'tranferencia CTA suc virtual', '2000000.00', NULL, '186250293.00', 'Lancha Cartagena', '2025-10-21 04:47:46', 1, NULL),
(223, 2025, 'MAYO', '2025-05-26', 'tranferencia CTA suc virtual', '500000.00', NULL, '185750293.00', 'Ana Maria Contadora', '2025-10-21 04:47:46', 1, NULL),
(224, 2025, 'MAYO', '2025-05-29', 'Abono intereses ahorros ', NULL, '3053.00', '185753347.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(225, 2025, 'MAYO', '2025-05-30', 'pago proveedores cementos argos', NULL, '4886851.00', '190640198.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(226, 2025, 'MAYO', '2025-05-30', 'pago proveedores rosales ', NULL, '5133965.00', '195774163.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(227, 2025, 'MAYO', '2025-05-30', 'Impuesto gobierno 4x1000', '48000.00', NULL, '195726163.00', 'Impuesto gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(228, 2025, 'MAYO', '2025-05-30', 'tranferencia CTA suc virtual', '12000000.00', NULL, '183726163.00', 'Varios/ lancha, casa cartagena policia, seguridad social', '2025-10-21 04:47:46', 1, NULL),
(229, 2025, 'MAYO', '2025-05-31', 'Abono intereses ahorros ', NULL, '1510.00', '183727673.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(230, 2025, 'JUNIO', '2025-06-01', 'Impuesto al gobierno 4x1000', '4000.00', NULL, '183723673.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(231, 2025, 'JUNIO', '2025-06-01', 'tranferencia CTA SUC VIRTUAL', '1000000.00', NULL, '182723673.00', 'Juan Pablo ', '2025-10-21 04:47:46', 1, NULL),
(232, 2025, 'JUNIO', '2025-06-02', 'abono intereses ahorros', NULL, '1501.00', '182725174.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(233, 2025, 'JUNIO', '2025-06-03', 'Pago Proveedores Cemnt Argos', NULL, '9860170.00', '192585344.00', 'Pago Proveedores Cemnt Argos', '2025-10-21 04:47:46', 1, NULL),
(234, 2025, 'JUNIO', '2025-06-03', 'Impuesto al gobierno 4x1000', '13281.00', NULL, '192572063.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(235, 2025, 'JUNIO', '2025-06-03', 'tranferencia CTA SUC VIRTUAL', '830070.00', NULL, '191741993.00', 'Pago Nomina', '2025-10-21 04:47:46', 1, NULL),
(236, 2025, 'JUNIO', '2025-06-03', 'tranferencia CTA SUC VIRTUAL', '830070.00', NULL, '190911923.00', 'Pago Nomina', '2025-10-21 04:47:46', 1, NULL),
(237, 2025, 'JUNIO', '2025-06-03', 'tranferencia CTA SUC VIRTUAL', '830070.00', NULL, '190081853.00', 'Pago Nomina', '2025-10-21 04:47:46', 1, NULL),
(238, 2025, 'JUNIO', '2025-06-03', 'tranferencia CTA SUC VIRTUAL', '830070.00', NULL, '189251783.00', 'Pago Nomina', '2025-10-21 04:47:46', 1, NULL),
(239, 2025, 'JUNIO', '2025-06-04', 'abono intereses ahorros', NULL, '1555.00', '189253339.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(240, 2025, 'JUNIO', '2025-06-05', 'abono intereses ahorros', NULL, '777.00', '189254116.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(241, 2025, 'JUNIO', '2025-06-05', 'Impuesto al gobierno 4x1000', '392.00', NULL, '189253724.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(242, 2025, 'JUNIO', '2025-06-05', 'compra home center', '98100.00', NULL, '189155624.00', 'compra home center', '2025-10-21 04:47:46', 1, NULL),
(243, 2025, 'JUNIO', '2025-06-06', 'abono intereses ahorros', NULL, '776.00', '189156400.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(244, 2025, 'JUNIO', '2025-06-06', 'Impuesto al gobierno 4x1000', '796.00', NULL, '189155604.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(245, 2025, 'JUNIO', '2025-06-06', 'compra en espumas', '199000.00', NULL, '188956604.00', 'Compra espumas- espumados', '2025-10-21 04:47:46', 1, NULL),
(246, 2025, 'JUNIO', '2025-06-07', 'abono intereses ahorros', NULL, '766.00', '188957370.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(247, 2025, 'JUNIO', '2025-06-07', 'Impuesto al gobierno 4x1000', '10090.00', NULL, '188947280.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(248, 2025, 'JUNIO', '2025-06-07', 'Pago PSE coomeva', '2173080.00', NULL, '186774200.00', 'EPS', '2025-10-21 04:47:46', 1, NULL),
(249, 2025, 'JUNIO', '2025-06-07', 'tranferencia CTA SUC VIRTUAL', '349500.00', NULL, '186424700.00', 'Ferremar la 94', '2025-10-21 04:47:46', 1, NULL),
(250, 2025, 'JUNIO', '2025-06-08', 'Impuesto al gobierno 4x1000', '1941.00', NULL, '186422759.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(251, 2025, 'JUNIO', '2025-06-08', 'compra en home center', '395400.00', NULL, '186027359.00', 'Home center', '2025-10-21 04:47:46', 1, NULL),
(252, 2025, 'JUNIO', '2025-06-08', 'compra en home center', '89900.00', NULL, '185937459.00', 'Home center', '2025-10-21 04:47:46', 1, NULL),
(253, 2025, 'JUNIO', '2025-06-11', 'abono intereses ahorros', NULL, '3056.00', '185940515.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(254, 2025, 'JUNIO', '2025-06-12', 'abono intereses ahorros', NULL, '727.00', '185905629.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(255, 2025, 'JUNIO', '2025-06-12', 'Impuesto al gobierno 4x1000', '35613.00', NULL, '185905629.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(256, 2025, 'JUNIO', '2025-06-12', 'tranferencia CTA SUC VIRTUAL', '8903480.00', NULL, '177002149.00', 'Impuesto ', '2025-10-21 04:47:46', 1, NULL),
(257, 2025, 'JUNIO', '2025-06-13', 'abono intereses ahorros', NULL, '685.00', '177002834.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(258, 2025, 'JUNIO', '2025-06-13', 'Impuesto al gobierno 4x1000', '40681.00', NULL, '176962153.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(259, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '1641820.00', NULL, '175320333.00', 'Pagos primas y quincena', '2025-10-21 04:47:46', 1, NULL),
(260, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '1562000.00', NULL, '173758333.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(261, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '1562000.00', NULL, '172196333.00', 'aportes en linea', '2025-10-21 04:47:46', 1, NULL),
(262, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '1641820.00', NULL, '170554513.00', 'Pagos primas y quincena', '2025-10-21 04:47:46', 1, NULL),
(263, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '1641820.00', NULL, '168912693.00', 'Pagos primas y quincena', '2025-10-21 04:47:46', 1, NULL),
(264, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '464860.00', NULL, '168447833.00', 'Pago mayo ana ', '2025-10-21 04:47:46', 1, NULL),
(265, 2025, 'JUNIO', '2025-06-13', 'tranferencia CTA SUC VIRTUAL', '1641820.00', NULL, '166806013.00', 'Pagos primas y quincena', '2025-10-21 04:47:46', 1, NULL),
(266, 2025, 'JUNIO', '2025-06-13', 'Cuota de manejo tarjeta debito', '14200.00', NULL, '166791813.00', 'Cuota de manejo tarjeta debito', '2025-10-21 04:47:46', 1, NULL),
(267, 2025, 'JUNIO', '2025-06-14', 'Impuesto al gobierno 4x1000', '2785.00', NULL, '166789028.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(268, 2025, 'JUNIO', '2025-06-14', 'compra en home center', '433400.00', NULL, '166255628.00', 'compra en home center', '2025-10-21 04:47:46', 1, NULL),
(269, 2025, 'JUNIO', '2025-06-14', 'compra en supertienda', '262855.00', NULL, '166092773.00', 'Olimpica aseo', '2025-10-21 04:47:46', 1, NULL),
(270, 2025, 'JUNIO', '2025-06-16', 'abono intereses ahorros', NULL, '2047.00', '166094821.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(271, 2025, 'JUNIO', '2025-06-17', 'pago proveedor rosales', NULL, '20535860.00', '186630681.00', 'pago proveedor rosales', '2025-10-21 04:47:46', 1, NULL),
(272, 2025, 'JUNIO', '2025-06-17', 'abono intereses ahorros', NULL, '766.00', '186631448.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(273, 2025, 'JUNIO', '2025-06-18', 'Impuesto al gobierno 4x1000', '6674.00', NULL, '186624773.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(274, 2025, 'JUNIO', '2025-06-18', 'tranferencia CTA SUC VIRTUAL', '1668700.00', NULL, '184956073.00', 'Aportes en linea Jhon Jairo', '2025-10-21 04:47:46', 1, NULL),
(275, 2025, 'JUNIO', '2025-06-21', 'abono intereses ahorros', NULL, '3040.00', '184959113.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(276, 2025, 'JUNIO', '2025-06-22', 'Impuesto al gobierno 4x1000', '12000.00', NULL, '184947113.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(277, 2025, 'JUNIO', '2025-06-22', 'tranferencia CTA SUC VIRTUAL', '3000000.00', NULL, '181947113.00', 'Compra caballo y mano  de obra ', '2025-10-21 04:47:46', 1, NULL),
(278, 2025, 'JUNIO', '2025-06-24', 'abono intereses ahorros', NULL, '2243.00', '181949356.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(279, 2025, 'JUNIO', '2025-06-25', 'Impuesto al gobierno 4x1000', '5702.00', NULL, '181943654.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(280, 2025, 'JUNIO', '2025-06-25', 'compra importadora el hueco', '125500.00', NULL, '181818154.00', 'compra de cubiertos y platos ', '2025-10-21 04:47:46', 1, NULL),
(281, 2025, 'JUNIO', '2025-06-25', 'tranferencia CTA SUC VIRTUAL', '1300000.00', NULL, '180518154.00', NULL, '2025-10-21 04:47:46', 1, NULL),
(282, 2025, 'JUNIO', '2025-06-26', 'abono intereses ahorros', NULL, '1483.00', '180519638.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(283, 2025, 'JUNIO', '2025-06-27', 'pago provedor rosales', NULL, '5133965.00', '185653603.00', 'pago provedor rosales', '2025-10-21 04:47:46', 1, NULL),
(284, 2025, 'JUNIO', '2025-06-27', 'abono intereses ahorros', NULL, '762.00', '185654366.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(285, 2025, 'JUNIO', '2025-06-28', 'Impuesto al gobierno 4x1000', '873.00', NULL, '185653493.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(286, 2025, 'JUNIO', '2025-06-28', 'tranferencia CTA SUC VIRTUAL', '218300.00', NULL, '185435193.00', 'Compra home center', '2025-10-21 04:47:46', 1, NULL),
(287, 2025, 'JUNIO', '2025-06-29', 'abono intereses ahorros', NULL, '1524.00', '185436717.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(288, 2025, 'JUNIO', '2025-06-30', 'abono intereses ahorros', NULL, '753.00', '185437471.00', 'abono intereses ahorros', '2025-10-21 04:47:46', 1, NULL),
(289, 2025, 'JUNIO', '2025-06-30', 'Impuesto al gobierno 4x1000', '8000.00', NULL, '185429471.00', 'Impuesto al gobierno 4x1000', '2025-10-21 04:47:46', 1, NULL),
(290, 2025, 'JUNIO', '2025-06-30', 'tranferencia CTA SUC VIRTUAL', '2000000.00', NULL, '183429471.00', 'Compra caballo y mano  de obra ', '2025-10-21 04:47:46', 1, NULL),
(291, 2025, 'JULIO', '2025-07-01', 'ABONO INTERESES AHORROS', NULL, '753.81', '183.43', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(292, 2025, 'JULIO', '2025-07-02', 'IMPTO GOBIERNO 4X1000', '-15.92', NULL, '183.41', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(293, 2025, 'JULIO', '2025-07-02', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.49', NULL, '181.92', 'Jhon Jairo Liquidacion', '2025-10-21 04:47:46', 1, NULL),
(294, 2025, 'JULIO', '2025-07-02', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '181.09', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(295, 2025, 'JULIO', '2025-07-02', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '180.26', 'Nomina ', '2025-10-21 04:47:46', 1, NULL),
(296, 2025, 'JULIO', '2025-07-02', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '179.43', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(297, 2025, 'JULIO', '2025-07-03', 'ABONO INTERESES AHORROS', NULL, '1.47', '179.44', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(298, 2025, 'JULIO', '2025-07-04', 'IMPTO GOBIERNO 4X1000', '-1.38', NULL, '179.43', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(299, 2025, 'JULIO', '2025-07-04', 'COMPRA EN BOLD*Resta', '-344.90', NULL, '179.09', 'COMPRA EN BOLD*Resta', '2025-10-21 04:47:46', 1, NULL),
(300, 2025, 'JULIO', '2025-07-07', 'ABONO INTERESES AHORROS', NULL, '2.94', '179.09', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(301, 2025, 'JULIO', '2025-07-08', 'IMPTO GOBIERNO 4X1000', '-8.47', NULL, '179.08', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(302, 2025, 'JULIO', '2025-07-08', 'TRANSFERENCIA CTA SUC VIRTUAL', '-774.00', NULL, '178.31', 'TRANSFERENCIA CTA SUC VIRTUAL', '2025-10-21 04:47:46', 1, NULL),
(303, 2025, 'JULIO', '2025-07-08', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.34', NULL, '176.97', 'facturacion SIGO', '2025-10-21 04:47:46', 1, NULL),
(304, 2025, 'JULIO', '2025-07-09', 'ABONO INTERESES AHORROS', NULL, '1.45', '176.97', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(305, 2025, 'JULIO', '2025-07-10', 'ABONO INTERESES AHORROS', NULL, '721.10', '176.97', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(306, 2025, 'JULIO', '2025-07-10', 'TRANSFERENCIA VIRTUAL', '-1.49', NULL, '175.48', 'APORTES EN LINEA ', '2025-10-21 04:47:46', 1, NULL),
(307, 2025, 'JULIO', '2025-07-10', 'IMPTO GOBIERNO 4X1000', '-5.97', NULL, '175.47', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(308, 2025, 'JULIO', '2025-07-11', 'PAGO DE PROV CEMENTOS ARGOS', NULL, '9.86', '185.33', 'Pago Proveedor cementos ', '2025-10-21 04:47:46', 1, NULL),
(309, 2025, 'JULIO', '2025-07-11', 'IMPTO GOBIERNO 4X1000', '-3.50', NULL, '185.33', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(310, 2025, 'JULIO', '2025-07-11', 'COMPRA EN HOMECENTER', '-859.80', NULL, '184.47', 'Compra Home center elementos piscinas', '2025-10-21 04:47:46', 1, NULL),
(311, 2025, 'JULIO', '2025-07-11', 'CUOTA MANEJO TRJ DEB 07 25', '-14.20', NULL, '184.45', 'Cuota de manejo', '2025-10-21 04:47:46', 1, NULL),
(312, 2025, 'JULIO', '2025-07-14', 'ABONO INTERESES AHORROS', NULL, '3.03', '184.46', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(313, 2025, 'JULIO', '2025-07-15', 'ABONO INTERESES AHORROS', NULL, '740.17', '184.46', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(314, 2025, 'JULIO', '2025-07-15', 'IMPTO GOBIERNO 4X1000', '-17.32', NULL, '184.44', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(315, 2025, 'JULIO', '2025-07-15', 'COMPRA EN HOMECENTER', '-517.10', NULL, '183.92', 'Compra home center inodoro', '2025-10-21 04:47:46', 1, NULL),
(316, 2025, 'JULIO', '2025-07-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '183.09', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(317, 2025, 'JULIO', '2025-07-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '182.26', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(318, 2025, 'JULIO', '2025-07-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-500.00', NULL, '181.76', 'Nomina ana', '2025-10-21 04:47:46', 1, NULL),
(319, 2025, 'JULIO', '2025-07-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-823.40', NULL, '180.94', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(320, 2025, 'JULIO', '2025-07-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '180.11', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(321, 2025, 'JULIO', '2025-07-16', 'ABONO INTERESES AHORROS', NULL, '731.92', '180.11', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(322, 2025, 'JULIO', '2025-07-16', 'IMPTO GOBIERNO 4X1000', '-8.00', NULL, '180.10', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(323, 2025, 'JULIO', '2025-07-16', 'TRANSFERENCIA CTA SUC VIRTUAL', '-2.00', NULL, '178.10', NULL, '2025-10-21 04:47:46', 1, NULL),
(324, 2025, 'JULIO', '2025-07-17', 'PAGO DE PROV ZONA FRANCA ARG', NULL, '4.17', '182.27', 'PAGO DE PROV ZONA FRANCA ARG', '2025-10-21 04:47:46', 1, NULL),
(325, 2025, 'JULIO', '2025-07-17', 'ABONO INTERESES AHORROS', NULL, '749.05', '182.27', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(326, 2025, 'JULIO', '2025-07-18', 'IMPTO GOBIERNO 4X1000', '-716.00', NULL, '182.27', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(327, 2025, 'JULIO', '2025-07-18', 'TRANSFERENCIA CTA SUC VIRTUAL', '-179.00', NULL, '182.09', NULL, '2025-10-21 04:47:46', 1, NULL),
(328, 2025, 'JULIO', '2025-07-19', 'ABONO INTERESES AHORROS', NULL, '1.50', '182.09', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(329, 2025, 'JULIO', '2025-07-20', 'ABONO INTERESES AHORROS', NULL, '746.26', '182.09', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(330, 2025, 'JULIO', '2025-07-20', 'IMPTO GOBIERNO 4X1000', '-2.00', NULL, '182.09', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(331, 2025, 'JULIO', '2025-07-20', 'TRANSFERENCIA CTA SUC VIRTUAL', '-500.00', NULL, '181.59', NULL, '2025-10-21 04:47:46', 1, NULL),
(332, 2025, 'JULIO', '2025-07-21', 'PAGO DE PROV ROSALES S A S', NULL, '20.54', '202.13', 'PAGO DE PROV ROSALES S A S', '2025-10-21 04:47:46', 1, NULL),
(333, 2025, 'JULIO', '2025-07-21', 'IMPTO GOBIERNO 4X1000', '-1.00', NULL, '202.13', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(334, 2025, 'JULIO', '2025-07-21', 'TRANSFERENCIA CTA SUC VIRTUAL', '-250.00', NULL, '201.88', NULL, '2025-10-21 04:47:46', 1, NULL),
(335, 2025, 'JULIO', '2025-07-24', 'ABONO INTERESES AHORROS', NULL, '3.32', '201.88', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(336, 2025, 'JULIO', '2025-07-25', 'IMPTO GOBIERNO 4X1000', '-6.00', NULL, '201.87', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(337, 2025, 'JULIO', '2025-07-25', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.50', NULL, '200.37', NULL, '2025-10-21 04:47:46', 1, NULL),
(338, 2025, 'JULIO', '2025-07-27', 'ABONO INTERESES AHORROS', NULL, '2.47', '200.38', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(339, 2025, 'JULIO', '2025-07-28', 'IMPTO GOBIERNO 4X1000', '-6.65', NULL, '200.37', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(340, 2025, 'JULIO', '2025-07-28', 'TRANSFERENCIA CTA SUC VIRTUAL', '-60.00', NULL, '200.31', NULL, '2025-10-21 04:47:46', 1, NULL),
(341, 2025, 'JULIO', '2025-07-28', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.60', NULL, '198.71', 'Liquidacion y salario Jhon Fredy', '2025-10-21 04:47:46', 1, NULL),
(342, 2025, 'JULIO', '2025-07-30', 'ABONO INTERESES AHORROS', NULL, '2.45', '198.71', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(343, 2025, 'JULIO', '2025-07-31', 'ABONO INTERESES AHORROS', NULL, '808.36', '198.71', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(344, 2025, 'JULIO', '2025-07-31', 'IMPTO GOBIERNO 4X1000', '-8.00', NULL, '198.70', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(345, 2025, 'JULIO', '2025-07-31', 'TRANSFERENCIA CTA SUC VIRTUAL', '-2.00', NULL, '196.70', 'Calculista', '2025-10-21 04:47:46', 1, NULL),
(346, 2025, 'AGOSTO', '2025-08-01', 'IMPTO GOBIERNO 4X1000', '-11.24', NULL, '196.69', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(347, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '195.86', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(348, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', '-250.00', NULL, '195.61', 'Nomina', '2025-10-21 04:47:46', 1, NULL);
INSERT INTO `transferencias_pagos` (`id`, `year`, `mes`, `fecha`, `actividad`, `sale`, `entra`, `saldo`, `concepto`, `created_at`, `created_by`, `updated_by`) VALUES
(349, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', '-900.00', NULL, '194.71', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(350, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '193.88', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(351, 2025, 'AGOSTO', '2025-08-05', 'ABONO INTERESES AHORROS', NULL, '3.98', '193.88', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(352, 2025, 'AGOSTO', '2025-08-06', 'IMPTO GOBIERNO 4X1000', '-1.29', NULL, '193.88', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(353, 2025, 'AGOSTO', '2025-08-06', 'COMPRA EN RESTAURANT', '-323.41', NULL, '193.56', 'COMPRA EN RESTAURANT', '2025-10-21 04:47:46', 1, NULL),
(354, 2025, 'AGOSTO', '2025-08-07', 'ABONO INTERESES AHORROS', NULL, '1.59', '193.56', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(355, 2025, 'AGOSTO', '2025-08-08', 'IMPTO GOBIERNO 4X1000', '-3.28', NULL, '193.56', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(356, 2025, 'AGOSTO', '2025-08-08', 'TRANSFERENCIA CTA SUC VIRTUAL', '-820.00', NULL, '192.74', NULL, '2025-10-21 04:47:46', 1, NULL),
(357, 2025, 'AGOSTO', '2025-08-10', 'ABONO INTERESES AHORROS', NULL, '2.38', '192.74', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(358, 2025, 'AGOSTO', '2025-08-11', 'IMPTO GOBIERNO 4X1000', '-900.00', NULL, '192.74', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(359, 2025, 'AGOSTO', '2025-08-11', 'TRANSFERENCIA CTA SUC VIRTUAL', '-225.00', NULL, '192.51', 'CAJA MENOR MIGUEL POLO', '2025-10-21 04:47:46', 1, NULL),
(360, 2025, 'AGOSTO', '2025-08-13', 'ABONO INTERESES AHORROS', NULL, '2.37', '192.52', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(361, 2025, 'AGOSTO', '2025-08-14', 'ABONO INTERESES AHORROS', NULL, '791.10', '192.52', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(362, 2025, 'AGOSTO', '2025-08-14', 'IMPTO GOBIERNO 4X1000', '-56.80', NULL, '192.52', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(363, 2025, 'AGOSTO', '2025-08-14', 'CUOTA MANEJO TRJ DEB 08 25', '-14.20', NULL, '192.50', 'CUOTA MANEJO TRJ DEB 08 25', '2025-10-21 04:47:46', 1, NULL),
(364, 2025, 'AGOSTO', '2025-08-15', 'IMPTO GOBIERNO 4X1000', '-280.71', NULL, '192.22', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(365, 2025, 'AGOSTO', '2025-08-15', 'IMPTO GOBIERNO 4X1000', '-43.16', NULL, '192.22', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(366, 2025, 'AGOSTO', '2025-08-15', 'RETIRO TARJETA EN SUCURSAL', '-50.00', NULL, '142.22', 'Pago Aceros', '2025-10-21 04:47:46', 1, NULL),
(367, 2025, 'AGOSTO', '2025-08-15', 'TRASLADO DEBITO PIN PAD', '-13.08', NULL, '129.14', 'TRASLADO DEBITO PIN PAD', '2025-10-21 04:47:46', 1, NULL),
(368, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '128.31', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(369, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '127.48', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(370, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-830.07', NULL, '126.65', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(371, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-250.00', NULL, '126.40', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(372, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-900.00', NULL, '125.50', 'Nomina', '2025-10-21 04:47:46', 1, NULL),
(373, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.64', NULL, '123.87', 'Seguridad social', '2025-10-21 04:47:46', 1, NULL),
(374, 2025, 'AGOSTO', '2025-08-15', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.82', NULL, '122.04', 'Polizas', '2025-10-21 04:47:46', 1, NULL),
(375, 2025, 'AGOSTO', '2025-08-15', 'COMISION TRASLADO PIN PAD', '-10.79', NULL, '122.03', 'COMISION TRASLADO PIN PAD', '2025-10-21 04:47:46', 1, NULL),
(376, 2025, 'AGOSTO', '2025-08-16', 'ABONO INTERESES AHORROS', NULL, '1.00', '122.03', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(377, 2025, 'AGOSTO', '2025-08-17', 'IMPTO GOBIERNO 4X1000', '-2.00', NULL, '122.03', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(378, 2025, 'AGOSTO', '2025-08-17', 'TRANSFERENCIA CTA SUC VIRTUAL', '-500.00', NULL, '121.53', NULL, '2025-10-21 04:47:46', 1, NULL),
(379, 2025, 'AGOSTO', '2025-08-19', 'ABONO INTERESES AHORROS', NULL, '1.50', '121.53', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(380, 2025, 'AGOSTO', '2025-08-20', 'ABONO INTERESES AHORROS', NULL, '483.22', '121.53', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(381, 2025, 'AGOSTO', '2025-08-20', 'IMPTO GOBIERNO 4X1000', '-15.73', NULL, '121.52', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(382, 2025, 'AGOSTO', '2025-08-20', 'TRANSFERENCIA CTA SUC VIRTUAL', '-320.00', NULL, '121.20', 'Carnet Opera', '2025-10-21 04:47:46', 1, NULL),
(383, 2025, 'AGOSTO', '2025-08-20', 'TRANSFERENCIA CTA SUC VIRTUAL', '-2.95', NULL, '118.25', 'Dotacion', '2025-10-21 04:47:46', 1, NULL),
(384, 2025, 'AGOSTO', '2025-08-20', 'TRANSFERENCIA CTA SUC VIRTUAL', '-662.20', NULL, '117.59', 'Curso altura CARTAGENA', '2025-10-21 04:47:46', 1, NULL),
(385, 2025, 'AGOSTO', '2025-08-21', 'ABONO INTERESES AHORROS', NULL, '474.76', '117.59', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(386, 2025, 'AGOSTO', '2025-08-21', 'IMPTO GOBIERNO 4X1000', '-8.20', NULL, '117.58', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(387, 2025, 'AGOSTO', '2025-08-21', 'TRANSFERENCIA CTA SUC VIRTUAL', '-2.05', NULL, '115.53', 'Pintura Coveñas', '2025-10-21 04:47:46', 1, NULL),
(388, 2025, 'AGOSTO', '2025-08-22', 'PAGO DE PROV ROSALES S A S', NULL, '20.54', '136.06', 'PAGO DE PROV ROSALES S A S', '2025-10-21 04:47:46', 1, NULL),
(389, 2025, 'AGOSTO', '2025-08-22', 'ABONO INTERESES AHORROS', NULL, '59.06', '136.06', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(390, 2025, 'AGOSTO', '2025-08-22', 'IMPTO GOBIERNO 4X1000', '-370.13', NULL, '135.69', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(391, 2025, 'AGOSTO', '2025-08-22', 'IMPTO GOBIERNO 4X1000', '-176.07', NULL, '135.69', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(392, 2025, 'AGOSTO', '2025-08-22', 'COMIS EXPEDICION CHEQUE GCIA', '-36.99', NULL, '135.66', 'COMIS EXPEDICION CHEQUE GCIA', '2025-10-21 04:47:46', 1, NULL),
(393, 2025, 'AGOSTO', '2025-08-22', 'RETIRO EN CAJA CON CHEQUE', '-92.53', NULL, '43.12', 'PAGO TEJA', '2025-10-21 04:47:46', 1, NULL),
(394, 2025, 'AGOSTO', '2025-08-22', 'IVA COMIS EXPEDICION CHQ GCIA', '-7.03', NULL, '43.12', 'IVA COMIS EXPEDICION CHQ GCIA', '2025-10-21 04:47:46', 1, NULL),
(395, 2025, 'AGOSTO', '2025-08-23', 'ABONO INTERESES AHORROS', NULL, '58.28', '43.12', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(396, 2025, 'AGOSTO', '2025-08-23', 'IMPTO GOBIERNO 4X1000', '-2.27', NULL, '43.11', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(397, 2025, 'AGOSTO', '2025-08-23', 'COMPRA EN FERRE ELEC', '-316.40', NULL, '42.80', 'COMPRA EN FERRE ELEC', '2025-10-21 04:47:46', 1, NULL),
(398, 2025, 'AGOSTO', '2025-08-23', 'TRANSFERENCIA CTA SUC VIRTUAL', '-250.00', NULL, '42.55', NULL, '2025-10-21 04:47:46', 1, NULL),
(399, 2025, 'AGOSTO', '2025-08-24', 'ABONO INTERESES AHORROS', NULL, '40.89', '42.55', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(400, 2025, 'AGOSTO', '2025-08-24', 'IMPTO GOBIERNO 4X1000', '-50.59', NULL, '42.50', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(401, 2025, 'AGOSTO', '2025-08-24', 'TRANSFERENCIA CTA SUC VIRTUAL', '-12.65', NULL, '29.85', 'CARRO', '2025-10-21 04:47:46', 1, NULL),
(402, 2025, 'AGOSTO', '2025-08-25', 'ABONO INTERESES AHORROS', NULL, '31.53', '29.85', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:46', 1, NULL),
(403, 2025, 'AGOSTO', '2025-08-25', 'IMPTO GOBIERNO 4X1000', '-27.22', NULL, '29.82', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:46', 1, NULL),
(404, 2025, 'AGOSTO', '2025-08-25', 'TRANSFERENCIA CTA SUC VIRTUAL', '-704.00', NULL, '29.12', 'PINTURA', '2025-10-21 04:47:46', 1, NULL),
(405, 2025, 'AGOSTO', '2025-08-25', 'TRANSFERENCIA CTA SUC VIRTUAL', '-6.10', NULL, '23.02', 'MIGUEL POLO', '2025-10-21 04:47:46', 1, NULL),
(406, 2025, 'AGOSTO', '2025-08-26', 'ABONO INTERESES AHORROS', NULL, '21.05', '23.02', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:47', 1, NULL),
(407, 2025, 'AGOSTO', '2025-08-26', 'IMPTO GOBIERNO 4X1000', '-30.48', NULL, '22.99', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:47', 1, NULL),
(408, 2025, 'AGOSTO', '2025-08-26', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.09', NULL, '21.90', 'TUBOS METALES', '2025-10-21 04:47:47', 1, NULL),
(409, 2025, 'AGOSTO', '2025-08-26', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.72', NULL, '20.17', 'TORNILLOS', '2025-10-21 04:47:47', 1, NULL),
(410, 2025, 'AGOSTO', '2025-08-26', 'TRANSFERENCIA CTA SUC VIRTUAL', '-4.80', NULL, '15.37', 'MIGUEL POLO', '2025-10-21 04:47:47', 1, NULL),
(411, 2025, 'AGOSTO', '2025-08-27', 'ABONO INTERESES AHORROS', NULL, '16.92', '15.37', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:47', 1, NULL),
(412, 2025, 'AGOSTO', '2025-08-27', 'IMPTO GOBIERNO 4X1000', '-12.00', NULL, '15.36', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:47', 1, NULL),
(413, 2025, 'AGOSTO', '2025-08-27', 'TRANSFERENCIA CTA SUC VIRTUAL', '-3.00', NULL, '12.36', 'MIGUEL POLO', '2025-10-21 04:47:47', 1, NULL),
(414, 2025, 'AGOSTO', '2025-08-28', 'PAGO DE PROV CEMENTOS ARGOS', NULL, '11.36', '23.71', 'PAGO DE PROV CEMENTOS ARGOS', '2025-10-21 04:47:47', 1, NULL),
(415, 2025, 'AGOSTO', '2025-08-28', 'ABONO INTERESES AHORROS', NULL, '30.26', '23.71', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:47', 1, NULL),
(416, 2025, 'AGOSTO', '2025-08-28', 'IMPTO GOBIERNO 4X1000', '-6.46', NULL, '23.71', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:47', 1, NULL),
(417, 2025, 'AGOSTO', '2025-08-28', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.62', NULL, '22.09', NULL, '2025-10-21 04:47:47', 1, NULL),
(418, 2025, 'AGOSTO', '2025-08-29', 'ABONO INTERESES AHORROS', NULL, '21.35', '22.09', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:47', 1, NULL),
(419, 2025, 'AGOSTO', '2025-08-29', 'IMPTO GOBIERNO 4X1000', '-25.91', NULL, '22.06', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:47', 1, NULL),
(420, 2025, 'AGOSTO', '2025-08-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '-5.00', NULL, '17.06', 'MIGUEL POLO', '2025-10-21 04:47:47', 1, NULL),
(421, 2025, 'AGOSTO', '2025-08-29', 'TRANSFERENCIA CTA SUC VIRTUAL', '-1.48', NULL, '15.59', 'PINTURA', '2025-10-21 04:47:47', 1, NULL),
(422, 2025, 'AGOSTO', '2025-08-30', 'ABONO INTERESES AHORROS', NULL, '14.87', '15.59', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:47', 1, NULL),
(423, 2025, 'AGOSTO', '2025-08-30', 'IMPTO GOBIERNO 4X1000', '-18.84', NULL, '15.57', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:47', 1, NULL),
(424, 2025, 'AGOSTO', '2025-08-30', 'TRANSFERENCIA CTA SUC VIRTUAL', '-4.71', NULL, '10.86', 'Nomina ', '2025-10-21 04:47:47', 1, NULL),
(425, 2025, 'AGOSTO', '2025-08-31', 'ABONO INTERESES AHORROS', '12.12', NULL, '10858506.07', 'ABONO INTERESES AHORROS', '2025-10-21 04:47:47', 1, NULL),
(426, 2025, 'AGOSTO', '2025-08-31', 'IMPTO GOBIERNO 4X1000', '-8.00', NULL, '10.85', 'IMPTO GOBIERNO 4X1000', '2025-10-21 04:47:47', 1, NULL),
(427, 2025, 'AGOSTO', '2025-08-31', 'TRANSFERENCIA CTA SUC VIRTUAL', '-2.00', NULL, '8.85', 'PAGO PAJARO', '2025-10-21 04:47:47', 1, NULL),
(428, 2025, 'SEPTIEMBRE', '2025-09-01', 'Abono Intereses', NULL, '1212.00', '8850518.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(429, 2025, 'SEPTIEMBRE', '2025-09-02', 'Impuesto 4X1000', '19494.00', NULL, '8831024.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(430, 2025, 'SEPTIEMBRE', '2025-09-02', 'Transferencia CTA virtual', '2000000.00', NULL, '6831024.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(431, 2025, 'SEPTIEMBRE', '2025-09-02', 'Transferencia CTA virtual', '2873500.00', NULL, '3957524.00', 'Pago BT Ingeneria', '2025-10-21 04:47:47', 1, NULL),
(432, 2025, 'SEPTIEMBRE', '2025-09-03', 'Abono Intereses', NULL, '1084.00', '3957535.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(433, 2025, 'SEPTIEMBRE', '2025-09-04', 'Impuesto 4X1000', '10464.00', NULL, '3947071.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(434, 2025, 'SEPTIEMBRE', '2025-09-04', 'Transferencia CTA virtual', '2616000.00', NULL, '1331071.00', 'Transferia Miguel Polo Mendoza', '2025-10-21 04:47:47', 1, NULL),
(435, 2025, 'SEPTIEMBRE', '2025-09-08', 'Abono Intereses', NULL, '910.00', '1331080.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(436, 2025, 'SEPTIEMBRE', '2025-09-09', 'Transferencia CTA virtual', '1300000.00', NULL, '25880.00', 'Transferia Miguel Polo Mendoza', '2025-10-21 04:47:47', 1, NULL),
(437, 2025, 'SEPTIEMBRE', '2025-09-11', 'Abono Intereses', NULL, '9.00', '25871.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(438, 2025, 'SEPTIEMBRE', '2025-09-12', 'Pago proveedor Rosales', NULL, '41071619.00', '41097619.00', 'Pago proveedor Rosales', '2025-10-21 04:47:47', 1, NULL),
(439, 2025, 'SEPTIEMBRE', '2025-09-12', 'Pago proveedor Rosales', NULL, '10267930.00', '51365549.00', 'Pago proveedor Rosales', '2025-10-21 04:47:47', 1, NULL),
(440, 2025, 'SEPTIEMBRE', '2025-09-12', 'Impuesto 4X1000', '5680.00', NULL, '51365492.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(441, 2025, 'SEPTIEMBRE', '2025-09-12', 'Cuota manejo de credito', '14200.00', NULL, '51351292.00', 'Cuota manejo de credito', '2025-10-21 04:47:47', 1, NULL),
(442, 2025, 'SEPTIEMBRE', '2025-09-16', 'Abono Intereses', NULL, '70341.00', '51351995.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(443, 2025, 'SEPTIEMBRE', '2025-09-17', 'Abono Intereses', NULL, '6478.00', '51352060.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(444, 2025, 'SEPTIEMBRE', '2025-09-17', 'Impuesto 4X1000', '16172.00', NULL, '51335888.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(445, 2025, 'SEPTIEMBRE', '2025-09-17', 'Transferencia CTA virtual', '3543000.00', NULL, '47792888.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(446, 2025, 'SEPTIEMBRE', '2025-09-17', 'Transferencia CTA virtual', '500000.00', NULL, '47292888.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(447, 2025, 'SEPTIEMBRE', '2025-09-18', 'Abono Intereses', NULL, '2657.00', '47292915.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(448, 2025, 'SEPTIEMBRE', '2025-09-18', 'Impuesto 4X1000', '111128.00', NULL, '47181787.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(449, 2025, 'SEPTIEMBRE', '2025-09-18', 'Transferencia CTA virtual', '27782000.00', NULL, '19399787.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(450, 2025, 'SEPTIEMBRE', '2025-09-19', 'Pago proveedor Rosales', NULL, '6912291.00', '26312078.00', 'Pago proveedor Rosales', '2025-10-21 04:47:47', 1, NULL),
(451, 2025, 'SEPTIEMBRE', '2025-09-19', 'Abono Intereses', NULL, '3329.00', '26312111.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(452, 2025, 'SEPTIEMBRE', '2025-09-19', 'Impuesto 4X1000', '8000.00', NULL, '26304111.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(453, 2025, 'SEPTIEMBRE', '2025-09-19', 'Transferencia CTA virtual', '2000000.00', NULL, '24304111.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(454, 2025, 'SEPTIEMBRE', '2025-09-20', 'Impuesto 4X1000', '13140.00', NULL, '24290971.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(455, 2025, 'SEPTIEMBRE', '2025-09-20', 'Transferencia CTA virtual', '3285000.00', NULL, '21005971.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(456, 2025, 'SEPTIEMBRE', '2025-09-22', 'Abono Intereses', NULL, '8631.00', '21006057.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(457, 2025, 'SEPTIEMBRE', '2025-09-23', 'Impuesto 4X1000', '18465.00', NULL, '20987592.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(458, 2025, 'SEPTIEMBRE', '2025-09-23', 'Transferencia CTA virtual', '1910080.00', NULL, '19077512.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(459, 2025, 'SEPTIEMBRE', '2025-09-23', 'Transferencia CTA virtual', '1756300.00', NULL, '17321212.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(460, 2025, 'SEPTIEMBRE', '2025-09-23', 'Transferencia CTA virtual', '950000.00', NULL, '16371212.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(461, 2025, 'SEPTIEMBRE', '2025-09-24', 'Interes Ahorros', NULL, '4484.00', '16371257.00', 'Interes Ahorros', '2025-10-21 04:47:47', 1, NULL),
(462, 2025, 'SEPTIEMBRE', '2025-09-25', 'Interes Ahorros', NULL, '1373.00', '16371270.00', 'Interes Ahorros', '2025-10-21 04:47:47', 1, NULL),
(463, 2025, 'SEPTIEMBRE', '2025-09-25', 'Servicio transferencia virtual', '7300.00', NULL, '16363970.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(464, 2025, 'SEPTIEMBRE', '2025-09-25', 'Transferencia CTA virtual', '2171400.00', NULL, '14192570.00', 'Pago alimentacion Coveñas corte del 12  al 20 de septiembre ', '2025-10-21 04:47:47', 1, NULL),
(465, 2025, 'SEPTIEMBRE', '2025-09-25', 'Impuesto 4X1000', '25268.00', NULL, '14167302.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(466, 2025, 'SEPTIEMBRE', '2025-09-25', 'Transferencia CTA virtual', '4136916.00', NULL, '10030386.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(467, 2025, 'SEPTIEMBRE', '2025-09-25', 'Cobro IVA pago automaticos', '1387.00', NULL, '10028999.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(468, 2025, 'SEPTIEMBRE', '2025-09-26', 'Abono Intereses', NULL, '1305.00', '10029012.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(469, 2025, 'SEPTIEMBRE', '2025-09-26', 'Impuesto 4X1000', '2000.00', NULL, '10027012.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(470, 2025, 'SEPTIEMBRE', '2025-09-26', 'Transferencia CTA virtual', '500000.00', NULL, '9527012.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(471, 2025, 'SEPTIEMBRE', '2025-09-27', 'Impuesto 4X1000', '21262.00', NULL, '9505750.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(472, 2025, 'SEPTIEMBRE', '2025-09-27', 'Compra en Home Center', '485800.00', NULL, '9019950.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(473, 2025, 'SEPTIEMBRE', '2025-09-27', 'Transferencia CTA virtual', '1829735.00', NULL, '7190215.00', 'Compra de materiales PVC-Coveñas ', '2025-10-21 04:47:47', 1, NULL),
(474, 2025, 'SEPTIEMBRE', '2025-09-27', 'Transferencia CTA virtual', '3000000.00', NULL, '4190215.00', 'Pago Contratista Coveñas Bins2 Rodolfo Garcia ', '2025-10-21 04:47:47', 1, NULL),
(475, 2025, 'SEPTIEMBRE', '2025-09-29', 'Abono Intereses', NULL, '1722.00', '4190232.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(476, 2025, 'SEPTIEMBRE', '2025-09-30', 'Consignacion Cheque', NULL, '55000000.00', '59190232.00', NULL, '2025-10-21 04:47:47', 1, NULL),
(477, 2025, 'SEPTIEMBRE', '2025-09-30', 'Abono Intereses', NULL, '506.00', '59190238.00', 'Abono Intereses', '2025-10-21 04:47:47', 1, NULL),
(478, 2025, 'SEPTIEMBRE', '2025-09-30', 'Impuesto 4X1000', '1972.00', NULL, '59188266.00', 'Impuesto 4X1000', '2025-10-21 04:47:47', 1, NULL),
(479, 2025, 'SEPTIEMBRE', '2025-09-30', 'Transferencia CTA virtual', '493000.00', NULL, '58695266.00', 'Transferencia Miguel Polo ', '2025-10-21 04:47:47', 1, NULL),
(480, 2024, 'MARZO', '2024-03-14', 'ABONO INTERESES AHORRO', NULL, '0.28', '21196.79', NULL, '2025-10-21 04:48:10', 1, NULL),
(481, 2024, 'MARZO', '2024-03-14', 'CUOTA DE MANEJO TARJETA DEBITO', '14190.00', NULL, '7006.79', NULL, '2025-10-21 04:48:10', 1, NULL),
(482, 2024, 'MARZO', '2024-03-14', 'AJUSTE INTERESES AHORRO DB', '0.02', NULL, '7006.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(483, 2024, 'MARZO', '2024-03-15', 'IMPTO GOBIERNO 4*1000|', '56.76', NULL, '6950.01', NULL, '2025-10-21 04:48:10', 1, NULL),
(484, 2024, 'MARZO', '2024-03-26', 'PAGO DE PROV CEMENTOS ARGOS', NULL, '32270808.00', '32277758.01', NULL, '2025-10-21 04:48:10', 1, NULL),
(485, 2024, 'MARZO', '2024-03-30', 'ABONO INTERESES AHORRO', NULL, '221.05', '32277979.06', NULL, '2025-10-21 04:48:10', 1, NULL),
(486, 2024, 'MARZO', '2024-03-30', 'ABONO INTERESES AHORRO', NULL, '44.00', '32278023.06', NULL, '2025-10-21 04:48:10', 1, NULL),
(487, 2024, 'MARZO', '2024-03-31', 'IMPTO GOBIERNO 4*1000', '616.00', NULL, '32277407.06', NULL, '2025-10-21 04:48:10', 1, NULL),
(488, 2024, 'MARZO', '2024-03-31', 'COMPRA EN FERRE ELEC', '154000.00', NULL, '32123407.06', NULL, '2025-10-21 04:48:10', 1, NULL),
(489, 2024, 'ABRIL', '2024-04-03', 'ABONO INTERESES AHORRO', NULL, '132.00', '32123539.06', NULL, '2025-10-21 04:48:10', 1, NULL),
(490, 2024, 'ABRIL', '2024-04-04', 'ABONO INTERESES AHORRO', NULL, '43.45', '32123582.51', NULL, '2025-10-21 04:48:10', 1, NULL),
(491, 2024, 'ABRIL', '2024-04-04', 'IMPTO GOBIERNO 4*1000', '1594.30', NULL, '32121988.21', NULL, '2025-10-21 04:48:10', 1, NULL),
(492, 2024, 'ABRIL', '2024-04-04', 'COMPRA EN HOTEL MARR', '136027.00', NULL, '31985961.21', NULL, '2025-10-21 04:48:10', 1, NULL),
(493, 2024, 'ABRIL', '2024-04-04', 'COMPRA EN HUMO BARBA', '262550.00', NULL, '31723411.21', NULL, '2025-10-21 04:48:10', 1, NULL),
(494, 2024, 'ABRIL', '2024-04-05', 'ABONO INTERESES AHORRO', NULL, '15.94', '31723427.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(495, 2024, 'ABRIL', '2024-04-05', 'IMPTO GOBIERNO 4*1000', '80000.00', NULL, '31643427.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(496, 2024, 'ABRIL', '2024-04-05', 'RETIRO TARJETAS EN SUCURSAL', '20000000.00', NULL, '11643427.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(497, 2024, 'ABRIL', '2024-04-06', 'IMPTO GOBIERNO 4*1000', '592.00', NULL, '11642835.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(498, 2024, 'ABRIL', '2024-04-06', 'COMPRA EN FERRE ELEC', '148000.00', NULL, '11494835.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(499, 2024, 'ABRIL', '2024-04-11', 'ABONO INTERESES AHORRO', NULL, '94.44', '11494929.59', NULL, '2025-10-21 04:48:10', 1, NULL),
(500, 2024, 'ABRIL', '2024-04-12', 'ABONO INTERESES AHORRO', NULL, '15.72', '11494945.31', NULL, '2025-10-21 04:48:10', 1, NULL),
(501, 2024, 'ABRIL', '2024-04-12', 'IMPTO GOBIERNO 4*1000', '56.76', NULL, '11494888.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(502, 2024, 'ABRIL', '2024-04-12', 'CUOTA MANEJO TARJETA DEBITO', '14190.00', NULL, '11480698.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(503, 2024, 'ABRIL', '2024-04-13', 'IMPTO GOBIERNO 4*1000', '786.00', NULL, '11479912.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(504, 2024, 'ABRIL', '2024-04-13', 'COMPRA EN FERRE ELEC', '196500.00', NULL, '11283412.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(505, 2024, 'ABRIL', '2024-04-25', 'ABONO INTERESES AHORRO', NULL, '200.85', '11283613.40', NULL, '2025-10-21 04:48:10', 1, NULL),
(506, 2024, 'ABRIL', '2024-04-26', 'IMPTO GOBIERNO 4*1000', '2393.60', NULL, '11281219.80', NULL, '2025-10-21 04:48:10', 1, NULL),
(507, 2024, 'ABRIL', '2024-04-26', 'COMPRA EN MARIOLA GM', '598400.00', NULL, '10682819.80', NULL, '2025-10-21 04:48:10', 1, NULL),
(508, 2024, 'ABRIL', '2024-04-27', 'ABONO INTERESES AHORRO', NULL, '29.26', '10682849.06', NULL, '2025-10-21 04:48:10', 1, NULL),
(509, 2024, 'ABRIL', '2024-04-28', 'IMPTO GOBIERNO 4*1000', '1726.02', NULL, '10681123.04', NULL, '2025-10-21 04:48:10', 1, NULL),
(510, 2024, 'ABRIL', '2024-04-28', 'COMPRA EN STARBUCKS', '32600.00', NULL, '10648523.04', NULL, '2025-10-21 04:48:10', 1, NULL),
(511, 2024, 'ABRIL', '2024-04-28', 'COMPRA EN BAMBOO MAL', '398906.00', NULL, '10249617.04', NULL, '2025-10-21 04:48:10', 1, NULL),
(512, 2024, 'ABRIL', '2024-04-30', 'ABONO INTERESES AHORRO', NULL, '42.12', '10249659.16', NULL, '2025-10-21 04:48:10', 1, NULL),
(513, 2024, 'MAYO', '2024-05-01', 'IMPTO GOBIERNO 4*1000', '-2405.88', NULL, '10247253.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(514, 2024, 'MAYO', '2024-05-01', 'COMPRA PIASA', '-601472.00', NULL, '9645781.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(515, 2024, 'MAYO', '2024-05-02', 'ABONO INTERESES', NULL, '26.00', '9645807.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(516, 2024, 'MAYO', '2024-05-03', 'IMPTO GOBIERNO 4*1000', '-30000.00', NULL, '9615807.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(517, 2024, 'MAYO', '2024-05-03', 'TRASFERENCIA', '-4500000.00', NULL, '5115807.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(518, 2024, 'MAYO', '2024-05-03', 'TRASFERENCIA', '-3000000.00', NULL, '2115807.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(519, 2024, 'MAYO', '2024-05-08', 'ABONO INTERESES AHORRO', NULL, '17.34', '2115824.62', NULL, '2025-10-21 04:48:10', 1, NULL),
(520, 2024, 'MAYO', '2024-05-09', 'ABONO INTERESES AHORRO', NULL, '2.98', '2115827.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(521, 2024, 'MAYO', '2024-05-09', 'IMPTO GOBIERNO 4*1000', '-400.00', NULL, '2115427.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(522, 2024, 'MAYO', '2024-05-09', 'COMPRA ZAMBA', '-100000.00', NULL, '2015427.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(523, 2024, 'MAYO', '2024-05-10', 'IMPTO GOBIERNO 4*1000', '-56.00', NULL, '2015371.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(524, 2024, 'MAYO', '2024-05-10', 'CUOTA DE MANEJO', '-14190.00', NULL, '2001181.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(525, 2024, 'MAYO', '2024-05-31', 'ABONO DE INTERESES', NULL, '60.00', '2001241.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(526, 2024, 'JUNIO', '2024-06-05', 'ABONO INTERESES AHORROS', NULL, '13.70', '2001255.02', NULL, '2025-10-21 04:48:10', 1, NULL),
(527, 2024, 'JUNIO', '2024-06-06', 'PAGE DE PROV CONCRETOS ARGOS', NULL, '19369490.00', '21370745.02', NULL, '2025-10-21 04:48:10', 1, NULL),
(528, 2024, 'JUNIO', '2024-06-07', 'ABONO INTERESES AHORROS', NULL, '58.54', '21370803.56', NULL, '2025-10-21 04:48:10', 1, NULL),
(529, 2024, 'JUNIO', '2024-06-08', 'IMPTP GOBIERNO4*1000', '18000.00', NULL, '21352803.56', NULL, '2025-10-21 04:48:10', 1, NULL),
(530, 2024, 'JUNIO', '2024-06-08', 'RETIRO TARJETA EN SUCURSAL', '3000000.00', NULL, '18352803.56', NULL, '2025-10-21 04:48:10', 1, NULL),
(531, 2024, 'JUNIO', '2024-06-08', 'TRANSFERENCIA CTA CAJERO', '1500000.00', NULL, '16852803.56', NULL, '2025-10-21 04:48:10', 1, NULL),
(532, 2024, 'JUNIO', '2024-06-13', 'ABONO INTERESES AHORROS', NULL, '138.48', '16852942.04', NULL, '2025-10-21 04:48:10', 1, NULL),
(533, 2024, 'JUNIO', '2024-06-14', 'IMPTP GOBIERNO4*1000', '56.76', NULL, '16852885.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(534, 2024, 'JUNIO', '2024-06-14', 'CUOTA MANEJO TARJETA DEBITO', '14190.00', NULL, '16838695.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(535, 2024, 'JUNIO', '2024-06-30', 'ABONO INTERESES AHORROS', NULL, '396.02', '16839087.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(536, 2024, 'JULIO', '2024-07-03', 'ABONO INTERESES AHORROS', NULL, '69.18', '16839156.48', NULL, '2025-10-21 04:48:10', 1, NULL),
(537, 2024, 'JULIO', '2024-07-04', 'PAGO DE PROV CEMENTOS ARGOS', NULL, '9261238.00', '26100394.48', NULL, '2025-10-21 04:48:10', 1, NULL),
(538, 2024, 'JULIO', '2024-07-09', 'ABONO INTERESES AHORROS', NULL, '214.50', '26100608.98', NULL, '2025-10-21 04:48:10', 1, NULL),
(539, 2024, 'JULIO', '2024-07-10', 'CONSIG LOCAL CHEQUE', NULL, '4683991.69', '30784600.67', NULL, '2025-10-21 04:48:10', 1, NULL),
(540, 2024, 'JULIO', '2024-07-11', 'ABONO INTERESES AHORROS', NULL, '77.92', '30784678.59', NULL, '2025-10-21 04:48:10', 1, NULL),
(541, 2024, 'JULIO', '2024-07-12', 'ABONO INTERESES AHORROS', NULL, '42.15', '30784720.74', NULL, '2025-10-21 04:48:10', 1, NULL),
(542, 2024, 'JULIO', '2024-07-12', 'IMPTO GOBIERNO 4*1000', '56.76', NULL, '30784663.98', NULL, '2025-10-21 04:48:10', 1, NULL),
(543, 2024, 'JULIO', '2024-07-12', 'CUOTA MANEJO TAJETA DEBITO', '14190.00', NULL, '30770473.98', NULL, '2025-10-21 04:48:10', 1, NULL),
(544, 2024, 'JULIO', '2024-07-13', 'ABONO INTERESES AHORROS', NULL, '41.92', '30770515.90', NULL, '2025-10-21 04:48:10', 1, NULL),
(545, 2024, 'JULIO', '2024-07-13', 'IMPTO GOBIERNO 4*1000', '650.90', NULL, '30769865.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(546, 2024, 'JULIO', '2024-07-13', 'COMPRA EN BOLD*GRUPO', '20700.00', NULL, '30749165.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(547, 2024, 'JULIO', '2024-07-13', 'COMPRA EN FERRE ELEC', '80000.00', NULL, '30669165.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(548, 2024, 'JULIO', '2024-07-13', 'COMPRA EN DISTRIBUID', '62026.00', NULL, '30607139.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(549, 2024, 'JULIO', '2024-07-14', 'ABONO INTERESES AHORROS', NULL, '41.75', '30607180.75', NULL, '2025-10-21 04:48:10', 1, NULL),
(550, 2024, 'JULIO', '2024-07-14', 'IMPTO GOBIERNO 4*1000', '516.00', NULL, '30606664.75', NULL, '2025-10-21 04:48:10', 1, NULL),
(551, 2024, 'JULIO', '2024-07-14', 'COMPRA EN FERRE ELEC', '129000.00', NULL, '30477664.75', NULL, '2025-10-21 04:48:10', 1, NULL),
(552, 2024, 'JULIO', '2024-07-15', 'PAGO DE PROV ROSALES SAS', NULL, '4683991.00', '35161655.75', NULL, '2025-10-21 04:48:10', 1, NULL),
(553, 2024, 'JULIO', '2024-07-19', 'ABONO INTERESES AHORROS', NULL, '240.80', '35161896.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(554, 2024, 'JULIO', '2024-07-20', 'IMPTO GOBIERNO 4*1000', '1268.00', NULL, '35160628.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(555, 2024, 'JULIO', '2024-07-20', 'COMPRA EN FERRE ELEC', '317000.00', NULL, '34843628.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(556, 2024, 'JULIO', '2024-07-27', 'ABONO INTERESES AHORROS', NULL, '381.84', '34844010.39', NULL, '2025-10-21 04:48:10', 1, NULL),
(557, 2024, 'JULIO', '2024-07-28', 'IMPTO GOBIERNO 4*1000', '2591.20', NULL, '34841419.19', NULL, '2025-10-21 04:48:10', 1, NULL),
(558, 2024, 'JULIO', '2024-07-28', 'COMPRA EN FERRE ELEC', '647800.00', NULL, '34193619.19', NULL, '2025-10-21 04:48:10', 1, NULL),
(559, 2024, 'JULIO', '2024-07-29', 'ABONO INTERESES AHORROS', NULL, '93.68', '34193712.87', NULL, '2025-10-21 04:48:10', 1, NULL),
(560, 2024, 'JULIO', '2024-07-30', 'IMPTO GOBIERNO 4*1000', '40000.00', NULL, '34153712.87', NULL, '2025-10-21 04:48:10', 1, NULL),
(561, 2024, 'JULIO', '2024-07-30', 'RETIRO TARJETA EN SUCURSAL ', '10000000.00', NULL, '24153712.87', NULL, '2025-10-21 04:48:10', 1, NULL),
(562, 2024, 'JULIO', '2024-07-31', 'ABONO INTERESES AHORROS', NULL, '66.16', '24153779.03', NULL, '2025-10-21 04:48:10', 1, NULL),
(563, 2024, 'AGOSTO', '2024-08-07', 'ABONO INTERESES AHORROS', NULL, '231.56', '24154010.59', NULL, '2025-10-21 04:48:10', 1, NULL),
(564, 2024, 'AGOSTO', '2024-08-08', 'PAGO DE PROV SUMMA', NULL, '75031055.00', '99185065.59', NULL, '2025-10-21 04:48:10', 1, NULL),
(565, 2024, 'AGOSTO', '2024-08-13', 'ABONO INTERESES AHORROS', NULL, '1630.43', '99186696.02', NULL, '2025-10-21 04:48:10', 1, NULL),
(566, 2024, 'AGOSTO', '2024-08-14', 'IMPRO GOBIERNO 4*1000', '56.76', NULL, '99186639.26', NULL, '2025-10-21 04:48:10', 1, NULL),
(567, 2024, 'AGOSTO', '2024-08-14', 'CUOTA MANEJO TARJETA DEBITO', '14190.00', NULL, '99172449.26', NULL, '2025-10-21 04:48:10', 1, NULL),
(568, 2024, 'AGOSTO', '2024-08-24', 'ABONO INTERESES AHORROS', NULL, '2988.74', '99175438.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(569, 2024, 'AGOSTO', '2024-08-25', 'ABONO INTERESES AHORROS', NULL, '268.10', '99175706.10', NULL, '2025-10-21 04:48:10', 1, NULL),
(570, 2024, 'AGOSTO', '2024-08-25', 'IMPRO GOBIERNO 4*1000', '5250.80', NULL, '99170455.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(571, 2024, 'AGOSTO', '2024-08-25', 'COMPRA DE FERRE ELEC', '101000.00', NULL, '99069455.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(572, 2024, 'AGOSTO', '2024-08-25', 'COMPRA EN TERRA E MA', '1211700.00', NULL, '97857755.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(573, 2024, 'AGOSTO', '2024-08-26', 'ABONO INTERESES AHORROS', NULL, '266.14', '97858021.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(574, 2024, 'AGOSTO', '2024-08-26', 'IMPRO GOBIERNO 4*1000', '2844.00', NULL, '97855177.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(575, 2024, 'AGOSTO', '2024-08-26', 'COMPRA EN ESPUMAS Y', '711000.00', NULL, '97144177.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(576, 2024, 'AGOSTO', '2024-08-27', 'PAGO DE PROV ROSALES SAS', NULL, '4683991.00', '101828168.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(577, 2024, 'AGOSTO', '2024-08-27', 'IMPRO GOBIERNO 4*1000', '100.00', NULL, '101828068.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(578, 2024, 'AGOSTO', '2024-08-27', 'COMPRA EN TIENDA ALT', '25000.00', NULL, '101803068.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(579, 2024, 'AGOSTO', '2024-08-31', 'ABONO INTERESES AHORROS', NULL, '2091.84', '101805160.28', NULL, '2025-10-21 04:48:10', 1, NULL),
(580, 2024, 'SEPTIEMBRE', '2024-09-09', 'ABONO INTERESES AHORROS ', NULL, '3765.41', '101808925.69', NULL, '2025-10-21 04:48:10', 1, NULL),
(581, 2024, 'SEPTIEMBRE', '2024-09-10', 'PAGO DE PROV ROSALES SAS', NULL, '4683421.00', '106492346.69', NULL, '2025-10-21 04:48:10', 1, NULL),
(582, 2024, 'SEPTIEMBRE', '2024-09-12', 'ABONO INTERESES AHORROS ', NULL, '1312.91', '106493659.60', NULL, '2025-10-21 04:48:10', 1, NULL),
(583, 2024, 'SEPTIEMBRE', '2024-09-13', 'IMPTO GOBIERNO 4*1000', '56.76', NULL, '106493602.84', NULL, '2025-10-21 04:48:10', 1, NULL),
(584, 2024, 'SEPTIEMBRE', '2024-09-13', 'CUOTA MANEJO TARJETA DEBITO', '14190.00', NULL, '106479412.84', NULL, '2025-10-21 04:48:10', 1, NULL),
(585, 2024, 'SEPTIEMBRE', '2024-09-14', 'ABONO INTERESES AHORROS ', NULL, '875.16', '106480288.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(586, 2024, 'SEPTIEMBRE', '2024-09-15', 'IMPTO GOBIERNO 4*1000', '728.69', NULL, '106479559.31', NULL, '2025-10-21 04:48:10', 1, NULL),
(587, 2024, 'SEPTIEMBRE', '2024-09-15', 'COMPRA EN DISTRIBUID', '182174.00', NULL, '106297385.31', NULL, '2025-10-21 04:48:10', 1, NULL),
(588, 2024, 'SEPTIEMBRE', '2024-09-20', 'ABONO INTERESES AHORROS ', NULL, '2621.03', '106300006.34', NULL, '2025-10-21 04:48:10', 1, NULL),
(589, 2024, 'SEPTIEMBRE', '2024-09-21', 'IMPTO GOBIERNO 4*1000', '8000.00', NULL, '106292006.34', NULL, '2025-10-21 04:48:10', 1, NULL),
(590, 2024, 'SEPTIEMBRE', '2024-09-21', 'RETIRO CAJERO MAKRO BARRANQUI', '1000000.00', NULL, '105292006.34', NULL, '2025-10-21 04:48:10', 1, NULL),
(591, 2024, 'SEPTIEMBRE', '2024-09-21', 'RETIRO CAJERO MAKRO BARRANQUI', '1000000.00', NULL, '104292006.34', NULL, '2025-10-21 04:48:10', 1, NULL),
(592, 2024, 'SEPTIEMBRE', '2024-09-26', 'ABONO INTERESES AHORROS ', NULL, '2571.58', '104294577.92', NULL, '2025-10-21 04:48:10', 1, NULL),
(593, 2024, 'SEPTIEMBRE', '2024-09-27', 'PAGO DE PROV IPG AGRONEGOC', NULL, '1190000.00', '105484577.92', NULL, '2025-10-21 04:48:10', 1, NULL),
(594, 2024, 'SEPTIEMBRE', '2024-09-30', 'ABONO INTERESES AHORROS ', NULL, '1733.99', '105486311.91', NULL, '2025-10-21 04:48:10', 1, NULL),
(595, 2024, 'OCTUBRE', '2024-10-03', 'ABONO INTERESES AHORRO', NULL, '1300.50', '105487612.41', NULL, '2025-10-21 04:48:10', 1, NULL),
(596, 2024, 'OCTUBRE', '2024-10-04', 'IMPTO GOBIERNO 4*1000', '84000.00', NULL, '105403612.41', NULL, '2025-10-21 04:48:10', 1, NULL),
(597, 2024, 'OCTUBRE', '2024-10-04', 'RETIRO TARJETA EN SUCURSAL', '21000000.00', NULL, '84403612.41', NULL, '2025-10-21 04:48:10', 1, NULL),
(598, 2024, 'OCTUBRE', '2024-10-06', 'ABONO INTERESES AHORRO', NULL, '693.72', '84404306.13', NULL, '2025-10-21 04:48:10', 1, NULL),
(599, 2024, 'OCTUBRE', '2024-10-07', 'PAGO DE PROV ROSALES SAS', NULL, '4683991.00', '89088297.13', NULL, '2025-10-21 04:48:10', 1, NULL),
(600, 2024, 'OCTUBRE', '2024-10-08', 'ABONO INTERESES AHORRO', NULL, '488.14', '89088785.27', NULL, '2025-10-21 04:48:10', 1, NULL),
(601, 2024, 'OCTUBRE', '2024-10-09', 'IMPTO GOBIERNO 4*1000', '2116.00', NULL, '89086669.27', NULL, '2025-10-21 04:48:10', 1, NULL),
(602, 2024, 'OCTUBRE', '2024-10-09', 'TRANSFERENCIA VIRTUAL PYME', '325000.00', NULL, '88761669.27', NULL, '2025-10-21 04:48:10', 1, NULL),
(603, 2024, 'OCTUBRE', '2024-10-09', 'TRANSFERENCIA VIRTUAL PYME', '204000.00', NULL, '88557669.27', NULL, '2025-10-21 04:48:10', 1, NULL),
(604, 2024, 'OCTUBRE', '2024-10-10', 'ABONO INTERESES AHORRO', NULL, '485.24', '88557669.27', NULL, '2025-10-21 04:48:10', 1, NULL),
(605, 2024, 'OCTUBRE', '2024-10-11', 'ABONO INTERESES AHORRO', NULL, '239.61', '88558394.12', NULL, '2025-10-21 04:48:10', 1, NULL),
(606, 2024, 'OCTUBRE', '2024-10-11', 'IMPTO GOBIERNO 4*1000', '4374.99', NULL, '88554394.12', NULL, '2025-10-21 04:48:10', 1, NULL),
(607, 2024, 'OCTUBRE', '2024-10-11', 'COMPRA EN DROGUERIA', '212490.00', NULL, '88341529.13', NULL, '2025-10-21 04:48:10', 1, NULL),
(608, 2024, 'OCTUBRE', '2024-10-11', 'COMPRA EN REST BURLA', '581259.00', NULL, '87760270.13', NULL, '2025-10-21 04:48:10', 1, NULL),
(609, 2024, 'OCTUBRE', '2024-10-11', 'RETIRO TARJETA EN SUC SERR', '300000.00', NULL, '87460270.13', NULL, '2025-10-21 04:48:10', 1, NULL),
(610, 2024, 'OCTUBRE', '2024-10-12', 'IMPTO GOBIERNO 4*1000', '56.76', NULL, '87460213.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(611, 2024, 'OCTUBRE', '2024-10-12', 'CUOTA DE MANEJO TARJETA DEBITO', '14190.00', NULL, '87446023.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(612, 2024, 'OCTUBRE', '2024-10-23', 'ABONO INTERESES AHORRO', NULL, '2874.93', '87448898.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(613, 2024, 'OCTUBRE', '2024-10-24', 'PAGO INTERBANC AUTOTROPICAL S', NULL, '1449370.00', '88898268.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(614, 2024, 'OCTUBRE', '2024-10-24', 'IMPTO GOBIERNO 4*1000', '2800.00', NULL, '88895468.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(615, 2024, 'OCTUBRE', '2024-10-24', 'TRANSFERENCIA VIRTUAL PYME', '700000.00', NULL, '88195468.30', NULL, '2025-10-21 04:48:10', 1, NULL),
(616, 2024, 'OCTUBRE', '2024-10-24', 'ABONO INTERESES AHORRO', NULL, '966.52', '88196434.82', NULL, '2025-10-21 04:48:10', 1, NULL),
(617, 2024, 'OCTUBRE', '2024-10-27', 'IMPTO GOBIERNO 4*1000', '2732.00', NULL, '88193702.82', NULL, '2025-10-21 04:48:10', 1, NULL),
(618, 2024, 'OCTUBRE', '2024-10-28', 'TRANSFERENCIA VIRTUAL PYME', '683000.00', NULL, '87510702.82', NULL, '2025-10-21 04:48:10', 1, NULL),
(619, 2024, 'OCTUBRE', '2024-10-30', 'ABONO INTERESES AHORRO', NULL, '719.25', '87511422.07', NULL, '2025-10-21 04:48:10', 1, NULL),
(620, 2024, 'OCTUBRE', '2024-10-31', 'ABONO INTERESES AHORRO', NULL, '283.68', '87511660.75', NULL, '2025-10-21 04:48:10', 1, NULL),
(621, 2024, 'OCTUBRE', '2024-10-31', 'IMPTO GOBIERNO 4*1000', '1553.20', NULL, '87510107.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(622, 2024, 'OCTUBRE', '2024-10-31', 'COMPRA EN TAYPA', '388300.00', NULL, '87121807.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(623, 2024, 'NOVIEMBRE', '2024-11-01', 'IMPTO GOBIERNO 4*1000', '12000.00', NULL, '87109807.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(624, 2024, 'NOVIEMBRE', '2024-11-01', 'TRANSFERENCIA VIRTUAL PYME', '1500000.00', NULL, '85609807.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(625, 2024, 'NOVIEMBRE', '2024-11-01', 'TRANSFERENCIA VIRTUAL PYME', '1500000.00', NULL, '84109807.55', NULL, '2025-10-21 04:48:10', 1, NULL),
(626, 2024, 'NOVIEMBRE', '2024-11-11', 'ABONO INTERESES AHORROS', NULL, '2534.80', '84112342.35', NULL, '2025-10-21 04:48:10', 1, NULL),
(627, 2024, 'NOVIEMBRE', '2024-11-12', 'IMPTO GOBIERNO 4*1000', '800.00', NULL, '84111542.35', NULL, '2025-10-21 04:48:10', 1, NULL),
(628, 2024, 'NOVIEMBRE', '2024-11-12', 'TRANSFERENCIA VIRTUAL PYME', '200000.00', NULL, '83911542.35', NULL, '2025-10-21 04:48:10', 1, NULL),
(629, 2024, 'NOVIEMBRE', '2024-11-13', 'ABONO INTERESES AHORROS', NULL, '459.78', '83912002.13', NULL, '2025-10-21 04:48:10', 1, NULL),
(630, 2024, 'NOVIEMBRE', '2024-11-14', 'IMPTO GOBIERNO 4*1000', '56.76', NULL, '83911945.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(631, 2024, 'NOVIEMBRE', '2024-11-14', 'CUOTA DE MANEJO', '14190.00', NULL, '83897755.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(632, 2024, 'NOVIEMBRE', '2024-11-17', 'ABONO INTERESES AHORROS', NULL, '919.40', '83898674.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(633, 2024, 'NOVIEMBRE', '2024-11-18', 'IMPTO GOBIERNO 4*1000', '6460.00', NULL, '83892214.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(634, 2024, 'NOVIEMBRE', '2024-11-18', 'TRANSFERENCIA VIRTUAL PYME', '1615000.00', NULL, '82277214.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(635, 2024, 'NOVIEMBRE', '2024-11-20', 'ABONO INTERESES AHORROS', NULL, '676.23', '82277891.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(636, 2024, 'NOVIEMBRE', '2024-11-21', 'COMPRA EN RESTAURANT', '421741.00', NULL, '81856150.00', NULL, '2025-10-21 04:48:10', 1, NULL),
(637, 2024, 'NOVIEMBRE', '2024-11-21', 'IMPTO GOBIERNO 4*1000', '1686.96', NULL, '81854463.04', NULL, '2025-10-21 04:48:10', 1, NULL),
(638, 2024, 'NOVIEMBRE', '2024-11-23', 'ABONO INTERESES AHORROS', NULL, '672.76', '81855135.80', NULL, '2025-10-21 04:48:10', 1, NULL),
(639, 2024, 'NOVIEMBRE', '2024-11-24', 'COMPRA EN COCO BEACH', '434000.00', NULL, '81421135.80', NULL, '2025-10-21 04:48:10', 1, NULL),
(640, 2024, 'NOVIEMBRE', '2024-11-24', 'IMPTO GOBIERNO 4*1000', '1736.00', NULL, '81419399.80', NULL, '2025-10-21 04:48:10', 1, NULL),
(641, 2024, 'NOVIEMBRE', '2024-11-24', 'ABONO INTERESES AHORROS', NULL, '223.06', '81419622.86', NULL, '2025-10-21 04:48:10', 1, NULL),
(642, 2024, 'NOVIEMBRE', '2024-11-25', 'COMPRA EN HOTEL GHL', '174695.00', NULL, '81244927.86', NULL, '2025-10-21 04:48:10', 1, NULL),
(643, 2024, 'NOVIEMBRE', '2024-11-25', 'IMPTO GOBIERNO 4*1000', '698.78', NULL, '81244229.08', NULL, '2025-10-21 04:48:10', 1, NULL),
(644, 2024, 'NOVIEMBRE', '2024-11-25', 'ABONO INTERESES AHORROS', NULL, '222.58', '81244451.66', NULL, '2025-10-21 04:48:10', 1, NULL),
(645, 2024, 'NOVIEMBRE', '2024-11-26', 'TRANSFERENCIA VIRTUAL PYME', '1200000.00', NULL, '80044451.66', NULL, '2025-10-21 04:48:10', 1, NULL),
(646, 2024, 'NOVIEMBRE', '2024-11-26', 'TRANSFERENCIA VIRTUAL PYME', '9900000.00', NULL, '70144451.66', NULL, '2025-10-21 04:48:10', 1, NULL),
(647, 2024, 'NOVIEMBRE', '2024-11-26', 'IMPTO GOBIERNO 4*1000', '44400.00', NULL, '70100051.66', NULL, '2025-10-21 04:48:10', 1, NULL),
(648, 2024, 'NOVIEMBRE', '2024-11-28', 'ABONO INTERESES AHORROS', NULL, '576.15', '70100627.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(649, 2024, 'NOVIEMBRE', '2024-11-29', 'RETIRO TARJETA EN SUCURSAL', '15000000.00', NULL, '55100627.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(650, 2024, 'NOVIEMBRE', '2024-11-29', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '54350627.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(651, 2024, 'NOVIEMBRE', '2024-11-29', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '53600627.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(652, 2024, 'NOVIEMBRE', '2024-11-29', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '52850627.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(653, 2024, 'NOVIEMBRE', '2024-11-29', 'RETIRO TARJETA EN SUCURSAL', '50000.00', NULL, '52800627.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(654, 2024, 'NOVIEMBRE', '2024-11-29', 'IMPTO GOBIERNO 4*1000', '69200.00', NULL, '52731427.81', NULL, '2025-10-21 04:48:10', 1, NULL),
(655, 2024, 'NOVIEMBRE', '2024-11-30', 'ABONO INTERESES AHORROS', NULL, '288.93', '52731716.74', NULL, '2025-10-21 04:48:10', 1, NULL),
(656, 2024, 'DICIEMBRE', '2024-12-04', 'ABONO INTERESES AHORROS', NULL, '577.88', '52732294.62', NULL, '2025-10-21 04:48:10', 1, NULL),
(657, 2024, 'DICIEMBRE', '2024-12-05', 'PAGO DE POV CEMENTOS ARGOS', NULL, '15901238.00', '68633532.62', NULL, '2025-10-21 04:48:10', 1, NULL),
(658, 2024, 'DICIEMBRE', '2024-12-12', 'ABONO INTERESES AHORROS', NULL, '1504.26', '68635036.88', NULL, '2025-10-21 04:48:10', 1, NULL),
(659, 2024, 'DICIEMBRE', '2024-12-13', 'IMPTO GOBIERNO 4*1000', '56.80', NULL, '68634980.08', NULL, '2025-10-21 04:48:10', 1, NULL),
(660, 2024, 'DICIEMBRE', '2024-12-13', 'CUOTA DE MANEJO TARJETO DEBITO', '14200.00', NULL, '68620780.08', NULL, '2025-10-21 04:48:10', 1, NULL),
(661, 2024, 'DICIEMBRE', '2024-12-14', 'ABONO INTERESES AHORROS', NULL, '376.00', '68621156.08', NULL, '2025-10-21 04:48:10', 1, NULL),
(662, 2024, 'DICIEMBRE', '2024-12-15', 'ABONO INTERESES AHORROS', NULL, '186.07', '68621342.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(663, 2024, 'DICIEMBRE', '2024-12-15', 'IMPTO GOBIERNO 4*1000', '2800.00', NULL, '68618542.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(664, 2024, 'DICIEMBRE', '2024-12-15', 'RETIRO CORRESPONSAL CB', '700000.00', NULL, '67918542.15', NULL, '2025-10-21 04:48:10', 1, NULL),
(665, 2024, 'DICIEMBRE', '2024-12-16', 'ABONO INTERESES AHORROS', NULL, '177.86', '67918720.01', NULL, '2025-10-21 04:48:10', 1, NULL),
(666, 2024, 'DICIEMBRE', '2024-12-16', 'IMPTO GOBIERNO 4*1000', '11940.24', NULL, '67906779.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(667, 2024, 'DICIEMBRE', '2024-12-16', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '67156779.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(668, 2024, 'DICIEMBRE', '2024-12-16', 'TRANSFERENCIA VIRTUAL PYME', '276156.00', NULL, '66880623.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(669, 2024, 'DICIEMBRE', '2024-12-16', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '66130623.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(670, 2024, 'DICIEMBRE', '2024-12-16', 'TRANSFERENCIA VIRTUAL PYME', '276156.00', NULL, '65854467.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(671, 2024, 'DICIEMBRE', '2024-12-16', 'TRANSFERENCIA VIRTUAL PYME', '182750.00', NULL, '65671717.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(672, 2024, 'DICIEMBRE', '2024-12-16', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '64921717.77', NULL, '2025-10-21 04:48:10', 1, NULL),
(673, 2024, 'DICIEMBRE', '2024-12-17', 'IMPTO GOBIERNO 4*1000', '4194.40', NULL, '64917523.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(674, 2024, 'DICIEMBRE', '2024-12-17', 'TRANSFERENCIA VIRTUAL PYME', '925600.00', NULL, '63991923.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(675, 2024, 'DICIEMBRE', '2024-12-17', 'TRANSFERENCIA VIRTUAL PYME', '123000.00', NULL, '63868923.37', NULL, '2025-10-21 04:48:10', 1, NULL),
(676, 2024, 'DICIEMBRE', '2024-12-18', 'ABONO INTERESES AHORROS', NULL, '349.96', '63869273.33', NULL, '2025-10-21 04:48:10', 1, NULL),
(677, 2024, 'DICIEMBRE', '2024-12-19', 'PAGO DE POV CEMENTOS ARGOS', NULL, '654416.00', '64523689.33', NULL, '2025-10-21 04:48:10', 1, NULL),
(678, 2024, 'DICIEMBRE', '2024-12-21', 'ABONO INTERESES AHORROS', NULL, '530.31', '64524219.64', NULL, '2025-10-21 04:48:10', 1, NULL),
(679, 2024, 'DICIEMBRE', '2024-12-22', 'IMPTO GOBIERNO 4*1000', '2000.00', NULL, '64522219.64', NULL, '2025-10-21 04:48:10', 1, NULL),
(680, 2024, 'DICIEMBRE', '2024-12-22', 'TRANSFERENCIA VIRTUAL PYME', '500000.00', NULL, '64022219.64', NULL, '2025-10-21 04:48:10', 1, NULL),
(681, 2024, 'DICIEMBRE', '2024-12-23', 'ABONO INTERESES AHORROS', NULL, '350.80', '64022570.44', NULL, '2025-10-21 04:48:10', 1, NULL),
(682, 2024, 'DICIEMBRE', '2024-12-24', 'IMPTO GOBIERNO 4*1000', '1309.76', NULL, '64021260.68', NULL, '2025-10-21 04:48:10', 1, NULL),
(683, 2024, 'DICIEMBRE', '2024-12-24', 'COMPRA EN SUPERTIEND REGALOS ', '327440.00', NULL, '63693820.68', NULL, '2025-10-21 04:48:10', 1, NULL),
(684, 2024, 'DICIEMBRE', '2024-12-25', 'ABONO INTERESES AHORROS', NULL, '349.00', '63694169.68', NULL, '2025-10-21 04:48:10', 1, NULL),
(685, 2024, 'DICIEMBRE', '2024-12-26', 'IMPTO GOBIERNO 4*1000', '14400.00', NULL, '63679769.68', NULL, '2025-10-21 04:48:10', 1, NULL),
(686, 2024, 'DICIEMBRE', '2024-12-26', 'TRANSFERENCIA VIRTUAL PYME', '3600000.00', NULL, '60079769.68', NULL, '2025-10-21 04:48:10', 1, NULL),
(687, 2024, 'DICIEMBRE', '2024-12-28', 'ABONO INTERESES AHORROS', NULL, '493.80', '60080263.48', NULL, '2025-10-21 04:48:10', 1, NULL),
(688, 2024, 'DICIEMBRE', '2024-12-29', 'ABONO INTERESES AHORROS', NULL, '158.41', '60080421.89', NULL, '2025-10-21 04:48:10', 1, NULL),
(689, 2024, 'DICIEMBRE', '2024-12-29', 'IMPTO GOBIERNO 4*1000', '9000.00', NULL, '60071421.89', NULL, '2025-10-21 04:48:10', 1, NULL),
(690, 2024, 'DICIEMBRE', '2024-12-29', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '59321421.89', NULL, '2025-10-21 04:48:10', 1, NULL),
(691, 2024, 'DICIEMBRE', '2024-12-29', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '58571421.89', NULL, '2025-10-21 04:48:10', 1, NULL),
(692, 2024, 'DICIEMBRE', '2024-12-29', 'TRANSFERENCIA VIRTUAL PYME', '750000.00', NULL, '57821421.89', NULL, '2025-10-21 04:48:10', 1, NULL),
(693, 2024, 'DICIEMBRE', '2024-12-30', 'Pago proveedores rosales', NULL, '23419958.00', '81241379.89', NULL, '2025-10-21 04:48:10', 1, NULL),
(694, 2024, 'DICIEMBRE', '2024-12-31', 'ABONO INTERESES AHORROS', NULL, '445.14', '81241825.03', NULL, '2025-10-21 04:48:10', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `document_type` enum('CC','CE','TI','RC','PA') DEFAULT 'CC',
  `document_number` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','O') DEFAULT NULL,
  `marital_status` enum('Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión Libre') DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `work_schedule` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `employment_type` enum('Tiempo Completo','Medio Tiempo','Por Horas','Por Contrato') DEFAULT 'Tiempo Completo',
  `eps_id` varchar(50) DEFAULT NULL,
  `arl_id` varchar(50) DEFAULT NULL,
  `pension_fund_id` varchar(50) DEFAULT NULL,
  `compensation_fund_id` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `account_type` enum('Ahorros','Corriente') DEFAULT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `notes` text,
  `is_active` tinyint(1) DEFAULT '1',
  `role_id` int DEFAULT NULL,
  `contract_status_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `document_type`, `document_number`, `birth_date`, `gender`, `marital_status`, `emergency_contact_name`, `emergency_contact_phone`, `phone`, `address`, `position`, `salary`, `hire_date`, `termination_date`, `work_schedule`, `department`, `manager_id`, `employment_type`, `eps_id`, `arl_id`, `pension_fund_id`, `compensation_fund_id`, `bank_name`, `account_number`, `account_type`, `profile_picture`, `notes`, `is_active`, `role_id`, `contract_status_id`, `created_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 'Juan Manuel', 'Administrador', 'juanmanuel@operasoluciones.com', '$2a$12$UH3BnGQSh6mHS2dKRz0j.OpO6jEe7tVSIOjgJofbIGtL23k3mITdm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-18 12:20:41', 1, NULL, NULL, NULL),
(2, 'Daniel', 'Ramirez', 'daniel.ramirez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '3189139831', '1995-06-01', 'M', 'Soltero/a', 'María Ramirez', '3001234567', '3009876543', 'Calle 123 #45-67, Cartagena', 'Desarrollador Senior', '4500000.00', '2023-08-30', NULL, '8:00 a.m - 5:00 p.m.', 'Tecnología', 1, 'Tiempo Completo', 'SURA', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BANCOLOMBIA', '1234567890', 'Ahorros', NULL, 'Desarrollador con experiencia en React y Node.js', 1, 2, 1, '2025-09-18 12:27:07', 1, 1, '2025-10-27 08:41:45', 1),
(3, 'María', 'González', 'maria.gonzalez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '1234567890', '1990-03-15', 'F', 'Casado/a', 'Carlos González', '3002345678', '3008765432', 'Carrera 45 #78-90, Barranquilla', 'Gerente de Recursos Humanos', '6500000.00', '2022-01-15', NULL, '8:00 a.m - 6:00 p.m.', 'Recursos Humanos', 1, 'Tiempo Completo', 'SANITAS', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BBVA', '2345678901', 'Corriente', NULL, 'Experta en gestión de talento humano', 1, 3, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:25', 1),
(4, 'Carlos', 'Mendoza', 'carlos.mendoza@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '2345678901', '1988-11-22', 'M', 'Soltero/a', 'Ana Mendoza', '3003456789', '3007654321', 'Calle 67 #12-34, Medellín', 'Contador Senior', '5200000.00', '2021-06-01', NULL, '8:00 a.m - 5:00 p.m.', 'Contabilidad', 1, 'Tiempo Completo', 'NUEVA EPS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'SCOTIABANK', '3456789012', 'Ahorros', NULL, 'Contador público con especialización en tributaria', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:28', 1),
(5, 'Ana', 'Rodríguez', 'ana.rodriguez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '3456789012', '1992-07-08', 'F', 'Soltero/a', 'Luis Rodríguez', '3004567890', '3006543210', 'Carrera 89 #23-45, Bogotá', 'Analista de Sistemas', '3800000.00', '2023-02-15', NULL, '8:00 a.m - 5:00 p.m.', 'Tecnología', 2, 'Tiempo Completo', 'SURA', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BANCOLOMBIA', '4567890123', 'Ahorros', NULL, 'Analista especializada en sistemas de información', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:32', 1),
(6, 'Luis', 'Hernández', 'luis.hernandez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '4567890123', '1985-12-03', 'M', 'Casado/a', 'Carmen Hernández', '3005678901', '3005432109', 'Calle 12 #56-78, Cali', 'Supervisor de Obras', '4800000.00', '2020-09-01', NULL, '7:00 a.m - 4:00 p.m.', 'Construcción', 1, 'Tiempo Completo', 'SANITAS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BBVA', '5678901234', 'Corriente', NULL, 'Supervisor con 10 años de experiencia en construcción', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:36', 1),
(7, 'Carmen', 'Vargas', 'carmen.vargas@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '5678901234', '1993-04-18', 'F', 'Soltero/a', 'Roberto Vargas', '3006789012', '3004321098', 'Carrera 34 #67-89, Bucaramanga', 'Asistente Administrativa', '2800000.00', '2023-05-20', NULL, '8:00 a.m - 5:00 p.m.', 'Administración', 3, 'Tiempo Completo', 'NUEVA EPS', 'SURA', 'COLFONDOS', 'CAJACOPI', 'SCOTIABANK', '6789012345', 'Ahorros', NULL, 'Asistente administrativa con experiencia en gestión documental', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:39', 1),
(8, 'Roberto', 'Silva', 'roberto.silva@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '6789012345', '1987-09-25', 'M', 'Divorciado/a', 'Patricia Silva', '3007890123', '3003210987', 'Calle 78 #90-12, Pereira', 'Ingeniero Civil', '5500000.00', '2019-03-10', NULL, '8:00 a.m - 5:00 p.m.', 'Ingeniería', 1, 'Tiempo Completo', 'SANITAS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BANCOLOMBIA', '7890123456', 'Corriente', NULL, 'Ingeniero civil especializado en estructuras', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:43', 1),
(9, 'Patricia', 'Morales', 'patricia.morales@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '7890123456', '1991-01-12', 'F', 'Casado/a', 'Fernando Morales', '3008901234', '3002109876', 'Carrera 56 #78-90, Manizales', 'Auditora Interna', '4200000.00', '2022-08-15', NULL, '8:00 a.m - 5:00 p.m.', 'Auditoría', 1, 'Tiempo Completo', 'SURA', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BBVA', '8901234567', 'Ahorros', NULL, 'Auditora con certificación en normas internacionales', 1, 4, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:46', 1),
(10, 'Fernando', 'Castro', 'fernando.castro@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '8901234567', '1989-06-30', 'M', 'Soltero/a', 'Isabel Castro', '3009012345', '3001098765', 'Calle 90 #12-34, Armenia', 'Coordinador de Proyectos', '4600000.00', '2021-11-01', NULL, '8:00 a.m - 6:00 p.m.', 'Proyectos', 1, 'Tiempo Completo', 'NUEVA EPS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'SCOTIABANK', '9012345678', 'Corriente', NULL, 'Coordinador con PMP y experiencia en gestión de proyectos', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:48', 1),
(11, 'Isabel', 'Jiménez', 'isabel.jimenez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '9012345678', '1994-08-14', 'F', 'Soltero/a', 'Miguel Jiménez', '3000123456', '3000987654', 'Carrera 12 #34-56, Pasto', 'Diseñadora Gráfica', '3200000.00', '2023-07-01', NULL, '8:00 a.m - 5:00 p.m.', 'Diseño', 1, 'Tiempo Completo', 'SANITAS', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BANCOLOMBIA', '0123456789', 'Ahorros', NULL, 'Diseñadora gráfica especializada en branding corporativo', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:51', 1),
(12, 'Miguel', 'Torres', 'miguel.torres@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '0123456789', '1986-02-28', 'M', 'Casado/a', 'Elena Torres', '3001234567', '3009876543', 'Calle 45 #67-89, Santa Marta', 'Jefe de Seguridad', '3900000.00', '2020-12-01', NULL, '6:00 a.m - 2:00 p.m.', 'Seguridad', 1, 'Tiempo Completo', 'NUEVA EPS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BBVA', '1234567890', 'Corriente', NULL, 'Jefe de seguridad con certificación en gestión de riesgos', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, '2025-10-27 08:42:55', 1),
(13, 'EDGARDO JOSE ', 'HERNANDEZ HERAZO', 'JFJF@GMAIL.COM', '$2a$12$xJCIXZ3XB.aM34UbqzSCyeyu55gJj8/74NDsHD8k1et.fxnq.ssea', 'CC', '1052089540', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'OFICIOS VARIOS', '1623500.00', '2024-10-23', '2025-10-22', 'DIURNO 8 HORAS', 'juanmanuel@operasoluciones.com', NULL, 'Tiempo Completo', NULL, 'SURA', NULL, 'CONFENALCO', NULL, NULL, NULL, NULL, 'INMOBILIARIA', 1, 2, 1, '2025-10-27 08:56:34', 1, 1, NULL, NULL),
(14, 'JUAN PABLO', 'RODRIGUEZ LEON', 'GDGDG@GMAIL.COM', '$2a$12$gyNYpUwecPNNCsv8TCMEsOnpcHOgXnIeo1ESwzAZR3SgAs0ER80d2', 'CC', '9237159', NULL, 'M', NULL, NULL, NULL, NULL, NULL, 'OFICIOS VARIOS', '1623500.00', '2024-10-23', '2025-10-22', 'DIURNO 8 HOIRAS', 'juanmanuel@operasoluciones.com', NULL, 'Tiempo Completo', NULL, 'SURA', NULL, 'CONFENALCO', NULL, NULL, NULL, NULL, 'MERCANTIL', 1, 2, 1, '2025-10-27 08:59:29', 1, 1, NULL, NULL),
(15, 'JHON FREDY', 'HERRERA PEREZ', 'RERE@GMAIL.COM', '$2a$12$OcFKygtdeAv3/bhgr21bOee0DQ..rqMtjoegL6bx46EAxtt5g7GCK', 'CC', '1007713187', NULL, 'M', NULL, NULL, NULL, NULL, NULL, 'OFICIOS VARIOS', '1623500.00', '2024-11-11', NULL, 'DIURNO 8 HORAS', 'juanmanuel@operasoluciones.com', NULL, 'Por Contrato', NULL, 'SURA', NULL, NULL, NULL, NULL, NULL, NULL, 'MERCANTIL', 0, 2, 3, '2025-10-27 09:02:51', 1, 1, NULL, NULL),
(16, 'JHON JAIRO', 'HERRERA TEHERAN', 'OTOTO@GMAIL.COM', '$2a$12$va0oZMJyTfIPQs./M/H9HO5/g278ouXL9Y04Nw.jMaGdxjzRaquCe', 'CC', '92449545', NULL, 'M', NULL, NULL, NULL, NULL, NULL, 'OFICIOS VARIOS', '1623500.00', '2025-02-21', NULL, NULL, 'juanmanuel@operasoluciones.com', NULL, 'Tiempo Completo', NULL, 'SURA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 2, 3, '2025-10-27 09:19:10', 1, 1, NULL, NULL),
(17, 'VALENTINA ', 'FERRER VARELA ', 'FDF@GMAIL.COM', '$2a$12$A7YPNEwS5NQB79r3o7Icr.y1borI9dL85.FlasaS5JdwTT19I6MEC', 'CC', '1143470112', NULL, 'F', 'Soltero/a', NULL, NULL, NULL, NULL, 'SISO', '1623500.00', '2025-01-23', NULL, NULL, 'juanmanuel@operasoluciones.com', NULL, 'Tiempo Completo', NULL, 'SURA', NULL, NULL, NULL, NULL, NULL, 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/profile-pictures/fd0e7ec6-98aa-49d6-9438-e98f5842ec93_748505.jpeg', NULL, 0, 2, 3, '2025-10-27 09:52:29', 1, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `code` varchar(30) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `user_roles`
--

INSERT INTO `user_roles` (`id`, `name`, `code`, `description`, `is_active`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 'Administrador', 'ADMIN', 'Administrador del sistema con acceso completo', 1, '2025-10-20 21:30:54', 1, NULL),
(2, 'Empleado', 'EMPLOYEE', 'Empleado regular con acceso limitado', 1, '2025-10-20 21:30:54', 1, NULL),
(3, 'Recursos Humanos', 'HR', 'Responsable de gestión de personal', 1, '2025-10-20 21:30:54', 1, NULL),
(4, 'Auditor', 'AUDITOR', 'Auditor interno o externo', 1, '2025-10-20 21:30:54', 1, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `archivos_ausencias`
--
ALTER TABLE `archivos_ausencias`
  ADD PRIMARY KEY (`id_archivo`),
  ADD KEY `idx_archivos_ausencias_ausencia` (`id_ausencia`),
  ADD KEY `idx_archivos_ausencias_active` (`is_active`),
  ADD KEY `idx_archivos_ausencias_fecha_subida` (`fecha_subida`),
  ADD KEY `fk_archivos_ausencias_uploaded_by` (`uploaded_by`);

--
-- Indices de la tabla `ausencias`
--
ALTER TABLE `ausencias`
  ADD PRIMARY KEY (`id_ausencia`),
  ADD KEY `idx_ausencias_colaborador` (`id_colaborador`),
  ADD KEY `idx_ausencias_tipo` (`id_tipo_ausencia`),
  ADD KEY `idx_ausencias_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_ausencias_fecha_fin` (`fecha_fin`),
  ADD KEY `idx_ausencias_dias_ausencia` (`dias_ausencia`),
  ADD KEY `idx_ausencias_activo` (`activo`),
  ADD KEY `idx_ausencias_fecha_registro` (`fecha_registro`),
  ADD KEY `fk_ausencias_usuario_registro` (`id_usuario_registro`),
  ADD KEY `fk_ausencias_created_by` (`created_by`),
  ADD KEY `fk_ausencias_updated_by` (`updated_by`);

--
-- Indices de la tabla `contract_statuses`
--
ALTER TABLE `contract_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_contract_statuses_active` (`is_active`);

--
-- Indices de la tabla `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_documents_user_id` (`user_id`),
  ADD KEY `idx_documents_document_type_id` (`document_type_id`),
  ADD KEY `idx_documents_deleted_at` (`deleted_at`);

--
-- Indices de la tabla `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_document_types_active` (`is_active`);

--
-- Indices de la tabla `file_folders`
--
ALTER TABLE `file_folders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_file_folders_parent` (`parent_id`),
  ADD KEY `idx_file_folders_path` (`path`(191)),
  ADD KEY `idx_file_folders_active` (`is_active`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `file_system_files`
--
ALTER TABLE `file_system_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_file_system_files_folder` (`folder_id`),
  ADD KEY `idx_file_system_files_path` (`file_path`(191)),
  ADD KEY `idx_file_system_files_active` (`is_active`),
  ADD KEY `idx_file_system_files_mime_type` (`mime_type`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `libro_gastos_facturacion`
--
ALTER TABLE `libro_gastos_facturacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_libro_gastos_year` (`year`),
  ADD KEY `idx_libro_gastos_mes` (`mes`),
  ADD KEY `idx_libro_gastos_year_mes` (`year`,`mes`),
  ADD KEY `idx_libro_gastos_fecha` (`fecha`),
  ADD KEY `idx_libro_gastos_cliente` (`cliente`),
  ADD KEY `idx_libro_gastos_nit` (`nit`),
  ADD KEY `idx_libro_gastos_servicio` (`servicio`);

--
-- Indices de la tabla `payroll_mes_a_mes`
--
ALTER TABLE `payroll_mes_a_mes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_mes_a_mes_year` (`year`),
  ADD KEY `idx_payroll_mes_a_mes_mes` (`mes`),
  ADD KEY `idx_payroll_mes_a_mes_year_mes` (`year`,`mes`),
  ADD KEY `idx_payroll_mes_a_mes_fecha` (`fecha`),
  ADD KEY `idx_payroll_mes_a_mes_proveedor` (`proveedor`),
  ADD KEY `idx_payroll_mes_a_mes_nit` (`nit`),
  ADD KEY `idx_payroll_mes_a_mes_obra` (`obra`);

--
-- Indices de la tabla `tipos_ausencia`
--
ALTER TABLE `tipos_ausencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tipos_ausencia_active` (`is_active`),
  ADD KEY `fk_tipos_ausencia_created_by` (`created_by`),
  ADD KEY `fk_tipos_ausencia_updated_by` (`updated_by`);

--
-- Indices de la tabla `transferencias_pagos`
--
ALTER TABLE `transferencias_pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transferencias_year` (`year`),
  ADD KEY `idx_transferencias_mes` (`mes`),
  ADD KEY `idx_transferencias_year_mes` (`year`,`mes`),
  ADD KEY `idx_transferencias_fecha` (`fecha`),
  ADD KEY `idx_transferencias_actividad` (`actividad`),
  ADD KEY `idx_transferencias_concepto` (`concepto`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `document_number` (`document_number`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role_id` (`role_id`),
  ADD KEY `idx_users_contract_status_id` (`contract_status_id`),
  ADD KEY `idx_users_deleted_at` (`deleted_at`),
  ADD KEY `idx_users_document_number` (`document_number`),
  ADD KEY `idx_users_document_type` (`document_type`),
  ADD KEY `idx_users_birth_date` (`birth_date`),
  ADD KEY `idx_users_hire_date` (`hire_date`),
  ADD KEY `idx_users_termination_date` (`termination_date`),
  ADD KEY `idx_users_department` (`department`),
  ADD KEY `idx_users_manager_id` (`manager_id`),
  ADD KEY `idx_users_is_active` (`is_active`),
  ADD KEY `idx_users_employment_type` (`employment_type`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_user_roles_active` (`is_active`),
  ADD KEY `idx_user_roles_code` (`code`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `archivos_ausencias`
--
ALTER TABLE `archivos_ausencias`
  MODIFY `id_archivo` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ausencias`
--
ALTER TABLE `ausencias`
  MODIFY `id_ausencia` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contract_statuses`
--
ALTER TABLE `contract_statuses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `document_types`
--
ALTER TABLE `document_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `file_folders`
--
ALTER TABLE `file_folders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `file_system_files`
--
ALTER TABLE `file_system_files`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `libro_gastos_facturacion`
--
ALTER TABLE `libro_gastos_facturacion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `payroll_mes_a_mes`
--
ALTER TABLE `payroll_mes_a_mes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos_ausencia`
--
ALTER TABLE `tipos_ausencia`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `transferencias_pagos`
--
ALTER TABLE `transferencias_pagos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=695;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `archivos_ausencias`
--
ALTER TABLE `archivos_ausencias`
  ADD CONSTRAINT `fk_archivos_ausencias_ausencia` FOREIGN KEY (`id_ausencia`) REFERENCES `ausencias` (`id_ausencia`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_archivos_ausencias_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `ausencias`
--
ALTER TABLE `ausencias`
  ADD CONSTRAINT `fk_ausencias_colaborador` FOREIGN KEY (`id_colaborador`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ausencias_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_ausencias_tipo` FOREIGN KEY (`id_tipo_ausencia`) REFERENCES `tipos_ausencia` (`id`),
  ADD CONSTRAINT `fk_ausencias_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ausencias_usuario_registro` FOREIGN KEY (`id_usuario_registro`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_documents_document_type_id` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`),
  ADD CONSTRAINT `fk_documents_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `file_folders`
--
ALTER TABLE `file_folders`
  ADD CONSTRAINT `file_folders_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `file_folders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `file_folders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `file_system_files`
--
ALTER TABLE `file_system_files`
  ADD CONSTRAINT `file_system_files_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `file_folders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `file_system_files_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `tipos_ausencia`
--
ALTER TABLE `tipos_ausencia`
  ADD CONSTRAINT `fk_tipos_ausencia_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_tipos_ausencia_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_contract_status_id` FOREIGN KEY (`contract_status_id`) REFERENCES `contract_statuses` (`id`),
  ADD CONSTRAINT `fk_users_manager_id` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
