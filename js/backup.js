/**
 * Sistema de Backup y Restauración - Cafetería Cesde
 * Gestiona copias de seguridad automáticas y restauración de datos
 */

class SistemaBackup {
    constructor() {
        this.configuracionBackup = JSON.parse(localStorage.getItem('configuracion_backup')) || this.getConfiguracionDefault();
        this.historicoBackups = JSON.parse(localStorage.getItem('historico_backups')) || [];
        this.intervalosBackup = [];
        this.init();
    }

    init() {
        this.configurarInterfaz();
        this.cargarHistoricoBackups();
        this.verificarUltimoBackup();
        this.programarBackupAutomatico();
        this.verificarEspacioStorage();
    }

    getConfiguracionDefault() {
        return {
            backupAutomatico: true,
            frecuencia: 'diario', // diario, semanal, manual
            horaBackup: '02:00',
            retencionDias: 30,
            compresion: true,
            notificaciones: true,
            incluirImagenes: false,
            limiteTamaño: 50 // MB
        };
    }

    configurarInterfaz() {
        // Cargar configuración actual en la interfaz
        document.getElementById('backup-automatico').checked = this.configuracionBackup.backupAutomatico;
        document.getElementById('frecuencia-backup').value = this.configuracionBackup.frecuencia;
        document.getElementById('hora-backup').value = this.configuracionBackup.horaBackup;
        document.getElementById('retencion-dias').value = this.configuracionBackup.retencionDias;
        document.getElementById('compresion-backup').checked = this.configuracionBackup.compresion;
        document.getElementById('notificaciones-backup').checked = this.configuracionBackup.notificaciones;
        document.getElementById('incluir-imagenes').checked = this.configuracionBackup.incluirImagenes;
        document.getElementById('limite-tamaño').value = this.configuracionBackup.limiteTamaño;

        this.actualizarEstadisticas();
    }

    guardarConfiguracion() {
        this.configuracionBackup = {
            backupAutomatico: document.getElementById('backup-automatico').checked,
            frecuencia: document.getElementById('frecuencia-backup').value,
            horaBackup: document.getElementById('hora-backup').value,
            retencionDias: parseInt(document.getElementById('retencion-dias').value),
            compresion: document.getElementById('compresion-backup').checked,
            notificaciones: document.getElementById('notificaciones-backup').checked,
            incluirImagenes: document.getElementById('incluir-imagenes').checked,
            limiteTamaño: parseInt(document.getElementById('limite-tamaño').value)
        };

        localStorage.setItem('configuracion_backup', JSON.stringify(this.configuracionBackup));
        
        // Reprogramar backups automáticos
        this.programarBackupAutomatico();
        
        this.mostrarNotificacion('✅ Configuración de backup guardada exitosamente', 'success');
    }

    crearBackupManual() {
        this.mostrarNotificacion('🔄 Iniciando backup manual...', 'info');
        
        try {
            const backup = this.generarBackup();
            this.guardarBackup(backup, 'manual');
            this.mostrarNotificacion('✅ Backup manual creado exitosamente', 'success');
        } catch (error) {
            console.error('Error al crear backup manual:', error);
            this.mostrarNotificacion('❌ Error al crear backup manual', 'error');
        }
    }

