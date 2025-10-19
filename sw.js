// sw.js - Service Worker para Papiro Digital
const CACHE_NAME = 'papiro-digital-v1.2.0';
const STATIC_CACHE_NAME = 'papiro-static-v1.2.0';

// Archivos críticos que deben estar disponibles offline
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/mi_tablero.html',
    '/admin.html',
    '/firebase-config.js',
    '/config.js',
    '/pdf-utils.js',
    '/style.css',
    // CDN resources que son críticos
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// Archivos que se pueden cachear de manera lazy
const LAZY_CACHE_ASSETS = [
    '/tablero_detalle.html',
    '/panel.html',
    '/espacio.html',
    '/pdf.js',
    '/pdf.worker.js'
];

// URLs que necesitan network-first strategy
const NETWORK_FIRST_PATTERNS = [
    /^https:\/\/.*\.googleapis\.com/,
    /^https:\/\/.*\.gstatic\.com/,
    /^https:\/\/.*\.firebaseapp\.com/,
    /^https:\/\/.*\.firebasestorage\.app/
];

// URLs que pueden usar cache-first strategy
const CACHE_FIRST_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /\.(?:js|css|woff|woff2|ttf)$/
];

self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Cache crítico
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('[SW] Cacheando recursos críticos...');
                return cache.addAll(CRITICAL_ASSETS.map(url => new Request(url, { mode: 'cors' })));
            }),
            // Cache lazy
            caches.open(CACHE_NAME).then(cache => {
                console.log('[SW] Preparando cache lazy...');
                // Pre-cache algunos recursos importantes
                return cache.addAll(LAZY_CACHE_ASSETS.slice(0, 2));
            })
        ]).catch(error => {
            console.warn('[SW] Error en instalación:', error);
        })
    );
    
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            cacheName !== CACHE_NAME && 
                            cacheName !== STATIC_CACHE_NAME
                        )
                        .map(cacheName => {
                            console.log('[SW] Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Reclamar control de todos los clientes
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar requests no GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar extensiones de Chrome
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Estrategia basada en el tipo de recurso
    if (shouldUseNetworkFirst(url)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (shouldUseCacheFirst(url)) {
        event.respondWith(cacheFirstStrategy(request));
    } else {
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

// Estrategia Network First (para APIs y recursos dinámicos)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cachear respuestas exitosas
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request.clone(), networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback para páginas HTML
        if (request.headers.get('accept')?.includes('text/html')) {
            const fallbackResponse = await caches.match('/index.html');
            if (fallbackResponse) {
                return fallbackResponse;
            }
        }
        
        throw error;
    }
}

// Estrategia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request.clone(), networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Failed to fetch and cache:', request.url);
        throw error;
    }
}

// Estrategia Stale While Revalidate (para contenido que cambia ocasionalmente)
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request.clone(), networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.log('[SW] Network error in SWR:', error);
        return null;
    });
    
    // Devolver cache inmediatamente si existe, sino esperar network
    if (cachedResponse) {
        fetchPromise; // Actualizar en background
        return cachedResponse;
    }
    
    const networkResponse = await fetchPromise;
    if (networkResponse) {
        return networkResponse;
    }
    
    // Último recurso: página de fallback
    if (request.headers.get('accept')?.includes('text/html')) {
        const fallback = await cache.match('/index.html');
        if (fallback) {
            return fallback;
        }
    }
    
    return new Response('Recurso no disponible offline', { 
        status: 503, 
        statusText: 'Service Unavailable' 
    });
}

// Determinar qué estrategia usar
function shouldUseNetworkFirst(url) {
    return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
}

function shouldUseCacheFirst(url) {
    return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    const { type, data } = event.data || {};
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            }).catch(error => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CACHE_PDF':
            if (data?.url && data?.id) {
                cachePDFResource(data.url, data.id).then(success => {
                    event.ports[0].postMessage({ success });
                });
            }
            break;
    }
});

// Limpiar todos los caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
}

// Cachear un PDF específico
async function cachePDFResource(url, id) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(`pdf-${id}`, response);
            return true;
        }
        return false;
    } catch (error) {
        console.log('[SW] Error caching PDF:', error);
        return false;
    }
}

// Manejar errores no capturados
self.addEventListener('error', event => {
    console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');