class SistemaMultiidioma {
    constructor() {
        this.idiomaActual = localStorage.getItem('idioma') || 'es';
        this.traducciones = {};
        this.elementosTraducidos = new Map();
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
        await this.cargarTraducciones();
        this.crearSelectorIdioma();
        this.detectarIdiomaNavegador();
        this.configurarEventos();
        this.aplicarTraduccion(this.idiomaActual);
        this.configurarObservadorMutaciones();
    }

    async cargarTraducciones() {
        // Definir todas las traducciones del sistema
        this.traducciones = {
            es: {
                // Navegación
                'nav.inicio': 'Inicio',
                'nav.productos': 'Productos',
                'nav.compras': 'Compras',
                'nav.inventario': 'Inventario',
                'nav.clientes': 'Clientes',
                'nav.empleados': 'Empleados',
                'nav.proveedores': 'Proveedores',
                'nav.calidad': 'Calidad',
                'nav.backup': 'Backup',
                'nav.notificaciones': 'Notificaciones',
                'nav.reportes': 'Reportes',
                'nav.facturacion': 'Facturación',
                'nav.soporte': 'Soporte',

                // Títulos principales
                'titulo.cafeteria': 'Cafetería Cesde',
                'titulo.bienvenido': 'Bienvenido',
                'titulo.sistema': 'Sistema de Gestión',
                'subtitulo.eslogan': 'Donde el conocimiento se mezcla con buen café',

                // Botones comunes
                'btn.guardar': 'Guardar',
                'btn.cancelar': 'Cancelar',
                'btn.eliminar': 'Eliminar',
                'btn.editar': 'Editar',
                'btn.agregar': 'Agregar',
                'btn.buscar': 'Buscar',
                'btn.limpiar': 'Limpiar',
                'btn.exportar': 'Exportar',
                'btn.importar': 'Importar',
                'btn.actualizar': 'Actualizar',
                'btn.configurar': 'Configurar',
                'btn.crear': 'Crear',
                'btn.enviar': 'Enviar',

                // Formularios
                'form.nombre': 'Nombre',
                'form.apellido': 'Apellido',
                'form.email': 'Correo Electrónico',
                'form.telefono': 'Teléfono',
                'form.direccion': 'Dirección',
                'form.fecha': 'Fecha',
                'form.precio': 'Precio',
                'form.cantidad': 'Cantidad',
                'form.descripcion': 'Descripción',
                'form.categoria': 'Categoría',
                'form.estado': 'Estado',
                'form.comentarios': 'Comentarios',

                // Productos
                'producto.cafe': 'Café',
                'producto.bebidas': 'Bebidas',
                'producto.comida': 'Comida',
                'producto.postres': 'Postres',
                'producto.stock': 'Stock',
                'producto.disponible': 'Disponible',
                'producto.agotado': 'Agotado',

                // Estados
                'estado.activo': 'Activo',
                'estado.inactivo': 'Inactivo',
                'estado.pendiente': 'Pendiente',
                'estado.completado': 'Completado',
                'estado.cancelado': 'Cancelado',
                'estado.proceso': 'En Proceso',

                // Mensajes
                'msg.guardado': 'Guardado exitosamente',
                'msg.error': 'Ha ocurrido un error',
                'msg.confirmacion': '¿Está seguro?',
                'msg.eliminado': 'Eliminado exitosamente',
                'msg.actualizado': 'Actualizado exitosamente',
                'msg.creado': 'Creado exitosamente',
                'msg.sin_datos': 'No hay datos disponibles',
                'msg.cargando': 'Cargando...',

                // Días y fechas
                'dia.lunes': 'Lunes',
                'dia.martes': 'Martes',
                'dia.miercoles': 'Miércoles',
                'dia.jueves': 'Jueves',
                'dia.viernes': 'Viernes',
                'dia.sabado': 'Sábado',
                'dia.domingo': 'Domingo',

                'mes.enero': 'Enero',
                'mes.febrero': 'Febrero',
                'mes.marzo': 'Marzo',
                'mes.abril': 'Abril',
                'mes.mayo': 'Mayo',
                'mes.junio': 'Junio',
                'mes.julio': 'Julio',
                'mes.agosto': 'Agosto',
                'mes.septiembre': 'Septiembre',
                'mes.octubre': 'Octubre',
                'mes.noviembre': 'Noviembre',
                'mes.diciembre': 'Diciembre'
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
                'nav.calidad': 'Quality',
                'nav.backup': 'Backup',
                'nav.notificaciones': 'Notifications',
                'nav.reportes': 'Reports',
                'nav.facturacion': 'Billing',
                'nav.soporte': 'Support',

                // Main titles
                'titulo.cafeteria': 'Cesde Cafeteria',
                'titulo.bienvenido': 'Welcome',
                'titulo.sistema': 'Management System',
                'subtitulo.eslogan': 'Where knowledge mixes with good coffee',

                // Common buttons
                'btn.guardar': 'Save',
                'btn.cancelar': 'Cancel',
                'btn.eliminar': 'Delete',
                'btn.editar': 'Edit',
                'btn.agregar': 'Add',
                'btn.buscar': 'Search',
                'btn.limpiar': 'Clear',
                'btn.exportar': 'Export',
                'btn.importar': 'Import',
                'btn.actualizar': 'Update',
                'btn.configurar': 'Configure',
                'btn.crear': 'Create',
                'btn.enviar': 'Send',

                // Forms
                'form.nombre': 'Name',
                'form.apellido': 'Last Name',
                'form.email': 'Email',
                'form.telefono': 'Phone',
                'form.direccion': 'Address',
                'form.fecha': 'Date',
                'form.precio': 'Price',
                'form.cantidad': 'Quantity',
                'form.descripcion': 'Description',
                'form.categoria': 'Category',
                'form.estado': 'Status',
                'form.comentarios': 'Comments',

                // Products
                'producto.cafe': 'Coffee',
                'producto.bebidas': 'Beverages',
                'producto.comida': 'Food',
                'producto.postres': 'Desserts',
                'producto.stock': 'Stock',
                'producto.disponible': 'Available',
                'producto.agotado': 'Out of Stock',

                // Status
                'estado.activo': 'Active',
                'estado.inactivo': 'Inactive',
                'estado.pendiente': 'Pending',
                'estado.completado': 'Completed',
                'estado.cancelado': 'Cancelled',
                'estado.proceso': 'In Process',

                // Messages
                'msg.guardado': 'Saved successfully',
                'msg.error': 'An error occurred',
                'msg.confirmacion': 'Are you sure?',
                'msg.eliminado': 'Deleted successfully',
                'msg.actualizado': 'Updated successfully',
                'msg.creado': 'Created successfully',
                'msg.sin_datos': 'No data available',
                'msg.cargando': 'Loading...',

                // Days and dates
                'dia.lunes': 'Monday',
                'dia.martes': 'Tuesday',
                'dia.miercoles': 'Wednesday',
                'dia.jueves': 'Thursday',
                'dia.viernes': 'Friday',
                'dia.sabado': 'Saturday',
                'dia.domingo': 'Sunday',

                'mes.enero': 'January',
                'mes.febrero': 'February',
                'mes.marzo': 'March',
                'mes.abril': 'April',
                'mes.mayo': 'May',
                'mes.junio': 'June',
                'mes.julio': 'July',
                'mes.agosto': 'August',
                'mes.septiembre': 'September',
                'mes.octubre': 'October',
                'mes.noviembre': 'November',
                'mes.diciembre': 'December'
            },

            pt: {
                // Navegação
                'nav.inicio': 'Início',
                'nav.productos': 'Produtos',
                'nav.compras': 'Compras',
                'nav.inventario': 'Estoque',
                'nav.clientes': 'Clientes',
                'nav.empleados': 'Funcionários',
                'nav.proveedores': 'Fornecedores',
                'nav.calidad': 'Qualidade',
                'nav.backup': 'Backup',
                'nav.notificaciones': 'Notificações',
                'nav.reportes': 'Relatórios',
                'nav.facturacion': 'Faturamento',
                'nav.soporte': 'Suporte',

                // Títulos principais
                'titulo.cafeteria': 'Cafeteria Cesde',
                'titulo.bienvenido': 'Bem-vindo',
                'titulo.sistema': 'Sistema de Gestão',
                'subtitulo.eslogan': 'Onde o conhecimento se mistura com bom café',

                // Botões comuns
                'btn.guardar': 'Salvar',
                'btn.cancelar': 'Cancelar',
                'btn.eliminar': 'Excluir',
                'btn.editar': 'Editar',
                'btn.agregar': 'Adicionar',
                'btn.buscar': 'Buscar',
                'btn.limpiar': 'Limpar',
                'btn.exportar': 'Exportar',
                'btn.importar': 'Importar',
                'btn.actualizar': 'Atualizar',
                'btn.configurar': 'Configurar',
                'btn.crear': 'Criar',
                'btn.enviar': 'Enviar',

                // Formulários
                'form.nombre': 'Nome',
                'form.apellido': 'Sobrenome',
                'form.email': 'E-mail',
                'form.telefono': 'Telefone',
                'form.direccion': 'Endereço',
                'form.fecha': 'Data',
                'form.precio': 'Preço',
                'form.cantidad': 'Quantidade',
                'form.descripcion': 'Descrição',
                'form.categoria': 'Categoria',
                'form.estado': 'Status',
                'form.comentarios': 'Comentários',

                // Produtos
                'producto.cafe': 'Café',
                'producto.bebidas': 'Bebidas',
                'producto.comida': 'Comida',
                'producto.postres': 'Sobremesas',
                'producto.stock': 'Estoque',
                'producto.disponible': 'Disponível',
                'producto.agotado': 'Esgotado',

                // Estados
                'estado.activo': 'Ativo',
                'estado.inactivo': 'Inativo',
                'estado.pendiente': 'Pendente',
                'estado.completado': 'Concluído',
                'estado.cancelado': 'Cancelado',
                'estado.proceso': 'Em Processo',

                // Mensagens
                'msg.guardado': 'Salvo com sucesso',
                'msg.error': 'Ocorreu um erro',
                'msg.confirmacion': 'Tem certeza?',
                'msg.eliminado': 'Excluído com sucesso',
                'msg.actualizado': 'Atualizado com sucesso',
                'msg.creado': 'Criado com sucesso',
                'msg.sin_datos': 'Nenhum dado disponível',
                'msg.cargando': 'Carregando...',

                // Dias e datas
                'dia.lunes': 'Segunda-feira',
                'dia.martes': 'Terça-feira',
                'dia.miercoles': 'Quarta-feira',
                'dia.jueves': 'Quinta-feira',
                'dia.viernes': 'Sexta-feira',
                'dia.sabado': 'Sábado',
                'dia.domingo': 'Domingo',

                'mes.enero': 'Janeiro',
                'mes.febrero': 'Fevereiro',
                'mes.marzo': 'Março',
                'mes.abril': 'Abril',
                'mes.mayo': 'Maio',
                'mes.junio': 'Junho',
                'mes.julio': 'Julho',
                'mes.agosto': 'Agosto',
                'mes.septiembre': 'Setembro',
                'mes.octubre': 'Outubro',
                'mes.noviembre': 'Novembro',
                'mes.diciembre': 'Dezembro'
            }
        };
    }

