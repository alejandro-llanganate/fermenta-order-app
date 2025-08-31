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
        padding: 15,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 15,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#000000',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#374151',
    },
    date: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 3,
    },
    route: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        backgroundColor: '#f3f4f6',
        padding: 6,
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        minHeight: 25,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 4,
        fontSize: 9,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeader: {
        padding: 4,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    clientCell: {
        padding: 4,
        fontSize: 9,
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 2,
        color: '#000000',
    },
    totalCell: {
        padding: 6,
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
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 4,
        marginBottom: 6,
        color: '#374151',
    },
    categorySection: {
        marginBottom: 8,
    },

    productTotals: {
        backgroundColor: '#dbeafe',
        padding: 6,
        marginBottom: 10,
        borderRadius: 4,
    },
    productTotalsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#1e40af',
    },
    productTotalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    productTotalItem: {
        backgroundColor: '#ffffff',
        padding: 4,
        borderRadius: 4,
        border: '1 solid #bfdbfe',
        minWidth: 60,
        alignItems: 'center',
    },
    productName: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center',
        marginBottom: 2,
    },
    productQuantity: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e40af',
    },
});

interface RouteNotebookPDFProps {
    selectedDate: Date;
    dateFilterType: 'registration' | 'delivery';
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
    dateFilterType,
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

    // Calcular el tamaño de página óptimo basado en los datos
    const calculatePageSize = () => {
        const totalColumns = allProducts.length + 1; // +1 para CLIENTES (sin TOTAL)
        const totalRows = routes.reduce((sum, route) => {
            const routeClients = getClientsWithOrders(route.id);
            return sum + routeClients.length + 2; // +2 para header y total de ruta
        }, 0) + 2; // +2 para header general y totales por producto

        // Si hay pocos datos, usar A4
        if (totalColumns <= 8 && totalRows <= 15) {
            return 'A4';
        }
        // Si hay datos moderados, usar A3
        else if (totalColumns <= 12 && totalRows <= 25) {
            return 'A3';
        }
        // Si hay muchos datos, usar A2
        else if (totalColumns <= 18 && totalRows <= 40) {
            return 'A2';
        }
        // Si hay demasiados datos, usar A1
        else {
            return 'A1';
        }
    };

    const pageSize = calculatePageSize();

    console.log('📏 Tamaño de página calculado:', pageSize);
    console.log('📊 Datos:', {
        productos: allProducts.length,
        rutas: routes.length,
        clientes: clientsWithOrders.length,
        columnas: allProducts.length + 1
    });

    return (
        <Document>
            <Page size={pageSize} orientation="landscape" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>MEGA DONUT</Text>
                    <Text style={styles.subtitle}>PEDIDOS POR RUTAS</Text>
                    <Text style={styles.date}>
                        {dateFilterType === 'registration' ? 'FECHA DE REGISTRO' : 'FECHA DE ENTREGA'}: {selectedDate.toLocaleDateString('es-ES', {
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

                {/* Totales por producto */}
                <View style={styles.productTotals}>
                    <Text style={styles.productTotalsTitle}>
                        TOTALES POR PRODUCTO
                    </Text>
                    <View style={styles.productTotalsGrid}>
                        {allProducts.map((product) => {
                            const total = getTotalForProduct(product.id);
                            return (
                                <View key={product.id} style={styles.productTotalItem}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productQuantity}>{total}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Tabla según selección */}
                {selectedRoute ? (
                    // Tabla para ruta específica
                    (() => {
                        const route = routes.find(r => r.id === selectedRoute);
                        const routeClients = getClientsWithOrders(selectedRoute);

                        if (!route || routeClients.length === 0) return null;

                        return (
                            <View style={styles.section}>
                                <Text style={styles.routeTitle}>
                                    {route.nombre} - {route.identificador}
                                </Text>

                                <View style={styles.table}>
                                    {/* Header de la tabla */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={styles.clientCell}>CLIENTES</Text>
                                        {allProducts.map((product) => (
                                            <Text key={product.id} style={styles.tableCellHeader}>
                                                {product.name}
                                            </Text>
                                        ))}
                                    </View>

                                    {/* Filas de clientes */}
                                    {routeClients.map((client) => {
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
                                            </View>
                                        );
                                    })}

                                    {/* Fila de totales de ruta */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={styles.tableCellHeader}>TOTAL {route.nombre}</Text>
                                        {allProducts.map((product) => {
                                            const total = getTotalForProduct(product.id, selectedRoute);
                                            return (
                                                <Text key={product.id} style={styles.tableCellHeader}>
                                                    {total > 0 ? total : ''}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        );
                    })()
                ) : (
                    // Tabla general para todas las rutas
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>TODOS LOS PEDIDOS</Text>

                        <View style={styles.table}>
                            {/* Header de la tabla */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.clientCell}>CLIENTES</Text>
                                {allProducts.map((product) => (
                                    <Text key={product.id} style={styles.tableCellHeader}>
                                        {product.name}
                                    </Text>
                                ))}
                            </View>

                            {/* Filas de clientes */}
                            {clientsWithOrders.map((client) => {
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
                                    </View>
                                );
                            })}

                            {/* Fila de totales generales */}
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
                            </View>
                        </View>
                    </View>
                )}


            </Page>
        </Document>
    );
};

export default RouteNotebookPDF;
