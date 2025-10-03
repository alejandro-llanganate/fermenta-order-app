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

// Estilos para el PDF - Optimizado para dos pedidos por página
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 8,
        fontFamily: 'Helvetica',
        fontSize: 9,
        lineHeight: 1.2,
    },
    header: {
        textAlign: 'center',
        marginBottom: 4,
        paddingBottom: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#000000',
    },
    subtitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 1,
        color: '#000000',
    },
    orderNumberSection: {
        textAlign: 'center',
        marginBottom: 3,
        padding: 2,
    },
    clientInfo: {
        marginBottom: 3,
        padding: 2,
    },
    clientName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 1,
        color: '#000000',
    },
    clientDetails: {
        fontSize: 8,
        color: '#000000',
        marginBottom: 0,
    },
    orderNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000000',
        marginBottom: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        padding: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        padding: 2,
        minHeight: 14,
    },
    productCell: {
        flex: 2,
        fontSize: 8,
        textAlign: 'left',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    quantityCell: {
        flex: 1,
        fontSize: 8,
        textAlign: 'center',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    priceCell: {
        flex: 1,
        fontSize: 8,
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    totalCell: {
        flex: 1,
        fontSize: 8,
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    headerCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    totals: {
        marginTop: 3,
        padding: 2,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        marginTop: 3,
        padding: 2,
    },
    footerText: {
        fontSize: 7,
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.1,
    },
    specialPrice: {
        fontSize: 6,
        color: '#dc2626',
        fontStyle: 'italic',
    },
    // Estilos para formato A5 (mitad de A4)
    a5Container: {
        width: '100%',
        height: '50%',
        padding: 6,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 4,
        marginBottom: 4,
    },
    a5Top: {
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
    },
    a5Bottom: {
        borderTopWidth: 2,
        borderTopColor: '#000000',
    },
    a5Separator: {
        height: 2,
        backgroundColor: '#000000',
        marginVertical: 2,
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

    // Función para renderizar un pedido individual (optimizado para A5)
    const renderOrder = (order: Order, client: Client | undefined) => (
        <View key={order.id}>
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
                    <Text style={styles.totalLabel}>Total:</Text>
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
        </View>
    );

    // Agrupar pedidos de dos en dos, asegurando que no haya grupos vacíos
    const groupedOrders = [];
    for (let i = 0; i < orders.length; i += 2) {
        const group = orders.slice(i, i + 2);
        if (group.length > 0) {
            groupedOrders.push(group);
        }
    }

    // Si no hay pedidos, no generar PDF
    if (orders.length === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Mega Donut</Text>
                        <Text style={styles.subtitle}>No hay pedidos para mostrar</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            {groupedOrders.map((orderGroup, pageIndex) => {
                // Verificar que el grupo no esté vacío
                if (!orderGroup || orderGroup.length === 0) {
                    return null;
                }

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        {/* Renderizar pedidos del grupo - cada uno en su mitad A5 con su propio header */}
                        {orderGroup.map((order, orderIndex) => {
                            if (!order) return null;

                            const client = clients.find(c => c.id === order.clientId);
                            return (
                                <React.Fragment key={order.id}>
                                    <View style={[
                                        styles.a5Container,
                                        orderIndex === 0 ? styles.a5Top : styles.a5Bottom
                                    ]}>
                                        {/* Header individual para cada pedido */}
                                        <View style={styles.header}>
                                            <Text style={styles.title}>Mega Donut</Text>
                                            <Text style={styles.subtitle}>Nota de Pedido</Text>
                                        </View>

                                        {renderOrder(order, client)}
                                    </View>
                                    {orderIndex < orderGroup.length - 1 && (
                                        <View style={styles.a5Separator} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Page>
                );
            })}
        </Document>
    );
};

export default BulkOrderNotesPDF;
