'use server'

import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export interface ReferenceItem {
    id: number;
    nombre: string;
}

export interface ActionResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Acciones de servidor para obtener datos de referencia de las tablas maestras.
 * Migración 007: tablas renombradas con prefijo OS_
 */

export async function getEpsAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT EP_IDEPS_PK as id, EP_NOMBRE as nombre FROM OS_ENTIDADES_EPS WHERE EP_ACTIVO = 1 ORDER BY EP_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching EPS:', error);
        return { success: false, message: 'Error al cargar EPS' };
    }
}

export async function getArlAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT AR_IDARL_PK as id, AR_NOMBRE as nombre FROM OS_ENTIDADES_ARL WHERE AR_ACTIVO = 1 ORDER BY AR_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching ARL:', error);
        return { success: false, message: 'Error al cargar ARL' };
    }
}

export async function getPensionFundsAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT PE_IDPENSION_PK as id, PE_NOMBRE as nombre FROM OS_ENTIDADES_PENSION WHERE PE_ACTIVO = 1 ORDER BY PE_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching Pension Funds:', error);
        return { success: false, message: 'Error al cargar Fondos de Pensión' };
    }
}

export async function getCompensationFundsAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT CC_IDCAJA_PK as id, CC_NOMBRE as nombre FROM OS_CAJAS_COMPENSACION WHERE CC_ACTIVO = 1 ORDER BY CC_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching Compensation Funds:', error);
        return { success: false, message: 'Error al cargar Cajas de Compensación' };
    }
}

export async function getWorkModalitiesAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT MT_IDMODALIDAD_PK as id, MT_NOMBRE as nombre FROM OS_MODALIDADES_TRABAJO ORDER BY MT_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching Work Modalities:', error);
        return { success: false, message: 'Error al cargar Modalidades de Trabajo' };
    }
}

export async function getBanksAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT EB_IDBANCO_PK as id, EB_NOMBRE as nombre FROM OS_ENTIDADES_BANCARIAS WHERE EB_ACTIVO = 1 ORDER BY EB_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching Banks:', error);
        return { success: false, message: 'Error al cargar Entidades Bancarias' };
    }
}

export async function getDepartmentsAction(): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT DE_IDDEPARTAMENTO_PK as id, DE_NOMBRE as nombre FROM OS_DEPARTAMENTOS ORDER BY DE_NOMBRE ASC'
        );
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching Departments:', error);
        return { success: false, message: 'Error al cargar Departamentos' };
    }
}

export async function getMunicipalitiesAction(departamentoId?: number): Promise<ActionResponse<ReferenceItem[]>> {
    try {
        let query = 'SELECT MU_IDMUNICIPIO_PK as id, MU_NOMBRE as nombre FROM OS_MUNICIPIOS';
        const params: any[] = [];

        if (departamentoId) {
            query += ' WHERE DE_IDDEPARTAMENTO_FK = ?';
            params.push(departamentoId);
        }

        query += ' ORDER BY MU_NOMBRE ASC';

        const [rows] = await pool.execute<RowDataPacket[]>(query, params);
        return { success: true, data: rows as ReferenceItem[] };
    } catch (error: any) {
        console.error('Error fetching Municipalities:', error);
        return { success: false, message: 'Error al cargar Municipios' };
    }
}
