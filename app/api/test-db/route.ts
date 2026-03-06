import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * Ruta de diagnóstico de BD — Migración 007: tablas OS_
 */
export async function GET() {
  try {
    console.log("Probando conexión a base de datos...");
    console.log("Variables de entorno DB:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      hasPassword: !!process.env.DB_PASSWORD
    });

    // Probar consulta simple
    const result = await executeQuery('SELECT 1 as test');
    console.log("Resultado de prueba:", result);

    // Migración 007: OS_AUSENCIAS
    const ausenciasResult = await executeQuery('SELECT COUNT(*) as total FROM OS_AUSENCIAS');
    console.log("Total ausencias en BD:", ausenciasResult);

    // Migración 007: OS_TIPOS_AUSENCIA con columna TA_ACTIVO
    const tiposResult = await executeQuery('SELECT * FROM OS_TIPOS_AUSENCIA WHERE TA_ACTIVO = TRUE');
    console.log("Tipos de ausencia en BD:", tiposResult);

    // Migración 007: OS_USUARIOS
    const usuariosResult = await executeQuery('SELECT COUNT(*) as total FROM OS_USUARIOS');
    console.log("Total usuarios en BD:", usuariosResult);

    return NextResponse.json({
      success: true,
      testQuery: result,
      totalAusencias: ausenciasResult,
      tiposAusencia: tiposResult,
      totalUsuarios: usuariosResult,
      env: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
      }
    });
  } catch (error) {
    console.error("Error en prueba de base de datos:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
