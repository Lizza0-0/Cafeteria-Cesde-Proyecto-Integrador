/**
 * Sistema de Gestión de Inventario - Cafetería Cesde
 * Controla stock, alertas, movimientos y reportes de inventario
 */

class SistemaInventario {
    constructor() {
        this.inventario = JSON.parse(localStorage.getItem('inventario')) || {};
        this.movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
        this.productos = this.initProductos();
        this.alertas = this.initAlertas();
        this.configuracionReabastecimiento = this.initConfiguracionReabastecimiento();
        this.init();
    }

    init() {
        this.renderizarInventario();
        this.configurarEventos();
        this.actualizarEstadisticas();
        this.renderizarAlertas();
        this.configurarFechaActual();
        this.configurarReabastecimientoAutomatico();
        
        // Actualizar alertas cada 30 segundos
        setInterval(() => {
            this.renderizarAlertas();
            this.actualizarEstadisticas();
        }, 30000);
    }

    initProductos() {
        // Reutilizar la estructura de productos del sistema de compras
        return {
            // Café Caliente
            'Cafe_Espresso_Caliente': { id: 52, nombre: 'Café Espresso', categoria: 'Café', subcategoria: 'Caliente', stockMinimo: 10, stockMaximo: 100, unidad: 'porciones' },
            'Cafe_Latte_Caliente': { id: 53, nombre: 'Café Latte', categoria: 'Café', subcategoria: 'Caliente', stockMinimo: 8, stockMaximo: 80, unidad: 'porciones' },
            'Cafe_Moka_Caliente': { id: 54, nombre: 'Café Moka', categoria: 'Café', subcategoria: 'Caliente', stockMinimo: 5, stockMaximo: 50, unidad: 'porciones' },
            'Cafe_Americano_Caliente': { id: 55, nombre: 'Café Americano', categoria: 'Café', subcategoria: 'Caliente', stockMinimo: 15, stockMaximo: 120, unidad: 'porciones' },
            'Cappuccino_Caliente': { id: 56, nombre: 'Cappuccino', categoria: 'Café', subcategoria: 'Caliente', stockMinimo: 8, stockMaximo: 80, unidad: 'porciones' },
            
            // Café Frío
            'Frappe': { id: 57, nombre: 'Frappe', categoria: 'Café', subcategoria: 'Frío', stockMinimo: 6, stockMaximo: 60, unidad: 'porciones' },
            'Cafe_Latte_Frio': { id: 58, nombre: 'Café Latte Frío', categoria: 'Café', subcategoria: 'Frío', stockMinimo: 8, stockMaximo: 80, unidad: 'porciones' },
            'Cafe_Americano_Frio': { id: 59, nombre: 'Café Americano Frío', categoria: 'Café', subcategoria: 'Frío', stockMinimo: 10, stockMaximo: 100, unidad: 'porciones' },
            'Cappuccino_Frio': { id: 60, nombre: 'Cappuccino Frío', categoria: 'Café', subcategoria: 'Frío', stockMinimo: 8, stockMaximo: 80, unidad: 'porciones' },
            'Cold_Brew': { id: 61, nombre: 'Cold Brew', categoria: 'Café', subcategoria: 'Frío', stockMinimo: 5, stockMaximo: 50, unidad: 'porciones' },
            
            // Pastelería Salada
            'Croissant_Mantequilla': { id: 14, nombre: 'Croissant de Mantequilla', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 12, stockMaximo: 48, unidad: 'unidades' },
            'Croissant_Integral': { id: 15, nombre: 'Croissant Integral', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 10, stockMaximo: 40, unidad: 'unidades' },
            'Croissant_Avena': { id: 16, nombre: 'Croissant de Avena', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 8, stockMaximo: 32, unidad: 'unidades' },
            'Croissant_Queso': { id: 17, nombre: 'Croissant de Queso', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 10, stockMaximo: 40, unidad: 'unidades' },
            'Pastel_Pollo': { id: 18, nombre: 'Pastel de Pollo', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 15, stockMaximo: 60, unidad: 'unidades' },
            'Pastel_Carne': { id: 19, nombre: 'Pastel de Carne', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 15, stockMaximo: 60, unidad: 'unidades' },
            'Pastel_Jamon_Queso': { id: 20, nombre: 'Pastel de Jamón y Queso', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 12, stockMaximo: 48, unidad: 'unidades' },
            'Pastel_Ranchero': { id: 21, nombre: 'Pastel Ranchero', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 8, stockMaximo: 32, unidad: 'unidades' },
            'Palito_Queso': { id: 22, nombre: 'Palito de Queso', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 20, stockMaximo: 80, unidad: 'unidades' },
            'Pan_Queso': { id: 23, nombre: 'Pan de Queso', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 25, stockMaximo: 100, unidad: 'unidades' },
            'Papa_Carne': { id: 24, nombre: 'Papa con Carne', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 10, stockMaximo: 40, unidad: 'unidades' },
            'Empanada_Pollo': { id: 25, nombre: 'Empanada de Pollo', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 30, stockMaximo: 120, unidad: 'unidades' },
            'Empanada_Carne': { id: 26, nombre: 'Empanada de Carne', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 30, stockMaximo: 120, unidad: 'unidades' },
            'Empanada_Queso': { id: 27, nombre: 'Empanada de Queso', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 25, stockMaximo: 100, unidad: 'unidades' },
            'Empanada_Papa': { id: 28, nombre: 'Empanada de Papa', categoria: 'Pastelería', subcategoria: 'Salada', stockMinimo: 20, stockMaximo: 80, unidad: 'unidades' },
            
            // Pastelería Dulce
            'Croissant_Chocolate': { id: 29, nombre: 'Croissant de Chocolate', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 10, stockMaximo: 40, unidad: 'unidades' },
            'Muffin_Arandano': { id: 30, nombre: 'Muffin con Arándanos', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 12, stockMaximo: 48, unidad: 'unidades' },
            'Muffin_Yogurt': { id: 31, nombre: 'Muffin con Yogurt', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 10, stockMaximo: 40, unidad: 'unidades' },
            'Muffin_Chocolate': { id: 32, nombre: 'Muffin de Chocolate', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 15, stockMaximo: 60, unidad: 'unidades' },
            'Pastel_Chocolate': { id: 33, nombre: 'Porción Pastel de Chocolate', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 8, stockMaximo: 24, unidad: 'porciones' },
            'Pastel_Fresa': { id: 34, nombre: 'Porción Pastel de Fresa', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 6, stockMaximo: 18, unidad: 'porciones' },
            'Pastel_Naranja': { id: 35, nombre: 'Porción Pastel de Naranja', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 6, stockMaximo: 18, unidad: 'porciones' },
            'Pastel_Banano': { id: 36, nombre: 'Porción Pastel de Banano', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 6, stockMaximo: 18, unidad: 'porciones' },
            'Pastel_Caramelo': { id: 37, nombre: 'Porción Pastel de Caramelo', categoria: 'Pastelería', subcategoria: 'Dulce', stockMinimo: 6, stockMaximo: 18, unidad: 'porciones' },
            
            // Desayunos
            'Sandwich_Pollo': { id: 38, nombre: 'Sándwich de Pollo', categoria: 'Desayunos', subcategoria: '', stockMinimo: 8, stockMaximo: 32, unidad: 'unidades' },
            'Wrap_Queso_Jamon': { id: 39, nombre: 'Wrap de Queso y Jamón', categoria: 'Desayunos', subcategoria: '', stockMinimo: 10, stockMaximo: 40, unidad: 'unidades' },
            'Desayuno_Sencillo': { id: 40, nombre: 'Desayuno Sencillo', categoria: 'Desayunos', subcategoria: '', stockMinimo: 6, stockMaximo: 24, unidad: 'porciones' },
            'Desayuno_Americano': { id: 41, nombre: 'Desayuno Americano', categoria: 'Desayunos', subcategoria: '', stockMinimo: 4, stockMaximo: 16, unidad: 'porciones' },
            'Desayuno_Ranchero': { id: 42, nombre: 'Desayuno Ranchero', categoria: 'Desayunos', subcategoria: '', stockMinimo: 5, stockMaximo: 20, unidad: 'porciones' },
            
            // Bebidas Frías
            'Te_Matcha_Frio': { id: 62, nombre: 'Té Matcha Frío', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 10, stockMaximo: 50, unidad: 'porciones' },
            'Chocolate_Frio': { id: 63, nombre: 'Chocolate Frío', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 12, stockMaximo: 60, unidad: 'porciones' },
            'Te_Chai_Frio': { id: 64, nombre: 'Té Chai Frío', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 8, stockMaximo: 40, unidad: 'porciones' },
            'Te_Taro_Frio': { id: 65, nombre: 'Té Taro Frío', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 6, stockMaximo: 30, unidad: 'porciones' },
            'Smoothie': { id: 66, nombre: 'Smoothie', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 8, stockMaximo: 32, unidad: 'porciones' },
            'Leche_Fria': { id: 11, nombre: 'Leche Fría', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 20, stockMaximo: 100, unidad: 'porciones' },
            'Malteada': { id: 67, nombre: 'Malteada', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 10, stockMaximo: 50, unidad: 'porciones' },
            'Limonada': { id: 68, nombre: 'Limonada', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 15, stockMaximo: 75, unidad: 'porciones' },
            'Agua': { id: 69, nombre: 'Agua', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 50, stockMaximo: 200, unidad: 'botellas' },
            'Gaseosa_PET': { id: 45, nombre: 'Gaseosa Pet 400', categoria: 'Bebidas', subcategoria: 'Frías', stockMinimo: 24, stockMaximo: 96, unidad: 'botellas' },
            
            // Bebidas Calientes
            'Te_Matcha_Caliente': { id: 70, nombre: 'Té Matcha Caliente', categoria: 'Bebidas', subcategoria: 'Calientes', stockMinimo: 10, stockMaximo: 50, unidad: 'porciones' },
            'Chocolate_Caliente': { id: 71, nombre: 'Chocolate Caliente', categoria: 'Bebidas', subcategoria: 'Calientes', stockMinimo: 15, stockMaximo: 75, unidad: 'porciones' },
            'Te_Chai_Caliente': { id: 72, nombre: 'Té Chai Caliente', categoria: 'Bebidas', subcategoria: 'Calientes', stockMinimo: 8, stockMaximo: 40, unidad: 'porciones' },
            'Te_Taro_Caliente': { id: 73, nombre: 'Té Taro Caliente', categoria: 'Bebidas', subcategoria: 'Calientes', stockMinimo: 6, stockMaximo: 30, unidad: 'porciones' },
            'Leche_Caliente': { id: 74, nombre: 'Leche Caliente', categoria: 'Bebidas', subcategoria: 'Calientes', stockMinimo: 20, stockMaximo: 100, unidad: 'porciones' },
            
            // Snacks
            'Rosquillas': { id: 47, nombre: 'Rosquillas', categoria: 'Snacks', subcategoria: '', stockMinimo: 30, stockMaximo: 120, unidad: 'unidades' },
            'Papas_Margarita': { id: 48, nombre: 'Papas Margarita', categoria: 'Snacks', subcategoria: '', stockMinimo: 20, stockMaximo: 80, unidad: 'paquetes' },
            'Galletas_Integrales': { id: 49, nombre: 'Galletas Integrales', categoria: 'Snacks', subcategoria: '', stockMinimo: 25, stockMaximo: 100, unidad: 'paquetes' },
            'Barra_Granola': { id: 50, nombre: 'Barra de Granola', categoria: 'Snacks', subcategoria: '', stockMinimo: 15, stockMaximo: 60, unidad: 'unidades' },
            'Mix_Frutos_Secos': { id: 51, nombre: 'Mix de Frutos Secos', categoria: 'Snacks', subcategoria: '', stockMinimo: 10, stockMaximo: 40, unidad: 'paquetes' }
        };
    }

