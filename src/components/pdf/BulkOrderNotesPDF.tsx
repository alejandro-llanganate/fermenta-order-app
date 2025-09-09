import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Order, OrderItem } from '@/types/order';
import { Client } from '@/types/client';
import { Route } from '@/types/route';

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
        padding: 12,
        fontFamily: 'Helvetica',
        fontSize: 9,
        lineHeight: 1.1,
    },
    header: {
        textAlign: 'center',
        marginBottom: 8,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#000000',
    },
    subtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#374151',
    },
    orderNumberSection: {
        textAlign: 'center',
        marginBottom: 6,
        padding: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
    },
    clientInfo: {
        marginBottom: 6,
        padding: 6,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    clientName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#1f2937',
    },
    clientDetails: {
        fontSize: 8,
        color: '#6b7280',
        marginBottom: 1,
    },
    orderNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 6,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        padding: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        padding: 4,
        minHeight: 18,
    },
    productCell: {
        flex: 2,
        fontSize: 8,
        textAlign: 'left',
        color: '#000000',
        paddingLeft: 2,
        paddingRight: 2,
    },
    quantityCell: {
        flex: 1,
        fontSize: 8,
        textAlign: 'center',
        color: '#000000',
        paddingLeft: 2,
        paddingRight: 2,
    },
    priceCell: {
        flex: 1,
        fontSize: 8,
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 2,
        paddingRight: 2,
    },
    totalCell: {
        flex: 1,
        fontSize: 8,
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 2,
        paddingRight: 2,
    },
    headerCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#374151',
        paddingLeft: 2,
        paddingRight: 2,
    },
    totals: {
        marginTop: 6,
        padding: 6,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        marginTop: 6,
        padding: 4,
        borderTop: '1 solid #e5e7eb',
    },
    footerText: {
        fontSize: 6,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 1.1,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        fontSize: 6,
        color: '#6b7280',
    },
    specialPrice: {
        fontSize: 6,
        color: '#dc2626',
        fontStyle: 'italic',
    },
});

interface BulkOrderNotesPDFProps {
    orders: Order[];
    clients: Client[];
    routes: Route[];
    dateFilterType: 'registration' | 'delivery';
    dateFilterValue: Date | null;
    routeFilter: string;
    searchTerm: string;
}

const BulkOrderNotesPDF: React.FC<BulkOrderNotesPDFProps> = ({
    orders,
    clients,
    routes,
    dateFilterType,
    dateFilterValue,
    routeFilter,
    searchTerm
}) => {
    // Función para generar identificador de 5 dígitos del ID del pedido
    const generateOrderIdentifier = (orderId: string): string => {
        // Extraer solo los números del ID
        const numbers = orderId.replace(/\D/g, '');

        // Tomar los primeros 5 números
        const firstFiveNumbers = numbers.substring(0, 5);

        // Completar con ceros a la izquierda si es necesario
        return firstFiveNumbers.padStart(5, '0');
    };

    // Función para obtener el nombre del cliente de manera consistente
    const getClientName = (order: Order, client: Client | undefined): string => {
        return client?.nombre || order.clientName || 'No disponible';
    };


    return (
        <Document>
            {orders.map((order, index) => {
                const client = clients.find(c => c.id === order.clientId);
                const route = routes.find(r => r.id === order.routeId);

                return (
                    <Page key={order.id} size="A5" orientation="landscape" style={styles.page}>
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
                            {client?.direccion && (
                                <Text style={styles.clientDetails}>
                                    Dirección: {client.direccion}
                                </Text>
                            )}
                            {client?.telefono && (
                                <Text style={styles.clientDetails}>
                                    Teléfono: {client.telefono}
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
                            {order.items && order.items.map((item: OrderItem) => (
                                <View key={item.id} style={styles.tableRow}>
                                    <Text style={styles.productCell}>
                                        {item.productName}
                                        {item.usesSpecialPrice && (
                                            <Text style={styles.specialPrice}> (Precio Especial)</Text>
                                        )}
                                    </Text>
                                    <Text style={styles.quantityCell}>{item.quantity}</Text>
                                    <Text style={styles.priceCell}>${item.unitPrice.toFixed(2)}</Text>
                                    <Text style={styles.totalCell}>${item.totalPrice.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Totales */}
                        <View style={styles.totals}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total del Pedido:</Text>
                                <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Notas */}
                        {order.notes && (
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    <Text style={{ fontWeight: 'bold' }}>Notas:</Text> {order.notes}
                                </Text>
                            </View>
                        )}

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Gracias por su preferencia - Mega Donut
                            </Text>
                            <Text style={styles.footerText}>
                                En caso de incumplimiento en el pago del valor establecido en la nota de pedido emitida por MEGA DONUT, el cliente se someterá a las acciones legales correspondientes.
                            </Text>
                        </View>

                        {/* Número de página */}
                        <Text style={styles.pageNumber}>
                            Página {index + 1} de {orders.length}
                        </Text>
                    </Page>
                );
            })}
        </Document>
    );
};

export default BulkOrderNotesPDF;
