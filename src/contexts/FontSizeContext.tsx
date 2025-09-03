'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'S' | 'M' | 'L' | 'XL';

interface FontSizeConfig {
    titles: FontSize;
    headers: FontSize;
    cells: FontSize;
}

interface FontSizeContextType {
    fontSizeConfig: FontSizeConfig;
    updateFontSizeConfig: (config: Partial<FontSizeConfig>) => void;
    getFontSizeClass: (type: keyof FontSizeConfig) => string;
    getFontSizeValue: (type: keyof FontSizeConfig) => number;
}

const defaultConfig: FontSizeConfig = {
    titles: 'S',
    headers: 'M',
    cells: 'M',
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (!context) {
        throw new Error('useFontSize must be used within a FontSizeProvider');
    }
    return context;
};

interface FontSizeProviderProps {
    children: ReactNode;
}

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
    const [fontSizeConfig, setFontSizeConfig] = useState<FontSizeConfig>(defaultConfig);

    // Cargar configuración desde localStorage al inicializar
    useEffect(() => {
        const savedConfig = localStorage.getItem('categoryNotebookFontSize');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setFontSizeConfig({ ...defaultConfig, ...parsed });
            } catch (error) {
                console.error('Error loading font size config:', error);
            }
        }
    }, []);

    // Guardar configuración en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('categoryNotebookFontSize', JSON.stringify(fontSizeConfig));
    }, [fontSizeConfig]);

    const updateFontSizeConfig = (config: Partial<FontSizeConfig>) => {
        setFontSizeConfig(prev => ({ ...prev, ...config }));
    };

    // Mapeo de tamaños a clases de Tailwind
    const fontSizeClassMap = {
        titles: {
            S: 'text-xs',
            M: 'text-sm',
            L: 'text-base',
            XL: 'text-lg',
        },
        headers: {
            S: 'text-xs',
            M: 'text-sm',
            L: 'text-base',
            XL: 'text-lg',
        },
        cells: {
            S: 'text-xs',
            M: 'text-sm',
            L: 'text-base',
            XL: 'text-lg',
        },
    };

    // Mapeo de tamaños a valores numéricos para PDF
    const fontSizeValueMap = {
        titles: {
            S: 10,
            M: 12,
            L: 14,
            XL: 16,
        },
        headers: {
            S: 8,
            M: 10,
            L: 12,
            XL: 14,
        },
        cells: {
            S: 8,
            M: 9,
            L: 10,
            XL: 12,
        },
    };

    const getFontSizeClass = (type: keyof FontSizeConfig): string => {
        const size = fontSizeConfig[type];
        return fontSizeClassMap[type][size];
    };

    const getFontSizeValue = (type: keyof FontSizeConfig): number => {
        const size = fontSizeConfig[type];
        return fontSizeValueMap[type][size];
    };

    const value: FontSizeContextType = {
        fontSizeConfig,
        updateFontSizeConfig,
        getFontSizeClass,
        getFontSizeValue,
    };

    return (
        <FontSizeContext.Provider value={value}>
            {children}
        </FontSizeContext.Provider>
    );
};
