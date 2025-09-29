import { Printer, RotateCcw, RotateCw } from 'lucide-react';
import { Route, Client, Product, ProductCategory } from '@/types/routeNotebook';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import RouteNotebookPDF from './pdf/RouteNotebookPDF';
import { generateMainTitle } from '@/utils/dateUtils';
import { getCategoryColors } from '@/utils/categoryColors';
import { useState } from 'react';

interface RouteNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    selectedDate: Date;
    dateFilterType: 'registration' | 'delivery';
    selectedRoute: string;
    routes: Route[];
    productCategories: ProductCategory[];
    getClientsWithOrders: (routeId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string) => number;
    getTotalForRoute: (routeId: string) => { quantity: number; amount: number };
    printRef: React.RefObject<HTMLDivElement>;
    isVerticalText?: boolean;
}

export default function RouteNotebookPreview({
    showPreview,
    setShowPreview,
    generatePDF,
    selectedDate,
    dateFilterType,
    selectedRoute,
    routes,
    productCategories,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForRoute,
    printRef,
    isVerticalText = false
}: RouteNotebookPreviewProps) {
    // Estado local para controlar el modo vertical/horizontal en la vista previa
    // Por defecto vertical (true) como solicitado
    const [previewVerticalText, setPreviewVerticalText] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Función para generar y descargar PDF
    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            const doc = (
                <RouteNotebookPDF
                    selectedDate={selectedDate}
                    dateFilterType={dateFilterType}
                    selectedRoute={selectedRoute}
                    productCategories={productCategories}
                    routes={routes}
                    getClientsWithOrders={getClientsWithOrders}
                    getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                    getTotalForClient={getTotalForClient}
                    getTotalForProduct={getTotalForProduct}
                    getTotalForRoute={getTotalForRoute}
                    isVerticalText={previewVerticalText}
                />
            );

            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Mega-Donut-Rutas-${selectedRoute ? routes.find(r => r.id === selectedRoute)?.nombre : 'Todas'}-${dateFilterType === 'registration' ? 'Registro' : 'Entrega'}-${selectedDate.toLocaleDateString('es-ES')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generando PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };
    // Función para convertir texto en letras verticales (una letra por línea)
    const renderVerticalText = (text: string) => {
        if (!previewVerticalText) {
            return text;
        }

        // Dividir el texto en caracteres y crear elementos span separados
        return text.split('').map((char, index) => (
            <span key={index} style={{ display: 'block', lineHeight: '1.2' }}>
                {char}
            </span>
        ));
    };
    // Usar directamente los productos filtrados que vienen del componente padre
    // (ya están filtrados para mostrar solo los que tienen cantidades > 0)
    // Filtrar adicionalmente para asegurar que tengan nombres válidos
    const filteredProducts = productCategories
        .flatMap(category => category.products)
        .filter(product => product && product.name && product.name.trim() !== '');

    // Usar directamente las categorías filtradas que vienen del componente padre
    // (ya están filtradas para mostrar solo las que tienen productos con cantidades > 0)
    const filteredCategories = productCategories;
    if (!showPreview) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Vista Previa - MEGA DONUT PEDIDOS Y ENTREGAS</h2>
                        <div className="flex items-center space-x-3">
                            {/* Toggle para modo vertical/horizontal */}
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setPreviewVerticalText(false)}
                                    className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${!previewVerticalText
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    title="Modo horizontal"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span className="text-sm">Horizontal</span>
                                </button>
                                <button
                                    onClick={() => setPreviewVerticalText(true)}
                                    className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${previewVerticalText
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    title="Modo vertical"
                                >
                                    <RotateCw className="h-4 w-4" />
                                    <span className="text-sm">Vertical</span>
                                </button>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isGeneratingPDF}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Printer className="h-4 w-4" />
                                <span>{isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}</span>
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Print Content */}
                <div ref={printRef} className="p-6">
                    <div className="space-y-6">
                        {/* Header - RF-18: Encabezado en negro con fecha subrayada */}
                        <div className="text-center border-b border-gray-200 pb-4">
                            <h1 className="text-3xl font-bold text-black">
                                {generateMainTitle(selectedDate, selectedRoute ? routes.find(r => r.id === selectedRoute)?.nombre : 'TODAS LAS RUTAS')}
                            </h1>
                            <p className="text-lg text-black underline">
                                FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                            </p>
                            {selectedRoute && (
                                <p className="text-lg text-black">
                                    {routes.find(r => r.id === selectedRoute)?.identificador}
                                </p>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-100">
                                            CLIENTES
                                        </th>
                                        {filteredCategories.map((category) => {
                                            // Usar directamente los productos de la categoría (ya están filtrados)
                                            return (
                                                <th key={category.name} colSpan={category.products.length} className={`border border-gray-300 px-3 py-2 text-center font-semibold ${getCategoryColors(category.name).backgroundColor} ${getCategoryColors(category.name).textColor}`}>
                                                    {category.name}
                                                </th>
                                            );
                                        })}

                                    </tr>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-50">
                                            &nbsp;
                                        </th>
                                        {filteredCategories.map((category) => (
                                            category.products.map((product) => {
                                                // Determinar si es un producto de naranja (misma lógica que tabla de totales)
                                                const productName = product.name.toLowerCase();
                                                const isNaranja = productName.includes('pastelnaranj') ||
                                                    productName.includes('naranja') ||
                                                    productName.includes('orange');

                                                return (
                                                    <th
                                                        key={product.id}
                                                        className={`border border-gray-300 px-2 py-2 text-center font-semibold text-xs ${isNaranja ? 'bg-orange-100 text-orange-800' : 'text-black'}`}
                                                        style={{
                                                            // Aplicar estilos inline como en el PDF para garantizar que se vean
                                                            ...(isNaranja && {
                                                                backgroundColor: '#fed7aa !important',
                                                                color: '#ea580c !important',
                                                                borderColor: '#ea580c'
                                                            })
                                                        }}
                                                    >
                                                        {previewVerticalText ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                {renderVerticalText(product.name)}
                                                            </div>
                                                        ) : (
                                                            product.name
                                                        )}
                                                    </th>
                                                );
                                            })
                                        ))}

                                    </tr>
                                </thead>
                                <tbody>
                                    {routes
                                        .filter(route => !selectedRoute || route.id === selectedRoute)
                                        .map((route) => {
                                            const routeClients = getClientsWithOrders(route.id);

                                            return routeClients.map((client) => {
                                                const clientTotal = getTotalForClient(client.id);

                                                return (
                                                    <tr key={client.id}>
                                                        <td className="border border-gray-300 px-3 py-2 text-black font-medium sticky left-0 bg-white">
                                                            {client.nombre}
                                                        </td>
                                                        {filteredCategories.map((category) => (
                                                            category.products.map((product) => {
                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);

                                                                // Determinar si es un producto de naranja (misma lógica que tabla de totales)
                                                                const productName = product.name.toLowerCase();
                                                                const isNaranja = productName.includes('pastelnaranj') ||
                                                                    productName.includes('naranja') ||
                                                                    productName.includes('orange');

                                                                return (
                                                                    <td
                                                                        key={product.id}
                                                                        className={`border border-gray-300 px-2 py-2 text-center ${isNaranja ? 'bg-orange-50 text-orange-900' : 'text-black'}`}
                                                                        style={{
                                                                            // Aplicar estilos inline como en el PDF para garantizar que se vean
                                                                            ...(isNaranja && {
                                                                                backgroundColor: '#fed7aa !important',
                                                                                color: '#ea580c !important'
                                                                            })
                                                                        }}
                                                                    >
                                                                        {quantity > 0 ? quantity : '-'}
                                                                    </td>
                                                                );
                                                            })
                                                        ))}

                                                    </tr>
                                                );
                                            });
                                        })}

                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                MEGA DONUT - Sistema de Gestión de Pedidos<br />
                                Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
