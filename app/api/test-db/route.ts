import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

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

    // Probar consulta de ausencias
    const ausenciasResult = await executeQuery('SELECT COUNT(*) as total FROM ausencias');
    console.log("Total ausencias en BD:", ausenciasResult);

    // Probar consulta de usuarios
    const usuariosResult = await executeQuery('SELECT COUNT(*) as total FROM users');
    console.log("Total usuarios en BD:", usuariosResult);

    return NextResponse.json({
      success: true,
      testQuery: result,
      totalAusencias: ausenciasResult,
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
