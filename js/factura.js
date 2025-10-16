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

        // Búsqueda en tiempo real
        const inputBusqueda = document.getElementById('busqueda-factura');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', (e) => {
                this.filtrarFacturas(e.target.value);
            });
        }

        // Selector de factura
        const selectorFactura = document.getElementById('selector-factura');
        if (selectorFactura) {
            selectorFactura.addEventListener('change', (e) => {
                this.cargarFactura(e.target.value);
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
        const venta = this.ventas.find(v => v.id === ventaId);
        
        if (!venta) {
            this.mostrarError('Venta no encontrada');
            return;
        }

        const factura = this.crearFactura(venta);
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
            cliente: this.obtenerDatosCliente(venta.cliente),
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
        const fecha = new Date();
        const correlativo = (this.facturas.length + 1).toString().padStart(5, '0');
        return `FAC-${correlativo}`;
    }

    obtenerDatosCliente(idCliente) {
        // Buscar en ambos sistemas de clientes
        const clientesRegistro = JSON.parse(localStorage.getItem('clientes_cafeteria')) || {};
        const clientesCompra = JSON.parse(localStorage.getItem('clientes')) || [];
        
        // Buscar primero en el sistema de registro (más completo)
        let cliente = Object.values(clientesRegistro).find(c => c.id_cliente === idCliente);
        
        // Si no se encuentra, buscar en el sistema de compras
        if (!cliente) {
            cliente = clientesCompra.find(c => c.id === idCliente);
        }
        
        // Si se encuentra un cliente del sistema de registro, formatear para factura
        if (cliente && cliente.id_cliente) {
            return {
                id: cliente.id_cliente,
                nombre: `${cliente.nombres} ${cliente.apellidos}`,
                documento: `${cliente.tipo_documento} ${cliente.numero_documento}`,
                email: cliente.correo_electronico,
                telefono: cliente.telefono_principal,
                ciudad: cliente.ciudad,
                rol: cliente.rol_institucion
            };
        }
        
        // Si se encuentra un cliente del sistema de compras
        if (cliente && cliente.id) {
            return {
                id: cliente.id,
                nombre: cliente.nombre || 'Cliente General',
                documento: cliente.documento || 'N/A',
                email: cliente.email || 'N/A',
                telefono: cliente.telefono || 'N/A',
                ciudad: cliente.ciudad || 'N/A',
                rol: 'Cliente'
            };
        }
        
        // Cliente por defecto si no se encuentra
        return {
            id: idCliente,
            nombre: 'Cliente General',
            documento: 'N/A',
            email: 'N/A',
            telefono: 'N/A',
            ciudad: 'N/A',
            rol: 'Cliente'
        };
    }

    obtenerDatosVendedor(idVendedor) {
        const empleados = JSON.parse(localStorage.getItem('empleados')) || [];
        const vendedor = empleados.find(e => e.id === idVendedor);
        
        return vendedor || {
            id: idVendedor,
            nombre: 'Vendedor',
            cargo: 'Cajero'
        };
    }

    renderizarFactura(factura) {
        const container = document.getElementById('factura-content');
        if (!container) return;

        container.innerHTML = this.generarHTMLFactura(factura);
        
        // Actualizar título de la página
        document.title = `Factura ${factura.numero} - Cafetería Cesde`;
    }

    generarHTMLFactura(factura) {
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
                        <h3>📋 Resolución DIAN</h3>
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
                        <p style="background: #faf8f5; padding: 8px; border-radius: 5px; border-left: 4px solid #8B4513;"><strong>💳 Método de Pago:</strong> ${factura.metodoPago}</p>
                    </div>
                    <div class="cliente-datos">
                        <h3>👤 Datos del Cliente</h3>
                        <p><strong>Cliente:</strong> ${factura.cliente.nombre}</p>
                        <p><strong>ID:</strong> ${factura.cliente.id}</p>
                        <p><strong>Documento:</strong> ${factura.cliente.documento}</p>
                        <p><strong>Email:</strong> ${factura.cliente.email}</p>
                        <p><strong>Teléfono:</strong> ${factura.cliente.telefono}</p>
                    </div>
                </div>

                <div class="productos-detalle">
                    <h3>🛒 Detalle de Productos</h3>
                    <table class="tabla-productos">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Cant.</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${factura.items.map(item => `
                                <tr>
                                    <td>${item.id}</td>
                                    <td>${item.nombre}</td>
                                    <td>${item.cantidad}</td>
                                    <td>$${item.precio.toLocaleString('es-CO')}</td>
                                    <td>$${item.subtotal.toLocaleString('es-CO')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="resumen-totales">
                        <div class="totales-derecha">
                            <div class="subtotal-line">
                                <span>Subtotal:</span>
                                <span>$${factura.subtotal.toLocaleString('es-CO')}</span>
                            </div>
                            ${factura.descuento > 0 ? `
                                <div class="descuento-line">
                                    <span>Descuento:</span>
                                    <span>-$${factura.descuento.toLocaleString('es-CO')}</span>
                                </div>
                            ` : ''}
                            <div class="iva-line">
                                <span>IVA (0%):</span>
                                <span>$0</span>
                            </div>
                            <div class="total-line">
                                <span><strong>TOTAL A PAGAR:</strong></span>
                                <span><strong>$${factura.total.toLocaleString('es-CO')}</strong></span>
                            </div>
                            ${factura.metodoPago === 'Efectivo' ? `
                                <div class="pago-efectivo">
                                    <div class="recibido-line">
                                        <span>Recibido:</span>
                                        <span>$${factura.montoRecibido.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div class="cambio-line">
                                        <span>Cambio:</span>
                                        <span>$${factura.cambio.toLocaleString('es-CO')}</span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${factura.observaciones ? `
                    <div class="observaciones-factura">
                        <h3>📝 Observaciones</h3>
                        <p>${factura.observaciones}</p>
                    </div>
                ` : ''}

                <div class="pie-factura">
                    <div class="agradecimiento">
                        <p><strong>¡Gracias por su compra!</strong></p>
                        <p>Esperamos volver a verle pronto en Cafetería Cesde</p>
                    </div>
                    <div class="info-adicional">
                        <p><small>Esta factura es válida como soporte contable</small></p>
                        <p><small>Para reclamos: equipocesde25@gmail.com</small></p>
                        <p><small>Soporte técnico: 3008694578</small></p>
                    </div>
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
            container.innerHTML = '<p class="sin-facturas">No hay facturas generadas</p>';
            return;
        }

        const html = `
            <div class="facturas-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.facturas.map(factura => `
                            <tr>
                                <td>${factura.numero}</td>
                                <td>${factura.fechaFormateada}</td>
                                <td>${factura.cliente.nombre}</td>
                                <td>$${factura.total.toLocaleString('es-CO')}</td>
                                <td><span class="estado-${factura.estado}">${factura.estado}</span></td>
                                <td>
                                    <button onclick="sistemaFacturacion.cargarFactura('${factura.id}')" class="btn-mini">👁️ Ver</button>
                                    <button onclick="sistemaFacturacion.imprimirFactura('${factura.id}')" class="btn-mini">🖨️ Imprimir</button>
                                    <button onclick="sistemaFacturacion.descargarPDF('${factura.id}')" class="btn-mini">📄 PDF</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
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
    }

    cargarFactura(facturaId) {
        const factura = this.facturas.find(f => f.id === facturaId);
        
        if (!factura) {
            this.mostrarError('Factura no encontrada');
            return;
        }
        
        this.renderizarFactura(factura);
    }

    buscarFactura() {
        const numero = document.getElementById('numero-busqueda')?.value;
        
        if (!numero) {
            this.mostrarError('Ingrese un número de factura o ID de cliente');
            return;
        }
        
        // Buscar por número de factura, ID de factura o ID de cliente
        const factura = this.facturas.find(f => 
            f.numero.toLowerCase().includes(numero.toLowerCase()) ||
            f.id.toLowerCase().includes(numero.toLowerCase()) ||
            f.cliente.id === numero ||
            f.venta.idCliente === numero
        );
        
        if (factura) {
            this.cargarFactura(factura.id);
        } else {
            // Si no encuentra factura, buscar si hay una venta con ese cliente
            const venta = this.ventas.find(v => v.idCliente === numero);
            if (venta) {
                this.generarFacturaDesdeVenta(venta.id);
                this.mostrarInfo(`Factura generada para la venta del cliente ${numero}`);
            } else {
                this.mostrarError('No se encontró factura ni venta para el criterio de búsqueda');
            }
        }
    }

    filtrarFacturas(termino) {
        const facturasFiltradas = this.facturas.filter(factura =>
            factura.numero.toLowerCase().includes(termino.toLowerCase()) ||
            factura.cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            factura.cliente.id.includes(termino) ||
            factura.venta.idCliente.includes(termino) ||
            factura.fechaFormateada.includes(termino)
        );
        
        this.renderizarTablaFiltrada(facturasFiltradas);
    }

    renderizarTablaFiltrada(facturas) {
        const tbody = document.querySelector('#lista-facturas tbody');
        if (!tbody) return;

        if (facturas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="sin-resultados">No se encontraron facturas</td></tr>';
            return;
        }

        tbody.innerHTML = facturas.map(factura => `
            <tr>
                <td>${factura.numero}</td>
                <td>${factura.fechaFormateada}</td>
                <td>${factura.cliente.nombre}</td>
                <td>$${factura.total.toLocaleString('es-CO')}</td>
                <td><span class="estado-${factura.estado}">${factura.estado}</span></td>
                <td>
                    <button onclick="sistemaFacturacion.cargarFactura('${factura.id}')" class="btn-mini">👁️ Ver</button>
                    <button onclick="sistemaFacturacion.imprimirFactura('${factura.id}')" class="btn-mini">🖨️ Imprimir</button>
                    <button onclick="sistemaFacturacion.descargarPDF('${factura.id}')" class="btn-mini">📄 PDF</button>
                </td>
            </tr>
        `).join('');
    }

    imprimirFactura(facturaId = null) {
        let factura;
        
        if (facturaId) {
            factura = this.facturas.find(f => f.id === facturaId);
        } else {
            // Imprimir la factura actualmente mostrada
            const container = document.getElementById('factura-content');
            if (!container || !container.querySelector('.factura')) {
                this.mostrarError('No hay factura para imprimir');
                return;
            }
        }
        
        // Crear ventana de impresión
        const ventanaImpresion = window.open('', '_blank');
        const estilosImpresion = this.obtenerEstilosImpresion();
        
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura ${factura ? factura.numero : ''}</title>
                <style>${estilosImpresion}</style>
            </head>
            <body>
                ${factura ? this.generarHTMLFactura(factura) : document.getElementById('factura-content').innerHTML}
            </body>
            </html>
        `);
        
        ventanaImpresion.document.close();
        ventanaImpresion.focus();
        
        setTimeout(() => {
            ventanaImpresion.print();
            ventanaImpresion.close();
        }, 500);
    }

    obtenerEstilosImpresion() {
        return `
            @page { margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .factura { max-width: 100%; }
            .factura-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .empresa-info h1 { font-size: 18px; margin: 0; }
            .empresa-info h2 { font-size: 16px; margin: 5px 0; }
            .logo-factura img { width: 80px; height: 80px; }
            .empresa-detalles, .factura-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .tabla-productos { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .tabla-productos th, .tabla-productos td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .tabla-productos th { background-color: #f5f5f5; }
            .resumen-totales { text-align: right; margin-top: 20px; }
            .total-line { font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 5px; }
            .pie-factura { margin-top: 30px; text-align: center; font-size: 10px; }
        `;
    }

    async descargarPDF(facturaId = null) {
        this.mostrarMensaje('Generando PDF...', 'info');
        
        try {
            // Aquí implementarías la generación de PDF
            // Por ahora simulo el proceso
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.mostrarMensaje('PDF generado exitosamente', 'exito');
            
            // Simular descarga
            const link = document.createElement('a');
            link.href = '#';
            link.download = `factura_${facturaId || 'actual'}.pdf`;
            link.click();
            
        } catch (error) {
            this.mostrarError('Error al generar PDF: ' + error.message);
        }
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }

    mostrarInfo(mensaje) {
        this.mostrarMensaje(mensaje, 'info');
    }

    // Función para debugging - mostrar todas las ventas
    debug_mostrarVentas() {
        console.log('=== VENTAS REGISTRADAS ===');
        console.log('Total de ventas:', this.ventas.length);
        console.log('Ventas:', this.ventas);
        return this.ventas;
    }

    // Función para debugging - mostrar todas las facturas
    debug_mostrarFacturas() {
        console.log('=== FACTURAS GENERADAS ===');
        console.log('Total de facturas:', this.facturas.length);
        console.log('Facturas:', this.facturas);
        return this.facturas;
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
        }, 3000);
    }

    // Métodos públicos para integración
    obtenerFacturas() {
        return this.facturas;
    }

    obtenerFacturaPorId(id) {
        return this.facturas.find(f => f.id === id);
    }

    generarFactura(ventaId = null) {
        if (ventaId) {
            this.generarFacturaDesdeVenta(ventaId);
        } else {
            // Redirigir a compras si no hay venta especificada
            window.location.href = 'compra.html';
        }
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('factura-content') || document.getElementById('lista-facturas')) {
        window.sistemaFacturacion = new SistemaFacturacion();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaFacturacion;
}