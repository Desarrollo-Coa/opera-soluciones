import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed, or use standard ones
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    outerBorder: {
        borderWidth: 1,
        borderColor: '#9ca3af',
        borderRadius: 2,
    },
    headerWrapper: {
        textAlign: 'center',
        paddingTop: 15,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 4,
    },
    logo: {
        width: 80,
        height: 60,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'extrabold',
    },
    companyNit: {
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 2,
        textDecoration: 'underline',
        color: '#374151',
    },
    headerTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 4,
        color: '#4b5563',
        letterSpacing: 0.5,
    },
    vpNumber: {
        fontSize: 8,
        color: '#6b7280',
        marginTop: 2,
    },
    infoGrid: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
    },
    personalCol: {
        width: '60%',
        padding: 10,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    bankCol: {
        width: '40%',
        padding: 10,
        backgroundColor: '#f9fafb',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    fieldBox: {
        width: '50%',
        marginBottom: 6,
    },
    fullWidthField: {
        width: '100%',
        marginBottom: 6,
    },
    fieldLabel: {
        fontSize: 6.5,
        color: '#6b7280',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 1,
    },
    fieldValue: {
        fontSize: 8.5,
        fontWeight: 'bold',
    },
    affiliationRow: {
        flexDirection: 'row',
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    sectionPadding: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sectionHeader: {
        fontSize: 7.5,
        fontWeight: 'heavy',
        textTransform: 'uppercase',
        color: '#6b7280',
        letterSpacing: 1,
        marginBottom: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 2,
        marginBottom: 2,
        color: '#6b7280',
    },
    colLabelHeader: {
        fontSize: 7.5,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        borderBottomStyle: 'dashed',
    },
    colDesc: { flexGrow: 1 },
    colCant: { width: 45, textAlign: 'center' },
    colPrice: { width: 75, textAlign: 'right' },
    colTotal: { width: 75, textAlign: 'right' },
    subtotalRow: {
        flexDirection: 'row',
        borderTopWidth: 1.5,
        paddingTop: 4,
        color: '#6b7280',
        textTransform: 'uppercase',
        fontSize: 7.5,
    },
    subtotalValue: {
        fontWeight: 'bold',
        color: '#111827',
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 15,
    },
    netSalaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: '#d1d5db',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
    },
    netSalaryLabel: {
        fontSize: 10,
        fontWeight: 'extrabold',
    },
    netSalaryValue: {
        fontSize: 12,
        fontWeight: 'extrabold',
    },
    signatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 25,
    },
    signatureLine: {
        width: '40%',
        borderTopWidth: 0.8,
        borderTopColor: '#9ca3af',
        textAlign: 'center',
        paddingTop: 4,
    },
    signatureLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#1f2937',
        textTransform: 'uppercase',
    },
    signatureSub: {
        fontSize: 7,
        color: '#6b7280',
    },
    footerGen: {
        textAlign: 'center',
        fontSize: 7,
        color: '#9ca3af',
        paddingBottom: 10,
    }
});

