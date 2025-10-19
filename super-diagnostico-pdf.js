// 🔬 SUPER DIAGNÓSTICO PDF - Detecta exactamente por qué no carga

console.log('🔬 INICIANDO SUPER DIAGNÓSTICO PDF...');

window.superDiagnosticoPDF = {
    
    async diagnosticar() {
        console.log('🔍 === DIAGNÓSTICO COMPLETO INICIADO ===');
        
        // 1. Verificar URL del PDF
        const urlParams = new URLSearchParams(window.location.search);
        const pdfId = urlParams.get('id');
        const pdfUrl = urlParams.get('pdfid');
        
        console.log('📄 PDF ID:', pdfId);
        console.log('🔗 PDF URL:', pdfUrl);
        
        if (!pdfUrl) {
            console.error('❌ NO HAY URL DE PDF - Esto es el problema principal');
            return;
        }
        
        // 2. Probar acceso directo
        try {
            console.log('🧪 Probando acceso directo...');
            const response = await fetch(pdfUrl, { mode: 'no-cors' });
            console.log('✅ Acceso directo:', response.status);
        } catch (error) {
            console.log('❌ Acceso directo falló:', error.message);
        }
        
        // 3. Probar con CORS
        try {
            console.log('🧪 Probando con CORS...');
            const response = await fetch(pdfUrl, { mode: 'cors' });
            console.log('✅ CORS funcionando:', response.status);
        } catch (error) {
            console.log('❌ CORS falló:', error.message);
        }
        
        // 4. Verificar PDF.js
        if (window.pdfjsLib) {
            console.log('✅ PDF.js cargado correctamente');
            try {
                console.log('🧪 Probando PDF.js directo...');
                const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
                console.log('✅ PDF.js puede cargar el archivo:', pdf.numPages, 'páginas');
            } catch (error) {
                console.log('❌ PDF.js falló:', error.message);
            }
        } else {
            console.error('❌ PDF.js NO está cargado');
        }
        
        // 5. Verificar Firebase Storage
        if (window.storage) {
            console.log('✅ Firebase Storage disponible');
            try {
                console.log('🧪 Probando descarga directa desde Firebase...');
                const storageRef = window.storage.ref().child(pdfUrl);
                const downloadURL = await storageRef.getDownloadURL();
                console.log('✅ URL de descarga Firebase:', downloadURL);
                
                // Probar cargar con esta URL
                const pdf = await pdfjsLib.getDocument(downloadURL).promise;
                console.log('🎯 ¡ÉXITO! Firebase + PDF.js funciona:', pdf.numPages, 'páginas');
                
                // CARGAR EL PDF EN EL VISOR
                window.loadPDFInViewer(downloadURL);
                return;
                
            } catch (error) {
                console.log('❌ Firebase Storage falló:', error.message);
            }
        } else {
            console.error('❌ Firebase Storage NO disponible');
        }
        
        console.log('🚨 === DIAGNÓSTICO COMPLETO - TODAS LAS ESTRATEGIAS FALLARON ===');
    }
};

// Función para cargar PDF en el visor
window.loadPDFInViewer = async function(pdfUrl) {
    console.log('📱 Cargando PDF en el visor interno...');
    
    try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        console.log('✅ PDF cargado exitosamente:', pdf.numPages, 'páginas');
        
        // Renderizar primera página
        const page = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.getElementById('pdf-canvas') || document.createElement('canvas');
        canvas.id = 'pdf-canvas';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Limpiar contenedor y agregar canvas
        const container = document.getElementById('pdf-container') || document.body;
        container.innerHTML = '';
        container.appendChild(canvas);
        
        const context = canvas.getContext('2d');
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        console.log('🎨 PDF renderizado en el visor interno');
        
        // Cerrar modal de emergencia si existe
        const modal = document.getElementById('emergency-pdf-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error cargando PDF en visor:', error);
        return false;
    }
};

// Auto-ejecutar diagnóstico
setTimeout(() => {
    window.superDiagnosticoPDF.diagnosticar();
}, 1000);