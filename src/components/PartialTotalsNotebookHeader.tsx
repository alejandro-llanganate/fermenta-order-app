import { ArrowLeft, BarChart3 } from 'lucide-react';

interface PartialTotalsNotebookHeaderProps {
    onBack: () => void;
}

export default function PartialTotalsNotebookHeader({ onBack }: PartialTotalsNotebookHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Totales Parciales</h1>
                        <p className="text-sm text-gray-600">Reportes consolidados por rutas y categorías</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
