import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Order } from '@/types/order';
import { Client } from '@/types/client';

// Registrar fuentes
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
    ]
});

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 15,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.2,
    },
    header: {
        textAlign: 'center',
        marginBottom: 8,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000000',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#000000',
    },
    orderNumberSection: {
        textAlign: 'center',
        marginBottom: 6,
        padding: 6,
        border: '1 solid #000000',
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    clientInfo: {
        marginBottom: 6,
        padding: 6,
        border: '1 solid #000000',
    },
    clientName: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#000000',
    },
    clientDetails: {
        fontSize: 9,
        color: '#000000',
        marginBottom: 1,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 6,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        padding: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        padding: 4,
        minHeight: 18,
    },
    productCell: {
        flex: 2,
        fontSize: 9,
        textAlign: 'left',
        color: '#000000',
        paddingLeft: 3,
        paddingRight: 3,
    },
    quantityCell: {
        flex: 1,
        fontSize: 9,
        textAlign: 'center',
        color: '#000000',
        paddingLeft: 3,
        paddingRight: 3,
    },
    priceCell: {
        flex: 1,
        fontSize: 9,
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 3,
        paddingRight: 3,
    },
    totalCell: {
        flex: 1,
        fontSize: 9,
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 3,
        paddingRight: 3,
    },
    headerCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000000',
        paddingLeft: 3,
        paddingRight: 3,
    },
    totals: {
        marginTop: 6,
        padding: 6,
        border: '1 solid #000000',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        marginTop: 6,
        padding: 4,
        borderTop: '1 solid #000000',
    },
    footerText: {
        fontSize: 7,
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.2,
    },
    notes: {
        marginBottom: 6,
        padding: 6,
        border: '1 solid #000000',
    },
    notesTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#000000',
    },
    notesText: {
        fontSize: 9,
        color: '#000000',
    },
});

interface IndividualOrderPDFProps {
    order: Order;
    client?: Client | null;
}

const IndividualOrderPDF: React.FC<IndividualOrderPDFProps> = ({ order, client }) => {
    // Función para generar identificador de 5 dígitos del ID del pedido
    const generateOrderIdentifier = (orderId: string): string => {
        const numbers = orderId.replace(/\D/g, '');
        const firstFiveNumbers = numbers.substring(0, 5);
        return firstFiveNumbers.padStart(5, '0');
    };

    // Función para obtener el nombre del cliente
    const getClientName = (order: Order, client: Client | null | undefined): string => {
        return client?.nombre || order.clientName || 'No disponible';
    };

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Mega Donut</Text>
                    <Text style={styles.subtitle}>Nota de Pedido</Text>
                </View>

                {/* Pedido # */}
                <View style={styles.orderNumberSection}>
                    <Text style={styles.orderNumber}>
                        Pedido #{generateOrderIdentifier(order.id)}
                    </Text>
                </View>

                {/* Información del Cliente */}
                <View style={styles.clientInfo}>
                    <Text style={styles.clientDetails}>
                        Nombre: {getClientName(order, client)}
                    </Text>
                    {order.deliveryDate && (
                        <Text style={styles.clientDetails}>
                            Fecha de entrega: {order.deliveryDate.toLocaleDateString('es-ES')}
                        </Text>
                    )}
                    {client?.telefono && (
                        <Text style={styles.clientDetails}>
                            Teléfono: {client.telefono}
                        </Text>
                    )}
                    {client?.direccion && (
                        <Text style={styles.clientDetails}>
                            Dirección: {client.direccion}
                        </Text>
                    )}
                    {client?.cedula && (
                        <Text style={styles.clientDetails}>
                            Cédula: {client.cedula}
                        </Text>
                    )}
                </View>

                {/* Tabla de Productos */}
                <View style={styles.table}>
                    {/* Header de la tabla */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.productCell, styles.headerCell]}>Producto</Text>
                        <Text style={[styles.quantityCell, styles.headerCell]}>Cantidad</Text>
                        <Text style={[styles.priceCell, styles.headerCell]}>Precio Unit.</Text>
                        <Text style={[styles.totalCell, styles.headerCell]}>Total</Text>
                    </View>

                    {/* Filas de productos */}
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.productCell}>{item.productName}</Text>
                                <Text style={styles.quantityCell}>{item.quantity}</Text>
                                <Text style={styles.priceCell}>${item.unitPrice.toFixed(2)}</Text>
                                <Text style={styles.totalCell}>${item.totalPrice.toFixed(2)}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={[styles.productCell, { textAlign: 'center', flex: 4 }]}>
                                No hay productos en este pedido
                            </Text>
                        </View>
                    )}

                </View>

                {/* Totales */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL A CANCELAR:</Text>
                        <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Notas adicionales */}
                {order.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notas adicionales</Text>
                        <Text style={styles.notesText}>{order.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Gracias por su preferencia - Mega Donut{'\n'}
                        Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                    </Text>
                    <Text style={[styles.footerText, { color: '#dc2626', marginTop: 4 }]}>
                        En caso de incumplimiento en el pago del valor establecido en la nota de pedido emitida por MEGA DONUT, el cliente se someterá a las acciones legales correspondientes.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default IndividualOrderPDF;
