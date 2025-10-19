// security-utils.js - Utilidades de seguridad para Papiro Digital
import { APP_CONFIG, logger } from './config.js';

export class SecurityValidator {
    constructor() {
        this.maxFileSize = APP_CONFIG.PDF.MAX_FILE_SIZE;
        this.allowedTypes = APP_CONFIG.PDF.ALLOWED_TYPES;
    }

    // Validar archivo PDF antes de subir
    validatePDFFile(file) {
        const errors = [];
        
        if (!file) {
            errors.push('No se ha seleccionado ningún archivo');
            return { isValid: false, errors };
        }

        // Validar tipo de archivo
        if (!this.allowedTypes.includes(file.type)) {
            errors.push(`Tipo de archivo no permitido. Solo se permiten: ${this.allowedTypes.join(', ')}`);
        }

        // Validar tamaño
        if (file.size > this.maxFileSize) {
            const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
            errors.push(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
        }

        // Validar extensión del nombre
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.pdf')) {
            errors.push('El archivo debe tener extensión .pdf');
        }

        // Validar nombre de archivo (caracteres seguros)
        if (!/^[a-zA-Z0-9\s\-_\.()]+$/.test(file.name)) {
            errors.push('El nombre del archivo contiene caracteres no permitidos');
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedName: this.sanitizeFileName(file.name)
        };
    }

    // Limpiar nombre de archivo
    sanitizeFileName(fileName) {
        return fileName
            .trim()
            .replace(/[^a-zA-Z0-9\s\-_\.()]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 100); // Limitar longitud
    }

    // Validar datos de entrada para notas
    validateNoteData(noteData) {
        const errors = [];
        const sanitized = {};

        // Validar texto de la nota
        if (noteData.note) {
            if (noteData.note.length > 5000) {
                errors.push('La nota es demasiado larga (máximo 5000 caracteres)');
            }
            sanitized.note = this.sanitizeText(noteData.note);
        }

        // Validar URL si se proporciona
        if (noteData.link) {
            if (!this.isValidURL(noteData.link)) {
                errors.push('La URL proporcionada no es válida');
            } else {
                sanitized.link = noteData.link.trim();
            }
        }

        // Validar número de página
        if (noteData.page) {
            const pageNum = parseInt(noteData.page);
            if (isNaN(pageNum) || pageNum < 1) {
                errors.push('Número de página inválido');
            } else {
                sanitized.page = pageNum;
            }
        }

        // Validar color
        if (noteData.color) {
            if (!this.isValidHexColor(noteData.color)) {
                errors.push('Color inválido');
            } else {
                sanitized.color = noteData.color;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedData: sanitized
        };
    }

    // Limpiar texto de entrada
    sanitizeText(text) {
        return text
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
            .replace(/javascript:/gi, '') // Remover javascript: URLs
            .replace(/on\w+\s*=/gi, '') // Remover event handlers
            .substring(0, 5000); // Limitar longitud
    }

    // Validar URL
    isValidURL(string) {
        try {
            const url = new URL(string);
            return ['http:', 'https:'].includes(url.protocol);
        } catch {
            return false;
        }
    }

    // Validar color hexadecimal
    isValidHexColor(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    }

    // Validar datos de proyecto
    validateProjectData(projectData) {
        const errors = [];
        const sanitized = {};

        // Validar nombre del proyecto
        if (!projectData.name || projectData.name.trim().length === 0) {
            errors.push('El nombre del proyecto es requerido');
        } else if (projectData.name.trim().length > 100) {
            errors.push('El nombre del proyecto es demasiado largo (máximo 100 caracteres)');
        } else {
            sanitized.name = this.sanitizeText(projectData.name);
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedData: sanitized
        };
    }
}

export class AuthGuard {
    constructor(auth) {
        this.auth = auth;
    }

    // Verificar si el usuario está autenticado
    async requireAuth() {
        return new Promise((resolve) => {
            const unsubscribe = this.auth.onAuthStateChanged((user) => {
                unsubscribe();
                if (user) {
                    resolve({ authenticated: true, user });
                } else {
                    resolve({ authenticated: false, user: null });
                }
            });
        });
    }

    // Verificar permisos de administrador (simplificado - en producción usar claims personalizados)
    async requireAdminAuth(adminEmails = []) {
        const authResult = await this.requireAuth();
        
        if (!authResult.authenticated) {
            return { authorized: false, reason: 'No autenticado' };
        }

        // En un entorno de producción, esto debería verificarse con claims personalizados de Firebase
        const isAdmin = adminEmails.length === 0 || adminEmails.includes(authResult.user.email);
        
        return {
            authorized: isAdmin,
            user: authResult.user,
            reason: isAdmin ? null : 'Permisos insuficientes'
        };
    }

    // Verificar propiedad del recurso
    verifyResourceOwnership(resourceUserId, currentUserId) {
        return resourceUserId === currentUserId;
    }
}

export class RateLimiter {
    constructor() {
        this.actions = new Map();
    }

