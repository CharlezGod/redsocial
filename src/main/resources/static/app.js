// --- 1. BASES DE DATOS Y ESTADO LOCAL ---
const API_URL = '/api';

let misionesDB = [];
let reportesDB = [];

let mapaIntegrado = null; 
let marcadoresMapa = {};

// Helper para validar si un rol tiene permisos elevados (Admin u Operador/Trabajador)
function esUsuarioOperativo(rol) {
    if (!rol) return false;
    const r = rol.toString().toUpperCase();
    return r.includes('ADMIN') || r.includes('OPERADOR') || r.includes('TRABAJADOR');
}

// Helper para generar las etiquetas de calidad del aire
function obtenerBadgeAire(aqi) {
    if (aqi === null || aqi === undefined || aqi === "N/A" || aqi === "" || isNaN(aqi)) {
        return `<span class="badge bg-secondary rounded-pill px-3 py-1">Sin Datos</span>`;
    }
    const val = Number(aqi);
    let claseBadge = val < 50 ? 'bg-success' : (val < 100 ? 'bg-warning text-dark' : 'bg-danger');
    let textoEstado = val < 50 ? 'Óptimo' : (val < 100 ? 'Regular' : 'Peligroso');
    return `<span class="badge ${claseBadge} rounded-pill px-3 py-1 fw-semibold">${val} AQI (${textoEstado})</span>`;
}

// --- 2. MANEJO DE MODALES Y AUTENTICACIÓN ---
function cerrarAuthEnFondo(event, idModal) {
    if (event.target.id === idModal) {
        document.getElementById(idModal).classList.add('oculta');
    }
}

window.onload = function() {
    const sesion = localStorage.getItem('sesion_activa');
    const rol = localStorage.getItem('rol_activo') || 'CIUDADANO';
    if (sesion) {
        actualizarInterfazUsuario(sesion, rol);
        mostrarDashboard();
    } else {
        document.getElementById('landing-container').classList.remove('oculta');
        document.getElementById('dashboard-container').classList.add('oculta');
    }
};

function actualizarInterfazUsuario(nombre, rol) {
    const rolNormalizado = (rol || 'CIUDADANO').toUpperCase();

    // Actualizar textos de bienvenida
    const elemNombrePc = document.getElementById('nombre-admin-pc');
    const elemNombreMob = document.getElementById('nombre-admin-mobile');
    const elemAvatar = document.getElementById('avatar-user');

    if (elemNombrePc) elemNombrePc.innerText = nombre;
    if (elemNombreMob) elemNombreMob.innerText = nombre;
    if (elemAvatar) elemAvatar.innerText = nombre.charAt(0).toUpperCase();

    // Actualizar el badge superior azul/verde en la barra de navegación
    const badgeSuperior = document.querySelector('.navbar .badge, header .badge');
    if (badgeSuperior) {
        badgeSuperior.innerText = rolNormalizado;
    }

    // Actualizar el badge en el popover desplegable de sesión activa
    const popoverBadge = document.querySelector('#popover-perfil .badge');
    if (popoverBadge) {
        popoverBadge.innerText = rolNormalizado;
    }

    // Actualizar etiquetas generales de perfil
    document.querySelectorAll('.card-perfil-rol, #user-display-role, .badge-rol-popover').forEach(el => {
        el.innerText = rolNormalizado;
    });

    // Actualizar la tarjeta grande de "Perfil de Usuario" en el dashboard
    const cardPerfilDashboard = document.querySelector('.card-perfil-titulo, h3.text-success, h3.text-primary');
    if (cardPerfilDashboard && cardPerfilDashboard.parentElement) {
        const tituloPerfil = cardPerfilDashboard.parentElement.querySelector('h3, .fw-bold');
        if (tituloPerfil) tituloPerfil.innerText = rolNormalizado;
    }
}

function toggleMenuPerfil() {
    const popover = document.getElementById('popover-perfil');
    if (popover) popover.classList.toggle('oculta');
}

document.addEventListener('click', function(event) {
    const avatar = document.getElementById('avatar-user');
    const popover = document.getElementById('popover-perfil');
    if (avatar && popover && !avatar.contains(event.target) && !popover.contains(event.target)) {
        popover.classList.add('oculta');
    }
});

function abrirAuth(tipo) {
    document.getElementById('modal-auth').classList.remove('oculta');
    cambiarTabAuth(tipo);
}

