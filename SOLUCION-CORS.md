# Guía paso a paso para solucionar el problema de CORS

## 🚀 SOLUCIÓN MÁS RÁPIDA (2 minutos)

### Opción 1: Cambiar reglas de Storage a público (temporal)

1. Ve a: https://console.firebase.google.com/project/papiro2025-d09e0/storage/rules
2. Borra todo y pega esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Haz clic en "Publicar"
4. Prueba cargar un PDF - debería funcionar inmediatamente

---

## 🔧 SOLUCIÓN PERMANENTE 

### Opción 2: Configurar CORS correctamente

#### A. Si tienes Google Cloud SDK:
1. Abre PowerShell como administrador
2. Ejecuta: `./setup-cors.bat`

#### B. Manualmente en Google Cloud Console:
1. Ve a: https://console.cloud.google.com/storage/browser
2. Selecciona proyecto: `papiro2025-d09e0`
3. Busca el bucket: `papiro2025-d09e0.firebasestorage.app`
4. Haz clic en los 3 puntos → "Edit CORS configuration"
5. Pega el contenido del archivo `firebase-storage-cors.json`

#### C. Usando Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase use papiro2025-d09e0
```

---

## 📱 URLs importantes:

- **Firebase Console**: https://console.firebase.google.com/project/papiro2025-d09e0
- **Storage Rules**: https://console.firebase.google.com/project/papiro2025-d09e0/storage/rules
- **Google Cloud Storage**: https://console.cloud.google.com/storage/browser?project=papiro2025-d09e0
- **Tu app**: https://papirodigital.net.ar

---

## 🆘 Si nada funciona:

Envía un mensaje con:
1. Qué opción probaste
2. Captura de pantalla de los errores
3. Captura de las reglas actuales de Storage

---

## ⚡ RECOMENDACIÓN:

**Usa la Opción 1 primero** - es la más rápida y te permitirá probar la app inmediatamente. Después podemos configurar CORS correctamente para mayor seguridad.