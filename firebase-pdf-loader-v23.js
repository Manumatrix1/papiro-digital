// 🔥 INICIALIZADOR FIREBASE + DETECTOR PDF v2.3

console.log('🔥 INICIALIZADOR FIREBASE + DETECTOR PDF v2.3 INICIADO');

window.firebasePDFLoader = {
    
    async iniciar() {
        console.log('🚀 === INICIANDO SISTEMA COMPLETO v2.3 ===');
        
        // 1. VERIFICAR SI FIREBASE YA ESTÁ INICIALIZADO
        if (window.storage) {
            console.log('✅ Firebase Storage ya disponible');
            return this.cargarPDF();
        }
        
        // 2. ESPERAR A QUE FIREBASE SE INICIALICE
        console.log('⏳ Esperando inicialización de Firebase...');
        
        let intentos = 0;
        const maxIntentos = 20; // 10 segundos
        
        const esperarFirebase = () => {
            return new Promise((resolve) => {
                const checkFirebase = () => {
                    intentos++;
                    console.log(`🔍 Intento ${intentos}/${maxIntentos} - Verificando Firebase...`);
                    
                    if (window.storage && window.auth && window.db) {
                        console.log('✅ Firebase completamente inicializado');
                        resolve(true);
                        return;
                    }
                    
                    if (intentos >= maxIntentos) {
                        console.log('⚠️ Timeout esperando Firebase, intentando sin él...');
                        resolve(false);
                        return;
                    }
                    
                    setTimeout(checkFirebase, 500);
                };
                checkFirebase();
            });
        };
        
        const firebaseReady = await esperarFirebase();
        
        if (firebaseReady) {
            return this.cargarPDF();
        } else {
            return this.cargarPDFSinFirebase();
        }
    },
    
    async cargarPDF() {
        console.log('🎯 Cargando PDF con Firebase Storage...');
        
        // Obtener parámetros
        const urlParams = new URLSearchParams(window.location.search);
        const pdfId = urlParams.get('id');
        const pdfUrl = urlParams.get('pdfid');
        
        console.log('📄 PDF ID:', pdfId);
        console.log('🔗 PDF URL:', pdfUrl);
        
        if (!pdfId && !pdfUrl) {
            return this.mostrarError('No se encontraron parámetros de PDF');
        }
        
        // Mostrar carga
        this.mostrarCargando('Conectando con Firebase Storage...');
        
        try {
            // Construir referencia de Storage
            const fileName = pdfId || pdfUrl;
            console.log('📁 Buscando archivo:', fileName);
            
            const storageRef = window.storage.ref().child(fileName);
            console.log('🔥 Referencia de Storage creada');
            
            // Obtener URL de descarga
            const downloadURL = await storageRef.getDownloadURL();
            console.log('✅ URL de descarga obtenida:', downloadURL);
            
            // Cargar PDF con la URL obtenida
            return this.renderizarPDF(downloadURL);
            
        } catch (error) {
            console.error('❌ Error con Firebase Storage:', error);
            
            // Fallback: intentar URL directa
            if (pdfUrl && pdfUrl !== 'null') {
                console.log('🔄 Intentando fallback con URL directa...');
                return this.renderizarPDF(pdfUrl);
            }
            
            return this.mostrarError(`Error de Firebase: ${error.message}`);
        }
    },
    
    async cargarPDFSinFirebase() {
        console.log('📱 Cargando PDF sin Firebase (modo directo)...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const pdfUrl = urlParams.get('pdfid');
        
        if (!pdfUrl || pdfUrl === 'null') {
            return this.mostrarError('No hay URL de PDF disponible para modo directo');
        }
        
        this.mostrarCargando('Cargando PDF en modo directo...');
        return this.renderizarPDF(pdfUrl);
    },
    
    async renderizarPDF(pdfUrl) {
        console.log('🎨 Renderizando PDF desde:', pdfUrl);
        
        try {
            // Verificar PDF.js
            if (!window.pdfjsLib) {
                throw new Error('PDF.js no está disponible');
            }
            
            this.mostrarCargando('Procesando documento PDF...');
            
            // Cargar PDF
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
                disableWorker: false
            });
            
            const pdf = await loadingTask.promise;
            console.log('✅ PDF cargado exitosamente:', pdf.numPages, 'páginas');
            
            this.mostrarCargando(`Renderizando ${pdf.numPages} páginas...`);
            
            // Limpiar y preparar contenedor
            this.prepararContenedor();
            
            // Renderizar cada página
            const container = document.getElementById('pdf-viewer-container');
            
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                this.mostrarCargando(`Renderizando página ${pageNum}/${pdf.numPages}...`);
                
                const page = await pdf.getPage(pageNum);
                
                // Calcular escala
                const viewport = page.getViewport({ scale: 1.0 });
                const containerWidth = window.innerWidth - 80; // Margin
                const scale = Math.min(containerWidth / viewport.width, 2.0);
                const scaledViewport = page.getViewport({ scale });
                
                // Crear contenedor de página
                const pageDiv = document.createElement('div');
                pageDiv.className = 'pdf-page-container';
                pageDiv.style.cssText = `
                    position: relative;
                    margin: 20px auto;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    width: ${scaledViewport.width}px;
                    height: ${scaledViewport.height}px;
                `;
                
                // Canvas principal
                const canvas = document.createElement('canvas');
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;
                canvas.style.cssText = `display: block; width: 100%; height: 100%;`;
                
                // Canvas de anotaciones
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
                
                // Renderizar PDF
                const context = canvas.getContext('2d');
                await page.render({
                    canvasContext: context,
                    viewport: scaledViewport
                }).promise;
                
                // Agregar a contenedor
                pageDiv.appendChild(canvas);
                pageDiv.appendChild(annotationCanvas);
                container.appendChild(pageDiv);
                
                // Configurar herramientas de dibujo
                this.configurarHerramientasDibujo(annotationCanvas);
                
                console.log(`✅ Página ${pageNum}/${pdf.numPages} renderizada`);
            }
            
            this.ocultarCargando();
            this.mostrarControles();
            
            console.log('🎨 ¡PDF COMPLETO CARGADO CON HERRAMIENTAS DE ANOTACIÓN!');
            
        } catch (error) {
            console.error('❌ Error renderizando PDF:', error);
            this.mostrarError(`Error cargando PDF: ${error.message}`);
        }
    },
    
    prepararContenedor() {
        // Limpiar body
        document.body.innerHTML = '';
        
        // Crear contenedor principal
        const container = document.createElement('div');
        container.id = 'pdf-viewer-container';
        container.style.cssText = `
            width: 100%;
            min-height: 100vh;
            background: #f5f5f5;
            padding: 20px 0;
            text-align: center;
            overflow-y: auto;
        `;
        
        document.body.appendChild(container);
        
        // Agregar estilos para las herramientas
        const style = document.createElement('style');
        style.textContent = `
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .pdf-tools { 
                position: fixed; 
                top: 20px; 
                left: 20px; 
                background: white; 
                padding: 10px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .pdf-tools button {
                margin: 0 5px;
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                background: #007bff;
                color: white;
            }
            .pdf-tools button:hover { background: #0056b3; }
            .pdf-tools button.active { background: #28a745; }
        `;
        document.head.appendChild(style);
    },
    
    mostrarControles() {
        const tools = document.createElement('div');
        tools.className = 'pdf-tools';
        tools.innerHTML = `
            <button onclick="window.firebasePDFLoader.setTool('pen')">✏️ Lápiz</button>
            <button onclick="window.firebasePDFLoader.setTool('eraser')">🧽 Borrar</button>
            <button onclick="window.firebasePDFLoader.clearAll()">🗑️ Limpiar Todo</button>
            <button onclick="window.firebasePDFLoader.save()">💾 Guardar</button>
        `;
        document.body.appendChild(tools);
        
        // Herramienta por defecto
        this.currentTool = 'pen';
    },
    
    configurarHerramientasDibujo(canvas) {
        let drawing = false;
        const ctx = canvas.getContext('2d');
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        canvas.addEventListener('mousedown', (e) => {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        });
        
        canvas.addEventListener('mouseup', () => {
            drawing = false;
        });
        
        console.log('✅ Herramientas de dibujo configuradas para página', canvas.dataset.pageNum);
    },
    
    setTool(tool) {
        this.currentTool = tool;
        console.log('🛠️ Herramienta cambiada a:', tool);
    },
    
    clearAll() {
        const canvases = document.querySelectorAll('.annotation-canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        console.log('🗑️ Todas las anotaciones limpiadas');
    },
    
    save() {
        console.log('💾 Guardando anotaciones...');
        alert('Función de guardado en desarrollo');
    },
    
    mostrarCargando(mensaje = 'Cargando...') {
        let loading = document.getElementById('loading-indicator');
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'loading-indicator';
            document.body.appendChild(loading);
        }
        
        loading.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); z-index: 10000; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 400px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
                    <div style="font-size: 18px; margin-bottom: 15px;">Papiro Digital v2.3</div>
                    <div style="font-size: 16px; color: #333; margin-bottom: 20px;">${mensaje}</div>
                    <div style="width: 100%; height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; background: linear-gradient(90deg, #007bff, #28a745); 
                                    border-radius: 3px; animation: progress 2s infinite ease-in-out;"></div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 100%; }
                    100% { width: 0%; }
                }
            </style>
        `;
    },
    
    ocultarCargando() {
        const loading = document.getElementById('loading-indicator');
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
                <div style="background: #fee; border: 3px solid #f00; padding: 40px; 
                           border-radius: 10px; text-align: center; max-width: 500px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                    <div style="font-size: 20px; margin-bottom: 15px; color: #c00;">Error al cargar PDF</div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 25px;">${mensaje}</div>
                    <button onclick="window.location.reload()" 
                            style="background: #007bff; color: white; border: none; 
                                   padding: 12px 25px; border-radius: 6px; cursor: pointer; 
                                   font-size: 16px;">
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(error);
    }
};

// Ejecutar cuando todo esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM listo, iniciando sistema v2.3...');
    setTimeout(() => {
        window.firebasePDFLoader.iniciar();
    }, 1500);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM ya cargado, iniciando sistema v2.3...');
    setTimeout(() => {
        window.firebasePDFLoader.iniciar();
    }, 1500);
}