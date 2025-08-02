// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

// Tu configuración de Firebase ÚNICA Y CORRECTA
const firebaseConfig = {
    apiKey: "AIzaSyDhcJyTriTBrEDftDx_lYAhFgd6Y8Us4dA",
    authDomain: "papirodigital-1a6c5.firebaseapp.com",
    projectId: "papirodigital-1a6c5",
    storageBucket: "papirodigital-1a6c5.appspot.com",
    messagingSenderId: "274494841235", // ¡LA CORRECTA!
    appId: "1:274494841235:web:99112dde1c6dbd12240866" // ¡LA CORRECTA!
};

// Inicializa Firebase y exporta los servicios que necesitas
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
