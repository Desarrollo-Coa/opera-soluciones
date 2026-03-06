-- =================================================================================
-- MIGRACIÓN 007 - RENOMBRAMIENTO COMPLETO AL ESTÁNDAR OS_
-- =================================================================================
-- Descripción: Renombra todas las tablas con prefijo OS_ y todos sus campos
--              al estándar en español con prefijo por tabla.
-- Convención:
--   - Tablas        : OS_<NOMBRE_TABLA>
--   - PK            : <PREFIJO>ID<TABLA>_PK
--   - FK en tabla   : <PREFIJO_TABLA_ORIGEN>ID<TABLA_ORIGEN>_FK
--   - Auditoría     : <PREFIJO>FECHA_CREACION, <PREFIJO>CREADO_POR, etc.
-- Fecha: 2026-03-05
-- Autor: SGI Opera Soluciones
-- =================================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = '';

-- ========================================================================
-- PASO 1: ELIMINAR TODAS LAS CONSTRAINTS FK EXISTENTES
-- (Necesario para poder renombrar columnas referenciadas)
-- ========================================================================

-- FK de users
ALTER TABLE users
    DROP FOREIGN KEY fk_users_role_id,
    DROP FOREIGN KEY fk_users_contract_status_id,
    DROP FOREIGN KEY fk_users_manager_id,
    DROP FOREIGN KEY fk_users_cargo_id;

-- FK de documents
ALTER TABLE documents
    DROP FOREIGN KEY fk_documents_user_id,
    DROP FOREIGN KEY fk_documents_document_type_id;

-- FK de liquidaciones_nomina
ALTER TABLE liquidaciones_nomina
    DROP FOREIGN KEY fk_liquidaciones_emp,
    DROP FOREIGN KEY fk_liquidaciones_creator;

-- FK de detalle_liquidacion
ALTER TABLE detalle_liquidacion
    DROP FOREIGN KEY fk_detalle_liq,
    DROP FOREIGN KEY fk_detalle_concepto;

-- FK de novedades_nomina
ALTER TABLE novedades_nomina
    DROP FOREIGN KEY fk_novedades_emp,
    DROP FOREIGN KEY fk_novedades_con;

-- FK de ausencias
ALTER TABLE ausencias
    DROP FOREIGN KEY fk_ausencias_colaborador,
    DROP FOREIGN KEY fk_ausencias_tipo,
    DROP FOREIGN KEY fk_ausencias_usuario_registro,
    DROP FOREIGN KEY fk_ausencias_created_by,
    DROP FOREIGN KEY fk_ausencias_updated_by;

-- FK de archivos_ausencias
ALTER TABLE archivos_ausencias
    DROP FOREIGN KEY fk_archivos_ausencias_ausencia,
    DROP FOREIGN KEY fk_archivos_ausencias_uploaded_by;

-- FK de tipos_ausencia
ALTER TABLE tipos_ausencia
    DROP FOREIGN KEY fk_tipos_ausencia_created_by,
    DROP FOREIGN KEY fk_tipos_ausencia_updated_by;

-- FK de municipios
ALTER TABLE municipios
    DROP FOREIGN KEY municipios_ibfk_1;

-- FK de file_folders
ALTER TABLE file_folders
    DROP FOREIGN KEY file_folders_ibfk_1,
    DROP FOREIGN KEY file_folders_ibfk_2;

-- FK de file_system_files
ALTER TABLE file_system_files
    DROP FOREIGN KEY file_system_files_ibfk_1,
    DROP FOREIGN KEY file_system_files_ibfk_2;

-- ========================================================================
-- PASO 2: ELIMINAR ÍNDICES CON NOMBRES CONFLICTIVOS (por renombramiento)
-- ========================================================================

ALTER TABLE users
    DROP INDEX idx_users_email,
    DROP INDEX idx_users_role_id,
    DROP INDEX idx_users_contract_status_id,
    DROP INDEX idx_users_deleted_at,
    DROP INDEX idx_users_document_number,
    DROP INDEX idx_users_document_type,
    DROP INDEX idx_users_birth_date,
    DROP INDEX idx_users_hire_date,
    DROP INDEX idx_users_termination_date,
    DROP INDEX idx_users_department,
    DROP INDEX idx_users_manager_id,
    DROP INDEX idx_users_is_active,
    DROP INDEX idx_users_employment_type;

ALTER TABLE documents
    DROP INDEX idx_documents_user_id,
    DROP INDEX idx_documents_document_type_id,
    DROP INDEX idx_documents_deleted_at;

ALTER TABLE liquidaciones_nomina
    DROP INDEX uk_liquidacion;

-- ========================================================================
-- PASO 3: RENOMBRAR COLUMNAS EN CADA TABLA (antes de renombrar la tabla)
-- ========================================================================

-- ── OS_ROLES (user_roles) ────────────────────────────────────────────────
ALTER TABLE user_roles
    CHANGE COLUMN `id`          `RO_IDROL_PK`           INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `name`        `RO_NOMBRE`              VARCHAR(50) NOT NULL,
    CHANGE COLUMN `code`        `RO_CODIGO`              VARCHAR(30) NOT NULL,
    CHANGE COLUMN `description` `RO_DESCRIPCION`         TEXT,
    CHANGE COLUMN `is_active`   `RO_ACTIVO`              BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `created_at`  `RO_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`  `RO_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`  `RO_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`  `RO_ACTUALIZADO_POR`     INT;

-- ── OS_TIPOS_DOCUMENTO (document_types) ─────────────────────────────────
ALTER TABLE document_types
    CHANGE COLUMN `id`          `TD_IDTIPO_DOCUMENTO_PK` INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `name`        `TD_NOMBRE`              VARCHAR(50) NOT NULL,
    CHANGE COLUMN `description` `TD_DESCRIPCION`         TEXT,
    CHANGE COLUMN `is_active`   `TD_ACTIVO`              BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `created_at`  `TD_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`  `TD_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`  `TD_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`  `TD_ACTUALIZADO_POR`     INT;

-- ── OS_ESTADOS_CONTRATO (contract_statuses) ──────────────────────────────
ALTER TABLE contract_statuses
    CHANGE COLUMN `id`          `EC_IDESTADO_CONTRATO_PK` INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `name`        `EC_NOMBRE`               VARCHAR(50) NOT NULL,
    CHANGE COLUMN `description` `EC_DESCRIPCION`          TEXT,
    CHANGE COLUMN `is_active`   `EC_ACTIVO`               BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `created_at`  `EC_FECHA_CREACION`       DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`  `EC_CREADO_POR`           INT NOT NULL,
    CHANGE COLUMN `updated_at`  `EC_FECHA_ACTUALIZACION`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`  `EC_ACTUALIZADO_POR`      INT;

