// force-emergency-load.js - Intercepta TODAS las cargas de PDF
// Este archivo fuerza que siempre se use el sistema de emergencia

console.log('🚨 FORZANDO CARGA DE EMERGENCIA - Interceptando PDF.js');

// Interceptar pdfjsLib.getDocument ANTES de que se use
const originalGetDocument = pdfjsLib.getDocument;

pdfjsLib.getDocument = function(source) {
    console.log('🚨 INTERCEPTADO: Carga de PDF detectada');
    console.log('Fuente original:', source);
    
    // Si es una URL de Firebase Storage, usar sistema de emergencia
    if (typeof source === 'object' && source.url && source.url.includes('firebasestorage')) {
        console.log('🚨 Firebase Storage detectado - Activando sistema de emergencia');
        
        // Retornar una promesa que use el sistema de emergencia
        return {
            promise: window.emergencyPDFLoader.loadPDF(source.url, source.onPassword)
        };
    }
    
    // Si no es Firebase, usar el método original pero con manejo de errores
    try {
        return originalGetDocument.call(this, source);
    } catch (error) {
        console.log('🚨 Error en carga normal - Activando emergencia:', error);
        
        if (typeof source === 'string') {
            return {
                promise: window.emergencyPDFLoader.loadPDF(source)
            };
        }
        
        throw error;
    }
};

console.log('✅ Interceptor de emergencia activado');