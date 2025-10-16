/**
 * Sistema Completo de Gestión de Productos - Cafetería Cesde
 * Incluye catálogo público y funcionalidades de administración
 */

class SistemaProductos {
    constructor() {
        this.categorias = this.cargarCategorias();
        this.productos = this.cargarProductos();
        this.filtroActual = 'todos';
        this.busquedaActual = '';
        this.init();
    }

    init() {
        this.renderizarCatalogo();
        this.configurarEventos();
        this.configurarEventosAdmin();
        this.actualizarEstadisticas();
    }

    // ===== CONFIGURACIÓN DE EVENTOS =====
    configurarEventos() {
        // Configurar filtros de categoría
        document.querySelectorAll('.filtro-categoria').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoria = e.target.dataset.categoria;
                this.filtrarPorCategoria(categoria);
            });
        });
    }

    configurarEventosAdmin() {
        // Botón agregar nuevo producto
        const btnAgregar = document.getElementById('btn-agregar-producto');
        if (btnAgregar) {
            btnAgregar.addEventListener('click', () => {
                this.abrirModalProducto();
            });
        }
        
        // Botón gestionar categorías
        const btnCategorias = document.getElementById('btn-gestionar-categorias');
        if (btnCategorias) {
            btnCategorias.addEventListener('click', () => {
                this.gestionarCategorias();
            });
        }
        
        // Formulario de producto
        const formProducto = document.getElementById('form-producto');
        if (formProducto) {
            formProducto.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarProducto();
            });
        }
        
        // Botones de cerrar modales
        const btnCerrarModal = document.getElementById('btn-cerrar-modal');
        const btnCancelar = document.getElementById('btn-cancelar');
        if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => this.cerrarModalProducto());
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModalProducto());
        
        // Modal de confirmación
        const btnCerrarConfirmacion = document.getElementById('btn-cerrar-confirmacion');
        const btnCancelarConfirmacion = document.getElementById('btn-cancelar-confirmacion');
        if (btnCerrarConfirmacion) btnCerrarConfirmacion.addEventListener('click', () => this.cerrarModalConfirmacion());
        if (btnCancelarConfirmacion) btnCancelarConfirmacion.addEventListener('click', () => this.cerrarModalConfirmacion());
        
        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            const modalProducto = document.getElementById('modal-producto');
            const modalConfirmacion = document.getElementById('modal-confirmacion');
            
            if (e.target === modalProducto) {
                this.cerrarModalProducto();
            }
            if (e.target === modalConfirmacion) {
                this.cerrarModalConfirmacion();
            }
        });
    }

    // ===== DATOS INICIALES =====
    cargarProductos() {
        // Intentar cargar desde localStorage primero
        const productosGuardados = localStorage.getItem('productos_cafeteria');
        if (productosGuardados) {
            try {
                return JSON.parse(productosGuardados);
            } catch (error) {
                console.error('Error al cargar productos desde localStorage:', error);
            }
        }
        
        // Si no hay productos guardados, usar los predeterminados
        return this.initProductos();
    }

    initCategorias() {
        return {
            'todos': { nombre: 'Todos los Productos', icono: '🍽️' },
            'cafe': { nombre: 'Café', icono: '☕' },
            'pasteleria': { nombre: 'Pastelería', icono: '🥐' },
            'desayunos': { nombre: 'Desayunos', icono: '🍳' },
            'almuerzos': { nombre: 'Almuerzos', icono: '🍽️' },
            'bebidas': { nombre: 'Bebidas', icono: '🥤' },
            'postres': { nombre: 'Postres', icono: '🍰' }
        };
    }

    initProductos() {
        return [
            {
                id: 1,
                nombre: "Espresso",
                categoria: "cafe",
                precio: 2500,
                descripcion: "Café espresso clásico, intenso y aromático",
                imagen: "Images/espresso.jpg",
                disponible: true,
                ingredientes: ["Café molido", "Agua"],
                alergenos: [],
                calorias: 5,
                tiempo_preparacion: "2 min"
            },
            {
                id: 2,
                nombre: "Americano",
                categoria: "cafe",
                precio: 3000,
                descripcion: "Espresso suave con agua caliente",
                imagen: "Images/americano.jpg",
                disponible: true,
                ingredientes: ["Café espresso", "Agua caliente"],
                alergenos: [],
                calorias: 10,
                tiempo_preparacion: "3 min"
            },
            {
                id: 3,
                nombre: "Cappuccino",
                categoria: "cafe",
                precio: 4500,
                descripcion: "Espresso con leche vaporizada y espuma",
                imagen: "Images/cappuccino.jpg",
                disponible: true,
                ingredientes: ["Café espresso", "Leche", "Espuma de leche"],
                alergenos: ["Lácteos"],
                calorias: 120,
                tiempo_preparacion: "4 min"
            }
        ];
    }

    // ===== RENDERIZADO DEL CATÁLOGO =====
    renderizarCatalogo() {
        const container = document.getElementById('catalogo-productos');
        if (!container) {
            console.error('No se encontró el contenedor del catálogo');
            return;
        }

        container.innerHTML = '';
        const productosFiltrados = this.obtenerProductosFiltrados();

        if (productosFiltrados.length === 0) {
            container.innerHTML = '<div class="no-products"><h3>No se encontraron productos</h3></div>';
            return;
        }

        // Agrupar productos por categoría
        const productosPorCategoria = {};
        productosFiltrados.forEach(producto => {
            if (!productosPorCategoria[producto.categoria]) {
                productosPorCategoria[producto.categoria] = [];
            }
            productosPorCategoria[producto.categoria].push(producto);
        });

        // Renderizar cada categoría
        Object.keys(productosPorCategoria).forEach(categoria => {
            if (this.filtroActual === 'todos' || this.filtroActual === categoria) {
                const categoriaDiv = this.crearCategoriaHTML(categoria, productosPorCategoria[categoria]);
                container.appendChild(categoriaDiv);
            }
        });
    }

    crearCategoriaHTML(categoria, productos) {
        const div = document.createElement('div');
        div.className = 'categoria-productos';
        
        const categoriaInfo = this.categorias[categoria];
        
        div.innerHTML = `
            <h2 class="titulo-categoria">
                ${categoriaInfo.icono} ${categoriaInfo.nombre}
                <span class="contador-productos">${productos.length}</span>
            </h2>
            <div class="productos-grid"></div>
        `;

        const productosGrid = div.querySelector('.productos-grid');
        productos.forEach(producto => {
            const productoCard = this.crearTarjetaProducto(producto);
            productosGrid.appendChild(productoCard);
        });

        return div;
    }

    crearTarjetaProducto(producto) {
        const div = document.createElement('div');
        div.className = 'producto-card';
        
        // Imagen placeholder de Unsplash para cafetería
        const imagenPlaceholder = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=300&fit=crop&crop=center';
        
        div.innerHTML = `
            <div class="producto-imagen">
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}" 
                     onerror="this.src='${imagenPlaceholder}'"
                     loading="lazy">
                <div class="producto-badge">${this.categorias[producto.categoria].icono}</div>
                <div class="producto-estado ${producto.disponible ? 'disponible' : 'agotado'}">
                    ${producto.disponible ? '✅ Disponible' : '❌ Agotado'}
                </div>
            </div>
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <div class="producto-detalles">
                    <span class="producto-calorias">🔥 ${producto.calorias} cal</span>
                    <span class="producto-tiempo">⏱️ ${producto.tiempo_preparacion}</span>
                </div>
                <div class="producto-footer">
                    <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                    <div class="producto-acciones">
                        <button class="btn-ver-detalle" onclick="window.sistemaProductos.verDetalle(${producto.id})">
                            👁️ Ver Detalle
                        </button>
                        <button class="btn-agregar-carrito" onclick="window.sistemaProductos.agregarAlCarrito(${producto.id})" 
                                ${!producto.disponible ? 'disabled' : ''}>
                            🛒 ${producto.disponible ? 'Agregar al Carrito' : 'No Disponible'}
                        </button>
                    </div>
                    
                    <!-- Botones de Administración -->
                    <div class="producto-admin">
                        <button class="btn-admin-editar" onclick="window.sistemaProductos.editarProducto(${producto.id})" 
                                title="Editar producto">
                            ✏️ Editar
                        </button>
                        <button class="btn-admin-eliminar" onclick="window.sistemaProductos.eliminarProducto(${producto.id})" 
                                title="Eliminar producto">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    // ===== FILTROS Y BÚSQUEDA =====
    obtenerProductosFiltrados() {
        let productos = this.productos;

        if (this.filtroActual !== 'todos') {
            productos = productos.filter(p => p.categoria === this.filtroActual);
        }

        if (this.busquedaActual) {
            productos = productos.filter(p => 
                p.nombre.toLowerCase().includes(this.busquedaActual.toLowerCase()) ||
                p.descripcion.toLowerCase().includes(this.busquedaActual.toLowerCase())
            );
        }

        return productos;
    }

    filtrarPorCategoria(categoria) {
        this.filtroActual = categoria;
        
        // Actualizar botones activos
        document.querySelectorAll('.filtro-categoria').forEach(btn => {
            btn.classList.remove('active');
        });
        const botonActivo = document.querySelector(`.filtro-categoria[data-categoria="${categoria}"]`);
        if (botonActivo) {
            botonActivo.classList.add('active');
        }
        
        this.renderizarCatalogo();
        this.actualizarEstadisticas();
    }

    // ===== ACCIONES PÚBLICAS =====
    verDetalle(id) {
        const producto = this.productos.find(p => p.id === id);
        if (!producto) {
            this.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }

        // Obtener elementos del modal
        const modal = document.getElementById('modal-detalle-producto');
        const titulo = document.getElementById('detalle-titulo');
        const imagen = document.getElementById('detalle-img');
        const nombre = document.getElementById('detalle-nombre');
        const categoria = document.getElementById('detalle-categoria');
        const categoriaBadge = document.getElementById('detalle-categoria-badge');
        const precio = document.getElementById('detalle-precio');
        const tiempo = document.getElementById('detalle-tiempo');
        const descripcion = document.getElementById('detalle-descripcion');
        const calorias = document.getElementById('detalle-calorias');
        const ingredientes = document.getElementById('detalle-ingredientes');
        const alergenos = document.getElementById('detalle-alergenos');
        const estado = document.getElementById('detalle-estado');
        const disponibilidadBadge = document.getElementById('detalle-disponibilidad');
        const btnAgregarCarrito = document.getElementById('btn-agregar-carrito-detalle');

        if (!modal) {
            console.error('Modal de detalles no encontrado');
            return;
        }

        // Configurar contenido del modal
        if (titulo) titulo.textContent = `Detalles: ${producto.nombre}`;
        if (imagen) {
            // Usar imagen por defecto si no existe o está vacía
            const imagenSrc = producto.imagen && producto.imagen.trim() !== '' 
                ? producto.imagen 
                : 'https://via.placeholder.com/300x200/8B4513/ffffff?text=Sin+Imagen';
            
            imagen.src = imagenSrc;
            imagen.alt = producto.nombre;
            
            // Manejar error de carga de imagen
            imagen.onerror = function() {
                this.src = 'https://via.placeholder.com/300x200/8B4513/ffffff?text=Sin+Imagen';
            };
        }
        if (nombre) nombre.textContent = producto.nombre;
        
        // Categoría
        const categoriaInfo = this.categorias[producto.categoria] || { nombre: producto.categoria, icono: '🍽️' };
        if (categoria) categoria.textContent = `${categoriaInfo.icono} ${categoriaInfo.nombre}`;
        
        // Precio y tiempo
        if (precio) precio.textContent = `$${producto.precio.toLocaleString('es-CO')}`;
        if (tiempo) tiempo.textContent = producto.tiempo_preparacion || 'No especificado';
        
        // Descripción
        if (descripcion) descripcion.textContent = producto.descripcion || 'Sin descripción disponible';
        
        // Información adicional
        if (calorias) {
            const caloriasContainer = document.getElementById('detalle-calorias-container');
            if (producto.calorias) {
                calorias.textContent = `${producto.calorias} kcal`;
                if (caloriasContainer) caloriasContainer.style.display = 'flex';
            } else {
                if (caloriasContainer) caloriasContainer.style.display = 'none';
            }
        }
        
        if (ingredientes) {
            const ingredientesContainer = document.getElementById('detalle-ingredientes-container');
            if (producto.ingredientes && producto.ingredientes.length > 0) {
                ingredientes.textContent = Array.isArray(producto.ingredientes) 
                    ? producto.ingredientes.join(', ') 
                    : producto.ingredientes;
                if (ingredientesContainer) ingredientesContainer.style.display = 'flex';
            } else {
                if (ingredientesContainer) ingredientesContainer.style.display = 'none';
            }
        }
        
        if (alergenos) {
            const alergenosContainer = document.getElementById('detalle-alergenos-container');
            if (producto.alergenos && producto.alergenos.length > 0) {
                alergenos.textContent = Array.isArray(producto.alergenos) 
                    ? producto.alergenos.join(', ') 
                    : producto.alergenos;
                if (alergenosContainer) alergenosContainer.style.display = 'flex';
            } else {
                alergenos.textContent = 'Ninguno';
                if (alergenosContainer) alergenosContainer.style.display = 'flex';
            }
        }
        
        // Estado de disponibilidad
        if (estado && disponibilidadBadge) {
            if (producto.disponible) {
                estado.textContent = 'Disponible';
                disponibilidadBadge.className = 'detalle-badge disponible';
            } else {
                estado.textContent = 'No disponible';
                disponibilidadBadge.className = 'detalle-badge no-disponible';
            }
        }
        
        // Configurar botón de agregar al carrito
        if (btnAgregarCarrito) {
            btnAgregarCarrito.onclick = () => {
                this.agregarAlCarrito(id);
                this.cerrarModalDetalle();
            };
            btnAgregarCarrito.disabled = !producto.disponible;
        }

        // Configurar eventos de cierre del modal
        this.configurarEventosModalDetalle();
        
        // Mostrar modal con efecto responsive
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Ajustar para dispositivos móviles
        setTimeout(() => {
            this.ajustarModalResponsivo();
        }, 50);
    }

    cerrarModalDetalle() {
        const modal = document.getElementById('modal-detalle-producto');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Limpiar eventos de orientación
            window.removeEventListener('orientationchange', this.ajustarModalResponsivo);
            
            // Restaurar scroll en móviles
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    configurarEventosModalDetalle() {
        const modal = document.getElementById('modal-detalle-producto');
        const btnCerrar = document.getElementById('btn-cerrar-detalle');
        const btnCerrar2 = document.getElementById('btn-cerrar-detalle-2');
        
        // Configurar botones de cierre
        if (btnCerrar) {
            btnCerrar.onclick = () => this.cerrarModalDetalle();
        }
        if (btnCerrar2) {
            btnCerrar2.onclick = () => this.cerrarModalDetalle();
        }
        
        // Cerrar al hacer clic fuera del modal
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.cerrarModalDetalle();
                }
            };
        }
        
        // Cerrar con tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.cerrarModalDetalle();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Manejar scroll en dispositivos móviles
        this.manejarScrollResponsivo();
    }

    manejarScrollResponsivo() {
        const modal = document.getElementById('modal-detalle-producto');
        const modalContent = modal?.querySelector('.modal-content');
        
        if (!modal || !modalContent) return;
        
        // Detectar si es dispositivo móvil
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // En móviles, asegurar que el modal sea scrolleable
            modalContent.style.maxHeight = '95vh';
            modalContent.style.overflowY = 'auto';
            
            // Smooth scroll al abrir en móvil
            setTimeout(() => {
                modalContent.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        } else {
            // En desktop, mantener comportamiento normal
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflowY = 'auto';
        }
        
        // Manejar cambios de orientación en móviles
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.ajustarModalResponsivo();
            }, 300);
        });
    }

    ajustarModalResponsivo() {
        const modal = document.getElementById('modal-detalle-producto');
        const modalContent = modal?.querySelector('.modal-content');
        
        if (!modal || !modalContent || modal.style.display === 'none') return;
        
        const isMobile = window.innerWidth <= 768;
        const isSmallHeight = window.innerHeight <= 600;
        
        if (isMobile || isSmallHeight) {
            modalContent.style.maxHeight = '95vh';
            modalContent.style.margin = '0.5rem';
        } else {
            modalContent.style.maxHeight = '90vh';
            modalContent.style.margin = '1rem';
        }
        
        // Asegurar que el contenido sea visible
        const modalBody = modalContent.querySelector('.modal-body');
        if (modalBody && isSmallHeight) {
            modalBody.style.maxHeight = 'calc(95vh - 80px)';
            modalBody.style.overflowY = 'auto';
        }
    }

    agregarAlCarrito(id) {
        const producto = this.productos.find(p => p.id === id);
        if (!producto) {
            this.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }

        if (!producto.disponible) {
            this.mostrarMensaje('Este producto no está disponible actualmente', 'warning');
            return;
        }

        // Obtener carrito actual del localStorage
        let carrito = JSON.parse(localStorage.getItem('carritoProductos') || '[]');
        
        // Verificar si el producto ya está en el carrito
        const productoEnCarrito = carrito.find(item => item.id === id);
        
        if (productoEnCarrito) {
            // Incrementar cantidad
            productoEnCarrito.cantidad += 1;
            this.mostrarMensaje(`Se agregó otra unidad de ${producto.nombre} al carrito`, 'success');
        } else {
            // Agregar nuevo producto al carrito
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                categoria: producto.categoria,
                cantidad: 1
            });
            this.mostrarMensaje(`${producto.nombre} agregado al carrito`, 'success');
        }
        
        // Guardar carrito actualizado
        localStorage.setItem('carritoProductos', JSON.stringify(carrito));
        
        // Actualizar contador del carrito si existe
        this.actualizarContadorCarrito();
    }

    actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carritoProductos') || '[]');
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        
        // Actualizar contador visual si existe
        const contadorCarrito = document.querySelector('.carrito-contador');
        if (contadorCarrito) {
            contadorCarrito.textContent = totalItems;
            contadorCarrito.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    actualizarEstadisticas() {
        console.log('Estadísticas actualizadas');
    }

    // ===== ADMINISTRACIÓN DE PRODUCTOS =====
    abrirModalProducto(producto = null) {
        const modal = document.getElementById('modal-producto');
        const titulo = document.getElementById('modal-titulo');
        const form = document.getElementById('form-producto');
        
        if (!modal || !titulo || !form) {
            console.error('Elementos del modal no encontrados');
            return;
        }
        
        // Configurar título
        titulo.textContent = producto ? 'Editar Producto' : 'Agregar Nuevo Producto';
        
        // Limpiar formulario
        form.reset();
        
        // Actualizar selector de categorías con las categorías actuales
        this.actualizarSelectorCategorias();
        
        // Si estamos editando, cargar datos
        if (producto) {
            document.getElementById('producto-nombre').value = producto.nombre;
            document.getElementById('producto-categoria').value = producto.categoria;
            document.getElementById('producto-precio').value = producto.precio;
            document.getElementById('producto-tiempo').value = producto.tiempo_preparacion || '';
            document.getElementById('producto-descripcion').value = producto.descripcion || '';
            document.getElementById('producto-imagen').value = producto.imagen || '';
            document.getElementById('producto-calorias').value = producto.calorias || '';
            document.getElementById('producto-disponible').value = producto.disponible.toString();
            document.getElementById('producto-ingredientes').value = producto.ingredientes ? producto.ingredientes.join(', ') : '';
            document.getElementById('producto-alergenos').value = producto.alergenos ? producto.alergenos.join(', ') : '';
            
            // Guardar ID para edición
            form.dataset.productoId = producto.id;
        } else {
            // Nuevo producto
            delete form.dataset.productoId;
        }
        
        modal.style.display = 'flex';
    }

    cerrarModalProducto() {
        const modal = document.getElementById('modal-producto');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    editarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            this.abrirModalProducto(producto);
        } else {
            console.error('Producto no encontrado:', id);
        }
    }

    eliminarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (!producto) {
            console.error('Producto no encontrado:', id);
            return;
        }
        
        const modal = document.getElementById('modal-confirmacion');
        const mensaje = document.getElementById('mensaje-confirmacion');
        const btnConfirmar = document.getElementById('btn-confirmar-accion');
        
        if (!modal || !mensaje || !btnConfirmar) {
            console.error('Elementos del modal de confirmación no encontrados');
            return;
        }
        
        mensaje.textContent = `¿Estás seguro de eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`;
        
        // Configurar evento de confirmación
        btnConfirmar.onclick = () => {
            this.confirmarEliminacion(id);
        };
        
        modal.style.display = 'flex';
    }

    confirmarEliminacion(id) {
        // Eliminar producto del array
        this.productos = this.productos.filter(p => p.id !== id);
        
        // Guardar en localStorage
        this.guardarProductos();
        
        // Volver a renderizar
        this.renderizarCatalogo();
        this.actualizarEstadisticas();
        
        // Cerrar modal
        this.cerrarModalConfirmacion();
        
        // Mostrar mensaje de éxito
        this.mostrarMensaje('Producto eliminado correctamente', 'success');
    }

    cerrarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    guardarProducto() {
        const form = document.getElementById('form-producto');
        if (!form) return;
        
        const formData = new FormData(form);
        const esEdicion = form.dataset.productoId;
        const id = esEdicion ? parseInt(form.dataset.productoId) : this.generarNuevoId();
        
        const producto = {
            id: id,
            nombre: formData.get('nombre').trim(),
            categoria: formData.get('categoria'),
            precio: parseInt(formData.get('precio')),
            descripcion: formData.get('descripcion').trim(),
            imagen: formData.get('imagen').trim() || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=300&fit=crop&crop=center',
            disponible: formData.get('disponible') === 'true',
            ingredientes: formData.get('ingredientes') ? formData.get('ingredientes').split(',').map(i => i.trim()).filter(i => i) : [],
            alergenos: formData.get('alergenos') ? formData.get('alergenos').split(',').map(a => a.trim()).filter(a => a) : [],
            calorias: parseInt(formData.get('calorias')) || 0,
            tiempo_preparacion: formData.get('tiempo_preparacion').trim() || '5 min'
        };
        
        // Validar campos requeridos
        if (!producto.nombre || !producto.categoria || !producto.precio) {
            this.mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        if (esEdicion) {
            // Actualizar producto existente
            const index = this.productos.findIndex(p => p.id === id);
            if (index !== -1) {
                this.productos[index] = producto;
            }
        } else {
            // Agregar nuevo producto
            this.productos.push(producto);
        }
        
        // Guardar en localStorage
        this.guardarProductos();
        
        // Volver a renderizar
        this.renderizarCatalogo();
        this.actualizarEstadisticas();
        
        // Cerrar modal
        this.cerrarModalProducto();
        
        // Mostrar mensaje de éxito
        const mensaje = esEdicion ? 'Producto actualizado correctamente' : 'Producto agregado correctamente';
        this.mostrarMensaje(mensaje, 'success');
    }

    generarNuevoId() {
        return this.productos.length > 0 ? Math.max(...this.productos.map(p => p.id)) + 1 : 1;
    }

    // ===== GESTIÓN DE CATEGORÍAS =====
    gestionarCategorias() {
        console.log('Abriendo gestor de categorías...');
        this.abrirModalCategorias();
    }

    abrirModalCategorias() {
        // Crear modal dinámicamente
        const modal = document.createElement('div');
        modal.id = 'modal-categorias';
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🏷️ Gestionar Categorías</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="categorias-lista">
                        <h4>Categorías Actuales</h4>
                        <div id="lista-categorias-actuales">
                            ${this.generarListaCategorias()}
                        </div>
                    </div>
                    
                    <div class="agregar-categoria">
                        <h4>Agregar Nueva Categoría</h4>
                        <div class="form-group">
                            <label for="nueva-categoria-key">Clave de la categoría:</label>
                            <input type="text" id="nueva-categoria-key" placeholder="ej: bebidas_calientes">
                        </div>
                        <div class="form-group">
                            <label for="nueva-categoria-nombre">Nombre de la categoría:</label>
                            <input type="text" id="nueva-categoria-nombre" placeholder="ej: Bebidas Calientes">
                        </div>
                        <div class="form-group">
                            <label for="nueva-categoria-icono">Icono (emoji):</label>
                            <input type="text" id="nueva-categoria-icono" placeholder="ej: ☕" maxlength="2">
                        </div>
                        <button onclick="window.sistemaProductos.agregarCategoria()" class="btn-save">
                            ➕ Agregar Categoría
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generarListaCategorias() {
        let html = '<div class="categorias-grid">';
        
        Object.entries(this.categorias).forEach(([key, categoria]) => {
            if (key !== 'todos') { // No mostrar la categoría "todos"
                html += `
                    <div class="categoria-item">
                        <div class="categoria-info">
                            <span class="categoria-icono">${categoria.icono}</span>
                            <div class="categoria-detalles">
                                <strong>${categoria.nombre}</strong>
                                <small>Clave: ${key}</small>
                            </div>
                        </div>
                        <button onclick="window.sistemaProductos.eliminarCategoria('${key}')" 
                                class="btn-eliminar-categoria" title="Eliminar categoría">
                            🗑️
                        </button>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    agregarCategoria() {
        const key = document.getElementById('nueva-categoria-key').value.trim();
        const nombre = document.getElementById('nueva-categoria-nombre').value.trim();
        const icono = document.getElementById('nueva-categoria-icono').value.trim();

        if (!key || !nombre || !icono) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (this.categorias[key]) {
            alert('Ya existe una categoría con esa clave');
            return;
        }

        // Agregar nueva categoría
        this.categorias[key] = {
            nombre: nombre,
            icono: icono
        };

        // Guardar en localStorage
        this.guardarCategorias();

        // Actualizar la lista en el modal
        document.getElementById('lista-categorias-actuales').innerHTML = this.generarListaCategorias();

        // Limpiar campos
        document.getElementById('nueva-categoria-key').value = '';
        document.getElementById('nueva-categoria-nombre').value = '';
        document.getElementById('nueva-categoria-icono').value = '';

        // Actualizar el selector de categorías en el formulario de productos
        this.actualizarSelectorCategorias();

        // Volver a renderizar para mostrar botones de filtro actualizados
        this.renderizarCatalogo();

        alert('Categoría agregada correctamente');
    }

    eliminarCategoria(key) {
        if (key === 'todos') {
            alert('No se puede eliminar la categoría "Todos"');
            return;
        }

        // Verificar si hay productos usando esta categoría
        const productosEnCategoria = this.productos.filter(p => p.categoria === key);
        if (productosEnCategoria.length > 0) {
            const confirmar = confirm(`Hay ${productosEnCategoria.length} productos en esta categoría. ¿Estás seguro de eliminarla? Los productos se moverán a "cafe".`);
            if (!confirmar) return;

            // Mover productos a categoría "cafe"
            this.productos.forEach(producto => {
                if (producto.categoria === key) {
                    producto.categoria = 'cafe';
                }
            });

            // Guardar productos actualizados
            this.guardarProductos();
        }

        // Eliminar categoría
        delete this.categorias[key];

        // Guardar categorías
        this.guardarCategorias();

        // Actualizar la lista en el modal
        document.getElementById('lista-categorias-actuales').innerHTML = this.generarListaCategorias();

        // Actualizar selectores
        this.actualizarSelectorCategorias();

        // Volver a renderizar
        this.renderizarCatalogo();

        alert('Categoría eliminada correctamente');
    }

    actualizarSelectorCategorias() {
        // Actualizar el selector en el formulario de productos
        const selector = document.getElementById('producto-categoria');
        if (selector) {
            const valorActual = selector.value;
            selector.innerHTML = '<option value="">Seleccionar categoría</option>';
            
            Object.entries(this.categorias).forEach(([key, categoria]) => {
                if (key !== 'todos') {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${categoria.icono} ${categoria.nombre}`;
                    selector.appendChild(option);
                }
            });
            
            // Restaurar valor si aún existe
            if (this.categorias[valorActual]) {
                selector.value = valorActual;
            }
        }
    }

    // ===== PERSISTENCIA =====
    guardarCategorias() {
        localStorage.setItem('categorias_cafeteria', JSON.stringify(this.categorias));
    }

    cargarCategorias() {
        const categoriasGuardadas = localStorage.getItem('categorias_cafeteria');
        if (categoriasGuardadas) {
            try {
                return JSON.parse(categoriasGuardadas);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
            }
        }
        return this.initCategorias();
    }

    guardarProductos() {
        localStorage.setItem('productos_cafeteria', JSON.stringify(this.productos));
    }

    // ===== UTILIDADES =====
    mostrarMensaje(mensaje, tipo = 'info') {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `mensaje-flotante mensaje-${tipo}`;
        messageDiv.textContent = mensaje;
        
        // Estilos básicos
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // Colores según el tipo
        switch(tipo) {
            case 'success':
                messageDiv.style.backgroundColor = '#28a745';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                messageDiv.style.backgroundColor = '#ffc107';
                messageDiv.style.color = '#000';
                break;
            default:
                messageDiv.style.backgroundColor = '#17a2b8';
        }
        
        // Agregar al body
        document.body.appendChild(messageDiv);
        
        // Animar entrada
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (messageDiv.parentElement) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema completo de productos...');
    window.sistemaProductos = new SistemaProductos();
    
    // Hacer funciones disponibles globalmente para compatibilidad
    window.editarProducto = (id) => window.sistemaProductos.editarProducto(id);
    window.eliminarProducto = (id) => window.sistemaProductos.eliminarProducto(id);
    window.abrirModalProducto = (producto) => window.sistemaProductos.abrirModalProducto(producto);
    
    console.log('✅ Sistema completo de productos inicializado correctamente');
});

console.log('✅ Sistema consolidado de productos cargado correctamente');