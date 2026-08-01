# models.py define la estructura de la base de datos: cada clase representa una tabla
# y cada atributo, una columna. Django usa estos modelos para consultar, crear, modificar
# y eliminar datos sin necesidad de escribir SQL a mano.
#
# Todas las tablas usan managed=False porque la base de datos ya existe (fue creada con
# el script SQL del proyecto) y no se administra mediante migraciones de Django.
#
# El archivo se divide en dos partes:
#   1) Modelos propios del negocio (del Kiosco Escolar)
#   2) Tablas internas de Django (auth, sesiones, admin) que no se usan en la lógica del kiosco,
#      pero deben declararse porque comparten la misma base de datos.

from django.db import models


# ════════════════════════════════════════════════════════════════════════════
# MODELOS DEL NEGOCIO
# ════════════════════════════════════════════════════════════════════════════

class Usuarios(models.Model):
    """Personal del kiosco: Encargada o Ayudante."""
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    usuario = models.CharField(max_length=50)
    contrasena_hash = models.CharField(max_length=255)  # Contraseña cifrada con bcrypt
    rol = models.CharField(max_length=9)  # 'Encargada' o 'Ayudante'
    activo = models.BooleanField(default=True)  # NUEVO: TRUE = cuenta habilitada. FALSE = deshabilitada sin borrar historial.

    class Meta:
        managed = False
        db_table = 'usuarios'


class Alumnos(models.Model):
    """Alumnos que pueden autenticarse y realizar pedidos anticipados."""
    id_alumno = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    usuario = models.CharField(max_length=50)
    anio = models.IntegerField()      # 1 a 6
    division = models.IntegerField()  # 1, 2, 3...
    pin_hash = models.CharField(max_length=255)  # PIN cifrado con bcrypt
    activo = models.BooleanField(default=True)  # NUEVO: TRUE = cuenta habilitada. FALSE = deshabilitada.
    avatar_url = models.CharField(max_length=255, blank=True, null=True)  # NUEVO: avatar elegido en "Mi Perfil"

    class Meta:
        managed = False
        db_table = 'alumnos'


class CategoriaProducto(models.Model):
    """Categorías que agrupan los productos (Snacks, Bebidas, etc.)."""
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'categoria_producto'


class Productos(models.Model):
    """Catálogo de productos del kiosco."""
    id_producto = models.AutoField(primary_key=True)
    id_categoria = models.ForeignKey(CategoriaProducto, models.DO_NOTHING, db_column='id_categoria')
    nombre = models.CharField(max_length=100)
    precio_actual = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    stock_minimo = models.IntegerField()  # Umbral que dispara la alerta de reposición
    foto_url = models.CharField(max_length=255, blank=True, null=True)
    disponible = models.IntegerField()  # 1 = visible para la venta, 0 = oculto. Lo controla el stock.
    activo = models.BooleanField(default=True)  # NUEVO: TRUE = existe en gestión. FALSE = desactivado manualmente, sin perder historial.

    class Meta:
        managed = False
        db_table = 'productos'


class Proveedores(models.Model):
    """Proveedores que abastecen al kiosco."""
    id_proveedor = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    dias_visita = models.CharField(max_length=50)  # Ej: 'Lunes, Miércoles'

    class Meta:
        managed = False
        db_table = 'proveedores'


class Ventas(models.Model):
    """Cabecera de una venta (de mostrador o generada desde un pedido entregado)."""
    id_venta = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')  # Quién la registró
    fecha_hora = models.DateTimeField()
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'ventas'


class DetalleVenta(models.Model):
    """Productos incluidos en cada venta."""
    id_detalleventa = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey('Ventas', models.DO_NOTHING, db_column='id_venta')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)  # Precio al momento de vender

    class Meta:
        managed = False
        db_table = 'detalle_venta'