    crearSelectorIdioma() {
        // Crear el selector de idioma si no existe
        if (document.getElementById('selector-idioma')) return;

        const selector = document.createElement('div');
        selector.id = 'selector-idioma';
        selector.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: white;
            border: 2px solid #8B4513;
            border-radius: 25px;
            padding: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            gap: 5px;
            align-items: center;
        `;

        const idiomas = [
            { codigo: 'es', nombre: 'Español', bandera: '🇪🇸' },
            { codigo: 'en', nombre: 'English', bandera: '🇺🇸' },
            { codigo: 'pt', nombre: 'Português', bandera: '🇧🇷' }
        ];

        idiomas.forEach(idioma => {
            const boton = document.createElement('button');
            boton.style.cssText = `
                border: none;
                background: ${this.idiomaActual === idioma.codigo ? '#8B4513' : 'transparent'};
                color: ${this.idiomaActual === idioma.codigo ? 'white' : '#8B4513'};
                padding: 8px 12px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.9em;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            `;

            if (this.configuracion.mostrarBanderas) {
                boton.innerHTML = `${idioma.bandera} ${idioma.codigo.toUpperCase()}`;
            } else {
                boton.textContent = idioma.nombre;
            }

            boton.addEventListener('click', () => {
                this.cambiarIdioma(idioma.codigo);
            });

            boton.addEventListener('mouseenter', () => {
                if (this.idiomaActual !== idioma.codigo) {
                    boton.style.background = '#f0f0f0';
                }
            });

            boton.addEventListener('mouseleave', () => {
                if (this.idiomaActual !== idioma.codigo) {
                    boton.style.background = 'transparent';
                }
            });

            selector.appendChild(boton);
        });

        document.body.appendChild(selector);
    }

    detectarIdiomaNavegador() {
        if (!this.configuracion.deteccionAutomatica) return;
        
        const idiomaNavegador = navigator.language.substring(0, 2);
        
        if (this.traducciones[idiomaNavegador] && !localStorage.getItem('idioma')) {
            this.idiomaActual = idiomaNavegador;
            this.guardarIdioma();
        }
    }

    configurarEventos() {
        // Escuchar cambios de idioma desde otros módulos
        window.addEventListener('cambioIdioma', (e) => {
            this.aplicarTraduccion(e.detail.idioma);
        });

        // Detectar nuevos elementos añadidos al DOM
        this.observadorDOM = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.traducirElemento(node);
                    }
                });
            });
        });
    }

    configurarObservadorMutaciones() {
        if (this.observadorDOM) {
            this.observadorDOM.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    cambiarIdioma(nuevoIdioma) {
        if (nuevoIdioma === this.idiomaActual) return;

        const idiomaAnterior = this.idiomaActual;
        this.idiomaActual = nuevoIdioma;
        
        if (this.configuracion.animacionCambio) {
            this.animarCambioIdioma(() => {
                this.aplicarTraduccion(nuevoIdioma);
                this.actualizarSelectorIdioma();
            });
        } else {
            this.aplicarTraduccion(nuevoIdioma);
            this.actualizarSelectorIdioma();
        }

        this.guardarIdioma();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('cambioIdioma', {
            detail: { idiomaAnterior, idiomaActual: nuevoIdioma }
        }));

        this.mostrarNotificacion(`Idioma cambiado a ${this.obtenerNombreIdioma(nuevoIdioma)}`);
    }

    animarCambioIdioma(callback) {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0.7';
        
        setTimeout(() => {
            callback();
            document.body.style.opacity = '1';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }, 150);
    }

    aplicarTraduccion(idioma) {
        const traducciones = this.traducciones[idioma];
        if (!traducciones) return;

        // Traducir elementos con atributo data-i18n
        document.querySelectorAll('[data-i18n]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n');
            const traduccion = this.obtenerTraduccion(clave, idioma);
            
            if (traduccion) {
                elemento.textContent = traduccion;
                this.elementosTraducidos.set(elemento, { clave, idioma });
            }
        });

        // Traducir placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n-placeholder');
            const traduccion = this.obtenerTraduccion(clave, idioma);
            
            if (traduccion) {
                elemento.placeholder = traduccion;
            }
        });

        // Traducir titles y tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n-title');
            const traduccion = this.obtenerTraduccion(clave, idioma);
            
            if (traduccion) {
                elemento.title = traduccion;
            }
        });

        // Traducir navegación automáticamente
        this.traducirNavegacion(idioma);
        
        // Traducir contenido común
        this.traducirContenidoComun(idioma);
    }

    traducirNavegacion(idioma) {
        const enlaces = {
            'Inicio': 'nav.inicio',
            'Home': 'nav.inicio',
            'Início': 'nav.inicio',
            'Productos': 'nav.productos',
            'Products': 'nav.productos',
            'Produtos': 'nav.productos',
            'Compras': 'nav.compras',
            'Purchases': 'nav.compras',
            'Inventario': 'nav.inventario',
            'Inventory': 'nav.inventario',
            'Estoque': 'nav.inventario',
            'Clientes': 'nav.clientes',
            'Customers': 'nav.clientes',
            'Empleados': 'nav.empleados',
            'Employees': 'nav.empleados',
            'Funcionários': 'nav.empleados'
        };

        document.querySelectorAll('nav a, .nav-link').forEach(enlace => {
            const texto = enlace.textContent.trim();
            const textoSinIcono = texto.replace(/^[^\w\s]+\s*/, ''); // Remover iconos
            
            Object.keys(enlaces).forEach(textoOriginal => {
                if (textoSinIcono.includes(textoOriginal)) {
                    const clave = enlaces[textoOriginal];
                    const traduccion = this.obtenerTraduccion(clave, idioma);
                    
                    if (traduccion) {
                        const icono = texto.match(/^[^\w\s]+\s*/)?.[0] || '';
                        enlace.textContent = icono + traduccion;
                    }
                }
            });
        });
    }

    traducirContenidoComun(idioma) {
        // Traducir botones comunes
        document.querySelectorAll('button, .btn').forEach(boton => {
            const texto = boton.textContent.trim().toLowerCase();
            
            const mapeoComun = {
                'guardar': 'btn.guardar',
                'save': 'btn.guardar',
                'salvar': 'btn.guardar',
                'eliminar': 'btn.eliminar',
                'delete': 'btn.eliminar',
                'excluir': 'btn.eliminar',
                'editar': 'btn.editar',
                'edit': 'btn.editar',
                'cancelar': 'btn.cancelar',
                'cancel': 'btn.cancelar'
            };

            Object.keys(mapeoComun).forEach(textoOriginal => {
                if (texto.includes(textoOriginal)) {
                    const clave = mapeoComun[textoOriginal];
                    const traduccion = this.obtenerTraduccion(clave, idioma);
                    
                    if (traduccion) {
                        // Preservar iconos
                        const icono = boton.textContent.match(/^[^\w\s]+\s*/)?.[0] || '';
                        boton.textContent = icono + traduccion;
                    }
                }
            });
        });

        // Traducir labels de formularios
        document.querySelectorAll('label').forEach(label => {
            const texto = label.textContent.trim().toLowerCase();
            
            const mapeoLabels = {
                'nombre': 'form.nombre',
                'name': 'form.nombre',
                'nome': 'form.nombre',
                'email': 'form.email',
                'correo': 'form.email',
                'teléfono': 'form.telefono',
                'telefone': 'form.telefono',
                'phone': 'form.telefono',
                'precio': 'form.precio',
                'price': 'form.precio',
                'preço': 'form.precio'
            };

            Object.keys(mapeoLabels).forEach(textoOriginal => {
                if (texto.includes(textoOriginal)) {
                    const clave = mapeoLabels[textoOriginal];
                    const traduccion = this.obtenerTraduccion(clave, idioma);
                    
                    if (traduccion) {
                        label.textContent = traduccion;
                    }
                }
            });
        });
    }

    traducirElemento(elemento) {
        // Traducir un elemento específico y sus hijos
        const elementosConTraduccion = elemento.querySelectorAll('[data-i18n]');
        elementosConTraduccion.forEach(el => {
            const clave = el.getAttribute('data-i18n');
            const traduccion = this.obtenerTraduccion(clave, this.idiomaActual);
            
            if (traduccion) {
                el.textContent = traduccion;
            }
        });
    }

    obtenerTraduccion(clave, idioma = this.idiomaActual) {
        const traducciones = this.traducciones[idioma];
        if (!traducciones) return null;

        return traducciones[clave] || null;
    }

    obtenerNombreIdioma(codigo) {
        const nombres = {
            'es': 'Español',
            'en': 'English',
            'pt': 'Português'
        };
        return nombres[codigo] || codigo;
    }

    actualizarSelectorIdioma() {
        const selector = document.getElementById('selector-idioma');
        if (!selector) return;

        selector.querySelectorAll('button').forEach((boton, index) => {
            const idiomas = ['es', 'en', 'pt'];
            const esActivo = idiomas[index] === this.idiomaActual;
            
            boton.style.background = esActivo ? '#8B4513' : 'transparent';
            boton.style.color = esActivo ? 'white' : '#8B4513';
        });
    }

    // Métodos para añadir/modificar traducciones dinámicamente
    agregarTraduccion(idioma, clave, valor) {
        if (!this.traducciones[idioma]) {
            this.traducciones[idioma] = {};
        }
        
        this.traducciones[idioma][clave] = valor;
        this.guardarTraducciones();
    }

    agregarTraducciones(idioma, traducciones) {
        if (!this.traducciones[idioma]) {
            this.traducciones[idioma] = {};
        }
        
        Object.assign(this.traducciones[idioma], traducciones);
        this.guardarTraducciones();
    }

    // Métodos de utilidad para otros módulos
    t(clave, idioma = this.idiomaActual, params = {}) {
        let traduccion = this.obtenerTraduccion(clave, idioma);
        
        if (!traduccion) {
            console.warn(`Traducción no encontrada: ${clave} para idioma ${idioma}`);
            return clave;
        }

        // Reemplazar parámetros
        Object.keys(params).forEach(param => {
            traduccion = traduccion.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });

        return traduccion;
    }

    formatearFecha(fecha, idioma = this.idiomaActual) {
        const opciones = {
            es: { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                locale: 'es-ES'
            },
            en: { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                locale: 'en-US'
            },
            pt: { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                locale: 'pt-BR'
            }
        };

        const config = opciones[idioma] || opciones['es'];
        return new Date(fecha).toLocaleDateString(config.locale, config);
    }

    formatearNumero(numero, idioma = this.idiomaActual) {
        const locales = {
            es: 'es-ES',
            en: 'en-US',
            pt: 'pt-BR'
        };

        return new Intl.NumberFormat(locales[idioma] || 'es-ES').format(numero);
    }

    formatearMoneda(cantidad, idioma = this.idiomaActual) {
        const configuraciones = {
            es: { style: 'currency', currency: 'COP', locale: 'es-CO' },
            en: { style: 'currency', currency: 'USD', locale: 'en-US' },
            pt: { style: 'currency', currency: 'BRL', locale: 'pt-BR' }
        };

        const config = configuraciones[idioma] || configuraciones['es'];
        return new Intl.NumberFormat(config.locale, {
            style: config.style,
            currency: config.currency
        }).format(cantidad);
    }

    // Métodos de persistencia
    guardarIdioma() {
        if (this.configuracion.persistirSeleccion) {
            localStorage.setItem('idioma', this.idiomaActual);
        }
    }

    guardarTraducciones() {
        localStorage.setItem('traducciones', JSON.stringify(this.traducciones));
    }

    guardarConfiguracion() {
        localStorage.setItem('configIdioma', JSON.stringify(this.configuracion));
    }

    // Método para exportar/importar traducciones
    exportarTraducciones() {
        const datos = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            traducciones: this.traducciones,
            configuracion: this.configuracion
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `traducciones-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.mostrarNotificacion('Traducciones exportadas exitosamente');
    }

