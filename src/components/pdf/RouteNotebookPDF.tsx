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
        padding: 8, // Más reducido para evitar sobrepasar
        fontFamily: 'Helvetica',
        fontSize: 9, // Reducido de 10 a 9
    },
    header: {
        textAlign: 'center',
        marginBottom: 10,
        borderBottom: '1 solid #e5e7eb',
        paddingBottom: 6,
    },
    title: {
        fontSize: 11, // Reducido de 12 a 11
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000000',
    },
    subtitle: {
        fontSize: 11, // Reducido de 12 a 11
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#374151',
    },
    date: {
        fontSize: 9, // Reducido de 10 a 9
        color: '#6b7280',
        marginBottom: 2,
    },
    route: {
        fontSize: 9, // Reducido de 10 a 9
        color: '#6b7280',
        marginBottom: 6,
    },
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 11, // Reducido de 12 a 11
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
        minHeight: 18, // Más reducido para evitar sobrepasar
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 7, // Reducido de 8 a 7
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellNaranja: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 7, // Reducido de 8 a 7
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#fed7aa', // Fondo naranja claro
        color: '#ea580c', // Texto naranja oscuro
    },
    tableCellHeader: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 5, // Reducido de 6 a 5
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    tableCellHeaderVertical: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 5, // Reducido de 6 a 5
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
        lineHeight: 1.0, // Más compacto
    },
    tableCellHeaderNaranja: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 5, // Reducido de 6 a 5
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#fed7aa', // Fondo naranja claro
        color: '#ea580c', // Texto naranja oscuro
    },
    tableCellHeaderNaranjaVertical: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 5, // Reducido de 6 a 5
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#fed7aa', // Fondo naranja claro
        color: '#ea580c', // Texto naranja oscuro
        lineHeight: 1.0, // Más compacto
    },
    clientCell: {
        padding: 2, // Más reducido para columnas pequeñas
        fontSize: 7, // Reducido de 8 a 7
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 2,
        color: '#000000',
    },
    productCell: {
        padding: 3, // Reducido para A4
        fontSize: 9, // Reducido de 10 a 9
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 3,
        color: '#000000',
    },
    quantityCell: {
        padding: 3, // Reducido para A4
        fontSize: 9, // Reducido de 10 a 9
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        color: '#000000',
    },
    totalCell: {
        padding: 4,
        fontSize: 9, // Reducido de 10 a 9
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        flex: 1,
        backgroundColor: '#f3f4f6',
        color: '#000000',
    },
    routeTitle: {
        fontSize: 11, // Reducido de 12 a 11
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
        fontSize: 7, // Reducido de 8 a 7
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
        fontSize: 11, // Reducido de 12 a 11
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
        fontSize: 9, // Reducido de 10 a 9
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
    isVerticalText?: boolean;
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
    isVerticalText = false,
}) => {
    // Función para convertir texto en letras verticales (una letra por línea)
    const renderVerticalText = (text: string) => {
        if (!isVerticalText) {
            return text;
        }

        // Validar que el texto no esté vacío
        if (!text || text.trim() === '') {
            return (
                <Text style={{ fontSize: 5, lineHeight: 1.0 }}>
                    &nbsp;
                </Text>
            );
        }

        // Dividir el texto en caracteres y crear elementos Text separados
        return text.split('').map((char, index) => (
            <Text key={index} style={{ fontSize: 5, lineHeight: 1.0 }}>
                {char}
            </Text>
        ));
    };

    // Función para dividir texto horizontal con saltos de línea inteligentes
    const renderHorizontalText = (text: string) => {
        if (isVerticalText) {
            return text;
        }

        // Validar que el texto no esté vacío
        if (!text || text.trim() === '') {
            return (
                <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                    &nbsp;
                </Text>
            );
        }

        // Si el texto es muy largo, dividirlo en palabras y crear saltos de línea
        if (text.length > 8) {
            const words = text.split(' ');
            if (words.length > 1) {
                // Dividir en dos líneas si hay múltiples palabras
                const midPoint = Math.ceil(words.length / 2);
                const firstLine = words.slice(0, midPoint).join(' ');
                const secondLine = words.slice(midPoint).join(' ');

                return (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                            {firstLine}
                        </Text>
                        <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                            {secondLine}
                        </Text>
                    </View>
                );
            } else {
                // Para palabras muy largas, dividir por caracteres
                const midPoint = Math.ceil(text.length / 2);
                const firstPart = text.substring(0, midPoint);
                const secondPart = text.substring(midPoint);

                return (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                            {firstPart}
                        </Text>
                        <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                            {secondPart}
                        </Text>
                    </View>
                );
            }
        }

        // Para textos cortos, devolver como elemento Text
        return (
            <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                {text}
            </Text>
        );
    };
    // Obtener la ruta seleccionada
    const currentRoute = selectedRoute ? routes.find(r => r.id === selectedRoute) : null;

    // Usar directamente los productos filtrados que vienen del componente padre
    // (ya están filtrados para mostrar solo los que tienen cantidades > 0)
    // Filtrar adicionalmente para asegurar que tengan nombres válidos
    const filteredProducts = productCategories
        .flatMap(cat => cat.products)
        .filter(product => product && product.name && product.name.trim() !== '');

    // Usar directamente las categorías filtradas que vienen del componente padre
    // (ya están filtradas para mostrar solo las que tienen productos con cantidades > 0)
    const filteredCategories = productCategories;

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
        columnas: filteredProducts.length + 1,
        textoVertical: isVerticalText
    });

    return (
        <Document>
            <Page size={pageSize} orientation="landscape" style={styles.page}>
                {/* Header - Encabezado simplificado */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: '#000000' }]}>
                        FECHA ({selectedDate.toLocaleDateString('es-ES')}) — {selectedRoute ? currentRoute?.nombre : 'TODAS LAS RUTAS'} - FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                    </Text>
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
                                {/* Tabla horizontal con productos como columnas */}
                                <View style={styles.table}>
                                    {/* Primera fila: Encabezados de categorías con colores */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={styles.clientCell}>CLIENTES</Text>
                                        {filteredCategories.map((category) => {
                                            // Usar directamente los productos de la categoría (ya están filtrados)
                                            const categoryColors = getCategoryPDFStyles(category.name);

                                            return (
                                                <Text
                                                    key={category.name}
                                                    style={[
                                                        styles.categoryHeader,
                                                        {
                                                            backgroundColor: categoryColors.backgroundColor,
                                                            color: categoryColors.color,
                                                            flex: category.products.length
                                                        }
                                                    ]}
                                                >
                                                    {category.name}
                                                </Text>
                                            );
                                        })}
                                    </View>

                                    {/* Segunda fila: Encabezados de productos con colores de categoría */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={styles.clientCell}>&nbsp;</Text>
                                        {filteredProducts.map((product) => {
                                            // Determinar si es un producto de naranja (misma lógica que tabla de totales)
                                            const productName = product.name.toLowerCase();
                                            const isNaranja = productName.includes('pastelnaranj') ||
                                                productName.includes('naranja') ||
                                                productName.includes('orange');

                                            // Encontrar la categoría del producto para obtener su color
                                            const productCategory = filteredCategories.find(cat =>
                                                cat.products.some(p => p.id === product.id)
                                            );
                                            const categoryColors = productCategory ? getCategoryPDFStyles(productCategory.name) : { backgroundColor: '#f9fafb', color: '#000000' };

                                            return (
                                                <View key={product.id} style={[
                                                    isNaranja
                                                        ? (isVerticalText ? styles.tableCellHeaderNaranjaVertical : styles.tableCellHeaderNaranja)
                                                        : (isVerticalText ? styles.tableCellHeaderVertical : styles.tableCellHeader),
                                                    !isNaranja ? {
                                                        backgroundColor: categoryColors.backgroundColor,
                                                        color: categoryColors.color
                                                    } : {}
                                                ]}>
                                                    {isVerticalText ? (
                                                        <View style={{ alignItems: 'center' }}>
                                                            {renderVerticalText(product.name)}
                                                        </View>
                                                    ) : (
                                                        <View style={{ alignItems: 'center' }}>
                                                            {renderHorizontalText(product.name)}
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {/* Filas de clientes */}
                                    {routeClients.map((client) => {
                                        return (
                                            <View key={client.id} style={styles.tableRow}>
                                                <Text style={styles.clientCell}>{client.nombre}</Text>
                                                {filteredProducts.map((product) => {
                                                    const quantity = getQuantityForClientAndProduct(client.id, product.id);

                                                    // Determinar si es un producto de naranja (misma lógica que tabla de totales)
                                                    const productName = product.name.toLowerCase();
                                                    const isNaranja = productName.includes('pastelnaranj') ||
                                                        productName.includes('naranja') ||
                                                        productName.includes('orange');

                                                    return (
                                                        <Text key={product.id} style={isNaranja ? styles.tableCellNaranja : styles.tableCell}>
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
