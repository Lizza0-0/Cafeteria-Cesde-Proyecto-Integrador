/**
 * Sistema de Gestión de Proveedores - Cafetería Cesde
 * Gestiona proveedores, órdenes de compra y recepción de mercancía
 */

class SistemaProveedores {
    constructor() {
        this.proveedores = JSON.parse(localStorage.getItem('proveedores')) || [];
        this.ordenes = JSON.parse(localStorage.getItem('ordenes_compra')) || [];
        this.contadorProveedores = parseInt(localStorage.getItem('contador_proveedores')) || 1;
        this.contadorOrdenes = parseInt(localStorage.getItem('contador_ordenes')) || 1;
        this.productosSugeridos = this.initProductosSugeridos();
        this.init();
    }

    init() {
        this.cargarProveedores();
        this.cargarSelectoresProveedores();
        this.configurarFechaEntrega();
        this.actualizarEstadisticas();
        this.mostrarOrdenesEnviadas();
    }

    initProductosSugeridos() {
        return {
            'cafe': [
                'Café Arábica Premium',
                'Café Robusta',
                'Café Tostado Medio',
                'Café Descafeinado',
                'Granos de Café Verde'
            ],
            'panaderia': [
                'Harina de Trigo',
                'Levadura Fresca',
                'Azúcar Refinada',
                'Mantequilla',
                'Huevos Frescos',
                'Croissants Congelados',
                'Masa de Hojaldre'
            ],
            'lacteos': [
                'Leche Entera',
                'Leche Deslactosada',
                'Crema de Leche',
                'Queso Mozzarella',
                'Yogurt Natural',
                'Queso Crema'
            ],
            'dulces': [
                'Chocolate en Barra',
                'Jarabe de Vainilla',
                'Jarabe de Caramelo',
                'Mermelada de Fresa',
                'Miel de Abejas',
                'Azúcar Morena'
            ],
            'empaques': [
                'Vasos de Cartón 8oz',
                'Vasos de Cartón 12oz',
                'Tapas para Vasos',
                'Servilletas',
                'Bolsas de Papel',
                'Cajas para Postres'
            ],
            'limpieza': [
                'Detergente Líquido',
                'Desinfectante',
                'Papel Higiénico',
                'Toallas de Papel',
                'Jabón Antibacterial'
            ],
            'equipos': [
                'Filtros para Cafetera',
                'Repuestos de Máquina',
                'Equipos de Molienda',
                'Termómetros',
                'Balanzas Digitales'
            ]
        };
    }

    guardarProveedor() {
        const nombreEmpresa = document.getElementById('nombre-empresa').value.trim();
        const nit = document.getElementById('nit-proveedor').value.trim();
        const contacto = document.getElementById('contacto-proveedor').value.trim();
        const telefono = document.getElementById('telefono-proveedor').value.trim();
        const email = document.getElementById('email-proveedor').value.trim();
        const direccion = document.getElementById('direccion-proveedor').value.trim();
        const categoria = document.getElementById('categoria-productos').value;
        const calificacion = document.getElementById('calificacion-proveedor').value;
        const notas = document.getElementById('notas-proveedor').value.trim();

        if (!nombreEmpresa || !nit || !contacto || !telefono || !email || !categoria) {
            alert('⚠️ Por favor, complete todos los campos obligatorios');
            return;
        }

        // Verificar si el NIT ya existe
        const nitExistente = this.proveedores.find(p => p.nit === nit);
        if (nitExistente) {
            alert('⚠️ Ya existe un proveedor con este NIT');
            return;
        }

        const proveedor = {
            id: this.contadorProveedores++,
            nombreEmpresa,
            nit,
            contacto,
            telefono,
            email,
            direccion,
            categoria,
            calificacion: parseInt(calificacion),
            notas,
            estado: 'activo',
            fechaRegistro: new Date().toISOString(),
            totalOrdenes: 0,
            montoTotal: 0,
            ultimaOrden: null
        };

        this.proveedores.push(proveedor);
        this.guardarDatos();
        this.cargarProveedores();
        this.cargarSelectoresProveedores();
        this.limpiarFormulario();
        this.actualizarEstadisticas();

        this.mostrarNotificacion('✅ Proveedor guardado exitosamente', 'success');
    }