    initAlertas() {
        return {
            stockCritico: 3,
            stockBajo: 10,
            diasVencimiento: 7,
            rotacionLenta: 30
        };
    }

    initConfiguracionReabastecimiento() {
        const configuracionGuardada = JSON.parse(localStorage.getItem('configuracionReabastecimiento'));
        if (configuracionGuardada) return configuracionGuardada;

        // Configuración por defecto
        return {
            habilitado: true,
            horarioEjecucion: '06:00', // 6:00 AM
            diasEjecucion: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
            modoAutomatico: true,
            notificarReabastecimiento: true,
            proveedorPredeterminado: 'Proveedor Central',
            tiempoEntrega: 24, // horas
            porcentajeReabastecimiento: 80, // % del stock máximo
            configuracionProductos: this.inicializarConfiguracionProductos()
        };
    }

    inicializarConfiguracionProductos() {
        const config = {};
        for (const [key, producto] of Object.entries(this.productos)) {
            config[key] = {
                reabastecimientoAutomatico: true,
                puntoReorden: Math.ceil(producto.stockMinimo * 1.5),
                cantidadReorden: Math.ceil(producto.stockMaximo * 0.8),
                proveedor: 'Proveedor Central',
                costoUnitario: this.calcularCostoEstimado(producto),
                tiempoEntrega: 24
            };
        }
        return config;
    }

    calcularCostoEstimado(producto) {
        // Simulación de costos basados en categoría
        const costosPorCategoria = {
            'Café': 800,
            'Pastelería': 600,
            'Desayunos': 1200,
            'Bebidas': 500,
            'Snacks': 400
        };
        return costosPorCategoria[producto.categoria] || 500;
    }

