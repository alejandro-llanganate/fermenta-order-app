/**
 * Utilidades para manejo inteligente de texto largo en tablas
 */

export interface TextHandlingOptions {
    maxLength?: number;
    maxWords?: number;
    useWordBreak?: boolean;
    useEllipsis?: boolean;
    preserveImportantWords?: boolean;
}

/**
 * Trunca texto de manera inteligente considerando palabras completas
 */
export function smartTruncate(
    text: string, 
    options: TextHandlingOptions = {}
): string {
    const {
        maxLength = 15,
        maxWords = 3,
        useWordBreak = true,
        useEllipsis = true,
        preserveImportantWords = true
    } = options;

    if (!text || text.length <= maxLength) {
        return text;
    }

    // Si el texto es muy corto, no hacer nada
    if (text.length <= maxLength) {
        return text;
    }

    // Estrategia 1: Truncar por palabras si es posible
    if (useWordBreak) {
        const words = text.split(' ');
        
        // Si tiene pocas palabras, usar truncamiento por palabras
        if (words.length <= maxWords + 1) {
            const truncatedWords = words.slice(0, maxWords);
            const result = truncatedWords.join(' ');
            
            if (result.length <= maxLength) {
                return useEllipsis && words.length > maxWords ? result + '...' : result;
            }
        }
    }

    // Estrategia 2: Truncar por caracteres preservando palabras importantes
    if (preserveImportantWords) {
        const importantWords = ['PASTEL', 'DONUT', 'CHOCO', 'NARANJ', 'X12', 'X14', 'S/C', 'DECO'];
        const words = text.split(' ');
        
        // Buscar palabras importantes y mantenerlas
        const importantFound = words.filter(word => 
            importantWords.some(important => 
                word.toUpperCase().includes(important.toUpperCase())
            )
        );
        
        if (importantFound.length > 0) {
            // Construir resultado priorizando palabras importantes
            let result = '';
            let currentLength = 0;
            
            for (const word of words) {
                const isImportant = importantWords.some(important => 
                    word.toUpperCase().includes(important.toUpperCase())
                );
                
                if (isImportant || currentLength + word.length + 1 <= maxLength) {
                    if (result) result += ' ';
                    result += word;
                    currentLength = result.length;
                } else {
                    break;
                }
            }
            
            if (result.length <= maxLength) {
                return useEllipsis && result.length < text.length ? result + '...' : result;
            }
        }
    }

    // Estrategia 3: Truncamiento simple por caracteres
    const truncated = text.substring(0, maxLength);
    return useEllipsis ? truncated + '...' : truncated;
}

/**
 * Genera abreviaciones inteligentes para nombres de productos
 */
export function generateSmartAbbreviation(
    productName: string,
    category?: string
): string {
    const name = productName.toUpperCase();
    
    // Abreviaciones específicas por categoría
    if (category?.toLowerCase() === 'pasteles') {
        // Lógica específica para pasteles (ya implementada)
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('pastelchoco') && !lowerName.includes('/')) return 'CHOC';
        if (lowerName.includes('graj')) return 'CHOCO GRAJ';
        if (lowerName.includes('s/c') && !lowerName.includes('cober')) return 'S/C';
        if (lowerName.includes('x12')) return 'X 12';
        if (lowerName.includes('deco')) return 'DECO';
        if (lowerName.includes('s/cober')) return 'S/COBER';
        if (lowerName.includes('seña')) return 'SEÑA';
        if (lowerName.includes('x14')) return 'X14';
        
        // Naranja - Agregar prefijo N para distinguir de chocolate
        if (lowerName.includes('pastelnaranj') || lowerName.includes('naranja') || lowerName.includes('orange')) {
            // Si ya tiene N al inicio, no agregar otra
            if (name.startsWith('N ')) {
                return name;
            }
            // Agregar N al inicio del nombre
            return 'N ' + name;
        }
        if (lowerName.includes('x10')) return 'X10';
        if (lowerName.includes('x12')) return 'X12';
        if (lowerName.includes('x14')) return 'X14';
        if (lowerName.includes('sn/azucar')) return 'SN/AZUCAR';
    }
    
    // Abreviaciones generales
    const commonAbbreviations: { [key: string]: string } = {
        'DONUT': 'DNT',
        'CHOCOLATE': 'CHOC',
        'NARANJA': 'NAR',
        'VANILLA': 'VAN',
        'FRESA': 'FRS',
        'COCO': 'COC',
        'GLACE': 'GLC',
        'RELLENO': 'REL',
        'CHANTILLY': 'CHT',
        'MANZANA': 'MZ',
        'CANELA': 'CNL',
        'AZUCAR': 'AZU',
        'SIN': 'S/',
        'CON': 'C/',
        'EXTRA': 'EXT',
        'GRANDE': 'GD',
        'PEQUEÑO': 'PQ',
        'MEDIANO': 'MD'
    };
    
    // Buscar abreviaciones comunes
    for (const [full, abbrev] of Object.entries(commonAbbreviations)) {
        if (name.includes(full)) {
            return name.replace(new RegExp(full, 'gi'), abbrev);
        }
    }
    
    // Si no hay abreviación específica, usar truncamiento inteligente
    return smartTruncate(name, { maxLength: 8, maxWords: 2 });
}

/**
 * Aplica estilos CSS para manejo de texto largo
 */
export function getTextHandlingStyles(
    text: string,
    maxWidth: string = '100px'
): React.CSSProperties {
    const isLongText = text.length > 12;
    
    return {
        maxWidth,
        overflow: 'hidden',
        textOverflow: isLongText ? 'ellipsis' : 'visible',
        whiteSpace: isLongText ? 'nowrap' : 'normal',
        wordBreak: isLongText ? 'break-word' : 'normal',
        lineHeight: isLongText ? '1.2' : 'normal',
        fontSize: isLongText ? '0.75rem' : '0.875rem'
    };
}

/**
 * Genera clases CSS para manejo de texto en tablas
 */
export function getTextHandlingClasses(
    text: string,
    baseClasses: string = ''
): string {
    const isLongText = text.length > 12;
    const isVeryLongText = text.length > 20;
    
    let classes = baseClasses;
    
    if (isVeryLongText) {
        classes += ' text-xs leading-tight';
    } else if (isLongText) {
        classes += ' text-sm leading-snug';
    }
    
    return classes;
}

/**
 * Función principal para obtener el texto optimizado para mostrar en tablas
 */
export function getOptimizedTableText(
    text: string,
    category?: string,
    options: TextHandlingOptions = {}
): {
    displayText: string;
    fullText: string;
    styles: React.CSSProperties;
    classes: string;
} {
    const fullText = text;
    
    // Intentar abreviación inteligente primero
    let displayText = generateSmartAbbreviation(text, category);
    
    // Si la abreviación sigue siendo muy larga, usar truncamiento
    if (displayText.length > (options.maxLength || 15)) {
        displayText = smartTruncate(displayText, options);
    }
    
    return {
        displayText,
        fullText,
        styles: getTextHandlingStyles(displayText),
        classes: getTextHandlingClasses(displayText)
    };
}
