import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ProductCategory, Route, Client, Product } from '@/types/routeNotebook';

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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#374151',
    },
    date: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    route: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f3f4f6',
        padding: 8,
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        minHeight: 30,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 8,
        fontSize: 10,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
    },
    tableCellHeader: {
        padding: 8,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    clientCell: {
        padding: 8,
        fontSize: 10,
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 2,
        color: '#000000',
    },
    totalCell: {
        padding: 8,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#f3f4f6',
        color: '#000000',
    },
    routeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: '#dbeafe',
        padding: 8,
        marginBottom: 8,
        color: '#1e40af',
    },
    categorySection: {
        marginBottom: 15,
    },
    categoryTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 6,
        marginBottom: 6,
        color: '#374151',
    },
});

interface RouteNotebookPDFProps {
    selectedDate: Date;
    selectedRoute: string;
    productCategories: ProductCategory[];
    routes: Route[];
    getClientsWithOrders: (categoryId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForRoute: (routeId: string) => { quantity: number; amount: number };
}

const RouteNotebookPDF: React.FC<RouteNotebookPDFProps> = ({
    selectedDate,
    selectedRoute,
    productCategories,
    routes,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForRoute,
}) => {
    // Obtener la ruta seleccionada
    const currentRoute = selectedRoute ? routes.find(r => r.id === selectedRoute) : null;

    // Obtener todos los productos
    const allProducts = productCategories.flatMap(cat => cat.products);

    // Obtener clientes con órdenes
    const clientsWithOrders = getClientsWithOrders();

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>MEGA DONUT</Text>
                    <Text style={styles.subtitle}>PEDIDOS POR RUTAS</Text>
                    <Text style={styles.date}>
                        DÍA: {selectedDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }).toUpperCase()}
                    </Text>
                    {currentRoute && (
                        <Text style={styles.route}>RUTA: {currentRoute.nombre} - {currentRoute.identificador}</Text>
                    )}
                </View>

                {/* Tabla principal */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {currentRoute ? `PEDIDOS - ${currentRoute.nombre}` : 'TODOS LOS PEDIDOS'}
                    </Text>

                    <View style={styles.table}>
                        {/* Header de la tabla */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableCellHeader}>CLIENTES</Text>
                            {allProducts.map((product) => (
                                <Text key={product.id} style={styles.tableCellHeader}>
                                    {product.name}
                                </Text>
                            ))}
                            <Text style={styles.tableCellHeader}>TOTAL</Text>
                        </View>

                        {/* Filas de clientes */}
                        {clientsWithOrders.map((client) => {
                            const clientTotal = getTotalForClient(client.id);
                            return (
                                <View key={client.id} style={styles.tableRow}>
                                    <Text style={styles.clientCell}>{client.nombre}</Text>
                                    {allProducts.map((product) => {
                                        const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                        return (
                                            <Text key={product.id} style={styles.tableCell}>
                                                {quantity > 0 ? quantity : ''}
                                            </Text>
                                        );
                                    })}
                                    <Text style={styles.totalCell}>
                                        {clientTotal.quantity > 0 ? clientTotal.quantity : ''}
                                    </Text>
                                </View>
                            );
                        })}

                        {/* Fila de totales */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableCellHeader}>TOTAL GENERAL</Text>
                            {allProducts.map((product) => {
                                const total = getTotalForProduct(product.id);
                                return (
                                    <Text key={product.id} style={styles.tableCellHeader}>
                                        {total > 0 ? total : ''}
                                    </Text>
                                );
                            })}
                            <Text style={styles.tableCellHeader}>
                                {clientsWithOrders.reduce((sum, client) => sum + getTotalForClient(client.id).quantity, 0)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Totales por categoría */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TOTALES POR CATEGORÍA</Text>
                    {productCategories.map((category) => (
                        <View key={category.name} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{category.name}</Text>
                            <View style={styles.table}>
                                <View style={[styles.tableRow, styles.tableHeader]}>
                                    <Text style={styles.tableCellHeader}>PRODUCTO</Text>
                                    <Text style={styles.tableCellHeader}>CANTIDAD TOTAL</Text>
                                </View>
                                {category.products.map((product) => {
                                    const total = getTotalForProduct(product.id, category.name);
                                    return (
                                        <View key={product.id} style={styles.tableRow}>
                                            <Text style={styles.clientCell}>{product.name}</Text>
                                            <Text style={styles.totalCell}>{total}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Totales por ruta */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TOTALES POR RUTA</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableCellHeader}>RUTA</Text>
                            <Text style={styles.tableCellHeader}>CANTIDAD TOTAL</Text>
                            <Text style={styles.tableCellHeader}>MONTO TOTAL</Text>
                        </View>
                        {routes.map((route) => {
                            const routeTotal = getTotalForRoute(route.id);
                            return (
                                <View key={route.id} style={styles.tableRow}>
                                    <Text style={styles.clientCell}>{route.nombre} - {route.identificador}</Text>
                                    <Text style={styles.tableCell}>{routeTotal.quantity}</Text>
                                    <Text style={styles.tableCell}>${routeTotal.amount.toFixed(2)}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default RouteNotebookPDF;
