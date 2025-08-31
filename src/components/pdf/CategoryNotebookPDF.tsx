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

// Estilos para el PDF A5
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 5,
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
        marginBottom: 3,
        color: '#374151',
    },
    date: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 2,
    },
    category: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 6,
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        backgroundColor: '#f3f4f6',
        padding: 5,
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        minHeight: 18,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
    },
    tableCell: {
        padding: 1,
        fontSize: 6,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeader: {
        padding: 1,
        fontSize: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    clientCell: {
        padding: 1,
        fontSize: 6,
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#f3f4f6',
        color: '#000000',
    },
    productTotals: {
        backgroundColor: '#dbeafe',
        padding: 4,
        marginBottom: 6,
        borderRadius: 3,
    },
    productTotalsTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1e40af',
    },
    productTotalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 3,
    },
    productTotalItem: {
        backgroundColor: '#ffffff',
        padding: 2,
        borderRadius: 3,
        border: '1 solid #bfdbfe',
        minWidth: 45,
        alignItems: 'center',
    },
    productName: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center',
        marginBottom: 1,
    },
    productQuantity: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#1e40af',
    },
    routeTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 3,
        marginBottom: 4,
        color: '#374151',
    },
    // Estilos para el footer de página
    pageFooter: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#6b7280',
        borderTop: '1 solid #e5e7eb',
        paddingTop: 5,
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

    // Función para calcular el contenido de una página
    const createPageContent = (pageData: any[], pageNumber: number, totalPages: number) => (
        <Page key={pageNumber} size="A5" orientation="portrait" style={styles.page}>
            {/* Header solo en la primera página */}
            {pageNumber === 1 && (
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
            )}

            {/* Totales por producto solo en la primera página */}
            {pageNumber === 1 && selectedCategory && (
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

            {/* Contenido de la página */}
            {pageData.map((item) => {
                if (item.type === 'route') {
                    const { route, clients } = item;
                    return (
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
                                {clients.map((client: Client) => (
                                    <View key={client.id} style={styles.tableRow}>
                                        <Text style={styles.clientCell}>
                                            {client.nombre}
                                        </Text>
                                        {categoryProducts.map((product) => {
                                            const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                            return (
                                                <Text key={product.id} style={styles.tableCell}>
                                                    {quantity > 0 ? quantity : ''}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                }
                return null;
            })}

            {/* Footer de página */}
            <View style={styles.pageFooter}>
                <Text>
                    MEGA DONUT - Sistema de Gestión de Pedidos por Categorías |
                    Página {pageNumber} de {totalPages} |
                    Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                </Text>
            </View>
        </Page>
    );

    // Función para dividir el contenido en páginas
    const paginateContent = () => {
        const pages = [];
        let currentPage = [];
        let currentPageHeight = 0;
        const maxPageHeight = 180; // Altura máxima aproximada para A5 (en mm)

        // Altura estimada de elementos
        const headerHeight = 40;
        const productTotalsHeight = 30;
        const routeHeaderHeight = 15;
        const tableRowHeight = 8;
        const tableHeaderHeight = 10;

        // Agregar header y totales a la primera página
        if (clientsByRoute.length > 0) {
            currentPageHeight = headerHeight + productTotalsHeight;
        }

        for (const { route, clients } of clientsByRoute) {
            // Calcular altura de esta tabla
            const tableHeight = routeHeaderHeight + tableHeaderHeight + (clients.length * tableRowHeight);

            // Si esta tabla no cabe en la página actual, crear nueva página
            if (currentPageHeight + tableHeight > maxPageHeight && currentPage.length > 0) {
                pages.push([...currentPage]);
                currentPage = [];
                currentPageHeight = 0;
            }

            // Agregar la tabla a la página actual
            currentPage.push({ type: 'route', route, clients });
            currentPageHeight += tableHeight;
        }

        // Agregar la última página si tiene contenido
        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        return pages;
    };

    const pages = paginateContent();

    return (
        <Document>
            {pages.map((pageData, index) =>
                createPageContent(pageData, index + 1, pages.length)
            )}
        </Document>
    );
};

export default CategoryNotebookPDF;
