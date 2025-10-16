class OptimizacionRendimiento {
    constructor() {
        this.configuracion = JSON.parse(localStorage.getItem('configRendimiento')) || this.configuracionDefault();
        this.cache = new Map();
        this.imagenesOptimizadas = new Set();
        this.consultasOptimizadas = new Map();
        this.observadorInterseccion = null;
        this.trabajadorCache = null;
        this.inicializar();
    }

    configuracionDefault() {
        return {
            lazyLoading: true,
            cacheInteligente: true,
            compresionImagenes: true,
            optimizacionConsultas: true,
            precargarRecursos: true,
            minimizarReflow: true,
            debounceInputs: 300,
            timeoutCache: 300000, // 5 minutos
            maxTamañoCache: 50, // MB
            compresiónNivel: 0.8,
            resolucionMaxima: 1920
        };
    }

    async inicializar() {
        console.log('🚀 Iniciando optimización de rendimiento...');
        
        // Medir rendimiento inicial
        this.medirRendimientoInicial();
        
        // Configurar optimizaciones
        if (this.configuracion.lazyLoading) {
            this.configurarLazyLoading();
        }
        
        if (this.configuracion.cacheInteligente) {
            this.configurarCacheInteligente();
        }
        
        if (this.configuracion.compresionImagenes) {
            this.optimizarImagenes();
        }
        
        if (this.configuracion.optimizacionConsultas) {
            this.optimizarConsultas();
        }
        
        if (this.configuracion.precargarRecursos) {
            this.precargarRecursosCriticos();
        }
        
        if (this.configuracion.minimizarReflow) {
            this.minimizarReflows();
        }
        
        // Configurar debounce para inputs
        this.configurarDebounceInputs();
        
        // Iniciar Web Worker para cache
        this.iniciarTrabajadorCache();
        
        // Configurar Service Worker para caché offline
        this.configurarServiceWorkerCache();
        
        // Monitorear rendimiento
        this.iniciarMonitoreoRendimiento();
        
        console.log('✅ Optimización de rendimiento configurada');
    }

    medirRendimientoInicial() {
        if ('performance' in window) {
            const medicion = {
                timestamp: Date.now(),
                navigation: performance.getEntriesByType('navigation')[0],
                memoria: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : null,
                recursos: performance.getEntriesByType('resource').length,
                medidas: performance.getEntriesByType('measure').length
            };
            
            localStorage.setItem('medicionRendimientoInicial', JSON.stringify(medicion));
            console.log('📊 Medición inicial de rendimiento:', medicion);
        }
    }

    configurarLazyLoading() {
        // Configurar Intersection Observer para lazy loading
        this.observadorInterseccion = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.cargarElementoLazy(entry.target);
                    this.observadorInterseccion.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Aplicar lazy loading a imágenes
        this.configurarLazyLoadingImagenes();
        
        // Aplicar lazy loading a iframes
        this.configurarLazyLoadingIframes();
        
        // Lazy loading para contenido dinámico
        this.configurarLazyLoadingContenido();
    }

    configurarLazyLoadingImagenes() {
        document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
            if (!img.hasAttribute('data-lazy-loaded')) {
                img.setAttribute('data-lazy-loaded', 'false');
                
                // Placeholder mientras carga
                if (!img.src && !img.hasAttribute('data-src')) {
                    img.src = this.generarPlaceholderSVG(img.width || 300, img.height || 200);
                }
                
                this.observadorInterseccion.observe(img);
            }
        });

        // Configurar lazy loading para imágenes futuras
        this.observarNuevasImagenes();
    }

    generarPlaceholderSVG(width, height) {
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
                    Cargando...
                </text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    observarNuevasImagenes() {
        const observadorDOM = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const imagenes = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        imagenes.forEach(img => {
                            if (!img.hasAttribute('data-lazy-loaded')) {
                                this.observadorInterseccion.observe(img);
                            }
                        });
                    }
                });
            });
        });

        observadorDOM.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    configurarLazyLoadingIframes() {
        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            this.observadorInterseccion.observe(iframe);
        });
    }

    configurarLazyLoadingContenido() {
        // Lazy loading para secciones de contenido
        document.querySelectorAll('[data-lazy-content]').forEach(seccion => {
            this.observadorInterseccion.observe(seccion);
        });
    }

    async cargarElementoLazy(elemento) {
        try {
            if (elemento.tagName === 'IMG') {
                await this.cargarImagenLazy(elemento);
            } else if (elemento.tagName === 'IFRAME') {
                this.cargarIframeLazy(elemento);
            } else if (elemento.hasAttribute('data-lazy-content')) {
                await this.cargarContenidoLazy(elemento);
            }
        } catch (error) {
            console.error('Error en lazy loading:', error);
        }
    }

    async cargarImagenLazy(img) {
        const src = img.getAttribute('data-src') || img.getAttribute('src');
        if (!src) return;

        // Mostrar indicador de carga
        img.style.opacity = '0.5';
        
        return new Promise((resolve, reject) => {
            const imagenTemp = new Image();
            
            imagenTemp.onload = () => {
                // Optimizar imagen si es necesario
                if (this.configuracion.compresionImagenes) {
                    this.optimizarImagen(imagenTemp, img);
                } else {
                    img.src = src;
                }
                
                img.style.opacity = '1';
                img.style.transition = 'opacity 0.3s ease';
                img.setAttribute('data-lazy-loaded', 'true');
                resolve();
            };
            
            imagenTemp.onerror = () => {
                img.src = this.generarPlaceholderError();
                img.setAttribute('data-lazy-loaded', 'error');
                reject(new Error('Error cargando imagen'));
            };
            
            imagenTemp.src = src;
        });
    }

    cargarIframeLazy(iframe) {
        const src = iframe.getAttribute('data-src');
        if (src) {
            iframe.src = src;
            iframe.removeAttribute('data-src');
        }
    }

    async cargarContenidoLazy(elemento) {
        const url = elemento.getAttribute('data-lazy-content');
        if (url) {
            try {
                const contenido = await this.obtenerContenidoCache(url);
                elemento.innerHTML = contenido;
                elemento.removeAttribute('data-lazy-content');
            } catch (error) {
                elemento.innerHTML = '<p>Error cargando contenido</p>';
            }
        }
    }

    generarPlaceholderError() {
        const svg = `
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#ffebee"/>
                <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#c62828" text-anchor="middle" dy=".3em">
                    Error cargando imagen
                </text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    configurarCacheInteligente() {
        // Cache en memoria para consultas frecuentes
        this.configurarCacheMemoria();
        
        // Cache en localStorage para datos persistentes
        this.configurarCachePersistente();
        
        // Cache para respuestas de API
        this.configurarCacheAPI();
        
        // Limpieza automática de cache
        this.configurarLimpiezaCache();
    }

    configurarCacheMemoria() {
        // Interceptar consultas DOM frecuentes
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;
        
        document.querySelector = (selector) => {
            const cacheKey = `qs_${selector}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const resultado = originalQuerySelector.call(document, selector);
            if (resultado) {
                this.cache.set(cacheKey, resultado);
                this.programarLimpiezaCache(cacheKey);
            }
            return resultado;
        };

        document.querySelectorAll = (selector) => {
            const cacheKey = `qsa_${selector}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const resultado = originalQuerySelectorAll.call(document, selector);
            this.cache.set(cacheKey, resultado);
            this.programarLimpiezaCache(cacheKey);
            return resultado;
        };
    }

    configurarCachePersistente() {
        // Cache inteligente para localStorage con TTL
        this.cacheInteligente = {
            set: (key, value, ttl = this.configuracion.timeoutCache) => {
                const item = {
                    value,
                    expiry: Date.now() + ttl,
                    size: JSON.stringify(value).length
                };
                localStorage.setItem(`cache_${key}`, JSON.stringify(item));
            },

            get: (key) => {
                const item = localStorage.getItem(`cache_${key}`);
                if (!item) return null;

                const data = JSON.parse(item);
                if (Date.now() > data.expiry) {
                    localStorage.removeItem(`cache_${key}`);
                    return null;
                }
                return data.value;
            },

            clear: () => {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('cache_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        };

        // Exponer globalmente
        window.cacheInteligente = this.cacheInteligente;
    }

    configurarCacheAPI() {
        // Interceptar fetch para cache automático
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            const method = options.method || 'GET';
            
            if (method === 'GET') {
                const cacheKey = `api_${url}`;
                const cached = this.cacheInteligente.get(cacheKey);
                
                if (cached) {
                    return new Response(JSON.stringify(cached), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            
            const response = await originalFetch(url, options);
            
            if (response.ok && method === 'GET') {
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();
                this.cacheInteligente.set(`api_${url}`, data);
            }
            
            return response;
        };
    }

    programarLimpiezaCache(key) {
        setTimeout(() => {
            this.cache.delete(key);
        }, this.configuracion.timeoutCache);
    }

    configurarLimpiezaCache() {
        // Limpieza automática cada 5 minutos
        setInterval(() => {
            this.limpiarCacheMemoria();
            this.limpiarCachePersistente();
        }, 300000);

        // Limpieza en visibilitychange
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.limpiarCacheMemoria();
            }
        });
    }

    limpiarCacheMemoria() {
        const limite = this.configuracion.maxTamañoCache * 1024 * 1024; // MB a bytes
        let tamañoActual = 0;
        
        // Calcular tamaño actual
        this.cache.forEach((value, key) => {
            tamañoActual += JSON.stringify(value).length;
        });

        if (tamañoActual > limite) {
            // Limpiar elementos más antiguos (LRU)
            const entries = Array.from(this.cache.entries());
            const aEliminar = Math.floor(entries.length * 0.3); // Eliminar 30%
            
            for (let i = 0; i < aEliminar; i++) {
                this.cache.delete(entries[i][0]);
            }
        }
    }

    limpiarCachePersistente() {
        const ahora = Date.now();
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (ahora > item.expiry) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    async optimizarImagenes() {
        // Optimizar imágenes existentes
        document.querySelectorAll('img').forEach(img => {
            if (!this.imagenesOptimizadas.has(img.src)) {
                this.optimizarImagenExistente(img);
            }
        });

        // Interceptar nuevas imágenes
        this.interceptarNuevasImagenes();
    }

    async optimizarImagenExistente(img) {
        if (img.complete && img.naturalWidth > 0) {
            this.procesarOptimizacionImagen(img);
        } else {
            img.addEventListener('load', () => {
                this.procesarOptimizacionImagen(img);
            });
        }
    }

    procesarOptimizacionImagen(img) {
        // Solo optimizar si la imagen es grande
        if (img.naturalWidth > this.configuracion.resolucionMaxima) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calcular nuevas dimensiones
            const ratio = Math.min(
                this.configuracion.resolucionMaxima / img.naturalWidth,
                this.configuracion.resolucionMaxima / img.naturalHeight
            );
            
            canvas.width = img.naturalWidth * ratio;
            canvas.height = img.naturalHeight * ratio;
            
            // Redimensionar y comprimir
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const imagenOptimizada = canvas.toDataURL('image/jpeg', this.configuracion.compresiónNivel);
            
            // Solo reemplazar si es más pequeña
            if (imagenOptimizada.length < img.src.length) {
                img.src = imagenOptimizada;
                this.imagenesOptimizadas.add(img.src);
            }
        }
    }

    optimizarImagen(imagenOriginal, imgElemento) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Determinar dimensiones óptimas
        const maxWidth = imgElemento.clientWidth || this.configuracion.resolucionMaxima;
        const maxHeight = imgElemento.clientHeight || this.configuracion.resolucionMaxima;
        
        let { width, height } = imagenOriginal;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Aplicar filtros de optimización
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(imagenOriginal, 0, 0, width, height);
        
        // Comprimir y asignar
        const imagenOptimizada = canvas.toDataURL('image/jpeg', this.configuracion.compresiónNivel);
        imgElemento.src = imagenOptimizada;
        
        this.imagenesOptimizadas.add(imgElemento.src);
    }

    interceptarNuevasImagenes() {
        const observadorImagenes = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const imagenes = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        imagenes.forEach(img => this.optimizarImagenExistente(img));
                    }
                });
            });
        });

        observadorImagenes.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    optimizarConsultas() {
        // Optimizar consultas localStorage
        this.optimizarLocalStorage();
        
        // Batch queries para DOM
        this.configurarBatchQueries();
        
        // Debounce para consultas frecuentes
        this.configurarDebounceConsultas();
    }

    optimizarLocalStorage() {
        const originalGetItem = localStorage.getItem;
        const originalSetItem = localStorage.setItem;
        
        // Cache para lecturas frecuentes
        const cacheLS = new Map();
        
        localStorage.getItem = (key) => {
            if (cacheLS.has(key)) {
                return cacheLS.get(key);
            }
            
            const value = originalGetItem.call(localStorage, key);
            cacheLS.set(key, value);
            
            // Limpiar cache después de un tiempo
            setTimeout(() => cacheLS.delete(key), 30000);
            
            return value;
        };

        // Batch writes para localStorage
        let writeQueue = new Map();
        let writeTimeout = null;
        
        localStorage.setItem = (key, value) => {
            writeQueue.set(key, value);
            cacheLS.set(key, value);
            
            if (writeTimeout) {
                clearTimeout(writeTimeout);
            }
            
            writeTimeout = setTimeout(() => {
                writeQueue.forEach((val, k) => {
                    originalSetItem.call(localStorage, k, val);
                });
                writeQueue.clear();
                writeTimeout = null;
            }, 100);
        };
    }

    configurarBatchQueries() {
        // Agrupar consultas DOM similares
        let queryQueue = [];
        let queryTimeout = null;
        
        window.batchQuery = (selector, callback) => {
            queryQueue.push({ selector, callback });
            
            if (queryTimeout) {
                clearTimeout(queryTimeout);
            }
            
            queryTimeout = setTimeout(() => {
                this.procesarBatchQueries(queryQueue);
                queryQueue = [];
                queryTimeout = null;
            }, 16); // ~1 frame
        };
    }

    procesarBatchQueries(queries) {
        const resultados = new Map();
        
        // Ejecutar todas las consultas
        queries.forEach(({ selector }) => {
            if (!resultados.has(selector)) {
                resultados.set(selector, document.querySelectorAll(selector));
            }
        });
        
        // Ejecutar callbacks
        queries.forEach(({ selector, callback }) => {
            callback(resultados.get(selector));
        });
    }

    configurarDebounceConsultas() {
        // Debounce para funciones de consulta costosas
        window.debounceQuery = this.debounce((fn, ...args) => {
            return fn(...args);
        }, 100);
    }

    precargarRecursosCriticos() {
        // Precargar CSS crítico
        this.precargarCSS();
        
        // Precargar JavaScript importante
        this.precargarJS();
        
        // Precargar imágenes críticas
        this.precargarImagenesCriticas();
        
        // Precarga por predicción
        this.configurarPrecargaPredicativa();
    }

    precargarCSS() {
        const cssFiles = [
            'css/style.css',
            'css/responsive.css'
        ];

        cssFiles.forEach(file => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = file;
            link.onload = () => {
                link.rel = 'stylesheet';
            };
            document.head.appendChild(link);
        });
    }

    precargarJS() {
        const jsFiles = [
            'js/productos.js',
            'js/inventario.js',
            'js/compra.js'
        ];

        jsFiles.forEach(file => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = file;
            document.head.appendChild(link);
        });
    }

    precargarImagenesCriticas() {
        const imagenesCriticas = [
            'Images/cafe cesde logo.jpg',
            'Images/banner.webp'
        ];

        imagenesCriticas.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    configurarPrecargaPredicativa() {
        // Precargar recursos basado en comportamiento del usuario
        let mouseOverLinks = new Map();
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'A' && e.target.href) {
                const href = e.target.href;
                
                if (!mouseOverLinks.has(href)) {
                    mouseOverLinks.set(href, Date.now());
                    
                    // Precargar después de 100ms de hover
                    setTimeout(() => {
                        this.precargarPagina(href);
                    }, 100);
                }
            }
        });
    }

    precargarPagina(url) {
        // Crear link de precarga
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        
        // Remover después de un tiempo
        setTimeout(() => {
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        }, 30000);
    }

    minimizarReflows() {
        // Agrupar cambios DOM
        this.configurarBatchDOM();
        
        // Optimizar animaciones
        this.optimizarAnimaciones();
        
        // Minimizar acceso a propiedades que causan reflow
        this.optimizarAccesoPropiedades();
    }

    configurarBatchDOM() {
        let domQueue = [];
        let domTimeout = null;
        
        window.batchDOM = (fn) => {
            domQueue.push(fn);
            
            if (domTimeout) {
                cancelAnimationFrame(domTimeout);
            }
            
            domTimeout = requestAnimationFrame(() => {
                // Ejecutar todos los cambios DOM juntos
                domQueue.forEach(fn => fn());
                domQueue = [];
                domTimeout = null;
            });
        };
    }

    optimizarAnimaciones() {
        // Usar transform y opacity en lugar de propiedades que causan reflow
        const estilo = document.createElement('style');
        estilo.textContent = `
            .optimized-animation {
                will-change: transform, opacity;
                transform: translateZ(0); /* Forzar aceleración por hardware */
            }
            
            .smooth-transition {
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
        `;
        document.head.appendChild(estilo);

        // Añadir clases automáticamente a elementos animados
        document.querySelectorAll('[style*="transition"], .animated').forEach(elemento => {
            elemento.classList.add('optimized-animation');
        });
    }

    optimizarAccesoPropiedades() {
        // Cache para propiedades computadas costosas
        const propiedadesCache = new Map();
        
        // Función para obtener propiedades de manera optimizada
        window.getOptimizedStyle = (elemento, propiedad) => {
            const key = `${elemento.tagName}_${elemento.className}_${propiedad}`;
            
            if (propiedadesCache.has(key)) {
                return propiedadesCache.get(key);
            }
            
            const valor = window.getComputedStyle(elemento)[propiedad];
            propiedadesCache.set(key, valor);
            
            // Limpiar cache después de un tiempo
            setTimeout(() => propiedadesCache.delete(key), 5000);
            
            return valor;
        };
    }

    configurarDebounceInputs() {
        document.querySelectorAll('input, textarea, select').forEach(input => {
            const originalHandler = input.oninput;
            
            input.oninput = this.debounce((e) => {
                if (originalHandler) {
                    originalHandler.call(input, e);
                }
            }, this.configuracion.debounceInputs);
        });

        // Observar nuevos inputs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const inputs = node.matches('input, textarea, select') ? [node] : 
                                     node.querySelectorAll('input, textarea, select');
                        
                        inputs.forEach(input => {
                            if (!input.hasAttribute('data-debounced')) {
                                input.setAttribute('data-debounced', 'true');
                                const originalHandler = input.oninput;
                                
                                input.oninput = this.debounce((e) => {
                                    if (originalHandler) {
                                        originalHandler.call(input, e);
                                    }
                                }, this.configuracion.debounceInputs);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    iniciarTrabajadorCache() {
        if ('Worker' in window) {
            const workerScript = `
                let cache = new Map();
                
                self.onmessage = function(e) {
                    const { action, key, value, ttl } = e.data;
                    
                    switch(action) {
                        case 'set':
                            cache.set(key, {
                                value,
                                expiry: Date.now() + (ttl || 300000)
                            });
                            self.postMessage({ success: true });
                            break;
                            
                        case 'get':
                            const item = cache.get(key);
                            if (item && Date.now() < item.expiry) {
                                self.postMessage({ value: item.value });
                            } else {
                                cache.delete(key);
                                self.postMessage({ value: null });
                            }
                            break;
                            
                        case 'clear':
                            cache.clear();
                            self.postMessage({ success: true });
                            break;
                    }
                };
                
                // Limpieza automática cada minuto
                setInterval(() => {
                    const now = Date.now();
                    for (let [key, item] of cache.entries()) {
                        if (now > item.expiry) {
                            cache.delete(key);
                        }
                    }
                }, 60000);
            `;

            const blob = new Blob([workerScript], { type: 'application/javascript' });
            this.trabajadorCache = new Worker(URL.createObjectURL(blob));
            
            // API para usar el worker
            window.cacheWorker = {
                set: (key, value, ttl) => {
                    this.trabajadorCache.postMessage({ action: 'set', key, value, ttl });
                },
                
                get: (key) => {
                    return new Promise((resolve) => {
                        this.trabajadorCache.postMessage({ action: 'get', key });
                        this.trabajadorCache.onmessage = (e) => {
                            resolve(e.data.value);
                        };
                    });
                },
                
                clear: () => {
                    this.trabajadorCache.postMessage({ action: 'clear' });
                }
            };
        }
    }

    async configurarServiceWorkerCache() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw-cache.js');
                console.log('Service Worker de cache registrado:', registration);
            } catch (error) {
                console.log('Error registrando Service Worker de cache:', error);
            }
        }
    }

    iniciarMonitoreoRendimiento() {
        // Monitorear métricas de rendimiento
        this.monitorearMetricas();
        
        // Reportar problemas de rendimiento
        this.configurarReporteRendimiento();
        
        // Dashboard de rendimiento
        this.crearDashboardRendimiento();
    }

    monitorearMetricas() {
        if ('PerformanceObserver' in window) {
            // Observar Long Tasks
            const longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn('Long Task detectada:', entry.duration + 'ms');
                        this.registrarProblemaRendimiento('long-task', entry.duration);
                    }
                });
            });

            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long Tasks no soportado
            }

            // Observar Layout Shifts
            const layoutShiftObserver = new PerformanceObserver((list) => {
                let cls = 0;
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                
                if (cls > 0.1) {
                    console.warn('Layout Shift detectado:', cls);
                    this.registrarProblemaRendimiento('layout-shift', cls);
                }
            });

            try {
                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // Layout Shifts no soportado
            }
        }

        // Monitorear memoria cada 30 segundos
        setInterval(() => {
            if (performance.memory) {
                const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
                const porcentajeUso = (usedJSHeapSize / jsHeapSizeLimit) * 100;
                
                if (porcentajeUso > 80) {
                    console.warn('Alto uso de memoria:', porcentajeUso.toFixed(2) + '%');
                    this.registrarProblemaRendimiento('high-memory', porcentajeUso);
                }
            }
        }, 30000);
    }

    registrarProblemaRendimiento(tipo, valor) {
        const problemas = JSON.parse(localStorage.getItem('problemasRendimiento')) || [];
        problemas.push({
            tipo,
            valor,
            timestamp: Date.now(),
            url: window.location.href
        });
        
        // Mantener solo los últimos 100 problemas
        if (problemas.length > 100) {
            problemas.splice(0, problemas.length - 100);
        }
        
        localStorage.setItem('problemasRendimiento', JSON.stringify(problemas));
    }

    configurarReporteRendimiento() {
        // Reporte automático cuando la página se va a descargar
        window.addEventListener('beforeunload', () => {
            this.generarReporteRendimiento();
        });
    }

    generarReporteRendimiento() {
        if ('performance' in window) {
            const reporte = {
                timestamp: Date.now(),
                url: window.location.href,
                navigation: performance.getEntriesByType('navigation')[0],
                recursos: performance.getEntriesByType('resource').map(r => ({
                    name: r.name,
                    duration: r.duration,
                    size: r.transferSize
                })),
                memoria: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize
                } : null,
                problemas: JSON.parse(localStorage.getItem('problemasRendimiento')) || [],
                configuracion: this.configuracion
            };

            console.log('📊 Reporte de rendimiento:', reporte);
            localStorage.setItem('reporteRendimiento', JSON.stringify(reporte));
            
            return reporte;
        }
    }

    crearDashboardRendimiento() {
        // Solo crear si no existe
        if (document.getElementById('dashboard-rendimiento')) return;

        const dashboard = document.createElement('div');
        dashboard.id = 'dashboard-rendimiento';
        dashboard.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            gap: 15px;
            align-items: center;
        `;

        this.actualizarDashboard(dashboard);

        // Toggle con Ctrl+Alt+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'p') {
                dashboard.style.display = dashboard.style.display === 'none' ? 'flex' : 'none';
            }
        });

        document.body.appendChild(dashboard);

        // Actualizar cada segundo
        setInterval(() => {
            if (dashboard.style.display === 'flex') {
                this.actualizarDashboard(dashboard);
            }
        }, 1000);
    }

    actualizarDashboard(dashboard) {
        const memoria = performance.memory ? 
            `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 'N/A';
        
        const fps = this.calcularFPS();
        const cache = this.cache.size;
        
        dashboard.innerHTML = `
            <span>🧠 Memoria: ${memoria}</span>
            <span>⚡ FPS: ${fps}</span>
            <span>💾 Cache: ${cache} items</span>
            <span style="font-size: 10px; opacity: 0.7;">Ctrl+Alt+P para ocultar</span>
        `;
    }

    calcularFPS() {
        if (!this.fpsData) {
            this.fpsData = { frames: 0, lastTime: performance.now() };
        }
        
        this.fpsData.frames++;
        const now = performance.now();
        const delta = now - this.fpsData.lastTime;
        
        if (delta >= 1000) {
            const fps = Math.round((this.fpsData.frames * 1000) / delta);
            this.fpsData.frames = 0;
            this.fpsData.lastTime = now;
            this.fpsData.currentFPS = fps;
        }
        
        return this.fpsData.currentFPS || 60;
    }

    // Utilidades
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    async obtenerContenidoCache(url) {
        const cached = this.cacheInteligente.get(url);
        if (cached) return cached;

        const response = await fetch(url);
        const contenido = await response.text();
        
        this.cacheInteligente.set(url, contenido);
        return contenido;
    }

    // Métodos públicos para configuración
    actualizarConfiguracion(nuevaConfig) {
        this.configuracion = { ...this.configuracion, ...nuevaConfig };
        localStorage.setItem('configRendimiento', JSON.stringify(this.configuracion));
        
        // Reaplicar configuraciones
        this.aplicarConfiguraciones();
    }

    aplicarConfiguraciones() {
        // Reconfigurar lazy loading
        if (this.configuracion.lazyLoading) {
            this.configurarLazyLoading();
        }
        
        // Actualizar configuración de cache
        if (this.configuracion.cacheInteligente) {
            this.configurarCacheInteligente();
        }
    }

    obtenerEstadisticas() {
        return {
            cache: {
                memoria: this.cache.size,
                localStorage: Object.keys(localStorage).filter(k => k.startsWith('cache_')).length
            },
            imagenes: {
                optimizadas: this.imagenesOptimizadas.size,
                total: document.querySelectorAll('img').length
            },
            rendimiento: performance.memory ? {
                memoriaUsada: performance.memory.usedJSHeapSize,
                memoriaTotal: performance.memory.totalJSHeapSize
            } : null,
            problemas: JSON.parse(localStorage.getItem('problemasRendimiento')) || []
        };
    }

    limpiarTodo() {
        // Limpiar caches
        this.cache.clear();
        this.cacheInteligente.clear();
        
        // Limpiar workers
        if (this.trabajadorCache) {
            window.cacheWorker.clear();
        }
        
        // Limpiar observadores
        if (this.observadorInterseccion) {
            this.observadorInterseccion.disconnect();
        }
        
        console.log('🧹 Optimizaciones limpiadas');
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.optimizacionRendimiento = new OptimizacionRendimiento();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizacionRendimiento;
}