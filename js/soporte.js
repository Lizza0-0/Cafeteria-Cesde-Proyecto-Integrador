/**
 * SISTEMA DE SOPORTE TÉCNICO - CAFETERÍA CESDE
 * ============================================
 * 
 * Este módulo maneja el sistema completo de soporte técnico para empleados,
 * incluyendo creación de tickets, seguimiento, gestión de prioridades y
 * comunicación con el equipo de soporte.
 * 
 * Características principales:
 * - Gestión completa de tickets de soporte
 * - Sistema de prioridades automáticas
 * - Notificaciones por email y WhatsApp
 * - Seguimiento en tiempo real
 * - Escalamiento automático por tiempo
 * - Base de conocimientos integrada
 * - Estadísticas y reportes
 * 
 * @author Equipo Cesde 2025-1
 * @version 2.0.0
 * @since 2024
 */

class SistemaSoporte {
    constructor() {
        // Configuración del sistema
        this.version = '2.0.0';
        this.inicializado = false;
        
        // Claves de almacenamiento
        this.claves = {
            tickets: 'cesde_soporte_tickets',
            empleados: 'cesde_soporte_empleados', 
            configuracion: 'cesde_soporte_config',
            estadisticas: 'cesde_soporte_stats',
            conocimientos: 'cesde_soporte_kb'
        };
        
        // Configuración predeterminada
        this.config = {
            tiempos_respuesta: {
                critica: 15, // minutos
                alta: 60,    // minutos  
                media: 240,  // minutos (4 horas)
                baja: 1440   // minutos (24 horas)
            },
            notificaciones: {
                email_soporte: 'equipocesde25@gmail.com',
                whatsapp_soporte: '3008694578',
                escalamiento_automatico: true
            },
            horarios_atencion: {
                inicio: '07:00',
                fin: '18:00',
                dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
            }
        };
        
        // Estados y contadores
        this.contadorTickets = 0;
        this.ticketsActivos = new Map();
        this.empleadosRegistrados = new Map();
        
        // Vincular métodos al contexto
        this.init = this.init.bind(this);
        this.crearTicket = this.crearTicket.bind(this);
        this.validarFormulario = this.validarFormulario.bind(this);
        this.calcularPrioridad = this.calcularPrioridad.bind(this);
        
        console.log('✅ Sistema de Soporte inicializado');
    }
    
    /**
     * Inicializa el sistema de soporte técnico
     */
    async init() {
        try {
            console.log('🚀 Iniciando Sistema de Soporte Técnico...');
            
            // Cargar datos existentes
            await this.cargarDatos();
            
            // Configurar event listeners
            this.configurarEventListeners();
            
            // Inicializar componentes de UI
            this.inicializarUI();
            
            // Cargar base de conocimientos
            this.cargarBaseConocimientos();
            
            // Configurar actualizaciones automáticas
            this.configurarActualizacionesAutomaticas();
            
            // Actualizar estadísticas
            this.actualizarEstadisticas();
            
            this.inicializado = true;
            console.log('✅ Sistema de Soporte listo');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de soporte:', error);
            this.mostrarError('Error al inicializar el sistema. Por favor, recargue la página.');
        }
    }
    