-- ── OS_CARGOS (cargos) ────────────────────────────────────────────────────
ALTER TABLE cargos
    CHANGE COLUMN `id`                       `CA_IDCARGO_PK`              INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`                   `CA_NOMBRE`                  VARCHAR(100) NOT NULL,
    CHANGE COLUMN `sueldo_mensual_base`       `CA_SUELDO_BASE`             DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `jornada_diaria_estandar`   `CA_JORNADA_DIARIA`          INT NOT NULL,
    CHANGE COLUMN `aplica_auxilio_transporte` `CA_APLICA_AUXILIO`          BOOLEAN NOT NULL,
    CHANGE COLUMN `clase_riesgo_arl`          `CA_CLASE_RIESGO_ARL`        VARCHAR(50) NOT NULL,
    CHANGE COLUMN `porcentaje_riesgo_arl`     `CA_PORCENTAJE_RIESGO_ARL`   DECIMAL(5,3) NOT NULL,
    CHANGE COLUMN `description`               `CA_DESCRIPCION`             TEXT,
    CHANGE COLUMN `is_active`                 `CA_ACTIVO`                  BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `created_at`                `CA_FECHA_CREACION`          DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`                `CA_CREADO_POR`              INT NOT NULL,
    CHANGE COLUMN `updated_at`                `CA_FECHA_ACTUALIZACION`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`                `CA_ACTUALIZADO_POR`         INT;

-- ── OS_PARAMETROS_NOMINA (parametros_nomina) ─────────────────────────────
ALTER TABLE parametros_nomina
    CHANGE COLUMN `id`                      `PN_IDPARAMETRO_PK`          INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `ano_vigencia`             `PN_ANIO_VIGENCIA`           INT NOT NULL,
    CHANGE COLUMN `smmlv`                    `PN_SMMLV`                   DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `auxilio_transporte`       `PN_AUXILIO_TRANSPORTE`      DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `horas_semanales_maximas`  `PN_HORAS_SEMANALES_MAX`     INT NOT NULL,
    CHANGE COLUMN `horas_mensuales_promedio` `PN_HORAS_MENSUALES_PROM`    INT NOT NULL,
    CHANGE COLUMN `fecha_cambio_jornada`     `PN_FECHA_CAMBIO_JORNADA`    DATE,
    CHANGE COLUMN `nueva_horas_semanales`    `PN_NUEVAS_HORAS_SEMANALES`  INT,
    CHANGE COLUMN `nueva_horas_mensuales`    `PN_NUEVAS_HORAS_MENSUALES`  INT,
    CHANGE COLUMN `created_at`               `PN_FECHA_CREACION`          DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_at`               `PN_FECHA_ACTUALIZACION`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── OS_CONCEPTOS_NOMINA (conceptos_nomina) ───────────────────────────────
ALTER TABLE conceptos_nomina
    CHANGE COLUMN `codigo`               `CN_IDCONCEPTO_PK`          VARCHAR(20) NOT NULL,
    CHANGE COLUMN `nombre`               `CN_NOMBRE`                 VARCHAR(100) NOT NULL,
    CHANGE COLUMN `tipo`                 `CN_TIPO`                   ENUM('Devengo', 'Deducción', 'Aporte Empleador', 'Info') NOT NULL,
    CHANGE COLUMN `afecta_ibc_salud`     `CN_AFECTA_IBC_SALUD`       BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `afecta_ibc_pension`   `CN_AFECTA_IBC_PENSION`     BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `afecta_ibc_arl`       `CN_AFECTA_IBC_ARL`         BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `constitutivo_salario` `CN_CONSTITUTIVO_SALARIO`   BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `es_novedad`           `CN_ES_NOVEDAD`             BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `created_at`           `CN_FECHA_CREACION`         DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_at`           `CN_FECHA_ACTUALIZACION`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── OS_ENTIDADES_EPS (entidades_eps) ─────────────────────────────────────
ALTER TABLE entidades_eps
    CHANGE COLUMN `id`                    `EP_IDEPS_PK`               INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`                `EP_NOMBRE`                 VARCHAR(100) NOT NULL,
    CHANGE COLUMN `codigo_minproteccion`  `EP_CODIGO_MINPROTECCION`   VARCHAR(20),
    CHANGE COLUMN `is_active`             `EP_ACTIVO`                 BOOLEAN DEFAULT TRUE;

-- ── OS_ENTIDADES_ARL (entidades_arl) ─────────────────────────────────────
ALTER TABLE entidades_arl
    CHANGE COLUMN `id`        `AR_IDARL_PK`   INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`    `AR_NOMBRE`     VARCHAR(150) NOT NULL,
    CHANGE COLUMN `is_active` `AR_ACTIVO`     BOOLEAN DEFAULT TRUE;

-- ── OS_ENTIDADES_PENSION (entidades_pension) ──────────────────────────────
ALTER TABLE entidades_pension
    CHANGE COLUMN `id`        `PE_IDPENSION_PK` INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`    `PE_NOMBRE`       VARCHAR(100) NOT NULL,
    CHANGE COLUMN `is_active` `PE_ACTIVO`       BOOLEAN DEFAULT TRUE;

-- ── OS_CAJAS_COMPENSACION (entidades_caja_compensacion) ──────────────────
ALTER TABLE entidades_caja_compensacion
    CHANGE COLUMN `id`        `CC_IDCAJA_PK` INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`    `CC_NOMBRE`    VARCHAR(100) NOT NULL,
    CHANGE COLUMN `is_active` `CC_ACTIVO`    BOOLEAN DEFAULT TRUE;

-- ── OS_MODALIDADES_TRABAJO (modalidades_trabajo) ─────────────────────────
ALTER TABLE modalidades_trabajo
    CHANGE COLUMN `id`     `MT_IDMODALIDAD_PK` INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre` `MT_NOMBRE`         VARCHAR(50) NOT NULL;