    renderizarAlertas() {
        const container = document.getElementById('alertas-container');
        if (!container) return;

        const alertas = this.generarAlertas();
        
        if (alertas.length === 0) {
            container.innerHTML = `
                <div class="sin-alertas">
                    <p><strong>¡Todo en orden!</strong></p>
                    <p>No hay alertas de inventario en este momento</p>
                </div>
            `;
            return;
        }

        // Actualizar título con contador
        const titulo = document.querySelector('.panel-alertas h3');
        if (titulo) {
            titulo.innerHTML = `🚨 Alertas de Inventario <span class="contador-alertas">${alertas.length}</span>`;
        }

        container.innerHTML = alertas.map(alerta => this.crearAlertaHTML(alerta)).join('');
        
        // Verificar alertas críticas para notificaciones
        this.verificarNotificacionesCriticas(alertas);
        
        // Configurar eventos de las alertas
        this.configurarEventosAlertas();
    }

    verificarNotificacionesCriticas(alertas) {
        const alertasCriticas = alertas.filter(a => a.tipo === 'critica');
        
        if (alertasCriticas.length > 0 && 'Notification' in window) {
            // Solicitar permiso para notificaciones si no se ha hecho
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.enviarNotificacionCritica(alertasCriticas);
                    }
                });
            } else if (Notification.permission === 'granted') {
                this.enviarNotificacionCritica(alertasCriticas);
            }
        }
    }

    enviarNotificacionCritica(alertasCriticas) {
        // Evitar spam de notificaciones
        const ultimaNotificacion = localStorage.getItem('ultimaNotificacionInventario');
        const ahora = Date.now();
        
        if (ultimaNotificacion && (ahora - parseInt(ultimaNotificacion)) < 300000) { // 5 minutos
            return;
        }

        const producto = alertasCriticas[0];
        const notification = new Notification('⚠️ ALERTA CRÍTICA - Inventario', {
            body: `Stock crítico: ${this.productos[producto.producto].nombre} (${producto.stock} unidades restantes)`,
            icon: 'Images/cafe cesde logo.jpg',
            badge: 'Images/cafe cesde logo.jpg',
            tag: 'inventario-critico',
            requireInteraction: true
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        localStorage.setItem('ultimaNotificacionInventario', ahora.toString());
    }

    // ================================================
    // SISTEMA DE REABASTECIMIENTO AUTOMÁTICO
    // ================================================

    verificarReabastecimientoAutomatico() {
        if (!this.configuracionReabastecimiento.habilitado) return;

        const ahora = new Date();
        const productos = this.identificarProductosParaReabastecer();
        
        if (productos.length > 0) {
            this.procesarReabastecimientoAutomatico(productos);
        }
    }

    identificarProductosParaReabastecer() {
        const productosParaReabastecer = [];
        
        for (const [key, producto] of Object.entries(this.productos)) {
            const stockActual = this.inventario[key] || 0;
            const config = this.configuracionReabastecimiento.configuracionProductos[key];
            
            if (!config || !config.reabastecimientoAutomatico) continue;
            
            // Verificar si el stock está por debajo del punto de reorden
            if (stockActual <= config.puntoReorden) {
                productosParaReabastecer.push({
                    key,
                    producto,
                    stockActual,
                    cantidadReorden: config.cantidadReorden,
                    proveedor: config.proveedor,
                    costoUnitario: config.costoUnitario,
                    tiempoEntrega: config.tiempoEntrega
                });
            }
        }
        
        return productosParaReabastecer;
    }

    procesarReabastecimientoAutomatico(productos) {
        const ordenCompra = this.generarOrdenCompra(productos);
        
        if (this.configuracionReabastecimiento.modoAutomatico) {
            // Simular reabastecimiento automático
            this.ejecutarReabastecimientoAutomatico(ordenCompra);
        } else {
            // Generar orden para aprobación manual
            this.generarOrdenParaAprobacion(ordenCompra);
        }
    }

    generarOrdenCompra(productos) {
        const orden = {
            id: `ORD-${Date.now()}`,
            fecha: new Date().toISOString(),
            proveedor: this.configuracionReabastecimiento.proveedorPredeterminado,
            productos: productos.map(p => ({
                productoKey: p.key,
                nombre: p.producto.nombre,
                cantidadSolicitada: p.cantidadReorden,
                costoUnitario: p.costoUnitario,
                costoTotal: p.cantidadReorden * p.costoUnitario,
                tiempoEntrega: p.tiempoEntrega
            })),
            costoTotal: productos.reduce((total, p) => total + (p.cantidadReorden * p.costoUnitario), 0),
            estado: 'pendiente',
            tipo: 'automatico'
        };

        return orden;
    }

    ejecutarReabastecimientoAutomatico(orden) {
        // Simular recepción automática de mercancía
        for (const item of orden.productos) {
            const stockActual = this.inventario[item.productoKey] || 0;
            this.inventario[item.productoKey] = stockActual + item.cantidadSolicitada;
            
            // Registrar movimiento
            this.registrarMovimiento(
                item.productoKey,
                item.cantidadSolicitada,
                'entrada',
                `Reabastecimiento automático - Orden: ${orden.id}`
            );
        }

        // Guardar cambios
        this.guardarInventario();
        this.guardarOrdenCompra(orden);

        // Notificar reabastecimiento
        if (this.configuracionReabastecimiento.notificarReabastecimiento) {
            this.notificarReabastecimiento(orden);
        }

        // Actualizar vistas
        this.renderizarInventario();
        this.renderizarAlertas();
        this.actualizarEstadisticas();
    }

    generarOrdenParaAprobacion(orden) {
        orden.estado = 'esperando_aprobacion';
        this.guardarOrdenCompra(orden);
        this.mostrarOrdenParaAprobacion(orden);
    }

    mostrarOrdenParaAprobacion(orden) {
        const mensaje = `
            📋 ORDEN DE COMPRA GENERADA
            
            ID: ${orden.id}
            Proveedor: ${orden.proveedor}
            Productos: ${orden.productos.length}
            Costo Total: $${orden.costoTotal.toLocaleString('es-CO')}
            
            ¿Desea aprobar esta orden de reabastecimiento?
        `;

        if (confirm(mensaje)) {
            this.aprobarOrdenCompra(orden.id);
        }
    }

    aprobarOrdenCompra(ordenId) {
        const ordenes = JSON.parse(localStorage.getItem('ordenesCompra')) || [];
        const orden = ordenes.find(o => o.id === ordenId);
        
        if (orden) {
            orden.estado = 'aprobada';
            orden.fechaAprobacion = new Date().toISOString();
            localStorage.setItem('ordenesCompra', JSON.stringify(ordenes));
            
            // Ejecutar reabastecimiento
            this.ejecutarReabastecimientoAutomatico(orden);
            
            this.mostrarMensaje(`✅ Orden ${ordenId} aprobada y ejecutada`, 'exito');
        }
    }

    guardarOrdenCompra(orden) {
        const ordenes = JSON.parse(localStorage.getItem('ordenesCompra')) || [];
        ordenes.push(orden);
        localStorage.setItem('ordenesCompra', JSON.stringify(ordenes));
    }

    notificarReabastecimiento(orden) {
        const mensaje = `🚚 Reabastecimiento completado: ${orden.productos.length} productos reabastecidos por $${orden.costoTotal.toLocaleString('es-CO')}`;
        this.mostrarMensaje(mensaje, 'exito', 5000);

        // Notificación del navegador si está habilitada
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📦 Reabastecimiento Completado', {
                body: `${orden.productos.length} productos reabastecidos automáticamente`,
                icon: 'Images/cafe cesde logo.jpg'
            });
        }
    }

    configurarReabastecimientoAutomatico() {
        // Ejecutar verificación cada hora
        setInterval(() => {
            this.verificarReabastecimientoAutomatico();
        }, 3600000); // 1 hora

        // Verificación inicial
        setTimeout(() => {
            this.verificarReabastecimientoAutomatico();
        }, 5000); // 5 segundos después de inicializar
        
        // Actualizar estado del panel
        this.actualizarPanelReabastecimiento();
    }

    actualizarPanelReabastecimiento() {
        const estadoElement = document.getElementById('reabastecimiento-estado');
        const proximaElement = document.getElementById('proxima-verificacion');
        const ultimaElement = document.getElementById('ultimo-reabastecimiento');
        
        if (estadoElement) {
            const estado = this.configuracionReabastecimiento.habilitado ? 'Activo' : 'Inactivo';
            estadoElement.textContent = estado;
            estadoElement.className = `status-value ${estado.toLowerCase()}`;
        }
        
        if (proximaElement) {
            const proxima = new Date(Date.now() + 3600000); // 1 hora desde ahora
            proximaElement.textContent = proxima.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        }
        
        if (ultimaElement) {
            const ordenes = JSON.parse(localStorage.getItem('ordenesCompra')) || [];
            const ultimaOrden = ordenes.filter(o => o.tipo === 'automatico').pop();
            if (ultimaOrden) {
                const fecha = new Date(ultimaOrden.fecha);
                ultimaElement.textContent = fecha.toLocaleString('es-CO');
            }
        }
        
        // Configurar eventos
        this.configurarEventosReabastecimiento();
    }

    configurarEventosReabastecimiento() {
        const btnEjecutar = document.getElementById('btn-ejecutar-reabastecimiento');
        const btnConfigurar = document.getElementById('btn-configurar-reabastecimiento');
        
        if (btnEjecutar) {
            btnEjecutar.addEventListener('click', () => {
                this.ejecutarReabastecimientoManual();
            });
        }
        
        if (btnConfigurar) {
            btnConfigurar.addEventListener('click', () => {
                this.mostrarModalConfiguracion();
            });
        }
    }

    ejecutarReabastecimientoManual() {
        this.mostrarMensaje('🔄 Ejecutando reabastecimiento manual...', 'info');
        
        const productos = this.identificarProductosParaReabastecer();
        
        if (productos.length === 0) {
            this.mostrarMensaje('✅ No hay productos que requieran reabastecimiento en este momento', 'exito');
            return;
        }
        
        const mensaje = `Se identificaron ${productos.length} productos para reabastecimiento:\n\n${productos.map(p => `• ${p.producto.nombre} (Stock: ${p.stockActual})`).join('\n')}\n\n¿Continuar con el reabastecimiento?`;
        
        if (confirm(mensaje)) {
            this.procesarReabastecimientoAutomatico(productos);
            this.actualizarPanelReabastecimiento();
        }
    }

    mostrarModalConfiguracion() {
        // Crear modal si no existe
        let modal = document.getElementById('modal-configuracion');
        if (!modal) {
            modal = this.crearModalConfiguracion();
            document.body.appendChild(modal);
        }
        
        // Llenar valores actuales
        this.llenarFormularioConfiguracion();
        
        // Mostrar modal
        modal.style.display = 'flex';
    }

    crearModalConfiguracion() {
        const modal = document.createElement('div');
        modal.id = 'modal-configuracion';
        modal.className = 'modal-configuracion';
        
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3>⚙️ Configuración de Reabastecimiento Automático</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <form id="form-configuracion">
                    <div class="config-grupo">
                        <label>Reabastecimiento Automático</label>
                        <div class="switch-container">
                            <label class="switch">
                                <input type="checkbox" id="config-habilitado">
                                <span class="slider"></span>
                            </label>
                            <span>Activar reabastecimiento automático</span>
                        </div>
                    </div>
                    
                    <div class="config-grupo">
                        <label for="config-horario">Horario de Ejecución</label>
                        <input type="time" id="config-horario" value="06:00">
                    </div>
                    
                    <div class="config-grupo">
                        <label for="config-proveedor">Proveedor Predeterminado</label>
                        <input type="text" id="config-proveedor" value="Proveedor Central">
                    </div>
                    
                    <div class="config-grupo">
                        <label for="config-porcentaje">Porcentaje de Reabastecimiento</label>
                        <input type="range" id="config-porcentaje" min="50" max="100" value="80">
                        <span id="porcentaje-valor">80%</span>
                    </div>
                    
                    <div class="config-grupo">
                        <label>Notificaciones</label>
                        <div class="switch-container">
                            <label class="switch">
                                <input type="checkbox" id="config-notificaciones">
                                <span class="slider"></span>
                            </label>
                            <span>Enviar notificaciones de reabastecimiento</span>
                        </div>
                    </div>
                    
                    <div class="reabastecimiento-acciones">
                        <button type="button" id="btn-guardar-config" class="btn btn-primary">💾 Guardar Configuración</button>
                        <button type="button" id="btn-cancelar-config" class="btn btn-secondary">❌ Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        // Configurar eventos del modal
        this.configurarEventosModal(modal);
        
        return modal;
    }

    configurarEventosModal(modal) {
        const btnCerrar = modal.querySelector('.modal-close');
        const btnCancelar = modal.querySelector('#btn-cancelar-config');
        const btnGuardar = modal.querySelector('#btn-guardar-config');
        const rangePorcentaje = modal.querySelector('#config-porcentaje');
        const spanPorcentaje = modal.querySelector('#porcentaje-valor');
        
        // Cerrar modal
        [btnCerrar, btnCancelar].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });
        
        // Actualizar porcentaje
        rangePorcentaje.addEventListener('input', (e) => {
            spanPorcentaje.textContent = e.target.value + '%';
        });
        
        // Guardar configuración
        btnGuardar.addEventListener('click', () => {
            this.guardarConfiguracion();
            modal.style.display = 'none';
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    llenarFormularioConfiguracion() {
        const config = this.configuracionReabastecimiento;
        
        document.getElementById('config-habilitado').checked = config.habilitado;
        document.getElementById('config-horario').value = config.horarioEjecucion;
        document.getElementById('config-proveedor').value = config.proveedorPredeterminado;
        document.getElementById('config-porcentaje').value = config.porcentajeReabastecimiento;
        document.getElementById('config-notificaciones').checked = config.notificarReabastecimiento;
        document.getElementById('porcentaje-valor').textContent = config.porcentajeReabastecimiento + '%';
    }

    guardarConfiguracion() {
        this.configuracionReabastecimiento.habilitado = document.getElementById('config-habilitado').checked;
        this.configuracionReabastecimiento.horarioEjecucion = document.getElementById('config-horario').value;
        this.configuracionReabastecimiento.proveedorPredeterminado = document.getElementById('config-proveedor').value;
        this.configuracionReabastecimiento.porcentajeReabastecimiento = parseInt(document.getElementById('config-porcentaje').value);
        this.configuracionReabastecimiento.notificarReabastecimiento = document.getElementById('config-notificaciones').checked;
        
        localStorage.setItem('configuracionReabastecimiento', JSON.stringify(this.configuracionReabastecimiento));
        
        this.mostrarMensaje('✅ Configuración guardada correctamente', 'exito');
        this.actualizarPanelReabastecimiento();
    }

    generarAlertas() {
        const alertas = [];
        
        for (const [key, producto] of Object.entries(this.productos)) {
            const stock = this.inventario[key] || 0;
            
            // Alerta de stock crítico
            if (stock <= this.alertas.stockCritico) {
                alertas.push({
                    id: `critico_${key}`,
                    tipo: 'critica',
                    icono: '🔴',
                    titulo: 'Stock Crítico',
                    descripcion: `${producto.nombre} tiene solo ${stock} ${producto.unidad}. ¡Reabastecimiento urgente!`,
                    producto: key,
                    stock: stock,
                    stockMinimo: producto.stockMinimo,
                    prioridad: 1
                });
            }
            // Alerta de stock bajo
            else if (stock <= this.alertas.stockBajo) {
                alertas.push({
                    id: `bajo_${key}`,
                    tipo: 'baja',
                    icono: '🟡',
                    titulo: 'Stock Bajo',
                    descripcion: `${producto.nombre} tiene ${stock} ${producto.unidad}. Considere reabastecer pronto.`,
                    producto: key,
                    stock: stock,
                    stockMinimo: producto.stockMinimo,
                    prioridad: 2
                });
            }
            
            // Alerta de rotación lenta (productos con mucho stock sin movimiento)
            if (stock > producto.stockMaximo * 1.2) {
                alertas.push({
                    id: `exceso_${key}`,
                    tipo: 'vencimiento',
                    icono: '📦',
                    titulo: 'Exceso de Stock',
                    descripcion: `${producto.nombre} tiene ${stock} ${producto.unidad}. Considere promociones para rotar inventario.`,
                    producto: key,
                    stock: stock,
                    stockMaximo: producto.stockMaximo,
                    prioridad: 3
                });
            }
        }
        
        // Ordenar por prioridad
        return alertas.sort((a, b) => a.prioridad - b.prioridad);
    }

    crearAlertaHTML(alerta) {
        const tipoClass = `alerta-${alerta.tipo}`;
        return `
            <div class="alerta-item ${tipoClass}" data-producto="${alerta.producto}">
                <div class="alerta-icono">${alerta.icono}</div>
                <div class="alerta-contenido">
                    <h4 class="alerta-titulo">${alerta.titulo}</h4>
                    <p class="alerta-descripcion">${alerta.descripcion}</p>
                </div>
                <div class="alerta-accion">
                    <button class="btn-alerta btn-reabastecer" data-producto="${alerta.producto}" data-accion="reabastecer">
                        📦 Reabastecer
                    </button>
                    <button class="btn-alerta btn-ver-detalle" data-producto="${alerta.producto}" data-accion="detalle">
                        👁️ Ver Detalle
                    </button>
                </div>
            </div>
        `;
    }

    configurarEventosAlertas() {
        // Evento para reabastecer desde alertas
        document.querySelectorAll('.btn-reabastecer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const producto = e.target.dataset.producto;
                this.reabastecerRapido(producto);
            });
        });

        // Evento para ver detalle
        document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const producto = e.target.dataset.producto;
                this.mostrarDetalleProducto(producto);
            });
        });
    }

    reabastecerRapido(productoKey) {
        const producto = this.productos[productoKey];
        if (!producto) return;

        const stockActual = this.inventario[productoKey] || 0;
        const stockOptimo = Math.ceil(producto.stockMaximo * 0.8); // 80% del máximo
        const cantidadReabastecer = stockOptimo - stockActual;

        if (cantidadReabastecer > 0) {
            this.inventario[productoKey] = stockOptimo;
            this.guardarInventario();
            
            // Registrar movimiento
            this.registrarMovimiento(productoKey, cantidadReabastecer, 'entrada', 'Reabastecimiento rápido desde alerta');
            
            // Mostrar mensaje de éxito
            this.mostrarMensaje(`✅ ${producto.nombre} reabastecido: +${cantidadReabastecer} ${producto.unidad}`, 'exito');
            
            // Actualizar vistas
            this.renderizarInventario();
            this.renderizarAlertas();
            this.actualizarEstadisticas();
        }
    }

    mostrarDetalleProducto(productoKey) {
        const producto = this.productos[productoKey];
        const stock = this.inventario[productoKey] || 0;
        
        if (!producto) return;

        // Encontrar el producto en la tabla y hacer scroll hacia él
        const fila = document.querySelector(`tr[data-producto="${productoKey}"]`);
        if (fila) {
            fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
            fila.style.background = 'rgba(255, 193, 7, 0.3)';
            setTimeout(() => {
                fila.style.background = '';
            }, 2000);
        }

        // Mostrar información detallada
        const info = `
            📊 Producto: ${producto.nombre}
            📦 Stock actual: ${stock} ${producto.unidad}
            ⚠️ Stock mínimo: ${producto.stockMinimo} ${producto.unidad}
            ✅ Stock máximo: ${producto.stockMaximo} ${producto.unidad}
            📈 Estado: ${this.obtenerEstadoStock(stock, producto)}
        `;
        
        this.mostrarMensaje(info, 'info', 5000);
    }

    obtenerEstadoStock(stock, producto) {
        if (stock <= this.alertas.stockCritico) return 'CRÍTICO';
        if (stock <= this.alertas.stockBajo) return 'BAJO';
        if (stock >= producto.stockMaximo) return 'EXCESO';
        if (stock >= producto.stockMinimo) return 'ÓPTIMO';
        return 'NORMAL';
    }

    configurarEventos() {
        // Eventos de botones principales
        const btnActualizar = document.getElementById('btn-actualizar-inventario');
        const btnReporte = document.getElementById('btn-generar-reporte');
        const btnExportar = document.getElementById('btn-exportar-excel');

        if (btnActualizar) {
            btnActualizar.addEventListener('click', () => this.actualizarInventarioManual());
        }

        if (btnReporte) {
            btnReporte.addEventListener('click', () => this.generarReporte());
        }

        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.exportarExcel());
        }

        // Eventos de filtros
        const filtroCategoria = document.getElementById('filtro-categoria');
        const filtroStock = document.getElementById('filtro-stock');
        const buscadorProducto = document.getElementById('buscador-producto');

        if (filtroCategoria) {
            filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        }

        if (filtroStock) {
            filtroStock.addEventListener('change', () => this.aplicarFiltros());
        }

        if (buscadorProducto) {
            buscadorProducto.addEventListener('input', () => this.aplicarFiltros());
        }

        // Eventos de inputs de stock
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('stock-input')) {
                this.actualizarStockProducto(e.target);
            }
        });

        // Eventos de botones de ajuste rápido (removidos)
        // document.addEventListener('click', (e) => {
        //     if (e.target.classList.contains('btn-stock-rapido')) {
        //         this.ajusteStockRapido(e.target);
        //     }
        // });
    }

    renderizarInventario() {
        const container = document.getElementById('inventario-container');
        if (!container) return;

        container.innerHTML = '';
        
        const categorias = this.agruparPorCategoria();
        
        for (const [categoria, productos] of Object.entries(categorias)) {
            const categoriaDiv = this.crearCategoriaInventarioHTML(categoria, productos);
            container.appendChild(categoriaDiv);
        }

        this.actualizarEstadisticas();
    }

    agruparPorCategoria() {
        const categorias = {};
        
        for (const [key, producto] of Object.entries(this.productos)) {
            if (!categorias[producto.categoria]) {
                categorias[producto.categoria] = {};
            }
            
            const subcategoria = producto.subcategoria || 'General';
            if (!categorias[producto.categoria][subcategoria]) {
                categorias[producto.categoria][subcategoria] = [];
            }
            
            const stockActual = this.inventario[key] || 0;
            categorias[producto.categoria][subcategoria].push({
                key,
                ...producto,
                stockActual
            });
        }
        
        return categorias;
    }

    crearCategoriaInventarioHTML(categoria, subcategorias) {
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'categoria-inventario';
        
        const iconos = {
            'Café': '☕',
            'Pastelería': '🥐',
            'Desayunos': '🍳',
            'Bebidas': '🥤',
            'Snacks': '🍿'
        };
        
        fieldset.innerHTML = `
            <legend>${iconos[categoria] || '📦'} ${categoria}</legend>
            <div class="subcategorias-inventario"></div>
        `;
        
        const container = fieldset.querySelector('.subcategorias-inventario');
        
        for (const [subcategoria, productos] of Object.entries(subcategorias)) {
            if (subcategoria !== 'General') {
                const h4 = document.createElement('h4');
                h4.innerHTML = this.getSubcategoriaIcon(subcategoria) + ' ' + subcategoria;
                container.appendChild(h4);
            }
            
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategoria-inventario';
            
            const tabla = this.crearTablaInventario(productos);
            subcategoriaDiv.appendChild(tabla);
            
            container.appendChild(subcategoriaDiv);
        }
        
        return fieldset;
    }

    getSubcategoriaIcon(subcategoria) {
        const iconos = {
            'Caliente': '🔥',
            'Frío': '🧊',
            'Salada': '🧂',
            'Dulce': '🍯',
            'Frías': '🧊',
            'Calientes': '🔥'
        };
        return iconos[subcategoria] || '';
    }

    crearTablaInventario(productos) {
        const tabla = document.createElement('div');
        tabla.className = 'tabla-inventario';
        
        let html = `
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                <thead>
                    <tr style="height: 60px;">
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">ID</th>
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">Producto</th>
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">Stock Actual</th>
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">Unidad</th>
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">Stock Mín.</th>
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">Stock Máx.</th>
                        <th style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        productos.forEach(producto => {
            const estado = this.evaluarEstadoStock(producto);
            html += `
                <tr class="fila-producto" data-producto="${producto.key}" style="height: 60px;">
                    <td style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">${producto.id}</td>
                    <td class="nombre-producto" style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">
                        <strong>${producto.nombre}</strong>
                        <small>${producto.categoria}</small>
                    </td>
                    <td style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">
                        <input type="number" 
                               class="stock-input" 
                               value="${producto.stockActual}" 
                               min="0" 
                               max="${producto.stockMaximo}"
                               data-producto="${producto.key}"
                               style="height: 35px; width: 70px; padding: 5px; text-align: center;">
                    </td>
                    <td style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">${producto.unidad}</td>
                    <td class="stock-minimo" style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">${producto.stockMinimo}</td>
                    <td class="stock-maximo" style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">${producto.stockMaximo}</td>
                    <td style="height: 60px; padding: 15px 8px; vertical-align: middle; border-bottom: 1px solid #e8ddd4;">
                        <span class="estado-stock ${estado.clase}" style="display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 0.75rem;">${estado.texto}</span>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        tabla.innerHTML = html;
        return tabla;
    }

    evaluarEstadoStock(producto) {
        const stock = producto.stockActual;
        const minimo = producto.stockMinimo;
        const maximo = producto.stockMaximo;
        
        if (stock === 0) {
            return { clase: 'agotado', texto: 'AGOTADO' };
        } else if (stock <= this.alertas.stockCritico) {
            return { clase: 'critico', texto: 'CRÍTICO' };
        } else if (stock <= minimo) {
            return { clase: 'bajo', texto: 'BAJO' };
        } else if (stock >= maximo * 0.8) {
            return { clase: 'alto', texto: 'ALTO' };
        } else {
            return { clase: 'optimo', texto: 'ÓPTIMO' };
        }
    }

    actualizarStockProducto(input) {
        const productoKey = input.dataset.producto;
        const nuevoStock = parseInt(input.value) || 0;
        const producto = this.productos[productoKey];
        
        if (!producto) return;
        
        // Validar límites
        if (nuevoStock > producto.stockMaximo) {
            input.value = producto.stockMaximo;
            this.mostrarMensaje(`Stock máximo para ${producto.nombre}: ${producto.stockMaximo}`, 'warning');
            return;
        }
        
        if (nuevoStock < 0) {
            input.value = 0;
            return;
        }
        
        // Actualizar inventario
        this.inventario[productoKey] = nuevoStock;
        this.guardarInventario();
        
        // Registrar movimiento
        this.registrarMovimiento({
            tipo: 'ajuste_manual',
            producto: productoKey,
            cantidad: nuevoStock - (this.inventario[productoKey] || 0),
            stockAnterior: this.inventario[productoKey] || 0,
            stockNuevo: nuevoStock,
            fecha: new Date().toISOString(),
            usuario: 'admin', // Aquí iría el usuario logueado
            descripcion: 'Ajuste manual de inventario'
        });
        
        // Actualizar estado visual
        this.actualizarEstadoProducto(productoKey);
        this.actualizarEstadisticas();
        this.verificarAlertas();
    }

    // ajusteStockRapido(btn) {
    //     const accion = btn.dataset.accion;
    //     const productoKey = btn.dataset.producto;
    //     const producto = this.productos[productoKey];
    //     const stockActual = this.inventario[productoKey] || 0;
        
    //     let nuevoStock = stockActual;
        
    //     switch (accion) {
    //         case 'reabastecer':
    //             nuevoStock = Math.min(stockActual + 10, producto.stockMaximo);
    //             break;
    //         case 'reducir':
    //             nuevoStock = Math.max(stockActual - 5, 0);
    //             break;
    //         case 'maximo':
    //             nuevoStock = producto.stockMaximo;
    //             break;
    //     }
        
    //     // Actualizar input y disparar evento
    //     const input = document.querySelector(`input[data-producto="${productoKey}"]`);
    //     if (input) {
    //         input.value = nuevoStock;
    //         input.dispatchEvent(new Event('change'));
    //     }
    // }

    actualizarEstadoProducto(productoKey) {
        const fila = document.querySelector(`tr[data-producto="${productoKey}"]`);
        if (!fila) return;
        
        const producto = this.productos[productoKey];
        const stockActual = this.inventario[productoKey] || 0;
        const estado = this.evaluarEstadoStock({ ...producto, stockActual });
        
        const estadoSpan = fila.querySelector('.estado-stock');
        if (estadoSpan) {
            estadoSpan.className = `estado-stock ${estado.clase}`;
            estadoSpan.textContent = estado.texto;
        }
    }

    aplicarFiltros() {
        const categoria = document.getElementById('filtro-categoria')?.value || '';
        const stock = document.getElementById('filtro-stock')?.value || '';
        const busqueda = document.getElementById('buscador-producto')?.value.toLowerCase() || '';
        
        const filas = document.querySelectorAll('.fila-producto');
        
        filas.forEach(fila => {
            const productoKey = fila.dataset.producto;
            const producto = this.productos[productoKey];
            const stockActual = this.inventario[productoKey] || 0;
            
            let mostrar = true;
            
            // Filtro por categoría
            if (categoria && producto.categoria !== categoria) {
                mostrar = false;
            }
            
            // Filtro por estado de stock
            if (stock) {
                const estado = this.evaluarEstadoStock({ ...producto, stockActual });
                if (stock !== estado.clase) {
                    mostrar = false;
                }
            }
            
            // Filtro por búsqueda
            if (busqueda && !producto.nombre.toLowerCase().includes(busqueda)) {
                mostrar = false;
            }
            
            fila.style.display = mostrar ? '' : 'none';
        });
    }

    actualizarEstadisticas() {
        const stats = this.calcularEstadisticas();
        const alertas = this.generarAlertas();
        
        const containers = {
            'total-productos': stats.totalProductos,
            'productos-agotados': stats.agotados,
            'productos-criticos': stats.criticos,
            'productos-bajos': stats.bajos,
            'productos-optimos': stats.optimos,
            'valor-inventario': stats.valorTotal
        };
        
        for (const [id, valor] of Object.entries(containers)) {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'valor-inventario') {
                    element.textContent = `$${valor.toLocaleString('es-CO')}`;
                } else {
                    element.textContent = valor;
                }
                
                // Agregar indicador visual si hay alertas relacionadas
                this.actualizarIndicadorAlertas(element, id, alertas);
            }
        }
        
        this.actualizarAlertasVisual(stats, alertas);
    }

    actualizarIndicadorAlertas(element, tipo, alertas) {
        // Remover indicadores previos
        const existingIndicator = element.parentNode.querySelector('.alerta-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        let contadorAlertas = 0;
        
        if (tipo === 'productos-criticos') {
            contadorAlertas = alertas.filter(a => a.tipo === 'critica').length;
        } else if (tipo === 'productos-bajos') {
            contadorAlertas = alertas.filter(a => a.tipo === 'baja').length;
        }

        if (contadorAlertas > 0) {
            const indicator = document.createElement('span');
            indicator.className = 'alerta-indicator';
            indicator.textContent = '⚠️';
            indicator.title = `${contadorAlertas} alerta(s) activa(s)`;
            element.parentNode.appendChild(indicator);
        }
    }

    calcularEstadisticas() {
        let stats = {
            totalProductos: Object.keys(this.productos).length,
            agotados: 0,
            criticos: 0,
            bajos: 0,
            optimos: 0,
            altos: 0,
            valorTotal: 0
        };
        
        for (const [key, producto] of Object.entries(this.productos)) {
            const stockActual = this.inventario[key] || 0;
            const estado = this.evaluarEstadoStock({ ...producto, stockActual });
            
            switch (estado.clase) {
                case 'agotado':
                    stats.agotados++;
                    break;
                case 'critico':
                    stats.criticos++;
                    break;
                case 'bajo':
                    stats.bajos++;
                    break;
                case 'optimo':
                    stats.optimos++;
                    break;
                case 'alto':
                    stats.altos++;
                    break;
            }
            
            // Calcular valor estimado (necesitarías precios por producto)
            // stats.valorTotal += stockActual * (producto.precio || 0);
        }
        
        return stats;
    }

    verificarAlertas() {
        const alertas = this.generarAlertas();
        this.mostrarAlertas(alertas);
        return alertas;
    }

    generarAlertas() {
        const alertas = {
            criticas: [],
            bajas: [],
            vencimiento: [], // Para implementar en el futuro
            rotacionLenta: [] // Para implementar en el futuro
        };
        
        for (const [key, producto] of Object.entries(this.productos)) {
            const stockActual = this.inventario[key] || 0;
            
            if (stockActual === 0) {
                alertas.criticas.push({
                    tipo: 'agotado',
                    producto: producto.nombre,
                    mensaje: `${producto.nombre} está agotado`
                });
            } else if (stockActual <= this.alertas.stockCritico) {
                alertas.criticas.push({
                    tipo: 'stock_critico',
                    producto: producto.nombre,
                    stock: stockActual,
                    mensaje: `${producto.nombre} tiene stock crítico: ${stockActual} ${producto.unidad}`
                });
            } else if (stockActual <= producto.stockMinimo) {
                alertas.bajas.push({
                    tipo: 'stock_bajo',
                    producto: producto.nombre,
                    stock: stockActual,
                    minimo: producto.stockMinimo,
                    mensaje: `${producto.nombre} por debajo del mínimo: ${stockActual}/${producto.stockMinimo}`
                });
            }
        }
        
        return alertas;
    }

    mostrarAlertas(alertas) {
        const container = document.getElementById('alertas-container');
        if (!container) return;
        
        let html = '';
        
        if (alertas.criticas.length > 0) {
            html += `
                <div class="alerta-critica">
                    <h4>🚨 Alertas Críticas (${alertas.criticas.length})</h4>
                    <ul>
                        ${alertas.criticas.map(a => `<li>${a.mensaje}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (alertas.bajas.length > 0) {
            html += `
                <div class="alerta-bajo">
                    <h4>⚠️ Stock Bajo (${alertas.bajas.length})</h4>
                    <ul>
                        ${alertas.bajas.map(a => `<li>${a.mensaje}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (alertas.criticas.length === 0 && alertas.bajas.length === 0) {
            html = `
                <div class="alerta-optimo">
                    <h4>✅ Todo en Orden</h4>
                    <p>No hay alertas de inventario en este momento</p>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    actualizarAlertasVisual(stats) {
        const alertasContainer = document.getElementById('alertas-inventario');
        if (!alertasContainer) return;
        
        alertasContainer.innerHTML = `
            <div class="estadisticas-inventario">
                <div class="stat-item ${stats.criticos > 0 ? 'critico' : ''}">
                    <span class="stat-number">${stats.criticos}</span>
                    <span class="stat-label">Críticos</span>
                </div>
                <div class="stat-item ${stats.bajos > 0 ? 'bajo' : ''}">
                    <span class="stat-number">${stats.bajos}</span>
                    <span class="stat-label">Stock Bajo</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.optimos}</span>
                    <span class="stat-label">Óptimos</span>
                </div>
                <div class="stat-item ${stats.agotados > 0 ? 'agotado' : ''}">
                    <span class="stat-number">${stats.agotados}</span>
                    <span class="stat-label">Agotados</span>
                </div>
            </div>
        `;
    }

    registrarMovimiento(movimiento) {
        this.movimientos.push({
            id: this.generarIdMovimiento(),
            ...movimiento,
            fechaFormateada: new Date(movimiento.fecha).toLocaleString('es-CO')
        });
        
        localStorage.setItem('movimientos', JSON.stringify(this.movimientos));
    }

    generarIdMovimiento() {
        const fecha = new Date();
        return `MOV${fecha.getFullYear()}${(fecha.getMonth()+1).toString().padStart(2,'0')}${fecha.getDate().toString().padStart(2,'0')}${Date.now()}`;
    }

    actualizarInventarioManual() {
        this.mostrarMensaje('Actualizando inventario...', 'info');
        
        // Simular actualización
        setTimeout(() => {
            this.renderizarInventario();
            this.mostrarMensaje('Inventario actualizado correctamente', 'exito');
        }, 1000);
    }

    generarReporte() {
        const reporte = {
            fecha: new Date().toISOString(),
            estadisticas: this.calcularEstadisticas(),
            alertas: this.verificarAlertas(),
            productos: Object.entries(this.productos).map(([key, producto]) => ({
                ...producto,
                stockActual: this.inventario[key] || 0,
                estado: this.evaluarEstadoStock({ ...producto, stockActual: this.inventario[key] || 0 })
            }))
        };
        
        this.mostrarReporte(reporte);
    }

    mostrarReporte(reporte) {
        const ventanaReporte = window.open('', '_blank');
        const html = this.generarHTMLReporte(reporte);
        
        ventanaReporte.document.write(html);
        ventanaReporte.document.close();
        ventanaReporte.focus();
    }

    generarHTMLReporte(reporte) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Inventario - ${new Date().toLocaleDateString('es-CO')}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                    .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f5f5f5; }
                    .critico { color: #dc3545; font-weight: bold; }
                    .bajo { color: #ffc107; font-weight: bold; }
                    .optimo { color: #28a745; }
                    .agotado { color: #dc3545; background-color: #f8d7da; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Reporte de Inventario</h1>
                    <h2>Cafetería Cesde</h2>
                    <p>Generado el: ${new Date().toLocaleString('es-CO')}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <h3>${reporte.estadisticas.totalProductos}</h3>
                        <p>Total Productos</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="critico">${reporte.estadisticas.criticos}</h3>
                        <p>Stock Crítico</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="bajo">${reporte.estadisticas.bajos}</h3>
                        <p>Stock Bajo</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="optimo">${reporte.estadisticas.optimos}</h3>
                        <p>Stock Óptimo</p>
                    </div>
                </div>
                
                <h3>📋 Detalle de Productos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Unidad</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reporte.productos.map(p => `
                            <tr class="${p.estado.clase}">
                                <td>${p.id}</td>
                                <td>${p.nombre}</td>
                                <td>${p.categoria}</td>
                                <td>${p.stockActual}</td>
                                <td>${p.stockMinimo}</td>
                                <td>${p.unidad}</td>
                                <td>${p.estado.texto}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 50px; text-align: center; font-size: 0.9em; color: #666;">
                    <p>Reporte generado automáticamente por el Sistema de Inventario - Cafetería Cesde</p>
                </div>
            </body>
            </html>
        `;
    }

    exportarExcel() {
        this.mostrarMensaje('Exportando a Excel...', 'info');
        
        // Simular exportación
        setTimeout(() => {
            this.mostrarMensaje('Archivo Excel generado correctamente', 'exito');
            
            // Simular descarga
            const link = document.createElement('a');
            link.href = '#';
            link.download = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
        }, 2000);
    }

    guardarInventario() {
        localStorage.setItem('inventario', JSON.stringify(this.inventario));
    }

    configurarFechaActual() {
        const fechaInput = document.getElementById('fecha_inventario');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }
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

    // Métodos públicos para integración con otros sistemas
    obtenerStock(productoKey) {
        return this.inventario[productoKey] || 0;
    }

    actualizarStock(productoKey, nuevaCantidad) {
        if (this.productos[productoKey]) {
            this.inventario[productoKey] = nuevaCantidad;
            this.guardarInventario();
            this.actualizarEstadoProducto(productoKey);
            return true;
        }
        return false;
    }

    reducirStock(productoKey, cantidad) {
        const stockActual = this.inventario[productoKey] || 0;
        if (stockActual >= cantidad) {
            this.inventario[productoKey] = stockActual - cantidad;
            this.guardarInventario();
            
            this.registrarMovimiento({
                tipo: 'venta',
                producto: productoKey,
                cantidad: -cantidad,
                stockAnterior: stockActual,
                stockNuevo: stockActual - cantidad,
                fecha: new Date().toISOString(),
                descripcion: 'Venta registrada'
            });
            
            this.actualizarEstadoProducto(productoKey);
            return true;
        }
        return false;
    }

    obtenerMovimientos(filtros = {}) {
        let movimientos = [...this.movimientos];
        
        if (filtros.producto) {
            movimientos = movimientos.filter(m => m.producto === filtros.producto);
        }
        
        if (filtros.tipo) {
            movimientos = movimientos.filter(m => m.tipo === filtros.tipo);
        }
        
        if (filtros.fechaDesde) {
            movimientos = movimientos.filter(m => new Date(m.fecha) >= new Date(filtros.fechaDesde));
        }
        
        if (filtros.fechaHasta) {
            movimientos = movimientos.filter(m => new Date(m.fecha) <= new Date(filtros.fechaHasta));
        }
        
        return movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    obtenerEstadisticas() {
        return this.calcularEstadisticas();
    }

    obtenerAlertas() {
        return this.verificarAlertas();
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('inventario-container')) {
        window.sistemaInventario = new SistemaInventario();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaInventario;
}

