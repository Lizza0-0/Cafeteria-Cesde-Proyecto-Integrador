class SistemaNotificaciones {
    constructor() {
        this.notificaciones = JSON.parse(localStorage.getItem('notificaciones')) || [];
        this.configuracion = JSON.parse(localStorage.getItem('configNotificaciones')) || this.configuracionDefault();
        this.plantillas = this.obtenerPlantillas();
        this.filtroActivo = 'todas';
        this.inicializar();
    }

    configuracionDefault() {
        return {
            notifPush: true,
            sonidoAlerta: true,
            vibracion: false,
            alertStock: true,
            alertVencimiento: true,
            alertNuevos: true,
            alertVentas: true,
            alertMetas: true,
            alertPromociones: true,
            alertTurnos: true,
            alertEmpleados: true,
            alertEvaluaciones: false
        };
    }

    inicializar() {
        this.cargarConfiguracion();
        this.cargarNotificaciones();
        this.configurarEventos();
        this.verificarPermisos();
        this.iniciarMonitoreo();
        this.generarNotificacionesAutomaticas();
    }

    verificarPermisos() {
        if ("Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        this.mostrarNotificacion("¡Notificaciones activadas!", "Sistema configurado correctamente", "info");
                    }
                });
            }
        }
    }

    configurarEventos() {
        // Formulario de nueva notificación
        const form = document.getElementById('form-nueva-notificacion');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.crearNotificacion();
            });
        }

        // Cargar configuración en los switches
        Object.keys(this.configuracion).forEach(key => {
            const elemento = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (elemento) {
                elemento.checked = this.configuracion[key];
                elemento.addEventListener('change', () => {
                    this.configuracion[key] = elemento.checked;
                    this.guardarConfiguracion();
                });
            }
        });
    }

    crearNotificacion() {
        const titulo = document.getElementById('notif-titulo').value;
        const tipo = document.getElementById('notif-tipo').value;
        const mensaje = document.getElementById('notif-mensaje').value;
        const destinatarios = document.getElementById('notif-destinatarios').value;
        const programar = document.getElementById('notif-programar').value;

        if (!titulo || !tipo || !mensaje || !destinatarios) {
            this.mostrarAlerta('Por favor complete todos los campos obligatorios', 'warning');
            return;
        }

        const notificacion = {
            id: Date.now(),
            titulo,
            tipo,
            mensaje,
            destinatarios,
            fechaCreacion: new Date().toISOString(),
            fechaEnvio: programar ? new Date(programar).toISOString() : new Date().toISOString(),
            leida: false,
            programada: !!programar,
            estado: programar ? 'programada' : 'enviada'
        };

        if (programar && new Date(programar) > new Date()) {
            // Programar notificación
            this.programarNotificacion(notificacion);
        } else {
            // Enviar inmediatamente
            this.enviarNotificacion(notificacion);
        }

        this.limpiarFormulario();
        this.mostrarAlerta('Notificación creada exitosamente', 'success');
    }

    enviarNotificacion(notificacion) {
        this.notificaciones.unshift(notificacion);
        this.guardarNotificaciones();

        // Mostrar notificación del navegador si está habilitada
        if (this.configuracion.notifPush && Notification.permission === "granted") {
            new Notification(notificacion.titulo, {
                body: notificacion.mensaje,
                icon: 'Images/cafe cesde logo.jpg',
                badge: 'Images/cafe cesde logo.jpg'
            });
        }

        // Reproducir sonido si está habilitado
        if (this.configuracion.sonidoAlerta) {
            this.reproducirSonido();
        }

        // Vibrar si está habilitado
        if (this.configuracion.vibracion && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        this.cargarNotificaciones();
        this.actualizarContadorNoLeidas();
    }

    programarNotificacion(notificacion) {
        const tiempoEspera = new Date(notificacion.fechaEnvio).getTime() - new Date().getTime();
        
        setTimeout(() => {
            notificacion.estado = 'enviada';
            notificacion.programada = false;
            this.enviarNotificacion(notificacion);
        }, tiempoEspera);

        this.notificaciones.unshift(notificacion);
        this.guardarNotificaciones();
    }

    cargarNotificaciones() {
        const container = document.getElementById('lista-notificaciones');
        if (!container) return;

        let notificacionesFiltradas = this.filtrarNotificaciones();

        if (notificacionesFiltradas.length === 0) {
            container.innerHTML = `
                <div class="sin-notificaciones">
                    <h3>📭 No hay notificaciones</h3>
                    <p>No se encontraron notificaciones con los filtros seleccionados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notificacionesFiltradas.map(notif => `
            <div class="notification-item ${notif.tipo} ${!notif.leida ? 'no-leida' : ''}" 
                 data-id="${notif.id}">
                <div class="notification-header">
                    <div class="notification-titulo">${notif.titulo}</div>
                    <div class="notification-fecha">
                        📅 ${this.formatearFecha(notif.fechaEnvio)}
                    </div>
                </div>
                
                <div style="margin: 10px 0;">
                    <span class="notification-tipo tipo-${notif.tipo}">
                        ${this.obtenerIconoTipo(notif.tipo)} ${notif.tipo.toUpperCase()}
                    </span>
                    ${notif.estado === 'programada' ? '<span class="notification-tipo" style="background: #6c757d; color: white;">⏱️ PROGRAMADA</span>' : ''}
                </div>

                <div class="notification-mensaje">${notif.mensaje}</div>

                <div style="margin: 10px 0; font-size: 0.9em; color: #666;">
                    👥 Destinatarios: ${this.formatearDestinatarios(notif.destinatarios)}
                </div>

                <div class="notification-acciones">
                    ${!notif.leida ? `<button class="btn btn-sm btn-primary" onclick="sistemaNotificaciones.marcarComoLeida(${notif.id})">✓ Marcar como leída</button>` : ''}
                    <button class="btn btn-sm btn-outline" onclick="sistemaNotificaciones.eliminarNotificacion(${notif.id})">🗑️ Eliminar</button>
                    ${notif.estado === 'programada' ? `<button class="btn btn-sm btn-danger" onclick="sistemaNotificaciones.cancelarProgramada(${notif.id})">❌ Cancelar</button>` : ''}
                </div>
            </div>
        `).join('');

        this.actualizarContadorNoLeidas();
    }

    filtrarNotificaciones() {
        switch (this.filtroActivo) {
            case 'todas':
                return this.notificaciones;
            case 'no-leidas':
                return this.notificaciones.filter(n => !n.leida);
            case 'urgente':
                return this.notificaciones.filter(n => n.tipo === 'urgente');
            case 'promocion':
                return this.notificaciones.filter(n => n.tipo === 'promocion');
            case 'info':
                return this.notificaciones.filter(n => n.tipo === 'info');
            case 'warning':
                return this.notificaciones.filter(n => n.tipo === 'warning');
            default:
                return this.notificaciones;
        }
    }

    filtrarPorTipo(tipo) {
        this.filtroActivo = tipo;
        this.cargarNotificaciones();
    }

    marcarComoLeida(id) {
        const notificacion = this.notificaciones.find(n => n.id === id);
        if (notificacion) {
            notificacion.leida = true;
            this.guardarNotificaciones();
            this.cargarNotificaciones();
        }
    }

    eliminarNotificacion(id) {
        if (confirm('¿Está seguro de que desea eliminar esta notificación?')) {
            this.notificaciones = this.notificaciones.filter(n => n.id !== id);
            this.guardarNotificaciones();
            this.cargarNotificaciones();
            this.mostrarAlerta('Notificación eliminada', 'success');
        }
    }

    cancelarProgramada(id) {
        if (confirm('¿Está seguro de que desea cancelar esta notificación programada?')) {
            this.eliminarNotificacion(id);
        }
    }

    actualizarContadorNoLeidas() {
        const contador = document.getElementById('contador-no-leidas');
        if (contador) {
            const noLeidas = this.notificaciones.filter(n => !n.leida).length;
            contador.textContent = noLeidas;
            contador.style.display = noLeidas > 0 ? 'block' : 'none';
        }
    }

    obtenerPlantillas() {
        return {
            'stock-bajo': {
                titulo: 'Alerta de Stock Bajo',
                tipo: 'warning',
                mensaje: 'El producto {PRODUCTO} tiene pocas unidades disponibles. Stock actual: {CANTIDAD} unidades.',
                destinatarios: 'empleados'
            },
            'nueva-promocion': {
                titulo: '¡Nueva Promoción Disponible!',
                tipo: 'promocion',
                mensaje: 'Tenemos una nueva oferta especial: {DESCRIPCION}. ¡No te la pierdas!',
                destinatarios: 'todos'
            },
            'mantenimiento': {
                titulo: 'Mantenimiento Programado',
                tipo: 'info',
                mensaje: 'El sistema estará en mantenimiento el {FECHA} de {HORA_INICIO} a {HORA_FIN}. Planifique sus actividades en consecuencia.',
                destinatarios: 'todos'
            },
            'felicitaciones': {
                titulo: '¡Felicitaciones por el logro!',
                tipo: 'promocion',
                mensaje: 'Queremos felicitar a {EMPLEADO} por {LOGRO}. ¡Excelente trabajo!',
                destinatarios: 'empleados'
            },
            'recordatorio': {
                titulo: 'Recordatorio Importante',
                tipo: 'info',
                mensaje: 'Recordatorio: {DESCRIPCION} programado para el {FECHA}.',
                destinatarios: 'empleados'
            },
            'emergencia': {
                titulo: '🚨 ALERTA DE EMERGENCIA',
                tipo: 'urgente',
                mensaje: 'ATENCIÓN: {DESCRIPCION}. Tome las medidas necesarias inmediatamente.',
                destinatarios: 'todos'
            }
        };
    }

    aplicarPlantilla(tipoPlantilla) {
        const plantilla = this.plantillas[tipoPlantilla];
        if (plantilla) {
            document.getElementById('notif-titulo').value = plantilla.titulo;
            document.getElementById('notif-tipo').value = plantilla.tipo;
            document.getElementById('notif-mensaje').value = plantilla.mensaje;
            document.getElementById('notif-destinatarios').value = plantilla.destinatarios;
        }
    }

    iniciarMonitoreo() {
        // Monitoreo cada 5 minutos
        setInterval(() => {
            this.verificarAlertas();
        }, 5 * 60 * 1000);

        // Verificación inicial
        setTimeout(() => {
            this.verificarAlertas();
        }, 5000);
    }

    verificarAlertas() {
        if (this.configuracion.alertStock) {
            this.verificarStockBajo();
        }

        if (this.configuracion.alertVencimiento) {
            this.verificarProductosVencidos();
        }

        if (this.configuracion.alertMetas) {
            this.verificarMetasVentas();
        }
    }

    verificarStockBajo() {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productosStockBajo = productos.filter(p => p.stock <= 10);

        productosStockBajo.forEach(producto => {
            const yaNotificado = this.notificaciones.some(n => 
                n.tipo === 'warning' && 
                n.titulo.includes('Stock Bajo') && 
                n.mensaje.includes(producto.nombre) &&
                this.esMismaFecha(new Date(n.fechaCreacion), new Date())
            );

            if (!yaNotificado) {
                const notificacion = {
                    id: Date.now() + Math.random(),
                    titulo: 'Alerta de Stock Bajo',
                    tipo: 'warning',
                    mensaje: `El producto ${producto.nombre} tiene pocas unidades disponibles. Stock actual: ${producto.stock} unidades.`,
                    destinatarios: 'empleados',
                    fechaCreacion: new Date().toISOString(),
                    fechaEnvio: new Date().toISOString(),
                    leida: false,
                    programada: false,
                    estado: 'enviada'
                };

                this.enviarNotificacion(notificacion);
            }
        });
    }

    verificarProductosVencidos() {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const hoy = new Date();
        const proximoVencimiento = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

        const productosVencen = productos.filter(p => {
            if (p.fechaVencimiento) {
                const fechaVenc = new Date(p.fechaVencimiento);
                return fechaVenc <= proximoVencimiento && fechaVenc > hoy;
            }
            return false;
        });

        productosVencen.forEach(producto => {
            const yaNotificado = this.notificaciones.some(n => 
                n.tipo === 'warning' && 
                n.titulo.includes('Próximo Vencimiento') && 
                n.mensaje.includes(producto.nombre) &&
                this.esMismaFecha(new Date(n.fechaCreacion), new Date())
            );

            if (!yaNotificado) {
                const diasRestantes = Math.ceil((new Date(producto.fechaVencimiento) - hoy) / (1000 * 60 * 60 * 24));
                
                const notificacion = {
                    id: Date.now() + Math.random(),
                    titulo: 'Próximo Vencimiento',
                    tipo: 'warning',
                    mensaje: `El producto ${producto.nombre} vence en ${diasRestantes} días (${this.formatearFecha(producto.fechaVencimiento)}).`,
                    destinatarios: 'empleados',
                    fechaCreacion: new Date().toISOString(),
                    fechaEnvio: new Date().toISOString(),
                    leida: false,
                    programada: false,
                    estado: 'enviada'
                };

                this.enviarNotificacion(notificacion);
            }
        });
    }

    verificarMetasVentas() {
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        const ventasMes = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= inicioMes && fechaVenta <= hoy;
        });

        const totalVentasMes = ventasMes.reduce((sum, venta) => sum + venta.total, 0);
        const metaMensual = 1000000; // Meta de ejemplo: $1,000,000

        if (totalVentasMes >= metaMensual) {
            const yaNotificado = this.notificaciones.some(n => 
                n.tipo === 'promocion' && 
                n.titulo.includes('Meta Alcanzada') &&
                this.esMismaFecha(new Date(n.fechaCreacion), new Date())
            );

            if (!yaNotificado) {
                const notificacion = {
                    id: Date.now() + Math.random(),
                    titulo: '🎉 ¡Meta Mensual Alcanzada!',
                    tipo: 'promocion',
                    mensaje: `¡Felicitaciones! Hemos alcanzado la meta de ventas del mes con $${totalVentasMes.toLocaleString()}.`,
                    destinatarios: 'empleados',
                    fechaCreacion: new Date().toISOString(),
                    fechaEnvio: new Date().toISOString(),
                    leida: false,
                    programada: false,
                    estado: 'enviada'
                };

                this.enviarNotificacion(notificacion);
            }
        }
    }

    generarNotificacionesAutomaticas() {
        // Notificación de bienvenida si es la primera vez
        if (this.notificaciones.length === 0) {
            const notificacionBienvenida = {
                id: Date.now(),
                titulo: '¡Bienvenido al Sistema de Notificaciones!',
                tipo: 'info',
                mensaje: 'El sistema de notificaciones está configurado y funcionando correctamente. Recibirá alertas automáticas sobre inventario, ventas y eventos importantes.',
                destinatarios: 'todos',
                fechaCreacion: new Date().toISOString(),
                fechaEnvio: new Date().toISOString(),
                leida: false,
                programada: false,
                estado: 'enviada'
            };

            this.enviarNotificacion(notificacionBienvenida);
        }
    }

    actualizarEstadisticas() {
        const container = document.getElementById('estadisticas-notif');
        if (!container) return;

        const stats = this.calcularEstadisticas();

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-numero">${stats.total}</div>
                <div class="stat-label">Total Notificaciones</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.noLeidas}</div>
                <div class="stat-label">No Leídas</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.urgentes}</div>
                <div class="stat-label">Urgentes</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.promociones}</div>
                <div class="stat-label">Promociones</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.hoy}</div>
                <div class="stat-label">Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.semana}</div>
                <div class="stat-label">Esta Semana</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.programadas}</div>
                <div class="stat-label">Programadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${stats.porcentajeLectura.toFixed(1)}%</div>
                <div class="stat-label">Tasa de Lectura</div>
            </div>
        `;
    }

    calcularEstadisticas() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
        const inicioHoy = new Date();
        inicioHoy.setHours(0, 0, 0, 0);

        return {
            total: this.notificaciones.length,
            noLeidas: this.notificaciones.filter(n => !n.leida).length,
            urgentes: this.notificaciones.filter(n => n.tipo === 'urgente').length,
            promociones: this.notificaciones.filter(n => n.tipo === 'promocion').length,
            hoy: this.notificaciones.filter(n => new Date(n.fechaCreacion) >= inicioHoy).length,
            semana: this.notificaciones.filter(n => new Date(n.fechaCreacion) >= inicioSemana).length,
            programadas: this.notificaciones.filter(n => n.estado === 'programada').length,
            porcentajeLectura: this.notificaciones.length > 0 ? 
                (this.notificaciones.filter(n => n.leida).length / this.notificaciones.length) * 100 : 0
        };
    }

    cargarConfiguracion() {
        Object.keys(this.configuracion).forEach(key => {
            const elemento = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (elemento) {
                elemento.checked = this.configuracion[key];
            }
        });
    }

    guardarConfiguracion() {
        localStorage.setItem('configNotificaciones', JSON.stringify(this.configuracion));
        this.mostrarAlerta('Configuración guardada exitosamente', 'success');
    }

    guardarNotificaciones() {
        localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
    }

    limpiarFormulario() {
        document.getElementById('form-nueva-notificacion').reset();
    }

    // Utilidades
    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearDestinatarios(destinatarios) {
        const mapeo = {
            'todos': 'Todos los usuarios',
            'empleados': 'Solo empleados',
            'clientes': 'Solo clientes',
            'administradores': 'Solo administradores'
        };
        return mapeo[destinatarios] || destinatarios;
    }

    obtenerIconoTipo(tipo) {
        const iconos = {
            'info': 'ℹ️',
            'urgente': '🚨',
            'promocion': '🎉',
            'warning': '⚠️'
        };
        return iconos[tipo] || 'ℹ️';
    }

    esMismaFecha(fecha1, fecha2) {
        return fecha1.toDateString() === fecha2.toDateString();
    }

    reproducirSonido() {
        // Crear un sonido simple usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    mostrarAlerta(mensaje, tipo = 'info') {
        // Crear elemento de alerta
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo}`;
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // Colores según el tipo
        const colores = {
            'success': '#28a745',
            'warning': '#ffc107',
            'danger': '#dc3545',
            'info': '#17a2b8'
        };

        alerta.style.backgroundColor = colores[tipo] || colores['info'];
        alerta.textContent = mensaje;

        document.body.appendChild(alerta);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 3000);
    }

    mostrarNotificacion(titulo, mensaje, tipo = 'info') {
        const notificacion = {
            id: Date.now(),
            titulo,
            tipo,
            mensaje,
            destinatarios: 'todos',
            fechaCreacion: new Date().toISOString(),
            fechaEnvio: new Date().toISOString(),
            leida: false,
            programada: false,
            estado: 'enviada'
        };

        this.enviarNotificacion(notificacion);
    }

    // Métodos para integración con otros módulos
    notificarVenta(venta) {
        if (this.configuracion.alertVentas) {
            this.mostrarNotificacion(
                '💰 Nueva Venta Realizada',
                `Venta por $${venta.total.toLocaleString()} realizada exitosamente. Cliente: ${venta.cliente}`,
                'promocion'
            );
        }
    }

    notificarNuevoProducto(producto) {
        if (this.configuracion.alertNuevos) {
            this.mostrarNotificacion(
                '🆕 Nuevo Producto Agregado',
                `Se ha agregado el producto "${producto.nombre}" al inventario con ${producto.stock} unidades.`,
                'info'
            );
        }
    }

    notificarNuevoEmpleado(empleado) {
        if (this.configuracion.alertEmpleados) {
            this.mostrarNotificacion(
                '👋 Nuevo Empleado',
                `Bienvenido ${empleado.nombre} ${empleado.apellido} al equipo de trabajo.`,
                'info'
            );
        }
    }
}

// Inicializar el sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaNotificaciones = new SistemaNotificaciones();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaNotificaciones;
}

// ================================================
// FUNCIONES ADICIONALES PARA LA INTERFAZ
// ================================================

// Función global para mostrar secciones
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-card').forEach(section => {
        if (section.id.startsWith('seccion-')) {
            section.style.display = 'none';
        }
    });

    // Mostrar la sección seleccionada
    const seccion = document.getElementById(`seccion-${seccionId}`);
    if (seccion) {
        seccion.style.display = 'block';
    }

    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');

    // Cargar contenido específico de la sección
    if (window.sistemaNotificaciones) {
        switch (seccionId) {
            case 'bandeja':
                sistemaNotificaciones.cargarNotificaciones();
                break;
            case 'estadisticas':
                sistemaNotificaciones.actualizarEstadisticas();
                break;
        }
    }
}

// Función para filtrar notificaciones
function filtrarNotificaciones(tipo) {
    // Actualizar botones de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filtrar notificaciones
    if (window.sistemaNotificaciones) {
        sistemaNotificaciones.filtrarPorTipo(tipo);
    }
}

// Función para aplicar plantillas
function aplicarPlantilla(tipoPlantilla) {
    mostrarSeccion('crear');
    if (window.sistemaNotificaciones) {
        sistemaNotificaciones.aplicarPlantilla(tipoPlantilla);
    }
}

// Función para limpiar formulario
function limpiarFormulario() {
    const form = document.getElementById('form-nueva-notificacion');
    if (form) {
        form.reset();
    }
}