import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
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
        paddingLeft: 30, // Padding de 30px a la izquierda (15 + 15)
        paddingRight: 30, // Padding de 30px a la derecha (15 + 15)
        paddingTop: 15, // Padding de 15px arriba
        paddingBottom: 15, // Padding de 15px abajo
        fontFamily: 'Helvetica',
        fontSize: 8,
        lineHeight: 1.1,
    },
    header: {
        textAlign: 'center',
        marginBottom: 4,
        paddingBottom: 2,
        flexDirection: 'row', // Cambiado de column a row para logo al lado
        alignItems: 'center',
        justifyContent: 'center', // Centrado
    },
    logo: {
        width: 40, // Reducido para mantener proporción
        height: 40, // Mismo valor que width para mantener proporción cuadrada
        marginLeft: 12, // Aumentado el espacio entre texto y logo (a la derecha)
    },
    headerText: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 13, // Aumentado de 12 a 13
        fontWeight: 'bold',
        marginBottom: 3, // Aumentado de 1 a 3 para más separación
        color: '#000000',
    },
    subtitle: {
        fontSize: 10, // Aumentado de 9 a 10
        fontWeight: 'bold',
        marginBottom: 1,
        color: '#000000',
        paddingTop: 2, // Padding superior adicional para "Nota de Pedido"
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
        paddingLeft: 6, // Aumentado de 4 a 6
        paddingRight: 6, // Aumentado de 4 a 6
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
        fontSize: 8, // Aumentado de 7 a 8
        textAlign: 'left',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    quantityCell: {
        flex: 1,
        fontSize: 8, // Aumentado de 7 a 8
        textAlign: 'center',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    priceCell: {
        flex: 1,
        fontSize: 8, // Aumentado de 7 a 8
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    totalCell: {
        flex: 1,
        fontSize: 8, // Aumentado de 7 a 8
        textAlign: 'right',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    headerCell: {
        fontSize: 8, // Aumentado de 7 a 8
        fontWeight: 'bold',
        color: '#000000',
        paddingLeft: 1,
        paddingRight: 1,
    },
    totals: {
        marginTop: 2, // Reducido de 3 a 2
        padding: 1, // Reducido de 2 a 1
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 0.5, // Reducido de 1 a 0.5
    },
    totalLabel: {
        fontSize: 9, // Aumentado de 8 a 9
        fontWeight: 'bold',
        color: '#000000',
    },
    totalValue: {
        fontSize: 9, // Aumentado de 8 a 9
        fontWeight: 'bold',
        color: '#000000',
    },
    footer: {
        marginTop: 2, // Reducido de 3 a 2
        padding: 1, // Reducido de 2 a 1
    },
    footerText: {
        fontSize: 7,
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.1,
    },
    legalNotice: {
        marginTop: 2,
        padding: 1,
    },
    legalText: {
        fontSize: 8, // Aumentado aún más para mejor legibilidad
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.1,
        fontStyle: 'italic',
    },
    specialPrice: {
        fontSize: 6,
        color: '#000000',
        fontStyle: 'italic',
    },
    // Estilos para formato A5 (mitad de A4) - Sin bordes
    a5Container: {
        width: '100%',
        height: '48%',
        padding: 8, // Aumentado de 4 a 8 para más padding lateral
        marginBottom: 2,
    },
    a5Top: {
        // Sin bordes
    },
    a5Bottom: {
        // Sin bordes
    },
    a5Separator: {
        height: 8,
        backgroundColor: 'transparent',
        marginVertical: 4,
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

            {/* Aviso Legal */}
            <View style={styles.legalNotice}>
                <Text style={styles.legalText}>
                    En caso de incumplimiento en el pago, el cliente se someterá a las acciones legales correspondientes.
                </Text>
            </View>
        </View>
    );

    // LÓGICA ULTRA SIMPLE: Solo pedidos válidos
    const validOrders = orders.filter(order =>
        order &&
        order.id &&
        order.items &&
        order.items.length > 0
    );

    if (validOrders.length === 0) {
        return null;
    }

    // Crear páginas: 2 pedidos por página
    const pages = [];
    for (let i = 0; i < validOrders.length; i += 2) {
        const pageOrders = validOrders.slice(i, i + 2);
        pages.push(pageOrders);
    }

    return (
        <Document>
            {pages.map((pageOrders, pageIndex) => {
                // Solo renderizar si la página tiene pedidos
                if (!pageOrders || pageOrders.length === 0) {
                    return null;
                }

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        {pageOrders.map((order, orderIndex) => {
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
                                            <View style={styles.headerText}>
                                                <Text style={styles.title}>Mega Donut</Text>
                                                <Text style={styles.subtitle}>Nota de Pedido</Text>
                                            </View>
                                            <Image
                                                style={styles.logo}
                                                src="/logo_empresa.png"
                                            />
                                        </View>

                                        {renderOrder(order, client)}
                                    </View>
                                    {orderIndex < pageOrders.length - 1 && (
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
