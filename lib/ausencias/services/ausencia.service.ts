import { executeQuery } from '@/lib/db';
import { uploadToSpaces } from '@/lib/digitalocean-spaces';
import { generateSimpleFileName } from '@/lib/file-utils';
import { Ausencia, CrearAusenciaData } from '../types';

/**
 * AusenciaService
 * Migración 007: tablas OS_AUSENCIAS, OS_USUARIOS, OS_TIPOS_AUSENCIA, OS_ARCHIVOS_AUSENCIAS
 * con nuevas columnas AU_, US_, TA_, AA_
 */
export class AusenciaService {
  async obtenerTodas(): Promise<Ausencia[]> {
    // Migración 007: columnas renombradas en todas las tablas
    const ausencias = await executeQuery(
      `SELECT a.*, 
              u.US_NOMBRE AS nombre_colaborador, 
              u.US_APELLIDO AS apellido_colaborador,
              u.US_DEPARTAMENTO AS nombre_departamento,
              ta.TA_NOMBRE AS nombre_tipo_ausencia
       FROM OS_AUSENCIAS a
       JOIN OS_USUARIOS u ON a.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
       JOIN OS_TIPOS_AUSENCIA ta ON a.TA_IDTIPO_AUSENCIA_FK = ta.TA_IDTIPO_AUSENCIA_PK
       WHERE a.AU_ACTIVO = 1
       ORDER BY a.AU_FECHA_REGISTRO DESC`
    ) as Ausencia[];

    // Obtener archivos para cada ausencia
    const ausenciasConArchivos = await Promise.all(
      ausencias.map(async (ausencia) => {
        // Migración 007: OS_ARCHIVOS_AUSENCIAS → AA_IDARCHIVO_PK, AA_URL_ARCHIVO, AA_NOMBRE_ARCHIVO, AU_IDAUSENCIA_FK, AA_ACTIVO
        const archivos = await executeQuery(
          'SELECT AA_IDARCHIVO_PK as id_archivo, AA_URL_ARCHIVO as url_archivo, AA_NOMBRE_ARCHIVO as nombre_archivo FROM OS_ARCHIVOS_AUSENCIAS WHERE AU_IDAUSENCIA_FK = ? AND AA_ACTIVO = 1',
          [ausencia.AU_IDAUSENCIA_PK]
        );
        return { ...ausencia, archivos };
      })
    );

    return ausenciasConArchivos;
  }

  async obtenerPorId(id: number): Promise<Ausencia | null> {
    // Migración 007: OS_AUSENCIAS con AU_IDAUSENCIA_PK
    const ausencias = await executeQuery(
      `SELECT a.*, 
              u.US_NOMBRE AS nombre_colaborador, 
              u.US_APELLIDO AS apellido_colaborador,
              u.US_DEPARTAMENTO AS nombre_departamento,
              ta.TA_NOMBRE AS nombre_tipo_ausencia
       FROM OS_AUSENCIAS a
       JOIN OS_USUARIOS u ON a.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
       JOIN OS_TIPOS_AUSENCIA ta ON a.TA_IDTIPO_AUSENCIA_FK = ta.TA_IDTIPO_AUSENCIA_PK
       WHERE a.AU_IDAUSENCIA_PK = ?`,
      [id]
    ) as Ausencia[];

    if (!ausencias || ausencias.length === 0) {
      return null;
    }

    const archivos = await executeQuery(
      'SELECT AA_IDARCHIVO_PK as id_archivo, AA_URL_ARCHIVO as url_archivo, AA_NOMBRE_ARCHIVO as nombre_archivo FROM OS_ARCHIVOS_AUSENCIAS WHERE AU_IDAUSENCIA_FK = ? AND AA_ACTIVO = 1',
      [id]
    );

    return { ...ausencias[0], archivos };
  }

  async crear(data: CrearAusenciaData): Promise<number> {
    // Validar fechas
    if (new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
      throw new Error('La fecha de inicio debe ser menor o igual a la fecha final');
    }

    // Migración 007: INSERT en OS_AUSENCIAS con nuevas columnas
    const result: any = await executeQuery(
      'INSERT INTO OS_AUSENCIAS (US_IDUSUARIO_FK, TA_IDTIPO_AUSENCIA_FK, AU_FECHA_INICIO, AU_FECHA_FIN, AU_DESCRIPCION, AU_USUARIO_REGISTRO_FK, AU_CREADO_POR) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.id_colaborador, data.id_tipo_ausencia, data.fecha_inicio, data.fecha_fin, data.descripcion, data.id_usuario_registro, data.id_usuario_registro]
    );

    const id_ausencia = result.insertId;

    // Subir archivos si existen
    if (data.archivos && data.archivos.length > 0) {
      await this.subirArchivos(id_ausencia, data.archivos);
    }

    return id_ausencia;
  }

