import mysql from 'mysql2/promise';
import { ERROR_MESSAGES } from './constants';

// =====================================================
// SGI Opera Soluciones - Unified Database Module
// Módulo de base de datos unificado (lib/db.ts)
// =====================================================

// Declaración para evitar que TypeScript se queje de la variable global de node
// Declaración para evitar que TypeScript se queje de la variable global
const globalForDb = global as unknown as { pool: mysql.Pool };

// Opciones de conexión estándar recomendadas para Serverless/App Router
const dbOptions: mysql.PoolOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sgi_opera_soluciones',
    // REGLA #2: Configuración obligatoria con pool
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000,
    multipleStatements: false, // Seguridad
    timezone: '+00:00',
};

/**
 * Exportamos el pool global. 
 * Reutiliza la conexión existente o crea una nueva.
 */
export const pool =
    globalForDb.pool ||
    mysql.createPool(dbOptions);

if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = pool;
}

/**
 * Interfaz para conexiones obtenidas del pool
 */
export interface DatabaseConnection {
    execute(query: string, params?: any[]): Promise<any>;
    release(): void;
}

/**
 * Clase envoltorio para PoolConnection cumpliendo con la interfaz DatabaseConnection
 */
class MySQLConnection implements DatabaseConnection {
    constructor(private connection: mysql.PoolConnection) { }

    async execute(query: string, params: any[] = []): Promise<any> {
        try {
            const [rows] = await this.connection.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
        }
    }

    release(): void {
        this.connection.release();
    }
}

/**
 * Obtiene una conexión del pool (para transacciones o múltiples queries secuenciales)
 */
export async function getConnection(): Promise<DatabaseConnection> {
    try {
        const connection = await pool.getConnection();
        return new MySQLConnection(connection);
    } catch (error) {
        console.error('[DB Pool] Database connection error:', error);
        throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
}

/**
 * Helper: Ejecutar consulta directamente con el pool (más eficiente para queries simples)
 * SIEMPRE usa parámetros preparados por seguridad.
 */
export async function executeQuery(query: string, params: any[] = [], maxRetries: number = 3): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            lastError = error as Error;
            console.error(`[DB Query] Query failed (attempt ${attempt}/${maxRetries}):`, error);
            if (attempt === maxRetries) break;

            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError || new Error(ERROR_MESSAGES.DATABASE_ERROR);
}

/**
 * Helper: Ejecutar transacción de base de datos
 */
export async function executeTransaction<T>(
    operations: (connection: DatabaseConnection) => Promise<T>
): Promise<T> {
    const conn = await pool.getConnection();
    const connection = new MySQLConnection(conn);
    try {
        await conn.beginTransaction();
        const result = await operations(connection);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Close all database connections
 * Cerrar todas las conexiones de base de datos
 */
export async function closeDatabaseConnections(): Promise<void> {
    await pool.end();
}

// Alias para compatibilidad con código antiguo que use dbPool
export const dbPool = {
    getConnection,
    end: closeDatabaseConnections,
    getPoolStats: () => ({ status: 'active', timestamp: new Date().toISOString() })
};
