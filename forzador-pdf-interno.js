// 🎯 FORZADOR PDF INTERNO - Carga PDFs directamente en el visor sin modales

console.log('🎯 FORZADOR PDF INTERNO INICIADO');

window.forzarPDFInterno = async function() {
    console.log('🚀 Forzando carga interna del PDF...');
    
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pdfId = urlParams.get('id');
    const pdfUrl = urlParams.get('pdfid');
    
    console.log('📄 PDF ID:', pdfId);
    console.log('🔗 PDF URL original:', pdfUrl);
    
    if (!pdfUrl) {
        console.error('❌ No hay URL de PDF en los parámetros');
        return false;
    }
    
    // CERRAR CUALQUIER MODAL QUE ESTÉ ABIERTO
    const modals = document.querySelectorAll('[id*="modal"], [class*="modal"]');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.remove();
    });
    console.log('🚫 Modales cerrados');
    
    // Mostrar mensaje de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: #2d3748; color: white; padding: 20px; border-radius: 10px; z-index: 9999;">
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">📱</div>
                <div>Cargando PDF en el visor interno...</div>
                <div style="font-size: 12px; margin-top: 5px; color: #a0aec0;">Preparando herramientas de anotación</div>
            </div>
        </div>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
        // Estrategia 1: Firebase Storage directo
        if (window.storage) {
            console.log('🔥 Intentando Firebase Storage...');
            try {
                const storageRef = window.storage.ref().child(pdfUrl);
                const downloadURL = await storageRef.getDownloadURL();
                console.log('✅ URL de Firebase obtenida:', downloadURL);
                
                const success = await cargarPDFEnVisorInterno(downloadURL);
                if (success) {
                    loadingDiv.remove();
                    return true;
                }
            } catch (error) {
                console.log('❌ Firebase falló:', error.message);
            }
        }
        
        // Estrategia 2: URL directa
        console.log('🔗 Intentando URL directa...');
        const success = await cargarPDFEnVisorInterno(pdfUrl);
        if (success) {
            loadingDiv.remove();
            return true;
        }
        
        // Estrategia 3: URL con timestamp (cache busting)
        console.log('⏰ Intentando con cache busting...');
        const urlConTimestamp = pdfUrl + (pdfUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
        const success2 = await cargarPDFEnVisorInterno(urlConTimestamp);
        if (success2) {
            loadingDiv.remove();
            return true;
        }
        
        throw new Error('Todas las estrategias fallaron');
        
    } catch (error) {
        console.error('❌ Error cargando PDF:', error);
        loadingDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #e53e3e; color: white; padding: 20px; border-radius: 10px; z-index: 9999;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
                    <div>No se pudo cargar el PDF internamente</div>
                    <div style="font-size: 12px; margin-top: 10px;">Error: ${error.message}</div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: white; color: #e53e3e; border: none; padding: 5px 15px; 
                                   border-radius: 5px; margin-top: 10px; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        return false;
    }
};

async function cargarPDFEnVisorInterno(pdfUrl) {
    console.log('📱 Cargando en visor interno:', pdfUrl);
    
    try {
        // Verificar que PDF.js esté disponible
        if (!window.pdfjsLib) {
            throw new Error('PDF.js no está disponible');
        }
        
        // Cargar el PDF
        const pdf = await pdfjsLib.getDocument({
            url: pdfUrl,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
            cMapPacked: true
        }).promise;
        
        console.log('✅ PDF cargado exitosamente:', pdf.numPages, 'páginas');
        
        // Limpiar contenedor PDF
        const pdfViewer = document.querySelector('#pdf-viewer, .pdf-viewer, #content, .content');
        if (pdfViewer) {
            pdfViewer.innerHTML = '';
        } else {
            // Crear contenedor si no existe
            const newViewer = document.createElement('div');
            newViewer.id = 'pdf-viewer';
            newViewer.style.cssText = `
                width: 100%;
                height: 100vh;
                overflow-y: auto;
                background: #f5f5f5;
                padding: 20px;
            `;
            document.body.appendChild(newViewer);
        }
        
        // Renderizar todas las páginas
        const container = pdfViewer || document.getElementById('pdf-viewer');
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            
            // Crear contenedor para la página
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page-container';
            pageContainer.style.cssText = `
                position: relative;
                margin-bottom: 20px;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: inline-block;
            `;
            
            // Canvas para el PDF
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.display = 'block';
            
            // Canvas para anotaciones
            const annotationCanvas = document.createElement('canvas');
            annotationCanvas.width = viewport.width;
            annotationCanvas.height = viewport.height;
            annotationCanvas.className = 'annotation-canvas';
            annotationCanvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                cursor: crosshair;
                pointer-events: auto;
            `;
            annotationCanvas.dataset.pageNum = pageNum;
            
            // Renderizar PDF
            const context = canvas.getContext('2d');
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            pageContainer.appendChild(canvas);
            pageContainer.appendChild(annotationCanvas);
            container.appendChild(pageContainer);
            
            // Configurar herramientas de dibujo
            if (window.setupDrawingListeners) {
                window.setupDrawingListeners(annotationCanvas);
            }
            
            console.log(`✅ Página ${pageNum} renderizada con herramientas`);
        }
        
        console.log('🎨 PDF completo cargado en el visor interno con herramientas de anotación');
        return true;
        
    } catch (error) {
        console.error('❌ Error en visor interno:', error);
        return false;
    }
}

// Auto-ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.forzarPDFInterno();
    }, 500);
});

// También ejecutar inmediatamente si ya está cargado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        window.forzarPDFInterno();
    }, 500);
}