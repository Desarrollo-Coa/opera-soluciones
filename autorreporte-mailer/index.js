process.env.TZ = 'America/Bogota';
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

let lastSentEntradaDate = null;
let lastSentSalidaDate = null;

async function checkAndSendEmails() {
    try {
        // 1. Obtener configuración
        const [rows] = await pool.query('SELECT HORA_ENVIO, HORA_ENVIO_SALIDA, EMAILS, ACTIVO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM FROM OS_MAILER_CONFIG LIMIT 1');
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
            secure: Number(config.SMTP_PORT) === 465,
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

        const isHoraEntrada = config.HORA_ENVIO === currentTimeStr;
        const isHoraSalida = config.HORA_ENVIO_SALIDA === currentTimeStr;

        if (!isHoraEntrada && !isHoraSalida) return;

        if (isHoraEntrada && lastSentEntradaDate === todayStr) return;
        if (isHoraSalida && lastSentSalidaDate === todayStr) return;

        const tipoReporte = isHoraEntrada ? 'ENTRADAS' : 'SALIDAS';

        console.log(`[${new Date().toISOString()}] Hora alcanzada para reporte de ${tipoReporte} (${currentTimeStr}). Iniciando proceso...`);
            
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

        // 3. Consultar todos los empleados y sus estados del día (igual que en la app)
        const query = `
            SELECT 
                u.US_IDUSUARIO_PK as id, 
                u.US_NOMBRE as first_name, 
                u.US_APELLIDO as last_name, 
                u.US_NUMERO_DOCUMENTO as document_number,
                (
                    SELECT a.AU_IDAUSENCIA_PK
                    FROM OS_AUSENCIAS a
                    WHERE a.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK 
                        AND a.AU_ACTIVO = 1
                        AND ? BETWEEN a.AU_FECHA_INICIO AND a.AU_FECHA_FIN
                    LIMIT 1
                ) as tiene_ausencia,
                (SELECT AR_IDAUTORREPORTE_PK FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_TIPO = 'INICIO' AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1 LIMIT 1) as reporte_inicio,
                (SELECT AR_IDAUTORREPORTE_PK FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_TIPO = 'DESCANSO' AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1 LIMIT 1) as reporte_descanso,
                (SELECT AR_IDAUTORREPORTE_PK FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = u.US_IDUSUARIO_PK AND AR_TIPO = 'FIN' AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1 LIMIT 1) as reporte_fin
            FROM OS_USUARIOS u
            JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK
            WHERE u.US_ACTIVO = 1 
                AND u.US_FECHA_ELIMINACION IS NULL
                AND ur.RO_NOMBRE != 'ADMINISTRADOR'
        `;

        const [empleadosRows] = await pool.query(query, [todayStr, todayStr, todayStr, todayStr]);

        let pendientes = [];
        let descripcionReporte = '';

        if (isHoraEntrada) {
            // Filtrar pendientes de entrada
            pendientes = empleadosRows.filter(row => 
                !row.tiene_ausencia && 
                !row.reporte_inicio && 
                !row.reporte_descanso && 
                !row.reporte_fin
            );
            descripcionReporte = 'Los siguientes trabajadores activos aún no han registrado su autorreporte de inicio de labores:';
        } else {
            // Filtrar pendientes de salida (marcaron inicio pero no marcaron fin)
            pendientes = empleadosRows.filter(row => 
                row.reporte_inicio && 
                !row.reporte_fin
            );
            descripcionReporte = 'Los siguientes trabajadores registraron su ingreso (INICIO) el día de hoy, pero olvidaron registrar su SALIDA (FIN):';
        }

        // 6. Preparar contenido del correo
        let subject = `Reporte de Autorreporte (${tipoReporte}) - ${format(now, 'dd/MM/yyyy')}`;
        let htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #09090b; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e4e4e7; text-align: center;">
                    <img src="cid:logopera" alt="SGI Opera Soluciones" style="max-height: 48px; margin-bottom: 16px;" />
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em;">Estado Diario de Autorreportes</h2>
                </div>
                <div style="padding: 32px;">
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                        Este es el reporte automatizado de <strong>${tipoReporte}</strong> correspondiente al día <strong>${format(now, 'dd/MM/yyyy')}</strong>.
                    </p>
        `;

        if (pendientes.length === 0) {
            subject = `Completado: ${subject}`;
            htmlContent += `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; margin: 0;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Todo en orden</h3>
                    <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
                        ${isHoraEntrada 
                            ? 'Todos los trabajadores activos han completado exitosamente su autorreporte de ingreso el día de hoy.'
                            : 'Todos los trabajadores que ingresaron hoy ya han registrado exitosamente su reporte de salida.'}
                    </p>
                </div>
            `;
        } else {
            subject = `Pendientes (${pendientes.length}): ${subject}`;
            htmlContent += `
                <div style="margin: 0;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #09090b;">
                        Trabajadores Pendientes (${pendientes.length})
                    </h3>
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #71717a;">
                        ${descripcionReporte}
                    </p>
                    <div style="border: 1px solid #e4e4e7; border-radius: 6px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f4f4f5; border-bottom: 1px solid #e4e4e7; text-align: left;">
                                    <th style="padding: 12px 16px; font-weight: 500; color: #3f3f46;">Documento</th>
                                    <th style="padding: 12px 16px; font-weight: 500; color: #3f3f46;">Nombre Completo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendientes.map((p, index) => `
                                    <tr style="${index !== pendientes.length - 1 ? 'border-bottom: 1px solid #e4e4e7;' : ''}">
                                        <td style="padding: 12px 16px; color: #52525b;">${p.document_number}</td>
                                        <td style="padding: 12px 16px; font-weight: 500; color: #09090b;">${p.first_name} ${p.last_name}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        htmlContent += `
                </div>
                <div style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                        Generado automáticamente por el Sistema de Gestión Integrado<br/>
                        <strong>SGI Opera Soluciones</strong>
                    </p>
                </div>
            </div>
        `;

        // 7. Enviar correo
        const info = await transporter.sendMail({
            from: senderEmail,
            to: emailsList.join(', '),
            subject: subject,
            html: htmlContent,
            attachments: [{
                filename: 'logopera.png',
                path: require('path').join(__dirname, 'logopera.png'),
                cid: 'logopera'
            }]
        });

        console.log(`[${new Date().toISOString()}] Correo de ${tipoReporte} enviado exitosamente a ${emailsList.length} destinatario(s). ID: ${info.messageId}`);
        
        // Marcar como enviado hoy
        if (isHoraEntrada) lastSentEntradaDate = todayStr;
        if (isHoraSalida) lastSentSalidaDate = todayStr;
        
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
console.log(` Hora local del sistema Node: ${format(new Date(), 'HH:mm:ss')} (America/Bogota)`);
console.log(' Verificando base de datos cada minuto...');
console.log('============================================');