function cerrarAuth() {
    document.getElementById('modal-auth').classList.add('oculta');
}

function cambiarTabAuth(tipo) {
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-registro');
    
    if (tabLogin && tabReg) {
        tabLogin.classList.remove('border-bottom', 'border-2', 'text-primary');
        tabLogin.classList.add('text-secondary');
        tabReg.classList.remove('border-bottom', 'border-2', 'text-primary');
        tabReg.classList.add('text-secondary');

        if(tipo === 'login') {
            tabLogin.classList.add('border-bottom', 'border-2', 'text-primary');
            tabLogin.classList.remove('text-secondary');
        } else {
            tabReg.classList.add('border-bottom', 'border-2', 'text-primary');
            tabReg.classList.remove('text-secondary');
        }
    }

    document.getElementById('form-login').classList.add('oculta');
    document.getElementById('form-registro').classList.add('oculta');

    if(tipo === 'login') {
        document.getElementById('form-login').classList.remove('oculta');
    } else {
        document.getElementById('form-registro').classList.remove('oculta');
    }
}

// --- MENSAJES DE VALIDACIÓN DEL SERVIDOR (Spring Validation) ---
async function leerMensajeError(res, mensajePorDefecto) {
    try {
        const data = await res.clone().json();
        if (data.errores) return Object.values(data.errores).join('\n');
        if (data.mensaje) return data.mensaje;
    } catch (e) { /* la respuesta no era JSON */ }
    try {
        const texto = await res.text();
        if (texto) return texto;
    } catch (e) { /* sin cuerpo */ }
    return mensajePorDefecto;
}