  async actualizar(id: number, data: Partial<CrearAusenciaData>): Promise<void> {
    // 1. Obtener la ausencia actual para conocer el colaborador y las fechas
    const current = await this.obtenerPorId(id);
    if (!current) throw new Error('Ausencia no encontrada');

    // 2. Verificar si ya existe una liquidación para este colaborador que se cruce con el periodo de la ausencia
    // Una liquidación [Mes, Año, Quincena] bloquea si hay solapamiento de fechas.
    const [liquidaciones]: any[] = await executeQuery(
      `SELECT LQ_IDLIQUIDACION_PK, LQ_QUINCENA, LQ_PERIODO_MES, LQ_PERIODO_ANIO 
       FROM OS_LIQUIDACIONES 
       WHERE US_IDUSUARIO_FK = ? 
       AND LQ_ESTADO IN ('Calculado', 'Aprobado')
       AND LQ_PERIODO_ANIO = YEAR(?)`,
      [current.US_IDUSUARIO_FK, current.AU_FECHA_INICIO]
    );

    for (const liq of liquidaciones) {
      const q = liq.LQ_QUINCENA;
      const m = liq.LQ_PERIODO_MES;
      const a = liq.LQ_PERIODO_ANIO;

      // Definir rango de la liquidación
      const qStart = new Date(a, m - 1, q === 1 ? 1 : 16);
      const qEnd = new Date(a, m - 1, q === 1 ? 15 : new Date(a, m, 0).getDate());

      const aStart = new Date(current.AU_FECHA_INICIO);
      const aEnd = new Date(current.AU_FECHA_FIN);

      // Si hay solapamiento (Max(Start) <= Min(End))
      if (Math.max(qStart.getTime(), aStart.getTime()) <= Math.min(qEnd.getTime(), aEnd.getTime())) {
        throw new Error(`No se puede editar: la ausencia se solapa con la nómina ${m}/${a} Q${q} que ya fue generada o aprobada.`);
      }
    }

    const campos = [];
    const valores = [];

    // Migración 007: columnas de OS_AUSENCIAS
    if (data.id_tipo_ausencia !== undefined) {
      campos.push('TA_IDTIPO_AUSENCIA_FK = ?');
      valores.push(data.id_tipo_ausencia);
    }
    if (data.descripcion !== undefined) {
      campos.push('AU_DESCRIPCION = ?');
      valores.push(data.descripcion);
    }
    if (data.fecha_inicio !== undefined) {
      campos.push('AU_FECHA_INICIO = ?');
      valores.push(data.fecha_inicio);
    }
    if (data.fecha_fin !== undefined) {
      campos.push('AU_FECHA_FIN = ?');
      valores.push(data.fecha_fin);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    await executeQuery(
      `UPDATE OS_AUSENCIAS SET ${campos.join(', ')} WHERE AU_IDAUSENCIA_PK = ?`,
      valores
    );
  }

  async eliminar(id: number): Promise<void> {
    // 1. Obtener la ausencia actual
    const current = await this.obtenerPorId(id);
    if (!current) throw new Error('Ausencia no encontrada');

    // 2. Verificar si ya existe una liquidación que se cruce
    const [liquidaciones]: any[] = await executeQuery(
      `SELECT LQ_IDLIQUIDACION_PK, LQ_QUINCENA, LQ_PERIODO_MES, LQ_PERIODO_ANIO 
       FROM OS_LIQUIDACIONES 
       WHERE US_IDUSUARIO_FK = ? 
       AND LQ_ESTADO IN ('Calculado', 'Aprobado')
       AND LQ_PERIODO_ANIO = YEAR(?)`,
      [current.US_IDUSUARIO_FK, current.AU_FECHA_INICIO]
    );

    for (const liq of liquidaciones) {
      const qStart = new Date(liq.LQ_PERIODO_ANIO, liq.LQ_PERIODO_MES - 1, liq.LQ_QUINCENA === 1 ? 1 : 16);
      const qEnd = new Date(liq.LQ_PERIODO_ANIO, liq.LQ_PERIODO_MES - 1, liq.LQ_QUINCENA === 1 ? 15 : new Date(liq.LQ_PERIODO_ANIO, liq.LQ_PERIODO_MES, 0).getDate());

      const aStart = new Date(current.AU_FECHA_INICIO);
      const aEnd = new Date(current.AU_FECHA_FIN);

      if (Math.max(qStart.getTime(), aStart.getTime()) <= Math.min(qEnd.getTime(), aEnd.getTime())) {
        throw new Error(`No se puede eliminar: la ausencia se solapa con la nómina ${liq.LQ_PERIODO_MES}/${liq.LQ_PERIODO_ANIO} Q${liq.LQ_QUINCENA} que ya fue generada o aprobada.`);
      }
    }

    // Migración 007: AU_ACTIVO, AU_IDAUSENCIA_PK
    await executeQuery('UPDATE OS_AUSENCIAS SET AU_ACTIVO = 0 WHERE AU_IDAUSENCIA_PK = ?', [id]);
  }

  private async subirArchivos(id_ausencia: number, archivos: File[]): Promise<void> {
    for (const archivo of archivos) {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(archivo.type)) {
        continue;
      }
      if (archivo.size > 10 * 1024 * 1024) {
        continue;
      }

      const arrayBuffer = await archivo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uniqueFileName = generateSimpleFileName(archivo.name);

      const result = await uploadToSpaces(
        buffer,
        uniqueFileName,
        archivo.type,
        `ausencias/${id_ausencia}`
      );

      // Migración 007: INSERT en OS_ARCHIVOS_AUSENCIAS con columnas AA_
      await executeQuery(
        'INSERT INTO OS_ARCHIVOS_AUSENCIAS (AU_IDAUSENCIA_FK, AA_URL_ARCHIVO, AA_NOMBRE_ARCHIVO, AA_SUBIDO_POR) VALUES (?, ?, ?, ?)',
        [id_ausencia, result.url, uniqueFileName, 1]
      );
    }
  }
}
