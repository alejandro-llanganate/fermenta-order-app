// Script para limpiar completamente el caché del navegador
// Ejecuta esto en la consola del navegador

// 1. Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// 2. Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpiado');

// 3. Limpiar variables globales de window
Object.keys(window).forEach(key => {
    if (key.startsWith('lastDataHash') || key.startsWith('lastTableBodyHash') || key.startsWith('lastRouteTablePropsHash') || key.startsWith('lastHeaderPropsHash')) {
        delete window[key];
    }
});
console.log('✅ Variables globales limpiadas');

// 4. Forzar recarga de la página
console.log('🔄 Recargando página...');
window.location.reload();
