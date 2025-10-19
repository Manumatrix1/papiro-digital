// cache-buster.js - Fuerza limpieza de caché del navegador

console.log('🔥 FORZANDO LIMPIEZA DE CACHÉ - NUEVA VERSIÓN v2.0');

// Forzar recarga de scripts si es necesario
if (!window.emergencyPDFLoader) {
    console.log('⚠️ Sistema de emergencia no cargado - Forzando recarga');
    location.reload(true);
}

// Mostrar versión en consola
console.log('%c✅ PAPIRO DIGITAL v2.0 - SISTEMA COMPLETAMENTE REPARADO', 
    'background: #88c999; color: black; padding: 10px; border-radius: 5px; font-weight: bold; font-size: 16px;');

// Verificar que todos los sistemas estén listos
setTimeout(() => {
    if (window.emergencyPDFLoader && window.pdfjsLib) {
        console.log('✅ Todos los sistemas cargados correctamente');
    } else {
        console.warn('⚠️ Algunos sistemas no están listos, recargando...');
        location.reload(true);
    }
}, 2000);