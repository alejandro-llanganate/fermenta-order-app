import { ArrowLeft, MapPin } from 'lucide-react';

interface RouteNotebookHeaderProps {
    onBack: () => void;
}

export default function RouteNotebookHeader({ onBack }: RouteNotebookHeaderProps) {
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
                    <MapPin className="h-8 w-8 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-900">MEGA DONUT - PEDIDOS Y ENTREGAS</h1>
                </div>
            </div>
        </div>
    );
}
