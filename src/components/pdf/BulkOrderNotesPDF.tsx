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
        padding: 20,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000000',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#374151',
    },
    orderNumberSection: {
        textAlign: 'center',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
    },
    clientInfo: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    clientName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1f2937',
    },
    clientDetails: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 2,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 15,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        padding: 8,
        minHeight: 25,
    },
    productCell: {
        flex: 2,
        fontSize: 10,
        textAlign: 'left',
        color: '#000000',
    },
    quantityCell: {
        flex: 1,
        fontSize: 10,
        textAlign: 'center',
        color: '#000000',
    },
    priceCell: {
        flex: 1,
        fontSize: 10,
        textAlign: 'right',
        color: '#000000',
    },
    totalCell: {
        flex: 1,
        fontSize: 10,
        textAlign: 'right',
        color: '#000000',
    },
    headerCell: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
    },
    totals: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        marginTop: 20,
        padding: 10,
        borderTop: '1 solid #e5e7eb',
    },
    footerText: {
        fontSize: 8,
        color: '#6b7280',
        textAlign: 'center',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        fontSize: 8,
        color: '#6b7280',
    },
    specialPrice: {
        fontSize: 8,
        color: '#dc2626',
        fontStyle: 'italic',
    },
});

interface BulkOrderNotesPDFProps {
    orders: Order[];
    clients: Client[];
    routes: Route[];
    dateFilterType: 'order' | 'delivery';
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
                    <Page key={order.id} size="A4" style={styles.page}>
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
                            <Text style={styles.clientName}>
                                Cliente: {getClientName(order, client)}
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
