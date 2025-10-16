/**
 * Sistema de Registro de Clientes - Cafetería Cesde
 * Gestión completa de registro y validación de clientes
 */

class SistemaRegistro {
    constructor() {
        this.clientes = this.cargarClientes();
        this.contadorClientes = this.obtenerContadorClientes();
        this.clienteEditando = null;
        this.init();
    }

    init() {
        this.configurarEventos();
        this.configurarValidaciones();
        this.generarIdCliente();
        this.actualizarEstadisticas();
        this.configurarBusqueda();
    }

    cargarClientes() {
        const clientesGuardados = localStorage.getItem('clientes_cafeteria');
        return clientesGuardados ? JSON.parse(clientesGuardados) : {};
    }

    guardarClientes() {
        localStorage.setItem('clientes_cafeteria', JSON.stringify(this.clientes));
        localStorage.setItem('contador_clientes', this.contadorClientes.toString());
    }

    configurarBusqueda() {
        // Toggle del panel de búsqueda
        const btnToggle = document.getElementById('btn-toggle-busqueda');
        const container = document.getElementById('busqueda-container');
        
        if (btnToggle && container) {
            btnToggle.addEventListener('click', () => {
                const isVisible = container.style.display !== 'none';
                container.style.display = isVisible ? 'none' : 'block';
                btnToggle.textContent = isVisible ? '👁️ Mostrar Búsqueda' : '🙈 Ocultar Búsqueda';
            });
        }

        // Búsqueda en tiempo real
        const inputBuscar = document.getElementById('buscar-cliente');
        if (inputBuscar) {
            inputBuscar.addEventListener('input', (e) => {
                const termino = e.target.value.trim();
                if (termino.length >= 2) {
                    this.buscarClientes(termino);
                } else {
                    this.limpiarResultadosBusqueda();
                }
            });
        }

        // Botón de búsqueda
        const btnBuscar = document.getElementById('btn-buscar');
        if (btnBuscar) {
            btnBuscar.addEventListener('click', () => {
                const termino = inputBuscar?.value.trim();
                if (termino) {
                    this.buscarClientes(termino);
                }
            });
        }
    }

    buscarClientes(termino) {
        const terminoLower = termino.toLowerCase();
        const resultados = Object.values(this.clientes).filter(cliente => {
            return (
                cliente.nombres.toLowerCase().includes(terminoLower) ||
                cliente.apellidos.toLowerCase().includes(terminoLower) ||
                cliente.numero_documento.includes(termino) ||
                cliente.correo_electronico.toLowerCase().includes(terminoLower) ||
                cliente.telefono_principal.includes(termino)
            );
        });

        this.mostrarResultadosBusqueda(resultados);
    }

