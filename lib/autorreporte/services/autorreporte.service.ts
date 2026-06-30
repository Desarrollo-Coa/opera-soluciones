import { pool, executeQuery } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/constants';
import { AutorreporteRow, TipoAutorreporte, EmpleadoAutorreporte } from '@/types/autorreporte';
import { format } from 'date-fns';
import { RowDataPacket } from 'mysql2/promise';

// =====================================================
// SGI Opera Soluciones - Autorreporte Service
// =====================================================

export class AutorreporteService {
    /**
     * Registra un autorreporte de un usuario
     */
    static async registrarReporte(
        usuarioId: number,
        tipo: TipoAutorreporte,
        fotoUrl: string | null = null,
        respuestas?: { preguntaId: number; valor: string }[],
        lat?: number | null,
        lng?: number | null
    ): Promise<number> {
        try {
            // Fecha local aproximada
            const ahora = new Date();
            const fechaRegistro = format(ahora, 'yyyy-MM-dd');
            const fechaHora = format(ahora, 'yyyy-MM-dd HH:mm:ss');

            // Validar si ya existe el reporte hoy
            const checkQuery = `SELECT AR_IDAUTORREPORTE_PK FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = ? AND AR_TIPO = ? AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1`;
            const rows = await executeQuery(checkQuery, [usuarioId, tipo, fechaRegistro]) as RowDataPacket[];
            
            if (rows.length > 0) {
                throw new Error(`Ya has registrado tu ${tipo.toLowerCase()} el día de hoy.`);
            }

            const result = await executeQuery(
                `INSERT INTO OS_AUTORREPORTES 
                (US_IDUSUARIO_FK, AR_TIPO, AR_FECHA_HORA, AR_FECHA_REGISTRO, AR_URL_FOTO, AR_LATITUD, AR_LONGITUD) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [usuarioId, tipo, fechaHora, fechaRegistro, fotoUrl, lat ?? null, lng ?? null]
            );

            const insertId = result.insertId;

            // Guardar respuestas si las hay
            if (respuestas && respuestas.length > 0) {
                const queryValues = respuestas.map(r => `(${insertId}, ${r.preguntaId}, ?)`);
                const insertRespuestasQuery = `INSERT INTO OS_RESPUESTAS_AUTORREPORTE (AR_IDAUTORREPORTE_FK, PA_IDPREGUNTA_FK, RA_VALOR) VALUES ${queryValues.join(', ')}`;
                const values = respuestas.map(r => r.valor);
                await executeQuery(insertRespuestasQuery, values);
            }

            return insertId;
        } catch (error: any) {
            console.error('[AutorreporteService] Error al registrar reporte:', error);
            if (error.message && error.message.includes('Ya has registrado')) {
                throw error;
            }
            throw new Error('Error al registrar el autorreporte');
        }
    }

    /**
     * Obtiene los autorreportes y estado de ausencias para un día específico
     */
    static async obtenerSeguimientoDiario(fecha: string): Promise<EmpleadoAutorreporte[]> {
        try {
            // Consulta para traer a todos los empleados activos y sus reportes/ausencias de la fecha dada
            const query = `
                SELECT 
                    u.US_IDUSUARIO_PK as id, 
                    u.US_NOMBRE as first_name, 
                    u.US_APELLIDO as last_name, 
                    u.US_NUMERO_DOCUMENTO as document_number,
                    u.US_TIPO_DOCUMENTO as document_type,
                    u.US_ACTIVO as is_active,
                    -- Verificar si tiene ausencia en la fecha
                    (
                        SELECT CONCAT(ta.TA_NOMBRE, '|||', a.AU_DESCRIPCION)
                        FROM OS_AUSENCIAS a
                        JOIN OS_TIPOS_AUSENCIA ta ON a.TA_IDTIPO_AUSENCIA_FK = ta.TA_IDTIPO_AUSENCIA_PK
                        WHERE a.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK 
                          AND a.AU_ACTIVO = 1
                          AND ? BETWEEN a.AU_FECHA_INICIO AND a.AU_FECHA_FIN
                        LIMIT 1
                    ) as ausencia_info,
                    -- Extraer autorreportes del día con ID (ID|||HORA|||FOTO|||LAT|||LNG)
                    (SELECT CONCAT(AR_IDAUTORREPORTE_PK, '|||', AR_FECHA_HORA, '|||', IFNULL(AR_URL_FOTO, ''), '|||', IFNULL(AR_LATITUD, ''), '|||', IFNULL(AR_LONGITUD, '')) FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_TIPO = 'INICIO' AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1 ORDER BY AR_FECHA_HORA ASC LIMIT 1) as reporte_inicio,
                    (SELECT CONCAT(AR_IDAUTORREPORTE_PK, '|||', AR_FECHA_HORA, '|||', IFNULL(AR_LATITUD, ''), '|||', IFNULL(AR_LONGITUD, '')) FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_TIPO = 'DESCANSO' AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1 ORDER BY AR_FECHA_HORA ASC LIMIT 1) as reporte_descanso,
                    (SELECT CONCAT(AR_IDAUTORREPORTE_PK, '|||', AR_FECHA_HORA, '|||', IFNULL(AR_URL_FOTO, ''), '|||', IFNULL(AR_LATITUD, ''), '|||', IFNULL(AR_LONGITUD, '')) FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_TIPO = 'FIN' AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1 ORDER BY AR_FECHA_HORA DESC LIMIT 1) as reporte_fin
                FROM OS_USUARIOS u
                JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK
                WHERE u.US_ACTIVO = 1 
                   OR EXISTS (SELECT 1 FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1)
                   OR EXISTS (SELECT 1 FROM OS_AUSENCIAS WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND ? BETWEEN AU_FECHA_INICIO AND AU_FECHA_FIN AND AU_ACTIVO = 1)
            `;

            const rows = await executeQuery(query, [fecha, fecha, fecha, fecha, fecha, fecha]) as RowDataPacket[];

            const resultados: EmpleadoAutorreporte[] = rows.map((row: any) => {
                const emp: EmpleadoAutorreporte = {
                    id: row.id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    document_number: row.document_number,
                    document_type: row.document_type,
                    is_active: Boolean(row.is_active),
                    estado_reporte: 'PENDIENTE',
                    reportes: {
                        inicio: null,
                        descanso: null,
                        fin: null
                    },
                    ausencia: null
                };

                // Parsear ausencia si existe
                if (row.ausencia_info) {
                    const [nombre] = row.ausencia_info.split('|||');
                    emp.ausencia = { tipo: 'Ausencia', nombre };
                    emp.estado_reporte = 'AUSENCIA';
                }

                // Parsear reportes
                let tieneReporte = false;

                if (row.reporte_inicio) {
                    const [id, hora, foto, lat, lng] = row.reporte_inicio.split('|||');
                    emp.reportes.inicio = { id: parseInt(id), hora, foto: foto || null, lat: lat ? parseFloat(lat) : undefined, lng: lng ? parseFloat(lng) : undefined };
                    tieneReporte = true;
                }
                
                if (row.reporte_descanso) {
                    const [id, hora, lat, lng] = row.reporte_descanso.split('|||');
                    emp.reportes.descanso = { id: parseInt(id), hora, lat: lat ? parseFloat(lat) : undefined, lng: lng ? parseFloat(lng) : undefined };
                    tieneReporte = true;
                }

                if (row.reporte_fin) {
                    const [id, hora, foto, lat, lng] = row.reporte_fin.split('|||');
                    emp.reportes.fin = { id: parseInt(id), hora, foto: foto || null, lat: lat ? parseFloat(lat) : undefined, lng: lng ? parseFloat(lng) : undefined };
                    tieneReporte = true;
                }

                if (tieneReporte) {
                    emp.estado_reporte = 'REPORTADO';
                }

                return emp;
            });

            return resultados;
        } catch (error) {
            console.error('[AutorreporteService] Error al obtener seguimiento:', error);
            throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
        }
    }

    /**
     * Elimina lógicamente un reporte y devuelve su URL de foto para borrar de la nube
     */
    static async eliminarReporte(idReporte: number): Promise<string | null> {
        try {
            // Obtener url de la foto antes de desactivar
            const query = `SELECT AR_URL_FOTO FROM OS_AUTORREPORTES WHERE AR_IDAUTORREPORTE_PK = ?`;
            const rows = await executeQuery(query, [idReporte]) as RowDataPacket[];
            const fotoUrl = rows.length > 0 ? rows[0].AR_URL_FOTO : null;

            // Borrado lógico
            await executeQuery(`UPDATE OS_AUTORREPORTES SET AR_ACTIVO = 0 WHERE AR_IDAUTORREPORTE_PK = ?`, [idReporte]);

            return fotoUrl;
        } catch (error) {
            console.error('[AutorreporteService] Error al eliminar reporte:', error);
            throw new Error('Error al eliminar el autorreporte');
        }
    }
}