-- ── OS_ENTIDADES_BANCARIAS (entidades_bancarias) ─────────────────────────
ALTER TABLE entidades_bancarias
    CHANGE COLUMN `id`        `EB_IDBANCO_PK` INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`    `EB_NOMBRE`     VARCHAR(100) NOT NULL,
    CHANGE COLUMN `is_active` `EB_ACTIVO`     BOOLEAN DEFAULT TRUE;

-- ── OS_DEPARTAMENTOS (departamentos) ─────────────────────────────────────
ALTER TABLE departamentos
    CHANGE COLUMN `id`     `DE_IDDEPARTAMENTO_PK` INT NOT NULL,
    CHANGE COLUMN `nombre` `DE_NOMBRE`            VARCHAR(100) NOT NULL;

-- ── OS_MUNICIPIOS (municipios) ────────────────────────────────────────────
ALTER TABLE municipios
    CHANGE COLUMN `id`              `MU_IDMUNICIPIO_PK`     INT NOT NULL,
    CHANGE COLUMN `departamento_id` `DE_IDDEPARTAMENTO_FK`  INT NOT NULL,
    CHANGE COLUMN `nombre`          `MU_NOMBRE`             VARCHAR(100) NOT NULL;

-- ── OS_USUARIOS (users) ───────────────────────────────────────────────────
ALTER TABLE users
    CHANGE COLUMN `id`                      `US_IDUSUARIO_PK`                   INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `first_name`              `US_NOMBRE`                         VARCHAR(100) NOT NULL,
    CHANGE COLUMN `last_name`               `US_APELLIDO`                       VARCHAR(100) NOT NULL,
    CHANGE COLUMN `email`                   `US_EMAIL`                          VARCHAR(150) NOT NULL,
    CHANGE COLUMN `password_hash`           `US_PASSWORD_HASH`                  VARCHAR(255) NOT NULL,
    CHANGE COLUMN `document_type`           `US_TIPO_DOCUMENTO`                 ENUM('CC','CE','TI','RC','PA') DEFAULT 'CC',
    CHANGE COLUMN `document_number`         `US_NUMERO_DOCUMENTO`               VARCHAR(20),
    CHANGE COLUMN `birth_date`              `US_FECHA_NACIMIENTO`               DATE,
    CHANGE COLUMN `gender`                  `US_GENERO`                         ENUM('M','F','O'),
    CHANGE COLUMN `marital_status`          `US_ESTADO_CIVIL`                   ENUM('Soltero/a','Casado/a','Divorciado/a','Viudo/a','Unión Libre'),
    CHANGE COLUMN `emergency_contact_name`  `US_CONTACTO_EMERGENCIA_NOMBRE`     VARCHAR(100),
    CHANGE COLUMN `emergency_contact_phone` `US_CONTACTO_EMERGENCIA_TELEFONO`   VARCHAR(20),
    CHANGE COLUMN `phone`                   `US_TELEFONO`                       VARCHAR(20),
    CHANGE COLUMN `address`                 `US_DIRECCION`                      VARCHAR(255),
    CHANGE COLUMN `departamento_id`         `DE_IDDEPARTAMENTO_FK`              INT DEFAULT NULL,
    CHANGE COLUMN `municipio_id`            `MU_IDMUNICIPIO_FK`                 INT DEFAULT NULL,
    CHANGE COLUMN `work_schedule`           `US_HORARIO_TRABAJO`                VARCHAR(50),
    CHANGE COLUMN `department`              `US_DEPARTAMENTO`                   VARCHAR(100),
    CHANGE COLUMN `manager_id`              `US_IDMANAGER_FK`                   INT,
    CHANGE COLUMN `employment_type`         `US_TIPO_EMPLEO`                    ENUM('Tiempo Completo','Medio Tiempo','Por Horas','Por Contrato') DEFAULT 'Tiempo Completo',
    CHANGE COLUMN `eps_id`                  `EP_IDEPS_FK`                       VARCHAR(50) DEFAULT NULL,
    CHANGE COLUMN `arl_id`                  `AR_IDARL_FK`                       VARCHAR(50) DEFAULT NULL,
    CHANGE COLUMN `pension_fund_id`         `PE_IDPENSION_FK`                   VARCHAR(50) DEFAULT NULL,
    CHANGE COLUMN `compensation_fund_id`    `CC_IDCAJA_FK`                      VARCHAR(50) DEFAULT NULL,
    CHANGE COLUMN `bank_name`               `US_NOMBRE_BANCO`                   VARCHAR(100),
    CHANGE COLUMN `account_number`          `US_NUMERO_CUENTA`                  VARCHAR(50),
    CHANGE COLUMN `account_type`            `US_TIPO_CUENTA`                    ENUM('Ahorros','Corriente'),
    CHANGE COLUMN `profile_picture`         `US_FOTO_PERFIL`                    VARCHAR(500),
    CHANGE COLUMN `notes`                   `US_NOTAS`                          TEXT,
    CHANGE COLUMN `is_active`               `US_ACTIVO`                         BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `role_id`                 `RO_IDROL_FK`                       INT,
    CHANGE COLUMN `cargo_id`                `CA_IDCARGO_FK`                     INT DEFAULT NULL,
    CHANGE COLUMN `contract_status_id`      `EC_IDESTADO_CONTRATO_FK`           INT,
    CHANGE COLUMN `created_at`              `US_FECHA_CREACION`                 DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`              `US_CREADO_POR`                     INT NOT NULL,
    CHANGE COLUMN `updated_at`              `US_FECHA_ACTUALIZACION`            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`              `US_ACTUALIZADO_POR`                INT,
    CHANGE COLUMN `deleted_at`              `US_FECHA_ELIMINACION`              DATETIME DEFAULT NULL,
    CHANGE COLUMN `deleted_by`              `US_ELIMINADO_POR`                  INT DEFAULT NULL,
    CHANGE COLUMN `hire_date`               `US_FECHA_CONTRATACION`             DATE,
    CHANGE COLUMN `termination_date`        `US_FECHA_RETIRO`                   DATE;

-- ── OS_DOCUMENTOS (documents) ─────────────────────────────────────────────
ALTER TABLE documents
    CHANGE COLUMN `id`                `DO_IDDOCUMENTO_PK`      INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `user_id`           `US_IDUSUARIO_FK`        INT NOT NULL,
    CHANGE COLUMN `document_name`     `DO_NOMBRE`              VARCHAR(255) NOT NULL,
    CHANGE COLUMN `file_url`          `DO_URL_ARCHIVO`         VARCHAR(500) NOT NULL,
    CHANGE COLUMN `document_type_id`  `TD_IDTIPO_DOCUMENTO_FK` INT,
    CHANGE COLUMN `description`       `DO_DESCRIPCION`         TEXT,
    CHANGE COLUMN `uploaded_at`       `DO_FECHA_SUBIDA`        DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_at`        `DO_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`        `DO_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`        `DO_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`        `DO_ACTUALIZADO_POR`     INT,
    CHANGE COLUMN `deleted_at`        `DO_FECHA_ELIMINACION`   DATETIME DEFAULT NULL,
    CHANGE COLUMN `deleted_by`        `DO_ELIMINADO_POR`       INT DEFAULT NULL;

