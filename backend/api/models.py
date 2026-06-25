# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Alumnos(models.Model):
    id_alumno = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)

    anio = models.IntegerField()
    division = models.IntegerField()

    pin_hash = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'alumnos'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


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


class CategoriaProducto(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'categoria_producto'


class ComprasProveedor(models.Model):
    id_compra = models.AutoField(primary_key=True)
    id_proveedor = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_proveedor')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    fecha = models.DateTimeField()
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'compras_proveedor'


class DetalleCompra(models.Model):
    id_detallecompra = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(ComprasProveedor, models.DO_NOTHING, db_column='id_compra')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_costo = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'detalle_compra'


class DetallePedido(models.Model):
    id_detallepedido = models.AutoField(primary_key=True)
    id_pedido = models.ForeignKey('Pedidos', models.DO_NOTHING, db_column='id_pedido')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'detalle_pedido'


class DetallePromocion(models.Model):
    id_detallepromo = models.AutoField(primary_key=True)
    id_promocion = models.ForeignKey('Promociones', models.DO_NOTHING, db_column='id_promocion')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'detalle_promocion'


class DetalleVenta(models.Model):
    id_detalleventa = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey('Ventas', models.DO_NOTHING, db_column='id_venta')
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'detalle_venta'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


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


class GastosOperativos(models.Model):
    id_gasto = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    descripcion = models.CharField(max_length=255)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    categoria = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'gastos_operativos'


class HistorialPrecios(models.Model):
    id_historial = models.AutoField(primary_key=True)
    id_producto = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_producto')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    precio_anterior = models.DecimalField(max_digits=10, decimal_places=2)
    precio_nuevo = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_cambio = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'historial_precios'


class MenuDia(models.Model):
    id_menu = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    descripcion = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()

    class Meta:
        managed = False
        db_table = 'menu_dia'


class PagosProveedor(models.Model):
    id_pago = models.AutoField(primary_key=True)
    id_proveedor = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_proveedor')
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    fecha = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'pagos_proveedor'


class Pedidos(models.Model):
    id_pedido = models.AutoField(primary_key=True)
    id_alumno = models.ForeignKey(Alumnos, models.DO_NOTHING, db_column='id_alumno')
    horario_retiro = models.TimeField()
    estado = models.CharField(max_length=9)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedidos'


class Productos(models.Model):
    id_producto = models.AutoField(primary_key=True)
    id_categoria = models.ForeignKey(CategoriaProducto, models.DO_NOTHING, db_column='id_categoria')
    nombre = models.CharField(max_length=100)
    precio_actual = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    stock_minimo = models.IntegerField()
    foto_url = models.CharField(max_length=255, blank=True, null=True)
    disponible = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'productos'


class Promociones(models.Model):
    id_promocion = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    nombre = models.CharField(max_length=100)
    precio_especial = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    class Meta:
        managed = False
        db_table = 'promociones'


class ProveedorProducto(models.Model):
    pk = models.CompositePrimaryKey('id_proveedor', 'id_producto')
    id_proveedor = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_proveedor')
    id_producto = models.ForeignKey(Productos, models.DO_NOTHING, db_column='id_producto')

    class Meta:
        managed = False
        db_table = 'proveedor_producto'


class Proveedores(models.Model):
    id_proveedor = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    dias_visita = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'proveedores'


class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    contrasena_hash = models.CharField(max_length=255)
    rol = models.CharField(max_length=9)

    class Meta:
        managed = False
        db_table = 'usuarios'


class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    fecha_hora = models.DateTimeField()
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'ventas'
