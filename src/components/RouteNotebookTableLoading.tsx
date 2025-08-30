export default function RouteNotebookTableLoading() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando datos...</p>
            </div>
        </div>
    );
}