-- ── OS_LIQUIDACIONES (liquidaciones_nomina) ──────────────────────────────
ALTER TABLE liquidaciones_nomina
    CHANGE COLUMN `id`                  `LQ_IDLIQUIDACION_PK`    BIGINT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `empleado_id`         `US_IDUSUARIO_FK`        INT NOT NULL,
    CHANGE COLUMN `periodo_mes`         `LQ_PERIODO_MES`         INT NOT NULL,
    CHANGE COLUMN `periodo_anio`        `LQ_PERIODO_ANIO`        INT NOT NULL,
    CHANGE COLUMN `fecha_liquidacion`   `LQ_FECHA_LIQUIDACION`   DATE NOT NULL,
    CHANGE COLUMN `fecha_pago`          `LQ_FECHA_PAGO`          DATE NULL,
    CHANGE COLUMN `dias_trabajados`     `LQ_DIAS_TRABAJADOS`     INT DEFAULT 30,
    CHANGE COLUMN `dias_incapacidad`    `LQ_DIAS_INCAPACIDAD`    INT DEFAULT 0,
    CHANGE COLUMN `dias_vacaciones`     `LQ_DIAS_VACACIONES`     INT DEFAULT 0,
    CHANGE COLUMN `ibc_salud`           `LQ_IBC_SALUD`           DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `ibc_pension`         `LQ_IBC_PENSION`         DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `ibc_arl`             `LQ_IBC_ARL`             DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `total_devengado`     `LQ_TOTAL_DEVENGADO`     DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `total_deducciones`   `LQ_TOTAL_DEDUCCIONES`   DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `neto_pagar`          `LQ_NETO_PAGAR`          DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `costo_total_empresa` `LQ_COSTO_EMPRESA`       DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `salario_integral`    `LQ_SALARIO_INTEGRAL`    BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `valor_smmlv_base`    `LQ_SMMLV_BASE`          DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `xml_pila`            `LQ_XML_PILA`            TEXT NULL,
    CHANGE COLUMN `observaciones`       `LQ_OBSERVACIONES`       JSON NULL,
    CHANGE COLUMN `estado`              `LQ_ESTADO`              ENUM('Borrador','Calculado','Aprobado','Pagado','Anulado') DEFAULT 'Borrador',
    CHANGE COLUMN `created_at`          `LQ_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`          `LQ_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`          `LQ_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── OS_DETALLE_LIQUIDACION (detalle_liquidacion) ─────────────────────────
ALTER TABLE detalle_liquidacion
    CHANGE COLUMN `id`               `DL_IDDETALLE_PK`        BIGINT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `liquidacion_id`   `LQ_IDLIQUIDACION_FK`    BIGINT NOT NULL,
    CHANGE COLUMN `concepto_codigo`  `CN_IDCONCEPTO_FK`       VARCHAR(20) NOT NULL,
    CHANGE COLUMN `descripcion`      `DL_DESCRIPCION`         VARCHAR(150),
    CHANGE COLUMN `cantidad`         `DL_CANTIDAD`            DECIMAL(10,2) DEFAULT 1.00,
    CHANGE COLUMN `valor_unitario`   `DL_VALOR_UNITARIO`      DECIMAL(12,2),
    CHANGE COLUMN `valor_total`      `DL_VALOR_TOTAL`         DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `tipo`             `DL_TIPO`                ENUM('Devengo','Deducción','Aporte Empleador','Info') NOT NULL,
    CHANGE COLUMN `afecta_ibc_salud`   `DL_AFECTA_IBC_SALUD`   BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `afecta_ibc_pension` `DL_AFECTA_IBC_PENSION` BOOLEAN DEFAULT FALSE,
    CHANGE COLUMN `afecta_ibc_arl`     `DL_AFECTA_IBC_ARL`     BOOLEAN DEFAULT FALSE;

-- ── OS_NOVEDADES (novedades_nomina) ──────────────────────────────────────
ALTER TABLE novedades_nomina
    CHANGE COLUMN `id`              `NO_IDNOVEDAD_PK`        BIGINT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `empleado_id`     `US_IDUSUARIO_FK`        INT NOT NULL,
    CHANGE COLUMN `concepto_codigo` `CN_IDCONCEPTO_FK`       VARCHAR(20) NOT NULL,
    CHANGE COLUMN `periodo_mes`     `NO_PERIODO_MES`         INT NOT NULL,
    CHANGE COLUMN `periodo_anio`    `NO_PERIODO_ANIO`        INT NOT NULL,
    CHANGE COLUMN `valor_total`     `NO_VALOR_TOTAL`         DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `cantidad`        `NO_CANTIDAD`            DECIMAL(10,2) DEFAULT 1.00,
    CHANGE COLUMN `observaciones`   `NO_OBSERVACIONES`       TEXT,
    CHANGE COLUMN `estado`          `NO_ESTADO`              ENUM('Pendiente','Procesado','Anulado') DEFAULT 'Pendiente',
    CHANGE COLUMN `created_at`      `NO_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`      `NO_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`      `NO_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── OS_TIPOS_AUSENCIA (tipos_ausencia) ───────────────────────────────────
ALTER TABLE tipos_ausencia
    CHANGE COLUMN `id`                         `TA_IDTIPO_AUSENCIA_PK`  INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `nombre`                     `TA_NOMBRE`              VARCHAR(100) NOT NULL,
    CHANGE COLUMN `descripcion`                `TA_DESCRIPCION`         TEXT,
    CHANGE COLUMN `porcentaje_pago`            `TA_PORCENTAJE_PAGO`     DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    CHANGE COLUMN `afecta_auxilio_transporte`  `TA_AFECTA_AUXILIO`      BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `is_active`                  `TA_ACTIVO`              BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `created_at`                 `TA_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`                 `TA_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`                 `TA_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`                 `TA_ACTUALIZADO_POR`     INT;

-- ── OS_AUSENCIAS (ausencias) ─────────────────────────────────────────────
-- NOTA: Las columnas GENERATED (calculadas) no pueden renombrarse con CHANGE COLUMN
-- directamente en MySQL 5.7. Se hace primero sin la columna generada y luego se
-- elimina y recrea con el nuevo nombre.

