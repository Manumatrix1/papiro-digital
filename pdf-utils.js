// pdf-utils.js - Utilidades optimizadas para el visor de PDF
import { APP_CONFIG, logger } from './config.js';

export class PDFRenderer {
    constructor() {
        this.renderCache = new Map();
        this.renderQueue = [];
        this.isRendering = false;
        this.abortController = new AbortController();
    }

    // Renderizar página con caché y cola de prioridad
    async renderPage(pageContainer, pageNum, pdfDocument, priority = 'normal') {
        const cacheKey = `page_${pageNum}`;
        
        // Verificar si ya está en caché
        if (this.renderCache.has(cacheKey)) {
            const cachedData = this.renderCache.get(cacheKey);
            this.applyCachedRender(pageContainer, cachedData);
            return;
        }

        // Agregar a la cola de renderizado
        const renderTask = {
            pageContainer,
            pageNum,
            pdfDocument,
            priority: priority === 'high' ? 1 : 0,
            timestamp: Date.now()
        };

        this.renderQueue.push(renderTask);
        this.renderQueue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);

        // Procesar cola si no está ya procesando
        if (!this.isRendering) {
            this.processRenderQueue();
        }
    }

    async processRenderQueue() {
        this.isRendering = true;

        while (this.renderQueue.length > 0 && !this.abortController.signal.aborted) {
            const task = this.renderQueue.shift();
            
            try {
                await this.doRender(task);
            } catch (error) {
                logger.error('Error al renderizar página:', error);
            }
        }

        this.isRendering = false;
    }

    async doRender({ pageContainer, pageNum, pdfDocument }) {
        try {
            // Verificar si el contenedor sigue siendo visible
            if (!pageContainer.isConnected) {
                return;
            }

            const page = await pdfDocument.getPage(pageNum);
            const scale = APP_CONFIG.PDF.RENDER_SCALE;
            const viewport = page.getViewport({ scale });

            // Crear canvas principales
            const canvas = document.createElement('canvas');
            const annotationCanvas = document.createElement('canvas');
            
            canvas.width = annotationCanvas.width = viewport.width;
            canvas.height = annotationCanvas.height = viewport.height;
            
            annotationCanvas.className = 'annotation-canvas';
            annotationCanvas.dataset.pageNum = pageNum;

            // Configurar contexto con optimizaciones
            const context = canvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });

            // Renderizar página
            await page.render({
                canvasContext: context,
                viewport,
                intent: 'display'
            }).promise;

            // Aplicar al DOM de manera eficiente
            requestAnimationFrame(() => {
                if (pageContainer.isConnected && !this.abortController.signal.aborted) {
                    pageContainer.innerHTML = '';
                    pageContainer.append(canvas, annotationCanvas);
                    
                    // Guardar en caché
                    this.renderCache.set(`page_${pageNum}`, {
                        canvas: canvas.cloneNode(true),
                        annotationCanvas: annotationCanvas.cloneNode(true)
                    });

                    // Limpiar caché si es muy grande
                    if (this.renderCache.size > 20) {
                        const firstKey = this.renderCache.keys().next().value;
                        this.renderCache.delete(firstKey);
                    }
                }
            });

        } catch (error) {
            if (error.name !== 'AbortError') {
                logger.error(`Error renderizando página ${pageNum}:`, error);
            }
        }
    }

    applyCachedRender(pageContainer, cachedData) {
        requestAnimationFrame(() => {
            pageContainer.innerHTML = '';
            pageContainer.append(
                cachedData.canvas.cloneNode(true),
                cachedData.annotationCanvas.cloneNode(true)
            );
        });
    }

    // Limpiar recursos
    destroy() {
        this.abortController.abort();
        this.renderCache.clear();
        this.renderQueue.length = 0;
        this.isRendering = false;
    }
}

export class PerformanceOptimizer {
    constructor() {
        this.performanceObserver = null;
        this.memoryCheckInterval = null;
    }

    // Inicializar monitoreo de rendimiento
    initialize() {
        this.startPerformanceMonitoring();
        this.startMemoryMonitoring();
        this.optimizeScrolling();
    }

    startPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.duration > 100) { // Más de 100ms
                            logger.warn(`Operación lenta detectada: ${entry.name} - ${entry.duration}ms`);
                        }
                    });
                });
                
                this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (error) {
                logger.debug('PerformanceObserver no disponible:', error);
            }
        }
    }

    startMemoryMonitoring() {
        this.memoryCheckInterval = setInterval(() => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                
                if (usedPercent > 80) {
                    logger.warn(`Uso de memoria alto: ${usedPercent.toFixed(2)}%`);
                    this.triggerGarbageCollection();
                }
            }
        }, 30000); // Cada 30 segundos
    }

    optimizeScrolling() {
        // Optimizar scroll con throttling
        let ticking = false;
        
        const optimizedScroll = (callback) => {
            return (...args) => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        callback.apply(this, args);
                        ticking = false;
                    });
                    ticking = true;
                }
            };
        };

        // Aplicar a elementos de scroll existentes
        document.querySelectorAll('.scroll-wrapper').forEach(element => {
            const originalHandler = element.onscroll;
            if (originalHandler) {
                element.onscroll = optimizedScroll(originalHandler);
            }
        });
    }

    triggerGarbageCollection() {
        logger.info('Ejecutando limpieza de memoria...');
        
        // Limpiar referencias no utilizadas
        if (window.pdfRenderer) {
            window.pdfRenderer.renderCache.clear();
        }
        
        // Forzar garbage collection si está disponible
        if (window.gc) {
            window.gc();
        }
    }

    destroy() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
        }
    }
}

export class TouchOptimizer {
    constructor() {
        this.touchCache = [];
        this.lastTouchEnd = 0;
    }

    // Optimizar eventos táctiles
    optimizeTouchEvents(element) {
        // Prevenir zoom por defecto en iOS
        element.addEventListener('touchmove', (e) => {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Optimizar doble tap
        element.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - this.lastTouchEnd <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, { passive: false });

        // Gestión mejorada de multi-touch
        element.addEventListener('touchstart', (e) => {
            this.touchCache = Array.from(e.touches);
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            this.touchCache = Array.from(e.touches);
        }, { passive: true });
    }

    // Detectar gestos complejos
    detectPinchGesture(touches) {
        if (touches.length !== 2) return null;

        const [touch1, touch2] = touches;
        const distance = Math.hypot(
            touch1.pageX - touch2.pageX,
            touch1.pageY - touch2.pageY
        );

        return {
            distance,
            center: {
                x: (touch1.pageX + touch2.pageX) / 2,
                y: (touch1.pageY + touch2.pageY) / 2
            }
        };
    }
}

export class IndexedDBManager {
    constructor() {
        this.dbName = APP_CONFIG.INDEXEDDB.NAME;
        this.version = APP_CONFIG.INDEXEDDB.VERSION;
        this.storeName = APP_CONFIG.INDEXEDDB.STORE_NAME;
        this.db = null;
    }

    async initialize() {
        try {
            this.db = await this.openDB();
            logger.info('IndexedDB inicializado correctamente');
        } catch (error) {
            logger.error('Error al inicializar IndexedDB:', error);
        }
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('size', 'size', { unique: false });
                }
            };
        });
    }

    async savePDF(id, data, metadata = {}) {
        if (!this.db) return false;

        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            await store.put({
                id,
                data,
                timestamp: Date.now(),
                size: data.byteLength || 0,
                ...metadata
            });

            // Limpiar datos antiguos si es necesario
            await this.cleanOldData();
            
            return true;
        } catch (error) {
            logger.error('Error al guardar PDF en IndexedDB:', error);
            return false;
        }
    }

    async getPDF(id) {
        if (!this.db) return null;

        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? result.data : null);
                };
                request.onerror = () => resolve(null);
            });
        } catch (error) {
            logger.error('Error al obtener PDF de IndexedDB:', error);
            return null;
        }
    }

    async cleanOldData() {
        const maxEntries = 10;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
        
        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const timestampIndex = store.index('timestamp');
            
            const cutoffTime = Date.now() - maxAge;
            const range = IDBKeyRange.upperBound(cutoffTime);
            
            // Eliminar entradas antiguas
            await timestampIndex.openCursor(range).then(cursor => {
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            });

            // Mantener solo las últimas N entradas
            const allEntries = await store.getAll();
            if (allEntries.length > maxEntries) {
                const sorted = allEntries.sort((a, b) => b.timestamp - a.timestamp);
                const toDelete = sorted.slice(maxEntries);
                
                for (const entry of toDelete) {
                    await store.delete(entry.id);
                }
            }
            
        } catch (error) {
            logger.error('Error al limpiar datos antiguos:', error);
        }
    }
}

// Utilidades de medición de rendimiento
export const PerformanceUtils = {
    measure: (name, fn) => {
        return async (...args) => {
            performance.mark(`${name}-start`);
            try {
                const result = await fn(...args);
                performance.mark(`${name}-end`);
                performance.measure(name, `${name}-start`, `${name}-end`);
                return result;
            } catch (error) {
                performance.mark(`${name}-error`);
                performance.measure(`${name}-error`, `${name}-start`, `${name}-error`);
                throw error;
            }
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    debounce: (func, wait, immediate) => {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
};