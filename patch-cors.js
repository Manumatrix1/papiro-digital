// patch-cors.js - Parche rápido para el problema de CORS
// Incluir este script en espacio.html para solucionar temporalmente CORS

window.patchCORSForPapiroDigital = function() {
    console.log('🔧 Aplicando parche CORS para Papiro Digital...');
    
    // Interceptar todas las requests de PDF.js
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
        const [resource, config = {}] = args;
        
        // Si es una request a Firebase Storage, aplicar configuraciones especiales
        if (typeof resource === 'string' && resource.includes('firebasestorage.googleapis.com')) {
            console.log('🔍 Interceptando request a Firebase Storage:', resource);
            
            const corsConfig = {
                ...config,
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    ...config.headers,
                    'Accept': 'application/pdf,*/*',
                    'Origin': window.location.origin
                }
            };
            
            try {
                // Intentar con CORS normal
                const response = await originalFetch(resource, corsConfig);
                if (response.ok) {
                    console.log('✅ PDF cargado exitosamente con CORS');
                    return response;
                }
            } catch (error) {
                console.warn('⚠️ CORS falló, intentando estrategia alternativa...', error);
            }
            
            // Si falla, intentar con proxy
            try {
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(resource)}`;
                console.log('🔄 Intentando con proxy:', proxyUrl);
                
                const proxyResponse = await originalFetch(proxyUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                if (proxyResponse.ok) {
                    console.log('✅ PDF cargado exitosamente con proxy');
                    return proxyResponse;
                }
            } catch (proxyError) {
                console.error('❌ Proxy también falló:', proxyError);
            }
            
            // Último recurso: mostrar modal de descarga
            showDownloadModal(resource);
            throw new Error('CORS_BLOCKED: No se puede cargar el PDF debido a restricciones CORS');
        }
        
        // Para todas las demás requests, usar fetch normal
        return originalFetch(...args);
    };
    
    function showDownloadModal(pdfUrl) {
        const modal = document.createElement('div');
        modal.id = 'cors-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background: #181818; padding: 2rem; border-radius: 1rem;
                border: 1px solid #2a2a2a; max-width: 500px; text-align: center;
                color: white; font-family: Inter, sans-serif;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <h2 style="color: #ef4444; margin-bottom: 1rem;">
                    Problema de CORS detectado
                </h2>
                <p style="margin-bottom: 1.5rem; line-height: 1.6; color: #d1d5db;">
                    No podemos mostrar el PDF en el visor debido a restricciones de seguridad. 
                    <br><strong>Solución temporal:</strong>
                </p>
                <div style="margin-bottom: 1.5rem;">
                    <a href="${pdfUrl}" target="_blank" style="
                        display: inline-block; background: #88c999; color: black;
                        padding: 0.75rem 1.5rem; text-decoration: none;
                        border-radius: 0.5rem; font-weight: bold; margin: 0.25rem;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#76b087'" 
                       onmouseout="this.style.backgroundColor='#88c999'">
                        🔗 Abrir PDF en nueva pestaña
                    </a>
                </div>
                <p style="font-size: 0.875rem; color: #9ca3af; margin-bottom: 1rem;">
                    El administrador está solucionando este problema.<br>
                    Mientras tanto, puedes usar el PDF en una nueva pestaña.
                </p>
                <button onclick="document.getElementById('cors-modal').remove(); window.history.back();" style="
                    background: #6b7280; color: white; border: none;
                    padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;
                    transition: background-color 0.2s ease;
                " onmouseover="this.style.backgroundColor='#4b5563'" 
                   onmouseout="this.style.backgroundColor='#6b7280'">
                    ← Volver al tablero
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                window.history.back();
            }
        });
    }
    
    console.log('✅ Parche CORS aplicado correctamente');
};

// Auto-aplicar el parche cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.patchCORSForPapiroDigital);
} else {
    window.patchCORSForPapiroDigital();
}