    importarTraducciones(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const datos = JSON.parse(e.target.result);
                
                if (datos.traducciones) {
                    this.traducciones = { ...this.traducciones, ...datos.traducciones };
                    this.guardarTraducciones();
                    this.aplicarTraduccion(this.idiomaActual);
                    this.mostrarNotificacion('Traducciones importadas exitosamente');
                }
            } catch (error) {
                console.error('Error al importar traducciones:', error);
                this.mostrarNotificacion('Error al importar traducciones', 'error');
            }
        };
        
        reader.readAsText(archivo);
    }

    // Utilidades
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 0.9em;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        const colores = {
            'success': '#28a745',
            'error': '#dc3545',
            'info': '#17a2b8',
            'warning': '#ffc107'
        };

        notificacion.style.backgroundColor = colores[tipo] || colores['info'];
        notificacion.textContent = mensaje;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notificacion.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificacion.parentElement) {
                    notificacion.remove();
                }
            }, 300);
        }, 3000);
    }

    // Método para integración con otros sistemas
    integrarConSistema() {
        // Añadir método de traducción global
        window.t = (clave, params) => this.t(clave, this.idiomaActual, params);
        
        // Añadir formatters globales
        window.formatearFecha = (fecha) => this.formatearFecha(fecha);
        window.formatearMoneda = (cantidad) => this.formatearMoneda(cantidad);
        
        // Exponer métodos principales
        window.cambiarIdioma = (idioma) => this.cambiarIdioma(idioma);
        window.obtenerIdiomaActual = () => this.idiomaActual;
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaMultiidioma = new SistemaMultiidioma();
    window.sistemaMultiidioma.integrarConSistema();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaMultiidioma;
}