    generarBackup() {
        const fechaBackup = new Date().toISOString();
        
        // Recopilar todos los datos del sistema
        const datosBackup = {
            version: '1.0',
            fecha: fechaBackup,
            timestamp: Date.now(),
            datos: {
                // Datos principales del sistema
                ventas: JSON.parse(localStorage.getItem('ventas') || '[]'),
                clientes: JSON.parse(localStorage.getItem('clientes') || '[]'),
                empleados: JSON.parse(localStorage.getItem('empleados') || '[]'),
                productos: JSON.parse(localStorage.getItem('productos_configurados') || '[]'),
                inventario: JSON.parse(localStorage.getItem('inventario') || '[]'),
                proveedores: JSON.parse(localStorage.getItem('proveedores') || '[]'),
                ordenes_compra: JSON.parse(localStorage.getItem('ordenes_compra') || '[]'),
                
                // Datos de calidad
                inspecciones_calidad: JSON.parse(localStorage.getItem('inspecciones_calidad') || '[]'),
                auditorias_calidad: JSON.parse(localStorage.getItem('auditorias_calidad') || '[]'),
                certificaciones_calidad: JSON.parse(localStorage.getItem('certificaciones_calidad') || '[]'),
                acciones_correctivas: JSON.parse(localStorage.getItem('acciones_correctivas') || '[]'),
                
                // Configuraciones
                configuracion_backup: JSON.parse(localStorage.getItem('configuracion_backup') || '{}'),
                configuracion_sistema: JSON.parse(localStorage.getItem('configuracion_sistema') || '{}'),
                
                // Contadores
                contador_ventas: localStorage.getItem('contador_ventas'),
                contador_clientes: localStorage.getItem('contador_clientes'),
                contador_empleados: localStorage.getItem('contador_empleados'),
                contador_proveedores: localStorage.getItem('contador_proveedores'),
                contador_ordenes: localStorage.getItem('contador_ordenes'),
                contador_inspecciones: localStorage.getItem('contador_inspecciones'),
                contador_auditorias: localStorage.getItem('contador_auditorias')
            },
            metadatos: {
                navegador: navigator.userAgent,
                resolucion: `${screen.width}x${screen.height}`,
                zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
                idioma: navigator.language
            }
        };

        // Calcular tamaño del backup
        const tamaño = this.calcularTamañoBackup(datosBackup);
        datosBackup.tamaño = tamaño;

        // Comprimir si está habilitado
        if (this.configuracionBackup.compresion) {
            datosBackup.comprimido = true;
            // Simular compresión (en un entorno real usarías una librería como pako)
            datosBackup.datos_comprimidos = this.comprimirDatos(datosBackup.datos);
            delete datosBackup.datos;
        }

        return datosBackup;
    }

    calcularTamañoBackup(datos) {
        const jsonString = JSON.stringify(datos);
        const tamaño = new Blob([jsonString]).size;
        return Math.round(tamaño / 1024); // KB
    }

    comprimirDatos(datos) {
        // Simulación de compresión - en producción usar librería real
        const jsonString = JSON.stringify(datos);
        return btoa(jsonString); // Base64 como simulación
    }

    descomprimirDatos(datosComprimidos) {
        // Simulación de descompresión
        const jsonString = atob(datosComprimidos);
        return JSON.parse(jsonString);
    }

    guardarBackup(backup, tipo = 'automatico') {
        const id = `backup_${Date.now()}`;
        const clave = `backup_${id}`;
        
        try {
            // Verificar espacio disponible
            if (backup.tamaño > this.configuracionBackup.limiteTamaño * 1024) {
                throw new Error(`Backup excede el límite de tamaño (${this.configuracionBackup.limiteTamaño}MB)`);
            }

            // Guardar backup en localStorage
            localStorage.setItem(clave, JSON.stringify(backup));

            // Agregar al histórico
            const entradaHistorico = {
                id,
                clave,
                fecha: backup.fecha,
                tipo,
                tamaño: backup.tamaño,
                comprimido: backup.comprimido || false,
                estado: 'exitoso'
            };

            this.historicoBackups.unshift(entradaHistorico);
            
            // Mantener solo los backups dentro del período de retención
            this.limpiarBackupsAntiguos();
            
            // Guardar histórico actualizado
            localStorage.setItem('historico_backups', JSON.stringify(this.historicoBackups));
            
            this.cargarHistoricoBackups();
            this.actualizarEstadisticas();
            
            if (this.configuracionBackup.notificaciones) {
                this.mostrarNotificacion(`💾 Backup ${tipo} completado (${backup.tamaño}KB)`, 'success');
            }
            
        } catch (error) {
            console.error('Error al guardar backup:', error);
            
            // Registrar backup fallido
            const entradaFallida = {
                id: `backup_fallido_${Date.now()}`,
                fecha: new Date().toISOString(),
                tipo,
                estado: 'fallido',
                error: error.message
            };
            
            this.historicoBackups.unshift(entradaFallida);
            localStorage.setItem('historico_backups', JSON.stringify(this.historicoBackups));
            
            throw error;
        }
    }

    limpiarBackupsAntiguos() {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - this.configuracionBackup.retencionDias);

        const backupsAEliminar = this.historicoBackups.filter(backup => 
            new Date(backup.fecha) < fechaLimite && backup.estado === 'exitoso'
        );

        backupsAEliminar.forEach(backup => {
            if (backup.clave) {
                localStorage.removeItem(backup.clave);
            }
        });