class Pedidos(models.Model):
    """Pedidos anticipados realizados por los alumnos."""
    id_pedido = models.AutoField(primary_key=True)
    id_alumno = models.ForeignKey(Alumnos, models.DO_NOTHING, db_column='id_alumno')
    horario_retiro = models.TimeField()
    estado = models.CharField(max_length=14)  # 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado' — ampliado de max_length=9 a 14 para que entre "en_preparacion"
    motivo_cancelacion = models.CharField(max_length=255, blank=True, null=True)  # NUEVO: motivo mostrado al alumno si se canceló
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedidos'


class DetallePedido(models.Model):
    """Productos incluidos en cada pedido."""
    id_detallepedido = models.AutoField(primary_key=True)
    id_pedido = models.ForeignKey('Pedidos', models.DO_NOTHING, db_column='id_pedido')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)  # Precio al momento del pedido

    class Meta:
        managed = False
        db_table = 'detalle_pedido'


class ComprasProveedor(models.Model):
    """Compras realizadas a un proveedor para reponer stock."""
    id_compra = models.AutoField(primary_key=True)
    id_proveedor = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_proveedor')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')  # Quién la registró
    fecha = models.DateTimeField()
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'compras_proveedor'


class DetalleCompra(models.Model):
    """Productos incluidos en cada compra a proveedor."""
    id_detallecompra = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(ComprasProveedor, models.DO_NOTHING, db_column='id_compra')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_costo = models.DecimalField(max_digits=10, decimal_places=2)  # Costo unitario en esa compra

    class Meta:
        managed = False
        db_table = 'detalle_compra'


class Promociones(models.Model):
    """Promociones activas del kiosco (ej: combos con precio especial)."""
    id_promocion = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')  # Quién la creó
    nombre = models.CharField(max_length=100)
    precio_especial = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    class Meta:
        managed = False
        db_table = 'promociones'


class DetallePromocion(models.Model):
    """Productos que componen cada promoción."""
    id_detallepromo = models.AutoField(primary_key=True)
    id_promocion = models.ForeignKey('Promociones', models.DO_NOTHING, db_column='id_promocion')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'detalle_promocion'


class ProveedorProducto(models.Model):
    """Relación M:N entre proveedores y los productos que suministran."""
    pk = models.CompositePrimaryKey('id_proveedor', 'id_producto')
    id_proveedor = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_proveedor')
    id_producto = models.ForeignKey(Productos, models.DO_NOTHING, db_column='id_producto')

    class Meta:
        managed = False
        db_table = 'proveedor_producto'


class GastosOperativos(models.Model):
    """Gastos del kiosco no relacionados con compras a proveedores (limpieza, insumos, etc.)."""
    id_gasto = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')  # Quién lo registró
    descripcion = models.CharField(max_length=255)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    categoria = models.CharField(max_length=50, blank=True, null=True)  # Ej: 'Insumos', 'Limpieza'

    class Meta:
        managed = False
        db_table = 'gastos_operativos'


class HistorialPrecios(models.Model):
    """Registro histórico de cambios de precio de cada producto."""
    id_historial = models.AutoField(primary_key=True)
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')  # Quién hizo el cambio
    precio_anterior = models.DecimalField(max_digits=10, decimal_places=2)
    precio_nuevo = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_cambio = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'historial_precios'


class MenuDia(models.Model):
    """Menú del día cargado por la Encargada (solo puede existir uno activo a la vez)."""
    id_menu = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    descripcion = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()

    class Meta:
        managed = False
        db_table = 'menu_dia'


class PagosProveedor(models.Model):
    """Pagos realizados a proveedores por las compras."""
    id_pago = models.AutoField(primary_key=True)
    id_proveedor = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_proveedor')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')  # Quién lo registró
    fecha = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'pagos_proveedor'


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Favoritos (Alumno ↔ Producto)
# ────────────────────────────────────────────────────────────────────────────

class Favoritos(models.Model):
    """Productos que un alumno marcó como favoritos (♡)."""
    id_favorito = models.AutoField(primary_key=True)
    id_alumno = models.ForeignKey('Alumnos', models.DO_NOTHING, db_column='id_alumno')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    fecha_agregado = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'favoritos'
        unique_together = (('id_alumno', 'id_producto'),)


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Configuración global del Kiosco (tabla de una sola fila)
# ────────────────────────────────────────────────────────────────────────────

