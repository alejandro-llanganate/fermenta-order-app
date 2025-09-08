import { Printer, Download, FileSpreadsheet } from 'lucide-react';
import { ProductCategory, Route } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CategoryNotebookPDF from './pdf/CategoryNotebookPDF';
import { exportToExcel } from '@/utils/excelExport';
import { useFontSize } from '@/contexts/FontSizeContext';
import FontSizeConfig from './FontSizeConfig';
import { generateMainTitle } from '@/utils/dateUtils';
import { getCategoryColors } from '@/utils/categoryColors';
import { getOptimizedTableText } from '@/utils/textHandling';

interface CategoryNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    isGeneratingPDF: boolean;
    selectedDate: Date;
    selectedCategory: string;
    dateFilterType: 'order' | 'delivery';
    productCategories: ProductCategory[];
    routes: Route[];
    getClientsWithOrders: (categoryId?: string) => any[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForCategory: (categoryId: string) => { quantity: number; amount: number };
    printRef: React.RefObject<HTMLDivElement>;
}

export default function CategoryNotebookPreview({
    showPreview,
    setShowPreview,
    generatePDF,
    isGeneratingPDF,
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
    printRef
}: CategoryNotebookPreviewProps) {
    const { getFontSizeClass, getFontSizeValue } = useFontSize();

    if (!showPreview) return null;

    // Obtener productos de la categoría seleccionada que tienen pedidos > 0
    const getCategoryProducts = (): any[] => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            if (!category) return [];

            // Filtrar solo productos que tienen pedidos > 0
            return category.products.filter(product => {
                const total = getTotalForProduct(product.id, selectedCategory);
                return total > 0;
            });
        }
        return [];
    };

    const categoryProducts = getCategoryProducts();

    // Obtener clientes por ruta para la categoría seleccionada
    const getClientsByRoute = (routeId: string): any[] => {
        const allClients = getClientsWithOrders(selectedCategory);
        const routeClients = allClients.filter((client: any) => client.routeId === routeId);

        // Filtrar clientes que tienen al menos un pedido > 0 en la categoría seleccionada
        return routeClients.filter((client: any) => {
            const clientTotal = getTotalForClient(client.id);
            return clientTotal.quantity > 0;
        });
    };

    // Función para exportar a Excel
    const handleExportToExcel = () => {
        const clientsByRoute = routes.map(route => ({
            route,
            clients: getClientsByRoute(route.id)
        })).filter(group => group.clients.length > 0);

        exportToExcel({
            selectedDate,
            selectedCategory,
            dateFilterType,
            categoryProducts: categoryProducts,
            clientsByRoute,
            getQuantityForClientAndProduct,
            getTotalForProduct,
            getTotalForCategory
        });
    };

    // Usar la función para obtener productos filtrados (ya filtrados en getCategoryProducts)
    const categoryProductsWithOrders = categoryProducts;

    // Función para paginar contenido (EXACTAMENTE IGUAL QUE EN PDF - Mismos cálculos y lógica)
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
        const allClients = getClientsWithOrders(selectedCategory);
        const clientsByRoute = routes.map(route => ({
            route,
            clients: allClients.filter((client: any) => client.routeId === route.id)
        })).filter(group => group.clients.length > 0);

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

        // Distribuir en páginas con lógica optimizada para aprovechar máximo espacio (IGUAL QUE PDF)
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
        }

        // Optimización final: verificar si se puede aprovechar mejor el espacio (IGUAL QUE PDF)
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

    // Filtrar productos que tienen pedidos para Pasteles y Donuts
    const getProductsWithOrders = () => {
        if (selectedCategory.toLowerCase() === 'pasteles' || selectedCategory.toLowerCase() === 'donuts') {
            return categoryProducts.filter(product => {
                const total = getTotalForProduct(product.id, selectedCategory);
                return total > 0;
            });
        }
        return categoryProducts;
    };

    const filteredProducts = getProductsWithOrders();

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h2 className={`font-semibold text-gray-900 ${getFontSizeClass('titles')}`}>Vista Previa A5 - MEGA DONUT PEDIDOS POR CATEGORÍAS</h2>
                            <FontSizeConfig />
                        </div>
                        <div className="flex items-center space-x-3">
                            <PDFDownloadLink
                                document={
                                    <CategoryNotebookPDF
                                        selectedDate={selectedDate}
                                        selectedCategory={selectedCategory}
                                        dateFilterType={dateFilterType}
                                        productCategories={productCategories}
                                        routes={routes}
                                        getClientsWithOrders={getClientsWithOrders}
                                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                                        getTotalForClient={getTotalForClient}
                                        getTotalForProduct={getTotalForProduct}
                                        getTotalForCategory={getTotalForCategory}
                                        fontSizeConfig={{
                                            titles: getFontSizeValue('titles'),
                                            headers: getFontSizeValue('headers'),
                                            cells: getFontSizeValue('cells'),
                                        }}
                                    />
                                }
                                fileName={`Mega-Donut-Categorias-${selectedCategory || 'Todas'}-${selectedDate.toLocaleDateString('es-ES')}.pdf`}
                                className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition-colors"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="h-3 w-3" />
                                        <span>{loading ? 'Generando PDF...' : 'Descargar PDF'}</span>
                                    </>
                                )}
                            </PDFDownloadLink>
                            <button
                                onClick={handleExportToExcel}
                                className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                                <FileSpreadsheet className="h-3 w-3" />
                                <span>Descargar Excel</span>
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-600 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* A5 Print Content - Vista previa paginada con líneas de separación */}
                <div
                    ref={printRef}
                    className={`p-2 ${selectedCategory.toLowerCase() === 'donuts'
                        ? 'max-w-[210mm] mx-auto' // A5 horizontal: 210mm x 148mm
                        : 'max-w-[210mm] mx-auto' // A4 vertical: 210mm x 297mm
                        }`}
                    style={{
                        ...(selectedCategory.toLowerCase() === 'donuts' && {
                            maxWidth: '210mm',
                            minHeight: '148mm',
                            transform: 'rotate(0deg)', // Mantener horizontal
                            writingMode: 'horizontal-tb'
                        })
                    }}
                >
                    {pages.map((pageData, pageIndex) => (
                        <div key={pageIndex} className="mb-8 relative">
                            {/* Línea de separación superior */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 opacity-60"></div>

                            {/* A5 Container - Formato condicional según categoría */}
                            <div
                                className="mx-auto bg-white border-2 border-red-400 relative"
                                style={{
                                    ...(selectedCategory.toLowerCase() === 'donuts'
                                        ? { width: '210mm', minHeight: '148mm', padding: '8mm' } // A5 horizontal
                                        : { width: '148mm', minHeight: '210mm', padding: '8mm' } // A5 vertical
                                    )
                                }}
                            >
                                {/* Líneas de separación A5 - Esquinas */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-500"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-500"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-500"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-500"></div>

                                {/* Línea de separación de página */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 opacity-80"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 opacity-80"></div>

                                {/* Indicador de página A5 */}
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                                    {selectedCategory.toLowerCase() === 'donuts' ? 'A5 Horizontal' : 'A5 Vertical'} - Página {pageIndex + 1}
                                </div>

                                <div className="space-y-2">
                                    {/* Header solo en la primera página - RF-18: Encabezado en negro con fecha subrayada */}
                                    {pageIndex === 0 && (
                                        <div className="text-center border-b border-gray-200 pb-2">
                                            <h1 className={`font-bold text-black ${getFontSizeClass('titles')}`}>
                                                {generateMainTitle(selectedDate, selectedCategory)}
                                            </h1>
                                            <p className={`text-black underline ${getFontSizeClass('cells')}`}>
                                                FILTRADO POR: {dateFilterType === 'order' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Totales por producto solo en la primera página - EXCLUYENDO Pasteles - RF-18: Colores de categoría */}
                                    {pageIndex === 0 && selectedCategory && selectedCategory.toLowerCase() !== 'pasteles' && (
                                        <div className={`rounded p-2 border mb-2 ${getCategoryColors(selectedCategory).backgroundColor} border-gray-300`}>
                                            <h3 className={`font-semibold mb-1 ${getFontSizeClass('headers')} ${getCategoryColors(selectedCategory).textColor}`}>
                                                TOTALES POR PRODUCTO - {selectedCategory}
                                            </h3>
                                            <div className="grid grid-cols-4 gap-1">
                                                {categoryProducts.map((product) => {
                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                    return (
                                                        <div key={product.id} className="text-center bg-white rounded p-1 border border-gray-300">
                                                            <p className={`font-medium truncate ${getFontSizeClass('cells')} ${getCategoryColors(selectedCategory).textColor}`}>{product.name}</p>
                                                            <p className={`font-bold ${getFontSizeClass('headers')} ${getCategoryColors(selectedCategory).textColor}`}>{total}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Totals - EXCLUYENDO Pasteles y Donuts - RF-18: Colores de categoría */}
                                    {selectedCategory.toLowerCase() !== 'pasteles' && selectedCategory.toLowerCase() !== 'donuts' && (
                                        <div className={`rounded-lg p-4 border mb-4 ${getCategoryColors(selectedCategory).backgroundColor} border-gray-300`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${getCategoryColors(selectedCategory).textColor}`}>
                                                TOTALES GENERALES - {selectedCategory}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="text-center">
                                                    <p className="text-sm text-green-600">Total Cantidad</p>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        {getTotalForCategory(selectedCategory).quantity}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-green-600">Total Monto</p>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        ${getTotalForCategory(selectedCategory).amount.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-green-600">Rutas Activas</p>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        {routes.filter(route => getClientsByRoute(route.id).length > 0).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}



                                    {/* Bloque de TOTAL para Pasteles - AL INICIO */}
                                    {pageIndex === 0 && selectedCategory.toLowerCase() === 'pasteles' && (
                                        <div className="bg-blue-50 rounded p-2 border border-blue-200 mb-2">
                                            <h3 className={`font-semibold text-blue-900 mb-2 text-center ${getFontSizeClass('headers')}`}>
                                                TOTAL
                                            </h3>

                                            {/* Tabla de totales en columnas */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    {/* Headers de productos */}
                                                    <thead>
                                                        {/* Fila de categorías CHOCOLATE y NARANJA */}
                                                        <tr>
                                                            {/* Categoría Chocolate */}
                                                            <th
                                                                colSpan={
                                                                    filteredProducts.filter(product => {
                                                                        const productName = product.name.toLowerCase();
                                                                        const total = getTotalForProduct(product.id, selectedCategory);
                                                                        return (productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate')) && total > 0;
                                                                    }).length
                                                                }
                                                                className="bg-orange-200 border border-orange-300 px-2 py-1 text-center"
                                                            >
                                                                <span className={`font-bold text-orange-900 ${getFontSizeClass('titles')}`}>
                                                                    CHOCOLATE
                                                                </span>
                                                            </th>

                                                            {/* Categoría Naranja */}
                                                            <th
                                                                colSpan={
                                                                    filteredProducts.filter(product => {
                                                                        const productName = product.name.toLowerCase();
                                                                        const total = getTotalForProduct(product.id, selectedCategory);
                                                                        return (productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange')) && total > 0;
                                                                    }).length
                                                                }
                                                                className="bg-yellow-200 border border-yellow-300 px-2 py-1 text-center"
                                                            >
                                                                <span className={`font-bold text-yellow-900 ${getFontSizeClass('titles')}`}>
                                                                    NARANJA
                                                                </span>
                                                            </th>
                                                        </tr>

                                                        {/* Fila de headers de productos */}
                                                        <tr>
                                                            {/* Headers Chocolate */}
                                                            {filteredProducts
                                                                .filter(product => {
                                                                    const productName = product.name.toLowerCase();
                                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                                    return (productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate')) && total > 0;
                                                                })
                                                                .map(product => {
                                                                    // Usar la nueva estrategia de manejo de texto
                                                                    const textOptimization = getOptimizedTableText(
                                                                        product.name,
                                                                        selectedCategory,
                                                                        { maxLength: 10, maxWords: 2 }
                                                                    );

                                                                    return (
                                                                        <th
                                                                            key={product.id}
                                                                            className="bg-orange-100 border border-orange-300 px-1 py-1 text-center"
                                                                            title={textOptimization.fullText}
                                                                        >
                                                                            <span className={`font-bold text-orange-800 ${getFontSizeClass('cells')} ${textOptimization.classes}`} style={textOptimization.styles}>
                                                                                {textOptimization.displayText}
                                                                            </span>
                                                                        </th>
                                                                    );
                                                                })}

                                                            {/* Headers Naranja */}
                                                            {filteredProducts
                                                                .filter(product => {
                                                                    const productName = product.name.toLowerCase();
                                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                                    return (productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange')) && total > 0;
                                                                })
                                                                .map(product => {
                                                                    // Usar la nueva estrategia de manejo de texto
                                                                    const textOptimization = getOptimizedTableText(
                                                                        product.name,
                                                                        selectedCategory,
                                                                        { maxLength: 10, maxWords: 2 }
                                                                    );

                                                                    return (
                                                                        <th
                                                                            key={product.id}
                                                                            className="bg-yellow-100 border border-yellow-300 px-1 py-1 text-center"
                                                                            title={textOptimization.fullText}
                                                                        >
                                                                            <span className={`font-bold text-yellow-800 ${getFontSizeClass('cells')} ${textOptimization.classes}`} style={textOptimization.styles}>
                                                                                {textOptimization.displayText}
                                                                            </span>
                                                                        </th>
                                                                    );
                                                                })}
                                                        </tr>
                                                    </thead>

                                                    {/* Fila de datos */}
                                                    <tbody>
                                                        <tr>
                                                            {/* Datos Chocolate */}
                                                            {filteredProducts
                                                                .filter(product => {
                                                                    const productName = product.name.toLowerCase();
                                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                                    return (productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate')) && total > 0;
                                                                })
                                                                .map(product => {
                                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                                    return (
                                                                        <td
                                                                            key={product.id}
                                                                            className="bg-orange-50 border border-orange-300 px-1 py-1 text-center"
                                                                            title={`${product.name}: ${total}`}
                                                                        >
                                                                            <span className={`font-bold text-orange-900 ${getFontSizeClass('headers')}`}>
                                                                                {total}
                                                                            </span>
                                                                        </td>
                                                                    );
                                                                })}

                                                            {/* Datos Naranja */}
                                                            {filteredProducts
                                                                .filter(product => {
                                                                    const productName = product.name.toLowerCase();
                                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                                    return (productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange')) && total > 0;
                                                                })
                                                                .map(product => {
                                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                                    return (
                                                                        <td
                                                                            key={product.id}
                                                                            className="bg-yellow-50 border border-yellow-300 px-1 py-1 text-center"
                                                                            title={`${product.name}: ${total}`}
                                                                        >
                                                                            <span className={`font-bold text-yellow-900 ${getFontSizeClass('headers')}`}>
                                                                                {total}
                                                                            </span>
                                                                        </td>
                                                                    );
                                                                })}
                                                        </tr>

                                                        {/* Fila de separadores y subtotales */}
                                                        <tr>
                                                            {/* Separador y subtotal Chocolate */}
                                                            <td
                                                                colSpan={
                                                                    filteredProducts.filter(product => {
                                                                        const productName = product.name.toLowerCase();
                                                                        const total = getTotalForProduct(product.id, selectedCategory);
                                                                        return (productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate')) && total > 0;
                                                                    }).length
                                                                }
                                                                className="bg-orange-200 border border-orange-300 px-2 py-1 text-center"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <span className={`font-semibold text-orange-800 ${getFontSizeClass('cells')}`}>CHOCOLATE</span>
                                                                    <span className={`font-bold text-orange-900 ${getFontSizeClass('headers')}`}>{totalsByType.chocolate}</span>
                                                                </div>
                                                            </td>

                                                            {/* Separador y subtotal Naranja */}
                                                            <td
                                                                colSpan={
                                                                    filteredProducts.filter(product => {
                                                                        const productName = product.name.toLowerCase();
                                                                        const total = getTotalForProduct(product.id, selectedCategory);
                                                                        return (productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange')) && total > 0;
                                                                    }).length
                                                                }
                                                                className="bg-yellow-200 border border-yellow-300 px-2 py-1 text-center"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <span className={`font-semibold text-yellow-800 ${getFontSizeClass('cells')}`}>NARANJA</span>
                                                                    <span className={`font-bold text-yellow-900 ${getFontSizeClass('headers')}`}>{totalsByType.naranja}</span>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Fila de total consolidado */}
                                                        <tr>
                                                            <td
                                                                colSpan={
                                                                    filteredProducts.filter(product => {
                                                                        const productName = product.name.toLowerCase();
                                                                        return productName.includes('choco') || productName.includes('chocolate') ||
                                                                            productName.includes('naranja') || productName.includes('orange');
                                                                    }).length
                                                                }
                                                                className="bg-blue-200 border border-blue-300 px-3 py-2 text-center"
                                                            >
                                                                <span className={`font-bold text-blue-900 ${getFontSizeClass('titles')}`}>
                                                                    TOTAL GENERAL: {totalsByType.chocolate + totalsByType.naranja}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tablas de la página */}
                                    {pageData.map((item) => {
                                        if (item.type === 'route') {
                                            const { route, clients } = item;
                                            return (
                                                <div key={route.id} className="border border-gray-300 rounded overflow-hidden mb-2">
                                                    <div className="bg-gray-100 px-2 py-1 border-b border-gray-300">
                                                        <h3 className={`font-semibold text-gray-900 ${getFontSizeClass('headers')}`}>
                                                            {route.nombre} - {route.identificador}
                                                        </h3>
                                                    </div>

                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-50">
                                                                    <th className={`border border-gray-300 px-1 py-1 text-left text-black font-semibold w-1/3 ${getFontSizeClass('headers')}`}>
                                                                        CLIENTES
                                                                    </th>
                                                                    {getProductsWithValues(clients).map((product) => {
                                                                        // Usar la nueva estrategia de manejo de texto
                                                                        const textOptimization = getOptimizedTableText(
                                                                            product.name,
                                                                            selectedCategory,
                                                                            { maxLength: 12, maxWords: 2 }
                                                                        );

                                                                        return (
                                                                            <th
                                                                                key={product.id}
                                                                                className={`border border-gray-300 px-0.5 py-1 text-center text-black font-semibold ${getFontSizeClass('headers')} ${textOptimization.classes}`}
                                                                                style={textOptimization.styles}
                                                                                title={textOptimization.fullText}
                                                                            >
                                                                                {textOptimization.displayText}
                                                                            </th>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {clients.map((client) => {
                                                                    return (
                                                                        <tr key={client.id}>
                                                                            <td className={`border border-gray-300 px-1 py-1 text-black font-medium ${getFontSizeClass('cells')}`}>
                                                                                {client.nombre}
                                                                            </td>
                                                                            {getProductsWithValues(clients).map((product) => {
                                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                                return (
                                                                                    <td key={product.id} className={`border border-gray-300 px-0.5 py-1 text-black text-center ${getFontSizeClass('cells')}`}>
                                                                                        {quantity > 0 ? quantity : ''}
                                                                                    </td>
                                                                                );
                                                                            })}
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Footer de página */}
                                    <div className="mt-2 pt-1 border-t border-gray-300">
                                        <p className={`text-center text-gray-600 ${getFontSizeClass('cells')}`}>
                                            MEGA DONUT - Sistema de Gestión de Pedidos por Categorías |
                                            Página {pageIndex + 1} de {pages.length} |
                                            Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                        </p>
                                    </div>
                                </div>

                                {/* Línea de separación inferior */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 opacity-60"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
