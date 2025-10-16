class ModoOffline {
    constructor() {
        this.isOnline = navigator.onLine;
        this.datosOffline = JSON.parse(localStorage.getItem('datosOffline')) || {};
        this.colaSync = JSON.parse(localStorage.getItem('colaSync')) || [];
        this.configuracion = JSON.parse(localStorage.getItem('configOffline')) || this.configuracionDefault();
        this.ultimaSync = localStorage.getItem('ultimaSync') || null;
        this.inicializar();
    }

    configuracionDefault() {
        return {
            autoSync: true,
            intervaloSync: 30000, // 30 segundos
            maxReintentos: 3,
            notificaciones: true,
            cacheDias: 7,
            compresion: true
        };
    }

    inicializar() {
        this.configurarEventos();
        this.configurarServiceWorker();
        this.iniciarMonitoreoConexion();
        this.cargarDatosCache();
        this.mostrarEstadoConexion();
        
        if (this.isOnline && this.configuracion.autoSync) {
            this.sincronizarDatos();
        }
    }

    configurarEventos() {
        // Detectar cambios de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onlineStatusChanged();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onlineStatusChanged();
        });

        // Interceptar formularios para guardar offline
        document.addEventListener('submit', (e) => {
            if (!this.isOnline) {
                this.manejarFormularioOffline(e);
            }
        });

        // Detectar antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            this.guardarEstadoLocal();
        });
    }

    async configurarServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.mostrarNotificacion('Nueva versión disponible', 'info');
                        }
                    });
                });
            } catch (error) {
                console.log('Error al registrar Service Worker:', error);
            }
        }
    }

    onlineStatusChanged() {
        this.mostrarEstadoConexion();
        
        if (this.isOnline) {
            this.mostrarNotificacion('Conexión restaurada - Sincronizando datos...', 'success');
            if (this.configuracion.autoSync) {
                setTimeout(() => {
                    this.sincronizarDatos();
                }, 1000);
            }
        } else {
            this.mostrarNotificacion('Modo offline activado - Los datos se guardarán localmente', 'warning');
            this.activarModoOffline();
        }
    }

    mostrarEstadoConexion() {
        let indicador = document.getElementById('indicador-conexion');
        
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'indicador-conexion';
            indicador.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                padding: 8px 12px;
                border-radius: 20px;
                color: white;
                font-size: 0.85em;
                font-weight: 600;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 5px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicador);
        }

        if (this.isOnline) {
            indicador.style.backgroundColor = '#28a745';
            indicador.innerHTML = '🟢 En línea';
        } else {
            indicador.style.backgroundColor = '#dc3545';
            indicador.innerHTML = '🔴 Sin conexión';
        }
    }

    activarModoOffline() {
        // Precargar datos esenciales
        this.precargarDatosEsenciales();
        
        // Configurar interceptores para almacenamiento local
        this.configurarInterceptores();
        
        // Mostrar aviso en la interfaz
        this.mostrarAvisoOffline();
    }

    precargarDatosEsenciales() {
        const datosEsenciales = {
            productos: JSON.parse(localStorage.getItem('productos')) || [],
            clientes: JSON.parse(localStorage.getItem('clientes')) || [],
            empleados: JSON.parse(localStorage.getItem('empleados')) || [],
            configuracion: JSON.parse(localStorage.getItem('configuracion')) || {}
        };

        this.datosOffline = { ...this.datosOffline, ...datosEsenciales };
        this.guardarDatosOffline();
    }

    configurarInterceptores() {
        // Interceptar localStorage para registrar cambios
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            originalSetItem.call(localStorage, key, value);
            
            if (!this.isOnline && ['productos', 'ventas', 'clientes', 'empleados'].includes(key)) {
                this.registrarCambioOffline(key, value, 'update');
            }
        };
    }

    registrarCambioOffline(clave, datos, accion = 'update') {
        const cambio = {
            id: Date.now() + Math.random(),
            clave,
            datos,
            accion,
            timestamp: new Date().toISOString(),
            sincronizado: false,
            reintentos: 0
        };

        this.colaSync.push(cambio);
        this.guardarColaSync();
        
        this.mostrarNotificacion(`Cambio guardado offline: ${clave}`, 'info');
    }

    manejarFormularioOffline(evento) {
        evento.preventDefault();
        
        const formulario = evento.target;
        const formData = new FormData(formulario);
        const datos = Object.fromEntries(formData.entries());
        
        // Determinar tipo de operación basado en el formulario
        let tipoOperacion = 'general';
        if (formulario.id.includes('producto')) tipoOperacion = 'productos';
        else if (formulario.id.includes('venta')) tipoOperacion = 'ventas';
        else if (formulario.id.includes('cliente')) tipoOperacion = 'clientes';
        else if (formulario.id.includes('empleado')) tipoOperacion = 'empleados';

        // Guardar datos localmente
        this.guardarDatosFormulario(tipoOperacion, datos);
        
        // Mostrar confirmación
        this.mostrarNotificacion('Datos guardados offline - Se sincronizarán cuando haya conexión', 'success');
        
        // Limpiar formulario
        formulario.reset();
    }

    guardarDatosFormulario(tipo, datos) {
        datos.id = Date.now() + Math.random();
        datos.timestamp = new Date().toISOString();
        datos.offline = true;

        const datosActuales = JSON.parse(localStorage.getItem(tipo)) || [];
        datosActuales.push(datos);
        localStorage.setItem(tipo, JSON.stringify(datosActuales));

        this.registrarCambioOffline(tipo, JSON.stringify(datosActuales), 'create');
    }

    async sincronizarDatos() {
        if (!this.isOnline || this.colaSync.length === 0) {
            return;
        }

        this.mostrarProgresoSync(true);
        
        let sincronizados = 0;
        let errores = 0;

        for (const cambio of this.colaSync.filter(c => !c.sincronizado)) {
            try {
                await this.procesarCambio(cambio);
                cambio.sincronizado = true;
                sincronizados++;
            } catch (error) {
                cambio.reintentos++;
                errores++;
                
                if (cambio.reintentos >= this.configuracion.maxReintentos) {
                    console.error('Error al sincronizar:', error);
                }
            }
        }

        // Limpiar cambios sincronizados
        this.colaSync = this.colaSync.filter(c => !c.sincronizado);
        this.guardarColaSync();

        this.ultimaSync = new Date().toISOString();
        localStorage.setItem('ultimaSync', this.ultimaSync);

        this.mostrarProgresoSync(false);
        
        if (sincronizados > 0) {
            this.mostrarNotificacion(`${sincronizados} cambios sincronizados exitosamente`, 'success');
        }
        
        if (errores > 0) {
            this.mostrarNotificacion(`${errores} cambios fallaron - Se reintentarán`, 'warning');
        }
    }

    async procesarCambio(cambio) {
        return new Promise((resolve, reject) => {
            // Simular procesamiento de sincronización
            setTimeout(() => {
                // En una implementación real, aquí se enviarían los datos al servidor
                console.log('Sincronizando cambio:', cambio);
                
                // Simular éxito/fallo aleatorio
                if (Math.random() > 0.1) { // 90% de éxito
                    resolve();
                } else {
                    reject(new Error('Error de simulación'));
                }
            }, Math.random() * 1000);
        });
    }

    mostrarProgresoSync(mostrar) {
        let progreso = document.getElementById('progreso-sync');
        
        if (mostrar && !progreso) {
            progreso = document.createElement('div');
            progreso.id = 'progreso-sync';
            progreso.style.cssText = `
                position: fixed;
                top: 50px;
                right: 10px;
                background: white;
                border: 2px solid #8B4513;
                border-radius: 10px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 200px;
            `;
            
            progreso.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 20px; height: 20px; border: 2px solid #8B4513; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span style="font-weight: 600; color: #8B4513;">Sincronizando...</span>
                </div>
                <div style="background: #f0f0f0; height: 4px; border-radius: 2px; overflow: hidden;">
                    <div id="barra-sync" style="height: 100%; background: #8B4513; width: 0%; transition: width 0.3s ease;"></div>
                </div>
                <div id="contador-sync" style="font-size: 0.8em; color: #666; margin-top: 5px;">0 de ${this.colaSync.length} cambios</div>
            `;
            
            document.body.appendChild(progreso);

            // Agregar animación CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        } else if (!mostrar && progreso) {
            progreso.remove();
        }
    }

    mostrarAvisoOffline() {
        const aviso = document.createElement('div');
        aviso.id = 'aviso-offline';
        aviso.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-size: 0.9em;
        `;
        
        aviso.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 1.2em;">⚠️</span>
                <strong>Modo Offline Activo</strong>
            </div>
            <p style="margin: 0; line-height: 1.4;">
                Los datos se guardan localmente y se sincronizarán automáticamente cuando se restaure la conexión.
            </p>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 8px;
                background: none;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                color: #856404;
            ">×</button>
        `;
        
        document.body.appendChild(aviso);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (aviso.parentElement) {
                aviso.remove();
            }
        }, 10000);
    }

    cargarDatosCache() {
        // Verificar si hay datos en cache
        const datosCache = this.datosOffline;
        
        if (Object.keys(datosCache).length > 0) {
            // Verificar fecha de expiración
            const ultimaActualizacion = localStorage.getItem('ultimaActualizacionCache');
            const ahora = new Date();
            const limite = new Date(ahora.getTime() - (this.configuracion.cacheDias * 24 * 60 * 60 * 1000));
            
            if (!ultimaActualizacion || new Date(ultimaActualizacion) < limite) {
                this.limpiarCacheAntiguo();
            }
        }
    }

    limpiarCacheAntiguo() {
        const clavesCache = Object.keys(this.datosOffline);
        clavesCache.forEach(clave => {
            delete this.datosOffline[clave];
        });
        
        this.guardarDatosOffline();
        localStorage.removeItem('ultimaActualizacionCache');
    }

    iniciarMonitoreoConexion() {
        // Verificar conexión cada 30 segundos
        setInterval(() => {
            this.verificarConexion();
        }, 30000);
    }

    async verificarConexion() {
        try {
            const response = await fetch('/ping', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            const estaOnline = response.ok;
            
            if (estaOnline !== this.isOnline) {
                this.isOnline = estaOnline;
                this.onlineStatusChanged();
            }
        } catch (error) {
            if (this.isOnline) {
                this.isOnline = false;
                this.onlineStatusChanged();
            }
        }
    }

    // Métodos de almacenamiento
    guardarDatosOffline() {
        localStorage.setItem('datosOffline', JSON.stringify(this.datosOffline));
    }

    guardarColaSync() {
        localStorage.setItem('colaSync', JSON.stringify(this.colaSync));
    }

    guardarEstadoLocal() {
        const estado = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            datos: this.datosOffline,
            cola: this.colaSync
        };
        
        localStorage.setItem('estadoOffline', JSON.stringify(estado));
    }

    // Métodos públicos para otras partes del sistema
    obtenerDatos(clave) {
        if (this.isOnline) {
            return JSON.parse(localStorage.getItem(clave)) || [];
        } else {
            return this.datosOffline[clave] || JSON.parse(localStorage.getItem(clave)) || [];
        }
    }

    guardarDatos(clave, datos) {
        localStorage.setItem(clave, JSON.stringify(datos));
        
        if (!this.isOnline) {
            this.datosOffline[clave] = datos;
            this.guardarDatosOffline();
            this.registrarCambioOffline(clave, JSON.stringify(datos), 'update');
        }
    }

    obtenerEstadisticas() {
        return {
            estado: this.isOnline ? 'online' : 'offline',
            cambiosPendientes: this.colaSync.filter(c => !c.sincronizado).length,
            ultimaSync: this.ultimaSync,
            datosCache: Object.keys(this.datosOffline).length,
            espacioUsado: this.calcularEspacioUsado()
        };
    }

    calcularEspacioUsado() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }

    // Métodos de configuración
    actualizarConfiguracion(nuevaConfig) {
        this.configuracion = { ...this.configuracion, ...nuevaConfig };
        localStorage.setItem('configOffline', JSON.stringify(this.configuracion));
    }

    forzarSincronizacion() {
        if (this.isOnline) {
            this.sincronizarDatos();
        } else {
            this.mostrarNotificacion('No hay conexión disponible para sincronizar', 'warning');
        }
    }

    limpiarDatosOffline() {
        if (confirm('¿Está seguro de que desea limpiar todos los datos offline? Esta acción no se puede deshacer.')) {
            this.datosOffline = {};
            this.colaSync = [];
            this.guardarDatosOffline();
            this.guardarColaSync();
            localStorage.removeItem('ultimaSync');
            localStorage.removeItem('estadoOffline');
            
            this.mostrarNotificacion('Datos offline limpiados exitosamente', 'success');
        }
    }

    exportarDatosOffline() {
        const datos = {
            timestamp: new Date().toISOString(),
            datosOffline: this.datosOffline,
            colaSync: this.colaSync,
            configuracion: this.configuracion,
            estadisticas: this.obtenerEstadisticas()
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `datos-offline-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.mostrarNotificacion('Datos offline exportados exitosamente', 'success');
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        if (!this.configuracion.notificaciones) return;

        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10001;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 0.9em;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        const colores = {
            'success': '#28a745',
            'warning': '#ffc107',
            'error': '#dc3545',
            'info': '#17a2b8'
        };

        notificacion.style.backgroundColor = colores[tipo] || colores['info'];
        notificacion.textContent = mensaje;

        document.body.appendChild(notificacion);

        // Animación de entrada
        setTimeout(() => {
            notificacion.style.transform = 'translateX(0)';
        }, 100);

        // Eliminar después de 4 segundos
        setTimeout(() => {
            notificacion.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificacion.parentElement) {
                    notificacion.remove();
                }
            }, 300);
        }, 4000);
    }
}

// Service Worker content para crear sw.js
const serviceWorkerContent = `
const CACHE_NAME = 'cafeteria-cesde-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/productos.html',
    '/compra.html',
    '/inventario.html',
    '/registro.html',
    '/empleados.html',
    '/proveedores.html',
    '/calidad.html',
    '/backup.html',
    '/notificaciones.html',
    '/reportes.html',
    '/factura.html',
    '/soporte.html',
    '/css/style.css',
    '/js/productos.js',
    '/js/compra.js',
    '/js/inventario.js',
    '/js/registro.js',
    '/js/empleados.js',
    '/js/proveedores.js',
    '/js/calidad.js',
    '/js/backup.js',
    '/js/notificaciones.js',
    '/js/reportes.js',
    '/js/factura.js',
    '/js/soporte.js',
    '/Images/cafe cesde logo.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
`;

// Crear el archivo Service Worker
function crearServiceWorker() {
    const blob = new Blob([serviceWorkerContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    // En un entorno real, esto se haría en el servidor
    console.log('Service Worker content ready');
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.modoOffline = new ModoOffline();
    crearServiceWorker();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModoOffline;
}