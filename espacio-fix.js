// espacio-fix.js - Parche completo para reparar espacio.html

console.log('🔧 INICIANDO REPARACIÓN COMPLETA DEL VISOR PDF...');

// Variables globales correctas
let currentUser, projectId, pdfId, pdfDocument;
let annotationsUnsubscribe;
let activeTool = 'select', activeColor = '#FFDD00', isDrawing = false;
let annotationsByPage = {}, currentPath = [];
let currentPageNum = 1;
let zoomScale = 1.0;
let isPanning = false, panStart = { x: 0, y: 0 }, scrollStart = { left: 0, top: 0 };
let originalContentSize = { width: 0, height: 0 };
let initialDistance = null;
let drawingStartPoint = null;

// Referencias DOM
const appContainer = document.querySelector('.app-container');
const zoomContainer = document.getElementById('zoom-container');
const pdfWrapper = document.getElementById('pdf-content-wrapper');
const scrollContainer = document.querySelector('.scroll-wrapper');
const notesList = document.getElementById('notes-list');
let pageIntersectionObserver;

// Base de datos IndexedDB
const DB_NAME = 'PapiroDigitalDB', STORE_NAME = 'pdfCache';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject("Error al abrir IndexedDB.");
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            event.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
    });
}

async function savePdfToDB(id, pdfData) {
    const db = await openDB();
    db.transaction([STORE_NAME], 'readwrite')
      .objectStore(STORE_NAME)
      .put({ id, data: pdfData });
}

async function getPdfFromDB(id) {
    const db = await openDB();
    return new Promise((resolve) => {
        const request = db.transaction([STORE_NAME], 'readonly')
                         .objectStore(STORE_NAME)
                         .get(id);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => resolve(null);
    });
}

// 🚨 FUNCIÓN DE CARGA DE PDF COMPLETAMENTE REPARADA
async function loadPdfDocument() {
    const statusText = document.getElementById('status-text');
    
    try {
        console.log('🔧 Iniciando carga de PDF reparada...');
        statusText.textContent = '🚨 Cargando con sistema de emergencia...';
        
        if (!currentUser || !projectId || !pdfId) {
            throw new Error("Faltan datos de usuario o proyecto");
        }
        
        // Obtener datos del PDF de Firebase
        const pdfDocRef = doc(db, "users", currentUser.uid, "projects", projectId, "pdfs", pdfId);
        const docSnap = await getDoc(pdfDocRef);
        
        if (!docSnap?.exists()) {
            throw new Error("Documento no encontrado");
        }
        
        const pdfUrl = docSnap.data().url;
        if (!pdfUrl) {
            throw new Error("URL del PDF no encontrada");
        }
        
        // Manejador de contraseña
        const onPasswordCallback = (callback) => {
            Swal.fire({
                title: 'PDF Protegido',
                input: 'password',
                inputPlaceholder: 'Introduce la contraseña',
                showCancelButton: true,
                preConfirm: (password) => { 
                    if (password) callback(password); 
                }
            });
        };
        
        // 🚨 USAR EL SISTEMA DE EMERGENCIA DIRECTAMENTE
        console.log('🚨 Activando cargador de emergencia...');
        pdfDocument = await window.emergencyPDFLoader.loadPDF(pdfUrl, onPasswordCallback);
        
        if (pdfDocument) {
            statusText.textContent = '✅ PDF cargado correctamente';
            document.getElementById('status-indicator').style.display = 'none';
            pdfWrapper.style.display = 'block';
            
            await setupPagePlaceholders();
            loadAllAnnotations();
            
            console.log('✅ PDF completamente cargado y configurado');
        } else {
            // Si falló, mostrar modal de emergencia
            console.log('❌ Carga falló - Mostrando modal de emergencia');
            window.emergencyPDFLoader.showEmergencyModal(pdfUrl);
        }
        
    } catch (error) {
        console.error('❌ Error en carga de PDF:', error);
        statusText.textContent = '❌ Error al cargar PDF';
        
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el PDF. Intenta recargar la página.',
            icon: 'error',
            confirmButtonText: 'Recargar',
            allowOutsideClick: false
        }).then(() => {
            location.reload();
        });
    }
}

