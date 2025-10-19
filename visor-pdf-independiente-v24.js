// 🎯 VISOR PDF INDEPENDIENTE v2.4 - Sin dependencias Firebase

console.log('🎯 VISOR PDF INDEPENDIENTE v2.4 INICIADO');

window.visorPDFIndependiente = {
    
    async iniciar() {
        console.log('🚀 === INICIANDO VISOR INDEPENDIENTE v2.4 ===');
        
        // 1. DETECTAR PARÁMETROS DE URL
        const urlParams = new URLSearchParams(window.location.search);
        const parametros = {
            id: urlParams.get('id'),
            pdfid: urlParams.get('pdfid'),
            url: urlParams.get('url'),
            file: urlParams.get('file')
        };
        
        console.log('📄 Parámetros detectados:', parametros);
        
        // 2. CONSTRUIR URLS ALTERNATIVAS
        const urlsParaProbar = [];
        
        // URL de Firebase Storage directa (formato público)
        if (parametros.id && parametros.id !== 'null') {
            const firebasePublicUrl = `https://firebasestorage.googleapis.com/v0/b/papiro2025-stcode.firebasestorage.app/o/${encodeURIComponent(parametros.id)}?alt=media`;
            urlsParaProbar.push(firebasePublicUrl);
            console.log('🔥 URL Firebase directa construida:', firebasePublicUrl);
        }
        
        // URLs de parámetros si existen y no son null
        Object.values(parametros).forEach(param => {
            if (param && param !== 'null' && param !== 'undefined') {
                if (param.startsWith('http')) {
                    urlsParaProbar.push(param);
                } else {
                    // Intentar construir URL Firebase con este parámetro
                    const fbUrl = `https://firebasestorage.googleapis.com/v0/b/papiro2025-stcode.firebasestorage.app/o/${encodeURIComponent(param)}?alt=media`;
                    urlsParaProbar.push(fbUrl);
                }
            }
        });
        
        // 3. URLs DE PRUEBA COMUNES
        const archivosComunes = ['test.pdf', 'sample.pdf', 'documento.pdf'];
        archivosComunes.forEach(archivo => {
            const testUrl = `https://firebasestorage.googleapis.com/v0/b/papiro2025-stcode.firebasestorage.app/o/${archivo}?alt=media`;
            urlsParaProbar.push(testUrl);
        });
        
        console.log('🎯 URLs para probar:', urlsParaProbar);
        
        if (urlsParaProbar.length === 0) {
            return this.mostrarError('No se encontraron URLs de PDF válidas');
        }
        
        // 4. PROBAR CADA URL HASTA ENCONTRAR UNA QUE FUNCIONE
        this.mostrarCargando('Buscando documento PDF...');
        
        for (let i = 0; i < urlsParaProbar.length; i++) {
            const url = urlsParaProbar[i];
            console.log(`🧪 Probando URL ${i + 1}/${urlsParaProbar.length}: ${url}`);
            
            this.mostrarCargando(`Probando fuente ${i + 1}/${urlsParaProbar.length}...`);
            
            try {
                const funciona = await this.verificarURL(url);
                if (funciona) {
                    console.log(`✅ ¡URL FUNCIONA! Cargando PDF: ${url}`);
                    return this.cargarPDF(url);
                }
            } catch (error) {
                console.log(`❌ URL ${i + 1} falló:`, error.message);
            }
        }
        
        // 5. SI NADA FUNCIONA, MOSTRAR SUBIDOR DE ARCHIVOS
        console.log('📁 Ninguna URL funcionó, mostrando subidor de archivos...');
        this.mostrarSubidorArchivos();
    },
    
    async verificarURL(url) {
        try {
            console.log('🔍 Verificando URL:', url);
            
            const response = await fetch(url, { 
                method: 'HEAD',
                mode: 'cors'
            });
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                console.log('✅ URL responde OK, Content-Type:', contentType);
                return true;
            } else {
                console.log('❌ URL responde con error:', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ Error verificando URL:', error.message);
            return false;
        }
    },
    
    async cargarPDF(url) {
        console.log('📱 Cargando PDF desde:', url);
        
        this.mostrarCargando('Cargando documento PDF...');
        
        try {
            // Verificar PDF.js
            if (!window.pdfjsLib) {
                throw new Error('PDF.js no está disponible');
            }
            
            // Cargar PDF
            const loadingTask = pdfjsLib.getDocument({
                url: url,
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
                disableWorker: false
            });
            
            const pdf = await loadingTask.promise;
            console.log('✅ PDF cargado exitosamente:', pdf.numPages, 'páginas');
            
            // Preparar interfaz
            this.prepararInterfaz();
            
            // Renderizar páginas
            await this.renderizarTodasLasPaginas(pdf);
            
            // Mostrar herramientas
            this.mostrarHerramientas();
            
            this.ocultarCargando();
            
            console.log('🎨 ¡PDF COMPLETO CARGADO CON HERRAMIENTAS!');
            
        } catch (error) {
            console.error('❌ Error cargando PDF:', error);
            this.mostrarError(`Error cargando PDF: ${error.message}`);
        }
    },
    
    async renderizarTodasLasPaginas(pdf) {
        const container = document.getElementById('pdf-container');
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            this.mostrarCargando(`Renderizando página ${pageNum}/${pdf.numPages}...`);
            
            const page = await pdf.getPage(pageNum);
            
            // Calcular escala
            const viewport = page.getViewport({ scale: 1.0 });
            const containerWidth = Math.min(window.innerWidth - 100, 800);
            const scale = containerWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });
            
            // Crear contenedor de página
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page';
            pageDiv.style.cssText = `
                position: relative;
                margin: 20px auto;
                background: white;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                border-radius: 8px;
                overflow: hidden;
                width: ${scaledViewport.width}px;
                height: ${scaledViewport.height}px;
            `;
            
            // Canvas principal (PDF)
            const pdfCanvas = document.createElement('canvas');
            pdfCanvas.width = scaledViewport.width;
            pdfCanvas.height = scaledViewport.height;
            pdfCanvas.style.cssText = `display: block; width: 100%; height: 100%;`;
            
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
            `;
            annotationCanvas.dataset.pageNum = pageNum;
            
            // Renderizar PDF
            const context = pdfCanvas.getContext('2d');
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            // Agregar elementos
            pageDiv.appendChild(pdfCanvas);
            pageDiv.appendChild(annotationCanvas);
            container.appendChild(pageDiv);
            
            // Configurar dibujo
            this.configurarDibujo(annotationCanvas);
            
            console.log(`✅ Página ${pageNum}/${pdf.numPages} renderizada`);
        }
    },
    
    configurarDibujo(canvas) {
        let drawing = false;
        const ctx = canvas.getContext('2d');
        
        // Configuración inicial
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Eventos de mouse
        canvas.addEventListener('mousedown', (e) => {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.lineTo(x, y);
            ctx.stroke();
        });
        
        canvas.addEventListener('mouseup', () => {
            drawing = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            drawing = false;
        });
        
        // Eventos táctiles para móviles
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!drawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            ctx.lineTo(x, y);
            ctx.stroke();
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            drawing = false;
        });
    },
    
    prepararInterfaz() {
        // Limpiar body
        document.body.innerHTML = '';
        document.body.style.cssText = `
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
            overflow-x: hidden;
        `;
        
        // Crear contenedor principal
        const container = document.createElement('div');
        container.id = 'pdf-container';
        container.style.cssText = `
            width: 100%;
            min-height: 100vh;
            padding: 20px 0;
            text-align: center;
            overflow-y: auto;
        `;
        
        document.body.appendChild(container);
        
        // Agregar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .pdf-tools {
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(255, 255, 255, 0.95);
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1000;
                backdrop-filter: blur(10px);
            }
            .pdf-tools button {
                margin: 0 8px 8px 0;
                padding: 10px 15px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                background: #007bff;
                color: white;
                transition: all 0.2s;
            }
            .pdf-tools button:hover {
                background: #0056b3;
                transform: translateY(-1px);
            }
            .pdf-tools button.active {
                background: #28a745;
            }
            .color-picker {
                margin: 8px 0;
            }
            .color-picker input[type="color"] {
                width: 40px;
                height: 30px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    },
    
    mostrarHerramientas() {
        const tools = document.createElement('div');
        tools.className = 'pdf-tools';
        tools.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #333;">🎨 Herramientas</div>
            <div>
                <button onclick="window.visorPDFIndependiente.setTool('pen')" id="pen-btn" class="active">✏️ Lápiz</button>
                <button onclick="window.visorPDFIndependiente.setTool('eraser')">🧽 Borrar</button>
            </div>
            <div class="color-picker">
                <label>Color: </label>
                <input type="color" value="#ff0000" onchange="window.visorPDFIndependiente.setColor(this.value)">
            </div>
            <div>
                <button onclick="window.visorPDFIndependiente.clearAll()">🗑️ Limpiar Todo</button>
                <button onclick="window.visorPDFIndependiente.saveAnnotations()">💾 Guardar</button>
            </div>
        `;
        document.body.appendChild(tools);
        
        this.currentTool = 'pen';
        this.currentColor = '#ff0000';
    },
    
    setTool(tool) {
        this.currentTool = tool;
        console.log('🛠️ Herramienta:', tool);
        
        // Actualizar botones
        document.querySelectorAll('.pdf-tools button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + '-btn').classList.add('active');
        
        // Cambiar cursor
        const canvases = document.querySelectorAll('.annotation-canvas');
        canvases.forEach(canvas => {
            canvas.style.cursor = tool === 'pen' ? 'crosshair' : 'grab';
        });
    },
    
    setColor(color) {
        this.currentColor = color;
        console.log('🎨 Color:', color);
        
        // Actualizar todos los canvas
        const canvases = document.querySelectorAll('.annotation-canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = color;
        });
    },
    
    clearAll() {
        const canvases = document.querySelectorAll('.annotation-canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        console.log('🗑️ Todas las anotaciones limpiadas');
    },
    
    saveAnnotations() {
        console.log('💾 Guardando anotaciones...');
        alert('Anotaciones guardadas localmente (función en desarrollo)');
    },
    
    mostrarSubidorArchivos() {
        this.ocultarCargando();
        
        const uploader = document.createElement('div');
        uploader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 40px; border-radius: 15px; 
                           text-align: center; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="font-size: 64px; margin-bottom: 20px;">📁</div>
                    <h2 style="margin-bottom: 20px; color: #333;">Cargar PDF</h2>
                    <p style="color: #666; margin-bottom: 30px;">No se encontró el PDF especificado. Selecciona un archivo PDF para continuar.</p>
                    <input type="file" accept=".pdf" id="pdf-file-input" style="display: none;">
                    <button onclick="document.getElementById('pdf-file-input').click()" 
                            style="background: #007bff; color: white; border: none; 
                                   padding: 15px 30px; border-radius: 8px; cursor: pointer; 
                                   font-size: 16px; margin: 10px;">
                        📁 Seleccionar PDF
                    </button>
                    <br>
                    <button onclick="window.location.href='/'" 
                            style="background: #6c757d; color: white; border: none; 
                                   padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        ← Volver al inicio
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(uploader);
        
        // Configurar subida de archivos
        document.getElementById('pdf-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                const url = URL.createObjectURL(file);
                uploader.remove();
                this.cargarPDF(url);
            }
        });
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
                <div style="background: white; padding: 40px; border-radius: 15px; text-align: center; max-width: 400px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
                    <div style="font-size: 20px; margin-bottom: 15px; color: #333;">Papiro Digital v2.4</div>
                    <div style="font-size: 16px; color: #666; margin-bottom: 25px;">${mensaje}</div>
                    <div style="width: 100%; height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; background: linear-gradient(90deg, #007bff, #28a745); 
                                    border-radius: 3px; animation: loading 2s infinite ease-in-out;"></div>
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
                           border-radius: 15px; text-align: center; max-width: 500px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                    <div style="font-size: 20px; margin-bottom: 15px; color: #c00;">Error</div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 25px;">${mensaje}</div>
                    <button onclick="window.location.reload()" 
                            style="background: #007bff; color: white; border: none; 
                                   padding: 12px 25px; border-radius: 8px; cursor: pointer; 
                                   font-size: 16px; margin: 0 10px;">
                        🔄 Reintentar
                    </button>
                    <button onclick="window.visorPDFIndependiente.mostrarSubidorArchivos()" 
                            style="background: #28a745; color: white; border: none; 
                                   padding: 12px 25px; border-radius: 8px; cursor: pointer; 
                                   font-size: 16px; margin: 0 10px;">
                        📁 Subir PDF
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(error);
    }
};

// Auto-ejecutar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM listo, iniciando visor independiente v2.4...');
    setTimeout(() => {
        window.visorPDFIndependiente.iniciar();
    }, 1000);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM ya listo, iniciando visor independiente v2.4...');
    setTimeout(() => {
        window.visorPDFIndependiente.iniciar();
    }, 1000);
}