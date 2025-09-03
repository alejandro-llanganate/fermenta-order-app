'use client';

import React, { useState } from 'react';
import { Settings, Type } from 'lucide-react';
import { useFontSize, FontSize } from '@/contexts/FontSizeContext';

interface FontSizeConfigProps {
    className?: string;
}

export default function FontSizeConfig({ className = '' }: FontSizeConfigProps) {
    const { fontSizeConfig, updateFontSizeConfig } = useFontSize();
    const [isOpen, setIsOpen] = useState(false);

    const handleFontSizeChange = (type: 'titles' | 'headers' | 'cells', size: FontSize) => {
        updateFontSizeConfig({ [type]: size });
    };

    const fontSizeOptions: FontSize[] = ['S', 'M', 'L', 'XL'];

    const getSizeLabel = (size: FontSize): string => {
        switch (size) {
            case 'S': return 'Muy Pequeño';
            case 'M': return 'Pequeño';
            case 'L': return 'Mediano';
            case 'XL': return 'Grande';
            default: return size;
        }
    };

    const getSizeDescription = (type: 'titles' | 'headers' | 'cells'): string => {
        switch (type) {
            case 'titles': return 'Títulos principales';
            case 'headers': return 'Encabezados de tabla';
            case 'cells': return 'Contenido de celdas';
            default: return '';
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Botón para abrir configuración */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                title="Configurar tamaños de letra"
            >
                <Type className="h-4 w-4" />
                <span className="text-sm font-medium">Tamaños</span>
                <Settings className="h-4 w-4" />
            </button>

            {/* Panel de configuración */}
            {isOpen && (
                <>
                    {/* Overlay para cerrar */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel de configuración */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Configurar Tamaños de Letra</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Títulos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getSizeDescription('titles')}
                                </label>
                                <div className="flex space-x-2">
                                    {fontSizeOptions.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleFontSizeChange('titles', size)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${fontSizeConfig.titles === size
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Actual: {getSizeLabel(fontSizeConfig.titles)}
                                </p>
                            </div>

                            {/* Encabezados */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getSizeDescription('headers')}
                                </label>
                                <div className="flex space-x-2">
                                    {fontSizeOptions.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleFontSizeChange('headers', size)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${fontSizeConfig.headers === size
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Actual: {getSizeLabel(fontSizeConfig.headers)}
                                </p>
                            </div>

                            {/* Celdas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getSizeDescription('cells')}
                                </label>
                                <div className="flex space-x-2">
                                    {fontSizeOptions.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleFontSizeChange('cells', size)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${fontSizeConfig.cells === size
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Actual: {getSizeLabel(fontSizeConfig.cells)}
                                </p>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                La configuración se guarda automáticamente y se aplica en tiempo real a todas las vistas (tabla, vista previa e impresión).
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                💡 Los cambios se reflejan inmediatamente
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