    // Verificar si una acción está permitida según límites de velocidad
    checkRateLimit(userId, actionType, maxRequests = 10, timeWindow = 60000) {
        const key = `${userId}_${actionType}`;
        const now = Date.now();
        
        if (!this.actions.has(key)) {
            this.actions.set(key, []);
        }

        const userActions = this.actions.get(key);
        
        // Limpiar acciones antiguas
        const validActions = userActions.filter(timestamp => now - timestamp < timeWindow);
        
        if (validActions.length >= maxRequests) {
            return {
                allowed: false,
                retryAfter: Math.ceil((validActions[0] + timeWindow - now) / 1000)
            };
        }

        // Registrar nueva acción
        validActions.push(now);
        this.actions.set(key, validActions);
        
        return {
            allowed: true,
            remaining: maxRequests - validActions.length
        };
    }

    // Limpiar datos antiguos periódicamente
    cleanup() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutos
        
        for (const [key, timestamps] of this.actions.entries()) {
            const validTimestamps = timestamps.filter(t => now - t < maxAge);
            if (validTimestamps.length === 0) {
                this.actions.delete(key);
            } else {
                this.actions.set(key, validTimestamps);
            }
        }
    }
}

export class XSSProtection {
    // Escapar HTML para prevenir XSS
    static escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Limpiar HTML manteniendo tags seguros
    static sanitizeHTML(html, allowedTags = ['b', 'i', 'em', 'strong', 'u']) {
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remover todos los tags excepto los permitidos
        const walker = document.createTreeWalker(
            div,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        
        const nodesToRemove = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (!allowedTags.includes(node.tagName.toLowerCase())) {
                nodesToRemove.push(node);
            }
        }
        
        nodesToRemove.forEach(node => {
            while (node.firstChild) {
                node.parentNode.insertBefore(node.firstChild, node);
            }
            node.parentNode.removeChild(node);
        });
        
        return div.innerHTML;
    }

    // Validar y limpiar URLs para prevenir javascript: y data: URLs maliciosos
    static sanitizeURL(url) {
        try {
            const urlObj = new URL(url);
            if (['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
                return urlObj.toString();
            }
            return null;
        } catch {
            return null;
        }
    }
}

export class ContentSecurityPolicy {
    // Implementar CSP básico via JavaScript (complementario al header CSP)
    static enforce() {
        // Prevenir inline scripts dinámicos
        document.addEventListener('DOMContentLoaded', () => {
            const scripts = document.querySelectorAll('script:not([src])');
            scripts.forEach(script => {
                if (!script.hasAttribute('data-trusted')) {
                    logger.warn('Script inline no confiable detectado y removido');
                    script.remove();
                }
            });
        });

        // Monitorear violaciones de CSP
        document.addEventListener('securitypolicyviolation', (e) => {
            logger.error('Violación de CSP detectada:', {
                directive: e.violatedDirective,
                blockedURI: e.blockedURI,
                documentURI: e.documentURI
            });
        });
    }
}

export class SecurityHeaders {
    // Verificar headers de seguridad importantes
    static checkSecurityHeaders() {
        const securityChecks = {
            https: location.protocol === 'https:',
            xFrameOptions: document.querySelector('meta[http-equiv="X-Frame-Options"]') !== null,
            xContentType: document.querySelector('meta[http-equiv="X-Content-Type-Options"]') !== null,
            referrerPolicy: document.querySelector('meta[name="referrer"]') !== null
        };

        const issues = Object.entries(securityChecks)
            .filter(([, passed]) => !passed)
            .map(([check]) => check);

        if (issues.length > 0) {
            logger.warn('Headers de seguridad faltantes:', issues);
        }

        return securityChecks;
    }
}

// Utilidades globales de seguridad
export const SecurityUtils = {
    // Rate limiter global
    rateLimiter: new RateLimiter(),
    
    // Validador de seguridad global
    validator: new SecurityValidator(),
    
    // Inicializar todas las protecciones de seguridad
    initialize(auth) {
        logger.info('Inicializando protecciones de seguridad...');
        
        // Configurar CSP
        ContentSecurityPolicy.enforce();
        
        // Verificar headers
        SecurityHeaders.checkSecurityHeaders();
        
        // Configurar limpieza periódica del rate limiter
        setInterval(() => {
            this.rateLimiter.cleanup();
        }, 5 * 60 * 1000); // Cada 5 minutos
        
        // Crear guard de autenticación si se proporciona auth
        if (auth) {
            this.authGuard = new AuthGuard(auth);
        }
        
        logger.info('Protecciones de seguridad inicializadas');
    },
    
    // Validar y preparar datos antes de enviar a Firebase
    prepareDataForUpload(data, type = 'note') {
        switch (type) {
            case 'note':
                return this.validator.validateNoteData(data);
            case 'project':
                return this.validator.validateProjectData(data);
            case 'file':
                return this.validator.validatePDFFile(data);
            default:
                return { isValid: false, errors: ['Tipo de datos no soportado'] };
        }
    }
};