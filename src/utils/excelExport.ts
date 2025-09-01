import * as XLSX from 'xlsx';

export interface ExcelExportData {
    selectedDate: Date;
    selectedCategory: string;
    dateFilterType: 'order' | 'delivery';
    categoryProducts: any[];
    clientsByRoute: Array<{
        route: any;
        clients: any[];
    }>;
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForCategory: (categoryId: string) => { quantity: number; amount: number };
}

// Función para aplicar estilos a una hoja
const applyStyles = (sheet: XLSX.WorkSheet, data: any[][]) => {
    // Definir rangos para aplicar estilos
    const ranges = [];
    
    // Estilos para títulos principales (filas 1, 3, 4)
    ranges.push({ range: 'A1:Z1', style: { font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } } });
    ranges.push({ range: 'A3:Z3', style: { font: { bold: true, size: 12 } } });
    ranges.push({ range: 'A4:Z4', style: { font: { bold: true, size: 12 } } });
    
    // Estilos para subtítulos (fila 6)
    ranges.push({ range: 'A6:Z6', style: { font: { bold: true, size: 14 }, alignment: { horizontal: 'center' } } });
    
    // Estilos para headers de tabla (fila 7 en Totales, filas variables en Rutas)
    ranges.push({ range: 'A7:Z7', style: { 
        font: { bold: true, size: 11 }, 
        fill: { fgColor: { rgb: "CCCCCC" } },
        alignment: { horizontal: 'center' },
        border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        }
    } });
    
    // Aplicar estilos usando XLSX.utils.sheet_add_aoa con opciones
    ranges.forEach(({ range, style }) => {
        const [start, end] = range.split(':');
        const startCol = XLSX.utils.decode_col(start.replace(/\d/g, ''));
        const startRow = parseInt(start.replace(/\D/g, '')) - 1;
        const endCol = XLSX.utils.decode_col(end.replace(/\d/g, ''));
        const endRow = parseInt(end.replace(/\D/g, '')) - 1;
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (sheet[cellAddress]) {
                    sheet[cellAddress].s = style;
                }
            }
        }
    });
    
    // Ajustar ancho de columnas
    const colWidths = [];
    for (let i = 0; i < data[0]?.length || 0; i++) {
        let maxWidth = 10; // Ancho mínimo
        for (let j = 0; j < data.length; j++) {
            const cellValue = data[j][i];
            if (cellValue) {
                const cellLength = cellValue.toString().length;
                maxWidth = Math.max(maxWidth, cellLength + 2);
            }
        }
        colWidths.push({ wch: Math.min(maxWidth, 50) }); // Máximo 50 caracteres
    }
    
    if (colWidths.length > 0) {
        sheet['!cols'] = colWidths;
    }
};

