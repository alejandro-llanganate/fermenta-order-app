export default function PartialTotalsNotebookTableLoading() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Cargando resumen consolidado...</span>
            </div>
        </div>
    );
}