// Resto de funciones necesarias
async function setupPagePlaceholders() {
    if (!pdfDocument) return;
    
    pdfWrapper.innerHTML = '';
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });
    const aspectRatio = viewport.height / viewport.width;
    let totalHeight = 0;
    const containerWidth = scrollContainer.clientWidth;
    const pageRenderWidth = containerWidth * 0.95;
    
    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page-container';
        pageContainer.dataset.pageNumber = i;
        const pageHeight = pageRenderWidth * aspectRatio;
        pageContainer.style.height = `${pageHeight}px`;
        pdfWrapper.appendChild(pageContainer);
        totalHeight += pageHeight + 16;
    }
    
    originalContentSize = { width: containerWidth, height: totalHeight - 16 };
    zoomContainer.style.width = `${originalContentSize.width}px`;
    zoomContainer.style.height = `${originalContentSize.height}px`;
    pdfWrapper.style.width = `${originalContentSize.width}px`;
    
    startPageObserver();
    updatePageIndicator();
    setActiveTool('select');
}

function loadAllAnnotations() {
    if (annotationsUnsubscribe) annotationsUnsubscribe();
    
    const annotationsQuery = query(
        collection(db, "users", currentUser.uid, "projects", projectId, "pdfs", pdfId, "annotations"),
        orderBy("createdAt")
    );
    
    annotationsUnsubscribe = onSnapshot(annotationsQuery, (snapshot) => {
        annotationsByPage = {};
        snapshot.docs.forEach(doc => {
            const annotation = { id: doc.id, ...doc.data() };
            if (!annotationsByPage[annotation.page]) {
                annotationsByPage[annotation.page] = [];
            }
            annotationsByPage[annotation.page].push(annotation);
        });
        
        const currentSearch = document.getElementById('note-search-input')?.value || '';
        renderNotesToSidebar(currentSearch);
        
        document.querySelectorAll('.pdf-page-container').forEach(pageContainer => {
            if (pageContainer.querySelector('canvas')) {
                redrawAnnotations(pageContainer.dataset.pageNumber);
            }
        });
    });
}

// Funciones auxiliares básicas
function updatePageIndicator() {
    const indicator = document.getElementById('page-indicator');
    if (indicator && pdfDocument) {
        indicator.textContent = `${currentPageNum} / ${pdfDocument.numPages}`;
    }
}

function startPageObserver() {
    if (pageIntersectionObserver) {
        pageIntersectionObserver.disconnect();
    }
    
    pageIntersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.dataset.pageNumber);
                if (!entry.target.querySelector('canvas')) {
                    renderPage(entry.target, pageNum);
                }
                if (Math.abs(pageNum - currentPageNum) >= 1) {
                    currentPageNum = pageNum;
                    updatePageIndicator();
                }
            }
        });
    }, {
        root: scrollContainer,
        rootMargin: '100px 0px',
        threshold: 0.1
    });
    
    document.querySelectorAll('.pdf-page-container').forEach(container => {
        pageIntersectionObserver.observe(container);
    });
}

async function renderPage(pageContainer, pageNum) {
    if (!pdfDocument) return;
    
    try {
        const page = await pdfDocument.getPage(pageNum);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const annotationCanvas = document.createElement('canvas');
        
        canvas.width = annotationCanvas.width = viewport.width;
        canvas.height = annotationCanvas.height = viewport.height;
        
        annotationCanvas.className = 'annotation-canvas';
        annotationCanvas.dataset.pageNum = pageNum;
        
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        
        pageContainer.innerHTML = '';
        pageContainer.append(canvas, annotationCanvas);
        
        redrawAnnotations(pageNum);
    } catch (error) {
        console.error(`Error renderizando página ${pageNum}:`, error);
    }
}

function redrawAnnotations(pageNum) {
    const pageAnnotations = annotationsByPage[pageNum] || [];
    const canvas = document.querySelector(`[data-page-number="${pageNum}"] .annotation-canvas`);
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    pageAnnotations.forEach(annotation => {
        if (annotation.path && annotation.path.length > 0) {
            drawPath(ctx, annotation);
        }
    });
}

