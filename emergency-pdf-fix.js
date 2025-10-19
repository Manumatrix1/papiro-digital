// emergency-pdf-fix.js - Solución de emergencia para CORS
// Reemplaza completamente el sistema de carga de PDF

window.emergencyPDFLoader = {
    async loadPDF(pdfUrl, onPasswordCallback) {
        console.log('🚨 CARGADOR DE EMERGENCIA ACTIVADO');
        
        // Estrategia 1: Proxy CORS simple
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pdfUrl)}`;
            console.log('🔄 Intentando con proxy CORS:', proxyUrl);
            
            const loadingTask = pdfjsLib.getDocument({
                url: proxyUrl,
                onPassword: onPasswordCallback
            });
            
            return await loadingTask.promise;
        } catch (error) {
            console.warn('Proxy falló:', error);
        }
        
        // Estrategia 2: Otro proxy
        try {
            const altProxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(pdfUrl)}`;
            console.log('🔄 Intentando con proxy alternativo:', altProxy);
            
            const loadingTask = pdfjsLib.getDocument({
                url: altProxy,
                onPassword: onPasswordCallback
            });
            
            return await loadingTask.promise;
        } catch (error) {
            console.warn('Proxy alternativo falló:', error);
        }
        
        // Estrategia 3: Mostrar modal de emergencia
        this.showEmergencyModal(pdfUrl);
        return null;
    },
    
    showEmergencyModal(pdfUrl) {
        // Remover modal existente
        const existing = document.getElementById('emergency-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'emergency-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9); z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            font-family: Inter, sans-serif;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
                padding: 3rem; border-radius: 1.5rem;
                border: 2px solid #88c999; max-width: 600px; text-align: center;
                color: white; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 4rem; margin-bottom: 1.5rem; animation: bounce 2s infinite;">📚</div>
                <h1 style="color: #88c999; margin-bottom: 1rem; font-size: 1.75rem; font-weight: bold;">
                    ¡Problema técnico detectado!
                </h1>
                <p style="margin-bottom: 2rem; line-height: 1.6; color: #d1d5db; font-size: 1.1rem;">
                    El sistema de visualización de PDFs está experimentando problemas temporales.<br>
                    <strong>No te preocupes,</strong> tu documento está seguro y accesible.
                </p>
                
                <div style="background: rgba(136,201,153,0.1); padding: 1.5rem; border-radius: 1rem; border: 1px solid #88c999; margin-bottom: 2rem;">
                    <p style="color: #88c999; font-weight: bold; margin-bottom: 1rem;">💡 Soluciones disponibles:</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="${pdfUrl}" target="_blank" style="
                            background: #88c999; color: black; text-decoration: none;
                            padding: 1rem 2rem; border-radius: 0.75rem; font-weight: bold;
                            transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
                            box-shadow: 0 4px 15px rgba(136,201,153,0.3);
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(136,201,153,0.4)'" 
                           onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 15px rgba(136,201,153,0.3)'">
                            🔗 Abrir PDF directamente
                        </a>
                        <a href="${pdfUrl}" download style="
                            background: #3b82f6; color: white; text-decoration: none;
                            padding: 1rem 2rem; border-radius: 0.75rem; font-weight: bold;
                            transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
                            box-shadow: 0 4px 15px rgba(59,130,246,0.3);
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0px)'">
                            📥 Descargar PDF
                        </a>
                    </div>
                </div>
                
                <p style="font-size: 0.9rem; color: #9ca3af; margin-bottom: 2rem;">
                    ⚙️ Nuestro equipo técnico está trabajando para resolver este problema.<br>
                    Mientras tanto, puedes usar el PDF normalmente con los botones de arriba.
                </p>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="location.reload()" style="
                        background: #6b7280; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;
                        font-weight: bold; transition: all 0.2s ease;
                    " onmouseover="this.style.backgroundColor='#4b5563'" 
                       onmouseout="this.style.backgroundColor='#6b7280'">
                        🔄 Reintentar
                    </button>
                    <button onclick="window.history.back()" style="
                        background: transparent; color: #88c999; border: 2px solid #88c999;
                        padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;
                        font-weight: bold; transition: all 0.2s ease;
                    " onmouseover="this.style.backgroundColor='rgba(136,201,153,0.1)'" 
                       onmouseout="this.style.backgroundColor='transparent'">
                        ← Volver al tablero
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.history.back();
            }
        });
    }
};

// CSS para animación
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
`;
document.head.appendChild(style);

console.log('🚨 SISTEMA DE EMERGENCIA PDF CARGADO');