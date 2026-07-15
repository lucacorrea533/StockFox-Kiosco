# serializers.py traduce entre los modelos de Django y el JSON que usa el frontend.
# Serializar: convertir objetos Python/BBDD en JSON para enviarlos al cliente.
# Deserializar: convertir el JSON recibido en objetos Python, validando los datos
# antes de guardarlos en la base de datos.
# Están agrupados por módulo: productos, pedidos, ventas, autenticación,
# usuarios/alumnos, gastos y menú del día.

from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers

from .models import (
    Productos, CategoriaProducto, Pedidos, DetallePedido, Ventas,
    DetalleVenta, Usuarios, Alumnos, GastosOperativos, MenuDia,
)


# ════════════════════════════════════════════════════════════════════════════
# PRODUCTOS Y CATEGORÍAS
# ════════════════════════════════════════════════════════════════════════════

class ProductoSerializer(serializers.ModelSerializer):
    # Nombre de la categoría, de solo lectura, para no obligar al frontend a resolverlo por ID
    categoria = serializers.CharField(source="id_categoria.nombre", read_only=True)
    id_categoria = serializers.PrimaryKeyRelatedField(queryset=CategoriaProducto.objects.all())

    class Meta:
        model = Productos
        fields = [
            "id_producto", "id_categoria", "categoria", "nombre",
            "precio_actual", "stock", "stock_minimo", "disponible", "foto_url",
        ]


class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaProducto
        fields = "__all__"


# ════════════════════════════════════════════════════════════════════════════
# PEDIDOS
# ════════════════════════════════════════════════════════════════════════════

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = "__all__"


class PedidoSerializer(serializers.ModelSerializer):
    """Devuelve el pedido con datos ya resueltos (nombre de alumno, curso, productos)
    para que el frontend no tenga que hacer consultas adicionales."""

    alumno = serializers.SerializerMethodField()
    curso = serializers.SerializerMethodField()
    productos = serializers.SerializerMethodField()

    class Meta:
        model = Pedidos
        fields = [
            "id_pedido", "alumno", "curso", "horario_retiro",
            "estado", "total", "fecha_creacion", "productos",
        ]

    def get_alumno(self, obj):
        return f"{obj.id_alumno.nombre} {obj.id_alumno.apellido}"

    def get_curso(self, obj):
        return f"{obj.id_alumno.anio}°{obj.id_alumno.division}°"

    def get_productos(self, obj):
        detalles = DetallePedido.objects.filter(id_pedido=obj)
        return [{"nombre": d.id_producto.nombre, "cantidad": d.cantidad} for d in detalles]


# ════════════════════════════════════════════════════════════════════════════
# VENTAS
# ════════════════════════════════════════════════════════════════════════════

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ventas
        fields = "__all__"


class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = "__all__"


class ProductoVentaSerializer(serializers.Serializer):
    """Un ítem (producto + cantidad) dentro de una venta presencial."""
    id_producto = serializers.IntegerField()
    cantidad = serializers.IntegerField(
        min_value=1,
        error_messages={"min_value": "La cantidad debe ser mayor a cero."},
    )


class RegistroVentaPresencialSerializer(serializers.Serializer):
    """Valida los datos completos de una venta de mostrador (usuario + productos)."""
    id_usuario = serializers.IntegerField()
    productos = ProductoVentaSerializer(many=True)


# ════════════════════════════════════════════════════════════════════════════
# AUTENTICACIÓN
# ════════════════════════════════════════════════════════════════════════════

class RegistroAlumnoSerializer(serializers.ModelSerializer):
    """Valida el alta de un alumno y cifra su contraseña (PIN) antes de guardarla."""

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Alumnos
        fields = ["nombre", "apellido", "anio", "division", "usuario", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        return Alumnos.objects.create(**validated_data, pin_hash=make_password(password))


class LoginSerializer(serializers.Serializer):
    """Valida usuario/contraseña contra USUARIOS (personal) o ALUMNOS, en ese orden."""

    usuario = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        usuario, password = data["usuario"], data["password"]

        # 1) Buscar en el personal (Encargada / Ayudante)
        try:
            user = Usuarios.objects.get(usuario=usuario)
            if check_password(password, user.contrasena_hash):
                return {"tipo": "usuario", "usuario": user}
        except Usuarios.DoesNotExist:
            pass

        # 2) Buscar en alumnos
        try:
            alumno = Alumnos.objects.get(usuario=usuario)
            if check_password(password, alumno.pin_hash):
                return {"tipo": "alumno", "usuario": alumno}
        except Alumnos.DoesNotExist:
            pass

        raise serializers.ValidationError("Usuario o contraseña incorrectos.")


# ════════════════════════════════════════════════════════════════════════════
# USUARIOS Y ALUMNOS (gestión del personal)
# ════════════════════════════════════════════════════════════════════════════

class UsuarioSerializer(serializers.ModelSerializer):
    """Representación pública de un usuario del personal (sin la contraseña)."""

    class Meta:
        model = Usuarios
        fields = ["id_usuario", "nombre", "apellido", "usuario", "rol"]


class AlumnoSerializer(serializers.ModelSerializer):
    curso = serializers.SerializerMethodField()

    class Meta:
        model = Alumnos
        fields = ["id_alumno", "nombre", "apellido", "usuario", "anio", "division", "curso"]

    def get_curso(self, obj):
        return f"{obj.anio}°{obj.division}°"


class CrearUsuarioSerializer(serializers.ModelSerializer):
    """Crea un usuario del personal cifrando la contraseña recibida."""

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuarios
        fields = ["id_usuario", "nombre", "apellido", "usuario", "rol", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        return Usuarios.objects.create(**validated_data, contrasena_hash=make_password(password))


class ActualizarUsuarioSerializer(serializers.ModelSerializer):
    """Actualiza un usuario existente. La contraseña es opcional: si no se envía, se conserva la actual."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuarios
        fields = ["nombre", "apellido", "usuario", "password"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)

        if password:
            instance.contrasena_hash = make_password(password)

        instance.save()
        return instance


# ════════════════════════════════════════════════════════════════════════════
# GASTOS OPERATIVOS Y MENÚ DEL DÍA
# ════════════════════════════════════════════════════════════════════════════

class GastoOperativoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GastosOperativos
        fields = ["id_gasto", "descripcion", "monto", "fecha", "categoria"]


class MenuDiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuDia
        fields = ["id_menu", "descripcion", "precio", "fecha"]
        read_only_fields = ["id_menu", "fecha"]