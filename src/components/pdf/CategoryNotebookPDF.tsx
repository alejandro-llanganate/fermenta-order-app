import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ProductCategory, Route, Client, Product } from '@/types/routeNotebook';
import { generateMainTitle } from '@/utils/dateUtils';
import { getCategoryPDFStyles } from '@/utils/categoryColors';
import { getOptimizedTableText } from '@/utils/textHandling';

// Registrar fuentes (opcional - usar fuentes del sistema)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
    ]
});

// Estilos para el PDF A4 - RF-23: A4 con tipografía 10pt/12pt
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 10, // Aumentado para A4
        fontFamily: 'Helvetica',
        fontSize: 10, // RF-23: Contenido general 10pt
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 6,
    },
    title: {
        fontSize: 12, // RF-23: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000000',
    },
    subtitle: {
        fontSize: 12, // RF-23: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#374151',
    },
    date: {
        fontSize: 10, // RF-23: Contenido general 10pt
        color: '#6b7280',
        marginBottom: 2,
    },
    category: {
        fontSize: 10, // RF-23: Contenido general 10pt
        color: '#6b7280',
        marginBottom: 6,
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12, // RF-23: Encabezados 12pt
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
        minHeight: 20, // Ajustado para A4
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
    },
    tableCell: {
        padding: 3, // Aumentado para A4
        fontSize: 10, // RF-23: Contenido general 10pt
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeader: {
        padding: 3, // Aumentado para A4
        fontSize: 10, // RF-23: Contenido general 10pt
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeaderNaranja: {
        padding: 3, // Aumentado para A4
        fontSize: 10, // RF-23: Contenido general 10pt
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#dc2626', // Rojo para naranja
    },
    clientCell: {
        padding: 3, // Aumentado para A4
        fontSize: 10, // RF-23: Contenido general 10pt
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 2,
        backgroundColor: '#f3f4f6',
        color: '#000000',
    },
    productTotals: {
        backgroundColor: '#dbeafe',
        padding: 4,
        marginBottom: 8,
        borderRadius: 4,
    },
    productTotalsTitle: {
        fontSize: 12, // RF-23: Encabezados 12pt
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
        fontSize: 10, // RF-23: Contenido general 10pt
        fontWeight: 'bold',
        color: '#1e40af',
    },
    routeTitle: {
        fontSize: 12, // RF-23: Encabezados 12pt
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 4,
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
        fontSize: 9,
        color: '#6b7280',
        borderTop: '1 solid #e5e7eb',
        paddingTop: 4,
    },
    categoryTotals: {
        backgroundColor: '#f3f4f6',
        padding: 6,
        marginTop: 10,
        borderRadius: 4,
    },
    categoryTotalsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 6,
    },
    categoryTotalItem: {
        alignItems: 'center',
    },
    categoryTotalLabel: {
        fontSize: 10, // RF-23: Contenido general 10pt
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 2,
    },
    categoryTotalValue: {
        fontSize: 10, // RF-23: Contenido general 10pt
        fontWeight: 'bold',
        color: '#1e40af',
    },
    finalTotal: {
        backgroundColor: '#dbeafe',
        padding: 8,
        marginTop: 10,
        borderRadius: 4,
        border: '1 solid #93c5fd',
    },
    finalTotalTitle: {
        fontSize: 12, // RF-23: Encabezados 12pt
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1e40af',
        textAlign: 'center',
    },
    finalTotalContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    finalTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e40af',
    },
    productGroup: {
        marginBottom: 8,
        padding: 4,
        backgroundColor: '#f8fafc',
        borderRadius: 3,
    },
    productGroupTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 4,
        textAlign: 'center',
        backgroundColor: '#dbeafe',
        padding: 2,
        borderRadius: 2,
    },
    productTotalSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        padding: 3,
        marginTop: 2,
        borderRadius: 2,
        borderTop: '1 solid #93c5fd',
    },
    productTotalSummaryLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e40af',
    },
    productTotalSummaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af',
    },
    finalTotalTable: {
        marginTop: 5,
    },
    finalTotalRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    finalTotalHeaderCell: {
        flex: 1,
        backgroundColor: '#fed7aa',
        padding: 3,
        border: '1 solid #f97316',
        alignItems: 'center',
    },
    finalTotalProductHeader: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#92400e',
        textAlign: 'center',
    },
    finalTotalProductHeaderNaranja: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#dc2626', // Rojo más intenso para naranja
        textAlign: 'center',
    },
    finalTotalDataCell: {
        flex: 1,
        backgroundColor: '#ffedd5',
        padding: 3,
        border: '1 solid #f97316',
        alignItems: 'center',
    },
    finalTotalProductData: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ea580c',
        textAlign: 'center',
    },
    finalTotalConsolidatedCell: {
        flex: 1,
        backgroundColor: '#dbeafe',
        padding: 4,
        border: '1 solid #3b82f6',
        alignItems: 'center',
    },
    finalTotalConsolidatedValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e40af',
        textAlign: 'center',
    },
    finalTotalSubtotalCell: {
        flex: 1,
        backgroundColor: '#fed7aa',
        padding: 3,
        border: '1 solid #f97316',
        alignItems: 'center',
    },
    finalTotalSubtotalContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    finalTotalSubtotalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#92400e',
    },
    finalTotalSubtotalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ea580c',
    },
});

