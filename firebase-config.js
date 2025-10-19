// firebase-config.js - Configuración optimizada de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage, connectStorageEmulator } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB0kigSEw-8yTyBTdHeynPNVskxkr5H2W0",
    authDomain: "papiro2025-d09e0.firebaseapp.com",
    projectId: "papiro2025-d09e0",
    storageBucket: "papiro2025-d09e0.firebasestorage.app",
    messagingSenderId: "1096335704864",
    appId: "1:1096335704864:web:75f1f27cd920df64554d45"
};

// Inicialización de Firebase con manejo de errores
let app, auth, db, storage;

try {
    // Inicializar Firebase
    app = initializeApp(firebaseConfig);
    
    // Inicializar servicios
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Configurar persistencia de autenticación
    auth.useDeviceLanguage();
    
    // Solo para desarrollo - conectar emuladores si están disponibles
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        try {
            // Conectar emuladores solo si no están ya conectados
            if (!auth._delegate?._config?.emulator) {
                // connectAuthEmulator(auth, "http://localhost:9099");
            }
            if (!db._delegate?._databaseId?.projectId?.includes('demo-')) {
                // connectFirestoreEmulator(db, 'localhost', 8080);
            }
            if (!storage._delegate?._host?.includes('localhost')) {
                // connectStorageEmulator(storage, "localhost", 9199);
            }
        } catch (emulatorError) {
            console.warn('Los emuladores de Firebase no están disponibles:', emulatorError);
        }
    }
    
    console.log('✅ Firebase inicializado correctamente');
    
} catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    
    // Mostrar mensaje de error al usuario
    const showFirebaseError = () => {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                background: rgba(0,0,0,0.9); color: white; 
                display: flex; align-items: center; justify-content: center; 
                z-index: 9999; font-family: Inter, sans-serif;
            ">
                <div style="
                    background: #181818; padding: 2rem; border-radius: 10px; 
                    border: 1px solid #2a2a2a; text-align: center; max-width: 400px;
                ">
                    <h2 style="color: #e74c3c; margin-bottom: 1rem;">Error de Conexión</h2>
                    <p style="margin-bottom: 1rem; color: #ccc;">
                        No se pudo conectar con los servicios de Firebase. 
                        Verifica tu conexión a internet y vuelve a intentar.
                    </p>
                    <button onclick="location.reload()" style="
                        background: #88c999; color: black; border: none; 
                        padding: 0.75rem 1.5rem; border-radius: 5px; 
                        cursor: pointer; font-weight: bold;
                    ">
                        Reintentar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    };
    
    // Mostrar error después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showFirebaseError);
    } else {
        showFirebaseError();
    }
}

// Utilidades para manejo de errores de Firebase
export const FirebaseUtils = {
    // Función para manejar errores de autenticación
    handleAuthError: (error) => {
        console.error('Error de autenticación:', error);
        
        const errorMessages = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/popup-closed-by-user': 'Ventana de login cerrada por el usuario',
            'auth/cancelled-popup-request': 'Ya hay una ventana de login en proceso'
        };
        
        return errorMessages[error.code] || error.message || 'Error de autenticación';
    },
    
    // Función para manejar errores de Firestore
    handleFirestoreError: (error) => {
        console.error('Error de Firestore:', error);
        
        const errorMessages = {
            'permission-denied': 'No tienes permisos para esta operación',
            'unavailable': 'Servicio temporalmente no disponible',
            'deadline-exceeded': 'La operación tardó demasiado tiempo',
            'already-exists': 'El documento ya existe',
            'not-found': 'Documento no encontrado',
            'resource-exhausted': 'Cuota de uso excedida',
            'failed-precondition': 'Condición previa fallida',
            'aborted': 'Operación cancelada',
            'out-of-range': 'Valor fuera de rango',
            'unimplemented': 'Operación no implementada',
            'internal': 'Error interno del servidor',
            'data-loss': 'Pérdida de datos irreversible'
        };
        
        return errorMessages[error.code] || error.message || 'Error de base de datos';
    },
    
    // Función para manejar errores de Storage
    handleStorageError: (error) => {
        console.error('Error de Storage:', error);
        
        const errorMessages = {
            'storage/object-not-found': 'Archivo no encontrado',
            'storage/bucket-not-found': 'Bucket de almacenamiento no encontrado',
            'storage/project-not-found': 'Proyecto no encontrado',
            'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
            'storage/unauthenticated': 'Usuario no autenticado',
            'storage/unauthorized': 'No tienes permisos para esta operación',
            'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
            'storage/invalid-checksum': 'Checksum de archivo inválido',
            'storage/canceled': 'Operación cancelada por el usuario',
            'storage/invalid-event-name': 'Nombre de evento inválido',
            'storage/invalid-url': 'URL inválida',
            'storage/invalid-argument': 'Argumento inválido',
            'storage/no-default-bucket': 'No hay bucket por defecto configurado',
            'storage/cannot-slice-blob': 'Error al procesar el archivo',
            'storage/server-file-wrong-size': 'Tamaño de archivo incorrecto'
        };
        
        return errorMessages[error.code] || error.message || 'Error de almacenamiento';
    },
    
    // Función genérica para retry con backoff exponencial
    retryOperation: async (operation, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                // Backoff exponencial: 1s, 2s, 4s
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                console.warn(`Reintentando operación (intento ${i + 2}/${maxRetries})...`);
            }
        }
    }
};

// Verificar el estado de conectividad de Firebase
export const checkFirebaseConnection = async () => {
    try {
        // Intentar una operación simple para verificar conectividad
        await auth.authStateReady;
        return { connected: true, message: 'Conectado a Firebase' };
    } catch (error) {
        return { 
            connected: false, 
            message: FirebaseUtils.handleAuthError(error) 
        };
    }
};

// Exportar servicios principales
export { auth, db, storage };

// Exportar configuración para debugging
export const getFirebaseConfig = () => ({
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Ocultar API key completa
});
