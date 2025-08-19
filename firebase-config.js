// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyB0kigSEw-8yTyBTdHeynPNVskxkr5H2W0",
    authDomain: "papiro2025-d09e0.firebaseapp.com",
    projectId: "papiro2025-d09e0",
    storageBucket: "papiro2025-d09e0.firebasestorage.app",
    messagingSenderId: "1096335704864",
    appId: "1:1096335704864:web:75f1f27cd920df64554d45"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Usamos getAuth para simplificar y evitar conflictos
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