    mostrarResultadosBusqueda(resultados) {
        const container = document.getElementById('resultados-busqueda');
        if (!container) return;

        if (resultados.length === 0) {
            container.innerHTML = `
                <div class="sin-resultados">
                    <p>No se encontraron clientes que coincidan con la búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = resultados.map(cliente => this.crearElementoResultado(cliente)).join('');
        
        // Configurar eventos de los botones de acción DESPUÉS de crear el HTML
        setTimeout(() => {
            this.configurarEventosResultados();
        }, 100);
    }

    crearElementoResultado(cliente) {
        const estadoClass = cliente.activo ? 'cliente-activo' : 'cliente-inactivo';
        const badgeEstado = cliente.activo ? 
            '<span class="badge badge-activo">Activo</span>' : 
            '<span class="badge badge-inactivo">Inactivo</span>';
        
        const badgeVip = cliente.esVip ? '<span class="badge badge-vip">VIP</span>' : '';
        
        return `
            <div class="cliente-resultado ${estadoClass}" data-cliente-id="${cliente.id_cliente}">
                <div class="cliente-info">
                    <div class="cliente-datos">
                        <h4>${cliente.nombres} ${cliente.apellidos}</h4>
                        <p><strong>ID:</strong> ${cliente.id_cliente} | <strong>Doc:</strong> ${cliente.numero_documento}</p>
                        <p><strong>Email:</strong> ${cliente.correo_electronico} | <strong>Tel:</strong> ${cliente.telefono_principal}</p>
                        <p><strong>Rol:</strong> ${cliente.rol_institucion} | <strong>Registro:</strong> ${new Date(cliente.fecha_registro).toLocaleDateString()}</p>
                        <div style="margin-top: 8px;">
                            ${badgeEstado}
                            ${badgeVip}
                        </div>
                    </div>
                    <div class="cliente-acciones">
                        <button class="btn-accion btn-ver" data-accion="ver" data-cliente-id="${cliente.id_cliente}">
                            👁️ Ver
                        </button>
                        <button class="btn-accion btn-editar" data-accion="editar" data-cliente-id="${cliente.id_cliente}">
                            ✏️ Editar
                        </button>
                        <button class="btn-accion btn-eliminar" data-accion="eliminar" data-cliente-id="${cliente.id_cliente}">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    configurarEventosResultados() {
        // Usar delegación de eventos en el contenedor padre
        const container = document.getElementById('resultados-busqueda');
        if (!container) return;

        // Remover listeners anteriores si existen
        container.removeEventListener('click', this.handleResultadosClick);
        
        // Crear el handler como método del objeto para poder removerlo después
        this.handleResultadosClick = (e) => {
            const btn = e.target.closest('.btn-accion');
            if (!btn) return;
            
            e.stopPropagation();
            const accion = btn.dataset.accion;
            const clienteId = btn.dataset.clienteId; // data-cliente-id se convierte en clienteId
            
            console.log('Acción:', accion, 'Cliente ID:', clienteId); // Debug
            
            switch (accion) {
                case 'ver':
                    this.verDetalleCliente(clienteId);
                    break;
                case 'editar':
                    this.editarCliente(clienteId);
                    break;
                case 'eliminar':
                    this.eliminarCliente(clienteId);
                    break;
            }
        };

        // Agregar el nuevo listener
        container.addEventListener('click', this.handleResultadosClick);
    }

    verDetalleCliente(clienteId) {
        const cliente = this.clientes[clienteId];
        if (!cliente) return;

        // Obtener historial de compras
        const historial = this.obtenerHistorialCompras(clienteId);
        
        const detalle = `
            📋 DETALLE DEL CLIENTE
            
            👤 Información Personal:
            • Nombre: ${cliente.nombres} ${cliente.apellidos}
            • Documento: ${cliente.tipo_documento} ${cliente.numero_documento}
            • Email: ${cliente.correo_electronico}
            • Teléfono: ${cliente.telefono_principal}
            • Fecha Nacimiento: ${cliente.fecha_nacimiento}
            
            🏢 Información Institucional:
            • Rol: ${cliente.rolInstitucion}
            • Programa: ${cliente.programaAcademico || 'N/A'}
            • Semestre: ${cliente.semestre || 'N/A'}
            
            📊 Estado de Cuenta:
            • Estado: ${cliente.activo ? 'Activo' : 'Inactivo'}
            • VIP: ${cliente.esVip ? 'Sí' : 'No'}
            • Puntos: ${cliente.puntos || 0}
            • Compras realizadas: ${historial.totalCompras}
            • Total gastado: $${historial.totalGastado.toLocaleString('es-CO')}
            • Promedio por compra: $${historial.promedioCompra.toLocaleString('es-CO')}
            
            📅 Fechas:
            • Registro: ${new Date(cliente.fechaRegistro).toLocaleDateString()}
            • Última compra: ${historial.ultimaCompra ? new Date(historial.ultimaCompra).toLocaleDateString() : 'Nunca'}
            
            🛒 Últimas 3 Compras:
            ${historial.ultimasCompras.map(compra => 
                `• ${new Date(compra.fecha).toLocaleDateString()} - $${compra.total.toLocaleString('es-CO')} (${compra.items} productos)`
            ).join('\n            ') || '• Sin compras registradas'}
        `;

        // Mostrar modal personalizado en lugar de alert
        this.mostrarModalDetalleCliente(cliente, historial, detalle);
    }

    obtenerHistorialCompras(clienteId) {
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const comprasCliente = ventas.filter(venta => venta.idCliente === clienteId);
        
        const totalCompras = comprasCliente.length;
        const totalGastado = comprasCliente.reduce((total, compra) => total + (compra.total || 0), 0);
        const promedioCompra = totalCompras > 0 ? totalGastado / totalCompras : 0;
        
        const ultimaCompra = comprasCliente.length > 0 ? 
            Math.max(...comprasCliente.map(c => new Date(c.fecha).getTime())) : null;
        
        const ultimasCompras = comprasCliente
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 3)
            .map(compra => ({
                fecha: compra.fecha,
                total: compra.total,
                items: compra.items?.length || 0,
                productos: compra.items || []
            }));

        return {
            totalCompras,
            totalGastado,
            promedioCompra,
            ultimaCompra,
            ultimasCompras,
            todasLasCompras: comprasCliente
        };
    }

    mostrarModalDetalleCliente(cliente, historial, detalle) {
        console.log('Mostrando modal detalle para cliente:', cliente);
        console.log('ID del cliente:', cliente.id_cliente);
        
        // Crear modal dinámico
        const modal = document.createElement('div');
        modal.className = 'modal-detalle-cliente';
        modal.innerHTML = `
            <div class="modal-contenido-detalle">
                <div class="modal-header-detalle">
                    <h3>👤 Detalle del Cliente</h3>
                    <button class="modal-close-detalle">&times;</button>
                </div>
                <div class="modal-body-detalle">
                    <div class="cliente-info-completa">
                        <div class="info-section">
                            <h4>👤 Información Personal</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>Nombre:</strong> ${cliente.nombres} ${cliente.apellidos}
                                </div>
                                <div class="info-item">
                                    <strong>Documento:</strong> ${cliente.tipo_documento} ${cliente.numero_documento}
                                </div>
                                <div class="info-item">
                                    <strong>Email:</strong> ${cliente.correo_electronico}
                                </div>
                                <div class="info-item">
                                    <strong>Teléfono:</strong> ${cliente.telefono_principal}
                                </div>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>📊 Estadísticas de Compras</h4>
                            <div class="stats-compras">
                                <div class="stat-compra">
                                    <span class="stat-numero">${historial.totalCompras}</span>
                                    <span class="stat-label">Compras</span>
                                </div>
                                <div class="stat-compra">
                                    <span class="stat-numero">$${historial.totalGastado.toLocaleString('es-CO')}</span>
                                    <span class="stat-label">Total Gastado</span>
                                </div>
                                <div class="stat-compra">
                                    <span class="stat-numero">$${historial.promedioCompra.toLocaleString('es-CO')}</span>
                                    <span class="stat-label">Promedio</span>
                                </div>
                                <div class="stat-compra">
                                    <span class="stat-numero">${cliente.puntos || 0}</span>
                                    <span class="stat-label">Puntos</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-section">
                            <h4>🛒 Historial de Compras</h4>
                            <div class="historial-compras">
                                ${historial.ultimasCompras.length > 0 ? 
                                    historial.ultimasCompras.map(compra => `
                                        <div class="compra-item">
                                            <div class="compra-fecha">${new Date(compra.fecha).toLocaleDateString()}</div>
                                            <div class="compra-total">$${compra.total.toLocaleString('es-CO')}</div>
                                            <div class="compra-items">${compra.items} productos</div>
                                        </div>
                                    `).join('') :
                                    '<p class="sin-compras">Sin compras registradas</p>'
                                }
                            </div>
                            ${historial.totalCompras > 3 ? 
                                `<button class="btn-ver-historial" data-cliente-id="${cliente.id_cliente}">Ver Historial Completo</button>` : 
                                ''
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer-detalle">
                    <button class="btn btn-primary btn-editar-modal" data-cliente-id="${cliente.id_cliente}">✏️ Editar Cliente</button>
                    <button class="btn btn-secondary modal-close-detalle">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Eventos del modal
        modal.querySelectorAll('.modal-close-detalle').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModalDetalle(modal));
        });

        modal.querySelector('.btn-editar-modal')?.addEventListener('click', (e) => {
            const clienteId = e.target.dataset.clienteId;
            this.cerrarModalDetalle(modal);
            this.editarCliente(clienteId);
        });

        // Evento para ver historial completo
        const btnHistorial = modal.querySelector('.btn-ver-historial');
        if (btnHistorial) {
            btnHistorial.addEventListener('click', (e) => {
                console.log('Click en Ver Historial Completo');
                const clienteId = e.target.getAttribute('data-cliente-id');
                console.log('ID del cliente desde botón:', clienteId);
                this.mostrarHistorialCompleto(clienteId);
            });
        }

        // Evento para editar cliente desde modal
        modal.querySelector('.btn-editar-modal')?.addEventListener('click', (e) => {
            const clienteId = e.target.getAttribute('data-cliente-id');
            this.editarCliente(clienteId);
            this.cerrarModalDetalle(modal);
        });

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.cerrarModalDetalle(modal);
            }
        });
    }

    cerrarModalDetalle(modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    mostrarHistorialCompleto(clienteId) {
        console.log('Mostrando historial completo para cliente:', clienteId);
        
        const cliente = this.clientes[clienteId];
        if (!cliente) {
            console.error('Cliente no encontrado:', clienteId);
            this.mostrarMensaje('Cliente no encontrado', 'error');
            return;
        }
        
        const historial = this.obtenerHistorialCompras(clienteId);
        console.log('Historial obtenido:', historial);
        console.log('Todas las compras:', historial.todasLasCompras);
        
        const modalHistorial = document.createElement('div');
        modalHistorial.className = 'modal-historial-completo';
        modalHistorial.innerHTML = `
            <div class="modal-contenido-historial">
                <div class="modal-header-historial">
                    <h3>🛒 Historial Completo - ${cliente.nombres} ${cliente.apellidos}</h3>
                    <button class="modal-close-historial">&times;</button>
                </div>
                <div class="modal-body-historial">
                    <div class="historial-filtros">
                        <input type="date" id="fecha-desde" placeholder="Desde">
                        <input type="date" id="fecha-hasta" placeholder="Hasta">
                        <button class="btn btn-sm btn-primary" id="filtrar-historial">Filtrar</button>
                    </div>
                    <div class="tabla-historial">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Productos</th>
                                    <th>Total</th>
                                    <th>Método Pago</th>
                                    <th>Descuento</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-historial">
                                ${this.generarFilasHistorial(historial.todasLasCompras)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        console.log('Modal creado, agregando al DOM');
        document.body.appendChild(modalHistorial);

        // Eventos
        modalHistorial.querySelector('.modal-close-historial').addEventListener('click', () => {
            console.log('Cerrando modal historial');
            this.cerrarModalDetalle(modalHistorial);
        });

        modalHistorial.addEventListener('click', (e) => {
            if (e.target === modalHistorial) {
                console.log('Click fuera del modal, cerrando');
                this.cerrarModalDetalle(modalHistorial);
            }
        });
        
        console.log('Modal historial mostrado exitosamente');
    }

    generarFilasHistorial(compras) {
        if (compras.length === 0) {
            return '<tr><td colspan="5" class="sin-datos">No hay compras registradas</td></tr>';
        }

        return compras.map(compra => `
            <tr>
                <td>${new Date(compra.fecha).toLocaleDateString()}</td>
                <td>${compra.items?.length || 0}</td>
                <td>$${(compra.total || 0).toLocaleString('es-CO')}</td>
                <td>${compra.metodoPago || 'N/A'}</td>
                <td>${compra.descuento ? `$${compra.descuento.toLocaleString('es-CO')}` : '$0'}</td>
            </tr>
        `).join('');
    }

    editarCliente(clienteId) {
        console.log('Editando cliente con ID:', clienteId);
        const cliente = this.clientes[clienteId];
        console.log('Cliente encontrado:', cliente);
        
        if (!cliente) {
            console.error('Cliente no encontrado:', clienteId);
            this.mostrarMensaje('Cliente no encontrado', 'error');
            return;
        }

        // Llenar el formulario con los datos del cliente
        this.clienteEditando = clienteId;
        this.llenarFormularioEdicion(cliente);
        
        // Cambiar el título y botón del formulario
        const titulo = document.querySelector('.form-title');
        const btnSubmit = document.querySelector('button[type="submit"]');
        const btnCancelar = document.getElementById('btn-cancelar-edicion');
        
        if (titulo) titulo.textContent = '✏️ Editando Cliente';
        if (btnSubmit) btnSubmit.innerHTML = '<span class="btn-icon">💾</span> Actualizar Cliente';
        if (btnCancelar) {
            btnCancelar.style.display = 'inline-flex';
            btnCancelar.addEventListener('click', () => this.cancelarEdicion());
        }
        
        // Scroll al formulario para que el usuario vea que está en modo edición
        const formulario = document.querySelector('.registration-form');
        if (formulario) {
            formulario.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        this.mostrarMensaje(`✏️ Editando cliente: ${cliente.nombres} ${cliente.apellidos}`, 'info');
    }

    llenarFormularioEdicion(cliente) {
        console.log('Llenando formulario con datos:', cliente);
        
        const campos = {
            'id_cliente': cliente.id_cliente,
            'numero_documento': cliente.numero_documento,
            'tipo_documento': cliente.tipo_documento,
            'nombres': cliente.nombres,
            'apellidos': cliente.apellidos,
            'fecha_nacimiento': cliente.fecha_nacimiento,
            'genero': cliente.genero,
            'correo_electronico': cliente.correo_electronico,
            'telefono_principal': cliente.telefono_principal,
            'telefono_secundario': cliente.telefono_secundario,
            'ciudad': cliente.ciudad,
            'barrio': cliente.barrio,
            'direccion_completa': cliente.direccion_completa,
            'rol_institucion': cliente.rol_institucion,
            'programa_academico': cliente.programa_academico,
            'semestre_actual': cliente.semestre_actual,
            'jornada': cliente.jornada,
            'numero_estudiante': cliente.numero_estudiante,
            'departamento': cliente.departamento,
            'tipo_vinculacion': cliente.tipo_vinculacion
        };

        for (const [campo, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.value = valor || '';
                console.log(`Campo ${campo}: ${valor}`);
            } else {
                console.warn(`Elemento no encontrado: ${campo}`);
            }
        }

        // Manejar checkboxes para descuentos
        if (cliente.descuentos && Array.isArray(cliente.descuentos)) {
            cliente.descuentos.forEach(descuento => {
                const checkbox = document.querySelector(`input[name="descuentos[]"][value="${descuento}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Manejar checkboxes para notificaciones
        if (cliente.notificaciones && Array.isArray(cliente.notificaciones)) {
            cliente.notificaciones.forEach(notificacion => {
                const checkbox = document.querySelector(`input[name="notificaciones[]"][value="${notificacion}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Manejar checkboxes de términos
        const terminosCheckbox = document.getElementById('acepta_terminos');
        if (terminosCheckbox) terminosCheckbox.checked = cliente.acepta_terminos || false;

        const comunicacionesCheckbox = document.getElementById('acepta_comunicaciones');
        if (comunicacionesCheckbox) comunicacionesCheckbox.checked = cliente.acepta_comunicaciones || false;
    }

    eliminarCliente(clienteId) {
        const cliente = this.clientes[clienteId];
        if (!cliente) return;

        const confirmar = confirm(`¿Está seguro de eliminar al cliente "${cliente.nombres} ${cliente.apellidos}"?\n\nEsta acción no se puede deshacer.`);
        
        if (confirmar) {
            delete this.clientes[clienteId];
            this.guardarClientes();
            this.actualizarEstadisticas();
            
            // Actualizar resultados de búsqueda
            const inputBuscar = document.getElementById('buscar-cliente');
            if (inputBuscar?.value) {
                this.buscarClientes(inputBuscar.value);
            }
            
            this.mostrarMensaje(`Cliente "${cliente.nombres} ${cliente.apellidos}" eliminado correctamente`, 'exito');
        }
    }

    limpiarResultadosBusqueda() {
        const container = document.getElementById('resultados-busqueda');
        if (container) {
            container.innerHTML = '';
        }
    }

    obtenerContadorClientes() {
        const contador = localStorage.getItem('contador_clientes');
        return contador ? parseInt(contador) : 1;
    }

    configurarEventos() {
        // Evento principal del formulario
        const formulario = document.getElementById('registro-clientes');
        if (formulario) {
            formulario.addEventListener('submit', (e) => this.procesarRegistro(e));
            formulario.addEventListener('reset', () => this.limpiarFormulario());
        }

        // Eventos de rol en institución
        const rolInstitucion = document.getElementById('rol_institucion');
        if (rolInstitucion) {
            rolInstitucion.addEventListener('change', (e) => this.manejarCambioRol(e.target.value));
        }

        // Eventos de validación en tiempo real
        const numeroDocumento = document.getElementById('numero_documento');
        if (numeroDocumento) {
            numeroDocumento.addEventListener('blur', (e) => this.validarDocumentoUnico(e.target.value));
            numeroDocumento.addEventListener('input', (e) => this.formatearNumeroDocumento(e));
        }

        const correoElectronico = document.getElementById('correo_electronico');
        if (correoElectronico) {
            correoElectronico.addEventListener('blur', (e) => this.validarCorreoUnico(e.target.value));
        }

        const telefono = document.getElementById('telefono_principal');
        if (telefono) {
            telefono.addEventListener('input', (e) => this.formatearTelefono(e));
        }

        const telefonoSecundario = document.getElementById('telefono_secundario');
        if (telefonoSecundario) {
            telefonoSecundario.addEventListener('input', (e) => this.formatearTelefono(e));
        }

        // Calcular edad automáticamente
        const fechaNacimiento = document.getElementById('fecha_nacimiento');
        if (fechaNacimiento) {
            fechaNacimiento.addEventListener('change', (e) => this.calcularEdad(e.target.value));
        }

        // Manejar descuentos automáticos basados en el rol
        const descuentos = document.querySelectorAll('input[name="descuentos[]"]');
        descuentos.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.manejarDescuentos());
        });
    }

    configurarValidaciones() {
        // Validación de fecha de nacimiento (mayor de edad)
        const fechaNacimiento = document.getElementById('fecha_nacimiento');
        if (fechaNacimiento) {
            const fechaMinima = new Date();
            fechaMinima.setFullYear(fechaMinima.getFullYear() - 100);
            fechaNacimiento.setAttribute('min', this.formatearFecha(fechaMinima));
            
            const fechaMaxima = new Date();
            fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 16);
            fechaNacimiento.setAttribute('max', this.formatearFecha(fechaMaxima));
        }
    }

    generarIdCliente() {
        const idCliente = `CLI${this.contadorClientes.toString().padStart(3, '0')}`;
        const inputId = document.getElementById('id_cliente');
        if (inputId) {
            inputId.value = idCliente;
        }
        return idCliente;
    }

    manejarCambioRol(rol) {
        // Ocultar todos los campos condicionales
        const camposEstudiante = document.getElementById('campos-estudiante');
        const camposProfesor = document.getElementById('campos-profesor');

        if (camposEstudiante) camposEstudiante.style.display = 'none';
        if (camposProfesor) camposProfesor.style.display = 'none';

        // Limpiar validaciones requeridas
        this.limpiarValidacionesCondicionales();

        // Mostrar campos según el rol seleccionado
        switch (rol) {
            case 'estudiante':
                if (camposEstudiante) {
                    camposEstudiante.style.display = 'block';
                    this.activarValidacionesEstudiante();
                }
                this.marcarDescuentoAutomatico('estudiante');
                break;
            case 'profesor':
                if (camposProfesor) {
                    camposProfesor.style.display = 'block';
                    this.activarValidacionesProfesor();
                }
                this.marcarDescuentoAutomatico('profesor');
                break;
            case 'administrativo':
                this.marcarDescuentoAutomatico('empleado');
                break;
            default:
                this.limpiarDescuentosAutomaticos();
        }
    }

    limpiarValidacionesCondicionales() {
        const campos = ['programa_academico', 'semestre_actual', 'jornada', 'numero_estudiante', 'departamento', 'tipo_vinculacion'];
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.removeAttribute('required');
                elemento.value = '';
            }
        });
    }

    activarValidacionesEstudiante() {
        const camposRequeridos = ['programa_academico', 'semestre_actual', 'jornada'];
        camposRequeridos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.setAttribute('required', '');
            }
        });
    }

    activarValidacionesProfesor() {
        const camposRequeridos = ['departamento', 'tipo_vinculacion'];
        camposRequeridos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.setAttribute('required', '');
            }
        });
    }

    marcarDescuentoAutomatico(tipoDescuento) {
        this.limpiarDescuentosAutomaticos();
        const checkbox = document.querySelector(`input[name="descuentos[]"][value="${tipoDescuento}"]`);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.disabled = true;
        }
    }

    limpiarDescuentosAutomaticos() {
        const descuentos = document.querySelectorAll('input[name="descuentos[]"]');
        descuentos.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = false;
        });
    }

    formatearNumeroDocumento(evento) {
        let valor = evento.target.value.replace(/\D/g, '');
        evento.target.value = valor;
    }

    formatearTelefono(evento) {
        let valor = evento.target.value.replace(/\D/g, '');
        
        // Limitar a 10 dígitos para móviles o 7 para fijos
        if (valor.length > 10) {
            valor = valor.substring(0, 10);
        }
        
        evento.target.value = valor;
    }

    async validarDocumentoUnico(numeroDocumento) {
        if (!numeroDocumento.trim()) return;

        const documentoExiste = Object.values(this.clientes).some(cliente => 
            cliente.numero_documento === numeroDocumento
        );

        const inputDocumento = document.getElementById('numero_documento');
        if (documentoExiste) {
            this.mostrarError(inputDocumento, 'Este número de documento ya está registrado');
            return false;
        } else {
            this.limpiarError(inputDocumento);
            return true;
        }
    }

    async validarCorreoUnico(correo) {
        if (!correo.trim()) return;

        const correoExiste = Object.values(this.clientes).some(cliente => 
            cliente.correo_electronico === correo.toLowerCase()
        );

        const inputCorreo = document.getElementById('correo_electronico');
        if (correoExiste) {
            this.mostrarError(inputCorreo, 'Este correo electrónico ya está registrado');
            return false;
        } else {
            this.limpiarError(inputCorreo);
            return true;
        }
    }

    calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return;

        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        
        const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        // Mostrar la edad calculada
        const labelFecha = document.querySelector('label[for="fecha_nacimiento"]');
        if (labelFecha) {
            labelFecha.textContent = `Fecha de Nacimiento (${edad} años):`;
        }

        // Validar edad mínima
        if (edad < 16) {
            this.mostrarError(document.getElementById('fecha_nacimiento'), 'Debe ser mayor de 16 años para registrarse');
            return false;
        } else {
            this.limpiarError(document.getElementById('fecha_nacimiento'));
            return true;
        }
    }

    manejarDescuentos() {
        const descuentosSeleccionados = Array.from(document.querySelectorAll('input[name="descuentos[]"]:checked'))
            .map(checkbox => checkbox.value);

        // Mostrar resumen de descuentos
        this.mostrarResumenDescuentos(descuentosSeleccionados);
    }

    mostrarResumenDescuentos(descuentos) {
        let resumenContainer = document.getElementById('resumen-descuentos');
        
        if (!resumenContainer) {
            resumenContainer = document.createElement('div');
            resumenContainer.id = 'resumen-descuentos';
            resumenContainer.className = 'resumen-descuentos';
            
            const fieldsetBeneficios = document.querySelector('fieldset legend').parentNode;
            if (fieldsetBeneficios) {
                fieldsetBeneficios.appendChild(resumenContainer);
            }
        }

        if (descuentos.length === 0) {
            resumenContainer.innerHTML = '';
            return;
        }

        const porcentajes = {
            'estudiante': 10,
            'profesor': 15,
            'empleado': 20
        };

        const nombres = {
            'estudiante': 'Estudiante',
            'profesor': 'Profesor',
            'empleado': 'Empleado'
        };

        const descuentoMaximo = Math.max(...descuentos.map(d => porcentajes[d] || 0));
        
        resumenContainer.innerHTML = `
            <div class="descuento-info">
                <h5>📊 Resumen de Beneficios</h5>
                <p><strong>Descuento aplicable:</strong> ${descuentoMaximo}% (${nombres[descuentos.find(d => porcentajes[d] === descuentoMaximo)]})</p>
                <small>Se aplicará el descuento de mayor valor</small>
            </div>
        `;
    }

    async procesarRegistro(evento) {
        evento.preventDefault();

        try {
            // Validaciones finales
            if (!await this.validarFormularioCompleto()) {
                return;
            }

            // Recopilar datos del formulario
            const datosCliente = this.recopilarDatosFormulario();

            if (this.clienteEditando) {
                // Modo edición
                await this.actualizarCliente(this.clienteEditando, datosCliente);
            } else {
                // Modo creación
                // Validar unicidad solo para nuevos clientes
                if (!await this.validarDocumentoUnico(datosCliente.numero_documento) ||
                    !await this.validarCorreoUnico(datosCliente.correo_electronico)) {
                    return;
                }

                // Registrar nuevo cliente
                const clienteRegistrado = await this.registrarCliente(datosCliente);

                if (clienteRegistrado) {
                    this.mostrarExitoRegistro(clienteRegistrado);
                }
            }

            this.limpiarFormulario();
            this.cancelarEdicion();
            this.generarIdCliente();
            this.actualizarEstadisticas();

        } catch (error) {
            console.error('Error en el registro:', error);
            this.mostrarMensaje('Error interno. Por favor, intente nuevamente.', 'error');
        }
    }

    async actualizarCliente(clienteId, datosCliente) {
        const clienteExistente = this.clientes[clienteId];
        if (!clienteExistente) {
            throw new Error('Cliente no encontrado');
        }

        // Validar unicidad solo si cambió el documento o email
        if (datosCliente.numero_documento !== clienteExistente.numero_documento) {
            if (!await this.validarDocumentoUnico(datosCliente.numero_documento)) {
                return false;
            }
        }

        if (datosCliente.correo_electronico !== clienteExistente.correo_electronico) {
            if (!await this.validarCorreoUnico(datosCliente.correo_electronico)) {
                return false;
            }
        }

        // Actualizar datos manteniendo información existente
        const clienteActualizado = {
            ...clienteExistente,
            numero_documento: datosCliente.numero_documento,
            tipo_documento: datosCliente.tipo_documento,
            nombres: datosCliente.nombres,
            apellidos: datosCliente.apellidos,
            fecha_nacimiento: datosCliente.fecha_nacimiento,
            correo_electronico: datosCliente.correo_electronico,
            telefono_principal: datosCliente.telefono_principal,
            rol_institucion: datosCliente.rol_institucion,
            programa_academico: datosCliente.programa_academico || '',
            semestre_actual: datosCliente.semestre_actual || '',
            fecha_actualizacion: new Date().toISOString()
        };

        this.clientes[clienteId] = clienteActualizado;
        this.guardarClientes();

        this.mostrarMensaje(`Cliente "${clienteActualizado.nombres} ${clienteActualizado.apellidos}" actualizado correctamente`, 'exito');
        
        // Actualizar resultados de búsqueda si están visibles
        const inputBuscar = document.getElementById('buscar-cliente');
        if (inputBuscar?.value) {
            this.buscarClientes(inputBuscar.value);
        }

        return true;
    }

    cancelarEdicion() {
        this.clienteEditando = null;
        
        // Restaurar título y botón del formulario
        const titulo = document.querySelector('.form-title');
        const btnSubmit = document.querySelector('button[type="submit"]');
        const btnCancelar = document.getElementById('btn-cancelar-edicion');
        
        if (titulo) titulo.textContent = '📝 Registro de Cliente';
        if (btnSubmit) btnSubmit.innerHTML = '<span class="btn-icon">✅</span> Registrar Cliente';
        if (btnCancelar) btnCancelar.style.display = 'none';
        
        // Limpiar formulario
        this.limpiarFormulario();
        this.generarIdCliente();
        
        this.mostrarMensaje('Edición cancelada', 'info');
    }

    async validarFormularioCompleto() {
        let esValido = true;

        // Validar campos requeridos
        const camposRequeridos = document.querySelectorAll('[required]');
        camposRequeridos.forEach(campo => {
            if (!campo.value.trim()) {
                this.mostrarError(campo, 'Este campo es requerido');
                esValido = false;
            } else {
                this.limpiarError(campo);
            }
        });

        // Validar términos y condiciones
        const aceptaTerminos = document.querySelector('input[name="acepta_terminos"]');
        if (!aceptaTerminos || !aceptaTerminos.checked) {
            this.mostrarMensaje('Debe aceptar los términos y condiciones', 'error');
            esValido = false;
        }

        // Validar formato de correo
        const correo = document.getElementById('correo_electronico').value;
        if (correo && !this.validarFormatoCorreo(correo)) {
            this.mostrarError(document.getElementById('correo_electronico'), 'Formato de correo inválido');
            esValido = false;
        }

        // Validar formato de teléfono
        const telefono = document.getElementById('telefono_principal').value;
        if (telefono && !this.validarFormatoTelefono(telefono)) {
            this.mostrarError(document.getElementById('telefono_principal'), 'Formato de teléfono inválido');
            esValido = false;
        }

        return esValido;
    }

    recopilarDatosFormulario() {
        const formulario = document.getElementById('registro-clientes');
        const formData = new FormData(formulario);
        
        const datos = {
            id_cliente: document.getElementById('id_cliente').value,
            nombres: formData.get('nombres'),
            apellidos: formData.get('apellidos'),
            tipo_documento: formData.get('tipo_documento'),
            numero_documento: formData.get('numero_documento'),
            fecha_nacimiento: formData.get('fecha_nacimiento'),
            genero: formData.get('genero'),
            telefono_principal: formData.get('telefono_principal'),
            telefono_secundario: formData.get('telefono_secundario') || null,
            correo_electronico: formData.get('correo_electronico').toLowerCase(),
            ciudad: formData.get('ciudad'),
            barrio: formData.get('barrio') || null,
            direccion_completa: formData.get('direccion_completa') || null,
            rol_institucion: formData.get('rol_institucion'),
            programa_academico: formData.get('programa_academico') || null,
            semestre_actual: formData.get('semestre_actual') || null,
            jornada: formData.get('jornada') || null,
            numero_estudiante: formData.get('numero_estudiante') || null,
            departamento: formData.get('departamento') || null,
            tipo_vinculacion: formData.get('tipo_vinculacion') || null,
            descuentos: formData.getAll('descuentos[]'),
            notificaciones: formData.getAll('notificaciones[]'),
            acepta_terminos: formData.get('acepta_terminos') === 'on',
            acepta_comunicaciones: formData.get('acepta_comunicaciones') === 'on',
            fecha_registro: new Date().toISOString(),
            estado: 'activo',
            activo: true,
            esVip: false
        };

        return datos;
    }

    async registrarCliente(datosCliente) {
        try {
            // Simular proceso de registro (en producción sería una llamada a la API)
            await this.simularProcesamiento();

            // Guardar cliente
            this.clientes[datosCliente.id_cliente] = datosCliente;
            this.contadorClientes++;
            this.guardarClientes();

            return datosCliente;

        } catch (error) {
            throw new Error('Error al registrar cliente: ' + error.message);
        }
    }

    async simularProcesamiento() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500); // Simular delay de procesamiento
        });
    }

    mostrarExitoRegistro(cliente) {
        const modalExito = this.crearModalExito(cliente);
        document.body.appendChild(modalExito);
        modalExito.classList.add('show');
    }

    crearModalExito(cliente) {
        const modal = document.createElement('div');
        modal.className = 'modal-exito-registro';
        
        const descuentosTexto = cliente.descuentos.length > 0 
            ? cliente.descuentos.map(d => {
                const porcentajes = { 'estudiante': 10, 'profesor': 15, 'empleado': 20 };
                return `${d} (${porcentajes[d]}%)`;
              }).join(', ')
            : 'Ninguno';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header exito">
                    <h3>✅ ¡Registro Exitoso!</h3>
                    <button class="btn-cerrar-modal">✕</button>
                </div>
                
                <div class="modal-body">
                    <div class="cliente-info">
                        <h4>Bienvenido/a, ${cliente.nombres} ${cliente.apellidos}</h4>
                        <p><strong>ID de Cliente:</strong> ${cliente.id_cliente}</p>
                        <p><strong>Correo:</strong> ${cliente.correo_electronico}</p>
                        <p><strong>Rol:</strong> ${this.obtenerNombreRol(cliente.rol_institucion)}</p>
                        <p><strong>Descuentos aplicables:</strong> ${descuentosTexto}</p>
                    </div>
                    
                    <div class="siguiente-pasos">
                        <h5>📋 Próximos pasos:</h5>
                        <ul>
                            <li>Guarde su ID de cliente: <strong>${cliente.id_cliente}</strong></li>
                            <li>Revise su correo para confirmación</li>
                            <li>Presente su carnet en cafetería para activar descuentos</li>
                            <li>¡Disfrute de nuestros productos!</li>
                        </ul>
                    </div>
                    
                    <div class="acciones-modal">
                        <button class="btn-primary" onclick="this.closest('.modal-exito-registro').remove()">
                            🏠 Entendido
                        </button>
                        <a href="compra.html" class="btn-secondary">
                            🛒 Ir a Comprar
                        </a>
                    </div>
                </div>
            </div>
            <div class="modal-overlay active"></div>
        `;

        // Eventos del modal
        const btnCerrar = modal.querySelector('.btn-cerrar-modal');
        const overlay = modal.querySelector('.modal-overlay');

        btnCerrar.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', () => modal.remove());

        return modal;
    }

    limpiarFormulario() {
        const formulario = document.getElementById('registro-clientes');
        if (formulario) {
            formulario.reset();
        }

        // Limpiar campos condicionales
        const camposCondicionales = document.querySelectorAll('.campos-condicionales');
        camposCondicionales.forEach(campo => {
            campo.style.display = 'none';
        });

        // Limpiar errores
        this.limpiarTodosLosErrores();

        // Limpiar resumen de descuentos
        const resumenDescuentos = document.getElementById('resumen-descuentos');
        if (resumenDescuentos) {
            resumenDescuentos.innerHTML = '';
        }

        // Restablecer etiqueta de fecha de nacimiento
        const labelFecha = document.querySelector('label[for="fecha_nacimiento"]');
        if (labelFecha) {
            labelFecha.textContent = 'Fecha de Nacimiento:';
        }
    }

    actualizarEstadisticas() {
        const stats = this.calcularEstadisticas();
        
        const containers = {
            'total-clientes': stats.total,
            'clientes-estudiantes': stats.estudiantes,
            'clientes-profesores': stats.profesores,
            'clientes-empleados': stats.empleados
        };

        for (const [id, valor] of Object.entries(containers)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = valor;
            }
        }
    }

    calcularEstadisticas() {
        const clientes = Object.values(this.clientes);
        
        return {
            total: clientes.length,
            estudiantes: clientes.filter(c => c.rol_institucion === 'estudiante').length,
            profesores: clientes.filter(c => c.rol_institucion === 'profesor').length,
            empleados: clientes.filter(c => c.rol_institucion === 'administrativo').length
        };
    }

    // Métodos de utilidad y validación
    validarFormatoCorreo(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    }

    validarFormatoTelefono(telefono) {
        const regex = /^[3][0-9]{9}$|^[6][0-9]{6}$/; // Móvil o fijo colombiano
        return regex.test(telefono);
    }

    formatearFecha(fecha) {
        return fecha.toISOString().split('T')[0];
    }

    obtenerNombreRol(rol) {
        const nombres = {
            'estudiante': 'Estudiante',
            'profesor': 'Profesor',
            'administrativo': 'Empleado Administrativo'
        };
        return nombres[rol] || rol;
    }

    mostrarError(elemento, mensaje) {
        this.limpiarError(elemento);
        
        elemento.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        
        elemento.parentNode.appendChild(errorDiv);
    }

    limpiarError(elemento) {
        elemento.classList.remove('error');
        
        const errorExistente = elemento.parentNode.querySelector('.error-message');
        if (errorExistente) {
            errorExistente.remove();
        }
    }

    limpiarTodosLosErrores() {
        const elementosConError = document.querySelectorAll('.error');
        elementosConError.forEach(elemento => {
            this.limpiarError(elemento);
        });
    }

    mostrarMensaje(mensaje, tipo) {
        let container = document.getElementById('mensaje-sistema');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'mensaje-sistema';
            container.className = 'mensaje-sistema';
            document.body.appendChild(container);
        }
        
        container.innerHTML = `<div class="mensaje-${tipo}">${mensaje}</div>`;
        container.className = `mensaje-sistema ${tipo}`;
        
        setTimeout(() => {
            container.innerHTML = '';
            container.className = 'mensaje-sistema';
        }, 5000);
    }

    // Métodos públicos para integración
    obtenerCliente(idCliente) {
        return this.clientes[idCliente];
    }

    buscarClientePorDocumento(numeroDocumento) {
        return Object.values(this.clientes).find(cliente => 
            cliente.numero_documento === numeroDocumento
        );
    }

    buscarClientePorCorreo(correo) {
        return Object.values(this.clientes).find(cliente => 
            cliente.correo_electronico === correo.toLowerCase()
        );
    }

    obtenerClientesPorRol(rol) {
        return Object.values(this.clientes).filter(cliente => 
            cliente.rol_institucion === rol
        );
    }

    // Función para debugging - mostrar todos los clientes
    debug_mostrarClientes() {
        console.log('=== CLIENTES REGISTRADOS ===');
        console.log('Total de clientes:', Object.keys(this.clientes).length);
        console.log('Clientes:', this.clientes);
        return this.clientes;
    }

    // Función para debugging - limpiar datos
    debug_limpiarClientes() {
        this.clientes = {};
        this.contadorClientes = 0;
        this.guardarClientes();
        console.log('Todos los clientes han sido eliminados');
    }

    // Función para generar datos de prueba de ventas
    debug_generarVentasPrueba() {
        // Obtener el primer cliente disponible
        const clienteIds = Object.keys(this.clientes);
        if (clienteIds.length === 0) {
            this.mostrarMensaje('No hay clientes registrados. Registre un cliente primero.', 'error');
            return;
        }
        
        const clienteId = clienteIds[0]; // Usar el primer cliente disponible
        console.log('Generando ventas para cliente:', clienteId);
        
        const ventasPrueba = [
            {
                id: 'V001',
                fecha: '2025-10-16T10:30:00',
                idCliente: clienteId,
                items: [
                    { nombre: 'Café Americano', precio: 3500, cantidad: 2 },
                    { nombre: 'Croissant', precio: 2500, cantidad: 1 }
                ],
                total: 9500,
                metodoPago: 'Efectivo',
                descuento: 0
            },
            {
                id: 'V002',
                fecha: '2025-10-15T14:15:00',
                idCliente: clienteId,
                items: [
                    { nombre: 'Cappuccino', precio: 4000, cantidad: 1 },
                    { nombre: 'Sandwich', precio: 8500, cantidad: 1 }
                ],
                total: 12500,
                metodoPago: 'Tarjeta',
                descuento: 500
            },
            {
                id: 'V003',
                fecha: '2025-10-15T09:20:00',
                idCliente: clienteId,
                items: [
                    { nombre: 'Latte', precio: 4500, cantidad: 1 },
                    { nombre: 'Muffin', precio: 3000, cantidad: 2 }
                ],
                total: 10500,
                metodoPago: 'Efectivo',
                descuento: 0
            },
            {
                id: 'V004',
                fecha: '2025-10-14T16:45:00',
                idCliente: clienteId,
                items: [
                    { nombre: 'Expresso', precio: 3000, cantidad: 3 },
                    { nombre: 'Galletas', precio: 1500, cantidad: 4 }
                ],
                total: 15000,
                metodoPago: 'Transferencia',
                descuento: 1000
            },
            {
                id: 'V005',
                fecha: '2025-10-13T11:30:00',
                idCliente: clienteId,
                items: [
                    { nombre: 'Mocha', precio: 5000, cantidad: 1 },
                    { nombre: 'Brownie', precio: 4000, cantidad: 1 }
                ],
                total: 9000,
                metodoPago: 'Efectivo',
                descuento: 0
            }
        ];

        localStorage.setItem('ventas', JSON.stringify(ventasPrueba));
        console.log('Datos de ventas de prueba generados:', ventasPrueba);
        this.mostrarMensaje(`Datos de ventas de prueba generados para cliente ${clienteId}`, 'exito');
    }

    actualizarCliente(idCliente, datosActualizados) {
        if (this.clientes[idCliente]) {
            this.clientes[idCliente] = { ...this.clientes[idCliente], ...datosActualizados };
            this.guardarClientes();
            return true;
        }
        return false;
    }

    obtenerDescuentoAplicable(idCliente) {
        const cliente = this.clientes[idCliente];
        if (!cliente) return 0;

        const porcentajes = {
            'estudiante': 10,
            'profesor': 15,
            'empleado': 20
        };

        return Math.max(...cliente.descuentos.map(d => porcentajes[d] || 0));
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('registro-clientes')) {
        window.sistemaRegistro = new SistemaRegistro();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaRegistro;
}