// config.js - Configuración global de Papiro Digital
export const APP_CONFIG = {
    // Información de la aplicación
    APP_NAME: 'Papiro Digital',
    VERSION: '1.2.0',
    
    // URLs y rutas
    PAGES: {
        LOGIN: 'index.html',
        DASHBOARD: 'mi_tablero.html',
        PROJECT_DETAIL: 'tablero_detalle.html',
        PDF_VIEWER: 'espacio.html',
        ADMIN_LOGIN: 'admin.html',
        ADMIN_PANEL: 'panel.html'
    },
    
    // Configuración de PDF
    PDF: {
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB en bytes
        ALLOWED_TYPES: ['application/pdf'],
        RENDER_SCALE: 2.0,
        ZOOM_MIN: 1.0,
        ZOOM_MAX: 5.0,
        INTERSECTION_MARGIN: '500px 0px'
    },
    
    // Configuración de anotaciones
    ANNOTATIONS: {
        DEFAULT_COLOR: '#FFDD00',
        COLORS: {
            YELLOW: '#FFDD00',
            GREEN: '#88c999',
            BLUE: '#4A90E2',
            RED: '#E74C3C',
            ORANGE: '#F39C12',
            PURPLE: '#9B59B6'
        },
        TOOLS: {
            SELECT: 'select',
            DRAW: 'draw',
            HIGHLIGHT: 'highlight',
            ERASE: 'erase'
        },
        LINE_WIDTHS: {
            DRAW: 3,
            HIGHLIGHT: 20,
            ERASE: 40
        }
    },
    
    // Configuración de UI
    UI: {
        LOADER_TIMEOUT: 10000, // 10 segundos
        PROMOTE_BUTTON_TIMEOUT: 5000, // 5 segundos
        DEBOUNCE_DELAY: 300, // milisegundos para búsquedas
        ANIMATION_DURATION: 300
    },
    
    // Configuración de IndexedDB
    INDEXEDDB: {
        NAME: 'PapiroDigitalDB',
        VERSION: 1,
        STORE_NAME: 'pdfCache'
    },
    
    // Mensajes de error comunes
    MESSAGES: {
        AUTH_REQUIRED: 'Debes iniciar sesión para acceder a esta página',
        INVALID_PDF: 'Solo se permiten archivos PDF',
        FILE_TOO_LARGE: 'El archivo es demasiado grande (máximo 50MB)',
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
        GENERIC_ERROR: 'Ha ocurrido un error inesperado',
        PDF_PROTECTED: 'Este PDF está protegido con contraseña',
        LOADING: 'Cargando...',
        SUCCESS: 'Operación completada exitosamente'
    },
    
    // Configuración de Speech Synthesis
    SPEECH: {
        LANG: 'es-ES',
        RATE: 1.0,
        PITCH: 1.0,
        VOLUME: 0.8
    },
    
    // Configuración de Firebase (rutas de colecciones)
    FIREBASE_COLLECTIONS: {
        USERS: 'users',
        PROJECTS: 'projects',
        PDFS: 'pdfs',
        ANNOTATIONS: 'annotations'
    },
    
    // Utilidades comunes
    UTILS: {
        // Función para generar IDs únicos
        generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
        
        // Función para formatear fechas
        formatDate: (date) => {
            if (!date) return 'Fecha no disponible';
            const d = date.toDate ? date.toDate() : new Date(date);
            return d.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // Función para validar email
        validateEmail: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        // Función para truncar texto
        truncateText: (text, maxLength = 100) => {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        },
        
        // Función para debounce
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Función para manejar errores de Firebase
        handleFirebaseError: (error) => {
            console.error('Firebase Error:', error);
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    return 'Email o contraseña incorrectos';
                case 'auth/too-many-requests':
                    return 'Demasiados intentos fallidos. Intenta más tarde';
                case 'auth/network-request-failed':
                    return APP_CONFIG.MESSAGES.NETWORK_ERROR;
                case 'permission-denied':
                    return 'No tienes permisos para esta operación';
                case 'unavailable':
                    return 'Servicio temporalmente no disponible';
                default:
                    return error.message || APP_CONFIG.MESSAGES.GENERIC_ERROR;
            }
        }
    }
};

// Configuración para desarrollo
export const DEV_CONFIG = {
    DEBUG: false, // Cambiar a true para habilitar logs de debug
    MOCK_DATA: false, // Para testing con datos simulados
    PERFORMANCE_MONITORING: true
};

// Función para logging condicional
export const logger = {
    debug: (...args) => {
        if (DEV_CONFIG.DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};

// Exportar por defecto la configuración principal
export default APP_CONFIG;