-- Paso A: renombrar todas las columnas no generadas de ausencias
ALTER TABLE ausencias
    CHANGE COLUMN `id_ausencia`          `AU_IDAUSENCIA_PK`       INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `id_colaborador`       `US_IDUSUARIO_FK`        INT NOT NULL,
    CHANGE COLUMN `id_tipo_ausencia`     `TA_IDTIPO_AUSENCIA_FK`  INT NOT NULL,
    CHANGE COLUMN `fecha_inicio`         `AU_FECHA_INICIO`        DATE NOT NULL,
    CHANGE COLUMN `fecha_fin`            `AU_FECHA_FIN`           DATE NOT NULL,
    CHANGE COLUMN `descripcion`          `AU_DESCRIPCION`         TEXT,
    CHANGE COLUMN `soporte_url`          `AU_URL_SOPORTE`         VARCHAR(255) DEFAULT NULL,
    CHANGE COLUMN `id_usuario_registro`  `AU_USUARIO_REGISTRO_FK` INT NOT NULL,
    CHANGE COLUMN `fecha_registro`       `AU_FECHA_REGISTRO`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `activo`               `AU_ACTIVO`              TINYINT(1) DEFAULT 1,
    CHANGE COLUMN `created_at`           `AU_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`           `AU_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`           `AU_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`           `AU_ACTUALIZADO_POR`     INT;

-- Paso B: eliminar columna generada con nombre viejo y recrearla con nombre nuevo
ALTER TABLE ausencias
    DROP COLUMN `dias_ausencia`;
ALTER TABLE ausencias
    ADD COLUMN `AU_DIAS_AUSENCIA` INT GENERATED ALWAYS AS (DATEDIFF(`AU_FECHA_FIN`, `AU_FECHA_INICIO`) + 1) STORED;

-- ── OS_ARCHIVOS_AUSENCIAS (archivos_ausencias) ───────────────────────────
ALTER TABLE archivos_ausencias
    CHANGE COLUMN `id_archivo`      `AA_IDARCHIVO_PK`        INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `id_ausencia`     `AU_IDAUSENCIA_FK`       INT NOT NULL,
    CHANGE COLUMN `url_archivo`     `AA_URL_ARCHIVO`         VARCHAR(255) NOT NULL,
    CHANGE COLUMN `nombre_archivo`  `AA_NOMBRE_ARCHIVO`      VARCHAR(255) NOT NULL,
    CHANGE COLUMN `tipo_archivo`    `AA_TIPO_ARCHIVO`        VARCHAR(50),
    CHANGE COLUMN `tamano_archivo`  `AA_TAMANO_ARCHIVO`      INT,
    CHANGE COLUMN `fecha_subida`    `AA_FECHA_SUBIDA`        DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `uploaded_by`     `AA_SUBIDO_POR`          INT NOT NULL,
    CHANGE COLUMN `is_active`       `AA_ACTIVO`              BOOLEAN DEFAULT TRUE,
    CHANGE COLUMN `created_at`      `AA_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_at`      `AA_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── OS_GASTOS_MES (payroll_mes_a_mes) ────────────────────────────────────
ALTER TABLE payroll_mes_a_mes
    CHANGE COLUMN `id`              `GM_IDGASTO_PK`          INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `year`            `GM_ANIO`                INT NOT NULL,
    CHANGE COLUMN `mes`             `GM_MES`                 VARCHAR(20) NOT NULL,
    CHANGE COLUMN `fecha`           `GM_FECHA`               DATE NOT NULL,
    CHANGE COLUMN `proveedor`       `GM_PROVEEDOR`           VARCHAR(255) NOT NULL,
    CHANGE COLUMN `pago`            `GM_PAGO`                DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `objeto`          `GM_OBJETO`              VARCHAR(255) NOT NULL,
    CHANGE COLUMN `valor_neto`      `GM_VALOR_NETO`          DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `iva`             `GM_IVA`                 DECIMAL(12,2) DEFAULT 0.00,
    CHANGE COLUMN `retencion`       `GM_RETENCION`           DECIMAL(12,2) DEFAULT 0.00,
    CHANGE COLUMN `total`           `GM_TOTAL`               DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `nit`             `GM_NIT`                 VARCHAR(50) DEFAULT NULL,
    CHANGE COLUMN `numero_factura`  `GM_NUMERO_FACTURA`      VARCHAR(50) NOT NULL,
    CHANGE COLUMN `obra`            `GM_OBRA`                VARCHAR(255) NOT NULL,
    CHANGE COLUMN `created_at`      `GM_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`      `GM_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`      `GM_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`      `GM_ACTUALIZADO_POR`     INT;

-- ── OS_FACTURACION (libro_gastos_facturacion) ────────────────────────────
ALTER TABLE libro_gastos_facturacion
    CHANGE COLUMN `id`                   `FA_IDFACTURA_PK`        INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `year`                 `FA_ANIO`                INT NOT NULL,
    CHANGE COLUMN `mes`                  `FA_MES`                 VARCHAR(20) NOT NULL,
    CHANGE COLUMN `numero_facturacion`   `FA_NUMERO_FACTURACION`  VARCHAR(50) NOT NULL,
    CHANGE COLUMN `fecha`                `FA_FECHA`               DATE NOT NULL,
    CHANGE COLUMN `cliente`              `FA_CLIENTE`             VARCHAR(255) NOT NULL,
    CHANGE COLUMN `servicio`             `FA_SERVICIO`            VARCHAR(255) NOT NULL,
    CHANGE COLUMN `nit`                  `FA_NIT`                 VARCHAR(50) DEFAULT NULL,
    CHANGE COLUMN `valor`                `FA_VALOR`               DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `iva`                  `FA_IVA`                 DECIMAL(12,2) DEFAULT 0.00,
    CHANGE COLUMN `total`                `FA_TOTAL`               DECIMAL(12,2) NOT NULL,
    CHANGE COLUMN `created_at`           `FA_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`           `FA_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`           `FA_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`           `FA_ACTUALIZADO_POR`     INT;

-- ── OS_TRANSFERENCIAS (transferencias_pagos) ─────────────────────────────
ALTER TABLE transferencias_pagos
    CHANGE COLUMN `id`        `TR_IDTRANSFERENCIA_PK`  INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `year`      `TR_ANIO`                INT NOT NULL,
    CHANGE COLUMN `mes`       `TR_MES`                 VARCHAR(20) NOT NULL,
    CHANGE COLUMN `fecha`     `TR_FECHA`               DATE NOT NULL,
    CHANGE COLUMN `actividad` `TR_ACTIVIDAD`           VARCHAR(255) NOT NULL,
    CHANGE COLUMN `sale`      `TR_SALE`                DECIMAL(12,2) DEFAULT 0.00,
    CHANGE COLUMN `entra`     `TR_ENTRA`               DECIMAL(12,2) DEFAULT 0.00,
    CHANGE COLUMN `saldo`     `TR_SALDO`               DECIMAL(12,2) DEFAULT 0.00,
    CHANGE COLUMN `concepto`  `TR_CONCEPTO`            VARCHAR(255) DEFAULT NULL,
    CHANGE COLUMN `created_at`  `TR_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `created_by`  `TR_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `updated_at`  `TR_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_by`  `TR_ACTUALIZADO_POR`     INT;

-- ── OS_CARPETAS (file_folders) ────────────────────────────────────────────
ALTER TABLE file_folders
    CHANGE COLUMN `id`          `CF_IDCARPETA_PK`          INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `name`        `CF_NOMBRE`                VARCHAR(255) NOT NULL,
    CHANGE COLUMN `parent_id`   `CF_IDCARPETA_PADRE_FK`    INT NULL,
    CHANGE COLUMN `path`        `CF_RUTA`                  VARCHAR(500) NOT NULL,
    CHANGE COLUMN `description` `CF_DESCRIPCION`           TEXT,
    CHANGE COLUMN `created_by`  `CF_CREADO_POR`            INT NOT NULL,
    CHANGE COLUMN `created_at`  `CF_FECHA_CREACION`        DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_at`  `CF_FECHA_ACTUALIZACION`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `is_active`   `CF_ACTIVO`                BOOLEAN DEFAULT TRUE;

