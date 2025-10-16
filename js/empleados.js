/**
 * Sistema de Gestión de Empleados - Cafetería Cesde
 * Gestiona el registro, roles y administración de empleados
 */

class SistemaEmpleados {
    constructor() {
        this.empleados = JSON.parse(localStorage.getItem('empleados')) || [];
        this.asistencias = JSON.parse(localStorage.getItem('asistencias')) || [];
        this.roles = this.initRoles();
        this.permisos = this.initPermisos();
        this.semanaActual = new Date();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.actualizarEstadisticas();
        this.mostrarListaEmpleados();
        this.configurarFechaIngreso();
        this.cargarEmpleadosEnSelectores();
        this.configurarFechaAsistencia();
    }

    initRoles() {
        return {
            'administrador': {
                nombre: 'Administrador',
                nivel: 5,
                icono: '🔐',
                descripcion: 'Acceso completo al sistema',
                salarioBase: 2500000
            },
            'gerente': {
                nombre: 'Gerente',
                nivel: 4,
                icono: '👨‍💼',
                descripcion: 'Supervisión de operaciones',
                salarioBase: 2000000
            },
            'supervisor': {
                nombre: 'Supervisor',
                nivel: 3,
                icono: '👥',
                descripcion: 'Supervisión de equipo',
                salarioBase: 1500000
            },
            'cajero': {
                nombre: 'Cajero',
                nivel: 2,
                icono: '💰',
                descripcion: 'Procesamiento de ventas',
                salarioBase: 1200000
            },
            'barista': {
                nombre: 'Barista',
                nivel: 2,
                icono: '☕',
                descripcion: 'Preparación de bebidas',
                salarioBase: 1200000
            },
            'mesero': {
                nombre: 'Mesero',
                nivel: 1,
                icono: '🍽️',
                descripcion: 'Atención al cliente',
                salarioBase: 1000000
            },
            'cocinero': {
                nombre: 'Cocinero',
                nivel: 2,
                icono: '👨‍🍳',
                descripcion: 'Preparación de alimentos',
                salarioBase: 1200000
            },
            'limpieza': {
                nombre: 'Personal de Limpieza',
                nivel: 1,
                icono: '🧹',
                descripcion: 'Mantenimiento y limpieza',
                salarioBase: 950000
            }
        };
    }

    initPermisos() {
        return {
            'administrador': [
                'gestionar_empleados',
                'configurar_sistema',
                'ver_reportes_avanzados',
                'gestionar_inventario',
                'procesar_ventas',
                'gestionar_clientes',
                'backup_sistema'
            ],
            'gerente': [
                'ver_reportes_avanzados',
                'gestionar_inventario',
                'supervisar_empleados',
                'procesar_ventas',
                'gestionar_clientes'
            ],
            'supervisor': [
                'supervisar_empleados',
                'ver_reportes_basicos',
                'gestionar_inventario',
                'procesar_ventas'
            ],
            'cajero': [
                'procesar_ventas',
                'gestionar_clientes',
                'ver_reportes_propios'
            ],
            'barista': [
                'gestionar_inventario_materias',
                'ver_ordenes',
                'control_calidad'
            ],
            'mesero': [
                'tomar_ordenes',
                'atender_clientes',
                'ver_menu'
            ],
            'cocinero': [
                'preparar_alimentos',
                'gestionar_inventario_materias',
                'control_calidad'
            ],
            'limpieza': [
                'acceso_basico'
            ]
        };
    }