interface CategoryNotebookPDFProps {
    selectedDate: Date;
    selectedCategory: string;
    dateFilterType: 'registration' | 'delivery';
    productCategories: ProductCategory[];
    routes: Route[];
    getClientsWithOrders: (categoryId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForCategory: (categoryId: string) => { quantity: number; amount: number };
    fontSizeConfig?: {
        titles: number;
        headers: number;
        cells: number;
    };
}

const CategoryNotebookPDF: React.FC<CategoryNotebookPDFProps> = ({
    selectedDate,
    selectedCategory,
    dateFilterType,
    productCategories,
    routes,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForCategory,
    fontSizeConfig = { titles: 14, headers: 12, cells: 11 },
}) => {
    // Obtener productos de la categoría seleccionada que tienen pedidos
    const getProductsWithOrders = () => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            if (!category) return [];

            // Filtrar solo productos que tienen pedidos para Pasteles y Donuts
            if (selectedCategory.toLowerCase() === 'pasteles' || selectedCategory.toLowerCase() === 'donuts') {
                const filteredProducts = category.products.filter(product => {
                    const total = getTotalForProduct(product.id, selectedCategory);
                    console.log(`Producto ${product.name}: total = ${total}`);
                    return total > 0;
                });

                console.log('Productos con pedidos:', filteredProducts.map(p => p.name));
                return filteredProducts;
            }

            // Para otras categorías, mostrar todos los productos
            return category.products;
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
    const clientsByRoute = routes.map(route => {
        const routeClients = clientsWithOrders.filter(client => client.routeId === route.id);

        // Filtrar clientes que tienen al menos un pedido > 0 en la categoría seleccionada
        const filteredClients = routeClients.filter(client => {
            const clientTotal = getTotalForClient(client.id);
            return clientTotal.quantity > 0;
        });

        return {
            route,
            clients: filteredClients
        };
    }).filter(group => group.clients.length > 0);

    // Función para obtener estilos dinámicos según la configuración de tamaños
    const getDynamicStyles = (columnCount?: number, isFirstTable: boolean = false) => {
        let baseFontSize = 10; // RF-23: Contenido general 10pt
        let headerFontSize = 12; // RF-23: Encabezados 12pt
        let titleFontSize = 12; // RF-23: Encabezados 12pt

        // Ajuste especial para DONUTS
        if (selectedCategory.toLowerCase() === 'donuts') {
            if (isFirstTable) {
                // Primera tabla más pequeña por defecto
                baseFontSize = 8;
                headerFontSize = 9;
                titleFontSize = 10;
            } else if (columnCount) {
                // Ajustar según número de columnas
                if (columnCount > 8) {
                    baseFontSize = 7;
                    headerFontSize = 8;
                    titleFontSize = 9;
                } else if (columnCount > 6) {
                    baseFontSize = 8;
                    headerFontSize = 9;
                    titleFontSize = 10;
                } else if (columnCount > 4) {
                    baseFontSize = 9;
                    headerFontSize = 10;
                    titleFontSize = 11;
                }
            }
        }

        return {
            tableCell: {
                padding: 3, // Aumentado para A4
                fontSize: baseFontSize,
                textAlign: 'center' as const,
                borderRightWidth: 1,
                borderRightColor: '#d1d5db',
                flex: 1,
                color: '#000000',
            },
            tableCellHeader: {
                padding: 3, // Aumentado para A4
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
            titleText: {
                fontSize: titleFontSize,
                fontWeight: 'bold' as const,
                marginBottom: 3,
                color: '#000000',
            },
            subtitleText: {
                fontSize: headerFontSize,
                fontWeight: 'bold' as const,
                marginBottom: 2,
                color: '#374151',
            },
            dateText: {
                fontSize: baseFontSize,
                color: '#6b7280',
                marginBottom: 2,
            },
            categoryText: {
                fontSize: baseFontSize,
                color: '#6b7280',
                marginBottom: 5,
            },
            // Propiedades adicionales para compatibilidad
            cells: {
                fontSize: baseFontSize,
            },
            headers: {
                fontSize: headerFontSize,
            },
        };
    };

    // Calcular totales por tipo para Pasteles
    const getTotalsByType = (): { chocolate: number; naranja: number } => {
        if (selectedCategory.toLowerCase() !== 'pasteles') {
            return { chocolate: 0, naranja: 0 };
        }

        let chocolateTotal = 0;
        let naranjaTotal = 0;

        categoryProducts.forEach(product => {
            const total = getTotalForProduct(product.id, selectedCategory);

            // Identificar productos de chocolate y naranja por nombre
            const productName = product.name.toLowerCase();
            if (productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate')) {
                chocolateTotal += total;
            } else if (productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange')) {
                naranjaTotal += total;
            }
        });

        return { chocolate: chocolateTotal, naranja: naranjaTotal };
    };

    const totalsByType = getTotalsByType();

    // Usar categoryProducts que ya están filtrados por getProductsWithOrders() anterior
    const filteredProducts = categoryProducts;

    // Función para obtener productos con valores > 0 para las tablas por ruta
    const getProductsWithValues = (clients: any[]) => {
        if (selectedCategory.toLowerCase() !== 'pasteles' && selectedCategory.toLowerCase() !== 'donuts') {
            return filteredProducts;
        }

        return filteredProducts.filter(product => {
            // Verificar si al menos un cliente tiene cantidad > 0 para este producto
            return clients.some(client => {
                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                return quantity > 0;
            });
        });
    };

    // Función para calcular el contenido de una página
    const createPageContent = (pageData: any[], pageNumber: number, totalPages: number) => {
        // Calcular el número máximo de columnas en esta página
        let maxColumns = 0;
        let isFirstTable = pageNumber === 1;

        pageData.forEach(item => {
            if (item.type === 'route' && item.clients) {
                const columnCount = getProductsWithValues(item.clients).length;
                maxColumns = Math.max(maxColumns, columnCount);
            }
        });

        const dynamicStyles = getDynamicStyles(maxColumns, isFirstTable);

        // Configurar tamaño y orientación según la categoría
        const pageSize = selectedCategory.toLowerCase() === 'donuts' ? 'A5' : 'A4';
        const pageOrientation = selectedCategory.toLowerCase() === 'donuts' ? 'landscape' : 'portrait';

        return (
            <Page key={pageNumber} size={pageSize} orientation={pageOrientation} style={styles.page}>
                {/* Header solo en la primera página - RF-18: Encabezado en negro con fecha subrayada */}
                {pageNumber === 1 && (
                    <View style={styles.header}>
                        <Text style={[dynamicStyles.titleText, { color: '#000000' }]}>
                            {generateMainTitle(selectedDate, selectedCategory)}
                        </Text>
                        <Text style={[dynamicStyles.dateText, { color: '#000000', textDecoration: 'underline' }]}>
                            FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                        </Text>
                    </View>
                )}

                {/* Bloque de TOTAL para Pasteles - AL INICIO */}
                {pageNumber === 1 && selectedCategory.toLowerCase() === 'pasteles' && (
                    <View style={styles.finalTotal}>
                        <Text style={{
                            ...styles.finalTotalTitle,
                            fontSize: dynamicStyles.subtitleText.fontSize
                        }}>
                            TOTAL
                        </Text>

                        {/* Tabla de totales en columnas */}
                        <View style={styles.finalTotalTable}>
                            {/* Headers de productos */}
                            <View style={styles.finalTotalRow}>
                                {/* Headers Chocolate */}
                                {filteredProducts
                                    .filter(product => {
                                        const productName = product.name.toLowerCase();
                                        return productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate');
                                    })
                                    .map(product => {
                                        // Usar la nueva estrategia de manejo de texto
                                        const textOptimization = getOptimizedTableText(
                                            product.name,
                                            selectedCategory,
                                            { maxLength: 10, maxWords: 2 }
                                        );

                                        return (
                                            <View key={product.id} style={styles.finalTotalHeaderCell}>
                                                <Text style={styles.finalTotalProductHeader}>
                                                    {textOptimization.displayText}
                                                </Text>
                                            </View>
                                        );
                                    })}

                                {/* Headers Naranja */}
                                {filteredProducts
                                    .filter(product => {
                                        const productName = product.name.toLowerCase();
                                        return productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');
                                    })
                                    .map(product => {
                                        // Usar la nueva estrategia de manejo de texto
                                        const textOptimization = getOptimizedTableText(
                                            product.name,
                                            selectedCategory,
                                            { maxLength: 10, maxWords: 2 }
                                        );

                                        return (
                                            <View key={product.id} style={styles.finalTotalHeaderCell}>
                                                <Text style={styles.finalTotalProductHeaderNaranja}>
                                                    {textOptimization.displayText}
                                                </Text>
                                            </View>
                                        );
                                    })}
                            </View>

                            {/* Fila de datos */}
                            <View style={styles.finalTotalRow}>
                                {/* Datos Chocolate */}
                                {filteredProducts
                                    .filter(product => {
                                        const productName = product.name.toLowerCase();
                                        return productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate');
                                    })
                                    .map(product => {
                                        const total = getTotalForProduct(product.id, selectedCategory);
                                        return (
                                            <View key={product.id} style={styles.finalTotalDataCell}>
                                                <Text style={styles.finalTotalProductData}>
                                                    {total}
                                                </Text>
                                            </View>
                                        );
                                    })}

                                {/* Datos Naranja */}
                                {filteredProducts
                                    .filter(product => {
                                        const productName = product.name.toLowerCase();
                                        return productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');
                                    })
                                    .map(product => {
                                        const total = getTotalForProduct(product.id, selectedCategory);
                                        return (
                                            <View key={product.id} style={styles.finalTotalDataCell}>
                                                <Text style={styles.finalTotalProductData}>
                                                    {total}
                                                </Text>
                                            </View>
                                        );
                                    })}
                            </View>

                            {/* Fila de separadores y subtotales */}
                            <View style={styles.finalTotalRow}>
                                {/* Separador y subtotal Chocolate */}
                                <View style={styles.finalTotalSubtotalCell}>
                                    <View style={styles.finalTotalSubtotalContent}>
                                        <Text style={styles.finalTotalSubtotalLabel}>CHOCOLATE</Text>
                                        <Text style={styles.finalTotalSubtotalValue}>{totalsByType.chocolate}</Text>
                                    </View>
                                </View>

                                {/* Separador y subtotal Naranja */}
                                <View style={styles.finalTotalSubtotalCell}>
                                    <View style={styles.finalTotalSubtotalContent}>
                                        <Text style={styles.finalTotalSubtotalLabel}>NARANJA</Text>
                                        <Text style={styles.finalTotalSubtotalValue}>{totalsByType.naranja}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Fila de total consolidado */}
                            <View style={styles.finalTotalRow}>
                                <View style={styles.finalTotalConsolidatedCell}>
                                    <Text style={styles.finalTotalConsolidatedValue}>
                                        TOTAL GENERAL: {totalsByType.chocolate + totalsByType.naranja}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Totales por producto para otras categorías - RF-18: Colores de categoría */}
                {pageNumber === 1 && selectedCategory && selectedCategory.toLowerCase() !== 'pasteles' && (
                    <View style={[styles.productTotals, getCategoryPDFStyles(selectedCategory)]}>
                        <Text style={{
                            ...styles.productTotalsTitle,
                            fontSize: dynamicStyles.subtitleText.fontSize,
                            color: '#000000'
                        }}>
                            TOTALES POR PRODUCTO - {selectedCategory}
                        </Text>
                        <View style={styles.productTotalsGrid}>
                            {filteredProducts.map((product) => {
                                const total = getTotalForProduct(product.id, selectedCategory);
                                return (
                                    <View key={product.id} style={styles.productTotalItem}>
                                        <Text style={{
                                            ...styles.productName,
                                            fontSize: dynamicStyles.tableCell.fontSize,
                                            color: '#000000'
                                        }}>{product.name}</Text>
                                        <Text style={{
                                            ...styles.productQuantity,
                                            fontSize: dynamicStyles.tableCellHeader.fontSize,
                                            color: '#000000'
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

                        return (
                            <View key={route.id} style={styles.section}>
                                <Text style={{
                                    ...styles.routeTitle,
                                    fontSize: dynamicStyles.subtitleText.fontSize
                                }}>
                                    {route.nombre} - {route.identificador}
                                </Text>

                                <View style={styles.table}>
                                    {/* Header de la tabla */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={dynamicStyles.clientCell}>CLIENTES</Text>
                                        {getProductsWithValues(clients).map((product) => {
                                            // Usar la nueva estrategia de manejo de texto
                                            const textOptimization = getOptimizedTableText(
                                                product.name,
                                                selectedCategory,
                                                { maxLength: 12, maxWords: 2 }
                                            );

                                            // Determinar si es un producto de naranja
                                            const productName = product.name.toLowerCase();
                                            const isNaranja = productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');

                                            return (
                                                <Text key={product.id} style={isNaranja ? styles.tableCellHeaderNaranja : dynamicStyles.tableCellHeader}>
                                                    {textOptimization.displayText}
                                                </Text>
                                            );
                                        })}
                                    </View>

                                    {/* Filas de clientes */}
                                    {clients.map((client: Client) => (
                                        <View key={client.id} style={styles.tableRow}>
                                            <Text style={dynamicStyles.clientCell}>
                                                {client.nombre}
                                            </Text>
                                            {getProductsWithValues(clients).map((product) => {
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
                    <Text style={{ fontSize: dynamicStyles.tableCell.fontSize }}>
                        MEGA DONUT - Sistema de Gestión de Pedidos por Categorías |
                        Página {pageNumber} de {totalPages} |
                        Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                    </Text>
                    <Text style={{ fontSize: 6, color: '#999', marginTop: 2 }}>
                        ✓ Formato A4 optimizado - RF-23: Tipografía 10pt/12pt
                    </Text>
                </View>
            </Page>
        );
    };

    // Función para dividir el contenido en páginas
    // OPTIMIZADO: Balance entre no cortar tablas y aprovechar máximo espacio
    const paginateContent = () => {
        const pages: any[][] = [];
        let currentPage: any[] = [];
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
        const groupedRoutes: any[] = [];
        let currentGroup: any[] = [];
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
        // Para DONUTS: cada tabla debe aparecer máximo en una hoja
        const isDonuts = selectedCategory.toLowerCase() === 'donuts';

        for (const item of groupedRoutes) {
            if (item.type === 'group' && item.tables) {
                // Calcular altura total del grupo
                const groupHeight = item.tables.reduce((sum: number, table: any) => sum + table.tableHeight, 0);

                // Para DONUTS: cada tabla del grupo debe ir en su propia página
                if (isDonuts) {
                    // Agregar cada tabla del grupo en su propia página
                    item.tables.forEach((table: any, index: number) => {
                        // Si no es la primera tabla del grupo, crear nueva página
                        if (index > 0 || currentPage.length > 0) {
                            pages.push([...currentPage]);
                            currentPage = [];
                            currentPageHeight = 0;
                        }

                        currentPage.push({ type: 'route', route: table.route, clients: table.clients });
                        currentPageHeight = table.tableHeight;

                        console.log(`🍩 DONUTS: Tabla individual en página separada - altura: ${table.tableHeight}`);
                    });
                } else {
                    // Lógica original para otras categorías
                    // Verificar si el grupo cabe en la página actual
                    if (currentPageHeight + groupHeight > maxPageHeight && currentPage.length > 0) {
                        // Crear nueva página solo si realmente no cabe
                        pages.push([...currentPage]);
                        currentPage = [];
                        currentPageHeight = 0;
                        console.log(`🔄 Nueva página creada - Grupo no cabía (altura: ${groupHeight}, límite: ${maxPageHeight})`);
                    }

                    // Agregar todas las tablas del grupo
                    item.tables.forEach((table: any) => {
                        currentPage.push({ type: 'route', route: table.route, clients: table.clients });
                    });
                    currentPageHeight += groupHeight;

                    console.log(`✅ Grupo de ${item.tables.length} tablas pequeñas agregado - altura total: ${groupHeight}, página actual: ${currentPageHeight}/${maxPageHeight}`);
                }
            } else if (item.type === 'single' && item.tableHeight !== undefined) {
                // Para DONUTS: cada tabla individual debe ir en su propia página
                if (isDonuts) {
                    // Crear nueva página para cada tabla individual
                    if (currentPage.length > 0) {
                        pages.push([...currentPage]);
                        currentPage = [];
                        currentPageHeight = 0;
                    }

                    currentPage.push({ type: 'route', route: item.route, clients: item.clients });
                    currentPageHeight = item.tableHeight;

                    console.log(`🍩 DONUTS: Tabla individual en página separada - altura: ${item.tableHeight}`);
                } else {
                    // Lógica original para otras categorías
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
