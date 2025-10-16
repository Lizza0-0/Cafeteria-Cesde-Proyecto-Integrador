class AccesibilidadWeb {
    constructor() {
        this.configuracion = JSON.parse(localStorage.getItem('configAccesibilidad')) || this.configuracionDefault();
        this.tematoActual = localStorage.getItem('temaAccesibilidad') || 'normal';
        this.tamanoFuente = parseInt(localStorage.getItem('tamanoFuente')) || 16;
        this.contrastoAlto = localStorage.getItem('contrastoAlto') === 'true';
        this.lecturaAutomatica = localStorage.getItem('lecturaAutomatica') === 'true';
        this.navegacionTeclado = true;
        this.inicializar();
    }

    configuracionDefault() {
        return {
            habilitarLectorPantalla: true,
            navegacionTeclado: true,
            altoContraste: false,
            tamanoFuenteGrande: false,
            animacionesReducidas: false,
            lecturaAutomatica: false,
            resaltadoFocus: true,
            descripcionesAudio: false,
            titulosDescriptivos: true,
            etiquetasAria: true
        };
    }

    inicializar() {
        this.crearPanelAccesibilidad();
        this.configurarNavegacionTeclado();
        this.configurarARIA();
        this.configurarContrastes();
        this.configurarLectorPantalla();
        this.aplicarConfiguracionGuardada();
        this.configurarEventosAccesibilidad();
        this.mejorarSemanticaHTML();
        this.configurarAtajosTeclado();
        this.inicializarDeteccionDiscapacidades();
    }

    crearPanelAccesibilidad() {
        // Crear botón de accesibilidad flotante
        const botonAccesibilidad = document.createElement('button');
        botonAccesibilidad.id = 'boton-accesibilidad';
        botonAccesibilidad.setAttribute('aria-label', 'Abrir panel de accesibilidad');
        botonAccesibilidad.setAttribute('title', 'Opciones de Accesibilidad (Alt + A)');
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        botonAccesibilidad.innerHTML = '♿';
        botonAccesibilidad.addEventListener('click', () => this.togglePanelAccesibilidad());
        botonAccesibilidad.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.togglePanelAccesibilidad();
            }
        });

        document.body.appendChild(botonAccesibilidad);

        // Crear panel de accesibilidad
        this.crearPanelOpciones();
    }

    crearPanelOpciones() {
        const panel = document.createElement('div');
        panel.id = 'panel-accesibilidad';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'titulo-accesibilidad');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: white;
            border: 3px solid #007bff;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transition: all 0.3s ease;
        `;

        panel.innerHTML = `
            <div class="accesibilidad-header">
                <h2 id="titulo-accesibilidad" style="color: #007bff; margin: 0 0 20px 0; font-size: 1.5em;">
                    ♿ Opciones de Accesibilidad
                </h2>
                <button id="cerrar-accesibilidad" 
                        aria-label="Cerrar panel de accesibilidad"
                        style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
                    ×
                </button>
            </div>

            <div class="accesibilidad-opciones">
                <!-- Contraste y Visualización -->
                <fieldset style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <legend style="font-weight: bold; color: #007bff; padding: 0 10px;">🎨 Visualización</legend>
                    
                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="alto-contraste" style="flex: 1;">Alto Contraste</label>
                        <button id="alto-contraste" class="btn-toggle" aria-pressed="false" role="switch">
                            <span class="sr-only">Activar alto contraste</span>
                            <span class="toggle-slider"></span>
                        </button>
                    </div>

                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="tamano-fuente">Tamaño de Fuente</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <button id="reducir-fuente" aria-label="Reducir tamaño de fuente">A-</button>
                            <span id="indicador-fuente" style="min-width: 40px; text-align: center;">16px</span>
                            <button id="aumentar-fuente" aria-label="Aumentar tamaño de fuente">A+</button>
                        </div>
                    </div>

                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="reducir-animaciones">Reducir Animaciones</label>
                        <button id="reducir-animaciones" class="btn-toggle" aria-pressed="false" role="switch">
                            <span class="sr-only">Reducir animaciones</span>
                            <span class="toggle-slider"></span>
                        </button>
                    </div>
                </fieldset>

                <!-- Navegación y Control -->
                <fieldset style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <legend style="font-weight: bold; color: #007bff; padding: 0 10px;">⌨️ Navegación</legend>
                    
                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="navegacion-teclado">Navegación por Teclado</label>
                        <button id="navegacion-teclado" class="btn-toggle" aria-pressed="true" role="switch">
                            <span class="sr-only">Activar navegación por teclado</span>
                            <span class="toggle-slider"></span>
                        </button>
                    </div>

                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="resaltado-focus">Resaltar Elementos Enfocados</label>
                        <button id="resaltado-focus" class="btn-toggle" aria-pressed="true" role="switch">
                            <span class="sr-only">Resaltar elementos enfocados</span>
                            <span class="toggle-slider"></span>
                        </button>
                    </div>
                </fieldset>

                <!-- Audio y Lectura -->
                <fieldset style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <legend style="font-weight: bold; color: #007bff; padding: 0 10px;">🔊 Audio</legend>
                    
                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="lectura-automatica">Lectura Automática</label>
                        <button id="lectura-automatica" class="btn-toggle" aria-pressed="false" role="switch">
                            <span class="sr-only">Activar lectura automática</span>
                            <span class="toggle-slider"></span>
                        </button>
                    </div>

                    <div class="opcion-accesibilidad" style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                        <label for="descripciones-audio">Descripciones de Audio</label>
                        <button id="descripciones-audio" class="btn-toggle" aria-pressed="false" role="switch">
                            <span class="sr-only">Activar descripciones de audio</span>
                            <span class="toggle-slider"></span>
                        </button>
                    </div>
                </fieldset>

                <!-- Atajos de Teclado -->
                <details style="margin: 15px 0; border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                    <summary style="font-weight: bold; color: #007bff; cursor: pointer;">⌨️ Atajos de Teclado</summary>
                    <div style="margin-top: 15px; font-size: 0.9em;">
                        <div><strong>Alt + A:</strong> Abrir panel de accesibilidad</div>
                        <div><strong>Alt + C:</strong> Activar/desactivar alto contraste</div>
                        <div><strong>Alt + +:</strong> Aumentar tamaño de fuente</div>
                        <div><strong>Alt + -:</strong> Reducir tamaño de fuente</div>
                        <div><strong>Alt + R:</strong> Activar/desactivar lectura automática</div>
                        <div><strong>Tab:</strong> Navegar por elementos</div>
                        <div><strong>Enter/Espacio:</strong> Activar elementos</div>
                        <div><strong>Escape:</strong> Cerrar modales/paneles</div>
                    </div>
                </details>

                <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                    <button id="restablecer-accesibilidad" 
                            style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        🔄 Restablecer
                    </button>
                    <button id="guardar-accesibilidad" 
                            style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        💾 Guardar Configuración
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Configurar eventos del panel
        this.configurarEventosPanel();

        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'overlay-accesibilidad';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        overlay.addEventListener('click', () => this.cerrarPanelAccesibilidad());
        document.body.appendChild(overlay);

        // Agregar estilos para toggles
        this.agregarEstilosToggle();
    }

    agregarEstilosToggle() {
        const estilo = document.createElement('style');
        estilo.textContent = `
            .btn-toggle {
                position: relative;
                width: 50px;
                height: 24px;
                background: #ccc;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                outline: none;
            }

            .btn-toggle[aria-pressed="true"] {
                background: #007bff;
            }

            .toggle-slider {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .btn-toggle[aria-pressed="true"] .toggle-slider {
                transform: translateX(26px);
            }

            .btn-toggle:focus {
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
            }

            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            .foco-visible {
                outline: 3px solid #007bff !important;
                outline-offset: 2px !important;
            }

            .alto-contraste {
                filter: contrast(150%) !important;
                background: #000 !important;
                color: #fff !important;
            }

            .alto-contraste a {
                color: #ffff00 !important;
            }

            .alto-contraste button {
                background: #ffffff !important;
                color: #000000 !important;
                border: 2px solid #000000 !important;
            }

            .animaciones-reducidas * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }

            @media (prefers-reduced-motion: reduce) {
                .animaciones-reducidas * {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(estilo);
    }

    configurarEventosPanel() {
        // Cerrar panel
        document.getElementById('cerrar-accesibilidad').addEventListener('click', () => {
            this.cerrarPanelAccesibilidad();
        });

        // Alto contraste
        document.getElementById('alto-contraste').addEventListener('click', (e) => {
            const activo = e.target.getAttribute('aria-pressed') === 'true';
            this.toggleAltoContraste(!activo);
        });

        // Tamaño de fuente
        document.getElementById('aumentar-fuente').addEventListener('click', () => {
            this.cambiarTamanoFuente(2);
        });

        document.getElementById('reducir-fuente').addEventListener('click', () => {
            this.cambiarTamanoFuente(-2);
        });

        // Animaciones reducidas
        document.getElementById('reducir-animaciones').addEventListener('click', (e) => {
            const activo = e.target.getAttribute('aria-pressed') === 'true';
            this.toggleAnimacionesReducidas(!activo);
        });

        // Navegación por teclado
        document.getElementById('navegacion-teclado').addEventListener('click', (e) => {
            const activo = e.target.getAttribute('aria-pressed') === 'true';
            this.toggleNavegacionTeclado(!activo);
        });

        // Resaltado de focus
        document.getElementById('resaltado-focus').addEventListener('click', (e) => {
            const activo = e.target.getAttribute('aria-pressed') === 'true';
            this.toggleResaltadoFocus(!activo);
        });

        // Lectura automática
        document.getElementById('lectura-automatica').addEventListener('click', (e) => {
            const activo = e.target.getAttribute('aria-pressed') === 'true';
            this.toggleLecturaAutomatica(!activo);
        });

        // Descripciones de audio
        document.getElementById('descripciones-audio').addEventListener('click', (e) => {
            const activo = e.target.getAttribute('aria-pressed') === 'true';
            this.toggleDescripcionesAudio(!activo);
        });

        // Restablecer configuración
        document.getElementById('restablecer-accesibilidad').addEventListener('click', () => {
            this.restablecerConfiguracion();
        });

        // Guardar configuración
        document.getElementById('guardar-accesibilidad').addEventListener('click', () => {
            this.guardarConfiguracion();
        });
    }

    configurarNavegacionTeclado() {
        // Hacer todos los elementos interactivos navegables
        document.querySelectorAll('button, a, input, select, textarea, [tabindex]').forEach(elemento => {
            if (!elemento.hasAttribute('tabindex')) {
                elemento.setAttribute('tabindex', '0');
            }
        });

        // Configurar navegación por flechas en menús
        document.querySelectorAll('nav, .menu').forEach(menu => {
            const elementos = menu.querySelectorAll('a, button');
            elementos.forEach((elemento, index) => {
                elemento.addEventListener('keydown', (e) => {
                    let siguienteIndex = index;
                    
                    switch(e.key) {
                        case 'ArrowDown':
                        case 'ArrowRight':
                            e.preventDefault();
                            siguienteIndex = (index + 1) % elementos.length;
                            break;
                        case 'ArrowUp':
                        case 'ArrowLeft':
                            e.preventDefault();
                            siguienteIndex = (index - 1 + elementos.length) % elementos.length;
                            break;
                        case 'Home':
                            e.preventDefault();
                            siguienteIndex = 0;
                            break;
                        case 'End':
                            e.preventDefault();
                            siguienteIndex = elementos.length - 1;
                            break;
                    }
                    
                    if (siguienteIndex !== index) {
                        elementos[siguienteIndex].focus();
                    }
                });
            });
        });

        // Configurar skip links
        this.crearSkipLinks();
    }

    crearSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.id = 'skip-links';
        skipLinks.style.cssText = `
            position: absolute;
            top: -100px;
            left: 0;
            z-index: 10002;
            background: white;
            padding: 10px;
            border: 2px solid #007bff;
            border-radius: 0 0 5px 0;
        `;

        skipLinks.innerHTML = `
            <a href="#contenido-principal" 
               style="color: #007bff; text-decoration: none; margin-right: 15px;"
               onFocus="this.parentElement.style.top='0'"
               onBlur="this.parentElement.style.top='-100px'">
               Saltar al contenido principal
            </a>
            <a href="#navegacion-principal" 
               style="color: #007bff; text-decoration: none;"
               onFocus="this.parentElement.style.top='0'"
               onBlur="this.parentElement.style.top='-100px'">
               Saltar a la navegación
            </a>
        `;

        document.body.insertBefore(skipLinks, document.body.firstChild);

        // Añadir IDs si no existen
        const nav = document.querySelector('nav');
        if (nav && !nav.id) {
            nav.id = 'navegacion-principal';
        }

        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'contenido-principal';
        }
    }

    configurarARIA() {
        // Mejorar semántica de botones
        document.querySelectorAll('button').forEach(boton => {
            if (!boton.hasAttribute('aria-label') && !boton.textContent.trim()) {
                const iconos = boton.innerHTML.match(/[\u{1F300}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu);
                if (iconos) {
                    boton.setAttribute('aria-label', `Botón con icono ${iconos[0]}`);
                }
            }
        });

        // Mejorar enlaces
        document.querySelectorAll('a').forEach(enlace => {
            if (enlace.textContent.trim().toLowerCase().includes('leer más') || 
                enlace.textContent.trim().toLowerCase().includes('ver más')) {
                const contexto = enlace.closest('[data-title]')?.getAttribute('data-title') || 
                               enlace.closest('h1, h2, h3, h4, h5, h6')?.textContent || 
                               'contenido';
                enlace.setAttribute('aria-label', `${enlace.textContent} sobre ${contexto}`);
            }
        });

        // Configurar live regions
        this.configurarLiveRegions();

        // Mejorar formularios
        this.mejorarFormularios();
    }

    configurarLiveRegions() {
        // Crear región para anuncios
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);

        // Función global para anunciar cambios
        window.anunciarCambio = (mensaje) => {
            liveRegion.textContent = mensaje;
        };
    }

    mejorarFormularios() {
        document.querySelectorAll('form').forEach(formulario => {
            // Asociar labels con inputs
            formulario.querySelectorAll('input, select, textarea').forEach(campo => {
                const label = formulario.querySelector(`label[for="${campo.id}"]`) ||
                             campo.closest('label') ||
                             campo.previousElementSibling;
                
                if (label && !campo.hasAttribute('aria-labelledby')) {
                    if (!label.id) {
                        label.id = `label-${campo.id || Date.now()}`;
                    }
                    campo.setAttribute('aria-labelledby', label.id);
                }

                // Añadir descripciones de error
                if (campo.hasAttribute('required')) {
                    campo.setAttribute('aria-required', 'true');
                }
            });

            // Configurar validación accesible
            formulario.addEventListener('submit', (e) => {
                const camposInvalidos = formulario.querySelectorAll(':invalid');
                if (camposInvalidos.length > 0) {
                    const primerInvalido = camposInvalidos[0];
                    primerInvalido.focus();
                    window.anunciarCambio(`Error en el campo ${primerInvalido.labels[0]?.textContent || 'formulario'}`);
                }
            });
        });
    }

    configurarContrastes() {
        // Verificar contraste de colores automáticamente
        const verificarContraste = (elemento) => {
            const estilos = window.getComputedStyle(elemento);
            const colorTexto = estilos.color;
            const colorFondo = estilos.backgroundColor;
            
            // Simplificado - en una implementación real usaríamos algoritmos de contraste WCAG
            const contrasteAdecuado = this.calcularContraste(colorTexto, colorFondo);
            
            if (!contrasteAdecuado) {
                elemento.style.outline = '1px solid orange';
                elemento.setAttribute('data-contraste-bajo', 'true');
            }
        };

        // Verificar elementos principales
        document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button').forEach(verificarContraste);
    }

    calcularContraste(color1, color2) {
        // Implementación simplificada - en producción usar algoritmo WCAG completo
        return true; // Placeholder
    }

    configurarLectorPantalla() {
        // Mejorar compatibilidad con lectores de pantalla
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('alt')) {
                img.setAttribute('alt', '');
            }
        });

        // Configurar regiones
        const nav = document.querySelector('nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegación principal');
        }

        const main = document.querySelector('main');
        if (main) {
            main.setAttribute('role', 'main');
        }

        // Configurar encabezados jerárquicos
        this.verificarJerarquiaEncabezados();
    }

    verificarJerarquiaEncabezados() {
        const encabezados = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let nivelAnterior = 0;
        
        encabezados.forEach(encabezado => {
            const nivelActual = parseInt(encabezado.tagName.charAt(1));
            
            if (nivelActual > nivelAnterior + 1) {
                console.warn(`Salto en jerarquía de encabezados: ${encabezado.tagName} después de H${nivelAnterior}`);
            }
            
            nivelAnterior = nivelActual;
        });
    }

    configurarAtajosTeclado() {
        document.addEventListener('keydown', (e) => {
            // Solo procesar si Alt está presionado
            if (!e.altKey) return;

            switch(e.key.toLowerCase()) {
                case 'a':
                    e.preventDefault();
                    this.togglePanelAccesibilidad();
                    break;
                case 'c':
                    e.preventDefault();
                    this.toggleAltoContraste();
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    this.cambiarTamanoFuente(2);
                    break;
                case '-':
                    e.preventDefault();
                    this.cambiarTamanoFuente(-2);
                    break;
                case 'r':
                    e.preventDefault();
                    this.toggleLecturaAutomatica();
                    break;
            }
        });

        // Escape para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarTodosLosModales();
            }
        });
    }

    configurarEventosAccesibilidad() {
        // Detectar uso del teclado para navegación
        let navegandoConTeclado = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                navegandoConTeclado = true;
                document.body.classList.add('navegando-teclado');
            }
        });

        document.addEventListener('mousedown', () => {
            navegandoConTeclado = false;
            document.body.classList.remove('navegando-teclado');
        });

        // Mejorar feedback de focus
        document.addEventListener('focusin', (e) => {
            if (this.configuracion.resaltadoFocus && navegandoConTeclado) {
                e.target.classList.add('foco-visible');
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('foco-visible');
        });
    }

    inicializarDeteccionDiscapacidades() {
        // Detectar preferencias del sistema
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.toggleAnimacionesReducidas(true);
        }

        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.toggleAltoContraste(true);
        }

        // Detectar tecnologías asistivas
        this.detectarTecnologiasAsistivas();
    }

    detectarTecnologiasAsistivas() {
        // Detectar si hay un lector de pantalla activo
        const testElement = document.createElement('div');
        testElement.setAttribute('aria-hidden', 'true');
        testElement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        testElement.innerHTML = 'test';
        
        document.body.appendChild(testElement);
        
        setTimeout(() => {
            if (testElement.offsetParent === null) {
                // Posible lector de pantalla detectado
                this.configuracion.habilitarLectorPantalla = true;
                this.optimizarParaLectorPantalla();
            }
            document.body.removeChild(testElement);
        }, 100);
    }

    optimizarParaLectorPantalla() {
        // Añadir más etiquetas descriptivas
        document.querySelectorAll('button, a').forEach(elemento => {
            if (!elemento.hasAttribute('aria-label') && elemento.textContent.length < 3) {
                const contexto = elemento.closest('[data-section]')?.getAttribute('data-section') || 'página';
                elemento.setAttribute('aria-label', `${elemento.textContent} en ${contexto}`);
            }
        });

        // Mejorar navegación por regiones
        this.crearMapaSitio();
    }

    crearMapaSitio() {
        const mapaSitio = document.createElement('nav');
        mapaSitio.setAttribute('aria-label', 'Mapa del sitio');
        mapaSitio.id = 'mapa-sitio';
        mapaSitio.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;

        const enlaces = document.querySelectorAll('nav a, main a');
        const lista = document.createElement('ul');
        
        enlaces.forEach(enlace => {
            const item = document.createElement('li');
            const enlaceClonado = enlace.cloneNode(true);
            item.appendChild(enlaceClonado);
            lista.appendChild(item);
        });

        mapaSitio.appendChild(lista);
        document.body.appendChild(mapaSitio);
    }

    // Métodos de toggle para funcionalidades
    togglePanelAccesibilidad() {
        const panel = document.getElementById('panel-accesibilidad');
        const overlay = document.getElementById('overlay-accesibilidad');
        const visible = panel.getAttribute('aria-hidden') === 'false';

        if (visible) {
            this.cerrarPanelAccesibilidad();
        } else {
            panel.setAttribute('aria-hidden', 'false');
            panel.style.transform = 'translate(-50%, -50%) scale(1)';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            
            // Focus en el primer elemento
            const primerElemento = panel.querySelector('button, input, select, textarea, [tabindex]');
            if (primerElemento) {
                primerElemento.focus();
            }
        }
    }

    cerrarPanelAccesibilidad() {
        const panel = document.getElementById('panel-accesibilidad');
        const overlay = document.getElementById('overlay-accesibilidad');
        
        panel.setAttribute('aria-hidden', 'true');
        panel.style.transform = 'translate(-50%, -50%) scale(0)';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        
        // Devolver focus al botón de accesibilidad
        document.getElementById('boton-accesibilidad').focus();
    }

    toggleAltoContraste(activar = null) {
        const activo = activar !== null ? activar : !this.contrastoAlto;
        this.contrastoAlto = activo;
        
        const toggle = document.getElementById('alto-contraste');
        if (toggle) {
            toggle.setAttribute('aria-pressed', activo.toString());
        }

        if (activo) {
            document.body.classList.add('alto-contraste');
        } else {
            document.body.classList.remove('alto-contraste');
        }

        localStorage.setItem('contrastoAlto', activo.toString());
        window.anunciarCambio(`Alto contraste ${activo ? 'activado' : 'desactivado'}`);
    }

    cambiarTamanoFuente(incremento) {
        this.tamanoFuente = Math.max(12, Math.min(24, this.tamanoFuente + incremento));
        
        document.body.style.fontSize = `${this.tamanoFuente}px`;
        
        const indicador = document.getElementById('indicador-fuente');
        if (indicador) {
            indicador.textContent = `${this.tamanoFuente}px`;
        }

        localStorage.setItem('tamanoFuente', this.tamanoFuente.toString());
        window.anunciarCambio(`Tamaño de fuente cambiado a ${this.tamanoFuente} píxeles`);
    }

    toggleAnimacionesReducidas(activar = null) {
        const activo = activar !== null ? activar : !this.configuracion.animacionesReducidas;
        this.configuracion.animacionesReducidas = activo;
        
        const toggle = document.getElementById('reducir-animaciones');
        if (toggle) {
            toggle.setAttribute('aria-pressed', activo.toString());
        }

        if (activo) {
            document.body.classList.add('animaciones-reducidas');
        } else {
            document.body.classList.remove('animaciones-reducidas');
        }

        window.anunciarCambio(`Animaciones ${activo ? 'reducidas' : 'restauradas'}`);
    }

    toggleNavegacionTeclado(activar = null) {
        const activo = activar !== null ? activar : !this.navegacionTeclado;
        this.navegacionTeclado = activo;
        
        const toggle = document.getElementById('navegacion-teclado');
        if (toggle) {
            toggle.setAttribute('aria-pressed', activo.toString());
        }

        document.querySelectorAll('*').forEach(elemento => {
            if (activo) {
                if (elemento.tagName.match(/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/)) {
                    elemento.setAttribute('tabindex', '0');
                }
            } else {
                if (!elemento.hasAttribute('data-original-tabindex')) {
                    elemento.removeAttribute('tabindex');
                }
            }
        });

        window.anunciarCambio(`Navegación por teclado ${activo ? 'activada' : 'desactivada'}`);
    }

    toggleResaltadoFocus(activar = null) {
        const activo = activar !== null ? activar : !this.configuracion.resaltadoFocus;
        this.configuracion.resaltadoFocus = activo;
        
        const toggle = document.getElementById('resaltado-focus');
        if (toggle) {
            toggle.setAttribute('aria-pressed', activo.toString());
        }

        window.anunciarCambio(`Resaltado de elementos enfocados ${activo ? 'activado' : 'desactivado'}`);
    }

    toggleLecturaAutomatica(activar = null) {
        const activo = activar !== null ? activar : !this.lecturaAutomatica;
        this.lecturaAutomatica = activo;
        
        const toggle = document.getElementById('lectura-automatica');
        if (toggle) {
            toggle.setAttribute('aria-pressed', activo.toString());
        }

        if (activo) {
            this.iniciarLecturaAutomatica();
        } else {
            this.detenerLecturaAutomatica();
        }

        localStorage.setItem('lecturaAutomatica', activo.toString());
        window.anunciarCambio(`Lectura automática ${activo ? 'activada' : 'desactivada'}`);
    }

    toggleDescripcionesAudio(activar = null) {
        const activo = activar !== null ? activar : !this.configuracion.descripcionesAudio;
        this.configuracion.descripcionesAudio = activo;
        
        const toggle = document.getElementById('descripciones-audio');
        if (toggle) {
            toggle.setAttribute('aria-pressed', activo.toString());
        }

        window.anunciarCambio(`Descripciones de audio ${activo ? 'activadas' : 'desactivadas'}`);
    }

    iniciarLecturaAutomatica() {
        if ('speechSynthesis' in window) {
            // Leer el título de la página
            const titulo = document.title;
            this.leerTexto(titulo);
            
            // Configurar lectura automática de cambios
            this.configurarLecturaAutomaticaCambios();
        }
    }

    detenerLecturaAutomatica() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    leerTexto(texto) {
        if ('speechSynthesis' in window && this.lecturaAutomatica) {
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }

    configurarLecturaAutomaticaCambios() {
        // Leer cambios en live regions
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const texto = liveRegion.textContent;
                        if (texto.trim()) {
                            this.leerTexto(texto);
                        }
                    }
                });
            });

            observer.observe(liveRegion, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    }

    cerrarTodosLosModales() {
        // Cerrar panel de accesibilidad
        const panel = document.getElementById('panel-accesibilidad');
        if (panel && panel.getAttribute('aria-hidden') === 'false') {
            this.cerrarPanelAccesibilidad();
        }

        // Cerrar otros modales si existen
        document.querySelectorAll('[role="dialog"]:not(#panel-accesibilidad)').forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    aplicarConfiguracionGuardada() {
        // Aplicar configuraciones guardadas
        if (this.contrastoAlto) {
            this.toggleAltoContraste(true);
        }

        if (this.tamanoFuente !== 16) {
            document.body.style.fontSize = `${this.tamanoFuente}px`;
            const indicador = document.getElementById('indicador-fuente');
            if (indicador) {
                indicador.textContent = `${this.tamanoFuente}px`;
            }
        }

        if (this.lecturaAutomatica) {
            this.toggleLecturaAutomatica(true);
        }

        // Actualizar estado de los toggles
        Object.keys(this.configuracion).forEach(key => {
            const elemento = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (elemento && elemento.classList.contains('btn-toggle')) {
                elemento.setAttribute('aria-pressed', this.configuracion[key].toString());
            }
        });
    }

    restablecerConfiguracion() {
        // Restablecer a valores por defecto
        this.configuracion = this.configuracionDefault();
        this.contrastoAlto = false;
        this.tamanoFuente = 16;
        this.lecturaAutomatica = false;

        // Aplicar cambios visuales
        document.body.classList.remove('alto-contraste', 'animaciones-reducidas');
        document.body.style.fontSize = '16px';
        
        // Actualizar toggles
        document.querySelectorAll('.btn-toggle').forEach(toggle => {
            toggle.setAttribute('aria-pressed', 'false');
        });

        document.getElementById('indicador-fuente').textContent = '16px';

        // Limpiar localStorage
        localStorage.removeItem('configAccesibilidad');
        localStorage.removeItem('contrastoAlto');
        localStorage.removeItem('tamanoFuente');
        localStorage.removeItem('lecturaAutomatica');

        window.anunciarCambio('Configuración de accesibilidad restablecida');
    }

    guardarConfiguracion() {
        localStorage.setItem('configAccesibilidad', JSON.stringify(this.configuracion));
        localStorage.setItem('contrastoAlto', this.contrastoAlto.toString());
        localStorage.setItem('tamanoFuente', this.tamanoFuente.toString());
        localStorage.setItem('lecturaAutomatica', this.lecturaAutomatica.toString());

        window.anunciarCambio('Configuración de accesibilidad guardada');
        this.cerrarPanelAccesibilidad();
    }

    mejorarSemanticaHTML() {
        // Añadir roles semánticos faltantes
        document.querySelectorAll('.card, .panel').forEach(elemento => {
            if (!elemento.hasAttribute('role')) {
                elemento.setAttribute('role', 'article');
            }
        });

        document.querySelectorAll('.menu, .nav-menu').forEach(elemento => {
            if (!elemento.hasAttribute('role')) {
                elemento.setAttribute('role', 'menu');
            }
        });

        // Mejorar tablas
        document.querySelectorAll('table').forEach(tabla => {
            if (!tabla.hasAttribute('role')) {
                tabla.setAttribute('role', 'table');
            }
            
            tabla.querySelectorAll('th').forEach(th => {
                if (!th.hasAttribute('scope')) {
                    th.setAttribute('scope', th.parentNode.rowIndex === 0 ? 'col' : 'row');
                }
            });
        });
    }

    // Método para validar accesibilidad
    validarAccesibilidad() {
        const problemas = [];

        // Verificar imágenes sin alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
            problemas.push({
                tipo: 'error',
                elemento: img,
                mensaje: 'Imagen sin texto alternativo'
            });
        });

        // Verificar encabezados
        const encabezados = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (encabezados.length === 0) {
            problemas.push({
                tipo: 'warning',
                mensaje: 'No se encontraron encabezados en la página'
            });
        }

        // Verificar enlaces descriptivos
        document.querySelectorAll('a').forEach(enlace => {
            const texto = enlace.textContent.trim().toLowerCase();
            if (texto === 'click aquí' || texto === 'leer más' || texto === 'ver más') {
                problemas.push({
                    tipo: 'warning',
                    elemento: enlace,
                    mensaje: 'Enlace con texto poco descriptivo'
                });
            }
        });

        return problemas;
    }

    // Método para generar reporte de accesibilidad
    generarReporteAccesibilidad() {
        const problemas = this.validarAccesibilidad();
        const reporte = {
            fecha: new Date().toISOString(),
            problemas: problemas.length,
            errores: problemas.filter(p => p.tipo === 'error').length,
            advertencias: problemas.filter(p => p.tipo === 'warning').length,
            detalles: problemas
        };

        console.log('Reporte de Accesibilidad:', reporte);
        return reporte;
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.accesibilidadWeb = new AccesibilidadWeb();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccesibilidadWeb;
}