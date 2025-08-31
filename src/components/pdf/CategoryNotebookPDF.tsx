import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ProductCategory, Route, Client, Product } from '@/types/routeNotebook';

// Registrar fuentes (opcional - usar fuentes del sistema)
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
    category: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
    },
    section: {
        marginBottom: 12,
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
        minHeight: 25,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
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
    routeTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 4,
        marginBottom: 6,
        color: '#374151',
    },
});

interface CategoryNotebookPDFProps {
    selectedDate: Date;
    selectedCategory: string;
    productCategories: ProductCategory[];
    routes: Route[];
    getClientsWithOrders: (categoryId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForCategory: (categoryId: string) => { quantity: number; amount: number };
}

const CategoryNotebookPDF: React.FC<CategoryNotebookPDFProps> = ({
    selectedDate,
    selectedCategory,
    productCategories,
    routes,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForCategory,
}) => {
    // Obtener productos de la categoría seleccionada
    const categoryProducts = selectedCategory
        ? productCategories.find(cat => cat.name === selectedCategory)?.products || []
        : productCategories.flatMap(cat => cat.products);

    // Obtener clientes con órdenes
    const clientsWithOrders = getClientsWithOrders(selectedCategory);

    // Agrupar clientes por ruta
    const clientsByRoute = routes.map(route => ({
        route,
        clients: clientsWithOrders.filter(client => client.routeId === route.id)
    })).filter(group => group.clients.length > 0);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>MEGA DONUT</Text>
                    <Text style={styles.subtitle}>PEDIDOS POR CATEGORÍAS</Text>
                    <Text style={styles.date}>
                        DÍA: {selectedDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }).toUpperCase()}
                    </Text>
                    {selectedCategory && (
                        <Text style={styles.category}>CATEGORÍA: {selectedCategory}</Text>
                    )}
                </View>

                {/* Totales por producto */}
                {selectedCategory && (
                    <View style={styles.productTotals}>
                        <Text style={styles.productTotalsTitle}>
                            TOTALES POR PRODUCTO - {selectedCategory}
                        </Text>
                        <View style={styles.productTotalsGrid}>
                            {categoryProducts.map((product) => {
                                const total = getTotalForProduct(product.id, selectedCategory);
                                return (
                                    <View key={product.id} style={styles.productTotalItem}>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productQuantity}>{total}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Tablas por ruta */}
                {clientsByRoute.map(({ route, clients }) => (
                    <View key={route.id} style={styles.section}>
                        <Text style={styles.routeTitle}>
                            {route.nombre} - {route.identificador}
                        </Text>

                        <View style={styles.table}>
                            {/* Header de la tabla */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.clientCell}>CLIENTES</Text>
                                {categoryProducts.map((product) => (
                                    <Text key={product.id} style={styles.tableCellHeader}>
                                        {product.name}
                                    </Text>
                                ))}
                            </View>

                            {/* Filas de clientes */}
                            {clients.map((client) => {
                                return (
                                    <View key={client.id} style={styles.tableRow}>
                                        <Text style={styles.clientCell}>{client.nombre}</Text>
                                        {categoryProducts.map((product) => {
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
                        </View>
                    </View>
                ))}


            </Page>
        </Document>
    );
};

export default CategoryNotebookPDF;