export const exportToExcel = (data: ExcelExportData) => {
    const workbook = XLSX.utils.book_new();
    
    // Hoja 1: Totales por producto
    const totalsData = [
        ['MEGA DONUT - PEDIDOS POR CATEGORÍAS'],
        [''],
        [`DÍA: ${data.selectedDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).toUpperCase()}`],
        [`FILTRADO POR: ${data.dateFilterType === 'order' ? 'Fecha de Registro' : 'Fecha de Entrega'}`],
        [`CATEGORÍA: ${data.selectedCategory}`],
        [''],
        ['TOTALES POR PRODUCTO'],
        ['Producto', 'Cantidad Total']
    ];
    
    data.categoryProducts.forEach(product => {
        const total = data.getTotalForProduct(product.id, data.selectedCategory);
        totalsData.push([product.name, total]);
    });
    
    const totalsSheet = XLSX.utils.aoa_to_sheet(totalsData);
    applyStyles(totalsSheet, totalsData);
    XLSX.utils.book_append_sheet(workbook, totalsSheet, 'Totales');
    
    // Hoja 2: Detalle por rutas
    const routesData = [
        ['MEGA DONUT - DETALLE POR RUTAS'],
        [''],
        [`DÍA: ${data.selectedDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).toUpperCase()}`],
        [`FILTRADO POR: ${data.dateFilterType === 'order' ? 'Fecha de Registro' : 'Fecha de Entrega'}`],
        [`CATEGORÍA: ${data.selectedCategory}`],
        ['']
    ];
    
    let currentRow = 6; // Empezar después del header
    
    data.clientsByRoute.forEach(({ route, clients }) => {
        // Header de la ruta
        routesData.push([`RUTA: ${route.nombre} - ${route.identificador}`]);
        currentRow++;
        routesData.push(['']);
        currentRow++;
        
        // Headers de productos
        const productHeaders = ['Cliente', ...data.categoryProducts.map(p => p.name)];
        routesData.push(productHeaders);
        
        // Aplicar estilo a los headers de esta tabla
        const headerRow = currentRow;
        currentRow++;
        
        // Datos de clientes
        clients.forEach(client => {
            const row = [client.nombre];
            data.categoryProducts.forEach(product => {
                const quantity = data.getQuantityForClientAndProduct(client.id, product.id);
                row.push(quantity > 0 ? quantity : '');
            });
            routesData.push(row);
            currentRow++;
        });
        
        // Totales de la ruta
        const routeTotals = ['TOTAL RUTA'];
        data.categoryProducts.forEach(product => {
            const total = clients.reduce((sum, client) => {
                return sum + data.getQuantityForClientAndProduct(client.id, product.id);
            }, 0);
            routeTotals.push(total);
        });
        routesData.push(routeTotals);
        currentRow++;
        routesData.push(['']);
        currentRow++;
        routesData.push(['']);
        currentRow++;
    });
    
    const routesSheet = XLSX.utils.aoa_to_sheet(routesData);
    
    // Aplicar estilos específicos para la hoja de rutas
    const routesSheetStyled = XLSX.utils.aoa_to_sheet(routesData);
    
    // Estilos para títulos principales
    if (routesSheetStyled['A1']) routesSheetStyled['A1'].s = { font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } };
    if (routesSheetStyled['A3']) routesSheetStyled['A3'].s = { font: { bold: true, size: 12 } };
    if (routesSheetStyled['A4']) routesSheetStyled['A4'].s = { font: { bold: true, size: 12 } };
    
    // Ajustar ancho de columnas para la hoja de rutas
    const maxCols = Math.max(...routesData.map(row => row.length));
    const colWidths = [];
    for (let i = 0; i < maxCols; i++) {
        let maxWidth = 15; // Ancho mínimo para rutas
        for (let j = 0; j < routesData.length; j++) {
            const cellValue = routesData[j][i];
            if (cellValue) {
                const cellLength = cellValue.toString().length;
                maxWidth = Math.max(maxWidth, cellLength + 2);
            }
        }
        colWidths.push({ wch: Math.min(maxWidth, 30) }); // Máximo 30 para rutas
    }
    routesSheetStyled['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, routesSheetStyled, 'Detalle por Rutas');
    
    // Hoja 3: Resumen general
    const summaryData = [
        ['MEGA DONUT - RESUMEN GENERAL'],
        [''],
        [`DÍA: ${data.selectedDate.toLocaleDateString('es-ES', { 
            weekday: 'long', year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).toUpperCase()}`],
        [`FILTRADO POR: ${data.dateFilterType === 'order' ? 'Fecha de Registro' : 'Fecha de Entrega'}`],
        [`CATEGORÍA: ${data.selectedCategory}`],
        [''],
        ['RESUMEN'],
        ['Total Cantidad', data.getTotalForCategory(data.selectedCategory).quantity],
        ['Total Monto', data.getTotalForCategory(data.selectedCategory).amount],
        ['Rutas Activas', data.clientsByRoute.length],
        [''],
        ['Generado el', new Date().toLocaleDateString('es-ES')],
        ['Hora', new Date().toLocaleTimeString('es-ES')]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Aplicar estilos al resumen
    if (summarySheet['A1']) summarySheet['A1'].s = { font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } };
    if (summarySheet['A3']) summarySheet['A3'].s = { font: { bold: true, size: 12 } };
    if (summarySheet['A4']) summarySheet['A4'].s = { font: { bold: true, size: 12 } };
    if (summarySheet['A6']) summarySheet['A6'].s = { font: { bold: true, size: 14 }, alignment: { horizontal: 'center' } };
    
    // Estilos para las filas de datos del resumen
    for (let i = 7; i <= 10; i++) {
        const cellA = summarySheet[`A${i}`];
        const cellB = summarySheet[`B${i}`];
        if (cellA) cellA.s = { font: { bold: true, size: 11 } };
        if (cellB) cellB.s = { font: { size: 11 } };
    }
    
    // Ajustar ancho de columnas para el resumen
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    
    // Generar y descargar el archivo
    const fileName = `Mega-Donut-Categorias-${data.selectedCategory || 'Todas'}-${data.selectedDate.toLocaleDateString('es-ES')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};