class ConfiguracionKiosco(models.Model):
    """Estado global del kiosco: abierto/alta demanda/pausado, pedidos anticipados habilitados o no."""
    id_configuracion = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=12)  # 'abierto' | 'alta_demanda' | 'pausado'
    pedidos_anticipados_habilitados = models.BooleanField(default=True)
    demora_estimada_minutos = models.IntegerField(blank=True, null=True)  # Solo si estado = 'alta_demanda'
    id_usuario_ultima_modificacion = models.ForeignKey(
        'Usuarios', models.DO_NOTHING, db_column='id_usuario_ultima_modificacion', blank=True, null=True
    )
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'configuracion_kiosco'


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Notificaciones individuales (reemplaza el cálculo "al vuelo")
# ────────────────────────────────────────────────────────────────────────────

class Notificaciones(models.Model):
    """Notificaciones individuales para personal o alumnos, con estado leída/no leída."""
    id_notificacion = models.AutoField(primary_key=True)
    id_usuario_destino = models.ForeignKey(
        'Usuarios', models.DO_NOTHING, db_column='id_usuario_destino', blank=True, null=True
    )
    id_alumno_destino = models.ForeignKey(
        'Alumnos', models.DO_NOTHING, db_column='id_alumno_destino', blank=True, null=True
    )
    seccion = models.CharField(max_length=8)  # 'stock' | 'pedidos' | 'sistema'
    mensaje = models.CharField(max_length=255)
    leida = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'notificaciones'


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Preferencias de notificación por alumno (1:1)
# ────────────────────────────────────────────────────────────────────────────

class PreferenciasNotificacionAlumno(models.Model):
    """Qué tipos de notificación quiere recibir cada alumno. Relación 1:1 con Alumnos."""
    id_alumno = models.OneToOneField('Alumnos', models.DO_NOTHING, db_column='id_alumno', primary_key=True)
    notif_pedido_recibido = models.BooleanField(default=True)
    notif_listo_retirar = models.BooleanField(default=True)
    notif_cancelado = models.BooleanField(default=True)
    notif_recomendaciones = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'preferencias_notificacion_alumno'


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Historial de actividad del personal
# ────────────────────────────────────────────────────────────────────────────

class LogActividad(models.Model):
    """Registro de qué hizo cada usuario del personal y cuándo (ej: 'agregó Coca-Cola')."""
    id_log = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    descripcion = models.CharField(max_length=255)
    fecha_hora = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_actividad'


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Notas internas del equipo
# ────────────────────────────────────────────────────────────────────────────

class Notas(models.Model):
    """Notas internas del equipo (ej: 'reponer bebidas'). Se borran a la semana desde la app."""
    id_nota = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    contenido = models.CharField(max_length=500)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'notas'


# ────────────────────────────────────────────────────────────────────────────
# NUEVO: Información de la escuela (tabla de una sola fila)
# ────────────────────────────────────────────────────────────────────────────

class InfoEscuela(models.Model):
    """Datos institucionales de la ET 29, mostrados en la sección "Información"."""
    id_info = models.AutoField(primary_key=True)
    nombre_escuela = models.CharField(max_length=150)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    contacto = models.CharField(max_length=100, blank=True, null=True)
    sitio_web = models.CharField(max_length=255, blank=True, null=True)
    horarios = models.CharField(max_length=255, blank=True, null=True)
    acerca_de = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'info_escuela'


# ════════════════════════════════════════════════════════════════════════════
# TABLAS INTERNAS DE DJANGO
# Mapean las tablas propias del framework (autenticación, sesiones, panel admin).
# No se usan en la lógica del kiosco, el login del sistema es propio (JWT + bcrypt).
# ════════════════════════════════════════════════════════════════════════════

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'