// --- SUBMIT REGISTRO DE USUARIOS ---
const formReg = document.getElementById('form-registro');
if (formReg) {
    formReg.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('reg-nombre').value;
        const user = document.getElementById('reg-user').value;
        const pass = document.getElementById('reg-pass').value;
        const selectRol = document.getElementById('reg-rol');
        const rol = selectRol ? selectRol.value : 'CIUDADANO';

        try {
            const res = await fetch(`${API_URL}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, user, pass, rol })
            });

            if (res.ok) {
                alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
                formReg.reset();
                cambiarTabAuth('login');
            } else {
                alert(await leerMensajeError(res, "No se pudo crear la cuenta."));
            }
        } catch (err) {
            console.error(err);
            alert("Error al conectar con el servidor.");
        }
    });
}

// --- SUBMIT LOGIN ---
const formLog = document.getElementById('form-login');
if (formLog) {
    formLog.addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = document.getElementById('log-user').value;
        const pass = document.getElementById('log-pass').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pass })
            });

            if (res.ok) {
                const usuarioValido = await res.json();
                const rolUsuario = usuarioValido.rol || 'CIUDADANO';

                localStorage.setItem('sesion_activa', usuarioValido.nombre);
                localStorage.setItem('rol_activo', rolUsuario);

                actualizarInterfazUsuario(usuarioValido.nombre, rolUsuario);
                cerrarAuth();
                mostrarDashboard();
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servidor.');
        }
    });
}

function mostrarDashboard() {
    document.getElementById('landing-container').classList.add('oculta');
    document.getElementById('dashboard-container').classList.remove('oculta');
    
    const nombreActual = localStorage.getItem('sesion_activa') || 'Usuario';
    const rolActual = localStorage.getItem('rol_activo') || 'CIUDADANO';
    
    actualizarInterfazUsuario(nombreActual, rolActual);
    cargarDatosServidor();
}

function cerrarSesion() {
    localStorage.removeItem('sesion_activa');
    localStorage.removeItem('rol_activo');
    location.reload(); 
}

// Carga de datos iniciales desde Spring Boot
async function cargarDatosServidor() {
    try {
        const resMisiones = await fetch(`${API_URL}/misiones`);
        if(resMisiones.ok) misionesDB = await resMisiones.json();

        const resReportes = await fetch(`${API_URL}/reportes`);
        if(resReportes.ok) reportesDB = await resReportes.json();

        actualizarTablaMisiones();
        actualizarTablaReportes();
    } catch(err) {
        console.error("Error al cargar datos del servidor:", err);
    }
}

// --- 3. NAVEGACIÓN ---
function navegar(vistaId) {
    document.querySelectorAll('.vista').forEach(v => v.classList.add('oculta'));
    
    document.querySelectorAll('.nav-pills a').forEach(a => {
        a.classList.remove('active', 'text-white');
        a.classList.add('text-white-50');
    });
    const navActivo = document.getElementById(`nav-${vistaId}`);
    if(navActivo) {
        navActivo.classList.add('active', 'text-white');
        navActivo.classList.remove('text-white-50');
    }

    ['inicio', 'misiones', 'mapa'].forEach(id => {
        const btnMob = document.getElementById(`mob-${id}`);
        if(btnMob) {
            btnMob.classList.remove('text-primary');
            btnMob.classList.add('text-secondary');
        }
    });
    const activeMob = document.getElementById(`mob-${vistaId}`);
    if(activeMob) {
        activeMob.classList.remove('text-secondary');
        activeMob.classList.add('text-primary');
    }

    document.getElementById(`vista-${vistaId}`).classList.remove('oculta');
    if(vistaId === 'mapa') cargarMapa();
}

// --- 4. MAPA LEAFLET ---
function cargarMapa() {
    if (!mapaIntegrado) {
        mapaIntegrado = L.map('mi-mapa').setView([-12.0464, -77.0428], 12); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapaIntegrado);

        if (L.Control.geocoder) {
            L.Control.geocoder({ defaultMarkGeocode: false, placeholder: "Buscar lugar..." }).on('markgeocode', function(e) {
                const center = e.geocode.center;
                mapaIntegrado.setView(center, 15);
                mapaIntegrado.fire('click', { latlng: center });
            }).addTo(mapaIntegrado);
        }

        mapaIntegrado.on('click', async function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            const aqi = await buscarAirePorCoordenadas(lat, lng);
            
            let colorTexto = aqi < 50 ? "#10b981" : (aqi < 100 ? "#f59e0b" : "#ef4444");
            let estado = aqi < 50 ? "Óptimo" : (aqi < 100 ? "Regular" : "Peligroso");

            let contenidoVentanita = `
                <div style="text-align:center; min-width: 160px;">
                    <h3 style="color:${colorTexto}; margin-bottom:5px; font-size:15px; font-weight:bold;">AQI: ${aqi} (${estado})</h3>
                    <p style="font-size:11px; color:#666; margin-bottom:10px;">Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)}</p>
                    <input type="text" id="desc-reporte" class="form-control form-control-sm mb-2" placeholder="Describa el problema...">
                    <button class="btn btn-primary btn-sm w-100 fw-semibold" onclick="guardarReporteMapa(${lat}, ${lng}, ${aqi})">
                        <i class="fas fa-map-marker-alt me-1"></i> Fijar Alerta
                    </button>
                </div>
            `;
            L.popup().setLatLng(e.latlng).setContent(contenidoVentanita).openOn(mapaIntegrado);
        });

        dibujarMarcadoresGuardados();
    } else {
        setTimeout(() => mapaIntegrado.invalidateSize(), 100);
    }
}

function dibujarMarcadoresGuardados() {
    if(!mapaIntegrado) return;
    Object.keys(marcadoresMapa).forEach(id => {
        mapaIntegrado.removeLayer(marcadoresMapa[id]);
    });
    marcadoresMapa = {};

    const rolUsuario = localStorage.getItem('rol_activo');
    const esOperativo = esUsuarioOperativo(rolUsuario);

    reportesDB.forEach(rep => {
        let colorEstado = rep.aqi < 50 ? "Óptimo" : (rep.aqi < 100 ? "Regular" : "Peligroso");
        let marker = L.marker([rep.lat, rep.lng]).addTo(mapaIntegrado);
        
        let botonEliminarHTML = esOperativo ? `
            <button class="btn btn-danger btn-sm text-white mt-2 py-0 px-2" style="font-size:11px;" onclick="eliminarReporte(${rep.id})">
                Eliminar Alerta
            </button>
        ` : '';

        marker.bindPopup(`
            <div style="text-align:center;">
                <strong style="color:#0d6efd;">${rep.descripcion}</strong><br>
                <span style="font-size:12px;">Calidad del Aire: <b>${rep.aqi} AQI (${colorEstado})</b></span><br>
                ${botonEliminarHTML}
            </div>
        `);

        marcadoresMapa[rep.id] = marker;
    });
}

async function buscarAirePorCoordenadas(lat, lng) {
    try {
        const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=european_aqi`);
        const data = await res.json();
        return data.hourly.european_aqi[0]; 
    } catch(err) { return "N/A"; }
}