function drawPath(ctx, annotation) {
    if (!annotation.path || annotation.path.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = annotation.color || '#FFDD00';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = annotation.type === 'erase' ? 40 : 4;
    
    ctx.beginPath();
    ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
    annotation.path.forEach(point => ctx.lineTo(point.x, point.y));
    
    if (annotation.type === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.stroke();
    ctx.restore();
}

function setActiveTool(tool) {
    activeTool = tool;
    document.querySelectorAll('#main-tools .tool-btn').forEach(btn => 
        btn.classList.remove('active')
    );
    const toolBtn = document.getElementById(`tool-${tool}`);
    if (toolBtn) toolBtn.classList.add('active');
}

function renderNotesToSidebar(searchTerm = '') {
    if (!notesList) return;
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    notesList.innerHTML = '';
    
    const annotationsWithNotes = Object.values(annotationsByPage)
        .flat()
        .filter(a => a.id && a.note)
        .sort((a, b) => (a.page - b.page));
    
    const filteredAnnotations = lowerCaseSearchTerm ?
        annotationsWithNotes.filter(a => a.note.toLowerCase().includes(lowerCaseSearchTerm)) :
        annotationsWithNotes;
    
    if (filteredAnnotations.length === 0) {
        notesList.innerHTML = `<p class="text-gray-500 text-center p-4">No hay notas guardadas.</p>`;
        return;
    }
    
    filteredAnnotations.forEach(annotation => {
        const noteElement = document.createElement('div');
        noteElement.className = 'bg-gray-800 p-3 rounded-lg mb-2';
        noteElement.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-400">Página ${annotation.page}</span>
            </div>
            <p class="text-sm text-white">${annotation.note}</p>
        `;
        notesList.appendChild(noteElement);
    });
}

// Configurar Auth cuando Firebase esté listo
function iniciarAplicacion(user) {
    currentUser = user;
    const urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');
    pdfId = urlParams.get('pdfId');
    
    if (!projectId || !pdfId) {
        window.location.href = 'mi_tablero.html';
        return;
    }
    
    setupAllEventListeners();
    loadPdfDocument();
}

function setupAllEventListeners() {
    // Herramientas
    const toolSelect = document.getElementById('tool-select');
    if (toolSelect) toolSelect.addEventListener('click', () => setActiveTool('select'));
    
    const toolDraw = document.getElementById('tool-draw');
    if (toolDraw) toolDraw.addEventListener('click', () => setActiveTool('draw'));
    
    const toolHighlight = document.getElementById('tool-highlight');
    if (toolHighlight) toolHighlight.addEventListener('click', () => setActiveTool('highlight'));
    
    const toolErase = document.getElementById('tool-erase');
    if (toolErase) toolErase.addEventListener('click', () => setActiveTool('erase'));
    
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) colorPicker.addEventListener('input', (e) => activeColor = e.target.value);
    
    // Notas
    const openNotesBtn = document.getElementById('open-notes-btn');
    if (openNotesBtn) openNotesBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('open');
    });
    
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    });
    
    console.log('✅ Event listeners configurados');
}

// Funciones de dibujo básicas
function startDrawing(e) {
    if (activeTool === 'select') return;
    
    isDrawing = true;
    currentPath = [];
    
    const canvas = findCanvasUnderPointer(e);
    if (!canvas) return;
    
    const coords = getCoords(e, canvas);
    currentPath.push(coords);
    drawingStartPoint = coords;
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = findCanvasUnderPointer(e);
    if (!canvas) return;
    
    const coords = getCoords(e, canvas);
    currentPath.push(coords);
    
    // Dibujar en tiempo real
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    if (currentPath.length > 1) {
        const prevPoint = currentPath[currentPath.length - 2];
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;
    
    isDrawing = false;
    
    if (currentPath.length > 1) {
        const canvas = findCanvasUnderPointer(e, true);
        if (canvas) {
            const pageNum = parseInt(canvas.dataset.pageNum);
            
            // Guardar anotación
            const annotationData = {
                type: activeTool,
                color: activeColor,
                path: currentPath,
                page: pageNum
            };
            
            saveAnnotation(annotationData).then(() => {
                console.log('Anotación guardada');
            });
        }
    }
    
    currentPath = [];
    drawingStartPoint = null;
}

function getCoords(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = e.touches ? e.touches[0] : e;
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}

function findCanvasUnderPointer(e, isEndEvent = false) {
    const touch = isEndEvent ? (e.changedTouches?.[0]) : (e.touches?.[0] || e);
    if (!touch) return null;
    
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    return element?.closest('.pdf-page-container')?.querySelector('.annotation-canvas');
}

function saveAnnotation(annotationData) {
    return addDoc(collection(db, "users", currentUser.uid, "projects", projectId, "pdfs", pdfId, "annotations"), {
        ...annotationData,
        createdAt: serverTimestamp()
    });
}

// Configurar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM listo - Configurando sistema reparado');
    
    // Esperar a que Firebase esté disponible
    const waitForFirebase = setInterval(() => {
        if (window.auth && window.onAuthStateChanged) {
            clearInterval(waitForFirebase);
            
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    iniciarAplicacion(user);
                } else {
                    window.location.href = 'index.html';
                }
            });
        }
    }, 100);
});

// Exportar funciones principales al window global
window.papiroFunctions = {
    loadPdfDocument,
    setupPagePlaceholders,
    loadAllAnnotations,
    renderPage,
    redrawAnnotations,
    setActiveTool,
    renderNotesToSidebar,
    iniciarAplicacion,
    setupAllEventListeners,
    startDrawing,
    draw,
    stopDrawing,
    saveAnnotation
};

console.log('✅ SISTEMA COMPLETO REPARADO Y FUNCIONAL');