-- ── OS_ARCHIVOS (file_system_files) ──────────────────────────────────────
ALTER TABLE file_system_files
    CHANGE COLUMN `id`             `AF_IDARCHIVO_PK`        INT AUTO_INCREMENT NOT NULL,
    CHANGE COLUMN `name`           `AF_NOMBRE`              VARCHAR(255) NOT NULL,
    CHANGE COLUMN `original_name`  `AF_NOMBRE_ORIGINAL`     VARCHAR(255) NOT NULL,
    CHANGE COLUMN `folder_id`      `CF_IDCARPETA_FK`        INT NULL,
    CHANGE COLUMN `file_path`      `AF_RUTA_ARCHIVO`        VARCHAR(500) NOT NULL,
    CHANGE COLUMN `file_url`       `AF_URL_ARCHIVO`         VARCHAR(500) NOT NULL,
    CHANGE COLUMN `file_size`      `AF_TAMANO`              BIGINT NOT NULL,
    CHANGE COLUMN `mime_type`      `AF_TIPO_MIME`           VARCHAR(100) NOT NULL,
    CHANGE COLUMN `file_extension` `AF_EXTENSION`           VARCHAR(10),
    CHANGE COLUMN `description`    `AF_DESCRIPCION`         TEXT,
    CHANGE COLUMN `created_by`     `AF_CREADO_POR`          INT NOT NULL,
    CHANGE COLUMN `created_at`     `AF_FECHA_CREACION`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN `updated_at`     `AF_FECHA_ACTUALIZACION` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE COLUMN `is_active`      `AF_ACTIVO`              BOOLEAN DEFAULT TRUE;

-- ========================================================================
-- PASO 4: RENOMBRAR LAS TABLAS
-- ========================================================================

RENAME TABLE
    user_roles                    TO OS_ROLES,
    document_types                TO OS_TIPOS_DOCUMENTO,
    contract_statuses             TO OS_ESTADOS_CONTRATO,
    cargos                        TO OS_CARGOS,
    parametros_nomina             TO OS_PARAMETROS_NOMINA,
    conceptos_nomina              TO OS_CONCEPTOS_NOMINA,
    entidades_eps                 TO OS_ENTIDADES_EPS,
    entidades_arl                 TO OS_ENTIDADES_ARL,
    entidades_pension             TO OS_ENTIDADES_PENSION,
    entidades_caja_compensacion   TO OS_CAJAS_COMPENSACION,
    modalidades_trabajo           TO OS_MODALIDADES_TRABAJO,
    entidades_bancarias           TO OS_ENTIDADES_BANCARIAS,
    departamentos                 TO OS_DEPARTAMENTOS,
    municipios                    TO OS_MUNICIPIOS,
    users                         TO OS_USUARIOS,
    documents                     TO OS_DOCUMENTOS,
    liquidaciones_nomina          TO OS_LIQUIDACIONES,
    detalle_liquidacion           TO OS_DETALLE_LIQUIDACION,
    novedades_nomina              TO OS_NOVEDADES,
    tipos_ausencia                TO OS_TIPOS_AUSENCIA,
    ausencias                     TO OS_AUSENCIAS,
    archivos_ausencias            TO OS_ARCHIVOS_AUSENCIAS,
    payroll_mes_a_mes             TO OS_GASTOS_MES,
    libro_gastos_facturacion      TO OS_FACTURACION,
    transferencias_pagos          TO OS_TRANSFERENCIAS,
    file_folders                  TO OS_CARPETAS,
    file_system_files             TO OS_ARCHIVOS;

-- ========================================================================
-- PASO 5: RECREAR ÍNDICES CON NOMBRES ACTUALIZADOS
-- ========================================================================

-- OS_ROLES
CREATE UNIQUE INDEX idx_os_roles_codigo  ON OS_ROLES (RO_CODIGO);
CREATE INDEX idx_os_roles_activo         ON OS_ROLES (RO_ACTIVO);

-- OS_TIPOS_DOCUMENTO
CREATE INDEX idx_os_tipos_doc_activo     ON OS_TIPOS_DOCUMENTO (TD_ACTIVO);

-- OS_ESTADOS_CONTRATO
CREATE INDEX idx_os_estados_activo       ON OS_ESTADOS_CONTRATO (EC_ACTIVO);

-- OS_USUARIOS
CREATE UNIQUE INDEX idx_os_usu_email           ON OS_USUARIOS (US_EMAIL);
CREATE UNIQUE INDEX idx_os_usu_num_doc         ON OS_USUARIOS (US_NUMERO_DOCUMENTO);
CREATE INDEX idx_os_usu_rol                    ON OS_USUARIOS (RO_IDROL_FK);
CREATE INDEX idx_os_usu_estado_contrato        ON OS_USUARIOS (EC_IDESTADO_CONTRATO_FK);
CREATE INDEX idx_os_usu_eliminado              ON OS_USUARIOS (US_FECHA_ELIMINACION);
CREATE INDEX idx_os_usu_tipo_doc               ON OS_USUARIOS (US_TIPO_DOCUMENTO);
CREATE INDEX idx_os_usu_fecha_nac              ON OS_USUARIOS (US_FECHA_NACIMIENTO);
CREATE INDEX idx_os_usu_fecha_contratacion     ON OS_USUARIOS (US_FECHA_CONTRATACION);
CREATE INDEX idx_os_usu_fecha_retiro           ON OS_USUARIOS (US_FECHA_RETIRO);
CREATE INDEX idx_os_usu_departamento           ON OS_USUARIOS (US_DEPARTAMENTO);
CREATE INDEX idx_os_usu_manager                ON OS_USUARIOS (US_IDMANAGER_FK);
CREATE INDEX idx_os_usu_activo                 ON OS_USUARIOS (US_ACTIVO);
CREATE INDEX idx_os_usu_tipo_empleo            ON OS_USUARIOS (US_TIPO_EMPLEO);

