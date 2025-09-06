import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ProductCategory, Route, Client, Product } from '@/types/routeNotebook';
import { generateMainTitle } from '@/utils/dateUtils';
import { getCategoryPDFStyles } from '@/utils/categoryColors';

// Registrar fuentes
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
    ]
});

// Estilos para el PDF - RF-24: A4 con tipografía 10pt/12pt
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 10, // Reducido para A4
        fontFamily: 'Helvetica',
        fontSize: 10, // RF-24: Contenido general 10pt
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 6,
    },
    title: {
        fontSize: 12, // RF-24: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000000',
    },
    subtitle: {
        fontSize: 12, // RF-24: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#374151',
    },
    date: {
        fontSize: 10, // RF-24: Contenido general 10pt
        color: '#6b7280',
        marginBottom: 2,
    },
    route: {
        fontSize: 10, // RF-24: Contenido general 10pt
        color: '#6b7280',
        marginBottom: 6,
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12, // RF-24: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 6,
        backgroundColor: '#f3f4f6',
        padding: 4,
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        minHeight: 20, // Reducido para A4
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 8, // Letra más pequeña para columnas
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeader: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 8, // Letra más pequeña para columnas
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeaderVertical: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 7, // Letra aún más pequeña para texto vertical
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
    },
    clientCell: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 8, // Letra más pequeña para columnas
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 2,
        color: '#000000',
    },
    productCell: {
        padding: 3, // Reducido para A4
        fontSize: 10, // RF-24: Contenido general 10pt
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 3,
        color: '#000000',
    },
    quantityCell: {
        padding: 3, // Reducido para A4
        fontSize: 10, // RF-24: Contenido general 10pt
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    totalCell: {
        padding: 4,
        fontSize: 10, // RF-24: Contenido general 10pt
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#f3f4f6',
        color: '#000000',
    },
    routeTitle: {
        fontSize: 12, // RF-24: Encabezados 12pt
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 3,
        marginBottom: 4,
        color: '#374151',
    },
    categorySection: {
        marginBottom: 6,
    },
    // Estilos para encabezados de categorías con colores
    categoryHeader: {
        padding: 3,
        fontSize: 10, // RF-24: Contenido general 10pt
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        color: '#000000',
    },
    productTotals: {
        backgroundColor: '#dbeafe',
        padding: 4,
        marginBottom: 8,
        borderRadius: 4,
    },
    productTotalsTitle: {
        fontSize: 12, // RF-24: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1e40af',
    },
    productTotalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    productTotalItem: {
        backgroundColor: '#ffffff',
        padding: 3,
        borderRadius: 4,
        border: '1 solid #bfdbfe',
        minWidth: 50,
        alignItems: 'center',
    },
    productName: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center',
        marginBottom: 1,
    },
    productQuantity: {
        fontSize: 10, // RF-24: Contenido general 10pt
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

    // RF-24: Mostrar todos los productos y categorías (columnas fijas) como en la vista general
    const getProductsWithOrders = () => {
        return productCategories.flatMap(cat => cat.products); // Mostrar todos los productos
    };

    const filteredProducts = getProductsWithOrders();

    // Obtener clientes con órdenes
    const clientsWithOrders = getClientsWithOrders();

    // RF-24: Forzar tamaño A4 para consistencia
    const pageSize = 'A4';

    console.log('📏 RF-24: Tamaño de página fijo A4');
    console.log('📊 Datos:', {
        productos: filteredProducts.length,
        categorias: productCategories.length,
        rutas: routes.length,
        clientes: clientsWithOrders.length,
        columnas: filteredProducts.length + 1
    });

    return (
        <Document>
            <Page size={pageSize} orientation="landscape" style={styles.page}>
                {/* Header - RF-18: Encabezado en negro con fecha subrayada */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: '#000000' }]}>
                        {generateMainTitle(selectedDate, selectedRoute ? `RUTA ${currentRoute?.nombre}` : 'TODAS LAS RUTAS')}
                    </Text>
                    <Text style={[styles.date, { color: '#000000', textDecoration: 'underline' }]}>
                        FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                    </Text>
                    {currentRoute && (
                        <Text style={[styles.route, { color: '#000000' }]}>RUTA: {currentRoute.nombre} - {currentRoute.identificador}</Text>
                    )}
                </View>


                {/* Tablas separadas por ruta con estructura horizontal */}
                {(() => {
                    const routesToShow = selectedRoute
                        ? routes.filter(route => route.id === selectedRoute)
                        : routes;

                    return routesToShow.map((route) => {
                        const routeClients = getClientsWithOrders(route.id);

                        if (routeClients.length === 0) return null;

                        return (
                            <View key={route.id} style={styles.section}>
                                <Text style={styles.routeTitle}>
                                    {route.nombre} - {route.identificador}
                                </Text>

                                {/* Tabla horizontal con productos como columnas */}
                                <View style={styles.table}>
                                    {/* Primera fila: Encabezados de categorías con colores */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={styles.clientCell}>CLIENTES</Text>
                                        {productCategories.map((category) => {
                                            const categoryProducts = category.products;
                                            const categoryColors = getCategoryPDFStyles(category.name);

                                            return (
                                                <Text
                                                    key={category.name}
                                                    style={[
                                                        styles.categoryHeader,
                                                        {
                                                            backgroundColor: categoryColors.backgroundColor,
                                                            color: categoryColors.color,
                                                            flex: categoryProducts.length
                                                        }
                                                    ]}
                                                >
                                                    {category.name}
                                                </Text>
                                            );
                                        })}
                                    </View>

                                    {/* Segunda fila: Encabezados de productos verticales */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={styles.clientCell}>&nbsp;</Text>
                                        {filteredProducts.map((product) => (
                                            <Text key={product.id} style={styles.tableCellHeaderVertical}>
                                                {product.name}
                                            </Text>
                                        ))}
                                    </View>

                                    {/* Filas de clientes */}
                                    {routeClients.map((client) => {
                                        return (
                                            <View key={client.id} style={styles.tableRow}>
                                                <Text style={styles.clientCell}>{client.nombre}</Text>
                                                {filteredProducts.map((product) => {
                                                    const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                    return (
                                                        <Text key={product.id} style={styles.tableCell}>
                                                            {quantity > 0 ? quantity : '-'}
                                                        </Text>
                                                    );
                                                })}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    });
                })()}


            </Page>
        </Document>
    );
};

export default RouteNotebookPDF;
