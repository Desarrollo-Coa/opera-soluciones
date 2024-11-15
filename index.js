const express = require('express');
const fs = require('fs');
const sharp = require('sharp'); 
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');
const session = require('express-session');



const upload = multer();

// Cargar variables de entorno desde un archivo .env
dotenv.config();

// Inicializar el cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Crear una instancia de la aplicación Express
const app = express();

// Middleware para analizar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Usar cookie-parser para manejar cookies


// Configura el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sirve archivos estáticos, como CSS y JS
app.use(express.static(path.join(__dirname, 'public')));


 


// Configuración de Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret', // Usa una clave secreta para firmar la sesión
  resave: false,  // No vuelve a guardar la sesión si no ha cambiado
  saveUninitialized: false, // No guarda sesiones sin inicializar
  cookie: { secure: false, maxAge: 3600000 } // maxAge: 1 hora (en milisegundos)
}));

 
// Puerto del servidor
const PORT = process.env.PORT || 3000;



// Middleware para validar sesión de usuario
const validateSession = (req, res, next) => {
  if (!req.session.user) {
      return res.redirect('/');  // Si no hay sesión, redirige al login
  }
  next();  // Continúa con la siguiente acción si la sesión es válida
};

// Ruta para la página principal
app.get('/', (req, res) => {
  console.log('Accediendo a la página principal');  // Depuración
  res.render('index');
});

// Ruta para la página principal (otra URL, como 'principal')
app.get('/principal', validateSession, (req, res) => {
  console.log('Accediendo a la página principal (URL alternativa)');  // Depuración
  res.render('principal');
});

// Ruta para la página "Personal Opera" (protegida)
app.get('/personal_opera', validateSession, (req, res) => {
  console.log('Accediendo a la página "Personal Opera"');  // Depuración
  res.render('personal_opera');
});

// Ruta para la página "Nosotros" (protegida)
app.get('/nosotros', (req, res) => {
  console.log('Accediendo a la página "Nosotros"');  // Depuración
  res.render('nosotros');
});

// Ruta para la página "Documentos Personales" (protegida)
app.get('/documentos_personal', validateSession, (req, res) => {
  console.log('Accediendo a la página "Documentos Personales"');  // Depuración
  res.render('documentos_personal');
});



// Ruta para crear un nuevo usuario
app.post('/crear-usuario', async (req, res) => {
  const { username, password, email } = req.body;

  // Encriptar la contraseña con bcrypt
  const passwordHash = await bcrypt.hash(password, 10);

  try {
      // Insertar el nuevo usuario en la base de datos de Supabase
      const { data, error } = await supabase
        .from('users') // Asegúrate de tener esta tabla en tu base de datos
        .insert([{ username, password_hash: passwordHash, email }]);

      if (error) {
          console.error('Error al insertar el usuario en Supabase:', error);
          return res.status(500).json({ error: 'Error interno al crear el usuario' });
      }

      console.log('Usuario creado:', data);
      return res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
      console.error('Error al crear el usuario:', error);
      return res.status(500).json({ error: 'Error interno al crear el usuario' });
  }
});

// Ruta para login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Datos recibidos para login:', { username, password });

  try {
      // Buscar el usuario por nombre de usuario en la base de datos de Supabase
      const { data, error } = await supabase
          .from('users') // Tabla de usuarios en Supabase
          .select('*')
          .eq('username', username)
          .single();

      if (error || !data) {
          console.log('Usuario no encontrado');
          return res.json({ success: false, message: 'Usuario no encontrado' });
      }

      // Comparar la contraseña ingresada con la contraseña almacenada (bcrypt)
      const isPasswordValid = await bcrypt.compare(password, data.password_hash);

      if (!isPasswordValid) {
          console.log('Contraseña incorrecta');
          return res.json({ success: false, message: 'Contraseña incorrecta' });
      }

      // Almacenar la información del usuario en la sesión
      req.session.user = data;
      console.log('Login exitoso', data);

      // Responder con éxito y redirigir
      return res.json({
          success: true,
          message: 'Login exitoso',
          redirectTo: '/principal',  // Redirigir a /principal
      });
  } catch (error) {
      console.error('Error al procesar el login:', error);
      return res.status(500).json({ success: false, message: 'Hubo un error en el servidor', error: error.message });
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
      }
      res.clearCookie('connect.sid');  // Eliminar la cookie de sesión
      res.json({ success: true, message: 'Sesión cerrada' });
  });
});


