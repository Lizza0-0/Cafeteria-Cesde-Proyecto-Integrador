/**
 * Sistema de Compras - Cafetería Cesde
 * Gestiona el proceso completo de ventas con carrito, pagos y facturación
 */

class SistemaCompras {
    constructor() {
        this.carrito = [];
        this.productos = this.initProductos();
        this.combos = this.initCombos();
        this.descuentosHorarios = this.initDescuentosHorarios();
        this.inventario = this.initInventario();
        this.ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        this.empleados = JSON.parse(localStorage.getItem('empleados')) || [];
        this.programaLealtad = this.initProgramaLealtad();
        this.init();
    }

    init() {
        this.renderizarProductos();
        this.configurarEventos();
        this.actualizarResumen();
        this.generarNumeroCompra();
        this.configurarFechaActual();
        this.mostrarPromocionesActivas();
        
        // Actualizar promociones cada minuto
        setInterval(() => {
            this.mostrarPromocionesActivas();
            this.actualizarResumen(); // Recalcular precios con nuevas promociones
        }, 60000);
    }

    initProductos() {
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
            'Croissant_Integral': { id: 15, nombre: 'Croissant Integral', precio: 4000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Croissant_Avena': { id: 16, nombre: 'Croissant de Avena', precio: 4000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Croissant_Queso': { id: 17, nombre: 'Croissant de Queso', precio: 4500, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Pastel_Pollo': { id: 18, nombre: 'Pastel de Pollo', precio: 6000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Pastel_Carne': { id: 19, nombre: 'Pastel de Carne', precio: 6000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Pastel_Jamon_Queso': { id: 20, nombre: 'Pastel de Jamón y Queso', precio: 6000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Pastel_Ranchero': { id: 21, nombre: 'Pastel Ranchero', precio: 6500, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Palito_Queso': { id: 22, nombre: 'Palito de Queso', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Pan_Queso': { id: 23, nombre: 'Pan de Queso', precio: 2500, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Papa_Carne': { id: 24, nombre: 'Papa con Carne', precio: 7000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Empanada_Pollo': { id: 25, nombre: 'Empanada de Pollo', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Empanada_Carne': { id: 26, nombre: 'Empanada de Carne', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Empanada_Queso': { id: 27, nombre: 'Empanada de Queso', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            'Empanada_Papa': { id: 28, nombre: 'Empanada de Papa', precio: 3000, categoria: 'Pastelería', subcategoria: 'Salada' },
            
            // Pastelería Dulce
            'Croissant_Chocolate': { id: 29, nombre: 'Croissant de Chocolate', precio: 4500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Muffin_Arandano': { id: 30, nombre: 'Muffin con Arándanos', precio: 4000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Muffin_Yogurt': { id: 31, nombre: 'Muffin con Yogurt', precio: 4000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Muffin_Chocolate': { id: 32, nombre: 'Muffin de Chocolate', precio: 4000, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Pastel_Chocolate': { id: 33, nombre: 'Porción Pastel de Chocolate', precio: 5500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Pastel_Fresa': { id: 34, nombre: 'Porción Pastel de Fresa', precio: 5500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Pastel_Naranja': { id: 35, nombre: 'Porción Pastel de Naranja', precio: 5500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Pastel_Banano': { id: 36, nombre: 'Porción Pastel de Banano', precio: 5500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            'Pastel_Caramelo': { id: 37, nombre: 'Porción Pastel de Caramelo', precio: 5500, categoria: 'Pastelería', subcategoria: 'Dulce' },
            
            // Desayunos
            'Sandwich_Pollo': { id: 38, nombre: 'Sándwich de Pollo', precio: 7000, categoria: 'Desayunos', subcategoria: '' },
            'Wrap_Queso_Jamon': { id: 39, nombre: 'Wrap de Queso y Jamón', precio: 6500, categoria: 'Desayunos', subcategoria: '' },
            'Desayuno_Sencillo': { id: 40, nombre: 'Desayuno Sencillo', precio: 8000, categoria: 'Desayunos', subcategoria: '' },
            'Desayuno_Americano': { id: 41, nombre: 'Desayuno Americano', precio: 10000, categoria: 'Desayunos', subcategoria: '' },
            'Desayuno_Ranchero': { id: 42, nombre: 'Desayuno Ranchero', precio: 9500, categoria: 'Desayunos', subcategoria: '' },
            
            // Bebidas Frías
            'Te_Matcha_Frio': { id: 62, nombre: 'Té Matcha Frío', precio: 5000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Chocolate_Frio': { id: 63, nombre: 'Chocolate Frío', precio: 4500, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Te_Chai_Frio': { id: 64, nombre: 'Té Chai Frío', precio: 5000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Te_Taro_Frio': { id: 65, nombre: 'Té Taro Frío', precio: 5000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Smoothie': { id: 66, nombre: 'Smoothie', precio: 7000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Leche_Fria': { id: 11, nombre: 'Leche Fría', precio: 2500, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Malteada': { id: 67, nombre: 'Malteada', precio: 6000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Limonada': { id: 68, nombre: 'Limonada', precio: 3000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Agua': { id: 69, nombre: 'Agua', precio: 2000, categoria: 'Bebidas', subcategoria: 'Frías' },
            'Gaseosa_PET': { id: 45, nombre: 'Gaseosa Pet 400', precio: 3500, categoria: 'Bebidas', subcategoria: 'Frías' },
            
            // Bebidas Calientes
            'Te_Matcha_Caliente': { id: 70, nombre: 'Té Matcha Caliente', precio: 5000, categoria: 'Bebidas', subcategoria: 'Calientes' },
            'Chocolate_Caliente': { id: 71, nombre: 'Chocolate Caliente', precio: 4500, categoria: 'Bebidas', subcategoria: 'Calientes' },
            'Te_Chai_Caliente': { id: 72, nombre: 'Té Chai Caliente', precio: 5000, categoria: 'Bebidas', subcategoria: 'Calientes' },
            'Te_Taro_Caliente': { id: 73, nombre: 'Té Taro Caliente', precio: 5000, categoria: 'Bebidas', subcategoria: 'Calientes' },
            'Leche_Caliente': { id: 74, nombre: 'Leche Caliente', precio: 2500, categoria: 'Bebidas', subcategoria: 'Calientes' },
            
            // Snacks
            'Rosquillas': { id: 47, nombre: 'Rosquillas', precio: 2000, categoria: 'Snacks', subcategoria: '' },
            'Papas_Margarita': { id: 48, nombre: 'Papas Margarita', precio: 3000, categoria: 'Snacks', subcategoria: '' },
            'Galletas_Integrales': { id: 49, nombre: 'Galletas Integrales', precio: 2500, categoria: 'Snacks', subcategoria: '' },
            'Barra_Granola': { id: 50, nombre: 'Barra de Granola', precio: 3000, categoria: 'Snacks', subcategoria: '' },
            'Mix_Frutos_Secos': { id: 51, nombre: 'Mix de Frutos Secos', precio: 4000, categoria: 'Snacks', subcategoria: '' }
        };
    }

    initCombos() {
        return {
            // Combos Desayuno
            'Combo_Cafe_Croissant': {
                id: 101,
                nombre: 'Combo Café + Croissant',
                descripcion: 'Café Americano + Croissant de Mantequilla',
                precio: 6000,
                precioNormal: 7000,
                descuento: 14,
                categoria: 'Combos',
                subcategoria: 'Desayuno',
                productos: ['Cafe_Americano_Caliente', 'Croissant_Mantequilla'],
                icono: '☕🥐'
            },
            'Combo_Latte_Muffin': {
                id: 102,
                nombre: 'Combo Latte + Muffin',
                descripcion: 'Café Latte + Muffin de Chocolate',
                precio: 7500,
                precioNormal: 8500,
                descuento: 12,
                categoria: 'Combos',
                subcategoria: 'Desayuno',
                productos: ['Cafe_Latte_Caliente', 'Muffin_Chocolate'],
                icono: '☕🧁'
            },
            
            // Combos Merienda
            'Combo_Frappe_Pastel': {
                id: 103,
                nombre: 'Combo Frappé + Pastel',
                descripcion: 'Frappé + Porción de Pastel de Chocolate',
                precio: 10500,
                precioNormal: 11500,
                descuento: 9,
                categoria: 'Combos',
                subcategoria: 'Merienda',
                productos: ['Frappe', 'Pastel_Chocolate'],
                icono: '🥤🍰'
            },
            'Combo_Cappuccino_Empanada': {
                id: 104,
                nombre: 'Combo Cappuccino + Empanada',
                descripcion: 'Cappuccino + Empanada de Pollo',
                precio: 7000,
                precioNormal: 7500,
                descuento: 7,
                categoria: 'Combos',
                subcategoria: 'Merienda',
                productos: ['Cappuccino_Caliente', 'Empanada_Pollo'],
                icono: '☕🥟'
            },
            
            // Combos Ejecutivos
            'Combo_Americano_Sandwich': {
                id: 105,
                nombre: 'Combo Ejecutivo',
                descripcion: 'Café Americano + Sándwich de Pollo',
                precio: 9500,
                precioNormal: 10500,
                descuento: 10,
                categoria: 'Combos',
                subcategoria: 'Ejecutivo',
                productos: ['Cafe_Americano_Caliente', 'Sandwich_Pollo'],
                icono: '☕🥪'
            },
            'Combo_Desayuno_Completo': {
                id: 106,
                nombre: 'Combo Desayuno Completo',
                descripcion: 'Desayuno Americano + Café Latte',
                precio: 13500,
                precioNormal: 14500,
                descuento: 7,
                categoria: 'Combos',
                subcategoria: 'Ejecutivo',
                productos: ['Desayuno_Americano', 'Cafe_Latte_Caliente'],
                icono: '🍳☕'
            }
        };
    }

    initDescuentosHorarios() {
        return {
            'happy_hour_matutino': {
                nombre: 'Happy Hour Matutino',
                descripcion: 'Descuento especial en café para empezar el día',
                descuento: 15,
                horaInicio: '07:00',
                horaFin: '09:00',
                diasSemana: [1, 2, 3, 4, 5], // Lunes a Viernes
                categorias: ['Café'],
                activo: true,
                icono: '🌅'
            },
            'happy_hour_vespertino': {
                nombre: 'Happy Hour Vespertino',
                descripcion: 'Descuento en bebidas frías y postres',
                descuento: 20,
                horaInicio: '15:00',
                horaFin: '17:00',
                diasSemana: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
                categorias: ['Bebidas', 'Pastelería'],
                subcategorias: ['Frías', 'Dulce'],
                activo: true,
                icono: '🌆'
            },
            'viernes_estudiante': {
                nombre: 'Viernes de Estudiante',
                descripcion: 'Descuento especial para estudiantes los viernes',
                descuento: 25,
                horaInicio: '12:00',
                horaFin: '18:00',
                diasSemana: [5], // Solo viernes
                categorias: ['Combos', 'Snacks'],
                requiereTipoUsuario: 'estudiante',
                activo: true,
                icono: '🎓'
            },
            'noche_cafe': {
                nombre: 'Noche del Café',
                descripcion: 'Descuento en café caliente en horario nocturno',
                descuento: 10,
                horaInicio: '18:00',
                horaFin: '20:00',
                diasSemana: [1, 2, 3, 4, 5],
                categorias: ['Café'],
                subcategorias: ['Caliente'],
                activo: true,
                icono: '🌙'
            }
        };
    }

    initProgramaLealtad() {
        return {
            configuracion: {
                puntosXPeso: 1, // 1 punto por cada peso gastado
                descuentoX100Puntos: 1000, // $1000 de descuento por cada 100 puntos
                multiplicadorVip: 2, // Clientes VIP ganan el doble de puntos
                puntosMinimosDescuento: 50, // Mínimo 50 puntos para usar descuento
                vigenciaPuntos: 365 // Puntos válidos por 365 días
            },
            niveles: {
                bronce: { min: 0, max: 499, nombre: 'Bronce', icono: '🥉', descuento: 0 },
                plata: { min: 500, max: 1499, nombre: 'Plata', icono: '🥈', descuento: 5 },
                oro: { min: 1500, max: 4999, nombre: 'Oro', icono: '🥇', descuento: 10 },
                diamante: { min: 5000, max: 9999, nombre: 'Diamante', icono: '💎', descuento: 15 },
                platino: { min: 10000, max: Infinity, nombre: 'Platino', icono: '👑', descuento: 20 }
            },
            beneficiosEspeciales: {
                cumpleanos: { descuento: 25, vigencia: 7 }, // 25% descuento en cumpleaños por 7 días
                aniversario: { descuento: 20, vigencia: 3 }, // 20% descuento en aniversario por 3 días
                recomendacion: { puntos: 200 } // 200 puntos por recomendar un cliente nuevo
            }
        };
    }

    initInventario() {
        const inventarioGuardado = JSON.parse(localStorage.getItem('inventario'));
        if (inventarioGuardado) return inventarioGuardado;
        
        // Inventario inicial
        const inventario = {};
        
        // Agregar productos regulares
        for (const [key, producto] of Object.entries(this.productos)) {
            inventario[key] = Math.floor(Math.random() * 50) + 10; // Stock aleatorio entre 10-60
        }
        
        // Agregar combos con stock basado en los productos que los componen
        for (const [key, combo] of Object.entries(this.combos)) {
            // El stock del combo es el mínimo stock de sus componentes
            const stockComponentes = combo.productos.map(productoKey => 
                inventario[productoKey] || 0
            );
            inventario[key] = Math.min(...stockComponentes, 20); // Máximo 20 combos disponibles
        }
        
        localStorage.setItem('inventario', JSON.stringify(inventario));
        return inventario;
    }

    renderizarProductos() {
        const container = document.getElementById('productos-container');
        if (!container) return;

        container.innerHTML = '';
        
        const categorias = this.agruparPorCategoria();
        
        for (const [categoria, productos] of Object.entries(categorias)) {
            const categoriaDiv = this.crearCategoriaHTML(categoria, productos);
            container.appendChild(categoriaDiv);
        }
    }

    agruparPorCategoria() {
        const categorias = {};
        
        // Orden lógico para punto de venta: primero combos, luego productos principales
        const ordenCategorias = ['Combos', 'Café', 'Bebidas', 'Desayunos', 'Pastelería', 'Snacks'];
        
        // Agregar combos primero
        for (const [key, combo] of Object.entries(this.combos)) {
            if (!categorias[combo.categoria]) {
                categorias[combo.categoria] = {};
            }
            
            const subcategoria = combo.subcategoria || 'General';
            if (!categorias[combo.categoria][subcategoria]) {
                categorias[combo.categoria][subcategoria] = [];
            }
            
            categorias[combo.categoria][subcategoria].push({ key, ...combo, esCombo: true });
        }
        
        // Agregar productos regulares
        for (const [key, producto] of Object.entries(this.productos)) {
            if (!categorias[producto.categoria]) {
                categorias[producto.categoria] = {};
            }
            
            const subcategoria = producto.subcategoria || 'General';
            if (!categorias[producto.categoria][subcategoria]) {
                categorias[producto.categoria][subcategoria] = [];
            }
            
            categorias[producto.categoria][subcategoria].push({ key, ...producto, esCombo: false });
        }
        
        // Reorganizar las categorías según el orden definido
        const categoriasOrdenadas = {};
        for (const categoria of ordenCategorias) {
            if (categorias[categoria]) {
                categoriasOrdenadas[categoria] = categorias[categoria];
            }
        }
        
        // Agregar cualquier categoría restante
        for (const [categoria, productos] of Object.entries(categorias)) {
            if (!categoriasOrdenadas[categoria]) {
                categoriasOrdenadas[categoria] = productos;
            }
        }
        
        return categoriasOrdenadas;
    }

    verificarDescuentosActivos() {
        const ahora = new Date();
        const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
        const diaActual = ahora.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        
        const descuentosActivos = [];
        
        for (const [key, descuento] of Object.entries(this.descuentosHorarios)) {
            if (!descuento.activo) continue;
            
            // Verificar día de la semana
            if (!descuento.diasSemana.includes(diaActual)) continue;
            
            // Verificar horario
            if (horaActual >= descuento.horaInicio && horaActual <= descuento.horaFin) {
                descuentosActivos.push({ key, ...descuento });
            }
        }
        
        return descuentosActivos;
    }

    aplicarDescuentoHorario(producto, descuentos) {
        let mejorDescuento = 0;
        let descuentoAplicado = null;
        
        const tipoUsuario = document.getElementById('descuento')?.value;
        
        for (const descuento of descuentos) {
            // Verificar si el producto aplica para este descuento
            const aplicaCategoria = descuento.categorias.includes(producto.categoria);
            const aplicaSubcategoria = !descuento.subcategorias || 
                descuento.subcategorias.includes(producto.subcategoria);
            const aplicaTipoUsuario = !descuento.requiereTipoUsuario || 
                descuento.requiereTipoUsuario === tipoUsuario;
            
            if (aplicaCategoria && aplicaSubcategoria && aplicaTipoUsuario) {
                if (descuento.descuento > mejorDescuento) {
                    mejorDescuento = descuento.descuento;
                    descuentoAplicado = descuento;
                }
            }
        }
        
        return { descuento: mejorDescuento, promocion: descuentoAplicado };
    }

    mostrarPromocionesActivas() {
        const descuentosActivos = this.verificarDescuentosActivos();
        const container = document.getElementById('promociones-activas');
        
        if (!container) return;
        
        if (descuentosActivos.length === 0) {
            container.innerHTML = '<p class="sin-promociones">No hay promociones activas en este momento</p>';
            return;
        }
        
        container.innerHTML = descuentosActivos.map(descuento => `
            <div class="promocion-activa">
                <span class="promocion-icono">${descuento.icono}</span>
                <div class="promocion-info">
                    <strong>${descuento.nombre}</strong>
                    <small>${descuento.descripcion}</small>
                    <span class="descuento-porcentaje">${descuento.descuento}% OFF</span>
                </div>
                <div class="promocion-horario">
                    <small>Válido hasta ${descuento.horaFin}</small>
                </div>
            </div>
        `).join('');
    }

    crearCategoriaHTML(categoria, subcategorias) {
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'categoria-productos';
        
        const iconos = {
            'Combos': '🎯',
            'Café': '☕',
            'Pastelería': '🥐',
            'Desayunos': '🍳',
            'Bebidas': '🥤',
            'Snacks': '🍿'
        };
        
        fieldset.innerHTML = `
            <legend>${iconos[categoria] || '🍽️'} ${categoria}</legend>
            <div class="subcategorias-container"></div>
        `;
        
        const container = fieldset.querySelector('.subcategorias-container');
        
        for (const [subcategoria, productos] of Object.entries(subcategorias)) {
            if (subcategoria !== 'General') {
                const h4 = document.createElement('h4');
                h4.innerHTML = this.getSubcategoriaIcon(subcategoria) + ' ' + subcategoria;
                container.appendChild(h4);
            }
            
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategoria-productos';
            
            productos.forEach(producto => {
                const stock = this.inventario[producto.key] || 0;
                const productoHTML = this.crearProductoHTML(producto, stock);
                subcategoriaDiv.appendChild(productoHTML);
            });
            
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

    crearProductoHTML(producto, stock) {
        const div = document.createElement('div');
        div.className = `producto-group ${producto.esCombo ? 'combo-item' : ''}`;
        
        const disponible = stock > 0;
        const stockClass = stock <= 5 ? 'stock-bajo' : stock <= 15 ? 'stock-medio' : 'stock-alto';
        
        // HTML específico para combos
        if (producto.esCombo) {
            div.innerHTML = `
                <label class="producto-label combo-label ${!disponible ? 'agotado' : ''}">
                    <input type="checkbox" 
                           name="producto[]" 
                           value="${producto.key}"
                           ${!disponible ? 'disabled' : ''}
                           data-precio="${producto.precio}"
                           data-nombre="${producto.nombre}"
                           data-id="${producto.id}"
                           data-combo="true">
                    <span class="producto-info">
                        <strong>${producto.icono || '🎯'} [${producto.id}] ${producto.nombre}</strong>
                        <div class="combo-precios">
                            <span class="precio-combo">$${producto.precio.toLocaleString('es-CO')}</span>
                            <span class="precio-normal">$${producto.precioNormal.toLocaleString('es-CO')}</span>
                            <span class="ahorro">¡Ahorra ${producto.descuento}%!</span>
                        </div>
                        <small class="combo-descripcion">${producto.descripcion}</small>
                        <small class="stock-info ${stockClass}">
                            Stock disponible: ${stock} ${!disponible ? '(AGOTADO)' : stock <= 5 ? '(POCO STOCK)' : ''}
                        </small>
                    </span>
                </label>
                <label class="cantidad-label ${!disponible ? 'disabled' : ''}">
                    Cantidad: 
                    <input type="number" 
                           name="cantidad_${producto.key}" 
                           min="0" 
                           max="${Math.min(stock, 10)}" 
                           value="0"
                           ${!disponible ? 'disabled' : ''}
                           data-producto="${producto.key}">
                </label>
            `;
        } else {
            // HTML para productos regulares
            div.innerHTML = `
                <label class="producto-label ${!disponible ? 'agotado' : ''}">
                    <input type="checkbox" 
                           name="producto[]" 
                           value="${producto.key}"
                           ${!disponible ? 'disabled' : ''}
                           data-precio="${producto.precio}"
                           data-nombre="${producto.nombre}"
                           data-id="${producto.id}">
                    <span class="producto-info">
                        <strong>[${producto.id}] ${producto.nombre}</strong> - $${producto.precio.toLocaleString('es-CO')}
                        <small class="stock-info ${stockClass}">
                            Stock: ${stock} ${!disponible ? '(AGOTADO)' : stock <= 5 ? '(POCO STOCK)' : ''}
                        </small>
                    </span>
                </label>
                <label class="cantidad-label ${!disponible ? 'disabled' : ''}">
                    Cantidad: 
                    <input type="number" 
                           name="cantidad_${producto.key}" 
                           min="0" 
                           max="${Math.min(stock, 10)}" 
                           value="0"
                           ${!disponible ? 'disabled' : ''}
                           data-producto="${producto.key}">
                </label>
            `;
        }
        
        return div;
    }

    configurarEventos() {
        // Eventos para checkboxes y cantidades
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'producto[]') {
                this.manejarSeleccionProducto(e.target);
            }
            
            if (e.target.type === 'number' && e.target.dataset.producto) {
                this.manejarCambioCantidad(e.target);
            }
            
            if (e.target.id === 'metodo_pago') {
                this.manejarCambioMetodoPago(e.target.value);
            }
        });

        // Búsqueda de productos
        const buscador = document.getElementById('buscador-productos');
        if (buscador) {
            buscador.addEventListener('input', (e) => {
                this.filtrarProductos(e.target.value);
            });
            
            // Limpiar búsqueda con tecla Escape
            buscador.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    buscador.value = '';
                    this.filtrarProductos('');
                }
            });
        }

        // Formulario de compra
        const form = document.getElementById('compra-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.procesarCompra();
            });
        }

        // Botón limpiar
        const btnLimpiar = document.querySelector('.btn-secondary');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                this.limpiarFormulario();
            });
        }

        // Búsqueda de cliente
        const inputCliente = document.getElementById('id_cliente');
        if (inputCliente) {
            inputCliente.addEventListener('input', (e) => {
                this.buscarCliente(e.target.value);
            });
        }
    }

    manejarSeleccionProducto(checkbox) {
        const cantidadInput = document.querySelector(`input[name="cantidad_${checkbox.value}"]`);
        
        if (checkbox.checked) {
            cantidadInput.value = Math.max(1, parseInt(cantidadInput.value) || 1);
            cantidadInput.min = 1;
        } else {
            cantidadInput.value = 0;
            cantidadInput.min = 0;
        }
        
        this.actualizarCarrito();
    }

    manejarCambioCantidad(input) {
        const producto = input.dataset.producto;
        const checkbox = document.querySelector(`input[value="${producto}"]`);
        const cantidad = parseInt(input.value) || 0;
        
        if (cantidad > 0) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
        
        this.actualizarCarrito();
    }

    manejarCambioMetodoPago(metodo) {
        const campoEfectivo = document.getElementById('campo-efectivo');
        
        if (metodo === 'Efectivo') {
            if (!campoEfectivo) {
                this.crearCampoEfectivo();
            }
        } else {
            if (campoEfectivo) {
                campoEfectivo.remove();
            }
        }
    }

    crearCampoEfectivo() {
        const metodoPagoGroup = document.querySelector('#metodo_pago').closest('.input-group');
        const efectivoDiv = document.createElement('div');
        efectivoDiv.id = 'campo-efectivo';
        efectivoDiv.className = 'input-group';
        efectivoDiv.innerHTML = `
            <label for="monto_recibido">Monto recibido:</label>
            <input type="number" id="monto_recibido" name="monto_recibido" 
                   min="0" step="100" placeholder="Ingrese el monto recibido">
            <div id="cambio-display" class="cambio-info"></div>
        `;
        
        metodoPagoGroup.parentNode.insertBefore(efectivoDiv, metodoPagoGroup.nextSibling);
        
        const montoInput = document.getElementById('monto_recibido');
        montoInput.addEventListener('input', () => {
            this.calcularCambio();
        });
    }

    actualizarCarrito() {
        this.carrito = [];
        const checkboxes = document.querySelectorAll('input[name="producto[]"]:checked');
        
        checkboxes.forEach(checkbox => {
            const cantidadInput = document.querySelector(`input[name="cantidad_${checkbox.value}"]`);
            const cantidad = parseInt(cantidadInput.value) || 0;
            
            if (cantidad > 0) {
                const producto = this.productos[checkbox.value];
                this.carrito.push({
                    key: checkbox.value,
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: cantidad,
                    subtotal: producto.precio * cantidad
                });
            }
        });
        
        this.actualizarResumen();
    }

    actualizarResumen() {
        const resumenContainer = document.getElementById('resumen-compra');
        if (!resumenContainer) return;
        
        if (this.carrito.length === 0) {
            resumenContainer.innerHTML = '<p class="carrito-vacio">No hay productos seleccionados</p>';
            return;
        }
        
        let html = '<h3>📋 Resumen de Compra</h3><div class="items-carrito">';
        let subtotal = 0;
        
        this.carrito.forEach(item => {
            html += `
                <div class="item-carrito">
                    <span class="item-nombre">${item.nombre}</span>
                    <span class="item-detalle">
                        ${item.cantidad} x $${item.precio.toLocaleString('es-CO')} = 
                        <strong>$${item.subtotal.toLocaleString('es-CO')}</strong>
                    </span>
                </div>
            `;
            subtotal += item.subtotal;
        });
        
        const descuento = this.calcularDescuento(subtotal);
        const total = subtotal - descuento;
        
        html += `</div>
            <div class="resumen-totales">
                <div class="subtotal">Subtotal: $${subtotal.toLocaleString('es-CO')}</div>
                ${descuento > 0 ? `<div class="descuento">Descuento: -$${descuento.toLocaleString('es-CO')}</div>` : ''}
                <div class="total">Total: <strong>$${total.toLocaleString('es-CO')}</strong></div>
            </div>
        `;
        
        resumenContainer.innerHTML = html;
        this.calcularCambio();
    }

    calcularDescuento(subtotal) {
        const tipoDescuento = document.getElementById('descuento')?.value;
        
        // Canje de puntos
        if (tipoDescuento === 'puntos' && this.canjeActivo) {
            return this.canjeActivo.descuento;
        }
        
        const descuentosUsuario = {
            'estudiante': 0.10,
            'profesor': 0.15,
            'empleado': 0.20
        };
        
        // Descuento base por tipo de usuario
        let descuentoBase = tipoDescuento ? Math.floor(subtotal * descuentosUsuario[tipoDescuento]) : 0;
        
        // Descuento por nivel de lealtad
        const idCliente = document.getElementById('id_cliente')?.value;
        let descuentoLealtad = 0;
        if (idCliente) {
            descuentoLealtad = this.aplicarDescuentoLealtad(subtotal, idCliente);
        }
        
        // Calcular descuentos adicionales por horarios
        let descuentoHorario = 0;
        const descuentosActivos = this.verificarDescuentosActivos();
        
        if (descuentosActivos.length > 0) {
            // Calcular descuento por horarios en productos del carrito
            for (const item of this.carrito) {
                const producto = this.productos[item.key] || this.combos[item.key];
                if (producto) {
                    const { descuento } = this.aplicarDescuentoHorario(producto, descuentosActivos);
                    if (descuento > 0) {
                        descuentoHorario += Math.floor(item.subtotal * (descuento / 100));
                    }
                }
            }
        }
        
        // Retornar el mayor de los descuentos (no acumulativo para evitar descuentos excesivos)
        return Math.max(descuentoBase, descuentoLealtad, descuentoHorario);
    }

    calcularCambio() {
        const montoRecibido = parseFloat(document.getElementById('monto_recibido')?.value) || 0;
        const total = this.calcularTotal();
        const cambioDisplay = document.getElementById('cambio-display');
        
        if (cambioDisplay && montoRecibido > 0) {
            const cambio = montoRecibido - total;
            if (cambio >= 0) {
                cambioDisplay.innerHTML = `<span class="cambio-positivo">Cambio: $${cambio.toLocaleString('es-CO')}</span>`;
                cambioDisplay.className = 'cambio-info positivo';
            } else {
                cambioDisplay.innerHTML = `<span class="cambio-negativo">Falta: $${Math.abs(cambio).toLocaleString('es-CO')}</span>`;
                cambioDisplay.className = 'cambio-info negativo';
            }
        }
    }

    calcularTotal() {
        const subtotal = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
        const descuento = this.calcularDescuento(subtotal);
        return subtotal - descuento;
    }

    filtrarProductos(termino) {
        const productos = document.querySelectorAll('.producto-group');
        const categorias = document.querySelectorAll('.categoria-productos');
        const terminoLower = termino ? termino.toLowerCase().trim() : '';
        
        // Si no hay término de búsqueda, mostrar todo
        if (!terminoLower) {
            productos.forEach(producto => {
                producto.style.display = 'block';
            });
            categorias.forEach(categoria => {
                categoria.style.display = 'block';
            });
            return;
        }
        
        let hayResultados = false;
        
        // Filtrar productos
        productos.forEach(producto => {
            const texto = producto.textContent.toLowerCase();
            const nombreProducto = producto.querySelector('strong')?.textContent.toLowerCase() || '';
            const descripcion = producto.querySelector('.combo-descripcion, small')?.textContent.toLowerCase() || '';
            
            if (texto.includes(terminoLower) || 
                nombreProducto.includes(terminoLower) || 
                descripcion.includes(terminoLower)) {
                producto.style.display = 'block';
                hayResultados = true;
                
                // Mostrar la categoría padre
                const categoriaParent = producto.closest('.categoria-productos');
                if (categoriaParent) {
                    categoriaParent.style.display = 'block';
                }
            } else {
                producto.style.display = 'none';
            }
        });
        
        // Ocultar categorías que no tienen productos visibles
        categorias.forEach(categoria => {
            const productosVisibles = categoria.querySelectorAll('.producto-group[style*="display: block"], .producto-group:not([style*="display: none"])');
            if (productosVisibles.length === 0) {
                categoria.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no hay resultados
        this.mostrarMensajeBusqueda(hayResultados, terminoLower);
    }

    mostrarMensajeBusqueda(hayResultados, termino) {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-busqueda');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        // Si no hay resultados, mostrar mensaje
        if (!hayResultados && termino) {
            const container = document.getElementById('productos-container');
            const mensaje = document.createElement('div');
            mensaje.className = 'mensaje-busqueda';
            mensaje.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #8B4513; font-size: 1.2em;">
                    <h3>🔍 No se encontraron productos</h3>
                    <p>No hay productos que coincidan con "${termino}"</p>
                    <p style="font-size: 0.9em; color: #666;">Intenta con otros términos de búsqueda</p>
                </div>
            `;
            container.appendChild(mensaje);
        }
    }

    buscarCliente(id) {
        const clienteInfo = document.getElementById('cliente-info');
        const lealtadInfo = document.getElementById('cliente-lealtad-info');
        if (!clienteInfo) return;
        
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            // Información básica del cliente
            clienteInfo.innerHTML = `
                <div class="cliente-encontrado">
                    <strong>${cliente.nombres} ${cliente.apellidos}</strong><br>
                    ${cliente.email}<br>
                    Tel: ${cliente.telefono}
                </div>
            `;
            
            // Información de lealtad
            this.mostrarInformacionLealtad(id);
            
        } else if (id.length > 0) {
            clienteInfo.innerHTML = '<div class="cliente-no-encontrado">Cliente no encontrado</div>';
            if (lealtadInfo) lealtadInfo.innerHTML = '';
        } else {
            clienteInfo.innerHTML = '';
            if (lealtadInfo) lealtadInfo.innerHTML = '';
        }
    }

    async procesarCompra() {
        if (!this.validarCompra()) return;
        
        try {
            const venta = this.construirVenta();
            
            // Validar inventario
            if (!this.validarInventario(venta.items)) {
                throw new Error('Stock insuficiente para algunos productos');
            }
            
            // Procesar transacción
            await this.procesarTransaccion(venta);
            
            // Mostrar éxito y redireccionar
            this.mostrarExito(venta);
            
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    validarCompra() {
        if (this.carrito.length === 0) {
            this.mostrarError('Debe seleccionar al menos un producto');
            return false;
        }
        
        const metodoPago = document.getElementById('metodo_pago').value;
        if (!metodoPago) {
            this.mostrarError('Debe seleccionar un método de pago');
            return false;
        }
        
        const idCliente = document.getElementById('id_cliente').value;
        const idVendedor = document.getElementById('id_vendedor').value;
        
        if (!idCliente || !idVendedor) {
            this.mostrarError('Debe ingresar ID de cliente y vendedor');
            return false;
        }
        
        if (metodoPago === 'Efectivo') {
            const montoRecibido = parseFloat(document.getElementById('monto_recibido')?.value) || 0;
            const total = this.calcularTotal();
            
            if (montoRecibido < total) {
                this.mostrarError('El monto recibido es insuficiente');
                return false;
            }
        }
        
        return true;
    }

    construirVenta() {
        const total = this.calcularTotal();
        const subtotal = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
        const descuento = this.calcularDescuento(subtotal);
        const idCliente = document.getElementById('id_cliente').value;
        
        // Calcular puntos ganados
        const puntosGanados = this.calcularPuntosGanados(total, idCliente);
        
        return {
            id: document.getElementById('numero_compra').value,
            fecha: new Date().toISOString(),
            fechaFormateada: document.getElementById('fecha_compra').value,
            idCliente: idCliente,
            cliente: document.getElementById('id_cliente').value,
            vendedor: document.getElementById('id_vendedor').value,
            items: [...this.carrito],
            metodoPago: document.getElementById('metodo_pago').value,
            subtotal: subtotal,
            descuentoTipo: document.getElementById('descuento').value,
            descuentoMonto: descuento,
            total: total,
            montoRecibido: this.getMontoRecibido(),
            cambio: this.getCambio(),
            observaciones: document.getElementById('observaciones').value || '',
            puntosGanados: puntosGanados,
            estado: 'completada'
        };
    }

    getMontoRecibido() {
        const metodoPago = document.getElementById('metodo_pago').value;
        if (metodoPago === 'Efectivo') {
            return parseFloat(document.getElementById('monto_recibido')?.value) || 0;
        }
        return this.calcularTotal();
    }

    getCambio() {
        const metodoPago = document.getElementById('metodo_pago').value;
        if (metodoPago === 'Efectivo') {
            const montoRecibido = this.getMontoRecibido();
            const total = this.calcularTotal();
            return Math.max(0, montoRecibido - total);
        }
        return 0;
    }

    validarInventario(items) {
        for (const item of items) {
            const stockActual = this.inventario[item.key] || 0;
            if (stockActual < item.cantidad) {
                this.mostrarError(`Stock insuficiente para ${item.nombre}. Disponible: ${stockActual}`);
                return false;
            }
        }
        return true;
    }

    async procesarTransaccion(venta) {
        // Simular procesamiento asíncrono
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Actualizar inventario
        venta.items.forEach(item => {
            this.inventario[item.key] -= item.cantidad;
        });
        
        // Actualizar puntos del cliente
        if (venta.idCliente && venta.puntosGanados > 0) {
            this.actualizarPuntosCliente(venta.idCliente, venta.puntosGanados);
        }
        
        // Si se usaron puntos, descontarlos del cliente
        if (this.canjeActivo && venta.idCliente) {
            this.descontarPuntosCliente(venta.idCliente, this.canjeActivo.puntosUsados);
        }
        
        // Guardar venta
        this.ventas.push(venta);
        
        // Persistir datos
        localStorage.setItem('inventario', JSON.stringify(this.inventario));
        localStorage.setItem('ventas', JSON.stringify(this.ventas));
        
        // Registrar en historial del empleado
        this.registrarEnHistorialEmpleado(venta);
    }

    registrarEnHistorialEmpleado(venta) {
        let historial = JSON.parse(localStorage.getItem('historialVentas')) || {};
        
        if (!historial[venta.vendedor]) {
            historial[venta.vendedor] = [];
        }
        
        historial[venta.vendedor].push({
            ventaId: venta.id,
            fecha: venta.fecha,
            total: venta.total,
            items: venta.items.length
        });
        
        localStorage.setItem('historialVentas', JSON.stringify(historial));
        
        // Limpiar canje activo después de procesar
        this.canjeActivo = null;
    }

    descontarPuntosCliente(idCliente, puntosUsados) {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const cliente = clientes.find(c => c.id === idCliente);
        
        if (cliente) {
            cliente.puntos = Math.max(0, (cliente.puntos || 0) - puntosUsados);
            localStorage.setItem('clientes', JSON.stringify(clientes));
            this.clientes = clientes;
        }
    }

    mostrarExito(venta) {
        const puntosTexto = venta.puntosGanados > 0 ? 
            `<p><strong>🎉 Puntos ganados:</strong> ${venta.puntosGanados}</p>` : '';
            
        const mensaje = `
            <div class="mensaje-exito">
                <h3>✅ Compra procesada exitosamente</h3>
                <p><strong>Número de venta:</strong> ${venta.id}</p>
                <p><strong>Total:</strong> $${venta.total.toLocaleString('es-CO')}</p>
                ${puntosTexto}
                <p>Redirigiendo a la factura...</p>
            </div>
        `;
        
        this.mostrarMensaje(mensaje, 'exito');
        
        // Redireccionar a factura después de 2 segundos
        setTimeout(() => {
            window.location.href = `factura.html?ventaId=${venta.id}`;
        }, 2000);
    }

    mostrarError(mensaje) {
        const html = `
            <div class="mensaje-error">
                <h3>❌ Error</h3>
                <p>${mensaje}</p>
            </div>
        `;
        
        this.mostrarMensaje(html, 'error');
    }

    mostrarMensaje(html, tipo) {
        let mensajeContainer = document.getElementById('mensaje-sistema');
        
        if (!mensajeContainer) {
            mensajeContainer = document.createElement('div');
            mensajeContainer.id = 'mensaje-sistema';
            mensajeContainer.className = 'mensaje-sistema';
            document.body.appendChild(mensajeContainer);
        }
        
        mensajeContainer.innerHTML = html;
        mensajeContainer.className = `mensaje-sistema ${tipo}`;
        
        // Auto-ocultar después de 5 segundos (excepto éxito)
        if (tipo !== 'exito') {
            setTimeout(() => {
                mensajeContainer.innerHTML = '';
                mensajeContainer.className = 'mensaje-sistema';
            }, 5000);
        }
    }

    generarNumeroCompra() {
        const fecha = new Date();
        const numero = `VEN${fecha.getFullYear()}${(fecha.getMonth()+1).toString().padStart(2,'0')}${fecha.getDate().toString().padStart(2,'0')}${fecha.getHours().toString().padStart(2,'0')}${fecha.getMinutes().toString().padStart(2,'0')}${fecha.getSeconds().toString().padStart(2,'0')}`;
        
        const input = document.getElementById('numero_compra');
        if (input) {
            input.value = numero;
        }
    }

    configurarFechaActual() {
        const fechaInput = document.getElementById('fecha_compra');
        if (fechaInput) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaInput.value = hoy;
        }
    }

    limpiarFormulario() {
        this.carrito = [];
        
        // Limpiar checkboxes y cantidades
        document.querySelectorAll('input[name="producto[]"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[type="number"]').forEach(input => {
            if (input.dataset.producto) input.value = 0;
        });
        
        // Limpiar otros campos
        document.getElementById('metodo_pago').value = '';
        document.getElementById('descuento').value = '';
        document.getElementById('id_cliente').value = '';
        document.getElementById('observaciones').value = '';
        
        // Remover campo de efectivo
        const campoEfectivo = document.getElementById('campo-efectivo');
        if (campoEfectivo) campoEfectivo.remove();
        
        // Limpiar información de cliente
        const clienteInfo = document.getElementById('cliente-info');
        if (clienteInfo) clienteInfo.innerHTML = '';
        
        // Actualizar resumen
        this.actualizarResumen();
        
        // Generar nuevo número de compra
        this.generarNumeroCompra();
    }

    // Métodos del Sistema de Puntos y Lealtad
    calcularPuntosGanados(total, idCliente) {
        if (!idCliente) return 0;
        
        const cliente = this.obtenerCliente(idCliente);
        if (!cliente) return 0;
        
        let puntosBase = Math.floor(total * this.programaLealtad.configuracion.puntosXPeso);
        
        // Multiplicador VIP
        if (cliente.esVip) {
            puntosBase *= this.programaLealtad.configuracion.multiplicadorVip;
        }
        
        // Bonus por nivel de lealtad
        const nivel = this.obtenerNivelCliente(cliente.puntos || 0);
        const bonusNivel = Math.floor(puntosBase * (nivel.descuento / 100));
        
        return puntosBase + bonusNivel;
    }

    obtenerCliente(idCliente) {
        return this.clientes.find(cliente => cliente.id === idCliente);
    }

    obtenerNivelCliente(puntosActuales) {
        for (const [key, nivel] of Object.entries(this.programaLealtad.niveles)) {
            if (puntosActuales >= nivel.min && puntosActuales <= nivel.max) {
                return { ...nivel, key };
            }
        }
        return this.programaLealtad.niveles.bronce;
    }

    actualizarPuntosCliente(idCliente, puntosGanados) {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        const cliente = clientes.find(c => c.id === idCliente);
        
        if (cliente) {
            cliente.puntos = (cliente.puntos || 0) + puntosGanados;
            cliente.ultimaCompra = new Date().toISOString();
            cliente.totalCompras = (cliente.totalCompras || 0) + 1;
            
            // Verificar si alcanzó nuevo nivel
            const nivelAnterior = this.obtenerNivelCliente((cliente.puntos || 0) - puntosGanados);
            const nivelActual = this.obtenerNivelCliente(cliente.puntos);
            
            if (nivelAnterior.key !== nivelActual.key) {
                this.notificarNuevoNivel(cliente, nivelActual);
            }
            
            localStorage.setItem('clientes', JSON.stringify(clientes));
            this.clientes = clientes;
        }
    }

    notificarNuevoNivel(cliente, nuevoNivel) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`¡Felicitaciones ${cliente.nombres}!`, {
                body: `Has alcanzado el nivel ${nuevoNivel.icono} ${nuevoNivel.nombre}`,
                icon: '/Images/logo-cafe.png'
            });
        }
    }

    aplicarDescuentoLealtad(subtotal, idCliente) {
        if (!idCliente) return 0;
        
        const cliente = this.obtenerCliente(idCliente);
        if (!cliente) return 0;
        
        const nivel = this.obtenerNivelCliente(cliente.puntos || 0);
        return subtotal * (nivel.descuento / 100);
    }

    canjearPuntos(idCliente, puntosACanjear) {
        const cliente = this.obtenerCliente(idCliente);
        if (!cliente || (cliente.puntos || 0) < puntosACanjear) {
            return { exito: false, mensaje: 'Puntos insuficientes' };
        }
        
        if (puntosACanjear < this.programaLealtad.configuracion.puntosMinimosDescuento) {
            return { 
                exito: false, 
                mensaje: `Mínimo ${this.programaLealtad.configuracion.puntosMinimosDescuento} puntos para canjear` 
            };
        }
        
        const descuento = Math.floor(puntosACanjear / 100) * this.programaLealtad.configuracion.descuentoX100Puntos;
        
        return { 
            exito: true, 
            descuento: descuento,
            puntosUsados: puntosACanjear 
        };
    }

    mostrarInformacionLealtad(idCliente) {
        const cliente = this.obtenerCliente(idCliente);
        if (!cliente) return;
        
        const nivel = this.obtenerNivelCliente(cliente.puntos || 0);
        const puntosParaSiguienteNivel = nivel.max === Infinity ? 0 : nivel.max + 1 - (cliente.puntos || 0);
        
        const info = document.getElementById('cliente-lealtad-info');
        if (info) {
            info.innerHTML = `
                <div class="lealtad-info">
                    <h4>${nivel.icono} Nivel ${nivel.nombre}</h4>
                    <div class="puntos-display">
                        <p><strong>Puntos disponibles: ${cliente.puntos || 0}</strong></p>
                        ${puntosParaSiguienteNivel > 0 ? 
                            `<p>Faltan ${puntosParaSiguienteNivel} puntos para nivel ${this.obtenerSiguienteNivel(nivel.key).nombre}</p>` :
                            '<p>¡Has alcanzado el nivel máximo!</p>'
                        }
                    </div>
                    <p>Descuento por nivel: ${nivel.descuento}%</p>
                    ${(cliente.puntos || 0) >= this.programaLealtad.configuracion.puntosMinimosDescuento ? 
                        `<button class="btn-canjear-puntos" onclick="sistemaCompras.mostrarCanjeoPuntos('${idCliente}')">
                            💰 Canjear Puntos
                        </button>` : 
                        `<p style="font-size: 0.8em; opacity: 0.8;">
                            Necesitas ${this.programaLealtad.configuracion.puntosMinimosDescuento} puntos mínimo para canjear
                        </p>`
                    }
                </div>
            `;
        }
    }

    obtenerSiguienteNivel(nivelActual) {
        const niveles = Object.keys(this.programaLealtad.niveles);
        const indiceActual = niveles.indexOf(nivelActual);
        const siguienteNivel = niveles[indiceActual + 1];
        return siguienteNivel ? this.programaLealtad.niveles[siguienteNivel] : this.programaLealtad.niveles[nivelActual];
    }

    mostrarCanjeoPuntos(idCliente) {
        const cliente = this.obtenerCliente(idCliente);
        if (!cliente) return;

        const puntosDisponibles = cliente.puntos || 0;
        const maxCanjeable = Math.floor(puntosDisponibles / 100) * 100;
        
        const modal = document.createElement('div');
        modal.className = 'modal-canje-puntos';
        modal.innerHTML = `
            <div class="modal-contenido-canje">
                <div class="modal-header-canje">
                    <h3>💰 Canjear Puntos por Descuento</h3>
                    <button class="modal-close-canje">&times;</button>
                </div>
                <div class="modal-body-canje">
                    <p><strong>Puntos disponibles:</strong> ${puntosDisponibles}</p>
                    <p><strong>Tasa de cambio:</strong> 100 puntos = $${this.programaLealtad.configuracion.descuentoX100Puntos.toLocaleString('es-CO')}</p>
                    
                    <div class="canje-input">
                        <label for="puntos-canjear">Puntos a canjear:</label>
                        <input type="number" id="puntos-canjear" min="50" max="${maxCanjeable}" step="50" value="100">
                        <p id="descuento-preview">Descuento: $0</p>
                    </div>
                </div>
                <div class="modal-footer-canje">
                    <button class="btn btn-primary" onclick="sistemaCompras.aplicarCanjeoPuntos('${idCliente}')">Aplicar Descuento</button>
                    <button class="btn btn-secondary modal-close-canje">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Eventos
        modal.querySelectorAll('.modal-close-canje').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModalCanje(modal));
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModalCanje(modal);
        });

        // Actualizar preview del descuento
        const inputPuntos = modal.querySelector('#puntos-canjear');
        const preview = modal.querySelector('#descuento-preview');
        
        inputPuntos.addEventListener('input', (e) => {
            const puntos = parseInt(e.target.value) || 0;
            const descuento = Math.floor(puntos / 100) * this.programaLealtad.configuracion.descuentoX100Puntos;
            preview.textContent = `Descuento: $${descuento.toLocaleString('es-CO')}`;
        });
    }

    aplicarCanjeoPuntos(idCliente) {
        const modal = document.querySelector('.modal-canje-puntos');
        const puntosACanjear = parseInt(modal.querySelector('#puntos-canjear').value) || 0;
        
        const resultado = this.canjearPuntos(idCliente, puntosACanjear);
        
        if (resultado.exito) {
            // Aplicar descuento al formulario
            const descuentoSelect = document.getElementById('descuento');
            const opcionPuntos = Array.from(descuentoSelect.options).find(opt => opt.value === 'puntos');
            
            if (!opcionPuntos) {
                const nuevaOpcion = new Option(`Canje puntos (-$${resultado.descuento.toLocaleString('es-CO')})`, 'puntos');
                descuentoSelect.appendChild(nuevaOpcion);
            }
            
            descuentoSelect.value = 'puntos';
            
            // Guardar información del canje para usar en el cálculo
            this.canjeActivo = {
                puntosUsados: resultado.puntosUsados,
                descuento: resultado.descuento
            };
            
            this.actualizarResumen();
            this.cerrarModalCanje(modal);
            
            alert(`¡Descuento aplicado! Se descontarán $${resultado.descuento.toLocaleString('es-CO')} usando ${resultado.puntosUsados} puntos.`);
        } else {
            alert(resultado.mensaje);
        }
    }

    cerrarModalCanje(modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 300);
    }

    // Métodos para interactuar con otras partes del sistema
    obtenerVentaPorId(id) {
        return this.ventas.find(venta => venta.id === id);
    }

    obtenerHistorialVentas(vendedorId = null) {
        if (vendedorId) {
            return this.ventas.filter(venta => venta.vendedor === vendedorId);
        }
        return this.ventas;
    }

    obtenerInventario() {
        return this.inventario;
    }

    actualizarInventarioExterno(inventarioActualizado) {
        this.inventario = inventarioActualizado;
        localStorage.setItem('inventario', JSON.stringify(this.inventario));
        this.renderizarProductos();
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productos-container')) {
        window.sistemaCompras = new SistemaCompras();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaCompras;
}

// ================================================
// FUNCIONES ADICIONALES PARA NAVEGACIÓN
// ================================================

// Navegación móvil mejorada
document.addEventListener('DOMContentLoaded', () => {
    // Toggle del menú móvil
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const navMenu = document.getElementById('nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        });
    }

    // Cerrar menú al hacer clic en un enlace (móvil)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Inicializar el sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaCompras = new SistemaCompras();
});

