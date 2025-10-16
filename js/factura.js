/**
 * Sistema de Facturación - Cafetería Cesde
 * Genera facturas, comprobantes y maneja impresión de documentos
 */

class SistemaFacturacion {
    constructor() {
        this.facturas = JSON.parse(localStorage.getItem('facturas')) || [];
        this.ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        this.configuracion = this.initConfiguracion();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.cargarFacturaActual();
        this.renderizarListaFacturas();
        this.actualizarEstadisticas();
    }

    initConfiguracion() {
        return {
            empresa: {
                nombre: 'Cafetería Cesde',
                eslogan: 'Donde el conocimiento se mezcla con buen café',
                nit: '900.123.456-7',
                direccion: 'Calle 50 #46-36, Medellín, Antioquia',
                telefono: '(604) 444-5555',
                email: 'equipocesde25@gmail.com',
                regimen: 'Responsable del IVA'
            },
            dian: {
                resolucion: '18764003716532',
                fecha: '15/01/2025',
                rangoDesde: 'FAC-00001',
                rangoHasta: 'FAC-99999',
                vigencia: '24 meses'
            }
        };
    }

    configurarEventos() {
        // Botones de acción
        const btnGenerar = document.getElementById('btn-generar-factura');
        const btnImprimir = document.getElementById('btn-imprimir');
        const btnDescargar = document.getElementById('btn-descargar-pdf');
        const btnBuscar = document.getElementById('btn-buscar-factura');

        if (btnGenerar) {
            btnGenerar.addEventListener('click', () => this.generarFactura());
        }

        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => this.imprimirFactura());
        }

        if (btnDescargar) {
            btnDescargar.addEventListener('click', () => this.descargarPDF());
        }

        if (btnBuscar) {
            btnBuscar.addEventListener('click', () => this.buscarFactura());
        }

        // Campo de búsqueda con Enter
        const inputBusqueda = document.getElementById('busqueda-factura');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.buscarFactura();
                }
            });
        }
    }

    cargarFacturaActual() {
        // Verificar si hay una venta pendiente de facturar
        const urlParams = new URLSearchParams(window.location.search);
        const ventaId = urlParams.get('ventaId');
        
        if (ventaId) {
            this.generarFacturaDesdeVenta(ventaId);
        } else {
            this.mostrarFacturaVacia();
        }
    }

    generarFacturaDesdeVenta(ventaId) {
        console.log('Generando factura desde venta:', ventaId);
        const venta = this.ventas.find(v => v.id === ventaId);
        
        if (!venta) {
            console.error('Venta no encontrada:', ventaId);
            this.mostrarError('Venta no encontrada');
            return;
        }

        console.log('Venta encontrada:', venta);
        const factura = this.crearFactura(venta);
        console.log('Factura creada:', factura);
        this.renderizarFactura(factura);
        this.guardarFactura(factura);
    }

    crearFactura(venta) {
        const numeroFactura = this.generarNumeroFactura();
        
        return {
            id: numeroFactura,
            numero: numeroFactura,
            fecha: new Date().toISOString(),
            fechaFormateada: new Date().toLocaleDateString('es-CO'),
            horaFormateada: new Date().toLocaleTimeString('es-CO'),
            venta: venta,
            cliente: this.obtenerDatosCliente(venta.cliente || venta.idCliente),
            vendedor: this.obtenerDatosVendedor(venta.vendedor),
            items: venta.items,
            subtotal: venta.subtotal,
            descuento: venta.descuentoMonto,
            total: venta.total,
            metodoPago: venta.metodoPago,
            montoRecibido: venta.montoRecibido,
            cambio: venta.cambio,
            observaciones: venta.observaciones,
            estado: 'generada'
        };
    }

    generarNumeroFactura() {
        const correlativo = (this.facturas.length + 1).toString().padStart(5, '0');
        return `FAC-${correlativo}`;
    }

    obtenerDatosCliente(idCliente) {
        console.log('Buscando datos de cliente con ID:', idCliente);
        
        // Buscar en el sistema de registro
        const clientesRegistro = JSON.parse(localStorage.getItem('clientes_cafeteria')) || {};
        console.log('Clientes en registro:', clientesRegistro);
        
        // Buscar cliente en el sistema de registro
        let cliente = Object.values(clientesRegistro).find(c => c.id_cliente === idCliente);
        console.log('Cliente encontrado en registro:', cliente);
        
        if (cliente && cliente.id_cliente) {
            return {
                id: cliente.id_cliente,
                nombre: `${cliente.nombres} ${cliente.apellidos}`,
                documento: `${cliente.tipo_documento} ${cliente.numero_documento}`,
                email: cliente.correo_electronico,
                telefono: cliente.telefono_principal,
                direccion: cliente.direccion || 'No especificada'
            };
        }
        
        // Si no se encuentra, crear un cliente genérico
        console.log('Cliente no encontrado, creando genérico para ID:', idCliente);
        return {
            id: idCliente,
            nombre: 'Cliente General',
            documento: 'No especificado',
            email: 'No especificado',
            telefono: 'No especificado',
            direccion: 'No especificada'
        };
    }

    obtenerDatosVendedor(idVendedor) {
        return {
            id: idVendedor,
            nombre: `Vendedor ${idVendedor}`,
            documento: 'N/A'
        };
    }

    renderizarFactura(factura) {
        console.log('Renderizando factura:', factura);
        const container = document.getElementById('factura-content');
        
        if (!container) {
            console.error('Contenedor factura-content no encontrado');
            return;
        }

        const htmlFactura = this.generarHTMLFactura(factura);
        container.innerHTML = htmlFactura;
        
        // Actualizar título de la página
        document.title = `Factura ${factura.numero} - Cafetería Cesde`;
    }

    generarHTMLFactura(factura) {
        console.log('Generando HTML para factura:', factura);
        console.log('Cliente en factura:', factura.cliente);
        console.log('Items en factura:', factura.items);
        console.log('Configuración empresa:', this.configuracion.empresa);
        
        // Verificar que todos los datos estén presentes
        if (!factura.cliente) {
            console.error('Error: factura.cliente es undefined');
            return '<div class="error">Error: Datos de cliente no disponibles</div>';
        }
        
        if (!factura.items || factura.items.length === 0) {
            console.error('Error: factura.items está vacío o undefined');
            return '<div class="error">Error: No hay productos en la factura</div>';
        }
        
        return `
            <div class="factura">
                <div class="factura-header">
                    <div class="empresa-info">
                        <h1>🧾 FACTURA DE VENTA</h1>
                        <h2>${this.configuracion.empresa.nombre}</h2>
                        <p class="eslogan-factura">"${this.configuracion.empresa.eslogan}"</p>
                    </div>
                    <div class="logo-factura">
                        <img src="Images/cafe cesde logo.jpg" alt="Logo Cafetería Cesde">
                    </div>
                </div>

                <div class="empresa-detalles">
                    <div class="empresa-datos">
                        <h3>📍 Información de la Empresa</h3>
                        <p><strong>NIT:</strong> ${this.configuracion.empresa.nit}</p>
                        <p><strong>Dirección:</strong> ${this.configuracion.empresa.direccion}</p>
                        <p><strong>Teléfono:</strong> ${this.configuracion.empresa.telefono}</p>
                        <p><strong>Email:</strong> ${this.configuracion.empresa.email}</p>
                        <p><strong>Régimen:</strong> ${this.configuracion.empresa.regimen}</p>
                    </div>
                    <div class="resolucion-dian">
                        <h3>Resolución DIAN</h3>
                        <p><strong>No. Resolución:</strong> ${this.configuracion.dian.resolucion}</p>
                        <p><strong>Fecha:</strong> ${this.configuracion.dian.fecha}</p>
                        <p><strong>Rango Autorizado:</strong></p>
                        <p>Desde: ${this.configuracion.dian.rangoDesde}</p>
                        <p>Hasta: ${this.configuracion.dian.rangoHasta}</p>
                        <p><strong>Vigencia:</strong> ${this.configuracion.dian.vigencia}</p>
                    </div>
                </div>

                <div class="factura-info">
                    <div class="factura-datos">
                        <h3>📄 Datos de la Factura</h3>
                        <p><strong>Número:</strong> ${factura.numero}</p>
                        <p><strong>Fecha:</strong> ${factura.fechaFormateada}</p>
                        <p><strong>Hora:</strong> ${factura.horaFormateada}</p>
                        <p><strong>Vendedor:</strong> ${factura.vendedor.nombre}</p>
                    </div>
                    <div class="cliente-datos">
                        <h3>👤 Datos del Cliente</h3>
                        <p><strong>Cliente:</strong> ${factura.cliente.nombre}</p>
                        <p><strong>Documento:</strong> ${factura.cliente.documento}</p>
                        <p><strong>Email:</strong> ${factura.cliente.email}</p>
                        <p><strong>Teléfono:</strong> ${factura.cliente.telefono}</p>
                        <p><strong>Dirección:</strong> ${factura.cliente.direccion}</p>
                    </div>
                </div>

                <div class="productos-factura">
                    <h3>🛒 Productos</h3>
                    <table class="tabla-productos">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${factura.items.map(item => `
                                <tr>
                                    <td>${item.nombre}</td>
                                    <td>${item.cantidad}</td>
                                    <td>$${item.precio.toLocaleString('es-CO')}</td>
                                    <td>$${item.subtotal.toLocaleString('es-CO')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="totales-factura">
                    <div class="totales-detalle">
                        <p><strong>Subtotal:</strong> $${factura.subtotal.toLocaleString('es-CO')}</p>
                        ${factura.descuento > 0 ? `<p><strong>Descuento:</strong> -$${factura.descuento.toLocaleString('es-CO')}</p>` : ''}
                        <p class="total-final"><strong>TOTAL:</strong> $${factura.total.toLocaleString('es-CO')}</p>
                    </div>
                </div>

                <div class="pago-info">
                    <h3>💳 Información de Pago</h3>
                    <p><strong>Método de Pago:</strong> ${factura.metodoPago}</p>
                    <p><strong>Monto Recibido:</strong> $${factura.montoRecibido.toLocaleString('es-CO')}</p>
                    <p><strong>Cambio:</strong> $${factura.cambio.toLocaleString('es-CO')}</p>
                    ${factura.observaciones ? `<p><strong>Observaciones:</strong> ${factura.observaciones}</p>` : ''}
                </div>

                <div class="factura-footer">
                    <p>¡Gracias por su compra!</p>
                    <p>Esta factura fue generada automáticamente</p>
                    <p>Fecha de generación: ${new Date().toLocaleString('es-CO')}</p>
                </div>
            </div>
        `;
    }

    mostrarFacturaVacia() {
        const container = document.getElementById('factura-content');
        if (!container) return;

        container.innerHTML = `
            <div class="factura-vacia">
                <div class="mensaje-vacio">
                    <h2>📄 No hay factura para mostrar</h2>
                    <p>Seleccione una factura existente o genere una nueva desde el sistema de compras.</p>
                    <div class="acciones-vacio">
                        <a href="compra.html" class="btn-primary">🛒 Ir a Compras</a>
                        <button onclick="location.reload()" class="btn-secondary">🔄 Actualizar</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderizarListaFacturas() {
        const container = document.getElementById('lista-facturas');
        if (!container) return;

        if (this.facturas.length === 0) {
            container.innerHTML = `
                <div class="sin-facturas">
                    <p>No hay facturas generadas</p>
                    <a href="compra.html" class="btn-primary">🛒 Crear Primera Venta</a>
                </div>
            `;
            return;
        }

        const facturas = this.facturas.slice().reverse(); // Mostrar las más recientes primero
        
        container.innerHTML = `
            <h3>Facturas Recientes</h3>
            <div class="facturas-lista">
                ${facturas.map(factura => `
                    <div class="factura-item" onclick="sistemaFacturacion.cargarFactura('${factura.id}')">
                        <div class="factura-item-header">
                            <strong>${factura.numero}</strong>
                            <span class="fecha">${factura.fechaFormateada}</span>
                        </div>
                        <div class="factura-item-body">
                            <p>Cliente: ${factura.cliente.nombre}</p>
                            <p>Total: $${factura.total.toLocaleString('es-CO')}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    guardarFactura(factura) {
        const index = this.facturas.findIndex(f => f.id === factura.id);
        
        if (index >= 0) {
            this.facturas[index] = factura;
        } else {
            this.facturas.push(factura);
        }
        
        localStorage.setItem('facturas', JSON.stringify(this.facturas));
        this.renderizarListaFacturas();
        this.actualizarEstadisticas();
    }

    cargarFactura(facturaId) {
        console.log('Cargando factura con ID:', facturaId);
        console.log('Facturas disponibles:', this.facturas);
        
        const factura = this.facturas.find(f => f.id === facturaId);
        
        if (!factura) {
            console.log('Factura no encontrada con ID:', facturaId);
            this.mostrarError('Factura no encontrada');
            return;
        }
        
        console.log('Factura encontrada:', factura);
        this.renderizarFactura(factura);
    }

    buscarFactura() {
        const termino = document.getElementById('busqueda-factura')?.value;
        
        if (!termino) {
            this.mostrarError('Ingrese un criterio de búsqueda');
            return;
        }
        
        console.log('Buscando facturas con término:', termino);
        console.log('Facturas disponibles:', this.facturas);
        console.log('Ventas disponibles:', this.ventas);
        
        // Buscar por múltiples criterios
        let factura = this.facturas.find(f => {
            // Buscar por número de factura
            if (f.numero && f.numero.toLowerCase().includes(termino.toLowerCase())) {
                return true;
            }
            
            // Buscar por ID de factura
            if (f.id && f.id.toLowerCase().includes(termino.toLowerCase())) {
                return true;
            }
            
            // Buscar por ID de cliente
            if (f.venta && f.venta.idCliente === termino) {
                return true;
            }
            
            // Buscar por información del cliente
            if (f.cliente) {
                if (f.cliente.id === termino || 
                    f.cliente.email === termino ||
                    f.cliente.nombre?.toLowerCase().includes(termino.toLowerCase())) {
                    return true;
                }
            }
            
            return false;
        });
        
        if (factura) {
            console.log('✅ FACTURA ENCONTRADA:', factura);
            
            // RENDERIZAR FACTURA CON DEBUGGING
            this.renderizarFactura(factura);
            
            // FORZAR VISIBILIDAD
            const container = document.getElementById('factura-content');
            const listaContainer = document.getElementById('lista-facturas');
            
            console.log('📦 Container factura-content encontrado:', !!container);
            console.log('📦 Container lista-facturas encontrado:', !!listaContainer);
            
            if (container) {
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
                console.log('🎨 Estilos forzados en factura-content');
            }
            
            this.mostrarInfo(`Factura ${factura.numero} encontrada`);
        } else {
            // Si no encuentra factura directa, buscar venta y generar factura
            console.log('No se encontró factura, buscando venta...');
            const venta = this.ventas.find(v => v.idCliente === termino || v.id === termino);
            
            if (venta) {
                console.log('Venta encontrada, generando factura:', venta);
                this.generarFacturaDesdeVenta(venta.id);
                this.mostrarInfo(`Factura generada para la venta del cliente ${termino}`);
            } else {
                this.mostrarError('No se encontró factura ni venta para el criterio de búsqueda: ' + termino);
            }
        }
    }

    actualizarEstadisticas() {
        const totalFacturas = this.facturas.length;
        const hoy = new Date().toDateString();
        const facturasHoy = this.facturas.filter(f => 
            new Date(f.fecha).toDateString() === hoy
        ).length;
        
        const fechaSemana = new Date();
        fechaSemana.setDate(fechaSemana.getDate() - 7);
        const facturasSemana = this.facturas.filter(f => 
            new Date(f.fecha) >= fechaSemana
        ).length;

        // Actualizar elementos del DOM
        const totalElement = document.getElementById('total-facturas');
        const hoyElement = document.getElementById('facturas-hoy');
        const semanaElement = document.getElementById('facturas-semana');

        if (totalElement) totalElement.textContent = totalFacturas;
        if (hoyElement) hoyElement.textContent = facturasHoy;
        if (semanaElement) semanaElement.textContent = facturasSemana;
    }

    imprimirFactura() {
        window.print();
    }

    descargarPDF() {
        this.mostrarInfo('Función de descarga PDF en desarrollo');
    }

    mostrarError(mensaje) {
        console.error('Error:', mensaje);
        alert('Error: ' + mensaje);
    }

    mostrarInfo(mensaje) {
        console.log('Info:', mensaje);
        alert('Info: ' + mensaje);
    }

    // Método para debugging
    debug_mostrarDatos() {
        console.log('=== DEBUG FACTURACIÓN ===');
        console.log('Facturas:', this.facturas);
        console.log('Ventas:', this.ventas);
        console.log('Clientes registro:', JSON.parse(localStorage.getItem('clientes_cafeteria')));
        console.log('========================');
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('factura-content') || document.getElementById('lista-facturas')) {
        window.sistemaFacturacion = new SistemaFacturacion();
        
        // Agregar función de debug global
        window.debugFacturacion = () => {
            window.sistemaFacturacion.debug_mostrarDatos();
        };
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaFacturacion;
}