-- OS_DOCUMENTOS
CREATE INDEX idx_os_doc_usuario            ON OS_DOCUMENTOS (US_IDUSUARIO_FK);
CREATE INDEX idx_os_doc_tipo               ON OS_DOCUMENTOS (TD_IDTIPO_DOCUMENTO_FK);
CREATE INDEX idx_os_doc_eliminado          ON OS_DOCUMENTOS (DO_FECHA_ELIMINACION);

-- OS_LIQUIDACIONES
ALTER TABLE OS_LIQUIDACIONES
    ADD UNIQUE KEY uk_lq_liquidacion (US_IDUSUARIO_FK, LQ_PERIODO_ANIO, LQ_PERIODO_MES);

-- OS_TIPOS_AUSENCIA
CREATE INDEX idx_os_tipos_ausencia_activo  ON OS_TIPOS_AUSENCIA (TA_ACTIVO);

-- OS_AUSENCIAS
CREATE INDEX idx_os_ausencias_usuario      ON OS_AUSENCIAS (US_IDUSUARIO_FK);
CREATE INDEX idx_os_ausencias_tipo         ON OS_AUSENCIAS (TA_IDTIPO_AUSENCIA_FK);
CREATE INDEX idx_os_ausencias_inicio       ON OS_AUSENCIAS (AU_FECHA_INICIO);
CREATE INDEX idx_os_ausencias_fin          ON OS_AUSENCIAS (AU_FECHA_FIN);
CREATE INDEX idx_os_ausencias_dias         ON OS_AUSENCIAS (AU_DIAS_AUSENCIA);
CREATE INDEX idx_os_ausencias_activo       ON OS_AUSENCIAS (AU_ACTIVO);
CREATE INDEX idx_os_ausencias_fecha_reg    ON OS_AUSENCIAS (AU_FECHA_REGISTRO);

-- OS_ARCHIVOS_AUSENCIAS
CREATE INDEX idx_os_arch_aus_ausencia      ON OS_ARCHIVOS_AUSENCIAS (AU_IDAUSENCIA_FK);
CREATE INDEX idx_os_arch_aus_activo        ON OS_ARCHIVOS_AUSENCIAS (AA_ACTIVO);
CREATE INDEX idx_os_arch_aus_fecha         ON OS_ARCHIVOS_AUSENCIAS (AA_FECHA_SUBIDA);

-- OS_GASTOS_MES
CREATE INDEX idx_os_gm_anio               ON OS_GASTOS_MES (GM_ANIO);
CREATE INDEX idx_os_gm_mes                ON OS_GASTOS_MES (GM_MES);
CREATE INDEX idx_os_gm_anio_mes           ON OS_GASTOS_MES (GM_ANIO, GM_MES);
CREATE INDEX idx_os_gm_fecha              ON OS_GASTOS_MES (GM_FECHA);
CREATE INDEX idx_os_gm_proveedor          ON OS_GASTOS_MES (GM_PROVEEDOR);
CREATE INDEX idx_os_gm_nit                ON OS_GASTOS_MES (GM_NIT);
CREATE INDEX idx_os_gm_obra               ON OS_GASTOS_MES (GM_OBRA);

-- OS_FACTURACION
CREATE INDEX idx_os_fa_anio               ON OS_FACTURACION (FA_ANIO);
CREATE INDEX idx_os_fa_mes                ON OS_FACTURACION (FA_MES);
CREATE INDEX idx_os_fa_anio_mes           ON OS_FACTURACION (FA_ANIO, FA_MES);
CREATE INDEX idx_os_fa_fecha              ON OS_FACTURACION (FA_FECHA);
CREATE INDEX idx_os_fa_cliente            ON OS_FACTURACION (FA_CLIENTE);
CREATE INDEX idx_os_fa_nit                ON OS_FACTURACION (FA_NIT);

-- OS_TRANSFERENCIAS
CREATE INDEX idx_os_tr_anio               ON OS_TRANSFERENCIAS (TR_ANIO);
CREATE INDEX idx_os_tr_mes                ON OS_TRANSFERENCIAS (TR_MES);
CREATE INDEX idx_os_tr_anio_mes           ON OS_TRANSFERENCIAS (TR_ANIO, TR_MES);
CREATE INDEX idx_os_tr_fecha              ON OS_TRANSFERENCIAS (TR_FECHA);
CREATE INDEX idx_os_tr_actividad          ON OS_TRANSFERENCIAS (TR_ACTIVIDAD);
CREATE INDEX idx_os_tr_concepto           ON OS_TRANSFERENCIAS (TR_CONCEPTO);

-- OS_CARPETAS
CREATE INDEX idx_os_carpeta_padre         ON OS_CARPETAS (CF_IDCARPETA_PADRE_FK);
CREATE INDEX idx_os_carpeta_ruta          ON OS_CARPETAS (CF_RUTA(191));
CREATE INDEX idx_os_carpeta_activo        ON OS_CARPETAS (CF_ACTIVO);

-- OS_ARCHIVOS
CREATE INDEX idx_os_archivo_carpeta       ON OS_ARCHIVOS (CF_IDCARPETA_FK);
CREATE INDEX idx_os_archivo_ruta          ON OS_ARCHIVOS (AF_RUTA_ARCHIVO(191));
CREATE INDEX idx_os_archivo_activo        ON OS_ARCHIVOS (AF_ACTIVO);
CREATE INDEX idx_os_archivo_mime          ON OS_ARCHIVOS (AF_TIPO_MIME);

-- ========================================================================
-- PASO 6: RECREAR FOREIGN KEYS CON NOMBRES Y COLUMNAS ACTUALIZADAS
-- ========================================================================

-- FK de OS_MUNICIPIOS → OS_DEPARTAMENTOS
ALTER TABLE OS_MUNICIPIOS
    ADD CONSTRAINT fk_mu_departamento FOREIGN KEY (DE_IDDEPARTAMENTO_FK)
        REFERENCES OS_DEPARTAMENTOS (DE_IDDEPARTAMENTO_PK) ON DELETE CASCADE;

