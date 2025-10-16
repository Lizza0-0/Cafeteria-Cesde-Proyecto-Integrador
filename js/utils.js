/**
 * Sistema de Utilidades - Cafetería Cesde
 * Modo Offline, Optimización y Notificaciones consolidados
 */

// ===== SISTEMA DE NOTIFICACIONES =====
class SistemaNotificaciones {
    constructor() {
        this.notificaciones = JSON.parse(localStorage.getItem('notificaciones')) || [];
        this.configuracion = JSON.parse(localStorage.getItem('configNotificaciones')) || this.configuracionDefault();
        this.inicializar();
    }

    configuracionDefault() {
        return {
            notifPush: true,
            sonidoAlerta: true,
            vibracion: false,
            alertStock: true,
            alertVencimiento: true,
            alertVentas: true,
            alertPromociones: true
        };
    }

    inicializar() {
        this.verificarPermisos();
        this.configurarEventos();
        this.cargarNotificaciones();
    }

    verificarPermisos() {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.mostrarNotificacion("¡Notificaciones activadas!", "Sistema configurado correctamente", "info");
                }
            });
        }
    }

    configurarEventos() {
        // Configurar eventos básicos de notificaciones
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cerrar-notif')) {
                this.cerrarNotificacion(e.target.closest('.notificacion').dataset.id);
            }
        });
    }

    mostrarNotificacion(titulo, mensaje, tipo = 'info', duracion = 5000) {
        const notificacion = {
            id: Date.now(),
            titulo,
            mensaje,
            tipo,
            fecha: new Date().toISOString(),
            leida: false
        };

        this.notificaciones.unshift(notificacion);
        this.guardarNotificaciones();

        // Mostrar notificación del navegador
        if (this.configuracion.notifPush && "Notification" in window && Notification.permission === "granted") {
            new Notification(titulo, {
                body: mensaje,
                icon: '/Images/logo.png'
            });
        }

        // Mostrar notificación en la interfaz
        this.mostrarNotificacionUI(notificacion, duracion);
    }

    mostrarNotificacionUI(notificacion, duracion) {
        const container = this.obtenerContainerNotificaciones();
        const div = document.createElement('div');
        div.className = `notificacion notificacion-${notificacion.tipo}`;
        div.dataset.id = notificacion.id;
        
        div.innerHTML = `
            <div class="notificacion-header">
                <strong>${notificacion.titulo}</strong>
                <button class="btn-cerrar-notif">×</button>
            </div>
            <div class="notificacion-body">${notificacion.mensaje}</div>
        `;

        div.style.cssText = `
            background: ${this.obtenerColorTipo(notificacion.tipo)};
            color: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            animation: slideIn 0.3s ease;
        `;

        container.appendChild(div);

        // Auto-eliminar después de la duración especificada
        if (duracion > 0) {
            setTimeout(() => {
                this.cerrarNotificacion(notificacion.id);
            }, duracion);
        }
    }

    obtenerContainerNotificaciones() {
        let container = document.getElementById('notificaciones-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificaciones-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    obtenerColorTipo(tipo) {
        const colores = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        return colores[tipo] || colores.info;
    }

    cerrarNotificacion(id) {
        const elemento = document.querySelector(`[data-id="${id}"]`);
        if (elemento) {
            elemento.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (elemento.parentNode) {
                    elemento.parentNode.removeChild(elemento);
                }
            }, 300);
        }
    }

    cargarNotificaciones() {
        // Cargar notificaciones existentes si hay un container en la página
        const container = document.getElementById('lista-notificaciones');
        if (container) {
            this.renderizarListaNotificaciones(container);
        }
    }

    renderizarListaNotificaciones(container) {
        container.innerHTML = '';
        this.notificaciones.slice(0, 20).forEach(notif => {
            const div = document.createElement('div');
            div.className = `notificacion-item ${notif.leida ? 'leida' : 'no-leida'}`;
            div.innerHTML = `
                <div class="notif-header">
                    <strong>${notif.titulo}</strong>
                    <small>${new Date(notif.fecha).toLocaleString()}</small>
                </div>
                <div class="notif-mensaje">${notif.mensaje}</div>
            `;
            container.appendChild(div);
        });
    }

    guardarNotificaciones() {
        localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
    }
}