// --- 5. REPORTES ---
async function guardarReporteMapa(lat, lng, aqi) {
    const descripcion = document.getElementById('desc-reporte').value;
    if(descripcion.trim() === "") return alert("Escribe una descripción.");

    const titulo = "Intervención: " + descripcion;
    const ubicacion = `Coord: ${Number(lat).toFixed(3)}, ${Number(lng).toFixed(3)}`;

    try {
        const resRep = await fetch(`${API_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng, aqi, descripcion })
        });

        if (resRep.ok) {
            const nuevoReporte = await resRep.json();
            reportesDB.push(nuevoReporte);

            const resMis = await fetch(`${API_URL}/misiones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, ubicacion, aqi, estado: "Pendiente" })
            });

            if (resMis.ok) {
                const nuevaMision = await resMis.json();
                misionesDB.push(nuevaMision);
            }

            mapaIntegrado.closePopup(); 
            dibujarMarcadoresGuardados();
            actualizarTablaReportes();
            actualizarTablaMisiones(); 
        } else {
            alert(await leerMensajeError(resRep, "No se pudo guardar el reporte."));
        }
    } catch(err) {
        console.error(err);
        alert("Error guardando el reporte en la base de datos.");
    }
}

function actualizarTablaReportes() {
    const tbody = document.getElementById('tabla-reportes-body');
    const cardsBody = document.getElementById('cards-reportes-body');
    if (!tbody || !cardsBody) return;

    tbody.innerHTML = ''; 
    cardsBody.innerHTML = '';
    
    const elemStat = document.getElementById('stat-reportes');
    if (elemStat) elemStat.innerText = reportesDB.length;

    const rolUsuario = localStorage.getItem('rol_activo');
    const esOperativo = esUsuarioOperativo(rolUsuario);

    reportesDB.forEach((rep) => {
        let accionesTabla = esOperativo ? 
            `<button class="btn btn-outline-danger btn-sm" onclick="eliminarReporte(${rep.id})"><i class="fas fa-trash"></i></button>` : 
            `<span class="text-muted small">Sólo lectura</span>`;

        tbody.innerHTML += `
            <tr>
                <td>#${rep.id.toString().slice(-4)}</td>
                <td><i class="fas fa-map-marker-alt text-danger me-1"></i> ${Number(rep.lat).toFixed(3)}, ${Number(rep.lng).toFixed(3)}</td>
                <td>${obtenerBadgeAire(rep.aqi)}</td>
                <td>${rep.descripcion}</td>
                <td>${accionesTabla}</td>
            </tr>
        `;

        let accionesCards = esOperativo ? `
            <div class="text-end">
                <button class="btn btn-danger btn-sm rounded-3 px-3" onclick="eliminarReporte(${rep.id})"><i class="fas fa-trash"></i></button>
            </div>
        ` : '';

        cardsBody.innerHTML += `
            <div class="col-12">
                <div class="card border-0 shadow-sm p-3 rounded-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="text-muted small fw-bold">#${rep.id.toString().slice(-4)}</span>
                        ${obtenerBadgeAire(rep.aqi)}
                    </div>
                    <p class="text-primary small mb-1"><i class="fas fa-map-marker-alt text-danger me-1"></i> ${Number(rep.lat).toFixed(3)}, ${Number(rep.lng).toFixed(3)}</p>
                    <p class="fw-bold mb-3 text-dark">${rep.descripcion}</p>
                    ${accionesCards}
                </div>
            </div>
        `;
    });
}

async function eliminarReporte(id) {
    const rolUsuario = localStorage.getItem('rol_activo');
    if (!esUsuarioOperativo(rolUsuario)) {
        alert("No tienes permisos para eliminar reportes.");
        return;
    }

    if(confirm('¿Deseas eliminar esta alerta del mapa?')) {
        try {
            const res = await fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if(marcadoresMapa[id]) {
                    mapaIntegrado.removeLayer(marcadoresMapa[id]);
                    delete marcadoresMapa[id];
                }
                reportesDB = reportesDB.filter(r => r.id !== id);
                actualizarTablaReportes();
            }
        } catch(err) {
            console.error(err);
        }
    }
}

