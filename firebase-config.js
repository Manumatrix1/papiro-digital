// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
// Importamos las funciones de Auth que necesitamos para la persistencia
import { getAuth, initializeAuth, indexedDBLocalPersistence } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

// Tu configuración de Firebase ÚNICA Y CORRECTA
const firebaseConfig = {
    apiKey: "AIzaSyB0kigSEw-8yTyBTdHeynPNVskxkr5H2W0", // <-- LA LLAVE NUEVA Y LIMPIA
    authDomain: "papiro2025-d09e0.firebaseapp.com",
    projectId: "papiro2025-d09e0",
    storageBucket: "papiro2025-d09e0.firebasestorage.app",
    messagingSenderId: "1096335704864",
    appId: "1:1096335704864:web:75f1f27cd920df64554d45",
    measurementId: "G-03Y1260F1S"
};

// Inicializa Firebase y exporta los servicios que necesitas
const app = initializeApp(firebaseConfig);

// Usamos la inicialización robusta para que no se pierda la sesión
const auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