-- FK de OS_USUARIOS
ALTER TABLE OS_USUARIOS
    ADD CONSTRAINT fk_us_rol          FOREIGN KEY (RO_IDROL_FK)             REFERENCES OS_ROLES          (RO_IDROL_PK),
    ADD CONSTRAINT fk_us_estado_cont  FOREIGN KEY (EC_IDESTADO_CONTRATO_FK) REFERENCES OS_ESTADOS_CONTRATO(EC_IDESTADO_CONTRATO_PK),
    ADD CONSTRAINT fk_us_manager      FOREIGN KEY (US_IDMANAGER_FK)         REFERENCES OS_USUARIOS       (US_IDUSUARIO_PK) ON DELETE SET NULL,
    ADD CONSTRAINT fk_us_cargo        FOREIGN KEY (CA_IDCARGO_FK)           REFERENCES OS_CARGOS         (CA_IDCARGO_PK) ON DELETE SET NULL;

-- FK de OS_DOCUMENTOS
ALTER TABLE OS_DOCUMENTOS
    ADD CONSTRAINT fk_do_usuario  FOREIGN KEY (US_IDUSUARIO_FK)        REFERENCES OS_USUARIOS       (US_IDUSUARIO_PK) ON DELETE CASCADE,
    ADD CONSTRAINT fk_do_tipo_doc FOREIGN KEY (TD_IDTIPO_DOCUMENTO_FK) REFERENCES OS_TIPOS_DOCUMENTO(TD_IDTIPO_DOCUMENTO_PK);

-- FK de OS_LIQUIDACIONES
ALTER TABLE OS_LIQUIDACIONES
    ADD CONSTRAINT fk_lq_empleado  FOREIGN KEY (US_IDUSUARIO_FK) REFERENCES OS_USUARIOS (US_IDUSUARIO_PK) ON DELETE CASCADE,
    ADD CONSTRAINT fk_lq_creador   FOREIGN KEY (LQ_CREADO_POR)   REFERENCES OS_USUARIOS (US_IDUSUARIO_PK) ON DELETE RESTRICT;

-- FK de OS_DETALLE_LIQUIDACION
ALTER TABLE OS_DETALLE_LIQUIDACION
    ADD CONSTRAINT fk_dl_liquidacion FOREIGN KEY (LQ_IDLIQUIDACION_FK) REFERENCES OS_LIQUIDACIONES    (LQ_IDLIQUIDACION_PK) ON DELETE CASCADE,
    ADD CONSTRAINT fk_dl_concepto    FOREIGN KEY (CN_IDCONCEPTO_FK)    REFERENCES OS_CONCEPTOS_NOMINA (CN_IDCONCEPTO_PK) ON DELETE RESTRICT;

-- FK de OS_NOVEDADES
ALTER TABLE OS_NOVEDADES
    ADD CONSTRAINT fk_no_empleado  FOREIGN KEY (US_IDUSUARIO_FK) REFERENCES OS_USUARIOS       (US_IDUSUARIO_PK)  ON DELETE CASCADE,
    ADD CONSTRAINT fk_no_concepto  FOREIGN KEY (CN_IDCONCEPTO_FK) REFERENCES OS_CONCEPTOS_NOMINA(CN_IDCONCEPTO_PK) ON DELETE RESTRICT;

-- FK de OS_TIPOS_AUSENCIA
ALTER TABLE OS_TIPOS_AUSENCIA
    ADD CONSTRAINT fk_ta_creado_por    FOREIGN KEY (TA_CREADO_POR)       REFERENCES OS_USUARIOS (US_IDUSUARIO_PK),
    ADD CONSTRAINT fk_ta_actualizado_por FOREIGN KEY (TA_ACTUALIZADO_POR) REFERENCES OS_USUARIOS (US_IDUSUARIO_PK) ON DELETE SET NULL;

-- FK de OS_AUSENCIAS
ALTER TABLE OS_AUSENCIAS
    ADD CONSTRAINT fk_au_usuario         FOREIGN KEY (US_IDUSUARIO_FK)       REFERENCES OS_USUARIOS     (US_IDUSUARIO_PK)     ON DELETE CASCADE,
    ADD CONSTRAINT fk_au_tipo_ausencia   FOREIGN KEY (TA_IDTIPO_AUSENCIA_FK) REFERENCES OS_TIPOS_AUSENCIA(TA_IDTIPO_AUSENCIA_PK),
    ADD CONSTRAINT fk_au_usuario_reg     FOREIGN KEY (AU_USUARIO_REGISTRO_FK) REFERENCES OS_USUARIOS     (US_IDUSUARIO_PK),
    ADD CONSTRAINT fk_au_creado_por      FOREIGN KEY (AU_CREADO_POR)          REFERENCES OS_USUARIOS     (US_IDUSUARIO_PK),
    ADD CONSTRAINT fk_au_actualizado_por FOREIGN KEY (AU_ACTUALIZADO_POR)     REFERENCES OS_USUARIOS     (US_IDUSUARIO_PK) ON DELETE SET NULL;

-- FK de OS_ARCHIVOS_AUSENCIAS
ALTER TABLE OS_ARCHIVOS_AUSENCIAS
    ADD CONSTRAINT fk_aa_ausencia    FOREIGN KEY (AU_IDAUSENCIA_FK) REFERENCES OS_AUSENCIAS (AU_IDAUSENCIA_PK) ON DELETE CASCADE,
    ADD CONSTRAINT fk_aa_subido_por  FOREIGN KEY (AA_SUBIDO_POR)   REFERENCES OS_USUARIOS  (US_IDUSUARIO_PK);

-- FK de OS_CARPETAS
ALTER TABLE OS_CARPETAS
    ADD CONSTRAINT fk_cf_padre      FOREIGN KEY (CF_IDCARPETA_PADRE_FK) REFERENCES OS_CARPETAS (CF_IDCARPETA_PK) ON DELETE CASCADE,
    ADD CONSTRAINT fk_cf_creado_por FOREIGN KEY (CF_CREADO_POR)        REFERENCES OS_USUARIOS  (US_IDUSUARIO_PK);

-- FK de OS_ARCHIVOS
ALTER TABLE OS_ARCHIVOS
    ADD CONSTRAINT fk_af_carpeta    FOREIGN KEY (CF_IDCARPETA_FK) REFERENCES OS_CARPETAS (CF_IDCARPETA_PK) ON DELETE CASCADE,
    ADD CONSTRAINT fk_af_creado_por FOREIGN KEY (AF_CREADO_POR)  REFERENCES OS_USUARIOS  (US_IDUSUARIO_PK);

-- ========================================================================
-- PASO 7: FIN
-- ========================================================================

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Migración 007 completada: todas las tablas y columnas renombradas al estándar OS_' AS status;
