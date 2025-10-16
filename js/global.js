/**
 * Sistema Global - Cafetería Cesde
 * Navegación, Multiidioma y Accesibilidad consolidados
 */

// ===== SISTEMA DE NAVEGACIÓN =====
class SistemaNavegacion {
    constructor() {
        this.initNavegacion();
    }

    initNavegacion() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (navToggle && navMenu) {
            // Toggle del menú móvil
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu(navMenu, navToggle);
            });
            
            // Cerrar menú al hacer clic en un enlace
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.cerrarMenu(navMenu, navToggle);
                });
            });
            
            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    this.cerrarMenu(navMenu, navToggle);
                }
            });
            
            // Cerrar menú al redimensionar la ventana
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.cerrarMenu(navMenu, navToggle);
                }
            });
            
            // Manejar tecla Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cerrarMenu(navMenu, navToggle);
                }
            });
        }
    }

    toggleMenu(navMenu, navToggle) {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Prevenir scroll del body cuando el menú está abierto
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    cerrarMenu(navMenu, navToggle) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== SISTEMA MULTIIDIOMA =====
class SistemaMultiidioma {
    constructor() {
        this.idiomaActual = localStorage.getItem('idioma') || 'es';
        this.traducciones = this.initTraducciones();
        this.configuracion = JSON.parse(localStorage.getItem('configIdioma')) || this.configuracionDefault();
        this.inicializar();
    }

    configuracionDefault() {
        return {
            idiomasPorDefecto: ['es', 'en', 'pt'],
            deteccionAutomatica: true,
            persistirSeleccion: true,
            mostrarBanderas: true,
            animacionCambio: true
        };
    }

    async inicializar() {
        this.crearSelectorIdioma();
        this.detectarIdiomaNavegador();
        this.configurarEventos();
        this.aplicarTraduccion(this.idiomaActual);
    }

    initTraducciones() {
        return {
            es: {
                // Navegación
                'nav.inicio': 'Inicio',
                'nav.productos': 'Productos',
                'nav.compras': 'Compras',
                'nav.inventario': 'Inventario',
                'nav.clientes': 'Clientes',
                'nav.empleados': 'Empleados',
                'nav.proveedores': 'Proveedores',
                'nav.reportes': 'Reportes',
                'nav.facturacion': 'Facturación',
                'nav.soporte': 'Soporte',
                
                // Títulos principales
                'titulo.cafeteria': 'Cafetería Cesde',
                'titulo.bienvenido': 'Bienvenido',
                'titulo.sistema': 'Sistema de Gestión',
                
                // Botones comunes
                'btn.agregar': 'Agregar',
                'btn.editar': 'Editar',
                'btn.eliminar': 'Eliminar',
                'btn.guardar': 'Guardar',
                'btn.cancelar': 'Cancelar',
                'btn.buscar': 'Buscar',
                'btn.filtrar': 'Filtrar',
                'btn.exportar': 'Exportar',
                'btn.imprimir': 'Imprimir',
                
                // Mensajes
                'msg.guardado': 'Guardado correctamente',
                'msg.eliminado': 'Eliminado correctamente',
                'msg.error': 'Ha ocurrido un error',
                'msg.confirmacion': '¿Estás seguro?'
            },
            en: {
                // Navigation
                'nav.inicio': 'Home',
                'nav.productos': 'Products',
                'nav.compras': 'Purchases',
                'nav.inventario': 'Inventory',
                'nav.clientes': 'Customers',
                'nav.empleados': 'Employees',
                'nav.proveedores': 'Suppliers',
                'nav.reportes': 'Reports',
                'nav.facturacion': 'Billing',
                'nav.soporte': 'Support',
                
                // Main titles
                'titulo.cafeteria': 'Cesde Café',
                'titulo.bienvenido': 'Welcome',
                'titulo.sistema': 'Management System',
                
                // Common buttons
                'btn.agregar': 'Add',
                'btn.editar': 'Edit',
                'btn.eliminar': 'Delete',
                'btn.guardar': 'Save',
                'btn.cancelar': 'Cancel',
                'btn.buscar': 'Search',
                'btn.filtrar': 'Filter',
                'btn.exportar': 'Export',
                'btn.imprimir': 'Print',
                
                // Messages
                'msg.guardado': 'Saved successfully',
                'msg.eliminado': 'Deleted successfully',
                'msg.error': 'An error occurred',
                'msg.confirmacion': 'Are you sure?'
            },
            pt: {
                // Navegação
                'nav.inicio': 'Início',
                'nav.productos': 'Produtos',
                'nav.compras': 'Compras',
                'nav.inventario': 'Inventário',
                'nav.clientes': 'Clientes',
                'nav.empleados': 'Funcionários',
                'nav.proveedores': 'Fornecedores',
                'nav.reportes': 'Relatórios',
                'nav.facturacion': 'Faturamento',
                'nav.soporte': 'Suporte',
                
                // Títulos principais
                'titulo.cafeteria': 'Cafeteria Cesde',
                'titulo.bienvenido': 'Bem-vindo',
                'titulo.sistema': 'Sistema de Gestão',
                
                // Botões comuns
                'btn.agregar': 'Adicionar',
                'btn.editar': 'Editar',
                'btn.eliminar': 'Excluir',
                'btn.guardar': 'Salvar',
                'btn.cancelar': 'Cancelar',
                'btn.buscar': 'Buscar',
                'btn.filtrar': 'Filtrar',
                'btn.exportar': 'Exportar',
                'btn.imprimir': 'Imprimir',
                
                // Mensagens
                'msg.guardado': 'Salvo com sucesso',
                'msg.eliminado': 'Excluído com sucesso',
                'msg.error': 'Ocorreu um erro',
                'msg.confirmacion': 'Tem certeza?'
            }
        };
    }

    crearSelectorIdioma() {
        const selector = document.createElement('div');
        selector.id = 'selector-idioma';
        selector.className = 'selector-idioma';
        selector.innerHTML = `
            <button class="btn-idioma" data-idioma="es">🇪🇸 ES</button>
            <button class="btn-idioma" data-idioma="en">🇺🇸 EN</button>
            <button class="btn-idioma" data-idioma="pt">🇧🇷 PT</button>
        `;
        
        // Agregar al header si existe
        const header = document.querySelector('header') || document.body;
        header.appendChild(selector);
        
        // Marcar idioma activo
        this.actualizarSelectorIdioma();
    }

    detectarIdiomaNavegador() {
        if (this.configuracion.deteccionAutomatica && !localStorage.getItem('idioma')) {
            const idiomaNavegador = navigator.language.substr(0, 2);
            if (this.traducciones[idiomaNavegador]) {
                this.idiomaActual = idiomaNavegador;
                this.guardarConfiguracion();
            }
        }
    }

    configurarEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-idioma')) {
                const nuevoIdioma = e.target.dataset.idioma;
                this.cambiarIdioma(nuevoIdioma);
            }
        });
    }

    cambiarIdioma(idioma) {
        if (this.traducciones[idioma]) {
            this.idiomaActual = idioma;
            this.aplicarTraduccion(idioma);
            this.guardarConfiguracion();
            this.actualizarSelectorIdioma();
        }
    }

    aplicarTraduccion(idioma) {
        const traducciones = this.traducciones[idioma];
        if (!traducciones) return;

        // Buscar elementos con data-translate
        document.querySelectorAll('[data-translate]').forEach(elemento => {
            const clave = elemento.dataset.translate;
            if (traducciones[clave]) {
                if (elemento.tagName === 'INPUT' && elemento.type === 'text') {
                    elemento.placeholder = traducciones[clave];
                } else {
                    elemento.textContent = traducciones[clave];
                }
            }
        });

        // Actualizar título de la página
        if (traducciones['titulo.cafeteria']) {
            document.title = traducciones['titulo.cafeteria'];
        }
    }

    actualizarSelectorIdioma() {
        document.querySelectorAll('.btn-idioma').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.idioma === this.idiomaActual) {
                btn.classList.add('active');
            }
        });
    }

    guardarConfiguracion() {
        localStorage.setItem('idioma', this.idiomaActual);
        localStorage.setItem('configIdioma', JSON.stringify(this.configuracion));
    }

    obtenerTraduccion(clave) {
        return this.traducciones[this.idiomaActual]?.[clave] || clave;
    }
}

