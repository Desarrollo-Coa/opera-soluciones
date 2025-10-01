// =====================================================
// SGI Opera Soluciones - Database Connection
// Conexión a base de datos
// =====================================================
// Description: Database connection and query execution utilities
// Descripción: Utilidades de conexión a base de datos y ejecución de consultas
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import mysql from 'mysql2/promise';
import { ERROR_MESSAGES } from './constants';

/**
 * Database connection interface
 * Interfaz de conexión a base de datos
 */
export interface DatabaseConnection {
  execute(query: string, params?: any[]): Promise<any>;
  release(): void;
}

/**
 * MySQL database connection implementation
 * Implementación de conexión a base de datos MySQL
 */
class MySQLConnection implements DatabaseConnection {
  private connection: mysql.PoolConnection;

  constructor(connection: mysql.PoolConnection) {
    this.connection = connection;
  }

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
 * Database connection pool for better performance
 * Pool de conexiones para mejor rendimiento
 */
class DatabaseConnectionPool {
  private pool: mysql.Pool;
  private static instance: DatabaseConnectionPool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sgi_opera_soluciones',
      waitForConnections: true,
      connectionLimit: 20,                    // Aumentar límite de conexiones
      queueLimit: 50,                        // Límite en cola para evitar sobrecarga
    });
  }

  static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  async getConnection(): Promise<DatabaseConnection> {
    try {
      console.log(`[DB Pool] Getting connection...`);
      
      const connection = await this.pool.getConnection();
      console.log(`[DB Pool] Connection acquired successfully`);
      return new MySQLConnection(connection);
    } catch (error) {
      console.error('[DB Pool] Database connection error:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Get pool statistics for monitoring
   * Obtener estadísticas del pool para monitoreo
   */
  getPoolStats() {
    return {
      connectionLimit: 20,
      queueLimit: 50,
      status: 'active',
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
const dbPool = DatabaseConnectionPool.getInstance();

/**
 * Get database connection
 * Obtener conexión a base de datos
 */
export async function getConnection(): Promise<DatabaseConnection> {
  return await dbPool.getConnection();
}

/**
 * Execute a database query with parameters and retry mechanism
 * Ejecutar consulta de base de datos con parámetros y mecanismo de reintento
 */
export async function executeQuery(query: string, params: any[] = [], maxRetries: number = 3): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const connection = await getConnection();
    try {
      console.log(`[DB Query] Executing query (attempt ${attempt}/${maxRetries}):`, query.substring(0, 100) + '...');
      const startTime = Date.now();
      
      const result = await connection.execute(query, params);
      
      const duration = Date.now() - startTime;
      console.log(`[DB Query] Query completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`[DB Query] Query failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // Si es el último intento, no reintentar
      if (attempt === maxRetries) {
        break;
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`[DB Query] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      connection.release();
    }
  }
  
  throw lastError || new Error(ERROR_MESSAGES.DATABASE_ERROR);
}

/**
 * Execute a database transaction
 * Ejecutar transacción de base de datos
 */
export async function executeTransaction<T>(
  operations: (connection: DatabaseConnection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();
  try {
    await connection.execute('START TRANSACTION');
    const result = await operations(connection);
    await connection.execute('COMMIT');
    return result;
  } catch (error) {
    await connection.execute('ROLLBACK');
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
  await dbPool.end();
}

/**
 * Get database pool statistics
 * Obtener estadísticas del pool de base de datos
 */
export function getPoolStats() {
  return dbPool.getPoolStats();
}

// Export the pool instance for advanced usage
export { dbPool };
