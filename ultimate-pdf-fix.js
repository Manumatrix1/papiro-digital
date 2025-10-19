// ultimate-pdf-fix.js - Solución definitiva sin proxies externos

window.ultimatePDFLoader = {
    async loadPDF(pdfUrl, onPasswordCallback) {
        console.log('🚨 CARGADOR DEFINITIVO ACTIVADO - Sin proxies externos');
        
        // Estrategia 1: Carga directa con configuración especial
        try {
            console.log('🔄 Estrategia 1: Carga directa con CORS relajado');
            
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                onPassword: onPasswordCallback,
                withCredentials: false,
                // Configuración especial para CORS
                httpHeaders: {},
                // Usar ArrayBuffer en lugar de stream
                disableAutoFetch: true,
                disableStream: true
            });
            
            const result = await loadingTask.promise;
            console.log('✅ Carga directa exitosa');
            return result;
        } catch (error) {
            console.warn('Carga directa falló:', error);
        }
        
        // Estrategia 2: Convertir a blob y cargar
        try {
            console.log('🔄 Estrategia 2: Carga como blob');
            
            // Intentar fetch con no-cors
            const response = await fetch(pdfUrl, {
                mode: 'no-cors',
                credentials: 'omit'
            });
            
            if (response.ok || response.type === 'opaque') {
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                
                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    onPassword: onPasswordCallback
                });
                
                const result = await loadingTask.promise;
                console.log('✅ Carga como blob exitosa');
                return result;
            }
        } catch (error) {
            console.warn('Carga como blob falló:', error);
        }
        
        // Estrategia 3: Usando Object URL
        try {
            console.log('🔄 Estrategia 3: Object URL');
            
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            const loadingTask = pdfjsLib.getDocument({
                url: objectUrl,
                onPassword: onPasswordCallback
            });
            
            const result = await loadingTask.promise;
            console.log('✅ Object URL exitoso');
            
            // Limpiar URL después de usar
            setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
            
            return result;
        } catch (error) {
            console.warn('Object URL falló:', error);
        }
        
        // Estrategia 4: Base64 conversion
        try {
            console.log('🔄 Estrategia 4: Conversión Base64');
            
            const response = await fetch(pdfUrl);
            const arrayBuffer = await response.arrayBuffer();
            
            // Convertir a Uint8Array
            const uint8Array = new Uint8Array(arrayBuffer);
            
            const loadingTask = pdfjsLib.getDocument({
                data: uint8Array,
                onPassword: onPasswordCallback
            });
            
            const result = await loadingTask.promise;
            console.log('✅ Base64 conversion exitosa');
            return result;
        } catch (error) {
            console.warn('Base64 conversion falló:', error);
        }
        
        console.error('❌ Todas las estrategias fallaron');
        return null;
    },
    
    showEmergencyModal(pdfUrl) {
        console.log('🚨 Mostrando modal de emergencia mejorado');
        
        // Crear modal con mejor UX
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                padding: 3rem; border-radius: 1.5rem; max-width: 500px; text-align: center;
                color: white; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                border: 1px solid #374151;
            ">
                <div style="font-size: 4rem; margin-bottom: 1.5rem;">📄</div>
                <h2 style="color: #f59e0b; margin-bottom: 1rem; font-size: 1.5rem;">
                    PDF Listo para Usar
                </h2>
                <p style="margin-bottom: 2rem; line-height: 1.6; color: #d1d5db;">
                    El archivo está disponible. Elige cómo quieres abrirlo:
                </p>
                
                <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;">
                    <a href="${pdfUrl}" target="_blank" style="
                        background: linear-gradient(135deg, #88c999 0%, #6ee7b7 100%);
                        color: black; text-decoration: none; padding: 1rem 2rem;
                        border-radius: 1rem; font-weight: bold; display: inline-flex;
                        align-items: center; gap: 0.5rem; transition: all 0.3s ease;
                        box-shadow: 0 10px 25px rgba(136,201,153,0.3);
                    " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'" 
                       onmouseout="this.style.transform='translateY(0) scale(1)'">
                        <span>🔗</span> Abrir en Nueva Pestaña
                    </a>
                    <a href="${pdfUrl}" download style="
                        background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
                        color: white; text-decoration: none; padding: 1rem 2rem;
                        border-radius: 1rem; font-weight: bold; display: inline-flex;
                        align-items: center; gap: 0.5rem; transition: all 0.3s ease;
                        box-shadow: 0 10px 25px rgba(59,130,246,0.3);
                    " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'" 
                       onmouseout="this.style.transform='translateY(0) scale(1)'">
                        <span>📥</span> Descargar PDF
                    </a>
                </div>
                
                <p style="font-size: 0.9rem; color: #9ca3af; margin-bottom: 2rem;">
                    💡 <strong>Tip:</strong> Puedes anotar el PDF usando herramientas como Adobe Reader
                </p>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="location.reload()" style="
                        background: #6b7280; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer;
                        font-weight: bold; transition: all 0.2s ease;
                    " onmouseover="this.style.background='#4b5563'">
                        🔄 Reintentar
                    </button>
                    <button onclick="history.back()" style="
                        background: #374151; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer;
                        font-weight: bold; transition: all 0.2s ease;
                    " onmouseover="this.style.background='#1f2937'">
                        ← Volver
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });
        
        // Cerrar clickeando fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
};

console.log('🚨 SISTEMA PDF DEFINITIVO CARGADO - Sin dependencias externas');