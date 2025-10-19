// 🎯 DETECTOR Y CARGADOR PDF DEFINITIVO - v2.2

console.log('🎯 DETECTOR PDF DEFINITIVO v2.2 INICIADO');

window.detectorPDF = {
    
    async iniciar() {
        console.log('🚀 === INICIANDO DETECTOR PDF DEFINITIVO ===');
        
        // 1. DETECTAR TODAS LAS POSIBLES URLs DE PDF
        const urlParams = new URLSearchParams(window.location.search);
        const pdfSources = {
            id: urlParams.get('id'),
            pdfid: urlParams.get('pdfid'),
            url: urlParams.get('url'),
            file: urlParams.get('file'),
            document: urlParams.get('document')
        };
        
        console.log('📄 Parámetros detectados:', pdfSources);
        
        // 2. BUSCAR EN EL HTML URLs DE PDF
        const scriptTags = document.querySelectorAll('script');
        let pdfUrlEnScript = null;
        
        scriptTags.forEach(script => {
            const content = script.textContent || script.innerHTML;
            if (content.includes('firebase') || content.includes('pdf') || content.includes('.pdf')) {
                console.log('📜 Script con posible PDF:', content.substring(0, 200));
            }
        });
        
        // 3. BUSCAR EN VARIABLES GLOBALES
        const globalVars = {
            currentPdfUrl: window.currentPdfUrl,
            pdfUrl: window.pdfUrl,
            documentUrl: window.documentUrl,
            firebaseUrl: window.firebaseUrl
        };
        
        console.log('🌐 Variables globales:', globalVars);
        
        // 4. INTENTAR CONSTRUIR URL DE FIREBASE
        let firebaseUrl = null;
        if (pdfSources.id) {
            // Formato típico de Firebase Storage
            firebaseUrl = `gs://papiro2025-stcode.firebasestorage.app/${pdfSources.id}`;
            console.log('🔥 URL Firebase construida:', firebaseUrl);
        }
        
        if (pdfSources.pdfid && pdfSources.pdfid !== 'null') {
            firebaseUrl = pdfSources.pdfid;
            console.log('🔗 URL desde pdfid:', firebaseUrl);
        }
        
        // 5. PROBAR TODAS LAS URLs POSIBLES
        const urlsParaProbar = [
            firebaseUrl,
            pdfSources.pdfid,
            pdfSources.url,
            pdfSources.file,
            pdfSources.document,
            globalVars.currentPdfUrl,
            globalVars.pdfUrl,
            globalVars.documentUrl
        ].filter(url => url && url !== 'null' && url !== 'undefined');
        
        console.log('🎯 URLs para probar:', urlsParaProbar);
        
        if (urlsParaProbar.length === 0) {
            console.error('❌ NO SE ENCONTRARON URLs DE PDF');
            this.mostrarError('No se encontró ninguna URL de PDF válida');
            return;
        }
        
        // 6. PROBAR CADA URL
        for (const url of urlsParaProbar) {
            console.log(`🧪 Probando URL: ${url}`);
            
            try {
                const exito = await this.cargarPDF(url);
                if (exito) {
                    console.log(`✅ ¡ÉXITO! PDF cargado con URL: ${url}`);
                    return;
                }
            } catch (error) {
                console.log(`❌ Falló URL ${url}:`, error.message);
            }
        }
        
        console.error('🚨 TODAS LAS URLs FALLARON');
        this.mostrarError('No se pudo cargar el PDF con ninguna URL disponible');
    },
    
    async cargarPDF(pdfUrl) {
        console.log('📱 Cargando PDF:', pdfUrl);
        
        // Mostrar indicador de carga
        this.mostrarCargando();
        
        try {
            let urlFinal = pdfUrl;
            
            // Si es una URL de Firebase Storage, convertir a URL de descarga
            if (pdfUrl.startsWith('gs://') || pdfUrl.includes('firebasestorage')) {
                if (window.storage) {
                    console.log('🔥 Convirtiendo URL de Firebase...');
                    const storageRef = window.storage.ref().child(pdfUrl.replace('gs://papiro2025-stcode.firebasestorage.app/', ''));
                    urlFinal = await storageRef.getDownloadURL();
                    console.log('✅ URL de descarga obtenida:', urlFinal);
                } else {
                    throw new Error('Firebase Storage no disponible');
                }
            }
            
            // Cargar con PDF.js
            if (!window.pdfjsLib) {
                throw new Error('PDF.js no está disponible');
            }
            
            const loadingTask = pdfjsLib.getDocument({
                url: urlFinal,
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
                disableWorker: false
            });
            
            const pdf = await loadingTask.promise;
            console.log('✅ PDF cargado exitosamente:', pdf.numPages, 'páginas');
            
            // Renderizar el PDF
            await this.renderizarPDF(pdf);
            
            // Ocultar indicador de carga
            this.ocultarCargando();
            
            return true;
            
        } catch (error) {
            console.error('❌ Error cargando PDF:', error);
            throw error;
        }
    },
    
    async renderizarPDF(pdf) {
        console.log('🎨 Renderizando PDF...');
        
        // Limpiar y preparar contenedor
        let container = document.querySelector('#pdf-viewer, .pdf-viewer, #content, .content');
        
        if (!container) {
            // Crear contenedor principal
            container = document.createElement('div');
            container.id = 'pdf-viewer';
            container.style.cssText = `
                width: 100%;
                height: 100vh;
                overflow-y: auto;
                background: #f5f5f5;
                padding: 20px;
                box-sizing: border-box;
            `;
            
            // Reemplazar el contenido del body
            document.body.innerHTML = '';
            document.body.appendChild(container);
        } else {
            container.innerHTML = '';
        }
        
        // Renderizar cada página
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            
            // Calcular escala apropiada
            const viewport = page.getViewport({ scale: 1.0 });
            const containerWidth = container.clientWidth - 40; // Menos padding
            const scale = containerWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });
            
            // Contenedor de la página
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page-container';
            pageDiv.style.cssText = `
                position: relative;
                margin: 0 auto 20px auto;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                width: ${scaledViewport.width}px;
                height: ${scaledViewport.height}px;
            `;
            
            // Canvas para el PDF
            const canvas = document.createElement('canvas');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            canvas.style.cssText = `display: block; width: 100%; height: 100%;`;
            
            // Canvas para anotaciones
            const annotationCanvas = document.createElement('canvas');
            annotationCanvas.width = scaledViewport.width;
            annotationCanvas.height = scaledViewport.height;
            annotationCanvas.className = 'annotation-canvas';
            annotationCanvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                cursor: crosshair;
                pointer-events: auto;
            `;
            annotationCanvas.dataset.pageNum = pageNum;
            
            // Renderizar PDF en canvas
            const context = canvas.getContext('2d');
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            // Agregar elementos al contenedor
            pageDiv.appendChild(canvas);
            pageDiv.appendChild(annotationCanvas);
            container.appendChild(pageDiv);
            
            // Configurar herramientas de dibujo si están disponibles
            if (window.setupDrawingListeners) {
                window.setupDrawingListeners(annotationCanvas);
            }
            
            console.log(`✅ Página ${pageNum}/${pdf.numPages} renderizada`);
        }
        
        console.log('🎨 ¡PDF COMPLETO RENDERIZADO CON HERRAMIENTAS!');
    },
    
    mostrarCargando() {
        const loading = document.createElement('div');
        loading.id = 'pdf-loading-indicator';
        loading.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); z-index: 10000; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 15px;">📱</div>
                    <div style="font-size: 18px; margin-bottom: 10px;">Cargando PDF...</div>
                    <div style="font-size: 14px; color: #666;">Preparando herramientas de anotación</div>
                    <div style="margin-top: 15px; width: 200px; height: 4px; background: #eee; border-radius: 2px;">
                        <div style="height: 100%; background: #007bff; border-radius: 2px; 
                                    animation: loading 2s infinite ease-in-out;" id="loading-bar"></div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes loading {
                    0% { width: 0%; }
                    50% { width: 100%; }
                    100% { width: 0%; }
                }
            </style>
        `;
        document.body.appendChild(loading);
    },
    
    ocultarCargando() {
        const loading = document.getElementById('pdf-loading-indicator');
        if (loading) {
            loading.remove();
        }
    },
    
    mostrarError(mensaje) {
        this.ocultarCargando();
        
        const error = document.createElement('div');
        error.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); z-index: 10000; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: #fee; border: 2px solid #f00; padding: 30px; 
                           border-radius: 10px; text-align: center; max-width: 500px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
                    <div style="font-size: 18px; margin-bottom: 10px; color: #c00;">Error al cargar PDF</div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 20px;">${mensaje}</div>
                    <button onclick="window.location.reload()" 
                            style="background: #007bff; color: white; border: none; 
                                   padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(error);
    }
};

// Auto-ejecutar cuando esté todo listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando detector...');
    setTimeout(() => {
        window.detectorPDF.iniciar();
    }, 1000);
});

// También ejecutar si ya está listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM ya listo, iniciando detector...');
    setTimeout(() => {
        window.detectorPDF.iniciar();
    }, 1000);
}