        this.historicoBackups = this.historicoBackups.filter(backup => 
            new Date(backup.fecha) >= fechaLimite || backup.estado === 'fallido'
        );
    }

    programarBackupAutomatico() {
        // Limpiar intervalos existentes
        this.intervalosBackup.forEach(intervalo => clearInterval(intervalo));
        this.intervalosBackup = [];

        if (!this.configuracionBackup.backupAutomatico) {
            return;
        }

        // Programar según la frecuencia
        switch (this.configuracionBackup.frecuencia) {
            case 'diario':
                this.programarBackupDiario();
                break;
            case 'semanal':
                this.programarBackupSemanal();
                break;
            case 'cada_hora':
                this.programarBackupPorHora();
                break;
        }
    }

    programarBackupDiario() {
        const ahora = new Date();
        const [hora, minuto] = this.configuracionBackup.horaBackup.split(':');
        const proximoBackup = new Date();
        proximoBackup.setHours(parseInt(hora), parseInt(minuto), 0, 0);

        // Si ya pasó la hora hoy, programar para mañana
        if (proximoBackup <= ahora) {
            proximoBackup.setDate(proximoBackup.getDate() + 1);
        }

        const tiempoHastaBackup = proximoBackup.getTime() - ahora.getTime();

        const timeout = setTimeout(() => {
            this.ejecutarBackupAutomatico();
            // Programar el siguiente backup diario
            const intervalo = setInterval(() => {
                this.ejecutarBackupAutomatico();
            }, 24 * 60 * 60 * 1000); // 24 horas
            this.intervalosBackup.push(intervalo);
        }, tiempoHastaBackup);

        this.intervalosBackup.push(timeout);
    }

    programarBackupSemanal() {
        // Backup cada 7 días a la hora especificada
        const intervalo = setInterval(() => {
            const ahora = new Date();
            const [hora, minuto] = this.configuracionBackup.horaBackup.split(':');
            
            if (ahora.getHours() === parseInt(hora) && ahora.getMinutes() === parseInt(minuto)) {
                this.ejecutarBackupAutomatico();
            }
        }, 60000); // Verificar cada minuto

        this.intervalosBackup.push(intervalo);
    }

    programarBackupPorHora() {
        const intervalo = setInterval(() => {
            this.ejecutarBackupAutomatico();
        }, 60 * 60 * 1000); // Cada hora

        this.intervalosBackup.push(intervalo);
    }

    ejecutarBackupAutomatico() {
        try {
            const backup = this.generarBackup();
            this.guardarBackup(backup, 'automatico');
        } catch (error) {
            console.error('Error en backup automático:', error);
            if (this.configuracionBackup.notificaciones) {
                this.mostrarNotificacion('❌ Error en backup automático', 'error');
            }
        }
    }

    restaurarBackup(backupId) {
        if (!confirm('⚠️ ¿Está seguro de que desea restaurar este backup? Esto sobrescribirá todos los datos actuales.')) {
            return;
        }

        try {
            const backup = this.historicoBackups.find(b => b.id === backupId);
            if (!backup || backup.estado !== 'exitoso') {
                throw new Error('Backup no encontrado o dañado');
            }

            const datosBackup = JSON.parse(localStorage.getItem(backup.clave));
            if (!datosBackup) {
                throw new Error('Datos del backup no encontrados');
            }

            this.mostrarNotificacion('🔄 Restaurando backup...', 'info');

            // Obtener los datos (descomprimir si es necesario)
            let datos;
            if (datosBackup.comprimido) {
                datos = this.descomprimirDatos(datosBackup.datos_comprimidos);
            } else {
                datos = datosBackup.datos;
            }

            // Restaurar todos los datos
            Object.keys(datos).forEach(clave => {
                if (datos[clave] !== null && datos[clave] !== undefined) {
                    if (typeof datos[clave] === 'object') {
                        localStorage.setItem(clave, JSON.stringify(datos[clave]));
                    } else {
                        localStorage.setItem(clave, datos[clave]);
                    }
                }
            });

            this.mostrarNotificacion('✅ Backup restaurado exitosamente. Recargue la página.', 'success');
            
            // Opcional: recargar la página automáticamente después de 3 segundos
            setTimeout(() => {
                if (confirm('¿Desea recargar la página para aplicar los cambios?')) {
                    window.location.reload();
                }
            }, 3000);

        } catch (error) {
            console.error('Error al restaurar backup:', error);
            this.mostrarNotificacion(`❌ Error al restaurar backup: ${error.message}`, 'error');
        }
    }

    exportarBackup(backupId) {
        try {
            const backup = this.historicoBackups.find(b => b.id === backupId);
            if (!backup || backup.estado !== 'exitoso') {
                throw new Error('Backup no encontrado');
            }

            const datosBackup = JSON.parse(localStorage.getItem(backup.clave));
            const nombreArchivo = `backup_cafeteria_cesde_${backup.fecha.split('T')[0]}.json`;
            
            const blob = new Blob([JSON.stringify(datosBackup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.mostrarNotificacion('📥 Backup exportado exitosamente', 'success');

        } catch (error) {
            console.error('Error al exportar backup:', error);
            this.mostrarNotificacion('❌ Error al exportar backup', 'error');
        }
    }

    importarBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const archivo = event.target.files[0];
            if (!archivo) return;

            const lector = new FileReader();
            lector.onload = (e) => {
                try {
                    const datosBackup = JSON.parse(e.target.result);
                    
                    // Validar estructura del backup
                    if (!datosBackup.version || !datosBackup.datos) {
                        throw new Error('Archivo de backup no válido');
                    }

                    // Guardar backup importado
                    this.guardarBackup(datosBackup, 'importado');
                    this.mostrarNotificacion('✅ Backup importado exitosamente', 'success');

                } catch (error) {
                    console.error('Error al importar backup:', error);
                    this.mostrarNotificacion('❌ Error al importar backup: archivo no válido', 'error');
                }
            };
            
            lector.readAsText(archivo);
        };
        
        input.click();
    }

    eliminarBackup(backupId) {
        if (!confirm('¿Está seguro de que desea eliminar este backup?')) {
            return;
        }

        try {
            const backup = this.historicoBackups.find(b => b.id === backupId);
            if (backup && backup.clave) {
                localStorage.removeItem(backup.clave);
            }

            this.historicoBackups = this.historicoBackups.filter(b => b.id !== backupId);
            localStorage.setItem('historico_backups', JSON.stringify(this.historicoBackups));
            
            this.cargarHistoricoBackups();
            this.actualizarEstadisticas();
            
            this.mostrarNotificacion('🗑️ Backup eliminado exitosamente', 'success');

        } catch (error) {
            console.error('Error al eliminar backup:', error);
            this.mostrarNotificacion('❌ Error al eliminar backup', 'error');
        }
    }

    cargarHistoricoBackups() {
        const container = document.getElementById('lista-backups');
        if (!container) return;

        if (this.historicoBackups.length === 0) {
            container.innerHTML = '<div class="sin-datos">No hay backups disponibles</div>';
            return;
        }

        container.innerHTML = this.historicoBackups.map(backup => `
            <div class="backup-item ${backup.estado}">
                <div class="backup-header">
                    <div class="backup-info">
                        <strong>${backup.tipo.charAt(0).toUpperCase() + backup.tipo.slice(1)}</strong>
                        <span class="backup-fecha">${new Date(backup.fecha).toLocaleString()}</span>
                    </div>
                    <div class="backup-estado estado-${backup.estado}">
                        ${backup.estado === 'exitoso' ? '✅ Exitoso' : '❌ Fallido'}
                    </div>
                </div>
                
                ${backup.estado === 'exitoso' ? `
                    <div class="backup-detalles">
                        <span>📦 Tamaño: ${backup.tamaño}KB</span>
                        ${backup.comprimido ? '<span>🗜️ Comprimido</span>' : ''}
                    </div>
                    
                    <div class="backup-acciones">
                        <button class="btn btn-primary" onclick="sistemaBackup.restaurarBackup('${backup.id}')">
                            🔄 Restaurar
                        </button>
                        <button class="btn btn-success" onclick="sistemaBackup.exportarBackup('${backup.id}')">
                            📥 Exportar
                        </button>
                        <button class="btn btn-danger" onclick="sistemaBackup.eliminarBackup('${backup.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                ` : `
                    <div class="backup-error">
                        <strong>Error:</strong> ${backup.error || 'Error desconocido'}
                    </div>
                `}
            </div>
        `).join('');
    }

    verificarUltimoBackup() {
        const ultimoBackup = this.historicoBackups.find(b => b.estado === 'exitoso');
        const container = document.getElementById('ultimo-backup-info');
        
        if (!container) return;

        if (!ultimoBackup) {
            container.innerHTML = '<span style="color: #dc3545;">⚠️ No hay backups disponibles</span>';
            return;
        }

        const fechaUltimo = new Date(ultimoBackup.fecha);
        const ahora = new Date();
        const diferenciaDias = Math.floor((ahora - fechaUltimo) / (1000 * 60 * 60 * 24));

        let mensaje = `✅ ${fechaUltimo.toLocaleString()}`;
        let color = '#28a745';

        if (diferenciaDias > 7) {
            mensaje = `⚠️ ${fechaUltimo.toLocaleString()} (${diferenciaDias} días atrás)`;
            color = '#ffc107';
        } else if (diferenciaDias > 14) {
            mensaje = `❌ ${fechaUltimo.toLocaleString()} (${diferenciaDias} días atrás)`;
            color = '#dc3545';
        }

        container.innerHTML = `<span style="color: ${color};">${mensaje}</span>`;
    }

    verificarEspacioStorage() {
        try {
            // Calcular espacio usado aproximado
            let espacioUsado = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const clave = localStorage.key(i);
                if (clave.startsWith('backup_')) {
                    espacioUsado += localStorage.getItem(clave).length;
                }
            }

            const espacioUsadoMB = (espacioUsado / (1024 * 1024)).toFixed(2);
            const espacioLimiteMB = this.configuracionBackup.limiteTamaño * this.historicoBackups.filter(b => b.estado === 'exitoso').length;

            const container = document.getElementById('espacio-storage');
            if (container) {
                container.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-numero">${espacioUsadoMB}MB</div>
                        <div class="stat-label">Espacio Usado en Backups</div>
                    </div>
                `;
            }

            // Advertir si se está acercando al límite
            if (espacioUsadoMB > espacioLimiteMB * 0.8) {
                this.mostrarNotificacion('⚠️ El espacio de backups está llegando al límite', 'warning');
            }

        } catch (error) {
            console.error('Error al verificar espacio de storage:', error);
        }
    }

    actualizarEstadisticas() {
        const container = document.getElementById('estadisticas-backup');
        if (!container) return;

        const totalBackups = this.historicoBackups.length;
        const backupsExitosos = this.historicoBackups.filter(b => b.estado === 'exitoso').length;
        const backupsFallidos = this.historicoBackups.filter(b => b.estado === 'fallido').length;
        const espacioTotal = this.historicoBackups
            .filter(b => b.estado === 'exitoso' && b.tamaño)
            .reduce((sum, b) => sum + b.tamaño, 0);

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-numero">${totalBackups}</div>
                <div class="stat-label">Total Backups</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${backupsExitosos}</div>
                <div class="stat-label">Backups Exitosos</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${backupsFallidos}</div>
                <div class="stat-label">Backups Fallidos</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${(espacioTotal / 1024).toFixed(1)}MB</div>
                <div class="stat-label">Espacio Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${this.configuracionBackup.retencionDias}</div>
                <div class="stat-label">Días de Retención</div>
            </div>
            <div class="stat-card">
                <div class="stat-numero">${((backupsExitosos / totalBackups) * 100 || 0).toFixed(1)}%</div>
                <div class="stat-label">Tasa de Éxito</div>
            </div>
        `;

        this.verificarUltimoBackup();
        this.verificarEspacioStorage();
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación visual
        const notif = document.createElement('div');
        notif.className = `notificacion ${tipo}`;
        notif.textContent = mensaje;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${tipo === 'success' ? '#28a745' : tipo === 'warning' ? '#ffc107' : tipo === 'error' ? '#dc3545' : '#17a2b8'};
        `;

        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 4000);

        // Notificación del navegador si está permitida
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Cafetería Cesde - Sistema de Backup', {
                body: mensaje,
                icon: 'Images/logo.png'
            });
        }
    }
}

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.backup-container')) {
        window.sistemaBackup = new SistemaBackup();
        
        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaBackup;
}

// ================================================
// FUNCIONES ADICIONALES PARA LA INTERFAZ
// ================================================

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

    // Cargar contenido específico de la sección
    if (window.sistemaBackup) {
        switch (seccionId) {
            case 'backups':
                sistemaBackup.cargarHistoricoBackups();
                break;
            case 'estadisticas':
                sistemaBackup.actualizarEstadisticas();
                break;
        }
    }
}

// Navegación móvil mejorada
document.addEventListener('DOMContentLoaded', () => {
    // Navegación móvil
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un enlace (en móvil)
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });
});