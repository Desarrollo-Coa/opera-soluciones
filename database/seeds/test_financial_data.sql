-- Script para poblar datos de prueba: Contabilidad, Facturación y Bancos (2025-2026)
-- Este script asume que ya ejecutaste la migración 014 y las tablas FIN_ están vacías o listas.

-- 0. Limpieza previa (Entorno de Desarrollo)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `FIN_MODULE_DATA`;
TRUNCATE TABLE `FIN_MODULE_COLUMNS`;
TRUNCATE TABLE `FIN_MODULE_SHEETS`;
TRUNCATE TABLE `FIN_MODULES`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Crear el Módulo Principal (Libro)
INSERT INTO `FIN_MODULES` (name, description, created_by) 
VALUES ('Gestión Financiera Integral', 'Control de contabilidad, facturación y bancos 2025-2026', 1);

SET @module_id = LAST_INSERT_ID();

-- 2. Crear las Hojas (Pestañas por Año/Concepto)
INSERT INTO `FIN_MODULE_SHEETS` (module_id, name, sheet_order) VALUES (@module_id, 'Resumen 2025', 0);
SET @sheet_2025 = LAST_INSERT_ID();

INSERT INTO `FIN_MODULE_SHEETS` (module_id, name, sheet_order) VALUES (@module_id, 'Proyección 2026', 1);
SET @sheet_2026 = LAST_INSERT_ID();

-- 3. Definir Columnas para la Hoja 2025
INSERT INTO `FIN_MODULE_COLUMNS` (module_id, sheet_id, field_key, header_name, field_type, column_order, width) VALUES 
(@module_id, @sheet_2025, 'mes', 'Mes', 'text', 0, 120),
(@module_id, @sheet_2025, 'categoria', 'Categoría', 'select', 1, 150),
(@module_id, @sheet_2025, 'concepto', 'Concepto', 'text', 2, 250),
(@module_id, @sheet_2025, 'tipo', 'Tipo Gasto', 'select', 3, 130),
(@module_id, @sheet_2025, 'monto', 'Monto ($)', 'currency', 4, 180),
(@module_id, @sheet_2025, 'estado', 'Estado Pago', 'select', 5, 120);

-- Actualizar opciones de los selects 2025
UPDATE `FIN_MODULE_COLUMNS` SET options = '["Bancos", "Facturación", "Gastos Operativos", "Nómina"]' WHERE field_key = 'categoria' AND sheet_id = @sheet_2025;
UPDATE `FIN_MODULE_COLUMNS` SET options = '["Fijo", "Variable", "Inversión"]' WHERE field_key = 'tipo' AND sheet_id = @sheet_2025;
UPDATE `FIN_MODULE_COLUMNS` SET options = '["Pagado", "Pendiente", "Anulado"]' WHERE field_key = 'estado' AND sheet_id = @sheet_2025;

-- 4. Insertar Datos de Prueba (Simulación de un Año 2025 completo)
-- Enero
INSERT INTO `FIN_MODULE_DATA` (module_id, sheet_id, transaction_date, row_data, created_by) VALUES 
(@module_id, @sheet_2025, '2025-01-05', '{"mes": "Enero", "categoria": "Gastos Operativos", "concepto": "Arriendo Oficina Central", "tipo": "Fijo", "monto": 4500000, "estado": "Pagado"}', 1),
(@module_id, @sheet_2025, '2025-01-10', '{"mes": "Enero", "categoria": "Facturación", "concepto": "Cliente Alpha - Proyecto Web", "tipo": "Variable", "monto": 12500000, "estado": "Pagado"}', 1),
(@module_id, @sheet_2025, '2025-01-15', '{"mes": "Enero", "categoria": "Bancos", "concepto": "Pago Intereses Crédito", "tipo": "Fijo", "monto": 850000, "estado": "Pagado"}', 1),
-- Febrero
(@module_id, @sheet_2025, '2025-02-05', '{"mes": "Febrero", "categoria": "Gastos Operativos", "concepto": "Servicios Públicos Q1", "tipo": "Variable", "monto": 1200000, "estado": "Pagado"}', 1),
(@module_id, @sheet_2025, '2025-02-28', '{"mes": "Febrero", "categoria": "Nómina", "concepto": "Pago Salarios Febrero", "tipo": "Fijo", "monto": 28000000, "estado": "Pagado"}', 1),
-- Marzo
(@module_id, @sheet_2025, '2025-03-12', '{"mes": "Marzo", "categoria": "Facturación", "concepto": "Venta Licencias Software", "tipo": "Variable", "monto": 18900000, "estado": "Pendiente"}', 1),
(@module_id, @sheet_2025, '2025-03-20', '{"mes": "Marzo", "categoria": "Gastos Operativos", "concepto": "Mantenimiento Servidores", "tipo": "Inversión", "monto": 3500000, "estado": "Pagado"}', 1),
-- Abril a Diciembre (Resumen rápido)
(@module_id, @sheet_2025, '2025-06-15', '{"mes": "Junio", "categoria": "Facturación", "concepto": "Renovación Contrato Anual CL-02", "tipo": "Variable", "monto": 45000000, "estado": "Pagado"}', 1),
(@module_id, @sheet_2025, '2025-12-20', '{"mes": "Diciembre", "categoria": "Nómina", "concepto": "Primas y Aguinaldos", "tipo": "Variable", "monto": 15000000, "estado": "Pagado"}', 1);

-- 5. Definir Columnas para la Hoja 2026 (Proyección)
INSERT INTO `FIN_MODULE_COLUMNS` (module_id, sheet_id, field_key, header_name, field_type, column_order, width) VALUES 
(@module_id, @sheet_2026, 'trimestre', 'Trimestre', 'text', 0, 120),
(@module_id, @sheet_2026, 'proyeccion_ingresos', 'Ingresos Proyectados', 'currency', 1, 200),
(@module_id, @sheet_2026, 'gastos_estimados', 'Gastos Estimados', 'currency', 2, 200),
(@module_id, @sheet_2026, 'margen_objetivo', 'Margen %', 'number', 3, 100);

-- Datos 2026
INSERT INTO `FIN_MODULE_DATA` (module_id, sheet_id, transaction_date, row_data, created_by) VALUES 
(@module_id, @sheet_2026, '2026-01-01', '{"trimestre": "Q1 2026", "proyeccion_ingresos": 150000000, "gastos_estimados": 95000000, "margen_objetivo": 36}', 1),
(@module_id, @sheet_2026, '2026-04-01', '{"trimestre": "Q2 2026", "proyeccion_ingresos": 180000000, "gastos_estimados": 110000000, "margen_objetivo": 38}', 1);