// ===== SISTEMA DE ACCESIBILIDAD =====
class SistemaAccesibilidad {
    constructor() {
        this.configuracion = JSON.parse(localStorage.getItem('configAccesibilidad')) || this.configuracionDefault();
        this.tamanoFuente = parseInt(localStorage.getItem('tamanoFuente')) || 16;
        this.contrastoAlto = localStorage.getItem('contrastoAlto') === 'true';
        this.lecturaAutomatica = localStorage.getItem('lecturaAutomatica') === 'true';
        this.inicializar();
    }

    configuracionDefault() {
        return {
            navegacionTeclado: true,
            altoContraste: false,
            tamanoFuenteGrande: false,
            animacionesReducidas: false,
            lecturaAutomatica: false,
            resaltadoFocus: true
        };
    }

    inicializar() {
        this.crearPanelAccesibilidad();
        this.configurarNavegacionTeclado();
        this.configurarARIA();
        this.aplicarConfiguracionGuardada();
        this.configurarEventosAccesibilidad();
        this.configurarAtajosTeclado();
    }

    crearPanelAccesibilidad() {
        const botonAccesibilidad = document.createElement('button');
        botonAccesibilidad.id = 'boton-accesibilidad';
        botonAccesibilidad.setAttribute('aria-label', 'Abrir panel de accesibilidad');
        botonAccesibilidad.setAttribute('title', 'Opciones de Accesibilidad (Alt + A)');
        botonAccesibilidad.innerHTML = '♿';
        botonAccesibilidad.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 60px;
            height: 60px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            transition: all 0.3s ease;
        `;
        
        // Panel de accesibilidad
        const panelAccesibilidad = document.createElement('div');
        panelAccesibilidad.id = 'panel-accesibilidad';
        panelAccesibilidad.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            z-index: 1000;
            display: none;
            min-width: 250px;
        `;
        
        panelAccesibilidad.innerHTML = `
            <h3>Opciones de Accesibilidad</h3>
            <div class="accesibilidad-opciones">
                <label><input type="checkbox" id="alto-contraste"> Alto Contraste</label>
                <label><input type="checkbox" id="fuente-grande"> Fuente Grande</label>
                <label><input type="checkbox" id="lectura-automatica"> Lectura Automática</label>
                <label><input type="checkbox" id="animaciones-reducidas"> Reducir Animaciones</label>
                <div class="tamano-fuente">
                    <label>Tamaño de Fuente:</label>
                    <input type="range" id="slider-fuente" min="12" max="24" value="16">
                    <span id="valor-fuente">16px</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(botonAccesibilidad);
        document.body.appendChild(panelAccesibilidad);
        
        // Evento para mostrar/ocultar panel
        botonAccesibilidad.addEventListener('click', () => {
            const panel = document.getElementById('panel-accesibilidad');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
    }

    configurarNavegacionTeclado() {
        // Mejorar navegación con teclado
        document.addEventListener('keydown', (e) => {
            // Tab mejorado
            if (e.key === 'Tab') {
                this.resaltarElementoActivo();
            }
            
            // Atajos de teclado
            if (e.altKey) {
                switch(e.key) {
                    case 'a':
                    case 'A':
                        e.preventDefault();
                        document.getElementById('boton-accesibilidad').click();
                        break;
                    case 'm':
                    case 'M':
                        e.preventDefault();
                        this.saltarAlContenidoPrincipal();
                        break;
                }
            }
        });
    }

    configurarARIA() {
        // Agregar roles y etiquetas ARIA automáticamente
        document.querySelectorAll('main').forEach(main => {
            if (!main.getAttribute('role')) {
                main.setAttribute('role', 'main');
            }
        });
        
        document.querySelectorAll('nav').forEach(nav => {
            if (!nav.getAttribute('role')) {
                nav.setAttribute('role', 'navigation');
            }
        });
        
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                btn.setAttribute('aria-label', 'Botón');
            }
        });
    }

    aplicarConfiguracionGuardada() {
        // Aplicar configuraciones guardadas
        if (this.contrastoAlto) {
            this.toggleAltoContraste(true);
        }
        
        if (this.tamanoFuente !== 16) {
            this.cambiarTamanoFuente(this.tamanoFuente);
        }
        
        // Actualizar controles del panel
        setTimeout(() => {
            const altoContrasteCheck = document.getElementById('alto-contraste');
            const fuenteGrandeCheck = document.getElementById('fuente-grande');
            const lecturaCheck = document.getElementById('lectura-automatica');
            const sliderFuente = document.getElementById('slider-fuente');
            const valorFuente = document.getElementById('valor-fuente');
            
            if (altoContrasteCheck) altoContrasteCheck.checked = this.contrastoAlto;
            if (fuenteGrandeCheck) fuenteGrandeCheck.checked = this.tamanoFuente > 16;
            if (lecturaCheck) lecturaCheck.checked = this.lecturaAutomatica;
            if (sliderFuente) {
                sliderFuente.value = this.tamanoFuente;
                valorFuente.textContent = this.tamanoFuente + 'px';
            }
        }, 100);
    }

    configurarEventosAccesibilidad() {
        // Alto contraste
        document.addEventListener('change', (e) => {
            if (e.target.id === 'alto-contraste') {
                this.toggleAltoContraste(e.target.checked);
            }
            
            if (e.target.id === 'fuente-grande') {
                const nuevoTamano = e.target.checked ? 20 : 16;
                this.cambiarTamanoFuente(nuevoTamano);
            }
            
            if (e.target.id === 'lectura-automatica') {
                this.toggleLecturaAutomatica(e.target.checked);
            }
        });
        
        // Slider de tamaño de fuente
        document.addEventListener('input', (e) => {
            if (e.target.id === 'slider-fuente') {
                const nuevoTamano = parseInt(e.target.value);
                this.cambiarTamanoFuente(nuevoTamano);
                document.getElementById('valor-fuente').textContent = nuevoTamano + 'px';
            }
        });
    }

    configurarAtajosTeclado() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Alt + combinaciones
            if (e.ctrlKey && e.altKey) {
                switch(e.key) {
                    case 'c':
                    case 'C':
                        e.preventDefault();
                        this.toggleAltoContraste();
                        break;
                    case '+':
                        e.preventDefault();
                        this.aumentarFuente();
                        break;
                    case '-':
                        e.preventDefault();
                        this.disminuirFuente();
                        break;
                }
            }
        });
    }

    toggleAltoContraste(activar = null) {
        this.contrastoAlto = activar !== null ? activar : !this.contrastoAlto;
        
        if (this.contrastoAlto) {
            document.body.classList.add('alto-contraste');
        } else {
            document.body.classList.remove('alto-contraste');
        }
        
        localStorage.setItem('contrastoAlto', this.contrastoAlto.toString());
    }

    cambiarTamanoFuente(tamano) {
        this.tamanoFuente = tamano;
        document.documentElement.style.fontSize = tamano + 'px';
        localStorage.setItem('tamanoFuente', tamano.toString());
    }

    aumentarFuente() {
        if (this.tamanoFuente < 24) {
            this.cambiarTamanoFuente(this.tamanoFuente + 2);
        }
    }

    disminuirFuente() {
        if (this.tamanoFuente > 12) {
            this.cambiarTamanoFuente(this.tamanoFuente - 2);
        }
    }

    toggleLecturaAutomatica(activar = null) {
        this.lecturaAutomatica = activar !== null ? activar : !this.lecturaAutomatica;
        localStorage.setItem('lecturaAutomatica', this.lecturaAutomatica.toString());
        
        if (this.lecturaAutomatica && 'speechSynthesis' in window) {
            this.configurarLectorPantalla();
        }
    }

    configurarLectorPantalla() {
        document.addEventListener('focus', (e) => {
            if (this.lecturaAutomatica && e.target.tagName) {
                const texto = this.obtenerTextoElemento(e.target);
                if (texto) {
                    this.leerTexto(texto);
                }
            }
        });
    }

    obtenerTextoElemento(elemento) {
        return elemento.getAttribute('aria-label') || 
               elemento.getAttribute('title') || 
               elemento.textContent.trim() || 
               elemento.placeholder || 
               elemento.alt || '';
    }

    leerTexto(texto) {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel(); // Cancelar lectura anterior
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    resaltarElementoActivo() {
        // Mejorar el resaltado del elemento activo
        const elementoActivo = document.activeElement;
        if (elementoActivo && elementoActivo !== document.body) {
            elementoActivo.style.outline = '3px solid #007bff';
            elementoActivo.style.outlineOffset = '2px';
            
            setTimeout(() => {
                elementoActivo.style.outline = '';
                elementoActivo.style.outlineOffset = '';
            }, 3000);
        }
    }

    saltarAlContenidoPrincipal() {
        const main = document.querySelector('main') || document.querySelector('#main') || document.querySelector('.main');
        if (main) {
            main.focus();
            main.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistemas globales...');
    
    // Inicializar sistemas
    window.sistemaNavegacion = new SistemaNavegacion();
    window.sistemaMultiidioma = new SistemaMultiidioma();
    window.sistemaAccesibilidad = new SistemaAccesibilidad();
    
    console.log('✅ Sistemas globales inicializados correctamente');
});

console.log('✅ Sistema global consolidado cargado correctamente');