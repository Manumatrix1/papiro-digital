# 📚 Papiro Digital v1.2.0

Una aplicación web completa para visualización, anotación y gestión de documentos PDF con funcionalidades avanzadas de colaboración y organización.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Login con Email/Contraseña**: Autenticación segura con Firebase Auth
- **Login con Google**: Integración OAuth para acceso rápido
- **Panel de Administrador**: Acceso especial para supervisión de proyectos
- **Gestión de Sesiones**: Persistencia segura y manejo de estados

### 📁 Gestión de Proyectos
- **Tableros Personalizados**: Organiza tus PDFs en proyectos temáticos
- **Portadas Personalizables**: Sube imágenes de portada para tus tableros
- **Búsqueda Inteligente**: Encuentra proyectos rápidamente
- **CRUD Completo**: Crear, editar, eliminar y gestionar proyectos

### 📖 Visor de PDF Avanzado
- **Renderizado Optimizado**: Carga progresiva con PDF.js
- **Zoom y Navegación**: Control completo de visualización
- **Responsive Design**: Adaptado para dispositivos móviles y tablets
- **Carga Lazy**: Solo renderiza páginas visibles para mejor rendimiento

### ✏️ Herramientas de Anotación
- **Dibujo Libre**: Herramienta de lápiz para dibujos y esquemas
- **Resaltado**: Marca texto importante con colores personalizables
- **Borrador**: Elimina anotaciones específicas
- **Colores Personalizables**: Paleta completa de colores para organización
- **Persistencia en la Nube**: Todas las anotaciones se guardan automáticamente

### 📝 Cuaderno de Notas Digital
- **Notas de Texto**: Añade notas textuales a cualquier página
- **Enlaces Web**: Asocia URLs relevantes a tus notas
- **Búsqueda en Notas**: Encuentra información rápidamente
- **Navegación por Páginas**: Salta directamente a páginas específicas
- **Organización por Color**: Etiqueta visual para categorizar notas

### 🔍 Búsqueda Avanzada
- **Búsqueda en PDF**: Encuentra texto específico dentro del documento
- **Búsqueda en Notas**: Localiza notas por contenido
- **Resultados Contextuales**: Vista previa del texto encontrado
- **Navegación Inteligente**: Salta directamente a los resultados

### 🎵 Funcionalidades Extra
- **Lectura en Voz Alta**: Síntesis de voz para accesibilidad
- **Modo Pantalla Completa**: Experiencia inmersiva de lectura
- **Funcionamiento Offline**: Service Worker para acceso sin conexión
- **Cache Inteligente**: Almacenamiento local de PDFs frecuentes

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5/CSS3/JavaScript**: Base moderna y estándares web
- **Tailwind CSS**: Framework de utilidades para diseño rápido
- **PDF.js**: Renderizado de PDFs en el navegador
- **SweetAlert2**: Modales y alertas elegantes
- **Font Awesome**: Iconografía completa

### Backend y Servicios
- **Firebase Auth**: Autenticación y gestión de usuarios
- **Firestore**: Base de datos NoSQL en tiempo real
- **Firebase Storage**: Almacenamiento de archivos PDF y portadas
- **Service Workers**: Cache inteligente y funcionalidad offline

### Rendimiento y Optimización
- **IndexedDB**: Cache local para PDFs
- **Intersection Observer**: Carga lazy de páginas
- **Web Workers**: Procesamiento en segundo plano
- **Debouncing/Throttling**: Optimización de eventos de UI

## 📦 Instalación y Configuración

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para configuración inicial
- Cuenta de Firebase (para desarrollo)

### Configuración de Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita los servicios:
   - Authentication (Email/Password y Google)
   - Firestore Database
   - Storage
3. Configura las reglas de seguridad (ver archivos de ejemplo)
4. Actualiza `firebase-config.js` con tus credenciales

### Despliegue Local
```bash
# Clona el repositorio
git clone https://github.com/Manumatrix1/papiro-digital.git

# Navega al directorio
cd papiro-digital

# Sirve los archivos estáticos (puedes usar cualquier servidor web)
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js (http-server)
npx http-server

# Opción 3: Live Server (VS Code Extension)
```