// --- 6. MISIONES Y CONTROL DE ROLES ---
function actualizarTablaMisiones() {
    const tbody = document.getElementById('tabla-misiones-body');
    const cardsBody = document.getElementById('cards-misiones-body');
    if (!tbody || !cardsBody) return;

    tbody.innerHTML = ''; 
    cardsBody.innerHTML = '';

    const elemStat = document.getElementById('stat-misiones');
    if (elemStat) elemStat.innerText = misionesDB.length;

    const rolUsuario = localStorage.getItem('rol_activo');
    const esOperativo = esUsuarioOperativo(rolUsuario);

    // Visibilidad del botón de "Nueva Misión"
    const btnNuevaMision = document.getElementById('btn-nueva-mision');
    if (btnNuevaMision) {
        if (esOperativo) {
            btnNuevaMision.classList.remove('d-none');
        } else {
            btnNuevaMision.classList.add('d-none');
        }
    }

    misionesDB.forEach((mision) => {
        let claseBadge = mision.estado === 'Pendiente' ? 'bg-warning text-dark' : (mision.estado === 'En Curso' ? 'bg-info text-dark' : 'bg-success');

        let celdaAcciones = esOperativo ? `
            <button class="btn btn-outline-warning btn-sm me-1" onclick="editarMision(${mision.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="eliminarMision(${mision.id})"><i class="fas fa-trash"></i></button>
        ` : `<span class="text-muted small">Sin permisos</span>`;

        tbody.innerHTML += `
            <tr>
                <td>#${mision.id.toString().slice(-4)}</td>
                <td><strong>${mision.titulo}</strong></td>
                <td>${mision.ubicacion}</td>
                <td>${obtenerBadgeAire(mision.aqi)}</td>
                <td><span class="badge ${claseBadge}">${mision.estado}</span></td>
                <td>${celdaAcciones}</td>
            </tr>
        `;

        let botonesCard = esOperativo ? `
            <div class="row g-2">
                <div class="col-6">
                    <button class="btn btn-warning text-white w-100 rounded-3 py-2 fw-semibold" onclick="editarMision(${mision.id})"><i class="fas fa-edit me-1"></i> Editar</button>
                </div>
                <div class="col-6">
                    <button class="btn btn-danger w-100 rounded-3 py-2 fw-semibold" onclick="eliminarMision(${mision.id})"><i class="fas fa-trash me-1"></i> Eliminar</button>
                </div>
            </div>
        ` : '';

        cardsBody.innerHTML += `
            <div class="col-12">
                <div class="card border-0 shadow-sm p-3 rounded-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="text-muted small fw-bold">#${mision.id.toString().slice(-4)}</span>
                        <span class="badge ${claseBadge} px-3 py-1 rounded-pill fw-semibold">${mision.estado}</span>
                    </div>
                    <h3 class="h6 fw-bold text-dark mb-1">${mision.titulo}</h3>
                    <p class="text-muted small mb-2">${mision.ubicacion}</p>
                    <div class="mb-3">
                        <small class="text-secondary d-block mb-1">Calidad del aire:</small>
                        ${obtenerBadgeAire(mision.aqi)}
                    </div>
                    ${botonesCard}
                </div>
            </div>
        `;
    });
}

const formMis = document.getElementById('form-mision');
if (formMis) {
    formMis.addEventListener('submit', async function(e) {
        e.preventDefault();
        const idInput = document.getElementById('mision-id').value;
        const aqiVal = document.getElementById('mision-aqi').value;

        const misionData = {
            titulo: document.getElementById('mision-titulo').value,
            ubicacion: document.getElementById('mision-ubicacion').value,
            aqi: aqiVal !== "" ? Number(aqiVal) : null,
            estado: document.getElementById('mision-estado').value
        };

        try {
            if (idInput === "") {
                const res = await fetch(`${API_URL}/misiones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(misionData)
                });
                if (res.ok) {
                    const nueva = await res.json();
                    misionesDB.push(nueva);
                } else {
                    alert(await leerMensajeError(res, "No se pudo guardar la misión."));
                    return;
                }
            } else {
                const res = await fetch(`${API_URL}/misiones/${idInput}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(misionData)
                });
                if (res.ok) {
                    const index = misionesDB.findIndex(m => m.id == idInput);
                    misionesDB[index] = await res.json();
                } else {
                    alert(await leerMensajeError(res, "No se pudo actualizar la misión."));
                    return;
                }
            }
            
            cerrarModalMision();
            actualizarTablaMisiones();
        } catch(err) {
            console.error(err);
            alert("Error guardando la misión.");
        }
    });
}