    configurarEventos() {
        // Formulario de registro
        const formEmpleado = document.getElementById('form-empleado');
        if (formEmpleado) {
            formEmpleado.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarEmpleado();
            });
        }

        // Búsqueda de empleados
        const buscarInput = document.getElementById('buscar-empleado');
        if (buscarInput) {
            buscarInput.addEventListener('input', (e) => {
                this.buscarEmpleados(e.target.value);
            });
        }

        // Navegación entre secciones
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });

        // Auto-completar salario según cargo
        const cargoSelect = document.getElementById('emp-cargo');
        if (cargoSelect) {
            cargoSelect.addEventListener('change', (e) => {
                this.actualizarSalarioSugerido(e.target.value);
            });
        }

        // Selector de empleado para marcación
        const empleadoMarcacion = document.getElementById('empleado-marcacion');
        if (empleadoMarcacion) {
            empleadoMarcacion.addEventListener('change', (e) => {
                this.mostrarEstadoEmpleado(e.target.value);
            });
        }
    }

    configurarFechaIngreso() {
        const fechaInput = document.getElementById('emp-fecha-ingreso');
        if (fechaInput) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaInput.value = hoy;
        }
    }

    configurarFechaAsistencia() {
        const fechaInput = document.getElementById('fecha-asistencia');
        if (fechaInput) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaInput.value = hoy;
        }

        // Configurar fechas de reporte
        const fechaInicio = document.getElementById('fecha-inicio-reporte');
        const fechaFin = document.getElementById('fecha-fin-reporte');
        if (fechaInicio && fechaFin) {
            const hoy = new Date();
            const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            fechaInicio.value = hace7Dias.toISOString().split('T')[0];
            fechaFin.value = hoy.toISOString().split('T')[0];
        }
    }

    cargarEmpleadosEnSelectores() {
        const empleadosActivos = this.empleados.filter(emp => emp.estado === 'activo');
        
        // Selector de marcación
        const selectMarcacion = document.getElementById('empleado-marcacion');
        if (selectMarcacion) {
            selectMarcacion.innerHTML = '<option value="">Seleccionar empleado...</option>';
            empleadosActivos.forEach(emp => {
                const option = new Option(`${emp.nombres} ${emp.apellidos} (${emp.cargo})`, emp.id);
                selectMarcacion.appendChild(option);
            });
        }

        // Selector de reportes
        const selectReporte = document.getElementById('empleado-reporte');
        if (selectReporte) {
            selectReporte.innerHTML = '<option value="">Todos los empleados</option>';
            empleadosActivos.forEach(emp => {
                const option = new Option(`${emp.nombres} ${emp.apellidos}`, emp.id);
                selectReporte.appendChild(option);
            });
        }
    }

    actualizarSalarioSugerido(cargo) {
        const salarioInput = document.getElementById('emp-salario');
        if (cargo && this.roles[cargo] && salarioInput) {
            salarioInput.value = this.roles[cargo].salarioBase;
            salarioInput.placeholder = `Salario sugerido: $${this.roles[cargo].salarioBase.toLocaleString('es-CO')}`;
        }
    }

    registrarEmpleado() {
        const formData = new FormData(document.getElementById('form-empleado'));
        const empleado = {
            id: this.generarIdEmpleado(),
            nombres: formData.get('nombres'),
            apellidos: formData.get('apellidos'),
            documento: formData.get('documento'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            fechaNacimiento: formData.get('fechaNacimiento'),
            direccion: formData.get('direccion'),
            cargo: formData.get('cargo'),
            salario: parseInt(formData.get('salario')),
            fechaIngreso: formData.get('fechaIngreso'),
            turno: formData.get('turno'),
            estado: formData.get('estado'),
            fechaRegistro: new Date().toISOString(),
            permisos: this.permisos[formData.get('cargo')] || [],
            horasTrabajadasMes: 0,
            ventasRealizadas: 0,
            evaluaciones: []
        };

        // Validaciones
        if (!this.validarEmpleado(empleado)) {
            return;
        }

        // Verificar si ya existe el documento
        if (this.empleados.find(emp => emp.documento === empleado.documento)) {
            this.mostrarError('Ya existe un empleado con este número de documento');
            return;
        }

        // Guardar empleado
        this.empleados.push(empleado);
        localStorage.setItem('empleados', JSON.stringify(this.empleados));

        // Mostrar éxito
        this.mostrarExito(`Empleado ${empleado.nombres} ${empleado.apellidos} registrado exitosamente`);

        // Limpiar formulario
        document.getElementById('form-empleado').reset();
        this.configurarFechaIngreso();

        // Actualizar vistas
        this.actualizarEstadisticas();
        this.mostrarListaEmpleados();
        this.cargarEmpleadosEnSelectores();
    }

    generarIdEmpleado() {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().slice(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const numero = (this.empleados.length + 1).toString().padStart(3, '0');
        return `EMP${año}${mes}${numero}`;
    }

    validarEmpleado(empleado) {
        // Validar edad mínima (18 años)
        const fechaNacimiento = new Date(empleado.fechaNacimiento);
        const edad = new Date().getFullYear() - fechaNacimiento.getFullYear();
        
        if (edad < 18) {
            this.mostrarError('El empleado debe ser mayor de 18 años');
            return false;
        }

        // Validar salario mínimo
        if (empleado.salario < 900000) {
            this.mostrarError('El salario no puede ser menor al salario mínimo legal');
            return false;
        }

        // Validar email único
        if (this.empleados.find(emp => emp.email === empleado.email)) {
            this.mostrarError('Ya existe un empleado con este email');
            return false;
        }

        return true;
    }

    mostrarListaEmpleados(filtro = '') {
        const container = document.getElementById('lista-empleados');
        if (!container) return;

        let empleadosFiltrados = this.empleados;

        if (filtro) {
            empleadosFiltrados = this.empleados.filter(emp => 
                emp.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
                emp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
                emp.documento.includes(filtro) ||
                emp.cargo.toLowerCase().includes(filtro.toLowerCase()) ||
                emp.email.toLowerCase().includes(filtro.toLowerCase())
            );
        }

        if (empleadosFiltrados.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>No se encontraron empleados</h3>
                    <p>${filtro ? 'Intenta con otro término de búsqueda' : 'Registra el primer empleado'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = empleadosFiltrados.map(emp => this.crearTarjetaEmpleado(emp)).join('');
    }

    crearTarjetaEmpleado(empleado) {
        const rol = this.roles[empleado.cargo];
        const estadoClass = empleado.estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
        const estadoTexto = this.obtenerTextoEstado(empleado.estado);

        return `
            <div class="empleado-card">
                <div class="empleado-header">
                    <div class="empleado-nombre">${empleado.nombres} ${empleado.apellidos}</div>
                    <div class="empleado-rol">${rol ? rol.icono : ''} ${rol ? rol.nombre : empleado.cargo}</div>
                </div>
                
                <div class="empleado-info">
                    <div class="info-item">
                        <span class="info-label">ID:</span> ${empleado.id}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Documento:</span> ${empleado.documento}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span> ${empleado.email}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Teléfono:</span> ${empleado.telefono}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Turno:</span> ${this.formatearTurno(empleado.turno)}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Salario:</span> $${empleado.salario.toLocaleString('es-CO')}
                    </div>
                </div>

                <div class="empleado-estado ${estadoClass}">
                    ${estadoTexto}
                </div>

                <div class="empleado-acciones">
                    <button class="btn btn-primary btn-sm" onclick="sistemaEmpleados.verDetalleEmpleado('${empleado.id}')">
                        👁️ Ver
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="sistemaEmpleados.editarEmpleado('${empleado.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="sistemaEmpleados.cambiarEstadoEmpleado('${empleado.id}')">
                        🔄 Estado
                    </button>
                    ${empleado.estado === 'activo' ? 
                        `<button class="btn btn-danger btn-sm" onclick="sistemaEmpleados.desactivarEmpleado('${empleado.id}')">
                            ❌ Desactivar
                        </button>` :
                        `<button class="btn btn-primary btn-sm" onclick="sistemaEmpleados.activarEmpleado('${empleado.id}')">
                            ✅ Activar
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'activo': '✅ Activo',
            'inactivo': '❌ Inactivo',
            'vacaciones': '🏖️ En Vacaciones',
            'licencia': '📋 En Licencia'
        };
        return estados[estado] || estado;
    }

    formatearTurno(turno) {
        const turnos = {
            'mañana': '🌅 Mañana (6:00 AM - 2:00 PM)',
            'tarde': '🌆 Tarde (2:00 PM - 10:00 PM)',
            'noche': '🌙 Noche (10:00 PM - 6:00 AM)',
            'completo': '🕐 Tiempo Completo'
        };
        return turnos[turno] || turno;
    }

    buscarEmpleados(termino) {
        this.mostrarListaEmpleados(termino);
    }

    verDetalleEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;

        const rol = this.roles[empleado.cargo];
        const permisos = empleado.permisos || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal-detalle-empleado';
        modal.innerHTML = `
            <div class="modal-contenido-empleado">
                <div class="modal-header-empleado">
                    <h3>👤 Detalle del Empleado</h3>
                    <button class="modal-close-empleado">&times;</button>
                </div>
                <div class="modal-body-empleado">
                    <div class="empleado-info-completa">
                        <div class="info-section">
                            <h4>👤 Información Personal</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>Nombre:</strong> ${empleado.nombres} ${empleado.apellidos}
                                </div>
                                <div class="info-item">
                                    <strong>Documento:</strong> ${empleado.documento}
                                </div>
                                <div class="info-item">
                                    <strong>Email:</strong> ${empleado.email}
                                </div>
                                <div class="info-item">
                                    <strong>Teléfono:</strong> ${empleado.telefono}
                                </div>
                                <div class="info-item">
                                    <strong>Fecha Nacimiento:</strong> ${new Date(empleado.fechaNacimiento).toLocaleDateString()}
                                </div>
                                <div class="info-item">
                                    <strong>Dirección:</strong> ${empleado.direccion}
                                </div>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>💼 Información Laboral</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>ID Empleado:</strong> ${empleado.id}
                                </div>
                                <div class="info-item">
                                    <strong>Cargo:</strong> ${rol ? rol.icono : ''} ${rol ? rol.nombre : empleado.cargo}
                                </div>
                                <div class="info-item">
                                    <strong>Salario:</strong> $${empleado.salario.toLocaleString('es-CO')}
                                </div>
                                <div class="info-item">
                                    <strong>Fecha Ingreso:</strong> ${new Date(empleado.fechaIngreso).toLocaleDateString()}
                                </div>
                                <div class="info-item">
                                    <strong>Turno:</strong> ${this.formatearTurno(empleado.turno)}
                                </div>
                                <div class="info-item">
                                    <strong>Estado:</strong> ${this.obtenerTextoEstado(empleado.estado)}
                                </div>
                            </div>
                        </div>

                        <div class="info-section">
                            <h4>🔐 Permisos y Accesos</h4>
                            <div class="permisos-lista">
                                ${permisos.map(permiso => `
                                    <span class="permiso-badge">✅ ${this.formatearPermiso(permiso)}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="info-section">
                            <h4>📊 Estadísticas</h4>
                            <div class="stats-empleado">
                                <div class="stat-item">
                                    <strong>Horas trabajadas este mes:</strong> ${empleado.horasTrabajadasMes || 0}
                                </div>
                                <div class="stat-item">
                                    <strong>Ventas realizadas:</strong> ${empleado.ventasRealizadas || 0}
                                </div>
                                <div class="stat-item">
                                    <strong>Antigüedad:</strong> ${this.calcularAntiguedad(empleado.fechaIngreso)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer-empleado">
                    <button class="btn btn-warning" onclick="sistemaEmpleados.editarEmpleado('${empleado.id}'); sistemaEmpleados.cerrarModal()">✏️ Editar</button>
                    <button class="btn btn-secondary modal-close-empleado">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.configurarEventosModal(modal);
    }

    formatearPermiso(permiso) {
        const permisos = {
            'gestionar_empleados': 'Gestionar Empleados',
            'configurar_sistema': 'Configurar Sistema',
            'ver_reportes_avanzados': 'Reportes Avanzados',
            'gestionar_inventario': 'Gestionar Inventario',
            'procesar_ventas': 'Procesar Ventas',
            'gestionar_clientes': 'Gestionar Clientes',
            'backup_sistema': 'Backup del Sistema',
            'supervisar_empleados': 'Supervisar Empleados',
            'ver_reportes_basicos': 'Reportes Básicos',
            'ver_reportes_propios': 'Ver Reportes Propios',
            'gestionar_inventario_materias': 'Inventario Materias Primas',
            'ver_ordenes': 'Ver Órdenes',
            'control_calidad': 'Control de Calidad',
            'tomar_ordenes': 'Tomar Órdenes',
            'atender_clientes': 'Atender Clientes',
            'ver_menu': 'Ver Menú',
            'preparar_alimentos': 'Preparar Alimentos',
            'acceso_basico': 'Acceso Básico'
        };
        return permisos[permiso] || permiso;
    }

    calcularAntiguedad(fechaIngreso) {
        const ingreso = new Date(fechaIngreso);
        const hoy = new Date();
        const diffTime = Math.abs(hoy - ingreso);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} días`;
        } else if (diffDays < 365) {
            return `${Math.floor(diffDays / 30)} meses`;
        } else {
            const años = Math.floor(diffDays / 365);
            const meses = Math.floor((diffDays % 365) / 30);
            return `${años} años${meses > 0 ? ` y ${meses} meses` : ''}`;
        }
    }

    configurarEventosModal(modal) {
        modal.querySelectorAll('.modal-close-empleado').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModal(modal));
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModal(modal);
        });
    }

    cerrarModal(modal = null) {
        if (!modal) {
            modal = document.querySelector('.modal-detalle-empleado');
        }
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
            }, 300);
        }
    }

    editarEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;

        // Cambiar a la sección de registro
        mostrarSeccion('registro');

        // Llenar el formulario con los datos del empleado
        document.getElementById('emp-nombres').value = empleado.nombres;
        document.getElementById('emp-apellidos').value = empleado.apellidos;
        document.getElementById('emp-documento').value = empleado.documento;
        document.getElementById('emp-email').value = empleado.email;
        document.getElementById('emp-telefono').value = empleado.telefono;
        document.getElementById('emp-fecha-nacimiento').value = empleado.fechaNacimiento;
        document.getElementById('emp-direccion').value = empleado.direccion;
        document.getElementById('emp-cargo').value = empleado.cargo;
        document.getElementById('emp-salario').value = empleado.salario;
        document.getElementById('emp-fecha-ingreso').value = empleado.fechaIngreso;
        document.getElementById('emp-turno').value = empleado.turno;
        document.getElementById('emp-estado').value = empleado.estado;

        // Cambiar el comportamiento del formulario para editar
        const form = document.getElementById('form-empleado');
        form.setAttribute('data-editing', id);
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Actualizar Empleado';
        submitBtn.className = 'btn btn-warning';

        // Agregar botón cancelar
        if (!form.querySelector('.btn-cancelar-edicion')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-secondary btn-cancelar-edicion';
            cancelBtn.textContent = '❌ Cancelar Edición';
            cancelBtn.onclick = () => this.cancelarEdicion();
            
            const btnGroup = form.querySelector('.btn-group');
            btnGroup.appendChild(cancelBtn);
        }
    }

    cancelarEdicion() {
        const form = document.getElementById('form-empleado');
        form.removeAttribute('data-editing');
        form.reset();
        this.configurarFechaIngreso();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Guardar Empleado';
        submitBtn.className = 'btn btn-primary';

        const cancelBtn = form.querySelector('.btn-cancelar-edicion');
        if (cancelBtn) cancelBtn.remove();
    }

    cambiarEstadoEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;

        const estados = ['activo', 'inactivo', 'vacaciones', 'licencia'];
        const estadoActual = empleado.estado;
        const indiceActual = estados.indexOf(estadoActual);
        const siguienteEstado = estados[(indiceActual + 1) % estados.length];

        empleado.estado = siguienteEstado;
        localStorage.setItem('empleados', JSON.stringify(this.empleados));

        this.mostrarExito(`Estado del empleado cambiado a: ${this.obtenerTextoEstado(siguienteEstado)}`);
        this.actualizarEstadisticas();
        this.mostrarListaEmpleados();
    }

    desactivarEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;

        if (confirm(`¿Está seguro de desactivar al empleado ${empleado.nombres} ${empleado.apellidos}?`)) {
            empleado.estado = 'inactivo';
            localStorage.setItem('empleados', JSON.stringify(this.empleados));

            this.mostrarExito(`Empleado ${empleado.nombres} ${empleado.apellidos} desactivado`);
            this.actualizarEstadisticas();
            this.mostrarListaEmpleados();
        }
    }

    activarEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;

        empleado.estado = 'activo';
        localStorage.setItem('empleados', JSON.stringify(this.empleados));

        this.mostrarExito(`Empleado ${empleado.nombres} ${empleado.apellidos} activado`);
        this.actualizarEstadisticas();
        this.mostrarListaEmpleados();
    }

    actualizarEstadisticas() {
        const total = this.empleados.length;
        const activos = this.empleados.filter(emp => emp.estado === 'activo').length;
        const administradores = this.empleados.filter(emp => emp.cargo === 'administrador').length;
        const vendedores = this.empleados.filter(emp => ['cajero', 'mesero'].includes(emp.cargo)).length;

        document.getElementById('total-empleados').textContent = total;
        document.getElementById('empleados-activos').textContent = activos;
        document.getElementById('total-administradores').textContent = administradores;
        document.getElementById('total-vendedores').textContent = vendedores;
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }

    mostrarExito(mensaje) {
        this.mostrarMensaje(mensaje, 'exito');
    }

    mostrarMensaje(mensaje, tipo) {
        let mensajeContainer = document.getElementById('mensaje-sistema');
        
        if (!mensajeContainer) {
            mensajeContainer = document.createElement('div');
            mensajeContainer.id = 'mensaje-sistema';
            mensajeContainer.className = 'mensaje-sistema';
            document.body.appendChild(mensajeContainer);
        }
        
        const icono = tipo === 'error' ? '❌' : '✅';
        mensajeContainer.innerHTML = `
            <div class="mensaje-${tipo}">
                ${icono} ${mensaje}
            </div>
        `;
        mensajeContainer.className = `mensaje-sistema ${tipo}`;
        
        setTimeout(() => {
            mensajeContainer.innerHTML = '';
            mensajeContainer.className = 'mensaje-sistema';
        }, 4000);
    }

    // Método para verificar permisos
    verificarPermiso(empleadoId, permiso) {
        const empleado = this.empleados.find(emp => emp.id === empleadoId);
        return empleado && empleado.permisos.includes(permiso);
    }

    // Método para obtener empleados por cargo
    obtenerEmpleadosPorCargo(cargo) {
        return this.empleados.filter(emp => emp.cargo === cargo && emp.estado === 'activo');
    }

    // === MÉTODOS DE CONTROL DE HORARIOS ===

    mostrarEstadoEmpleado(empleadoId) {
        const container = document.getElementById('estado-empleado-actual');
        if (!container || !empleadoId) {
            if (container) container.innerHTML = '';
            return;
        }

        const empleado = this.empleados.find(emp => emp.id === empleadoId);
        if (!empleado) return;

        const estadoActual = this.obtenerEstadoActualEmpleado(empleadoId);
        const horasHoy = this.calcularHorasTrabajadasHoy(empleadoId);

        let estadoClass = 'estado-fuera';
        let estadoTexto = '🔴 Fuera de servicio';
        let ultimaAccion = 'Sin marcaciones hoy';

        if (estadoActual) {
            if (estadoActual.tipo === 'entrada' && !estadoActual.salida) {
                if (estadoActual.enDescanso) {
                    estadoClass = 'estado-descanso';
                    estadoTexto = '☕ En descanso';
                    ultimaAccion = `Descanso desde: ${new Date(estadoActual.inicioDescanso).toLocaleTimeString()}`;
                } else {
                    estadoClass = 'estado-trabajando';
                    estadoTexto = '🟢 Trabajando';
                    ultimaAccion = `Entrada: ${new Date(estadoActual.entrada).toLocaleTimeString()}`;
                }
            }
        }

        container.innerHTML = `
            <div class="${estadoClass}">
                <h4>${empleado.nombres} ${empleado.apellidos}</h4>
                <p><strong>Estado:</strong> ${estadoTexto}</p>
                <p><strong>Última acción:</strong> ${ultimaAccion}</p>
                <p><strong>Horas trabajadas hoy:</strong> ${horasHoy.toFixed(2)} horas</p>
            </div>
        `;
    }

    obtenerEstadoActualEmpleado(empleadoId) {
        const hoy = new Date().toISOString().split('T')[0];
        return this.asistencias.find(
            asist => asist.empleadoId === empleadoId && 
                    asist.fecha === hoy && 
                    !asist.salida
        );
    }

    marcarEntrada() {
        const empleadoId = document.getElementById('empleado-marcacion').value;
        if (!empleadoId) {
            this.mostrarError('Debe seleccionar un empleado');
            return;
        }

        const empleado = this.empleados.find(emp => emp.id === empleadoId);
        const estadoActual = this.obtenerEstadoActualEmpleado(empleadoId);

        if (estadoActual) {
            this.mostrarError(`${empleado.nombres} ya tiene marcada la entrada`);
            return;
        }

        const ahora = new Date();
        const asistencia = {
            id: this.generarIdAsistencia(),
            empleadoId: empleadoId,
            fecha: ahora.toISOString().split('T')[0],
            entrada: ahora.toISOString(),
            salida: null,
            descansos: [],
            enDescanso: false,
            horasTrabajadas: 0,
            horasDescanso: 0
        };

        this.asistencias.push(asistencia);
        localStorage.setItem('asistencias', JSON.stringify(this.asistencias));

        this.mostrarExito(`✅ Entrada marcada para ${empleado.nombres} ${empleado.apellidos}`);
        this.mostrarEstadoEmpleado(empleadoId);
        this.cargarAsistenciaDia();
    }

    marcarSalida() {
        const empleadoId = document.getElementById('empleado-marcacion').value;
        if (!empleadoId) {
            this.mostrarError('Debe seleccionar un empleado');
            return;
        }

        const empleado = this.empleados.find(emp => emp.id === empleadoId);
        const estadoActual = this.obtenerEstadoActualEmpleado(empleadoId);

        if (!estadoActual) {
            this.mostrarError(`${empleado.nombres} no tiene marcada la entrada`);
            return;
        }

        if (estadoActual.enDescanso) {
            this.mostrarError(`${empleado.nombres} está en descanso. Debe finalizar el descanso primero`);
            return;
        }

        const ahora = new Date();
        estadoActual.salida = ahora.toISOString();
        estadoActual.horasTrabajadas = this.calcularHorasTrabajadasCompletas(estadoActual);

        localStorage.setItem('asistencias', JSON.stringify(this.asistencias));

        this.mostrarExito(`🔴 Salida marcada para ${empleado.nombres} ${empleado.apellidos}. Horas trabajadas: ${estadoActual.horasTrabajadas.toFixed(2)}`);
        this.mostrarEstadoEmpleado(empleadoId);
        this.cargarAsistenciaDia();
    }

    marcarDescanso() {
        const empleadoId = document.getElementById('empleado-marcacion').value;
        if (!empleadoId) {
            this.mostrarError('Debe seleccionar un empleado');
            return;
        }

        const empleado = this.empleados.find(emp => emp.id === empleadoId);
        const estadoActual = this.obtenerEstadoActualEmpleado(empleadoId);

        if (!estadoActual) {
            this.mostrarError(`${empleado.nombres} no tiene marcada la entrada`);
            return;
        }

        if (estadoActual.enDescanso) {
            this.mostrarError(`${empleado.nombres} ya está en descanso`);
            return;
        }

        const ahora = new Date();
        estadoActual.enDescanso = true;
        estadoActual.inicioDescanso = ahora.toISOString();

        localStorage.setItem('asistencias', JSON.stringify(this.asistencias));

        this.mostrarExito(`☕ Descanso iniciado para ${empleado.nombres} ${empleado.apellidos}`);
        this.mostrarEstadoEmpleado(empleadoId);
        this.cargarAsistenciaDia();
    }

    finalizarDescanso() {
        const empleadoId = document.getElementById('empleado-marcacion').value;
        if (!empleadoId) {
            this.mostrarError('Debe seleccionar un empleado');
            return;
        }

        const empleado = this.empleados.find(emp => emp.id === empleadoId);
        const estadoActual = this.obtenerEstadoActualEmpleado(empleadoId);

        if (!estadoActual || !estadoActual.enDescanso) {
            this.mostrarError(`${empleado.nombres} no está en descanso`);
            return;
        }

        const ahora = new Date();
        const tiempoDescanso = (ahora - new Date(estadoActual.inicioDescanso)) / (1000 * 60 * 60);

        estadoActual.descansos.push({
            inicio: estadoActual.inicioDescanso,
            fin: ahora.toISOString(),
            duracion: tiempoDescanso
        });

        estadoActual.horasDescanso += tiempoDescanso;
        estadoActual.enDescanso = false;
        delete estadoActual.inicioDescanso;

        localStorage.setItem('asistencias', JSON.stringify(this.asistencias));

        this.mostrarExito(`▶️ Descanso finalizado para ${empleado.nombres} ${empleado.apellidos}. Duración: ${tiempoDescanso.toFixed(2)} horas`);
        this.mostrarEstadoEmpleado(empleadoId);
        this.cargarAsistenciaDia();
    }

    calcularHorasTrabajadasHoy(empleadoId) {
        const hoy = new Date().toISOString().split('T')[0];
        const asistencia = this.asistencias.find(
            asist => asist.empleadoId === empleadoId && asist.fecha === hoy
        );

        if (!asistencia || !asistencia.entrada) return 0;

        let tiempoFin = asistencia.salida ? new Date(asistencia.salida) : new Date();
        
        // Si está en descanso, no contar el tiempo de descanso actual
        if (asistencia.enDescanso && asistencia.inicioDescanso) {
            tiempoFin = new Date(asistencia.inicioDescanso);
        }

        const tiempoTrabajado = (tiempoFin - new Date(asistencia.entrada)) / (1000 * 60 * 60);
        const tiempoDescanso = asistencia.horasDescanso || 0;

        return Math.max(0, tiempoTrabajado - tiempoDescanso);
    }

    calcularHorasTrabajadasCompletas(asistencia) {
        if (!asistencia.entrada || !asistencia.salida) return 0;

        const tiempoTotal = (new Date(asistencia.salida) - new Date(asistencia.entrada)) / (1000 * 60 * 60);
        const tiempoDescanso = asistencia.horasDescanso || 0;

        return Math.max(0, tiempoTotal - tiempoDescanso);
    }

    cargarAsistenciaDia() {
        const fechaInput = document.getElementById('fecha-asistencia');
        const container = document.getElementById('tabla-asistencia-dia');
        
        if (!fechaInput || !container) return;

        const fecha = fechaInput.value;
        if (!fecha) return;

        const asistenciasDia = this.asistencias.filter(asist => asist.fecha === fecha);

        if (asistenciasDia.length === 0) {
            container.innerHTML = '<div class="sin-asistencia">No hay registros de asistencia para esta fecha</div>';
            return;
        }

        const tabla = `
            <table>
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Horas Trabajadas</th>
                        <th>Descansos</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${asistenciasDia.map(asist => this.crearFilaAsistencia(asist)).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tabla;
    }

    crearFilaAsistencia(asistencia) {
        const empleado = this.empleados.find(emp => emp.id === asistencia.empleadoId);
        if (!empleado) return '';

        const entrada = asistencia.entrada ? new Date(asistencia.entrada).toLocaleTimeString() : '-';
        const salida = asistencia.salida ? new Date(asistencia.salida).toLocaleTimeString() : '-';
        
        let horasTrabajadas = 0;
        let estado = '';

        if (asistencia.salida) {
            horasTrabajadas = this.calcularHorasTrabajadasCompletas(asistencia);
            estado = '<span class="marcacion-salida">✅ Completado</span>';
        } else if (asistencia.enDescanso) {
            horasTrabajadas = this.calcularHorasTrabajadasHoy(asistencia.empleadoId);
            estado = '<span class="marcacion-descanso">☕ En descanso</span>';
        } else if (asistencia.entrada) {
            horasTrabajadas = this.calcularHorasTrabajadasHoy(asistencia.empleadoId);
            estado = '<span class="marcacion-entrada">🟢 Trabajando</span>';
        }

        const totalDescansos = asistencia.descansos?.length || 0;
        const tiempoDescanso = asistencia.horasDescanso?.toFixed(2) || '0.00';

        return `
            <tr>
                <td><strong>${empleado.nombres} ${empleado.apellidos}</strong><br><small>${empleado.cargo}</small></td>
                <td>${entrada}</td>
                <td>${salida}</td>
                <td><span class="tiempo-trabajado">${horasTrabajadas.toFixed(2)}h</span></td>
                <td>${totalDescansos} (${tiempoDescanso}h)</td>
                <td>${estado}</td>
            </tr>
        `;
    }

    generarIdAsistencia() {
        const fecha = new Date();
        const timestamp = fecha.getTime();
        return `ASIST${timestamp}`;
    }
}

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

    // Actualizar contenido específico de la sección
    if (seccionId === 'lista') {
        sistemaEmpleados.mostrarListaEmpleados();
    } else if (seccionId === 'estadisticas') {
        sistemaEmpleados.mostrarEstadisticasDetalladas();
    } else if (seccionId === 'horarios') {
        sistemaEmpleados.cargarEmpleadosEnSelectores();
        sistemaEmpleados.configurarFechaAsistencia();
        sistemaEmpleados.cargarAsistenciaDia();
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('form-empleado')) {
        window.sistemaEmpleados = new SistemaEmpleados();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaEmpleados;
}