const fmt = (n: number | string) => {
    const parts = Number(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${parts.join(',')}`;
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function VolantePDF({ data }: { data: any }) {
    const devengos = data.detalles.filter((d: any) => d.tipo === 'Devengo');
    const deducciones = data.detalles.filter((d: any) => d.tipo === 'Deducción');
    const hasBank = data.bank_name && data.bank_name.trim() !== '';

    return (
        <Document title={`Volante - ${data.first_name} ${data.last_name} - ${MESES[data.periodo_mes - 1].toUpperCase()} - ${data.quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBorder}>
                    {/* Header */}
                    <View style={styles.headerWrapper}>
                        <View style={styles.logoContainer}>
                            <Image src="/recursos/logopera.png" style={styles.logo} />
                            <Text style={styles.companyName}>OPERA SOLUCIONES S.A.S.</Text>
                        </View>
                        <Text style={styles.companyNit}>NIT: 901.714.147  |  Barranquilla, Atlántico</Text>
                        <Text style={styles.headerTitle}>
                            COMPROBANTE DE NÓMINA — {MESES[data.periodo_mes - 1].toUpperCase()} {data.periodo_anio}, {data.quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA
                        </Text>
                        <Text style={styles.vpNumber}>No. VP-{data.id.toString().padStart(5, '0')}</Text>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.personalCol}>
                            <View style={styles.row}>
                                <View style={styles.fullWidthField}>
                                    <Text style={styles.fieldLabel}>Nombres y Apellidos</Text>
                                    <Text style={styles.fieldValue}>{data.first_name} {data.last_name}</Text>
                                </View>
                                <View style={styles.fieldBox}>
                                    <Text style={styles.fieldLabel}>Cargo</Text>
                                    <Text style={styles.fieldValue}>{data.cargo_nombre || '—'}</Text>
                                </View>
                                <View style={styles.fieldBox}>
                                    <Text style={styles.fieldLabel}>{data.document_type || 'Identificación'}</Text>
                                    <Text style={styles.fieldValue}>{data.document_number}</Text>
                                </View>
                                <View style={styles.fieldBox}>
                                    <Text style={styles.fieldLabel}>Período Liquidado</Text>
                                    <Text style={styles.fieldValue}>{MESES[data.periodo_mes - 1]?.toUpperCase()} {data.periodo_anio}</Text>
                                </View>
                                <View style={styles.fieldBox}>
                                    <Text style={styles.fieldLabel}>Días Trabajados</Text>
                                    <Text style={styles.fieldValue}>{data.dias_trabajados}</Text>
                                </View>
                                <View style={styles.fieldBox}>
                                    <Text style={styles.fieldLabel}>Sueldo Mensual</Text>
                                    <Text style={styles.fieldValue}>{fmt(data.sueldo_mensual_base)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.bankCol}>
                            {hasBank && (
                                <View>
                                    <Text style={styles.fieldLabel}>Forma de Pago</Text>
                                    <Text style={[styles.fieldValue, { marginBottom: 4 }]}>{data.bank_name}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: '40%' }}>
                                            <Text style={styles.fieldLabel}>Tipo</Text>
                                            <Text style={styles.fieldValue}>{data.account_type || '—'}</Text>
                                        </View>
                                        <View style={{ width: '60%' }}>
                                            <Text style={styles.fieldLabel}>No. Cuenta</Text>
                                            <Text style={[styles.fieldValue, { fontFamily: 'Courier' }]}>{data.account_number || '—'}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            <View style={styles.affiliationRow}>
                                <View style={{ width: '100%' }}>
                                    <Text style={styles.fieldLabel}>Afiliaciones</Text>
                                    <View style={styles.row}>
                                        {data.eps_id && <View style={{ width: '50%' }}><Text style={styles.fieldLabel}>EPS</Text><Text style={styles.fieldValue}>{data.eps_id}</Text></View>}
                                        {data.arl_id && <View style={{ width: '50%' }}><Text style={styles.fieldLabel}>ARL</Text><Text style={styles.fieldValue}>{data.arl_id}</Text></View>}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Devengos */}
                    <View style={styles.sectionPadding}>
                        <Text style={styles.sectionHeader}>Devengado</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.colDesc, styles.colLabelHeader]}>Concepto</Text>
                            <Text style={[styles.colCant, styles.colLabelHeader]}>Cant</Text>
                            <Text style={[styles.colPrice, styles.colLabelHeader]}>V. Unitario</Text>
                            <Text style={[styles.colTotal, styles.colLabelHeader]}>Total</Text>
                        </View>
                        {devengos.map((d: any) => (
                            <View key={d.id} style={styles.tableRow}>
                                <Text style={styles.colDesc}>{d.descripcion}</Text>
                                <Text style={styles.colCant}>{d.cantidad}</Text>
                                <Text style={styles.colPrice}>{fmt(d.valor_unitario)}</Text>
                                <Text style={styles.colTotal}>{fmt(d.valor_total)}</Text>
                            </View>
                        ))}
                        <View style={styles.subtotalRow}>
                            <Text style={styles.colDesc}>SUBTOTAL DEVENGADO</Text>
                            <Text style={[styles.colTotal, styles.subtotalValue]}>{fmt(data.total_devengado)}</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    {/* Deducciones */}
                    <View style={styles.sectionPadding}>
                        <Text style={styles.sectionHeader}>Deducido</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.colDesc, styles.colLabelHeader]}>Concepto</Text>
                            <Text style={[styles.colPrice, styles.colLabelHeader]}>Base / Cant</Text>
                            <Text style={[styles.colTotal, styles.colLabelHeader]}>Total</Text>
                        </View>
                        {deducciones.map((d: any) => (
                            <View key={d.id} style={styles.tableRow}>
                                <Text style={styles.colDesc}>{d.descripcion}</Text>
                                <Text style={[styles.colPrice, { color: '#9ca3af', fontStyle: 'italic' }]}>
                                    {d.cantidad > 1 ? d.cantidad : fmt(d.valor_unitario)}
                                </Text>
                                <Text style={styles.colTotal}>{fmt(d.valor_total)}</Text>
                            </View>
                        ))}
                        <View style={styles.subtotalRow}>
                            <Text style={styles.colDesc}>SUBTOTAL DEDUCCIONES</Text>
                            <Text style={[styles.colTotal, styles.subtotalValue, { color: '#dc2626' }]}>-{fmt(data.total_deducciones)}</Text>
                        </View>
                    </View>

                    {/* Neto */}
                    <View style={styles.netSalaryRow}>
                        <Text style={styles.netSalaryLabel}>NETO A PAGAR</Text>
                        <Text style={styles.netSalaryValue}>{fmt(data.neto_pagar)}</Text>
                    </View>

                    {/* Signatures */}
                    <View style={styles.signatureContainer}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureLabel}>Firma Empleador</Text>
                            <Text style={styles.signatureSub}>Opera Soluciones S.A.S.</Text>
                        </View>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureLabel}>Firma Empleado / Huella</Text>
                            <Text style={styles.signatureSub}>{data.document_type || 'C.C.'} No. {data.document_number}</Text>
                        </View>
                    </View>

                    <Text style={styles.footerGen}>
                        Generado el {new Date(data.fecha_liquidacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