function editarMision(id) {
    const rolUsuario = localStorage.getItem('rol_activo');
    if (!esUsuarioOperativo(rolUsuario)) {
        alert("No tienes permisos suficientes para realizar esta acción.");
        return;
    }

    const mision = misionesDB.find(m => m.id === id);
    document.getElementById('modal-titulo-texto').innerText = "Editar Misión";
    document.getElementById('mision-id').value = mision.id;
    document.getElementById('mision-titulo').value = mision.titulo;
    document.getElementById('mision-ubicacion').value = mision.ubicacion;
    document.getElementById('mision-aqi').value = (mision.aqi !== null && mision.aqi !== undefined) ? mision.aqi : "";
    document.getElementById('mision-estado').value = mision.estado;
    document.getElementById('modal-mision').classList.remove('oculta');
}

async function eliminarMision(id) {
    const rolUsuario = localStorage.getItem('rol_activo');
    if (!esUsuarioOperativo(rolUsuario)) {
        alert("No tienes permisos suficientes para realizar esta acción.");
        return;
    }

    if(confirm('¿Eliminar esta misión de la lista de trabajo?')) {
        try {
            const res = await fetch(`${API_URL}/misiones/${id}`, { method: 'DELETE' });
            if (res.ok) {
                misionesDB = misionesDB.filter(m => m.id !== id);
                actualizarTablaMisiones();
            }
        } catch(err) {
            console.error(err);
        }
    }
}

function abrirModalNueva() { 
    const rolUsuario = localStorage.getItem('rol_activo');
    if (!esUsuarioOperativo(rolUsuario)) {
        alert("No tienes permisos para crear misiones.");
        return;
    }

    if (document.getElementById('form-mision')) document.getElementById('form-mision').reset(); 
    document.getElementById('mision-id').value = ""; 
    document.getElementById('mision-aqi').value = "";
    document.getElementById('modal-titulo-texto').innerText = "Nueva Misión";
    document.getElementById('modal-mision').classList.remove('oculta'); 
}

function cerrarModalMision() { 
    document.getElementById('modal-mision').classList.add('oculta'); 
}

// --- 7. HISTORIAL ---
function abrirModalHistorial() {
    const tbody = document.getElementById('tabla-historial-body');
    const cardsBody = document.getElementById('cards-historial-body');
    if(!tbody || !cardsBody) return;

    tbody.innerHTML = '';
    cardsBody.innerHTML = '';

    if (misionesDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No hay misiones registradas.</td></tr>`;
        cardsBody.innerHTML = `<p class="text-center text-muted py-3">No hay misiones registradas.</p>`;
    } else {
        misionesDB.forEach(item => {
            let claseBadge = item.estado === 'Pendiente' ? 'bg-warning text-dark' : (item.estado === 'En Curso' ? 'bg-info text-dark' : 'bg-success');

            tbody.innerHTML += `
                <tr>
                    <td>#${item.id.toString().slice(-4)}</td>
                    <td><strong>${item.titulo}</strong></td>
                    <td>${item.ubicacion}</td>
                    <td>${obtenerBadgeAire(item.aqi)}</td>
                    <td><span class="badge ${claseBadge}">${item.estado}</span></td>
                </tr>
            `;

            cardsBody.innerHTML += `
                <div class="col-12">
                    <div class="card border-0 shadow-sm p-3 rounded-4 bg-light">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted small fw-bold">#${item.id.toString().slice(-4)}</span>
                            <span class="badge ${claseBadge} px-3 py-1 rounded-pill fw-semibold">${item.estado}</span>
                        </div>
                        <h3 class="h6 fw-bold text-dark mb-1">${item.titulo}</h3>
                        <p class="text-muted small mb-2">${item.ubicacion}</p>
                        <div>
                            <small class="text-secondary d-block mb-1">Aire:</small>
                            ${obtenerBadgeAire(item.aqi)}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('modal-historial').classList.remove('oculta');
}

function cerrarModalHistorial() {
    document.getElementById('modal-historial').classList.add('oculta');
}