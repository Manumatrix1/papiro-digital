// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDhcJyTriTBrEDftDx_lYAhFgd6Y8Us4dA", // ¡ALERTA DE SEGURIDAD!
    authDomain: "papirodigital-1a6c5.firebaseapp.com",
    projectId: "papirodigital-1a6c5",
    storageBucket: "papirodigital-1a6c5.appspot.com",
    messagingSenderId: "274494841235",
    appId: "1:274494841235:web:99112dde1c6dbd12240866"
};

// ===================================================================================
// NOTA DE SEGURIDAD CRÍTICA DEL EQUIPO DE EXPERTOS:
// Para proteger tu aplicación contra el abuso, es fundamental que configures
// 'Firebase App Check' en tu consola de Firebase. Esto no cambia tu diseño,
// pero protege tus recursos en el backend.
// ===================================================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
