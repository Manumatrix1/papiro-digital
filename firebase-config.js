// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// La configuración de tu aplicación web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDhcJyTriTBrEDftDx_lYAhFgd6Y8Us4dA", // Reemplaza si generaste una nueva
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

// Inicializa y exporta los servicios para que otros archivos puedan usarlos
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
