'use server';

import { executeQuery } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { ROLE_CODES } from '@/lib/constants';

export async function getMailerConfigAction() {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN) {
            return { success: false, message: 'No tienes permisos para ver esta configuración' };
        }

        const rows = await executeQuery(`SELECT ID, HORA_ENVIO, EMAILS, ACTIVO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM FROM OS_MAILER_CONFIG LIMIT 1`) as any[];
        if (rows.length === 0) {
            return { 
                success: true, 
                data: { 
                    id: 0, hora_envio: '10:00', emails: [], activo: false,
                    smtp_host: '', smtp_port: 465, smtp_user: '', smtp_pass: '', smtp_from: ''
                } 
            };
        }

        const config = rows[0];
        let emails = [];
        if (typeof config.EMAILS === 'string') {
            try { emails = JSON.parse(config.EMAILS); } catch (e) { emails = []; }
        } else if (Array.isArray(config.EMAILS)) {
            emails = config.EMAILS;
        }

        return { 
            success: true, 
            data: { 
                id: config.ID, 
                hora_envio: config.HORA_ENVIO, 
                emails, 
                activo: Boolean(config.ACTIVO),
                smtp_host: config.SMTP_HOST || '',
                smtp_port: config.SMTP_PORT || 465,
                smtp_user: config.SMTP_USER || '',
                smtp_pass: config.SMTP_PASS || '',
                smtp_from: config.SMTP_FROM || ''
            } 
        };
    } catch (error) {
        console.error('[Mailer Config] Error:', error);
        return { success: false, message: 'Error al obtener configuración de correo' };
    }
}

export async function saveMailerConfigAction(data: { 
    hora_envio: string, emails: string[], activo: boolean,
    smtp_host: string, smtp_port: number, smtp_user: string, smtp_pass: string, smtp_from: string
}) {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN) {
            return { success: false, message: 'No tienes permisos para modificar esta configuración' };
        }

        const emailsJson = JSON.stringify(data.emails);
        const activoInt = data.activo ? 1 : 0;

        const rows = await executeQuery(`SELECT ID FROM OS_MAILER_CONFIG LIMIT 1`) as any[];
        
        if (rows.length > 0) {
            await executeQuery(
                `UPDATE OS_MAILER_CONFIG SET 
                    HORA_ENVIO = ?, EMAILS = ?, ACTIVO = ?,
                    SMTP_HOST = ?, SMTP_PORT = ?, SMTP_USER = ?, SMTP_PASS = ?, SMTP_FROM = ?
                 WHERE ID = ?`,
                [
                    data.hora_envio, emailsJson, activoInt,
                    data.smtp_host, data.smtp_port, data.smtp_user, data.smtp_pass, data.smtp_from,
                    rows[0].ID
                ]
            );
        } else {
            await executeQuery(
                `INSERT INTO OS_MAILER_CONFIG 
                    (HORA_ENVIO, EMAILS, ACTIVO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.hora_envio, emailsJson, activoInt,
                    data.smtp_host, data.smtp_port, data.smtp_user, data.smtp_pass, data.smtp_from
                ]
            );
        }

        return { success: true, message: 'Configuración guardada exitosamente' };
    } catch (error) {
        console.error('[Mailer Config] Error al guardar:', error);
        return { success: false, message: 'Error al guardar configuración de correo' };
    }
}
