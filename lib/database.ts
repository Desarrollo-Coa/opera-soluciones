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
      connectionLimit: 10,
      queueLimit: 0,
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
      const connection = await this.pool.getConnection();
      return new MySQLConnection(connection);
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
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
 * Execute a database query with parameters
 * Ejecutar consulta de base de datos con parámetros
 */
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const connection = await getConnection();
  try {
    return await connection.execute(query, params);
  } finally {
    connection.release();
  }
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

// Export the pool instance for advanced usage
export { dbPool };
