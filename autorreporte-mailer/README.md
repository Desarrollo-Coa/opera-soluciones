# SGI Autorreporte Mailer

Este es un microservicio en Node.js que se encarga de enviar automáticamente correos electrónicos con el resumen diario de los trabajadores que no han realizado su autorreporte.

Funciona de manera totalmente independiente del frontend/backend en Next.js, por lo que debe levantarse como un proceso en segundo plano en el servidor utilizando **PM2**.

## Requisitos Previos

- Node.js (v18+)
- `pnpm` instalado (`npm install -g pnpm`)
- PM2 instalado globalmente (`npm install -g pm2`)
- Servidor SMTP (ej. cuenta de Gmail con Contraseña de Aplicación)

## Instrucciones de Instalación en el Servidor

1. **Sube esta carpeta (`autorreporte-mailer`)** a tu servidor (puedes ponerla junto a la raíz de tu proyecto principal o donde prefieras).
   
2. Abre la terminal, navega a la carpeta e instala las dependencias usando `pnpm`:
   ```bash
   cd ruta/hacia/autorreporte-mailer
   pnpm install
   ```

3. Crea el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
   *Si estás en Windows, simplemente copia y pega el archivo `.env.example` y renómbralo a `.env`.*

4. **Configura el archivo `.env`** con los datos de acceso a tu base de datos:
   - Ya no es necesario configurar el servidor SMTP aquí; las credenciales y el servidor de correo se configuran dinámicamente desde el panel web de la aplicación (`http://localhost:3000/inicio/settings`).

5. **Inicia el servicio con PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

6. **(Opcional pero recomendado)** Configura PM2 para que el script arranque automáticamente si el servidor se reinicia:
   ```bash
   pm2 save
   pm2 startup
   ```

## ¿Cómo funciona?

- Una vez levantado con PM2, el script (`index.js`) se ejecuta en bucle infinito usando `node-cron` verificando la base de datos **cada minuto**.
- Comprueba la tabla `OS_MAILER_CONFIG` de tu base de datos para ver si el módulo de correo está **ACTIVADO** y a qué **HORA_ENVIO** debe enviarse.
- Cuando la hora del sistema coincide exactamente con la hora configurada (y si no se ha enviado ya un correo en el día de hoy), el script consultará:
  1. Todos los trabajadores activos (Rol 5).
  2. Los autorreportes del día de hoy.
- Luego, cruzará los datos y enviará un correo estilizado en formato HTML a los destinatarios configurados en la tabla con la lista de pendientes (o un mensaje de éxito si todos reportaron).

## Comandos útiles

- Ver si el servicio está corriendo: `pm2 list`
- Ver los logs (muy útil para depurar errores de envío): `pm2 logs sgi-autorreporte-mailer`
- Reiniciar el servicio: `pm2 restart sgi-autorreporte-mailer`
- Detener el servicio: `pm2 stop sgi-autorreporte-mailer`