// ===== SISTEMA MODO OFFLINE =====
class ModoOffline {
    constructor() {
        this.isOnline = navigator.onLine;
        this.datosOffline = JSON.parse(localStorage.getItem('datosOffline')) || {};
        this.colaSync = JSON.parse(localStorage.getItem('colaSync')) || [];
        this.configuracion = { autoSync: true, maxReintentos: 3 };
        this.inicializar();
    }

    inicializar() {
        this.configurarEventos();
        this.mostrarEstadoConexion();
        
        if (this.isOnline && this.configuracion.autoSync) {
            this.sincronizarDatos();
        }
    }

    configurarEventos() {
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
    }

    onlineStatusChanged() {
        this.mostrarEstadoConexion();
        
        if (this.isOnline) {
            window.sistemaNotificaciones?.mostrarNotificacion(
                'Conexión restaurada', 
                'Se ha restablecido la conexión a internet', 
                'success'
            );
            this.sincronizarDatos();
        } else {
            window.sistemaNotificaciones?.mostrarNotificacion(
                'Modo offline', 
                'Trabajando sin conexión. Los datos se sincronizarán automáticamente.', 
                'warning'
            );
        }
    }

    mostrarEstadoConexion() {
        const indicador = this.obtenerIndicadorEstado();
        indicador.className = `estado-conexion ${this.isOnline ? 'online' : 'offline'}`;
        indicador.textContent = this.isOnline ? '🟢 Online' : '🔴 Offline';
    }

    obtenerIndicadorEstado() {
        let indicador = document.getElementById('estado-conexion');
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'estado-conexion';
            indicador.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
                z-index: 9999;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicador);
        }
        return indicador;
    }

    manejarFormularioOffline(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const datos = Object.fromEntries(formData.entries());
        
        // Agregar a cola de sincronización
        this.colaSync.push({
            id: Date.now(),
            tipo: 'form',
            datos: datos,
            url: e.target.action || window.location.href,
            timestamp: new Date().toISOString()
        });
        
        this.guardarColaSync();
        
        window.sistemaNotificaciones?.mostrarNotificacion(
            'Datos guardados offline', 
            'Los datos se sincronizarán cuando se restablezca la conexión', 
            'info'
        );
    }

    sincronizarDatos() {
        if (this.colaSync.length === 0) return;
        
        console.log('Sincronizando datos offline...');
        
        // Procesar cola de sincronización
        this.colaSync.forEach(async (item, index) => {
            try {
                await this.procesarItemSync(item);
                this.colaSync.splice(index, 1);
            } catch (error) {
                console.error('Error sincronizando:', error);
            }
        });
        
        this.guardarColaSync();
        
        if (this.colaSync.length === 0) {
            window.sistemaNotificaciones?.mostrarNotificacion(
                'Sincronización completa', 
                'Todos los datos offline han sido sincronizados', 
                'success'
            );
        }
    }

    async procesarItemSync(item) {
        // Simular sincronización (aquí iría la lógica real de envío al servidor)
        console.log('Sincronizando item:', item);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    guardarColaSync() {
        localStorage.setItem('colaSync', JSON.stringify(this.colaSync));
    }

    guardarDatoLocal(clave, datos) {
        this.datosOffline[clave] = datos;
        localStorage.setItem('datosOffline', JSON.stringify(this.datosOffline));
    }

    obtenerDatoLocal(clave) {
        return this.datosOffline[clave] || null;
    }
}

// ===== SISTEMA DE OPTIMIZACIÓN =====
class OptimizacionRendimiento {
    constructor() {
        this.configuracion = {
            lazyLoading: true,
            cacheInteligente: true,
            optimizacionConsultas: true,
            debounceInputs: 300
        };
        this.cache = new Map();
        this.observadorInterseccion = null;
        this.inicializar();
    }

    inicializar() {
        console.log('🚀 Iniciando optimización de rendimiento...');
        
        if (this.configuracion.lazyLoading) {
            this.configurarLazyLoading();
        }
        
        if (this.configuracion.cacheInteligente) {
            this.configurarCacheInteligente();
        }
        
        if (this.configuracion.optimizacionConsultas) {
            this.optimizarConsultas();
        }
        
        this.optimizarImagenes();
        this.configurarDebounce();
    }