### Despliegue en Producción
- **Netlify**: Conecta tu repositorio para despliegue automático
- **Vercel**: Soporte nativo para aplicaciones estáticas
- **Firebase Hosting**: Integración perfecta con otros servicios de Firebase
- **GitHub Pages**: Despliegue gratuito desde tu repositorio

## 📁 Estructura del Proyecto

```
papiro-digital/
├── index.html              # Página de login principal
├── admin.html              # Login de administrador
├── mi_tablero.html         # Dashboard de proyectos del usuario
├── tablero_detalle.html    # Vista de PDFs de un proyecto
├── espacio.html            # Visor y editor de PDF
├── panel.html              # Panel de administración
├── firebase-config.js      # Configuración de Firebase
├── config.js               # Configuración global de la app
├── pdf-utils.js            # Utilidades optimizadas para PDF
├── sw.js                   # Service Worker
├── style.css               # Estilos optimizados
├── pdf.js & pdf.worker.js  # Biblioteca PDF.js
├── _headers                # Headers para Netlify
├── _redirects              # Redirects para Netlify
└── README.md              # Documentación
```

## 🔧 Configuración Avanzada

### Variables de Entorno (config.js)
```javascript
export const APP_CONFIG = {
    APP_NAME: 'Papiro Digital',
    VERSION: '1.2.0',
    PDF: {
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        RENDER_SCALE: 2.0
    },
    // ... más configuraciones
};
```

### Reglas de Seguridad de Firestore
```javascript
// Permitir solo acceso autenticado a proyectos propios
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 Uso de la Aplicación

### Para Usuarios
1. **Registro/Login**: Accede con tu email o cuenta de Google
2. **Crear Proyecto**: Haz clic en "+" para crear un nuevo tablero
3. **Subir PDFs**: Dentro de cada proyecto, sube tus documentos
4. **Anotar**: Usa las herramientas de dibujo, resaltado y notas
5. **Organizar**: Usa colores y notas para categorizar información

### Para Administradores
1. **Acceso Admin**: Usa `/admin.html` para el login de administrador
2. **Panel de Control**: Ve todos los proyectos de todos los usuarios
3. **Supervisión**: Monitorea el uso y actividad de la plataforma

## 🔄 Actualizaciones y Mantenimiento

### Cache y Rendimiento
- Los PDFs se cachean localmente usando IndexedDB
- Service Worker maneja el cache de recursos estáticos
- Limpieza automática de cache antiguo

### Monitoreo
- Logs detallados en consola (modo desarrollo)
- Métricas de rendimiento con Performance API
- Alertas de uso de memoria alta

## 🐛 Solución de Problemas

### Problemas Comunes
1. **PDF no carga**: Verifica permisos de Firestore y Storage
2. **Anotaciones no se guardan**: Confirma autenticación del usuario
3. **Rendimiento lento**: Limpia cache del navegador y de la aplicación
4. **Error de conexión**: Verifica configuración de Firebase

### Debug
```javascript
// Habilitar logs de debug
import { DEV_CONFIG } from './config.js';
DEV_CONFIG.DEBUG = true;
```

## 🤝 Contribución

### Cómo Contribuir
1. Fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usa ES6+ y módulos
- Comenta funciones complejas
- Sigue las convenciones de nombres existentes
- Actualiza documentación si es necesario

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Créditos

- **PDF.js**: Mozilla Foundation
- **Firebase**: Google
- **Tailwind CSS**: Tailwind Labs
- **Font Awesome**: Fonticons, Inc.
- **SweetAlert2**: Limonte

## 📞 Soporte

- **Issues**: Reporta bugs en GitHub Issues
- **Documentación**: Wiki del proyecto en GitHub
- **Comunidad**: Discusiones en GitHub Discussions

---

**Papiro Digital v1.2.0** - Transformando la manera de interactuar con documentos PDF 📚✨
