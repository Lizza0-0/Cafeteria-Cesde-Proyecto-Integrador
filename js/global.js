/**
 * Sistema Global - Cafetería Cesde
 * Solo navegación (sin multiidioma ni accesibilidad)
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

// ===== INICIALIZACIÓN GLOBAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de navegación...');
    
    // Inicializar solo navegación
    window.sistemaNavegacion = new SistemaNavegacion();
    
    console.log('✅ Sistema de navegación inicializado correctamente');
});

console.log('✅ Sistema de navegación cargado correctamente');