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
        padding: 8,
        fontFamily: 'Helvetica',
        fontSize: 11,
    },
    header: {
        textAlign: 'center',
        marginBottom: 8,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#000000',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#374151',
    },
    date: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 2,
    },
    category: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 5,
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
        minHeight: 22,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
    },
    tableCell: {
        padding: 2,
        fontSize: 11,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeader: {
        padding: 2,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    clientCell: {
        padding: 2,
        fontSize: 11,
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 2,
        backgroundColor: '#f3f4f6',
        color: '#000000',
    },
    productTotals: {
        backgroundColor: '#dbeafe',
        padding: 3,
        marginBottom: 5,
        borderRadius: 3,
    },
    productTotalsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#1e40af',
    },
    productTotalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
    },
    productTotalItem: {
        backgroundColor: '#ffffff',
        padding: 2,
        borderRadius: 3,
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
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af',
    },
    routeTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 3,
        marginBottom: 3,
        color: '#374151',
    },
    // Estilos para el footer de página
    pageFooter: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        textAlign: 'center',
        fontSize: 9,
        color: '#6b7280',
        borderTop: '1 solid #e5e7eb',
        paddingTop: 4,
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
    // Obtener productos de la categoría seleccionada que tienen pedidos
    const getProductsWithOrders = () => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            if (!category) return [];

            // Filtrar solo productos que tienen pedidos
            const filteredProducts = category.products.filter(product => {
                const total = getTotalForProduct(product.id, selectedCategory);
                console.log(`Producto ${product.name}: total = ${total}`);
                return total > 0;
            });

            console.log('Productos con pedidos:', filteredProducts.map(p => p.name));
            return filteredProducts;
        }
        return [];
    };

    const categoryProducts = getProductsWithOrders();

    // Debug: Verificar que el filtrado funciona
    console.log('Productos filtrados:', categoryProducts.length, 'de',
        selectedCategory ? productCategories.find(cat => cat.name === selectedCategory)?.products.length || 0 : 0);

    // Obtener clientes con órdenes
    const clientsWithOrders = getClientsWithOrders(selectedCategory);

    // Agrupar clientes por ruta
    const clientsByRoute = routes.map(route => ({
        route,
        clients: clientsWithOrders.filter(client => client.routeId === route.id)
    })).filter(group => group.clients.length > 0);

    // Función para obtener estilos dinámicos según el número de columnas
    const getDynamicStyles = (numColumns: number) => {
        const baseFontSize = numColumns > 6 ? 8 : 11;
        const headerFontSize = numColumns > 6 ? 7 : 10;

        return {
            tableCell: {
                padding: 2,
                fontSize: baseFontSize,
                textAlign: 'center' as const,
                borderRightWidth: 1,
                borderRightColor: '#d1d5db',
                flex: 1,
                color: '#000000',
            },
            tableCellHeader: {
                padding: 2,
                fontSize: headerFontSize,
                fontWeight: 'bold' as const,
                textAlign: 'center' as const,
                borderRightWidth: 1,
                borderRightColor: '#d1d5db',
                flex: 1,
                color: '#000000',
            },
            clientCell: {
                padding: 2,
                fontSize: baseFontSize,
                textAlign: 'left' as const,
                borderRightWidth: 1,
                borderRightColor: '#d1d5db',
                flex: 2,
                backgroundColor: '#f3f4f6',
                color: '#000000',
            },
        };
    };

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
                            const dynamicStyles = getDynamicStyles(categoryProducts.length);
                            return (
                                <View key={product.id} style={styles.productTotalItem}>
                                    <Text style={{
                                        ...styles.productName,
                                        fontSize: categoryProducts.length > 6 ? 6 : 8
                                    }}>{product.name}</Text>
                                    <Text style={{
                                        ...styles.productQuantity,
                                        fontSize: categoryProducts.length > 6 ? 8 : 12
                                    }}>{total}</Text>
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
                    const dynamicStyles = getDynamicStyles(categoryProducts.length);

                    return (
                        <View key={route.id} style={styles.section}>
                            <Text style={styles.routeTitle}>
                                {route.nombre} - {route.identificador}
                            </Text>

                            <View style={styles.table}>
                                {/* Header de la tabla */}
                                <View style={[styles.tableRow, styles.tableHeader]}>
                                    <Text style={dynamicStyles.clientCell}>CLIENTES</Text>
                                    {categoryProducts.map((product) => (
                                        <Text key={product.id} style={dynamicStyles.tableCellHeader}>
                                            {product.name}
                                        </Text>
                                    ))}
                                </View>

                                {/* Filas de clientes */}
                                {clients.map((client: Client) => (
                                    <View key={client.id} style={styles.tableRow}>
                                        <Text style={dynamicStyles.clientCell}>
                                            {client.nombre}
                                        </Text>
                                        {categoryProducts.map((product) => {
                                            const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                            return (
                                                <Text key={product.id} style={dynamicStyles.tableCell}>
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
                <Text style={{ fontSize: 6, color: '#999', marginTop: 2 }}>
                    ✓ Formato A5 optimizado - Sin tablas cortadas
                </Text>
            </View>
        </Page>
    );

    // Función para dividir el contenido en páginas
    // OPTIMIZADO: Balance entre no cortar tablas y aprovechar máximo espacio
    const paginateContent = () => {
        const pages = [];
        let currentPage = [];
        let currentPageHeight = 0;
        const maxPageHeight = 200; // OPTIMIZADO: Balance entre seguridad y aprovechamiento

        // Altura estimada de elementos (OPTIMIZADA para máximo aprovechamiento)
        // Valores realistas pero con margen de seguridad mínimo
        const headerHeight = 35;
        const productTotalsHeight = 25;
        const routeHeaderHeight = 12;
        const tableRowHeight = 10;
        const tableHeaderHeight = 8;
        const marginBuffer = 10; // Buffer OPTIMIZADO para máximo aprovechamiento

        // Agregar header y totales a la primera página
        if (clientsByRoute.length > 0) {
            currentPageHeight = headerHeight + productTotalsHeight + marginBuffer;
        }

        // Agrupar tablas pequeñas para mejor distribución
        const groupedRoutes = [];
        let currentGroup = [];
        let currentGroupHeight = 0;

        for (const { route, clients } of clientsByRoute) {
            const tableHeight = routeHeaderHeight + tableHeaderHeight + (clients.length * tableRowHeight) + marginBuffer;

            // Si la tabla es pequeña (menos de 70mm) y hay espacio, agruparla
            if (tableHeight < 70 && currentGroupHeight + tableHeight < 120) {
                currentGroup.push({ route, clients, tableHeight });
                currentGroupHeight += tableHeight;
            } else {
                // Si hay un grupo pendiente, agregarlo
                if (currentGroup.length > 0) {
                    groupedRoutes.push({ type: 'group', tables: [...currentGroup] });
                    currentGroup = [];
                    currentGroupHeight = 0;
                }

                // Si la tabla es grande, agregarla sola
                if (tableHeight >= 70) {
                    groupedRoutes.push({ type: 'single', route, clients, tableHeight });
                } else {
                    // Iniciar nuevo grupo con esta tabla pequeña
                    currentGroup.push({ route, clients, tableHeight });
                    currentGroupHeight = tableHeight;
                }
            }
        }

        // Agregar el último grupo si existe
        if (currentGroup.length > 0) {
            groupedRoutes.push({ type: 'group', tables: currentGroup });
        }

        // Distribuir en páginas con lógica optimizada para aprovechar máximo espacio
        for (const item of groupedRoutes) {
            if (item.type === 'group' && item.tables) {
                // Calcular altura total del grupo
                const groupHeight = item.tables.reduce((sum, table) => sum + table.tableHeight, 0);

                // Verificar si el grupo cabe en la página actual
                if (currentPageHeight + groupHeight > maxPageHeight && currentPage.length > 0) {
                    // Crear nueva página solo si realmente no cabe
                    pages.push([...currentPage]);
                    currentPage = [];
                    currentPageHeight = 0;
                    console.log(`🔄 Nueva página creada - Grupo no cabía (altura: ${groupHeight}, límite: ${maxPageHeight})`);
                }

                // Agregar todas las tablas del grupo
                item.tables.forEach(table => {
                    currentPage.push({ type: 'route', route: table.route, clients: table.clients });
                });
                currentPageHeight += groupHeight;

                console.log(`✅ Grupo de ${item.tables.length} tablas pequeñas agregado - altura total: ${groupHeight}, página actual: ${currentPageHeight}/${maxPageHeight}`);
            } else if (item.type === 'single' && item.tableHeight !== undefined) {
                // Tabla individual - verificar si cabe completamente
                if (currentPageHeight + item.tableHeight > maxPageHeight && currentPage.length > 0) {
                    // Crear nueva página solo si la tabla no cabe completamente
                    pages.push([...currentPage]);
                    currentPage = [];
                    currentPageHeight = 0;
                    console.log(`🔄 Nueva página creada - Tabla individual no cabía completamente (altura: ${item.tableHeight}, límite: ${maxPageHeight})`);
                }

                currentPage.push({ type: 'route', route: item.route, clients: item.clients });
                currentPageHeight += item.tableHeight;

                console.log(`✅ Tabla individual ${item.route.nombre} agregada - altura: ${item.tableHeight}, página actual: ${currentPageHeight}/${maxPageHeight}`);
            }
        }

        // Agregar la última página si tiene contenido
        if (currentPage.length > 0) {
            pages.push(currentPage);
            console.log(`📄 Página final agregada con ${currentPage.length} elementos`);
        }

        // Optimización final: verificar si se puede aprovechar mejor el espacio
        console.log(`📊 Total de páginas generadas: ${pages.length}`);

        // Mostrar estadísticas de uso de espacio por página y sugerir optimizaciones
        pages.forEach((page, index) => {
            const pageHeight = page.reduce((sum, item) => {
                if (item.type === 'route') {
                    const clients = item.clients;
                    return sum + routeHeaderHeight + tableHeaderHeight + (clients.length * tableRowHeight) + marginBuffer;
                }
                return sum;
            }, headerHeight + productTotalsHeight + marginBuffer);

            const spaceUsage = ((pageHeight / maxPageHeight) * 100).toFixed(1);
            const remainingSpace = maxPageHeight - pageHeight;

            console.log(`📄 Página ${index + 1}: ${spaceUsage}% de espacio utilizado (${pageHeight}/${maxPageHeight})`);

            // Sugerir optimizaciones si hay mucho espacio desperdiciado
            if (remainingSpace > 50) {
                console.log(`💡 Página ${index + 1}: Se desperdician ${remainingSpace}mm - Podría caber 1-2 tablas pequeñas más`);
            } else if (remainingSpace > 30) {
                console.log(`💡 Página ${index + 1}: Se desperdician ${remainingSpace}mm - Podría caber 1 tabla pequeña más`);
            }
        });

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