// Ruta para obtener todas las personas
app.get('/api/personas', async (req, res) => {
    console.log('Solicitando todas las personas');  // Depuración
    try {
        const { data, error } = await supabase
            .from('persona_opera')
            .select('*');

        if (error) {
            console.error('Error obteniendo personas:', error);  // Depuración
            return res.status(400).json({ error: 'Error obteniendo personas' });
        }

        console.log('Personas obtenidas exitosamente');  // Depuración
        return res.status(200).json({ personas: data });
    } catch (error) {
        console.error('Error al obtener las personas:', error);  // Depuración
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/registrar_personal', upload.single('foto'), async (req, res) => {
    try {
        // Extraemos los datos del formulario
        const { nombres, apellidos, cedula, fecha_ingreso, fecha_terminacion, tiempo_trabajo, cargo, eps, arl, caja_compensacion, fondo_pension, correo, celular, direccion } = req.body;
        console.log('Datos del formulario:', req.body);

        // Insertamos los datos del nuevo personal en la base de datos
        const { data: newPersona, error: insertError } = await supabase
            .from('persona_opera')
            .insert([{
                nombres,
                apellidos,
                cedula,
                fecha_ingreso,
                fecha_terminacion,
                tiempo_trabajo,
                cargo,
                eps,
                arl,
                caja_compensacion,
                fondo_pension,
                correo,
                celular,
                direccion
            }])
            .select('id'); // Obtenemos el 'id' recién creado (lo usamos para la foto)

        // Si hubo un error al registrar el personal
        if (insertError) {
            console.error('Error al registrar la persona:', insertError);
            return res.status(500).json({ error: 'Error al registrar la persona en la base de datos.' });
        }

        // Obtenemos el ID del nuevo registro
        const idPersona = newPersona[0].id;
        console.log('ID del nuevo personal:', idPersona);

        // Subir la foto si se recibió
        let fotoUrl = null;
        if (req.file) {
            const timestamp = new Date().getTime(); // Usamos un timestamp para asegurar un nombre único
            const fileName = `persona_${idPersona}/foto/Perfil_${timestamp}_${idPersona}.${req.file.mimetype.split('/')[1]}`; // Usamos 'idPersona' para crear la ruta única
            console.log(`Nombre del archivo generado: ${fileName}`);

            // Verificamos si ya existe una foto en el almacenamiento de Supabase para ese ID
            const { data: existingData, error: fetchError } = await supabase.storage
                .from('personal-docs')
                .list(`persona_${idPersona}/foto/`);

            if (fetchError) {
                console.error('Error al verificar las fotos existentes:', fetchError);
                return res.status(500).json({ error: 'Error al verificar las fotos existentes.' });
            }

            // Si existe una foto previa, la eliminamos
            if (existingData.length > 0) {
                const filesToDelete = existingData.map(file => file.name);
                console.log('Archivos a eliminar:', filesToDelete);

                const { error: deleteError } = await supabase.storage
                    .from('personal-docs')
                    .remove(filesToDelete); // Eliminamos las fotos existentes

                if (deleteError) {
                    console.error('Error al eliminar la foto existente:', deleteError);
                    return res.status(500).json({ error: 'Error al eliminar la foto existente.' });
                }
                console.log('Fotos existentes eliminadas con éxito.');
            }

            // Subimos el archivo a Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('personal-docs')  // Asegúrate de tener este bucket configurado
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true  // Permite sobrescribir si ya existe un archivo con el mismo nombre
                });

            if (uploadError) {
                console.error('Error al subir la foto:', uploadError);
                return res.status(500).json({ error: 'Error al subir la foto.' });
            }

            // Generamos la URL pública de la foto
            fotoUrl = `/${fileName}`;
            console.log(`Foto subida exitosamente. URL: ${fotoUrl}`);
        }

        // Actualizamos la URL de la foto en la base de datos
        const { error: updateError } = await supabase
            .from('persona_opera')
            .update({ foto_url: fotoUrl || null })  // Guardamos la URL de la foto si existe
            .eq('id', idPersona);  // Actualizamos el registro del personal usando el ID

        // Si hubo un error al actualizar la URL de la foto
        if (updateError) {
            console.error('Error al actualizar la URL de la foto:', updateError);
            return res.status(500).json({ error: 'Error al actualizar la URL de la foto.' });
        }

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Personal registrado correctamente.',
            persona: newPersona[0],  // Retornamos los datos del nuevo personal, incluida la URL de la foto
            fotoUrl
        });

    } catch (error) {
        // Capturamos cualquier otro error inesperado
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error al registrar el personal.' });
    }
});