    configurarLazyLoading() {
        // Configurar lazy loading para imágenes
        this.observadorInterseccion = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        this.observadorInterseccion.unobserve(img);
                    }
                }
            });
        });

        // Observar todas las imágenes con data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observadorInterseccion.observe(img);
        });
    }

    configurarCacheInteligente() {
        // Sistema de cache simple para consultas
        const cacheOriginal = window.localStorage;
        
        this.cache.set = (key, value, expiration = 300000) => { // 5 minutos por defecto
            const item = {
                value: value,
                expiration: Date.now() + expiration
            };
            cacheOriginal.setItem(`cache_${key}`, JSON.stringify(item));
        };

        this.cache.get = (key) => {
            const item = cacheOriginal.getItem(`cache_${key}`);
            if (!item) return null;
            
            const parsed = JSON.parse(item);
            if (Date.now() > parsed.expiration) {
                cacheOriginal.removeItem(`cache_${key}`);
                return null;
            }
            
            return parsed.value;
        };
    }

    optimizarConsultas() {
        // Optimizar consultas DOM frecuentes
        const consultas = new Map();
        
        const querySelector = document.querySelector.bind(document);
        const querySelectorAll = document.querySelectorAll.bind(document);
        
        document.querySelector = (selector) => {
            if (consultas.has(selector)) {
                return consultas.get(selector);
            }
            const resultado = querySelector(selector);
            consultas.set(selector, resultado);
            return resultado;
        };
        
        // Limpiar cache de consultas periódicamente
        setInterval(() => {
            consultas.clear();
        }, 30000);
    }

    optimizarImagenes() {
        // Optimizar imágenes automáticamente
        document.querySelectorAll('img').forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
            
            // Agregar eventos de error para fallback
            img.addEventListener('error', () => {
                if (!img.dataset.fallback) {
                    img.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=300&fit=crop&crop=center';
                    img.dataset.fallback = 'true';
                }
            });
        });
    }

    configurarDebounce() {
        // Configurar debounce para inputs de búsqueda
        document.querySelectorAll('input[type="search"], input[data-search]').forEach(input => {
            let timeout;
            const originalEvent = input.oninput;
            
            input.oninput = (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (originalEvent) originalEvent.call(input, e);
                }, this.configuracion.debounceInputs);
            };
        });
    }

    medirRendimiento() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const tiempoTotal = navigation.loadEventEnd - navigation.fetchStart;
            
            console.log(`⚡ Tiempo de carga: ${tiempoTotal}ms`);
            
            if (tiempoTotal > 3000) {
                console.warn('⚠️ Tiempo de carga elevado detectado');
            }
        }
    }

    limpiarCache() {
        // Limpiar cache antiguo
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                const item = JSON.parse(localStorage.getItem(key));
                if (Date.now() > item.expiration) {
                    localStorage.removeItem(key);
                }
            }
        });
    }
}

// ===== UTILIDADES GENERALES =====
class UtilidadesGenerales {
    static formatearFecha(fecha) {
        return new Date(fecha).toLocaleString('es-ES');
    }

    static formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(precio);
    }

    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    static throttle(func, delay) {
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            }
        };
    }

    static generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static validarTelefono(telefono) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(telefono);
    }

    static sanitizarHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static copiarTexto(texto) {
        navigator.clipboard.writeText(texto).then(() => {
            window.sistemaNotificaciones?.mostrarNotificacion(
                'Copiado', 
                'Texto copiado al portapapeles', 
                'success', 
                2000
            );
        });
    }

    static descargarJSON(datos, nombreArchivo) {
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
    }

    static subirArchivo(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => callback(e.target.result, file);
                reader.readAsText(file);
            }
        };
        input.click();
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de utilidades...');
    
    // Inicializar sistemas
    window.sistemaNotificaciones = new SistemaNotificaciones();
    window.modoOffline = new ModoOffline();
    window.optimizacion = new OptimizacionRendimiento();
    window.utils = UtilidadesGenerales;
    
    // Medir rendimiento inicial
    setTimeout(() => {
        window.optimizacion.medirRendimiento();
    }, 1000);
    
    console.log('✅ Sistema de utilidades inicializado correctamente');
});

console.log('✅ Sistema de utilidades consolidado cargado correctamente');