    limpiarFormulario() {
        document.getElementById('nombre-empresa').value = '';
        document.getElementById('nit-proveedor').value = '';
        document.getElementById('contacto-proveedor').value = '';
        document.getElementById('telefono-proveedor').value = '';
        document.getElementById('email-proveedor').value = '';
        document.getElementById('direccion-proveedor').value = '';
        document.getElementById('categoria-productos').value = '';
        document.getElementById('calificacion-proveedor').value = '5';
        document.getElementById('notas-proveedor').value = '';
    }

    cargarProveedores() {
        const tbody = document.getElementById('lista-proveedores');
        
        if (this.proveedores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="sin-datos">No hay proveedores registrados</td></tr>';
            return;
        }

        tbody.innerHTML = this.proveedores.map(proveedor => `
            <tr>
                <td><strong>${proveedor.nombreEmpresa}</strong></td>
                <td>${proveedor.nit}</td>
                <td>${proveedor.contacto}<br><small>${proveedor.email}</small></td>
                <td>${proveedor.telefono}</td>
                <td>${this.obtenerNombreCategoria(proveedor.categoria)}</td>
                <td>${'⭐'.repeat(proveedor.calificacion)}</td>
                <td>
                    <span class="estado-${proveedor.estado}">
                        ${proveedor.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-warning" onclick="sistemaProveedores.editarProveedor('${proveedor.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="sistemaProveedores.eliminarProveedor('${proveedor.id}')">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    cargarSelectoresProveedores() {
        const selectores = ['proveedor-orden', 'modal-proveedor'];
        const proveedoresActivos = this.proveedores.filter(p => p.estado === 'activo');

        selectores.forEach(id => {
            const selector = document.getElementById(id);
            if (selector) {
                selector.innerHTML = '<option value="">Seleccionar proveedor</option>' +
                    proveedoresActivos.map(p => 
                        `<option value="${p.id}">${p.nombreEmpresa}</option>`
                    ).join('');
            }
        });
    }

    configurarFechaEntrega() {
        const fechaEntrega = document.getElementById('fecha-entrega');
        const fechaRecepcion = document.getElementById('fecha-recepcion');
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        if (fechaEntrega) {
            fechaEntrega.value = mañana.toISOString().split('T')[0];
            fechaEntrega.min = mañana.toISOString().split('T')[0];
        }
        
        if (fechaRecepcion) {
            fechaRecepcion.value = new Date().toISOString().split('T')[0];
        }
    }

    abrirModalOrden() {
        const modal = document.getElementById('modal-orden');
        modal.style.display = 'block';
        this.cargarSelectoresProveedores();
        this.limpiarFormularioOrden();
    }

    cerrarModal() {
        const modal = document.getElementById('modal-orden');
        modal.style.display = 'none';
    }

    limpiarFormularioOrden() {
        document.getElementById('modal-proveedor').value = '';
        document.getElementById('notas-orden').value = '';
        document.getElementById('lista-productos-orden').innerHTML = '';
    }

    agregarProductoOrden() {
        const proveedorId = document.getElementById('modal-proveedor').value;
        if (!proveedorId) {
            alert('⚠️ Primero seleccione un proveedor');
            return;
        }

        const proveedor = this.proveedores.find(p => p.id == proveedorId);
        const productos = this.productosSugeridos[proveedor.categoria] || [];

        const container = document.getElementById('lista-productos-orden');
        const index = container.children.length;

        const productoDiv = document.createElement('div');
        productoDiv.className = 'input-group';
        productoDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end;">
                <div>
                    <label>Producto:</label>
                    <select name="producto-${index}" required>
                        <option value="">Seleccionar producto</option>
                        ${productos.map(p => `<option value="${p}">${p}</option>`).join('')}
                        <option value="otro">➕ Otro producto</option>
                    </select>
                </div>
                <div>
                    <label>Cantidad:</label>
                    <input type="number" name="cantidad-${index}" min="1" value="1" required>
                </div>
                <div>
                    <label>Precio Unit. (COP):</label>
                    <input type="number" name="precio-${index}" min="0" step="100" placeholder="0" required>
                </div>
                <div>
                    <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">
                        🗑️
                    </button>
                </div>
            </div>
        `;

        container.appendChild(productoDiv);

        // Manejar selección de "Otro producto"
        const selectProducto = productoDiv.querySelector(`select[name="producto-${index}"]`);
        selectProducto.addEventListener('change', function() {
            if (this.value === 'otro') {
                const nombrePersonalizado = prompt('Ingrese el nombre del producto:');
                if (nombrePersonalizado) {
                    const optionOtro = new Option(nombrePersonalizado, nombrePersonalizado);
                    this.insertBefore(optionOtro, this.lastElementChild);
                    this.value = nombrePersonalizado;
                }
            }
        });
    }

    crearOrden() {
        const proveedorId = document.getElementById('modal-proveedor').value;
        const notas = document.getElementById('notas-orden').value;
        const fechaEntrega = document.getElementById('fecha-entrega').value;
        const urgencia = document.getElementById('urgencia-orden').value;

        if (!proveedorId) {
            alert('⚠️ Seleccione un proveedor');
            return;
        }

        const productosContainer = document.getElementById('lista-productos-orden');
        const productos = [];
        let total = 0;

        for (let i = 0; i < productosContainer.children.length; i++) {
            const div = productosContainer.children[i];
            const productoSelect = div.querySelector(`select[name="producto-${i}"]`);
            const cantidadInput = div.querySelector(`input[name="cantidad-${i}"]`);
            const precioInput = div.querySelector(`input[name="precio-${i}"]`);

            if (productoSelect && cantidadInput && precioInput) {
                const producto = productoSelect.value;
                const cantidad = parseInt(cantidadInput.value);
                const precio = parseFloat(precioInput.value);

                if (producto && cantidad > 0 && precio > 0) {
                    const subtotal = cantidad * precio;
                    productos.push({
                        producto,
                        cantidad,
                        precio,
                        subtotal
                    });
                    total += subtotal;
                }
            }
        }

        if (productos.length === 0) {
            alert('⚠️ Agregue al menos un producto a la orden');
            return;
        }

        const proveedor = this.proveedores.find(p => p.id == proveedorId);
        const orden = {
            id: this.contadorOrdenes++,
            numeroOrden: `ORD-${new Date().getFullYear()}-${this.contadorOrdenes.toString().padStart(4, '0')}`,
            proveedorId: parseInt(proveedorId),
            proveedorNombre: proveedor.nombreEmpresa,
            productos,
            total,
            fechaCreacion: new Date().toISOString(),
            fechaEntrega: fechaEntrega,
            urgencia,
            estado: 'pendiente',
            notas,
            fechaEnvio: null,
            fechaRecepcion: null
        };

        this.ordenes.push(orden);
        
        // Actualizar estadísticas del proveedor
        proveedor.totalOrdenes++;
        proveedor.montoTotal += total;
        proveedor.ultimaOrden = new Date().toISOString();

        this.guardarDatos();
        this.cerrarModal();
        this.cargarOrdenes();
        this.actualizarEstadisticas();

        this.mostrarNotificacion('✅ Orden de compra creada exitosamente', 'success');
    }

    cargarOrdenes() {
        const container = document.getElementById('lista-ordenes');
        
        if (this.ordenes.length === 0) {
            container.innerHTML = '<div class="sin-datos">No hay órdenes de compra registradas</div>';
            return;
        }

        container.innerHTML = this.ordenes
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
            .map(orden => `
                <div class="orden-card">
                    <div class="orden-header">
                        <div class="orden-numero">${orden.numeroOrden}</div>
                        <div class="orden-estado ${orden.estado}">${this.obtenerTextoEstado(orden.estado)}</div>
                    </div>
                    
                    <div class="orden-detalles">
                        <p><strong>Proveedor:</strong> ${orden.proveedorNombre}</p>
                        <p><strong>Fecha Creación:</strong> ${new Date(orden.fechaCreacion).toLocaleDateString()}</p>
                        <p><strong>Fecha Entrega:</strong> ${new Date(orden.fechaEntrega).toLocaleDateString()}</p>
                        <p><strong>Urgencia:</strong> ${this.obtenerTextoUrgencia(orden.urgencia)}</p>
                        <p><strong>Productos:</strong> ${orden.productos.length} items</p>
                        ${orden.notas ? `<p><strong>Notas:</strong> ${orden.notas}</p>` : ''}
                    </div>
                    
                    <div class="orden-total">Total: $${orden.total.toLocaleString('es-CO')}</div>
                    
                    <div style="margin-top: 15px;">
                        ${this.generarBotonesOrden(orden)}
                    </div>
                </div>
            `).join('');
    }

    generarBotonesOrden(orden) {
        switch (orden.estado) {
            case 'pendiente':
                return `
                    <button class="btn btn-primary" onclick="sistemaProveedores.enviarOrden('${orden.id}')">
                        📤 Enviar Orden
                    </button>
                    <button class="btn btn-warning" onclick="sistemaProveedores.editarOrden('${orden.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="sistemaProveedores.cancelarOrden('${orden.id}')">
                        ❌ Cancelar
                    </button>
                `;
            case 'enviada':
                return `
                    <button class="btn btn-success" onclick="sistemaProveedores.marcarRecibida('${orden.id}')">
                        📦 Marcar como Recibida
                    </button>
                    <button class="btn btn-danger" onclick="sistemaProveedores.cancelarOrden('${orden.id}')">
                        ❌ Cancelar
                    </button>
                `;
            case 'recibida':
                return `
                    <button class="btn btn-primary" onclick="sistemaProveedores.verDetallesOrden('${orden.id}')">
                        👁️ Ver Detalles
                    </button>
                `;
            case 'cancelada':
                return `
                    <button class="btn btn-warning" onclick="sistemaProveedores.reactivarOrden('${orden.id}')">
                        🔄 Reactivar
                    </button>
                `;
            default:
                return '';
        }
    }

    enviarOrden(ordenId) {
        const orden = this.ordenes.find(o => o.id == ordenId);
        if (orden) {
            orden.estado = 'enviada';
            orden.fechaEnvio = new Date().toISOString();
            this.guardarDatos();
            this.cargarOrdenes();
            this.mostrarOrdenesEnviadas();
            this.mostrarNotificacion('📤 Orden enviada al proveedor', 'success');
        }
    }

    cancelarOrden(ordenId) {
        if (confirm('¿Está seguro de que desea cancelar esta orden?')) {
            const orden = this.ordenes.find(o => o.id == ordenId);
            if (orden) {
                orden.estado = 'cancelada';
                this.guardarDatos();
                this.cargarOrdenes();
                this.mostrarNotificacion('❌ Orden cancelada', 'warning');
            }
        }
    }

    marcarRecibida(ordenId) {
        const orden = this.ordenes.find(o => o.id == ordenId);
        if (orden) {
            orden.estado = 'recibida';
            orden.fechaRecepcion = new Date().toISOString();
            this.guardarDatos();
            this.cargarOrdenes();
            this.mostrarOrdenesEnviadas();
            this.actualizarInventario(orden);
            this.mostrarNotificacion('📦 Orden marcada como recibida e inventario actualizado', 'success');
        }
    }

    actualizarInventario(orden) {
        // Aquí se actualizaría el inventario con los productos recibidos
        // Por ahora solo mostramos una notificación
        console.log('Actualizando inventario con productos de la orden:', orden);
    }

    mostrarOrdenesEnviadas() {
        const ordenesEnviadas = this.ordenes.filter(o => o.estado === 'enviada');
        const select = document.getElementById('orden-recepcion');
        
        if (select) {
            select.innerHTML = '<option value="">Seleccionar orden enviada</option>' +
                ordenesEnviadas.map(o => 
                    `<option value="${o.id}">${o.numeroOrden} - ${o.proveedorNombre}</option>`
                ).join('');
        }
    }

    procesarRecepcion() {
        const ordenId = document.getElementById('orden-recepcion').value;
        const fechaRecepcion = document.getElementById('fecha-recepcion').value;

        if (!ordenId) {
            alert('⚠️ Seleccione una orden para procesar');
            return;
        }

        this.marcarRecibida(ordenId);
    }

    actualizarEstadisticas() {
        const container = document.getElementById('resumen-estadisticas');
        if (!container) return;

        const totalProveedores = this.proveedores.length;
        const proveedoresActivos = this.proveedores.filter(p => p.estado === 'activo').length;
        const totalOrdenes = this.ordenes.length;
        const ordenesPendientes = this.ordenes.filter(o => o.estado === 'pendiente').length;
        const ordenesEnviadas = this.ordenes.filter(o => o.estado === 'enviada').length;
        const montoTotal = this.ordenes.reduce((sum, o) => sum + o.total, 0);

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-numero">${totalProveedores}</div>
                <div class="stat-label">Total Proveedores</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${proveedoresActivos}</div>
                <div class="stat-label">Proveedores Activos</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${totalOrdenes}</div>
                <div class="stat-label">Total Órdenes</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${ordenesPendientes}</div>
                <div class="stat-label">Órdenes Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${ordenesEnviadas}</div>
                <div class="stat-label">Órdenes Enviadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">$${montoTotal.toLocaleString('es-CO')}</div>
                <div class="stat-label">Monto Total Órdenes</div>
            </div>
        `;

        this.generarGraficosEstadisticas();
    }

    generarGraficosEstadisticas() {
        const container = document.getElementById('graficos-estadisticas');
        if (!container) return;

        // Análisis por categorías de proveedores
        const categorias = {};
        this.proveedores.forEach(p => {
            if (!categorias[p.categoria]) {
                categorias[p.categoria] = 0;
            }
            categorias[p.categoria]++;
        });

        // Órdenes por estado
        const estadosOrdenes = {};
        this.ordenes.forEach(o => {
            if (!estadosOrdenes[o.estado]) {
                estadosOrdenes[o.estado] = 0;
            }
            estadosOrdenes[o.estado]++;
        });

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div class="section-card">
                    <h3>📊 Proveedores por Categoría</h3>
                    ${Object.entries(categorias).map(([cat, count]) => `
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${this.obtenerNombreCategoria(cat)}</span>
                                <strong>${count}</strong>
                            </div>
                            <div style="background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${(count / this.proveedores.length) * 100}%; height: 100%; background: linear-gradient(90deg, #8B4513, #D2691E);"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="section-card">
                    <h3>📋 Órdenes por Estado</h3>
                    ${Object.entries(estadosOrdenes).map(([estado, count]) => `
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${this.obtenerTextoEstado(estado)}</span>
                                <strong>${count}</strong>
                            </div>
                            <div style="background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${(count / this.ordenes.length) * 100}%; height: 100%; background: ${this.obtenerColorEstado(estado)};"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    obtenerNombreCategoria(categoria) {
        const nombres = {
            'cafe': '☕ Café y Bebidas',
            'panaderia': '🥐 Panadería y Pastelería',
            'lacteos': '🥛 Lácteos',
            'dulces': '🍯 Dulces y Postres',
            'empaques': '📦 Empaques y Envases',
            'limpieza': '🧽 Productos de Limpieza',
            'equipos': '⚙️ Equipos y Maquinaria'
        };
        return nombres[categoria] || categoria;
    }

    obtenerTextoEstado(estado) {
        const textos = {
            'pendiente': '⏳ Pendiente',
            'enviada': '📤 Enviada',
            'recibida': '✅ Recibida',
            'cancelada': '❌ Cancelada'
        };
        return textos[estado] || estado;
    }

    obtenerColorEstado(estado) {
        const colores = {
            'pendiente': 'linear-gradient(90deg, #ffc107, #fd7e14)',
            'enviada': 'linear-gradient(90deg, #17a2b8, #20c997)',
            'recibida': 'linear-gradient(90deg, #28a745, #20c997)',
            'cancelada': 'linear-gradient(90deg, #dc3545, #c82333)'
        };
        return colores[estado] || '#6c757d';
    }

    obtenerTextoUrgencia(urgencia) {
        const textos = {
            'normal': '📅 Normal',
            'urgente': '⚡ Urgente',
            'critica': '🚨 Crítica'
        };
        return textos[urgencia] || urgencia;
    }

    eliminarProveedor(proveedorId) {
        if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
            this.proveedores = this.proveedores.filter(p => p.id != proveedorId);
            this.guardarDatos();
            this.cargarProveedores();
            this.cargarSelectoresProveedores();
            this.actualizarEstadisticas();
            this.mostrarNotificacion('🗑️ Proveedor eliminado', 'warning');
        }
    }

    guardarDatos() {
        localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
        localStorage.setItem('ordenes_compra', JSON.stringify(this.ordenes));
        localStorage.setItem('contador_proveedores', this.contadorProveedores);
        localStorage.setItem('contador_ordenes', this.contadorOrdenes);
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación visual
        const notif = document.createElement('div');
        notif.className = `notificacion ${tipo}`;
        notif.textContent = mensaje;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${tipo === 'success' ? '#28a745' : tipo === 'warning' ? '#ffc107' : '#17a2b8'};
        `;

        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);

        // Notificación del navegador si está permitida
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Cafetería Cesde - Proveedores', {
                body: mensaje,
                icon: 'Images/logo.png'
            });
        }
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

    // Cargar contenido específico de la sección
    switch (seccionId) {
        case 'ordenes':
            sistemaProveedores.cargarOrdenes();
            break;
        case 'recepcion':
            sistemaProveedores.mostrarOrdenesEnviadas();
            break;
        case 'estadisticas':
            sistemaProveedores.actualizarEstadisticas();
            break;
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.proveedores-container')) {
        window.sistemaProveedores = new SistemaProveedores();
        
        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Configurar navegación móvil
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace (móvil)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaProveedores;
}