// Ruta para obtener los detalles de una persona por su ID
app.get('/api/personas/:idPersona', async (req, res) => {
    const { idPersona } = req.params;
    console.log(`Solicitando detalles de la persona con ID: ${idPersona}`);  // Depuración

    try {
        const { data, error } = await supabase
            .from('persona_opera')
            .select('*')
            .eq('id', idPersona)
            .single();

        if (error || !data) {
            console.error('Error obteniendo la persona o persona no encontrada:', error);  // Depuración
            return res.status(404).json({ error: 'Persona no encontrada' });
        }
 
        console.log('Persona obtenida');  // Depuración
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error al obtener la persona:', error);  // Depuración
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.post('/subir-fotografia/:idPersona', 
  upload.single('file'),  
  async (req, res) => {
    try {
        console.log('Datos recibidos en el endpoint /subir-fotografia:', req.body);

        if (!req.file) {
            console.error('Error: No se recibió ninguna fotografía.');
            return res.status(400).json({ error: 'No se recibió ninguna fotografía.' });
        }

        const { idPersona } = req.params;
        const file = req.file;
        console.log('Archivo recibido:', file);

        const timestamp = new Date().getTime();
        const fileName = `persona_${idPersona}/foto/Perfil_${timestamp}_${idPersona}.jpeg`; // Cambia a jpeg para mayor compresión
        console.log(`Nombre del archivo generado: ${fileName}`);

        const { data: existingData, error: fetchError } = await supabase.storage
            .from('personal-docs')
            .list(`persona_${idPersona}/foto/`);

        if (fetchError) {
            console.error('Error al verificar la foto existente:', fetchError);
            return res.status(500).json({ error: 'Error al verificar la foto existente.' });
        }

        if (existingData.length > 0) {
            const filesToDelete = existingData.map(file => file.name);
            console.log('Archivos a eliminar:', filesToDelete);

            const { error: deleteError } = await supabase.storage
                .from('personal-docs')
                .remove(filesToDelete.map(name => `persona_${idPersona}/foto/${name}`));

            if (deleteError) {
                console.error('Error al eliminar la foto existente:', deleteError);
                return res.status(500).json({ error: 'Error al eliminar la foto existente.' });
            }
            console.log('Fotos existentes eliminadas con éxito.');
        } else {
            console.log('No existen fotos previas para esta persona.');
        }

        // Optimizar la imagen antes de subirla
        const optimizedImageBuffer = await sharp(file.buffer)
            .resize(300, 300) // Ajusta el tamaño a 300x300 o el tamaño deseado
            .jpeg({ quality: 80 }) // Ajusta la calidad de compresión (0-100)
            .toBuffer();

        // Subir el archivo optimizado a Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('personal-docs')
            .upload(fileName, optimizedImageBuffer, { 
                contentType: 'image/jpeg',   
                cacheControl: '3600',  
                upsert: true           
            });

        if (uploadError) {
            console.error('Error al subir la foto a Supabase Storage:', uploadError);
            return res.status(400).json({ error: uploadError.message });
        }

        const fotoUrl = data.Key;
        console.log(`Foto subida exitosamente. URL: ${fotoUrl}`);

        const { error: updateError } = await supabase
            .from('persona_opera')  
            .update({ foto_url: fileName })
            .eq('id', idPersona);

        if (updateError) {
            console.error('Error al actualizar la URL de la foto en la base de datos:', updateError);
            return res.status(400).json({ error: updateError.message });
        }

        return res.status(200).json({
            success: true,
            message: 'Foto subida correctamente',
            fotoUrl
        });

    } catch (error) {
        console.error('Error al procesar la subida de la fotografía:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al subir la fotografía al servidor',
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
  }
);



// app.post('/subir-fotografia/:idPersona', 
//   upload.single('file'),  // Usamos upload.single para una sola foto
//   async (req, res) => {
//       try {
//           console.log('Datos recibidos en el endpoint /subir-fotografia:', req.body);

//           // Verificar si no se recibe archivo
//           if (!req.file) {
//               console.error('Error: No se recibió ninguna fotografía.');
//               return res.status(400).json({ error: 'No se recibió ninguna fotografía.' });
//           }

//           const { idPersona } = req.params;
//           const file = req.file;
//           console.log('Archivo recibido:', file);

//           // Generar un nombre único para la imagen usando getTime() para control de caché
//           const timestamp = new Date().getTime(); // Usar timestamp para la caché
//           const fileName = `persona_${idPersona}/foto/Perfil_${timestamp}_${idPersona}.${file.mimetype.split('/')[1]}`; // Asumimos que el mimetype contiene la extensión
//           console.log(`Nombre del archivo generado: ${fileName}`);

//           // Verificar si ya existe una foto en Supabase Storage (la carpeta persona_id/foto/)
//           const { data: existingData, error: fetchError } = await supabase.storage
//               .from('personal-docs')
//               .list(`persona_${idPersona}/foto/`);

//           if (fetchError) {
//               console.error('Error al verificar la foto existente:', fetchError);
//               return res.status(500).json({ error: 'Error al verificar la foto existente.' });
//           }

//           // Si existe una foto en la carpeta, borrar la carpeta o los archivos existentes
//           if (existingData.length > 0) {
//               // Listamos los archivos y los eliminamos (puedes borrar todos los archivos de la carpeta foto)
//               const filesToDelete = existingData.map(file => file.name);
//               console.log('Archivos a eliminar:', filesToDelete);
//               console.log(`persona_${idPersona}/foto/${filesToDelete}`)

//               // Eliminar los archivos viejos
//               const { error: deleteError } = await supabase.storage
//                   .from('personal-docs')
//                   .remove(`persona_${idPersona}/foto/${filesToDelete}`);

//               if (deleteError) {
//                   console.error('Error al eliminar la foto existente:', deleteError);
//                   return res.status(500).json({ error: 'Error al eliminar la foto existente.' });
//               }
//               console.log('Fotos existentes eliminadas con éxito.');
//           } else {
//               console.log('No existen fotos previas para esta persona.');
//           }

//           // Subir el archivo nuevo a Supabase Storage
//           const { data, error: uploadError } = await supabase.storage
//               .from('personal-docs')  // Asegúrate de tener este bucket creado en Supabase
//               .upload(fileName, file.buffer, { 
//                   contentType: file.mimetype,   // Usamos el tipo MIME del archivo original
//                   cacheControl: '3600',  // Controlar el cache, por ejemplo: 1 hora
//                   upsert: true           // Permite reemplazar archivos existentes si es necesario
//               });

//           if (uploadError) {
//               console.error('Error al subir la foto a Supabase Storage:', uploadError);
//               return res.status(400).json({ error: uploadError.message });
//           }

//           // Obtener la URL pública del archivo subido
//           const fotoUrl = data.Key;
//           console.log(`Foto subida exitosamente. URL: ${fotoUrl}`);

//           // Actualizar la URL de la foto en la base de datos
//           const { error: updateError } = await supabase
//               .from('persona_opera')  // Asegúrate de tener esta tabla en Supabase
//               .update({ foto_url: fileName })
//               .eq('id', idPersona);

//           if (updateError) {
//               console.error('Error al actualizar la URL de la foto en la base de datos:', updateError);
//               return res.status(400).json({ error: updateError.message });
//           }

//           // Respuesta exitosa
//           return res.status(200).json({
//               success: true,
//               message: 'Foto subida correctamente',
//               fotoUrl
//           });

//       } catch (error) {
//           // Captura cualquier error inesperado en el proceso
//           console.error('Error al procesar la subida de la fotografía:', error);
//           return res.status(500).json({
//               success: false,
//               message: 'Error al subir la fotografía al servidor',
//               error: {
//                   message: error.message,
//                   details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//               }
//           });
//       }
//   }
// );





// Editar información de la persona
app.put('/editar-persona/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  console.log('Datos para actualizar:', updatedData); // Depuración

  try {
      const { data, error } = await supabase
          .from('persona_opera')
          .update(updatedData)
          .eq('id', id);

      if (error) {
          console.error('Error al actualizar la persona:', error.message); // Depuración
          return res.status(500).json({ error: error.message });
      }

      console.log('Persona actualizada:', data); // Depuración
      res.status(200).json(data);
  } catch (err) {
      console.error('Error en el proceso de actualización:', err); // Depuración
      return res.status(500).json({ error: 'Hubo un error al actualizar la persona' });
  }
});


app.delete('/borrar-persona/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Iniciando proceso de eliminación para persona con ID:', id); // Depuración
  
    try {
        // Primero, obtener los documentos de la persona
        const { data: documentos, error: documentosError } = await supabase
            .from('documentos_personal')
            .select('archivo_url')
            .eq('persona_id', id);
  
        if (documentosError) {
            console.error('Error al obtener documentos de la persona:', documentosError.message); // Depuración
            return res.status(500).json({ error: documentosError.message });
        }
  
        if (!documentos || documentos.length === 0) {
            console.log('No se encontraron documentos para esta persona.'); // Depuración
        } else {
            console.log('Documentos encontrados:', documentos); // Depuración
        }
  
        // Comprobar si existen documentos para eliminar
        if (documentos && documentos.length > 0) {
            // Extraemos las URLs de los documentos
            const fileUrls = documentos.map(doc => doc.archivo_url);
            console.log('URLs de archivos a eliminar:', fileUrls); // Depuración
  
            // Borrar los archivos de Supabase Storage
            const { error: deleteFilesError } = await supabase.storage
                .from('personal-docs')
                .remove(fileUrls);
  
            if (deleteFilesError) {
                console.error('Error al eliminar los archivos de Supabase Storage:', deleteFilesError.message); // Depuración
                return res.status(500).json({ error: deleteFilesError.message });
            }
  
            console.log('Archivos eliminados exitosamente.'); // Depuración
        } else {
            console.log('No hay archivos para eliminar en Supabase Storage.');
        }
  
        // Borrar los documentos de la base de datos
        const { error: deleteDocsError } = await supabase
            .from('documentos_personal')
            .delete()
            .eq('persona_id', id);
  
        if (deleteDocsError) {
            console.error('Error al eliminar documentos de la base de datos:', deleteDocsError.message); // Depuración
            return res.status(500).json({ error: deleteDocsError.message });
        }
  
        console.log('Documentos eliminados de la base de datos.'); // Depuración
  
        // Finalmente, borrar la persona
        const { error: deletePersonaError } = await supabase
            .from('persona_opera')
            .delete()
            .eq('id', id);
  
        if (deletePersonaError) {
            console.error('Error al eliminar la persona de la base de datos:', deletePersonaError.message); // Depuración
            return res.status(500).json({ error: deletePersonaError.message });
        }
  
        console.log('Persona eliminada correctamente.'); // Depuración
        res.status(200).json({ message: 'Persona eliminada correctamente' });
    } catch (err) {
        console.error('Error en el proceso de eliminación:', err); // Depuración
        return res.status(500).json({ error: 'Hubo un error al eliminar la persona' });
    }
  });
  
 


  app.post('/subir-documentos/:idPersona', upload.array('documents'), async (req, res) => {
    const { idPersona } = req.params;
  
    // Verificamos que se haya subido al menos un documento
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No se recibieron documentos.' });
    }
  
    try {
        const uploadedDocs = [];
  
        
        for (let file of req.files) {
            const timestamp = new Date().getTime();
            const fileName = `persona_${idPersona}/documentos/${timestamp}_${file.originalname}`;
  
            // Subir el archivo a Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('personal-docs')
                .upload(fileName, file.buffer, { contentType: file.mimetype });
  
            if (uploadError) {
                console.error('Error subiendo documento:', uploadError);
                return res.status(500).json({ error: 'Error al subir el documento.' });
            }
  
            console.log("Archivo subido:", fileName);
  
            // Construir la URL pública del archivo
            const fileUrl = `${fileName}`;
            const nombreDocumento =  file.originalname
  
            // Guardamos la información del documento en la base de datos
            const { error: dbError } = await supabase
                .from('documentos_personal')
                .insert([{
                    persona_id: idPersona,
                    nombre_documento: nombreDocumento,
                    tipo_documento: file.mimetype,
                    archivo_url: fileUrl,
                    fecha_subida: new Date()
                }]);
  
            if (dbError) {
                console.error('Error al registrar documento en la base de datos:', dbError);
                return res.status(500).json({ error: 'Error al registrar el documento en la base de datos.' });
            }
  
            // Agregar el documento subido a la lista de respuestas
            uploadedDocs.push({
                nombre_documento: file.originalname,
                url: fileUrl
            });
        }
  
        // Responder con los documentos subidos
        return res.status(200).json({ success: true, documentos: uploadedDocs });
  
    } catch (error) {
        console.error('Error al procesar la subida de documentos:', error);
        return res.status(500).json({ error: 'Error interno al procesar los documentos.' });
    }
  });
  

  
// Ruta para obtener los documentos de una persona
app.get('/api/documentos/:idPersona', async (req, res) => {
    const { idPersona } = req.params;
    console.log(`Solicitando documentos para la persona con ID: ${idPersona}`);  // Depuración

    try {
        const { data, error } = await supabase
            .from('documentos_personal')
            .select('*')
            .eq('persona_id', idPersona);

        if (error) {
            console.error('Error obteniendo los documentos:', error);  // Depuración
            return res.status(400).json({ error: error.message });
        }
 

        console.log('Documentos obtenidos:', data);  // Depuración
        return res.status(200).json({ documentos: data });
    } catch (error) {
        console.error('Error obteniendo los documentos:', error);  // Depuración
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});



app.delete('/eliminar-documento/:personaId', async (req, res) => {
    const { personaId } = req.params;  // Obtener el ID de la persona desde la URL
    const { archivoUrl } = req.body;  // Obtener la URL del archivo desde el cuerpo de la solicitud
    console.log(`Solicitando eliminación de documento para la persona con ID: ${personaId} y archivo URL: ${archivoUrl}`);
  
    if (!archivoUrl) {
        return res.status(400).json({ error: 'El parámetro archivoUrl es obligatorio.' });
    }
  
    try {
        // Buscar el documento asociado a la persona y su archivo URL
        const { data, error: dbError } = await supabase
            .from('documentos_personal')
            .select('id, archivo_url')
            .eq('persona_id', personaId)
            .eq('archivo_url', archivoUrl)
            .single();  // Usamos .single() porque esperamos solo un resultado
  
        if (dbError || !data) {
            console.error('Error al obtener el documento o no existe:', dbError);
            return res.status(404).json({ error: 'Documento no encontrado para este ID de persona y archivo URL.' });
        }
  
        console.log('Documento encontrado:', data);
  
        // Eliminar el archivo desde Supabase Storage
        const { error: deleteError } = await supabase.storage
            .from('personal-docs')  // El bucket de almacenamiento
            .remove([archivoUrl]);  // Usamos el archivo URL guardado en la base de datos
  
        if (deleteError) {
            console.error('Error al eliminar el archivo de Supabase Storage:', deleteError);
            return res.status(500).json({ error: 'Error al eliminar el archivo desde el almacenamiento.' });
        }
  
        console.log('Archivo eliminado correctamente desde Supabase Storage');
  
        // Eliminar el registro del documento de la base de datos
        const { error: deleteDbError } = await supabase
            .from('documentos_personal')
            .delete()
            .eq('id', data.id);  // Eliminamos el registro usando el ID del documento
  
        if (deleteDbError) {
            console.error('Error al eliminar el registro en la base de datos:', deleteDbError);
            return res.status(500).json({ error: 'Error al eliminar el registro del documento en la base de datos.' });
        }
  
        // Responder con éxito
        return res.status(200).json({ success: true, message: 'Documento eliminado correctamente.' });
  
    } catch (error) {
        console.error('Error al procesar la eliminación:', error);
        return res.status(500).json({ error: 'Error interno al procesar la eliminación del documento.' });
    }
  });
  

// Ruta para descargar cualquier archivo
app.get('/descargar/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'archivos', filename);

    // Asegurarse de que el archivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Archivo no encontrado');
    }

    // Establecer el encabezado Content-Disposition para forzar la descarga
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Enviar el archivo
    res.sendFile(filePath, err => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).send('Error al enviar el archivo');
        }
    });
});

  // Ruta para obtener todos los documentos del bucket "documentos-personales"
