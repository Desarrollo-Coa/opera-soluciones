require('dotenv').config();
const cron = require('node-cron');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');

// Crear pool de conexiones a la BD
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sgi_opera_soluciones',
    connectionLimit: 5
});

let lastSentDate = null; // Para evitar enviar correos dobles el mismo día

async function checkAndSendEmails() {
    try {
        // 1. Obtener configuración
        const [rows] = await pool.query('SELECT HORA_ENVIO, EMAILS, ACTIVO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM FROM OS_MAILER_CONFIG LIMIT 1');
        if (rows.length === 0) return;

        const config = rows[0];
        if (!config.ACTIVO) return;

        // Validar que exista configuración SMTP
        if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
            console.error(`[${new Date().toISOString()}] Error: Faltan credenciales SMTP en la base de datos.`);
            return;
        }

        // Configurar Nodemailer de forma dinámica
        const transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT || 465,
            secure: Number(config.SMTP_PORT) === 465, // true para 465, false para otros puertos
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            },
        });

        const senderEmail = config.SMTP_FROM || config.SMTP_USER;

        // 2. Comprobar si es la hora de envío
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHour}:${currentMinute}`;
        const todayStr = format(now, 'yyyy-MM-dd');

        // Si la hora coincide y no se ha enviado hoy
        if (config.HORA_ENVIO === currentTimeStr && lastSentDate !== todayStr) {
            console.log(`[${new Date().toISOString()}] Hora alcanzada (${config.HORA_ENVIO}). Iniciando proceso de envío de correos...`);
            
            let emailsList = [];
            try {
                emailsList = typeof config.EMAILS === 'string' ? JSON.parse(config.EMAILS) : config.EMAILS;
            } catch (e) {
                console.error('Error parseando JSON de correos:', e);
            }

            if (!emailsList || emailsList.length === 0) {
                console.log('No hay correos destinatarios configurados. Omitiendo.');
                return;
            }

            // 3. Consultar usuarios activos
            const [users] = await pool.query(`
                SELECT u.ID_USUARIO_PK as id, u.US_NOMBRES as first_name, u.US_APELLIDOS as last_name, 
                       u.US_NUM_DOC as document_number
                FROM OS_USUARIOS u
                WHERE u.US_ACTIVO = 1 AND u.ID_ROL_FK = 5
            `);

            // 4. Consultar autorreportes de hoy (inicio de labores o descanso)
            const [reportes] = await pool.query(`
                SELECT ID_USUARIO_FK as user_id
                FROM OS_REGISTROS_AUTORREPORTE 
                WHERE DATE(RA_FECHA_CREACION) = ?
            `, [todayStr]);

            const userIdsWithReport = new Set(reportes.map(r => r.user_id));

            // 5. Filtrar pendientes
            const pendientes = users.filter(u => !userIdsWithReport.has(u.id));

            // 6. Preparar contenido del correo
            let subject = `Reporte Diario de Autorreporte - ${format(now, 'dd/MM/yyyy')}`;
            let htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
                        <h2 style="margin: 0;">SGI Opera Soluciones</h2>
                        <p style="margin: 5px 0 0 0;">Estado Diario de Autorreportes</p>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hola,</p>
                        <p>Este es el reporte automático de trabajadores para el día <strong>${format(now, 'dd/MM/yyyy')}</strong>.</p>
            `;

            if (pendientes.length === 0) {
                subject = `✅ Completado - ${subject}`;
                htmlContent += `
                    <div style="background-color: #dcfce7; color: #166534; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
                        <h3 style="margin: 0;">¡Excelente!</h3>
                        <p style="margin: 5px 0 0 0;">Todos los trabajadores activos han completado su autorreporte (inicio de labores o descanso) el día de hoy.</p>
                    </div>
                `;
            } else {
                subject = `⚠️ ${pendientes.length} Pendientes - ${subject}`;
                htmlContent += `
                    <div style="background-color: #fef2f2; color: #991b1b; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fecaca;">
                        <h3 style="margin: 0;">Trabajadores Pendientes (${pendientes.length})</h3>
                        <p style="margin: 5px 0 15px 0;">Los siguientes trabajadores activos aún no han registrado su autorreporte hoy:</p>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #fca5a5; text-align: left;">
                                    <th style="padding: 8px 4px;">Documento</th>
                                    <th style="padding: 8px 4px;">Nombre Completo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendientes.map(p => `
                                    <tr style="border-bottom: 1px solid #fee2e2;">
                                        <td style="padding: 8px 4px;">${p.document_number}</td>
                                        <td style="padding: 8px 4px;">${p.first_name} ${p.last_name}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            htmlContent += `
                        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                            Este es un correo automático generado por el Sistema de Gestión Integrado SGI Opera Soluciones. Por favor no responder a este correo.
                        </p>
                    </div>
                </div>
            `;

            // 7. Enviar correo
            const info = await transporter.sendMail({
                from: senderEmail,
                to: emailsList.join(', '),
                subject: subject,
                html: htmlContent
            });

            console.log(`[${new Date().toISOString()}] Correo enviado exitosamente a ${emailsList.length} destinatario(s). ID: ${info.messageId}`);
            
            // Marcar como enviado hoy
            lastSentDate = todayStr;
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error en el proceso de envío:`, error);
    }
}

// Ejecutar cada minuto para revisar la configuración
cron.schedule('* * * * *', () => {
    checkAndSendEmails();
});

console.log('============================================');
console.log(' SGI Autorreporte Mailer iniciado (PM2)');
console.log(' Verificando base de datos cada minuto...');
console.log('============================================');
