/**
 * Sistema de Reportes y Analítica - Cafetería Cesde
 * Genera reportes completos de ventas, productos, clientes y empleados
 */

class SistemaReportes {
    constructor() {
        this.ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        this.empleados = JSON.parse(localStorage.getItem('empleados')) || [];
        this.productos = this.initProductos();
        this.init();
    }

    init() {
        this.configurarFechas();
        this.cargarSelectores();
        this.actualizarEstadisticasGenerales();
        this.actualizarDashboard();
    }

    initProductos() {
        // Usar los mismos productos del sistema de compras
        return {
            // Café Caliente
            'Cafe_Espresso_Caliente': { id: 52, nombre: 'Café Espresso', precio: 3000, categoria: 'Café', subcategoria: 'Caliente' },
            'Cafe_Latte_Caliente': { id: 53, nombre: 'Café Latte', precio: 4500, categoria: 'Café', subcategoria: 'Caliente' },
            'Cafe_Moka_Caliente': { id: 54, nombre: 'Café Moka', precio: 5000, categoria: 'Café', subcategoria: 'Caliente' },
            'Cafe_Americano_Caliente': { id: 55, nombre: 'Café Americano', precio: 3500, categoria: 'Café', subcategoria: 'Caliente' },
            'Cappuccino_Caliente': { id: 56, nombre: 'Cappuccino', precio: 4500, categoria: 'Café', subcategoria: 'Caliente' },
            
            // Café Frío
            'Frappe': { id: 57, nombre: 'Frappe', precio: 6000, categoria: 'Café', subcategoria: 'Frío' },
            'Cafe_Latte_Frio': { id: 58, nombre: 'Café Latte Frío', precio: 5000, categoria: 'Café', subcategoria: 'Frío' },
            'Cafe_Americano_Frio': { id: 59, nombre: 'Café Americano Frío', precio: 4000, categoria: 'Café', subcategoria: 'Frío' },
            'Cappuccino_Frio': { id: 60, nombre: 'Cappuccino Frío', precio: 5000, categoria: 'Café', subcategoria: 'Frío' },
            'Cold_Brew': { id: 61, nombre: 'Cold Brew', precio: 5500, categoria: 'Café', subcategoria: 'Frío' },
            
            // Pastelería Salada
            'Croissant_Mantequilla': { id: 14, nombre: 'Croissant de Mantequilla', precio: 3500, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Croissant_Jamon_Queso': { id: 15, nombre: 'Croissant de Jamón y Queso', precio: 4500, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Empanada_Pollo': { id: 16, nombre: 'Empanada de Pollo', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Empanada_Carne': { id: 17, nombre: 'Empanada de Carne', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Sandwich_Pollo': { id: 18, nombre: 'Sandwich de Pollo', precio: 6500, categoria: 'Pastelería', subcategoria: 'Salada' },
            
            // Pastelería Dulce
            'Muffin_Chocolate': { id: 19, nombre: 'Muffin de Chocolate', precio: 4000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Muffin_Arandanos': { id: 20, nombre: 'Muffin de Arándanos', precio: 4000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Cheesecake': { id: 21, nombre: 'Cheesecake', precio: 6000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Tiramisu': { id: 22, nombre: 'Tiramisú', precio: 7000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Brownie': { id: 23, nombre: 'Brownie', precio: 4500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            
            // Bebidas
            'Agua_Natural': { id: 24, nombre: 'Agua Natural', precio: 2000, categoria: 'Bebidas', subcategoria: 'Sin Gas' },
            'Agua_Con_Gas': { id: 25, nombre: 'Agua con Gas', precio: 2500, categoria: 'Bebidas', subcategoria: 'Con Gas' },
            'Jugo_Naranja': { id: 26, nombre: 'Jugo de Naranja Natural', precio: 4500, categoria: 'Bebidas', subcategoria: 'Jugos' },
            'Jugo_Limon': { id: 27, nombre: 'Limonada', precio: 3500, categoria: 'Bebidas', subcategoria: 'Jugos' },
            'Smoothie_Fresa': { id: 28, nombre: 'Smoothie de Fresa', precio: 6000, categoria: 'Bebidas', subcategoria: 'Smoothies' }
        };
    }

    configurarFechas() {
        const hoy = new Date();
        const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Configurar fechas de ventas
        const fechaInicioVentas = document.getElementById('fecha-inicio-ventas');
        const fechaFinVentas = document.getElementById('fecha-fin-ventas');
        if (fechaInicioVentas && fechaFinVentas) {
            fechaInicioVentas.value = hace7Dias.toISOString().split('T')[0];
            fechaFinVentas.value = hoy.toISOString().split('T')[0];
        }

        // Configurar fechas de empleados
        const fechaInicioEmpleados = document.getElementById('fecha-inicio-empleados');
        const fechaFinEmpleados = document.getElementById('fecha-fin-empleados');
        if (fechaInicioEmpleados && fechaFinEmpleados) {
            fechaInicioEmpleados.value = hace30Dias.toISOString().split('T')[0];
            fechaFinEmpleados.value = hoy.toISOString().split('T')[0];
        }
    }

    cargarSelectores() {
        // Cargar vendedores únicos
        const vendedores = [...new Set(this.ventas.map(v => v.vendedor))];
        const selectVendedor = document.getElementById('vendedor-filtro');
        if (selectVendedor) {
            vendedores.forEach(vendedor => {
                const option = new Option(vendedor, vendedor);
                selectVendedor.appendChild(option);
            });
        }

        // Cargar empleados
        const selectEmpleado = document.getElementById('empleado-seleccion');
        if (selectEmpleado) {
            this.empleados.forEach(emp => {
                const option = new Option(`${emp.nombres} ${emp.apellidos}`, emp.id);
                selectEmpleado.appendChild(option);
            });
        }
    }

    actualizarEstadisticasGenerales() {
        const hoy = new Date().toISOString().split('T')[0];
        const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Ventas de hoy
        const ventasHoy = this.ventas.filter(v => v.fechaFormateada === hoy);
        const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
        
        // Ventas de ayer
        const ventasAyer = this.ventas.filter(v => v.fechaFormateada === ayer);
        const totalAyer = ventasAyer.reduce((sum, v) => sum + v.total, 0);
        
        // Ventas del mes
        const mesActual = hoy.substring(0, 7); // YYYY-MM
        const ventasMes = this.ventas.filter(v => v.fechaFormateada?.startsWith(mesActual));
        const totalMes = ventasMes.reduce((sum, v) => sum + v.total, 0);
        
        // Productos vendidos hoy
        const productosHoy = ventasHoy.reduce((sum, v) => sum + (v.items?.length || 0), 0);
        
        // Clientes activos
        const clientesActivos = this.clientes.filter(c => c.estado === 'activo').length;
        
        // Actualizar DOM
        document.getElementById('ventas-hoy').textContent = `$${totalHoy.toLocaleString('es-CO')}`;
        document.getElementById('ventas-mes').textContent = `$${totalMes.toLocaleString('es-CO')}`;
        document.getElementById('total-productos').textContent = productosHoy;
        document.getElementById('clientes-activos').textContent = clientesActivos;
        
        // Comparaciones
        const cambioAyer = totalAyer > 0 ? ((totalHoy - totalAyer) / totalAyer * 100) : 0;
        const simboloAyer = cambioAyer >= 0 ? '📈' : '📉';
        document.getElementById('comparacion-ayer').textContent = `${simboloAyer} ${Math.abs(cambioAyer).toFixed(1)}% vs ayer`;
        
        document.getElementById('comparacion-productos').textContent = `${productosHoy} items`;
        document.getElementById('comparacion-clientes').textContent = `de ${this.clientes.length} total`;
    }

    actualizarDashboard() {
        const periodo = document.getElementById('periodo-dashboard')?.value || 'mes';
        const container = document.getElementById('dashboard-contenido');
        
        if (!container) return;

        const datos = this.obtenerDatosPorPeriodo(periodo);
        
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="grafico-container">
                    <h3>📈 Ventas por Día</h3>
                    <div id="grafico-ventas-diarias">
                        ${this.generarGraficoVentasDiarias(datos)}
                    </div>
                </div>
                
                <div class="grafico-container">
                    <h3>🍽️ Productos Más Vendidos</h3>
                    <div id="top-productos">
                        ${this.generarTopProductos(datos)}
                    </div>
                </div>
                
                <div class="grafico-container">
                    <h3>💰 Resumen de Ventas</h3>
                    <div id="resumen-ventas">
                        ${this.generarResumenVentas(datos)}
                    </div>
                </div>
                
                <div class="grafico-container">
                    <h3>👥 Top Clientes</h3>
                    <div id="top-clientes">
                        ${this.generarTopClientes(datos)}
                    </div>
                </div>
            </div>
        `;
    }

    obtenerDatosPorPeriodo(periodo) {
        const hoy = new Date();
        let fechaInicio;

        switch (periodo) {
            case 'hoy':
                fechaInicio = new Date(hoy.getTime());
                break;
            case 'semana':
                fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'mes':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                break;
            case 'trimestre':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
                break;
            case 'año':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                break;
            default:
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        }

        return this.ventas.filter(venta => {
            const fechaVenta = new Date(venta.fecha);
            return fechaVenta >= fechaInicio && fechaVenta <= hoy;
        });
    }

    generarGraficoVentasDiarias(ventas) {
        const ventasPorDia = {};
        
        ventas.forEach(venta => {
            const fecha = venta.fechaFormateada;
            if (!ventasPorDia[fecha]) {
                ventasPorDia[fecha] = 0;
            }
            ventasPorDia[fecha] += venta.total;
        });

        const fechas = Object.keys(ventasPorDia).sort();
        
        if (fechas.length === 0) {
            return '<div class="sin-datos">No hay datos para mostrar</div>';
        }

        const maxVenta = Math.max(...Object.values(ventasPorDia));
        
        return `
            <div class="grafico-barras">
                ${fechas.map(fecha => {
                    const valor = ventasPorDia[fecha];
                    const altura = (valor / maxVenta) * 100;
                    return `
                        <div class="barra-container">
                            <div class="barra" style="height: ${altura}%"></div>
                            <div class="barra-valor">$${valor.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
                            <div class="barra-fecha">${new Date(fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    generarTopProductos(ventas) {
        const productosVendidos = {};
        
        ventas.forEach(venta => {
            if (venta.items) {
                venta.items.forEach(item => {
                    const producto = this.productos[item.key];
                    if (producto) {
                        if (!productosVendidos[item.key]) {
                            productosVendidos[item.key] = {
                                nombre: producto.nombre,
                                cantidad: 0,
                                ingresos: 0
                            };
                        }
                        productosVendidos[item.key].cantidad += item.cantidad;
                        productosVendidos[item.key].ingresos += item.subtotal;
                    }
                });
            }
        });

        const topProductos = Object.values(productosVendidos)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        if (topProductos.length === 0) {
            return '<div class="sin-datos">No hay productos vendidos</div>';
        }

        return `
            <div class="top-lista">
                ${topProductos.map((producto, index) => `
                    <div class="top-item">
                        <div class="top-numero">${index + 1}</div>
                        <div class="top-info">
                            <div class="top-nombre">${producto.nombre}</div>
                            <div class="top-stats">${producto.cantidad} vendidos • $${producto.ingresos.toLocaleString('es-CO')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarResumenVentas(ventas) {
        const totalVentas = ventas.length;
        const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
        const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;
        const totalDescuentos = ventas.reduce((sum, v) => sum + (v.descuentoMonto || 0), 0);

        return `
            <div class="resumen-grid">
                <div class="resumen-item">
                    <div class="resumen-numero">${totalVentas}</div>
                    <div class="resumen-label">Total Ventas</div>
                </div>
                <div class="resumen-item">
                    <div class="resumen-numero">$${totalIngresos.toLocaleString('es-CO')}</div>
                    <div class="resumen-label">Ingresos Totales</div>
                </div>
                <div class="resumen-item">
                    <div class="resumen-numero">$${promedioVenta.toLocaleString('es-CO')}</div>
                    <div class="resumen-label">Promedio por Venta</div>
                </div>
                <div class="resumen-item">
                    <div class="resumen-numero">$${totalDescuentos.toLocaleString('es-CO')}</div>
                    <div class="resumen-label">Total Descuentos</div>
                </div>
            </div>
        `;
    }

    generarTopClientes(ventas) {
        const clientesVentas = {};
        
        ventas.forEach(venta => {
            if (venta.idCliente) {
                if (!clientesVentas[venta.idCliente]) {
                    clientesVentas[venta.idCliente] = {
                        total: 0,
                        compras: 0
                    };
                }
                clientesVentas[venta.idCliente].total += venta.total;
                clientesVentas[venta.idCliente].compras += 1;
            }
        });

        const topClientes = Object.entries(clientesVentas)
            .map(([clienteId, datos]) => {
                const cliente = this.clientes.find(c => c.id === clienteId);
                return {
                    nombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : `Cliente ${clienteId}`,
                    ...datos
                };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        if (topClientes.length === 0) {
            return '<div class="sin-datos">No hay datos de clientes</div>';
        }

        return `
            <div class="top-lista">
                ${topClientes.map((cliente, index) => `
                    <div class="top-item">
                        <div class="top-numero">${index + 1}</div>
                        <div class="top-info">
                            <div class="top-nombre">${cliente.nombre}</div>
                            <div class="top-stats">${cliente.compras} compras • $${cliente.total.toLocaleString('es-CO')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarReporteVentas() {
        const fechaInicio = document.getElementById('fecha-inicio-ventas').value;
        const fechaFin = document.getElementById('fecha-fin-ventas').value;
        const vendedorFiltro = document.getElementById('vendedor-filtro').value;
        
        let ventasFiltradas = this.ventas.filter(venta => {
            const fechaVenta = venta.fechaFormateada;
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });

        if (vendedorFiltro) {
            ventasFiltradas = ventasFiltradas.filter(v => v.vendedor === vendedorFiltro);
        }

        const container = document.getElementById('resultado-ventas');
        
        if (ventasFiltradas.length === 0) {
            container.innerHTML = '<div class="sin-datos">No hay ventas en el período seleccionado</div>';
            return;
        }

        const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
        const totalDescuentos = ventasFiltradas.reduce((sum, v) => sum + (v.descuentoMonto || 0), 0);

        container.innerHTML = `
            <div class="reporte-resumen">
                <h3>📊 Resumen del Período</h3>
                <div class="resumen-grid">
                    <div class="resumen-item">
                        <strong>${ventasFiltradas.length}</strong><br>Ventas Realizadas
                    </div>
                    <div class="resumen-item">
                        <strong>$${totalVentas.toLocaleString('es-CO')}</strong><br>Ingresos Totales
                    </div>
                    <div class="resumen-item">
                        <strong>$${(totalVentas / ventasFiltradas.length).toLocaleString('es-CO')}</strong><br>Promedio por Venta
                    </div>
                    <div class="resumen-item">
                        <strong>$${totalDescuentos.toLocaleString('es-CO')}</strong><br>Total Descuentos
                    </div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Número Venta</th>
                        <th>Cliente</th>
                        <th>Vendedor</th>
                        <th>Items</th>
                        <th>Subtotal</th>
                        <th>Descuento</th>
                        <th>Total</th>
                        <th>Método Pago</th>
                    </tr>
                </thead>
                <tbody>
                    ${ventasFiltradas.map(venta => `
                        <tr>
                            <td>${new Date(venta.fecha).toLocaleDateString()}</td>
                            <td>${venta.id}</td>
                            <td>${venta.cliente || venta.idCliente || 'N/A'}</td>
                            <td>${venta.vendedor}</td>
                            <td>${venta.items?.length || 0}</td>
                            <td>$${venta.subtotal.toLocaleString('es-CO')}</td>
                            <td>$${(venta.descuentoMonto || 0).toLocaleString('es-CO')}</td>
                            <td><strong>$${venta.total.toLocaleString('es-CO')}</strong></td>
                            <td>${venta.metodoPago}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    analizarProductos() {
        const categoria = document.getElementById('categoria-filtro').value;
        const periodo = document.getElementById('periodo-productos').value;
        
        const ventasDelPeriodo = this.obtenerDatosPorPeriodo(periodo);
        const container = document.getElementById('resultado-productos');
        
        // Análisis avanzado de productos
        const productosVendidos = {};
        const ventasPorDia = {};
        
        ventasDelPeriodo.forEach(venta => {
            const fecha = venta.fechaFormateada;
            if (!ventasPorDia[fecha]) ventasPorDia[fecha] = {};

            if (venta.items) {
                venta.items.forEach(item => {
                    const producto = this.productos[item.key];
                    if (producto && (!categoria || producto.categoria === categoria)) {
                        if (!productosVendidos[item.key]) {
                            productosVendidos[item.key] = {
                                nombre: producto.nombre,
                                categoria: producto.categoria,
                                subcategoria: producto.subcategoria,
                                precio: producto.precio,
                                cantidad: 0,
                                ingresos: 0,
                                frecuencia: 0,
                                ventasPorDia: {},
                                margenBruto: 0,
                                rotacion: 0,
                                tendencia: 'neutral'
                            };
                        }
                        
                        // Datos básicos
                        productosVendidos[item.key].cantidad += item.cantidad;
                        productosVendidos[item.key].ingresos += item.subtotal;
                        productosVendidos[item.key].frecuencia += 1;
                        
                        // Ventas por día para análisis de tendencias
                        if (!productosVendidos[item.key].ventasPorDia[fecha]) {
                            productosVendidos[item.key].ventasPorDia[fecha] = 0;
                        }
                        productosVendidos[item.key].ventasPorDia[fecha] += item.cantidad;
                        
                        // Agregar al resumen diario
                        if (!ventasPorDia[fecha][item.key]) {
                            ventasPorDia[fecha][item.key] = 0;
                        }
                        ventasPorDia[fecha][item.key] += item.cantidad;
                    }
                });
            }
        });

        // Calcular métricas avanzadas
        Object.keys(productosVendidos).forEach(key => {
            const producto = productosVendidos[key];
            
            // Margen bruto estimado (precio - costo estimado del 40%)
            const costoEstimado = producto.precio * 0.4;
            producto.margenBruto = ((producto.precio - costoEstimado) / producto.precio) * 100;
            
            // Rotación (ventas diarias promedio)
            const diasConVentas = Object.keys(producto.ventasPorDia).length;
            producto.rotacion = diasConVentas > 0 ? producto.cantidad / diasConVentas : 0;
            
            // Análisis de tendencia (comparar primera y segunda mitad del período)
            const fechas = Object.keys(producto.ventasPorDia).sort();
            if (fechas.length >= 4) {
                const mitad = Math.floor(fechas.length / 2);
                const primeraMitad = fechas.slice(0, mitad);
                const segundaMitad = fechas.slice(mitad);
                
                const ventasPrimera = primeraMitad.reduce((sum, fecha) => 
                    sum + (producto.ventasPorDia[fecha] || 0), 0);
                const ventasSegunda = segundaMitad.reduce((sum, fecha) => 
                    sum + (producto.ventasPorDia[fecha] || 0), 0);
                
                const promedioPrimera = ventasPrimera / primeraMitad.length;
                const promedioSegunda = ventasSegunda / segundaMitad.length;
                
                if (promedioSegunda > promedioPrimera * 1.2) {
                    producto.tendencia = 'creciente';
                } else if (promedioSegunda < promedioPrimera * 0.8) {
                    producto.tendencia = 'decreciente';
                } else {
                    producto.tendencia = 'estable';
                }
            }
        });

        const productos = Object.values(productosVendidos).sort((a, b) => b.ingresos - a.ingresos);

        if (productos.length === 0) {
            container.innerHTML = '<div class="sin-datos">No hay datos de productos para el período seleccionado</div>';
            return;
        }

        container.innerHTML = `
            <div class="productos-analisis-avanzada">
                <h3>� Análisis Avanzado de Productos - ${periodo.charAt(0).toUpperCase() + periodo.slice(1)}</h3>
                
                <div class="metricas-resumen">
                    <div class="resumen-grid">
                        <div class="resumen-item">
                            <strong>${productos.length}</strong><br>Productos Analizados
                        </div>
                        <div class="resumen-item">
                            <strong>$${productos.reduce((sum, p) => sum + p.ingresos, 0).toLocaleString('es-CO')}</strong><br>Ingresos Totales
                        </div>
                        <div class="resumen-item">
                            <strong>${productos.reduce((sum, p) => sum + p.cantidad, 0)}</strong><br>Unidades Vendidas
                        </div>
                        <div class="resumen-item">
                            <strong>${productos.filter(p => p.tendencia === 'creciente').length}</strong><br>En Crecimiento
                        </div>
                    </div>
                </div>
                
                <div class="analisis-grid">
                    <div class="grafico-container">
                        <h4>📈 Análisis de Tendencias</h4>
                        ${this.generarAnalisisTendencias(productos)}
                    </div>
                    
                    <div class="grafico-container">
                        <h4>💰 Análisis de Rentabilidad</h4>
                        ${this.generarAnalisisRentabilidad(productos)}
                    </div>
                    
                    <div class="grafico-container">
                        <h4>🔄 Análisis de Rotación</h4>
                        ${this.generarAnalisisRotacion(productos)}
                    </div>
                    
                    <div class="grafico-container">
                        <h4>📊 Distribución por Categoría</h4>
                        ${this.generarDistribucionCategorias(productos)}
                    </div>
                </div>
                
                <div class="top-productos-grid">
                    <div class="grafico-container">
                        <h4>🏆 Top 10 Más Vendidos</h4>
                        ${this.generarTopProductosPorCantidad(productos.slice(0, 10))}
                    </div>
                    
                    <div class="grafico-container">
                        <h4>� Top 10 Más Rentables</h4>
                        ${this.generarTopProductosPorIngresos(productos.slice(0, 10))}
                    </div>
                </div>
                
                <div class="tabla-reportes">
                    <h4>📋 Tabla Detallada de Análisis</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Cantidad</th>
                                <th>Ingresos</th>
                                <th>Precio Unit.</th>
                                <th>Rotación/Día</th>
                                <th>Margen %</th>
                                <th>Tendencia</th>
                                <th>Rendimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productos.map(producto => `
                                <tr>
                                    <td><strong>${producto.nombre}</strong></td>
                                    <td>${producto.categoria}</td>
                                    <td>${producto.cantidad}</td>
                                    <td>$${producto.ingresos.toLocaleString('es-CO')}</td>
                                    <td>$${producto.precio.toLocaleString('es-CO')}</td>
                                    <td>${producto.rotacion.toFixed(1)}</td>
                                    <td>${producto.margenBruto.toFixed(1)}%</td>
                                    <td>
                                        <span class="tendencia-${producto.tendencia}">
                                            ${this.obtenerIconoTendencia(producto.tendencia)} ${producto.tendencia}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="rendimiento ${this.clasificarRendimiento(producto)}">
                                            ${this.obtenerTextoRendimiento(producto)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    generarTopProductosPorCantidad(productos) {
        const top5 = productos.sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
        const maxCantidad = Math.max(...top5.map(p => p.cantidad));
        
        return `
            <div class="top-productos-lista">
                ${top5.map((producto, index) => `
                    <div class="producto-bar">
                        <div class="producto-info">
                            <span class="producto-nombre">${producto.nombre}</span>
                            <span class="producto-valor">${producto.cantidad} unidades</span>
                        </div>
                        <div class="producto-barra">
                            <div class="barra-fill" style="width: ${(producto.cantidad / maxCantidad) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarTopProductosPorIngresos(productos) {
        const top5 = productos.sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);
        const maxIngresos = Math.max(...top5.map(p => p.ingresos));
        
        return `
            <div class="top-productos-lista">
                ${top5.map((producto, index) => `
                    <div class="producto-bar">
                        <div class="producto-info">
                            <span class="producto-nombre">${producto.nombre}</span>
                            <span class="producto-valor">$${producto.ingresos.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="producto-barra">
                            <div class="barra-fill" style="width: ${(producto.ingresos / maxIngresos) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    analizarClientes() {
        const tipoCliente = document.getElementById('tipo-cliente').value;
        const nivelLealtad = document.getElementById('nivel-lealtad').value;
        const container = document.getElementById('resultado-clientes');
        
        let clientesFiltrados = this.clientes;
        
        if (tipoCliente === 'vip') {
            clientesFiltrados = clientesFiltrados.filter(c => c.esVip);
        } else if (tipoCliente === 'frecuente') {
            clientesFiltrados = clientesFiltrados.filter(c => (c.totalCompras || 0) >= 5);
        } else if (tipoCliente === 'nuevo') {
            const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            clientesFiltrados = clientesFiltrados.filter(c => new Date(c.fechaRegistro) >= hace30Dias);
        }

        if (nivelLealtad) {
            // Filtrar por nivel de lealtad basado en puntos
            const rangosNiveles = {
                'bronce': [0, 499],
                'plata': [500, 1499],
                'oro': [1500, 4999],
                'diamante': [5000, 9999],
                'platino': [10000, Infinity]
            };
            
            const rango = rangosNiveles[nivelLealtad];
            if (rango) {
                clientesFiltrados = clientesFiltrados.filter(c => {
                    const puntos = c.puntos || 0;
                    return puntos >= rango[0] && puntos <= rango[1];
                });
            }
        }

        // Calcular estadísticas de compras para cada cliente
        const clientesConEstadisticas = clientesFiltrados.map(cliente => {
            const ventasCliente = this.ventas.filter(v => v.idCliente === cliente.id);
            const totalGastado = ventasCliente.reduce((sum, v) => sum + v.total, 0);
            const ultimaCompra = ventasCliente.length > 0 ? 
                Math.max(...ventasCliente.map(v => new Date(v.fecha).getTime())) : null;
            
            return {
                ...cliente,
                ventasRealizadas: ventasCliente.length,
                totalGastado: totalGastado,
                promedioCompra: ventasCliente.length > 0 ? totalGastado / ventasCliente.length : 0,
                ultimaCompra: ultimaCompra
            };
        });

        container.innerHTML = `
            <div class="clientes-analisis">
                <h3>👥 Análisis de Clientes</h3>
                
                <div class="clientes-resumen">
                    <div class="resumen-grid">
                        <div class="resumen-item">
                            <strong>${clientesConEstadisticas.length}</strong><br>Clientes Filtrados
                        </div>
                        <div class="resumen-item">
                            <strong>$${clientesConEstadisticas.reduce((sum, c) => sum + c.totalGastado, 0).toLocaleString('es-CO')}</strong><br>Total Gastado
                        </div>
                        <div class="resumen-item">
                            <strong>${(clientesConEstadisticas.reduce((sum, c) => sum + c.totalGastado, 0) / clientesConEstadisticas.length || 0).toLocaleString('es-CO')}</strong><br>Promedio por Cliente
                        </div>
                        <div class="resumen-item">
                            <strong>${clientesConEstadisticas.reduce((sum, c) => sum + c.ventasRealizadas, 0)}</strong><br>Compras Totales
                        </div>
                    </div>
                </div>
                
                <div class="tabla-reportes">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Email</th>
                                <th>Compras</th>
                                <th>Total Gastado</th>
                                <th>Promedio</th>
                                <th>Puntos</th>
                                <th>Última Compra</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clientesConEstadisticas
                                .sort((a, b) => b.totalGastado - a.totalGastado)
                                .map(cliente => `
                                <tr>
                                    <td><strong>${cliente.nombres} ${cliente.apellidos}</strong></td>
                                    <td>${cliente.email}</td>
                                    <td>${cliente.ventasRealizadas}</td>
                                    <td>$${cliente.totalGastado.toLocaleString('es-CO')}</td>
                                    <td>$${cliente.promedioCompra.toLocaleString('es-CO')}</td>
                                    <td>${cliente.puntos || 0}</td>
                                    <td>${cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString() : 'Nunca'}</td>
                                    <td>
                                        <span class="estado-${cliente.activo ? 'activo' : 'inactivo'}">
                                            ${cliente.activo ? '✅ Activo' : '❌ Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    analizarEmpleados() {
        const empleadoId = document.getElementById('empleado-seleccion').value;
        const fechaInicio = document.getElementById('fecha-inicio-empleados').value;
        const fechaFin = document.getElementById('fecha-fin-empleados').value;
        const container = document.getElementById('resultado-empleados');
        
        let empleadosFiltrados = empleadoId ? 
            this.empleados.filter(emp => emp.id === empleadoId) : 
            this.empleados;

        // Obtener ventas del período para cada empleado
        const ventasDelPeriodo = this.ventas.filter(venta => {
            const fechaVenta = venta.fechaFormateada;
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });

        const empleadosConEstadisticas = empleadosFiltrados.map(empleado => {
            const ventasEmpleado = ventasDelPeriodo.filter(v => v.vendedor === empleado.id);
            const totalVentas = ventasEmpleado.reduce((sum, v) => sum + v.total, 0);
            
            return {
                ...empleado,
                ventasRealizadas: ventasEmpleado.length,
                totalVentas: totalVentas,
                promedioVenta: ventasEmpleado.length > 0 ? totalVentas / ventasEmpleado.length : 0
            };
        });

        container.innerHTML = `
            <div class="empleados-analisis">
                <h3>👨‍💼 Análisis de Empleados</h3>
                <p>Período: ${new Date(fechaInicio).toLocaleDateString()} - ${new Date(fechaFin).toLocaleDateString()}</p>
                
                <div class="empleados-resumen">
                    <div class="resumen-grid">
                        <div class="resumen-item">
                            <strong>${empleadosConEstadisticas.length}</strong><br>Empleados Analizados
                        </div>
                        <div class="resumen-item">
                            <strong>${empleadosConEstadisticas.reduce((sum, e) => sum + e.ventasRealizadas, 0)}</strong><br>Ventas Totales
                        </div>
                        <div class="resumen-item">
                            <strong>$${empleadosConEstadisticas.reduce((sum, e) => sum + e.totalVentas, 0).toLocaleString('es-CO')}</strong><br>Ingresos Generados
                        </div>
                        <div class="resumen-item">
                            <strong>${(empleadosConEstadisticas.reduce((sum, e) => sum + e.ventasRealizadas, 0) / empleadosConEstadisticas.length || 0).toFixed(1)}</strong><br>Promedio Ventas/Empleado
                        </div>
                    </div>
                </div>
                
                <div class="tabla-reportes">
                    <table>
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Cargo</th>
                                <th>Ventas Realizadas</th>
                                <th>Total Vendido</th>
                                <th>Promedio por Venta</th>
                                <th>Estado</th>
                                <th>Fecha Ingreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${empleadosConEstadisticas
                                .sort((a, b) => b.totalVentas - a.totalVentas)
                                .map(empleado => `
                                <tr>
                                    <td><strong>${empleado.nombres} ${empleado.apellidos}</strong></td>
                                    <td>${empleado.cargo}</td>
                                    <td>${empleado.ventasRealizadas}</td>
                                    <td>$${empleado.totalVentas.toLocaleString('es-CO')}</td>
                                    <td>$${empleado.promedioVenta.toLocaleString('es-CO')}</td>
                                    <td>
                                        <span class="estado-${empleado.estado}">
                                            ${this.obtenerTextoEstado(empleado.estado)}
                                        </span>
                                    </td>
                                    <td>${new Date(empleado.fechaIngreso).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'activo': '✅ Activo',
            'inactivo': '❌ Inactivo',
            'vacaciones': '🏖️ Vacaciones',
            'licencia': '📋 Licencia'
        };
        return estados[estado] || estado;
    }

    // Métodos para análisis avanzado de productos
    generarAnalisisTendencias(productos) {
        const creciente = productos.filter(p => p.tendencia === 'creciente').length;
        const estable = productos.filter(p => p.tendencia === 'estable').length;
        const decreciente = productos.filter(p => p.tendencia === 'decreciente').length;
        const total = productos.length;

        return `
            <div class="tendencias-resumen">
                <div class="tendencia-item creciente">
                    <div class="tendencia-numero">${creciente}</div>
                    <div class="tendencia-label">📈 En Crecimiento</div>
                    <div class="tendencia-porcentaje">${((creciente/total)*100).toFixed(1)}%</div>
                </div>
                <div class="tendencia-item estable">
                    <div class="tendencia-numero">${estable}</div>
                    <div class="tendencia-label">📊 Estables</div>
                    <div class="tendencia-porcentaje">${((estable/total)*100).toFixed(1)}%</div>
                </div>
                <div class="tendencia-item decreciente">
                    <div class="tendencia-numero">${decreciente}</div>
                    <div class="tendencia-label">📉 En Declive</div>
                    <div class="tendencia-porcentaje">${((decreciente/total)*100).toFixed(1)}%</div>
                </div>
            </div>
            
            <div class="productos-por-tendencia">
                <h5>🚀 Productos en Crecimiento:</h5>
                <div class="lista-productos">
                    ${productos.filter(p => p.tendencia === 'creciente').slice(0, 5).map(p => 
                        `<span class="producto-tag creciente">${p.nombre}</span>`
                    ).join('')}
                </div>
                
                <h5>⚠️ Productos en Declive:</h5>
                <div class="lista-productos">
                    ${productos.filter(p => p.tendencia === 'decreciente').slice(0, 5).map(p => 
                        `<span class="producto-tag decreciente">${p.nombre}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    generarAnalisisRentabilidad(productos) {
        const altaRentabilidad = productos.filter(p => p.margenBruto >= 70).length;
        const mediaRentabilidad = productos.filter(p => p.margenBruto >= 50 && p.margenBruto < 70).length;
        const bajaRentabilidad = productos.filter(p => p.margenBruto < 50).length;

        const topRentables = productos
            .sort((a, b) => b.margenBruto - a.margenBruto)
            .slice(0, 5);

        return `
            <div class="rentabilidad-overview">
                <div class="rentabilidad-stats">
                    <div class="stat-item alta">
                        <span class="stat-numero">${altaRentabilidad}</span>
                        <span class="stat-label">Alta Rentabilidad (>70%)</span>
                    </div>
                    <div class="stat-item media">
                        <span class="stat-numero">${mediaRentabilidad}</span>
                        <span class="stat-label">Media Rentabilidad (50-70%)</span>
                    </div>
                    <div class="stat-item baja">
                        <span class="stat-numero">${bajaRentabilidad}</span>
                        <span class="stat-label">Baja Rentabilidad (<50%)</span>
                    </div>
                </div>
            </div>
            
            <div class="top-rentables">
                <h5>💎 Más Rentables:</h5>
                ${topRentables.map(producto => `
                    <div class="rentabilidad-item">
                        <span class="producto-nombre">${producto.nombre}</span>
                        <span class="rentabilidad-valor">${producto.margenBruto.toFixed(1)}%</span>
                        <div class="rentabilidad-bar">
                            <div class="bar-fill" style="width: ${producto.margenBruto}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarAnalisisRotacion(productos) {
        const rotacionPromedio = productos.reduce((sum, p) => sum + p.rotacion, 0) / productos.length;
        const altaRotacion = productos.filter(p => p.rotacion > rotacionPromedio * 1.5);
        const bajaRotacion = productos.filter(p => p.rotacion < rotacionPromedio * 0.5);

        const topRotacion = productos
            .sort((a, b) => b.rotacion - a.rotacion)
            .slice(0, 5);

        return `
            <div class="rotacion-overview">
                <div class="rotacion-stats">
                    <div class="stat-central">
                        <span class="stat-numero-grande">${rotacionPromedio.toFixed(1)}</span>
                        <span class="stat-label">Rotación Promedio/Día</span>
                    </div>
                </div>
                
                <div class="rotacion-categorias">
                    <div class="categoria-rotacion alta">
                        <span class="categoria-titulo">🔥 Alta Rotación (${altaRotacion.length})</span>
                        <div class="productos-mini">
                            ${altaRotacion.slice(0, 3).map(p => p.nombre).join(', ')}
                        </div>
                    </div>
                    <div class="categoria-rotacion baja">
                        <span class="categoria-titulo">🐌 Baja Rotación (${bajaRotacion.length})</span>
                        <div class="productos-mini">
                            ${bajaRotacion.slice(0, 3).map(p => p.nombre).join(', ')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="top-rotacion">
                <h5>⚡ Mayor Rotación:</h5>
                ${topRotacion.map(producto => `
                    <div class="rotacion-item">
                        <span class="producto-nombre">${producto.nombre}</span>
                        <span class="rotacion-valor">${producto.rotacion.toFixed(1)}/día</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generarDistribucionCategorias(productos) {
        const categorias = {};
        productos.forEach(producto => {
            if (!categorias[producto.categoria]) {
                categorias[producto.categoria] = {
                    cantidad: 0,
                    ingresos: 0,
                    productos: 0
                };
            }
            categorias[producto.categoria].cantidad += producto.cantidad;
            categorias[producto.categoria].ingresos += producto.ingresos;
            categorias[producto.categoria].productos += 1;
        });

        const totalIngresos = Object.values(categorias).reduce((sum, cat) => sum + cat.ingresos, 0);

        return `
            <div class="distribucion-categorias">
                ${Object.entries(categorias).map(([categoria, datos]) => {
                    const porcentaje = (datos.ingresos / totalIngresos) * 100;
                    return `
                        <div class="categoria-item">
                            <div class="categoria-header">
                                <span class="categoria-nombre">${categoria}</span>
                                <span class="categoria-porcentaje">${porcentaje.toFixed(1)}%</span>
                            </div>
                            <div class="categoria-bar">
                                <div class="bar-fill" style="width: ${porcentaje}%"></div>
                            </div>
                            <div class="categoria-stats">
                                ${datos.productos} productos • ${datos.cantidad} vendidos • $${datos.ingresos.toLocaleString('es-CO')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    obtenerIconoTendencia(tendencia) {
        const iconos = {
            'creciente': '📈',
            'estable': '📊',
            'decreciente': '📉',
            'neutral': '➡️'
        };
        return iconos[tendencia] || '➡️';
    }

    clasificarRendimiento(producto) {
        // Clasificación basada en múltiples factores
        const factorIngresos = producto.ingresos > 50000 ? 2 : producto.ingresos > 20000 ? 1 : 0;
        const factorRotacion = producto.rotacion > 5 ? 2 : producto.rotacion > 2 ? 1 : 0;
        const factorTendencia = producto.tendencia === 'creciente' ? 2 : producto.tendencia === 'estable' ? 1 : 0;
        const factorMargen = producto.margenBruto > 70 ? 2 : producto.margenBruto > 50 ? 1 : 0;

        const puntuacion = factorIngresos + factorRotacion + factorTendencia + factorMargen;

        if (puntuacion >= 6) return 'excelente';
        if (puntuacion >= 4) return 'bueno';
        if (puntuacion >= 2) return 'regular';
        return 'necesita-atencion';
    }

    obtenerTextoRendimiento(producto) {
        const clasificacion = this.clasificarRendimiento(producto);
        const textos = {
            'excelente': '🌟 Excelente',
            'bueno': '✅ Bueno',
            'regular': '⚠️ Regular',
            'necesita-atencion': '🔴 Necesita Atención'
        };
        return textos[clasificacion] || '➡️ Sin Clasificar';
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
    if (seccionId === 'dashboard') {
        sistemaReportes.actualizarDashboard();
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.reportes-container')) {
        window.sistemaReportes = new SistemaReportes();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaReportes;
}