app.get('/api/v1/documentos', async (req, res) => {
    console.log('Obteniendo documentos...');

    try {
        // Listar los archivos en el bucket "documentos_personal"
        const { data, error } = await supabase.storage
            .from('documentos-personales')
            .list('', { limit: 100, offset: 0 }); // Limitar la lista de archivos
        
        if (error) {
            console.error('Error al listar los archivos:', error);
            return res.status(500).json({ error: 'Error al obtener los documentos' });
        }

        console.log(`Archivos obtenidos: ${data.length} documentos encontrados.`);

        // Crear una lista de documentos con sus URLs públicas
        const documentos = data.map(doc => ({
            nombre_documento: doc.name,
            tipo_documento: doc.content_type,
            archivo_url: doc.name,
            url: `${process.env.SUPABASE_URL}/storage/v1/object/public/documentos-personales/${doc.name}`
        }));

        console.log('Documentos procesados:', documentos);

        res.json({ documentos });
    } catch (error) {
        console.error('Error en la ruta de obtener documentos:', error);
        res.status(500).json({ error: 'Error al obtener los documentos' });
    }
});


// Ruta para subir un nuevo documento al bucket "documentos-personales"
app.post('/api/v1/subir-documento', upload.single('documents'), async (req, res) => {
    const file = req.file;

    if (!file) {
        console.error('No se seleccionó ningún archivo');
        return res.status(400).json({ error: 'No se seleccionó ningún archivo' });
    }

    console.log(`Recibiendo archivo para subir: ${file.originalname}`);

    try {
        const fileName = `${Date.now()}_${file.originalname}`;
        
        console.log(`Subiendo archivo: ${fileName} a Supabase Storage`);

        // Subir archivo a Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('documentos-personales')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) {
            console.error('Error al subir el archivo:', uploadError);
            return res.status(500).json({ error: 'Error al subir el archivo a Supabase' });
        }

        console.log('Archivo subido correctamente:', data);

        res.json({ success: true, message: 'Documento subido correctamente', fileUrl: data.Key });
    } catch (error) {
        console.error('Error al procesar la subida del archivo:', error);
        res.status(500).json({ error: 'Error al procesar la subida' });
    }
});


