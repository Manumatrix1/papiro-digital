// pdf-loader-alternative.js - Cargador alternativo de PDF con mejor manejo de CORS
import { APP_CONFIG, logger } from './config.js';

export class AlternativePDFLoader {
    constructor() {
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    // Carga de PDF con múltiples estrategias anti-CORS
    async loadPDF(pdfUrl, onPassword = null) {
        const strategies = [
            () => this.loadWithCORS(pdfUrl, onPassword),
            () => this.loadWithProxy(pdfUrl, onPassword),
            () => this.loadAsBlob(pdfUrl, onPassword),
            () => this.loadWithNoCORS(pdfUrl, onPassword)
        ];

        for (let i = 0; i < strategies.length; i++) {
            try {
                logger.info(`Intentando estrategia ${i + 1} para cargar PDF...`);
                const result = await strategies[i]();
                logger.info(`PDF cargado exitosamente con estrategia ${i + 1}`);
                return result;
            } catch (error) {
                logger.warn(`Estrategia ${i + 1} falló:`, error.message);
                if (i === strategies.length - 1) {
                    throw new Error(`Todas las estrategias de carga fallaron. Último error: ${error.message}`);
                }
            }
        }
    }

    // Estrategia 1: Carga normal con CORS
    async loadWithCORS(pdfUrl, onPassword) {
        const config = {
            url: pdfUrl,
            withCredentials: false,
            onPassword: onPassword
        };
        
        return await pdfjsLib.getDocument(config).promise;
    }

    // Estrategia 2: Usar un proxy (GitHub CORS proxy)
    async loadWithProxy(pdfUrl, onPassword) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(pdfUrl)}`;
        
        const config = {
            url: proxyUrl,
            withCredentials: false,
            onPassword: onPassword
        };
        
        return await pdfjsLib.getDocument(config).promise;
    }

    // Estrategia 3: Cargar como blob y convertir
    async loadAsBlob(pdfUrl, onPassword) {
        // Intentar fetch directo primero
        const response = await fetch(pdfUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'Accept': 'application/pdf,*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        const config = {
            data: arrayBuffer,
            onPassword: onPassword
        };
        
        return await pdfjsLib.getDocument(config).promise;
    }

    // Estrategia 4: Sin CORS (último recurso)
    async loadWithNoCORS(pdfUrl, onPassword) {
        // Usar fetch con no-cors como último recurso
        try {
            const response = await fetch(pdfUrl, {
                mode: 'no-cors',
                credentials: 'omit'
            });

            // Con no-cors no podemos leer el contenido, así que intentamos carga directa
            const config = {
                url: pdfUrl,
                withCredentials: false,
                onPassword: onPassword,
                requestInit: {
                    mode: 'no-cors'
                }
            };
            
            return await pdfjsLib.getDocument(config).promise;
        } catch (error) {
            throw new Error(`No-CORS strategy failed: ${error.message}`);
        }
    }

    // Mostrar URLs alternativas para descarga manual
    showAlternativeOptions(pdfUrl, pdfName) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background: #181818; padding: 2rem; border-radius: 1rem;
                border: 1px solid #2a2a2a; max-width: 500px; text-align: center;
                color: white;
            ">
                <h2 style="color: #ef4444; margin-bottom: 1rem;">
                    🚫 No se puede cargar el PDF
                </h2>
                <p style="margin-bottom: 1.5rem; line-height: 1.5;">
                    Hay un problema de CORS. Mientras lo solucionamos, 
                    puedes descargar el PDF directamente:
                </p>
                <div style="margin-bottom: 1.5rem;">
                    <a href="${pdfUrl}" target="_blank" download="${pdfName}" style="
                        display: inline-block; background: #88c999; color: black;
                        padding: 0.75rem 1.5rem; text-decoration: none;
                        border-radius: 0.5rem; font-weight: bold; margin: 0.25rem;
                    ">
                        📥 Descargar PDF
                    </a>
                    <a href="${pdfUrl}" target="_blank" style="
                        display: inline-block; background: #3b82f6; color: white;
                        padding: 0.75rem 1.5rem; text-decoration: none;
                        border-radius: 0.5rem; font-weight: bold; margin: 0.25rem;
                    ">
                        🔗 Abrir en nueva pestaña
                    </a>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #6b7280; color: white; border: none;
                    padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;
                ">
                    Cerrar
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Función helper para usar en espacio.html
export async function loadPDFWithFallback(pdfUrl, pdfName, onPassword) {
    const loader = new AlternativePDFLoader();
    
    try {
        return await loader.loadPDF(pdfUrl, onPassword);
    } catch (error) {
        logger.error('Todas las estrategias de carga fallaron:', error);
        
        // Mostrar opciones alternativas
        loader.showAlternativeOptions(pdfUrl, pdfName);
        
        // Retornar null para que el código que llama pueda manejar el error
        return null;
    }
}