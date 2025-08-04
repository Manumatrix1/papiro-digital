// Importa las funciones que necesitas desde las URLs completas del SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// La configuración de tu aplicación web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDhcJyTriTBrEDftDx_lYAhFgd6Y8Us4dA",
  authDomain: "papirodigital-1a6c5.firebaseapp.com",
  databaseURL: "https://papirodigital-1a6c5-default-rtdb.firebaseio.com",
  projectId: "papirodigital-1a6c5",
  storageBucket: "papirodigital-1a6c5.appspot.com",
  messagingSenderId: "274494841235",
  appId: "1:274494841235:web:99112dde1c6dbd12240866",
  measurementId: "G-0SKBCYEEF0"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa los servicios y los exporta para poder usarlos en otros archivos de tu proyecto
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