// Ruta para eliminar un documento del bucket "documentos-personales"
app.delete('/api/v1/eliminar-documento', async (req, res) => {
    const { archivoUrl } = req.body;

    if (!archivoUrl) {
        console.error('El parámetro archivoUrl es obligatorio');
        return res.status(400).json({ error: 'El parámetro archivoUrl es obligatorio' });
    }

    console.log(`Eliminando archivo: ${archivoUrl} de Supabase Storage`);

    try {
        // Eliminar el archivo desde Supabase Storage
        const { error: deleteError } = await supabase.storage
            .from('documentos-personales')
            .remove([archivoUrl]);

        if (deleteError) {
            console.error('Error al eliminar el archivo:', deleteError);
            return res.status(500).json({ error: 'Error al eliminar el archivo de Supabase' });
        }

        console.log('Documento eliminado correctamente:', archivoUrl);

        res.json({ success: true, message: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error('Error al procesar la eliminación del documento:', error);
        res.status(500).json({ error: 'Error al procesar la eliminación del documento' });
    }
});



// // Función para crear un usuario
// async function crearUsuario() {
//   const username = 'operasol';  // Nombre de usuario
//   const password = 'juanmanuel';  // Contraseña
//   const email = 'juan.caputo@example.com';  // Correo electrónico
  
//   try {
//     // Hashear la contraseña
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Insertar el usuario en la tabla 'users' de Supabase
//     const { data, error } = await supabase
//       .from('users')
//       .insert([{ username, password_hash: passwordHash, email }]);

//     if (error) {
//       console.error('Error al insertar usuario:', error);
//       return { success: false, error: error.message };
//     }

//     // Usuario creado correctamente
//     console.log('Usuario creado exitosamente:', data);
//     return { success: true, data };
//   } catch (error) {
//     console.error('Error al crear el usuario:', error);
//     return { success: false, error: error.message };
//   }
// }

// // Llamar a la función para crear el usuario
// crearUsuario().then((result) => {
//   if (result.success) {
//     console.log('Usuario creado:', result.data);
//   } else {
//     console.log('Error al crear el usuario:', result.error);
//   }
// });
 
 


// Iniciar el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
