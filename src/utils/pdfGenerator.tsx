import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
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

// Estilos para el PDF - Optimizados para 14cm x 21cm - ULTRA COMPACTO
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 15, // Padding adecuado para A5
        fontFamily: 'Helvetica',
        fontSize: 8, // Aumentado para A5
        lineHeight: 1.1, // Aumentado para A5
    },
    header: {
        textAlign: 'center',
        marginBottom: 3,
        paddingBottom: 1,
        flexDirection: 'row', // Cambiado de column a row para logo al lado
        alignItems: 'center',
        justifyContent: 'center', // Centrado
    },
    logo: {
        width: 40, // Aumentado para A5
        height: 40, // Aumentado para A5
        marginLeft: 8, // Espacio entre texto y logo
    },
    headerText: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 12, // Aumentado para A5
        fontWeight: 'bold',
        marginBottom: 3, // Aumentado de 1 a 3 para más separación
        color: '#000000',
    },
    subtitle: {
        fontSize: 10, // Aumentado para A5
        fontWeight: 'bold',
        marginBottom: 0,
        color: '#000000',
        paddingTop: 2, // Aumentado de 1 a 2 para más separación
    },
    orderNumberSection: {
        textAlign: 'center',
        marginBottom: 1,
        padding: 1,
    },
    orderNumber: {
        fontSize: 10, // Aumentado para A5
        fontWeight: 'bold',
        color: '#000000',
    },
    clientInfo: {
        marginBottom: 1,
        padding: 1,
    },
    clientName: {
        fontSize: 6,
        fontWeight: 'bold',
        marginBottom: 0,
        color: '#000000',
    },
    clientDetails: {
        fontSize: 8, // Aumentado para A5
        color: '#000000',
        marginBottom: 2, // Aumentado de 0 a 2 para más separación entre líneas
        lineHeight: 1.5, // Aumentado el interlineado
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 0.5, // MUCHO menos grueso de 1 a 0.5
        borderColor: '#000000',
        marginBottom: 1,
        paddingLeft: 4, // Aumentado de 3 a 4
        paddingRight: 4, // Aumentado de 3 a 4
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 0.5, // MUCHO menos grueso de 1 a 0.5
        borderBottomColor: '#000000',
        padding: 1,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5, // MUCHO menos grueso de 1 a 0.5
        borderBottomColor: '#000000',
        padding: 1,
        minHeight: 8,
    },
    productCell: {
        flex: 2,
        fontSize: 7, // Aumentado para A5
        textAlign: 'left',
        color: '#000000',
        paddingLeft: 0,
        paddingRight: 0,
    },
    quantityCell: {
        flex: 1,
        fontSize: 7, // Aumentado para A5
        textAlign: 'center',
        color: '#000000',
        paddingLeft: 0,
        paddingRight: 0,
    },
    priceCell: {
        flex: 1,
        fontSize: 7, // Aumentado para A5
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 0,
        paddingRight: 0,
    },
    totalCell: {
        flex: 1,
        fontSize: 7, // Aumentado para A5
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 0,
        paddingRight: 0,
    },
    headerCell: {
        fontSize: 7, // Aumentado para A5
        fontWeight: 'bold',
        color: '#000000',
        paddingLeft: 0,
        paddingRight: 0,
    },
    totals: {
        marginTop: 1,
        padding: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 8, // Aumentado para A5
        fontWeight: 'bold',
        color: '#000000',
    },
    totalValue: {
        fontSize: 8, // Aumentado para A5
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        marginTop: 1,
        padding: 1,
    },
    footerText: {
        fontSize: 8, // Aumentado para A5
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.1, // Aumentado para A5
    },
    notes: {
        marginBottom: 1,
        padding: 1,
    },
    notesTitle: {
        fontSize: 6,
        fontWeight: 'bold',
        marginBottom: 0,
        color: '#000000',
    },
    notesText: {
        fontSize: 5,
        color: '#000000',
    },
});

interface IndividualOrderPDFProps {
    order: Order;
    client?: Client | null;
}

export const IndividualOrderPDF: React.FC<IndividualOrderPDFProps> = ({ order, client }) => {
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
            <Page size="A5" orientation="landscape" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Mega Donut</Text>
                        <Text style={styles.subtitle}>Nota de Pedido</Text>
                    </View>
                    <Image
                        style={styles.logo}
                        src="/logo_empresa.png"
                    />
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
                        Cliente: {getClientName(order, client)}
                    </Text>
                    {order.deliveryDate && (
                        <Text style={styles.clientDetails}>
                            Entrega: {order.deliveryDate.toLocaleDateString('es-ES')}
                        </Text>
                    )}
                    {client?.telefono && (
                        <Text style={styles.clientDetails}>
                            Tel: {client.telefono}
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
                        Gracias por su preferencia - Mega Donut
                    </Text>
                    <Text style={[styles.footerText, { color: '#dc2626', marginTop: 1 }]}>
                        En caso de incumplimiento en el pago, el cliente se someterá a las acciones legales correspondientes.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
