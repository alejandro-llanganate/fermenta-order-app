import { Printer, Download, FileSpreadsheet } from 'lucide-react';
import { ProductCategory, Route } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CategoryNotebookPDF from './pdf/CategoryNotebookPDF';
import { exportToExcel } from '@/utils/excelExport';

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
    if (!showPreview) return null;

    // Obtener productos de la categoría seleccionada
    const getCategoryProducts = (): any[] => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            return category ? category.products : [];
        }
        return [];
    };

    const categoryProducts = getCategoryProducts();

    // Obtener clientes por ruta para la categoría seleccionada
    const getClientsByRoute = (routeId: string): any[] => {
        const allClients = getClientsWithOrders(selectedCategory);
        return allClients.filter((client: any) => client.routeId === routeId);
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
            categoryProducts: categoryProductsWithOrders,
            clientsByRoute,
            getQuantityForClientAndProduct,
            getTotalForProduct,
            getTotalForCategory
        });
    };

    // Función para obtener productos con pedidos (igual que en PDF)
    const getProductsWithOrders = () => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            if (!category) return [];

            // Filtrar solo productos que tienen pedidos
            const filteredProducts = category.products.filter(product => {
                const total = getTotalForProduct(product.id, selectedCategory);
                return total > 0;
            });

            return filteredProducts;
        }
        return [];
    };

    // Usar la función para obtener productos filtrados
    const categoryProductsWithOrders = getProductsWithOrders();

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Vista Previa A5 - MEGA DONUT PEDIDOS POR CATEGORÍAS</h2>
                        <div className="flex items-center space-x-3">
                            <PDFDownloadLink
                                document={
                                    <CategoryNotebookPDF
                                        selectedDate={selectedDate}
                                        selectedCategory={selectedCategory}
                                        productCategories={productCategories}
                                        routes={routes}
                                        getClientsWithOrders={getClientsWithOrders}
                                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                                        getTotalForClient={getTotalForClient}
                                        getTotalForProduct={getTotalForProduct}
                                        getTotalForCategory={getTotalForCategory}
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
                <div ref={printRef} className="p-2">
                    {pages.map((pageData, pageIndex) => (
                        <div key={pageIndex} className="mb-8 relative">
                            {/* Línea de separación superior */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 opacity-60"></div>

                            {/* A5 Container - 148mm x 210mm con líneas de separación visuales */}
                            <div className="mx-auto bg-white border-2 border-red-400 relative" style={{ width: '148mm', minHeight: '210mm', padding: '8mm' }}>
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
                                    A5 - Página {pageIndex + 1}
                                </div>

                                <div className="space-y-2">
                                    {/* Header solo en la primera página */}
                                    {pageIndex === 0 && (
                                        <div className="text-center border-b border-gray-200 pb-2">
                                            <h1 className="text-lg font-bold text-black">MEGA DONUT</h1>
                                            <h2 className="text-sm font-semibold text-gray-800">PEDIDOS POR CATEGORÍAS</h2>
                                            <p className="text-xs text-gray-600">
                                                DÍA: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                FILTRADO POR: {dateFilterType === 'order' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                                            </p>
                                            {selectedCategory && (
                                                <p className="text-xs text-gray-600">
                                                    CATEGORÍA: {selectedCategory}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Totales por producto solo en la primera página */}
                                    {pageIndex === 0 && selectedCategory && (
                                        <div className="bg-blue-50 rounded p-2 border border-blue-200 mb-2">
                                            <h3 className="text-xs font-semibold text-blue-900 mb-1">
                                                TOTALES POR PRODUCTO - {selectedCategory}
                                            </h3>
                                            <div className="grid grid-cols-4 gap-1">
                                                {categoryProductsWithOrders.map((product) => {
                                                    const total = getTotalForProduct(product.id, selectedCategory);
                                                    return (
                                                        <div key={product.id} className="text-center bg-white rounded p-1 border border-blue-200">
                                                            <p className="text-xs text-blue-600 font-medium truncate">{product.name}</p>
                                                            <p className="text-sm font-bold text-blue-900">{total}</p>
                                                        </div>
                                                    );
                                                })}
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
                                                        <h3 className="text-xs font-semibold text-gray-900">
                                                            {route.nombre} - {route.identificador}
                                                        </h3>
                                                    </div>

                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-50">
                                                                    <th className="border border-gray-300 px-1 py-1 text-left text-black font-semibold text-xs w-1/3">
                                                                        CLIENTES
                                                                    </th>
                                                                    {categoryProductsWithOrders.map((product) => (
                                                                        <th key={product.id} className="border border-gray-300 px-0.5 py-1 text-center text-black font-semibold text-xs">
                                                                            {product.name}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {clients.map((client) => {
                                                                    return (
                                                                        <tr key={client.id}>
                                                                            <td className="border border-gray-300 px-1 py-1 text-black font-medium text-xs">
                                                                                {client.nombre}
                                                                            </td>
                                                                            {categoryProductsWithOrders.map((product) => {
                                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                                return (
                                                                                    <td key={product.id} className="border border-gray-300 px-0.5 py-1 text-black text-center text-xs">
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
                                        <p className="text-center text-xs text-gray-600">
                                            MEGA DONUT - Sistema de Gestión de Pedidos por Categorías |
                                            Página {pageIndex + 1} de {pages.length} |
                                            Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Línea de separación inferior */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 opacity-60"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