    /**
     * Cargar datos desde localStorage
     */
    async cargarDatos() {
        try {
            // Cargar tickets existentes
            const ticketsGuardados = localStorage.getItem(this.claves.tickets);
            if (ticketsGuardados) {
                const tickets = JSON.parse(ticketsGuardados);
                tickets.forEach(ticket => {
                    this.ticketsActivos.set(ticket.id, ticket);
                });
                this.contadorTickets = Math.max(...tickets.map(t => parseInt(t.numero_ticket))) || 0;
            }
            
            // Cargar empleados registrados
            const empleadosGuardados = localStorage.getItem(this.claves.empleados);
            if (empleadosGuardados) {
                const empleados = JSON.parse(empleadosGuardados);
                empleados.forEach(emp => {
                    this.empleadosRegistrados.set(emp.id, emp);
                });
            }
            
            // Cargar configuración personalizada
            const configGuardada = localStorage.getItem(this.claves.configuracion);
            if (configGuardada) {
                this.config = { ...this.config, ...JSON.parse(configGuardada) };
            }
            
            console.log(`📊 Datos cargados: ${this.ticketsActivos.size} tickets, ${this.empleadosRegistrados.size} empleados`);
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
    }
    
    /**
     * Configurar todos los event listeners del formulario
     */
    configurarEventListeners() {
        // Formulario principal
        const form = document.getElementById('soporte-form');
        if (form) {
            form.addEventListener('submit', this.manejarEnvioFormulario.bind(this));
            form.addEventListener('reset', this.manejarResetFormulario.bind(this));
        }
        
        // Validación en tiempo real
        this.configurarValidacionTiempoReal();
        
        // Autocompletado inteligente
        this.configurarAutocompletado();
        
        // Prioridad automática
        this.configurarPrioridadAutomatica();
        
        // Adjuntos de archivos
        this.configurarAdjuntos();
        
        console.log('🔗 Event listeners configurados');
    }
    
    /**
     * Configurar validación en tiempo real
     */
    configurarValidacionTiempoReal() {
        const campos = [
            'id_empleado', 'nombre_empleado', 'email_empleado',
            'tipo_problema', 'nivel_prioridad', 'descripcion_problema'
        ];
        
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('input', () => this.validarCampo(campo));
                campo.addEventListener('blur', () => this.validarCampo(campo));
            }
        });
    }
    
    /**
     * Configurar autocompletado inteligente
     */
    configurarAutocompletado() {
        // Autocompletar ID de empleado
        const idEmpleadoField = document.getElementById('id_empleado');
        if (idEmpleadoField) {
            idEmpleadoField.addEventListener('input', (e) => {
                this.autocompletarEmpleado(e.target.value);
            });
        }
        
        // Sugerencias de problemas comunes
        const descripcionField = document.getElementById('descripcion_problema');
        if (descripcionField) {
            descripcionField.addEventListener('focus', () => {
                this.mostrarSugerenciasComunes();
            });
        }
    }
    
    /**
     * Configurar cálculo automático de prioridad
     */
    configurarPrioridadAutomatica() {
        const campos = ['tipo_problema', 'impacto_trabajo', 'solucion_temporal'];
        
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('change', () => {
                    this.calcularPrioridadAutomatica();
                });
            }
        });
    }
    
    /**
     * Configurar manejo de archivos adjuntos
     */
    configurarAdjuntos() {
        const archivoField = document.getElementById('archivo_adjunto');
        if (archivoField) {
            archivoField.addEventListener('change', (e) => {
                this.validarArchivos(e.target.files);
            });
        }
    }
    
    /**
     * Inicializar componentes de UI
     */
    inicializarUI() {
        // Establecer fecha/hora actual por defecto
        const fechaProblema = document.getElementById('fecha_problema');
        if (fechaProblema) {
            const ahora = new Date();
            fechaProblema.value = ahora.toISOString().slice(0, 16);
        }
        
        // Generar ID de empleado sugerido
        this.generarIdEmpleadoSugerido();
        
        // Configurar tooltips informativos
        this.configurarTooltips();
        
        // Mostrar información de horarios de atención
        this.mostrarHorariosAtencion();
        
        console.log('🎨 UI inicializada');
    }
    
    /**
     * Cargar base de conocimientos
     */
    cargarBaseConocimientos() {
        const baseConocimientos = {
            hardware: [
                "Reiniciar el equipo y verificar conexiones",
                "Verificar estado de cables y conexiones",
                "Comprobar indicadores LED del equipo"
            ],
            software: [
                "Cerrar y volver a abrir la aplicación",
                "Verificar actualizaciones disponibles", 
                "Reiniciar en modo seguro si es necesario"
            ],
            red: [
                "Verificar conexión WiFi o ethernet",
                "Reiniciar router/modem",
                "Probar conectividad con otros dispositivos"
            ],
            sistema_pos: [
                "Verificar conexión a internet",
                "Comprobar estado de la impresora de tickets",
                "Reiniciar terminal de pagos"
            ],
            impresora: [
                "Verificar nivel de papel y tinta",
                "Comprobar que no hay atascos",
                "Reinstalar controladores si es necesario"
            ]
        };
        
        localStorage.setItem(this.claves.conocimientos, JSON.stringify(baseConocimientos));
        this.baseConocimientos = baseConocimientos;
    }
    
    /**
     * Configurar actualizaciones automáticas
     */
    configurarActualizacionesAutomaticas() {
        // Revisar tickets pendientes cada 5 minutos
        setInterval(() => {
            this.verificarTicketsPendientes();
        }, 5 * 60 * 1000);
        
        // Actualizar estadísticas cada hora
        setInterval(() => {
            this.actualizarEstadisticas();
        }, 60 * 60 * 1000);
    }
    
    /**
     * Manejar envío del formulario
     */
    async manejarEnvioFormulario(e) {
        e.preventDefault();
        
        try {
            // Mostrar indicador de carga
            this.mostrarCargando(true);
            
            // Validar formulario completo
            const validacion = this.validarFormulario();
            if (!validacion.valido) {
                this.mostrarError(`Errores en el formulario: ${validacion.errores.join(', ')}`);
                return;
            }
            
            // Crear ticket
            const datosTicket = this.recopilarDatosFormulario();
            const ticket = await this.crearTicket(datosTicket);
            
            // Mostrar confirmación
            this.mostrarConfirmacion(ticket);
            
            // Limpiar formulario
            this.limpiarFormulario();
            
            // Enviar notificaciones
            await this.enviarNotificaciones(ticket);
            
        } catch (error) {
            console.error('❌ Error creando ticket:', error);
            this.mostrarError('Error al crear el ticket. Por favor, intente nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }
    
    /**
     * Validar formulario completo
     */
    validarFormulario() {
        const errores = [];
        
        // Campos obligatorios
        const camposRequeridos = [
            { id: 'id_empleado', nombre: 'ID del Empleado' },
            { id: 'nombre_empleado', nombre: 'Nombre del Empleado' },
            { id: 'cargo_empleado', nombre: 'Cargo' },
            { id: 'tipo_problema', nombre: 'Tipo de Problema' },
            { id: 'nivel_prioridad', nombre: 'Nivel de Prioridad' },
            { id: 'descripcion_problema', nombre: 'Descripción del Problema' },
            { id: 'email_empleado', nombre: 'Email del Empleado' }
        ];
        
        camposRequeridos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (!elemento || !elemento.value.trim()) {
                errores.push(campo.nombre);
            }
        });
        
        // Validación de email
        const email = document.getElementById('email_empleado');
        if (email && email.value && !this.validarEmail(email.value)) {
            errores.push('Email válido');
        }
        
        // Validación de descripción (mínimo 20 caracteres)
        const descripcion = document.getElementById('descripcion_problema');
        if (descripcion && descripcion.value && descripcion.value.length < 20) {
            errores.push('Descripción más detallada (mínimo 20 caracteres)');
        }
        
        return {
            valido: errores.length === 0,
            errores
        };
    }
    
    /**
     * Recopilar datos del formulario
     */
    recopilarDatosFormulario() {
        const formData = new FormData(document.getElementById('soporte-form'));
        const datos = {};
        
        // Convertir FormData a objeto
        for (let [key, value] of formData.entries()) {
            if (datos[key]) {
                // Si ya existe, convertir a array
                if (Array.isArray(datos[key])) {
                    datos[key].push(value);
                } else {
                    datos[key] = [datos[key], value];
                }
            } else {
                datos[key] = value;
            }
        }
        
        // Agregar timestamp
        datos.timestamp = new Date().toISOString();
        datos.ip_cliente = this.obtenerIP();
        
        return datos;
    }
    
    /**
     * Crear nuevo ticket de soporte
     */
    async crearTicket(datos) {
        try {
            const ahora = new Date();
            this.contadorTickets++;
            
            const ticket = {
                id: `TKT-${Date.now()}`,
                numero_ticket: this.contadorTickets.toString().padStart(4, '0'),
                
                // Información del empleado
                empleado: {
                    id: datos.id_empleado,
                    nombre: datos.nombre_empleado,
                    cargo: datos.cargo_empleado,
                    turno: datos.turno_empleado,
                    email: datos.email_empleado,
                    telefono: datos.telefono_empleado
                },
                
                // Información del problema
                problema: {
                    tipo: datos.tipo_problema,
                    prioridad: datos.nivel_prioridad,
                    fecha_ocurrencia: datos.fecha_problema,
                    descripcion: datos.descripcion_problema,
                    pasos_reproducir: datos.pasos_reproducir,
                    impacto_trabajo: datos.impacto_trabajo,
                    solucion_temporal: datos.solucion_temporal
                },
                
                // Información de contacto
                contacto: {
                    metodo_preferido: datos.metodo_contacto,
                    mejor_horario: datos.mejor_horario
                },
                
                // Configuraciones especiales
                configuracion: {
                    urgente: datos.urgente === '1',
                    notificar_supervisor: datos.notificar_supervisor === '1',
                    seguimiento: datos.seguimiento === '1'
                },
                
                // Comentarios adicionales
                comentarios: datos.comentarios_adicionales,
                
                // Metadatos del ticket
                metadata: {
                    estado: 'abierto',
                    fecha_creacion: ahora.toISOString(),
                    fecha_actualizacion: ahora.toISOString(),
                    asignado_a: null,
                    tiempo_estimado_resolucion: this.calcularTiempoResolucion(datos.nivel_prioridad),
                    intentos_contacto: 0,
                    escalado: false
                },
                
                // Historial de actualizaciones
                historial: [{
                    fecha: ahora.toISOString(),
                    accion: 'creado',
                    usuario: datos.nombre_empleado,
                    descripcion: 'Ticket creado por el empleado'
                }]
            };
            
            // Calcular prioridad final
            ticket.problema.prioridad_calculada = this.calcularPrioridad(ticket);
            
            // Asignar automáticamente según tipo de problema
            ticket.metadata.asignado_a = this.asignarTecnicoAutomatico(ticket.problema.tipo);
            
            // Guardar ticket
            this.ticketsActivos.set(ticket.id, ticket);
            this.guardarTickets();
            
            // Registrar empleado si es nuevo
            this.registrarEmpleado(ticket.empleado);
            
            // Actualizar estadísticas
            this.actualizarEstadisticasTicket(ticket);
            
            console.log(`🎫 Ticket ${ticket.numero_ticket} creado exitosamente`);
            
            return ticket;
            
        } catch (error) {
            console.error('❌ Error creando ticket:', error);
            throw error;
        }
    }
    
    /**
     * Calcular prioridad automática del ticket
     */
    calcularPrioridad(ticket) {
        let puntosPrioridad = 0;
        
        // Puntos por tipo de problema
        const puntosTipo = {
            sistema_pos: 5,
            hardware: 4,
            software: 3,
            red: 3,
            impresora: 2,
            otro: 1
        };
        
        // Puntos por impacto en el trabajo
        const puntosImpacto = {
            total: 5,
            parcial: 3,
            menor: 2,
            ninguno: 0
        };
        
        // Puntos por solución temporal
        const puntosSolucion = {
            no: 3,
            parcial: 2,
            si: 0
        };
        
        puntosPrioridad += puntosTipo[ticket.problema.tipo] || 0;
        puntosPrioridad += puntosImpacto[ticket.problema.impacto_trabajo] || 0;
        puntosPrioridad += puntosSolucion[ticket.problema.solucion_temporal] || 0;
        
        // Urgente marcado por usuario
        if (ticket.configuracion.urgente) {
            puntosPrioridad += 5;
        }
        
        // Determinar prioridad final
        if (puntosPrioridad >= 10) return 'critica';
        if (puntosPrioridad >= 7) return 'alta';
        if (puntosPrioridad >= 4) return 'media';
        return 'baja';
    }
    
    /**
     * Calcular tiempo estimado de resolución
     */
    calcularTiempoResolucion(prioridad) {
        const tiempos = {
            critica: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
            alta: new Date(Date.now() + 60 * 60 * 1000),    // 1 hora
            media: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
            baja: new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24 horas
        };
        
        return tiempos[prioridad] || tiempos.baja;
    }
    
    /**
     * Asignar técnico automáticamente según el tipo de problema
     */
    asignarTecnicoAutomatico(tipoProblema) {
        const asignaciones = {
            hardware: 'Carlos Mendez (Hardware)',
            software: 'Ana García (Software)',
            red: 'Luis Rodriguez (Redes)',
            sistema_pos: 'María López (Sistemas)',
            impresora: 'Jorge Ruiz (Hardware)',
            otro: 'Equipo General'
        };
        
        return asignaciones[tipoProblema] || 'Equipo General';
    }
    
    /**
     * Validar campo individual
     */
    validarCampo(campo) {
        const valor = campo.value.trim();
        const esValido = this.esValidoCampo(campo.id, valor);
        
        // Actualizar UI de validación
        this.actualizarUIValidacion(campo, esValido);
        
        return esValido;
    }
    
    /**
     * Verificar si un campo es válido
     */
    esValidoCampo(campoId, valor) {
        switch (campoId) {
            case 'id_empleado':
                return /^[A-Z]{3}\d{3}$/.test(valor); // EMP001
                
            case 'nombre_empleado':
                return valor.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor);
                
            case 'email_empleado':
                return this.validarEmail(valor);
                
            case 'telefono_empleado':
                return /^\d{10}$/.test(valor.replace(/\s/g, ''));
                
            case 'descripcion_problema':
                return valor.length >= 20;
                
            default:
                return valor.length > 0;
        }
    }
    
    /**
     * Validar formato de email
     */
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    /**
     * Autocompletar información del empleado
     */
    autocompletarEmpleado(idEmpleado) {
        const empleado = this.empleadosRegistrados.get(idEmpleado);
        
        if (empleado) {
            // Autocompletar campos conocidos
            this.llenarCampoSiVacio('nombre_empleado', empleado.nombre);
            this.llenarCampoSiVacio('email_empleado', empleado.email);
            this.llenarCampoSiVacio('telefono_empleado', empleado.telefono);
            this.llenarCampoSiVacio('cargo_empleado', empleado.cargo);
            
            // Mostrar información de empleado conocido
            this.mostrarInfoEmpleadoConocido(empleado);
        }
    }
    
    /**
     * Llenar campo si está vacío
     */
    llenarCampoSiVacio(campoId, valor) {
        const campo = document.getElementById(campoId);
        if (campo && !campo.value && valor) {
            campo.value = valor;
        }
    }
    
    /**
     * Mostrar sugerencias de problemas comunes
     */
    mostrarSugerenciasComunes() {
        const sugerencias = [
            "La computadora no enciende",
            "El sistema de POS no responde",
            "No hay conexión a internet",
            "La impresora no imprime tickets",
            "El programa se cierra inesperadamente",
            "Pantalla en negro o con rayas",
            "El mouse/teclado no funciona",
            "Mensajes de error al iniciar programa"
        ];
        
        this.mostrarSugerenciasEmergentes(sugerencias);
    }
    
    /**
     * Calcular prioridad automática basada en selecciones
     */
    calcularPrioridadAutomatica() {
        const tipoProblema = document.getElementById('tipo_problema')?.value;
        const impactoTrabajo = document.getElementById('impacto_trabajo')?.value;
        const solucionTemporal = document.getElementById('solucion_temporal')?.value;
        
        if (!tipoProblema || !impactoTrabajo) return;
        
        const prioridadCalculada = this.calcularPrioridad({
            problema: {
                tipo: tipoProblema,
                impacto_trabajo: impactoTrabajo,
                solucion_temporal: solucionTemporal
            },
            configuracion: {
                urgente: document.querySelector('input[name="urgente"]')?.checked
            }
        });
        
        // Actualizar campo de prioridad si no ha sido modificado manualmente
        const campoPrioridad = document.getElementById('nivel_prioridad');
        if (campoPrioridad && !campoPrioridad.dataset.modificadoManualmente) {
            campoPrioridad.value = prioridadCalculada;
            this.mostrarExplicacionPrioridad(prioridadCalculada);
        }
    }
    
    /**
     * Validar archivos adjuntos
     */
    validarArchivos(archivos) {
        const formatosPermitidos = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.txt'];
        const tamañoMaximo = 5 * 1024 * 1024; // 5MB
        const errores = [];
        
        Array.from(archivos).forEach((archivo, index) => {
            // Validar formato
            const extension = '.' + archivo.name.split('.').pop().toLowerCase();
            if (!formatosPermitidos.includes(extension)) {
                errores.push(`Archivo ${index + 1}: Formato no permitido (${extension})`);
            }
            
            // Validar tamaño
            if (archivo.size > tamañoMaximo) {
                errores.push(`Archivo ${index + 1}: Demasiado grande (máximo 5MB)`);
            }
        });
        
        if (errores.length > 0) {
            this.mostrarError(`Errores en archivos: ${errores.join(', ')}`);
            document.getElementById('archivo_adjunto').value = '';
        } else {
            this.mostrarExito(`${archivos.length} archivo(s) válido(s) seleccionado(s)`);
        }
    }
    
    /**
     * Generar ID de empleado sugerido
     */
    generarIdEmpleadoSugerido() {
        const proximoNumero = this.empleadosRegistrados.size + 1;
        const idSugerido = `EMP${proximoNumero.toString().padStart(3, '0')}`;
        
        const campoId = document.getElementById('id_empleado');
        if (campoId) {
            campoId.placeholder = `Ej: ${idSugerido}`;
        }
    }
    
    /**
     * Configurar tooltips informativos
     */
    configurarTooltips() {
        const tooltips = {
            'nivel_prioridad': 'La prioridad se calcula automáticamente según el tipo de problema e impacto',
            'descripcion_problema': 'Sea lo más específico posible. Incluya mensajes de error exactos',
            'pasos_reproducir': 'Esto ayuda al técnico a reproducir y solucionar el problema',
            'archivo_adjunto': 'Capturas de pantalla de errores son muy útiles'
        };
        
        Object.entries(tooltips).forEach(([id, texto]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.title = texto;
                elemento.setAttribute('data-tooltip', texto);
            }
        });
    }
    
    /**
     * Mostrar horarios de atención
     */
    mostrarHorariosAtencion() {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        const diaActual = ahora.getDay(); // 0 = domingo
        
        const esDiaLaboral = diaActual >= 1 && diaActual <= 6; // lunes a sábado
        const esHorarioAtencion = horaActual >= 7 && horaActual < 18;
        
        let mensaje = '';
        if (esDiaLaboral && esHorarioAtencion) {
            mensaje = '🟢 Estamos en horario de atención. Respuesta inmediata.';
        } else if (esDiaLaboral) {
            mensaje = '🟡 Fuera de horario. Respuesta el siguiente día laboral.';
        } else {
            mensaje = '🔴 Fin de semana. Respuesta el lunes.';
        }
        
        this.mostrarNotificacionSistema(mensaje);
    }
    
    /**
     * Verificar tickets pendientes
     */
    verificarTicketsPendientes() {
        const ahora = new Date();
        
        this.ticketsActivos.forEach(ticket => {
            if (ticket.metadata.estado === 'abierto') {
                const tiempoTranscurrido = ahora - new Date(ticket.metadata.fecha_creacion);
                const tiempoLimite = this.config.tiempos_respuesta[ticket.problema.prioridad] * 60 * 1000;
                
                if (tiempoTranscurrido > tiempoLimite && !ticket.metadata.escalado) {
                    this.escalarTicket(ticket);
                }
            }
        });
    }
    
    /**
     * Escalar ticket por tiempo de respuesta
     */
    escalarTicket(ticket) {
        ticket.metadata.escalado = true;
        ticket.metadata.fecha_escalamiento = new Date().toISOString();
        
        // Aumentar prioridad
        const nuevaPrioridad = this.aumentarPrioridad(ticket.problema.prioridad);
        ticket.problema.prioridad = nuevaPrioridad;
        
        // Agregar al historial
        ticket.historial.push({
            fecha: new Date().toISOString(),
            accion: 'escalado',
            usuario: 'Sistema',
            descripcion: `Ticket escalado automáticamente por tiempo de respuesta`
        });
        
        this.guardarTickets();
        console.log(`⬆️ Ticket ${ticket.numero_ticket} escalado a prioridad ${nuevaPrioridad}`);
    }
    
    /**
     * Aumentar nivel de prioridad
     */
    aumentarPrioridad(prioridadActual) {
        const niveles = ['baja', 'media', 'alta', 'critica'];
        const indiceActual = niveles.indexOf(prioridadActual);
        return niveles[Math.min(indiceActual + 1, niveles.length - 1)];
    }
    
    /**
     * Registrar empleado en el sistema
     */
    registrarEmpleado(datosEmpleado) {
        if (!this.empleadosRegistrados.has(datosEmpleado.id)) {
            const empleado = {
                ...datosEmpleado,
                fecha_registro: new Date().toISOString(),
                tickets_creados: 1,
                ultimo_ticket: new Date().toISOString()
            };
            
            this.empleadosRegistrados.set(empleado.id, empleado);
            this.guardarEmpleados();
            
            console.log(`👤 Empleado ${empleado.id} registrado en el sistema`);
        } else {
            // Actualizar estadísticas del empleado
            const empleado = this.empleadosRegistrados.get(datosEmpleado.id);
            empleado.tickets_creados++;
            empleado.ultimo_ticket = new Date().toISOString();
            this.guardarEmpleados();
        }
    }
    
    /**
     * Actualizar estadísticas del sistema
     */
    actualizarEstadisticas() {
        const estadisticas = {
            total_tickets: this.ticketsActivos.size,
            tickets_abiertos: Array.from(this.ticketsActivos.values()).filter(t => t.metadata.estado === 'abierto').length,
            tickets_por_prioridad: this.contarTicketsPorPrioridad(),
            tickets_por_tipo: this.contarTicketsPorTipo(),
            tiempo_promedio_resolucion: this.calcularTiempoPromedioResolucion(),
            empleados_activos: this.empleadosRegistrados.size,
            ultima_actualizacion: new Date().toISOString()
        };
        
        localStorage.setItem(this.claves.estadisticas, JSON.stringify(estadisticas));
        this.actualizarUIEstadisticas(estadisticas);
        
        console.log('📊 Estadísticas actualizadas');
    }
    
    /**
     * Contar tickets por prioridad
     */
    contarTicketsPorPrioridad() {
        const contadores = { critica: 0, alta: 0, media: 0, baja: 0 };
        
        this.ticketsActivos.forEach(ticket => {
            if (ticket.metadata.estado === 'abierto') {
                contadores[ticket.problema.prioridad]++;
            }
        });
        
        return contadores;
    }
    
    /**
     * Contar tickets por tipo
     */
    contarTicketsPorTipo() {
        const contadores = {};
        
        this.ticketsActivos.forEach(ticket => {
            const tipo = ticket.problema.tipo;
            contadores[tipo] = (contadores[tipo] || 0) + 1;
        });
        
        return contadores;
    }
    
    /**
     * Calcular tiempo promedio de resolución
     */
    calcularTiempoPromedioResolucion() {
        const ticketsResueltos = Array.from(this.ticketsActivos.values())
            .filter(t => t.metadata.estado === 'cerrado');
        
        if (ticketsResueltos.length === 0) return 0;
        
        const tiempoTotal = ticketsResueltos.reduce((total, ticket) => {
            const creacion = new Date(ticket.metadata.fecha_creacion);
            const cierre = new Date(ticket.metadata.fecha_cierre);
            return total + (cierre - creacion);
        }, 0);
        
        return Math.round(tiempoTotal / ticketsResueltos.length / (1000 * 60)); // minutos
    }
    
    /**
     * Actualizar estadísticas específicas de un ticket
     */
    actualizarEstadisticasTicket(ticket) {
        // Incrementar contadores específicos
        const tipoProblema = ticket.problema.tipo;
        const prioridad = ticket.problema.prioridad;
        
        // Guardar en histórico para análisis futuro
        const estadisticasDetalladas = JSON.parse(localStorage.getItem('cesde_estadisticas_detalladas') || '[]');
        estadisticasDetalladas.push({
            fecha: new Date().toISOString(),
            tipo: tipoProblema,
            prioridad: prioridad,
            empleado_id: ticket.empleado.id,
            cargo: ticket.empleado.cargo
        });
        
        // Mantener solo los últimos 1000 registros
        if (estadisticasDetalladas.length > 1000) {
            estadisticasDetalladas.splice(0, estadisticasDetalladas.length - 1000);
        }
        
        localStorage.setItem('cesde_estadisticas_detalladas', JSON.stringify(estadisticasDetalladas));
    }
    
    /**
     * Enviar notificaciones
     */
    async enviarNotificaciones(ticket) {
        try {
            // Notificación por email (simulada)
            await this.enviarNotificacionEmail(ticket);
            
            // Notificación por WhatsApp (simulada)
            if (ticket.contacto.metodo_preferido === 'whatsapp') {
                await this.enviarNotificacionWhatsApp(ticket);
            }
            
            // Notificar al supervisor si se solicitó
            if (ticket.configuracion.notificar_supervisor) {
                await this.notificarSupervisor(ticket);
            }
            
            console.log(`📧 Notificaciones enviadas para ticket ${ticket.numero_ticket}`);
            
        } catch (error) {
            console.error('❌ Error enviando notificaciones:', error);
        }
    }
    
    /**
     * Enviar notificación por email (simulada)
     */
    async enviarNotificacionEmail(ticket) {
        // En un entorno real, aquí se integraría con un servicio de email
        const datosEmail = {
            destinatario: ticket.empleado.email,
            asunto: `[Soporte Cesde] Ticket #${ticket.numero_ticket} - ${ticket.problema.tipo}`,
            cuerpo: this.generarCuerpoEmailTicket(ticket),
            prioridad: ticket.problema.prioridad
        };
        
        console.log('📧 Email de confirmación preparado:', datosEmail);
        
        // Simular envío
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    /**
     * Generar cuerpo del email
     */
    generarCuerpoEmailTicket(ticket) {
        return `
Estimado/a ${ticket.empleado.nombre},

Su ticket de soporte ha sido creado exitosamente.

INFORMACIÓN DEL TICKET:
- Número: #${ticket.numero_ticket}
- Tipo de problema: ${ticket.problema.tipo}
- Prioridad: ${ticket.problema.prioridad.toUpperCase()}
- Asignado a: ${ticket.metadata.asignado_a}
- Tiempo estimado de resolución: ${this.formatearFecha(ticket.metadata.tiempo_estimado_resolucion)}

DESCRIPCIÓN:
${ticket.problema.descripcion}

PRÓXIMOS PASOS:
1. Recibirá una llamada/mensaje del técnico asignado
2. Se programará la revisión según la prioridad
3. Le informaremos sobre el progreso de la solución

Para seguimiento del ticket, conserve este número: #${ticket.numero_ticket}

Gracias por contactar al soporte técnico de Cafetería Cesde.

Equipo de Soporte Técnico
equipocesde25@gmail.com
3008694578
        `;
    }
    
    /**
     * Mostrar confirmación de ticket creado
     */
    mostrarConfirmacion(ticket) {
        const mensaje = `
            <div class="confirmacion-ticket">
                <div class="confirmacion-header">
                    <h3>✅ Ticket Creado Exitosamente</h3>
                    <div class="numero-ticket">#${ticket.numero_ticket}</div>
                </div>
                
                <div class="confirmacion-detalles">
                    <div class="detalle">
                        <strong>Tipo:</strong> ${ticket.problema.tipo}
                    </div>
                    <div class="detalle">
                        <strong>Prioridad:</strong> 
                        <span class="prioridad-${ticket.problema.prioridad}">${ticket.problema.prioridad.toUpperCase()}</span>
                    </div>
                    <div class="detalle">
                        <strong>Asignado a:</strong> ${ticket.metadata.asignado_a}
                    </div>
                    <div class="detalle">
                        <strong>Tiempo estimado:</strong> ${this.formatearTiempoEstimado(ticket.metadata.tiempo_estimado_resolucion)}
                    </div>
                </div>
                
                <div class="confirmacion-acciones">
                    <p>📧 Se ha enviado una confirmación a: <strong>${ticket.empleado.email}</strong></p>
                    <p>📱 El técnico se comunicará según su preferencia: <strong>${ticket.contacto.metodo_preferido}</strong></p>
                </div>
                
                <div class="confirmacion-footer">
                    <p><strong>Conserve este número para seguimiento: #${ticket.numero_ticket}</strong></p>
                </div>
            </div>
        `;
        
        this.mostrarModalConfirmacion(mensaje);
    }
    
    /**
     * Manejar reset del formulario
     */
    manejarResetFormulario(e) {
        // Confirmar antes de limpiar
        if (!confirm('¿Está seguro de que desea limpiar todos los campos del formulario?')) {
            e.preventDefault();
            return;
        }
        
        // Limpiar campos adicionales
        this.limpiarFormulario();
        
        // Mostrar confirmación
        this.mostrarInfo('Formulario reiniciado correctamente');
    }
    
    /**
     * Limpiar formulario completamente
     */
    limpiarFormulario() {
        const form = document.getElementById('soporte-form');
        if (form) {
            form.reset();
            
            // Limpiar validaciones visuales
            form.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error', 'success');
            });
            
            // Restablecer valores por defecto
            const fechaProblema = document.getElementById('fecha_problema');
            if (fechaProblema) {
                fechaProblema.value = new Date().toISOString().slice(0, 16);
            }
            
            // Limpiar archivos adjuntos
            const archivoField = document.getElementById('archivo_adjunto');
            if (archivoField) {
                archivoField.value = '';
            }
        }
    }
    
    /**
     * Guardar tickets en localStorage
     */
    guardarTickets() {
        try {
            const ticketsArray = Array.from(this.ticketsActivos.values());
            localStorage.setItem(this.claves.tickets, JSON.stringify(ticketsArray));
        } catch (error) {
            console.error('❌ Error guardando tickets:', error);
        }
    }
    
    /**
     * Guardar empleados en localStorage
     */
    guardarEmpleados() {
        try {
            const empleadosArray = Array.from(this.empleadosRegistrados.values());
            localStorage.setItem(this.claves.empleados, JSON.stringify(empleadosArray));
        } catch (error) {
            console.error('❌ Error guardando empleados:', error);
        }
    }
    
    /**
     * Obtener IP del cliente (simulada)
     */
    obtenerIP() {
        // En un entorno real, esto vendría del servidor
        return '192.168.1.' + Math.floor(Math.random() * 255);
    }
    
    /**
     * Formatear fecha para mostrar
     */
    formatearFecha(fecha) {
        return new Date(fecha).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Formatear tiempo estimado
     */
    formatearTiempoEstimado(fecha) {
        const ahora = new Date();
        const estimado = new Date(fecha);
        const diferencia = estimado - ahora;
        
        if (diferencia <= 0) return 'Inmediato';
        
        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        
        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        } else {
            return `${minutos} minutos`;
        }
    }
    
    // ================================================
    // MÉTODOS DE UI Y NOTIFICACIONES
    // ================================================
    
    /**
     * Mostrar indicador de carga
     */
    mostrarCargando(mostrar) {
        const botonEnviar = document.querySelector('button[type="submit"]');
        if (botonEnviar) {
            if (mostrar) {
                botonEnviar.disabled = true;
                botonEnviar.innerHTML = '<span class="btn-icon">⏳</span> Creando Ticket...';
            } else {
                botonEnviar.disabled = false;
                botonEnviar.innerHTML = '<span class="btn-icon">📨</span> Enviar Ticket de Soporte';
            }
        }
    }
    
    /**
     * Actualizar UI de validación
     */
    actualizarUIValidacion(campo, esValido) {
        const inputGroup = campo.closest('.input-group');
        if (inputGroup) {
            inputGroup.classList.remove('error', 'success');
            inputGroup.classList.add(esValido ? 'success' : 'error');
            
            // Remover mensajes previos
            const mensajeAnterior = inputGroup.querySelector('.mensaje-validacion');
            if (mensajeAnterior) {
                mensajeAnterior.remove();
            }
            
            // Agregar mensaje si hay error
            if (!esValido) {
                const mensaje = this.obtenerMensajeError(campo.id);
                const divMensaje = document.createElement('div');
                divMensaje.className = 'mensaje-validacion error';
                divMensaje.textContent = mensaje;
                inputGroup.appendChild(divMensaje);
            }
        }
    }
    
    /**
     * Obtener mensaje de error personalizado
     */
    obtenerMensajeError(campoId) {
        const mensajes = {
            'id_empleado': 'Formato requerido: EMP001 (3 letras + 3 números)',
            'nombre_empleado': 'Ingrese un nombre válido (mínimo 3 caracteres)',
            'email_empleado': 'Ingrese un email válido (ej: nombre@cesde.edu.co)',
            'telefono_empleado': 'Ingrese un teléfono válido (10 dígitos)',
            'descripcion_problema': 'Describa el problema con más detalle (mínimo 20 caracteres)'
        };
        
        return mensajes[campoId] || 'Campo requerido';
    }
    
    /**
     * Mostrar información de empleado conocido
     */
    mostrarInfoEmpleadoConocido(empleado) {
        const info = `
            <div class="info-empleado-conocido">
                <p><strong>✅ Empleado registrado:</strong> ${empleado.nombre}</p>
                <p><small>Tickets creados: ${empleado.tickets_creados} | Último: ${this.formatearFecha(empleado.ultimo_ticket)}</small></p>
            </div>
        `;
        
        this.mostrarInfoTemporal(info);
    }
    
    /**
     * Mostrar sugerencias emergentes
     */
    mostrarSugerenciasEmergentes(sugerencias) {
        const contenedor = document.createElement('div');
        contenedor.className = 'sugerencias-emergentes';
        contenedor.innerHTML = `
            <div class="sugerencias-header">
                <h4>💡 Problemas comunes:</h4>
                <button class="cerrar-sugerencias">×</button>
            </div>
            <div class="sugerencias-lista">
                ${sugerencias.map(s => `<div class="sugerencia-item" onclick="this.seleccionarSugerencia('${s}')">${s}</div>`).join('')}
            </div>
        `;
        
        document.body.appendChild(contenedor);
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (contenedor.parentNode) {
                contenedor.remove();
            }
        }, 10000);
    }
    
    /**
     * Mostrar explicación de prioridad
     */
    mostrarExplicacionPrioridad(prioridad) {
        const explicaciones = {
            critica: '🔴 CRÍTICA: Operación completamente detenida - Respuesta inmediata',
            alta: '🟠 ALTA: Afecta significativamente la productividad - Respuesta en 1 hora',
            media: '🟡 MEDIA: Molestia menor pero manejable - Respuesta en 4 horas',
            baja: '🟢 BAJA: Mejora o sugerencia - Respuesta en 24 horas'
        };
        
        this.mostrarInfoTemporal(explicaciones[prioridad]);
    }
    
    /**
     * Actualizar UI de estadísticas
     */
    actualizarUIEstadisticas(estadisticas) {
        // Actualizar contadores en la página si existen
        const elementos = {
            'total-tickets': estadisticas.total_tickets,
            'tickets-abiertos': estadisticas.tickets_abiertos,
            'tickets-criticos': estadisticas.tickets_por_prioridad.critica,
            'empleados-activos': estadisticas.empleados_activos
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        });
    }
    
    /**
     * Mostrar modal de confirmación
     */
    mostrarModalConfirmacion(contenido) {
        const modal = document.createElement('div');
        modal.className = 'modal-confirmacion';
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-body">
                    ${contenido}
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.cerrarModal()">Entendido</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después de 15 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 15000);
    }
    
    /**
     * Mostrar notificación del sistema
     */
    mostrarNotificacionSistema(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-sistema';
        notificacion.innerHTML = `
            <div class="notificacion-contenido">
                <span class="notificacion-mensaje">${mensaje}</span>
                <button class="notificacion-cerrar" onclick="this.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        // Auto-cerrar después de 8 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 8000);
    }
    
    /**
     * Mostrar información temporal
     */
    mostrarInfoTemporal(mensaje) {
        const info = document.createElement('div');
        info.className = 'info-temporal';
        info.innerHTML = mensaje;
        
        document.body.appendChild(info);
        
        setTimeout(() => {
            if (info.parentNode) {
                info.remove();
            }
        }, 5000);
    }
    
    /**
     * Mostrar mensaje de error
     */
    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    }
    
    /**
     * Mostrar mensaje de éxito
     */
    mostrarExito(mensaje) {
        this.mostrarNotificacion(mensaje, 'success');
    }
    
    /**
     * Mostrar mensaje de información
     */
    mostrarInfo(mensaje) {
        this.mostrarNotificacion(mensaje, 'info');
    }
    
    /**
     * Mostrar notificación general
     */
    mostrarNotificacion(mensaje, tipo) {
        const iconos = {
            error: '❌',
            success: '✅',
            info: '📝',
            warning: '⚠️'
        };
        
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <div class="notificacion-contenido">
                <span class="notificacion-icono">${iconos[tipo] || '📝'}</span>
                <span class="notificacion-texto">${mensaje}</span>
                <button class="notificacion-cerrar" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        // Auto-cerrar según el tipo
        const tiempos = { error: 8000, success: 4000, info: 6000, warning: 7000 };
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, tiempos[tipo] || 5000);
    }
    
    // ================================================
    // MÉTODOS UTILITARIOS
    // ================================================
    
    /**
     * Obtener estadísticas del sistema
     */
    obtenerEstadisticas() {
        return {
            tickets_totales: this.ticketsActivos.size,
            tickets_abiertos: Array.from(this.ticketsActivos.values()).filter(t => t.metadata.estado === 'abierto').length,
            empleados_registrados: this.empleadosRegistrados.size,
            tipos_problemas_frecuentes: this.contarTicketsPorTipo(),
            prioridades_actuales: this.contarTicketsPorPrioridad()
        };
    }
    
    /**
     * Exportar datos para respaldo
     */
    exportarDatos() {
        const datos = {
            version: this.version,
            fecha_exportacion: new Date().toISOString(),
            tickets: Array.from(this.ticketsActivos.values()),
            empleados: Array.from(this.empleadosRegistrados.values()),
            configuracion: this.config,
            estadisticas: this.obtenerEstadisticas()
        };
        
        return JSON.stringify(datos, null, 2);
    }
    
    /**
     * Importar datos desde respaldo
     */
    importarDatos(datosJSON) {
        try {
            const datos = JSON.parse(datosJSON);
            
            // Restaurar tickets
            if (datos.tickets) {
                this.ticketsActivos.clear();
                datos.tickets.forEach(ticket => {
                    this.ticketsActivos.set(ticket.id, ticket);
                });
            }
            
            // Restaurar empleados
            if (datos.empleados) {
                this.empleadosRegistrados.clear();
                datos.empleados.forEach(empleado => {
                    this.empleadosRegistrados.set(empleado.id, empleado);
                });
            }
            
            // Restaurar configuración
            if (datos.configuracion) {
                this.config = { ...this.config, ...datos.configuracion };
            }
            
            // Guardar todo
            this.guardarTickets();
            this.guardarEmpleados();
            localStorage.setItem(this.claves.configuracion, JSON.stringify(this.config));
            
            console.log('✅ Datos importados exitosamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            return false;
        }
    }
    
    /**
     * Limpiar todos los datos del sistema
     */
    limpiarSistema() {
        if (confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
            Object.values(this.claves).forEach(clave => {
                localStorage.removeItem(clave);
            });
            
            this.ticketsActivos.clear();
            this.empleadosRegistrados.clear();
            this.contadorTickets = 0;
            
            console.log('🧹 Sistema limpiado completamente');
            this.mostrarInfo('Todos los datos han sido eliminados');
        }
    }
}

// ================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================

// Crear instancia global del sistema
window.sistemasoporte = new SistemaSoporte();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sistemasoporte.init();
    });
} else {
    window.sistemasoporte.init();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaSoporte;
}

console.log('🎫 Sistema de Soporte Técnico v2.0.0 cargado exitosamente');