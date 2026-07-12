from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers
from .models import (
    Productos,
    CategoriaProducto,
    Pedidos,
    DetallePedido,
    Ventas,
    DetalleVenta,
    Usuarios,
    Alumnos,

)

class ProductoSerializer(serializers.ModelSerializer):

    categoria = serializers.CharField(
        source="id_categoria.nombre",
        read_only=True
    )

    id_categoria = serializers.PrimaryKeyRelatedField(
    queryset=CategoriaProducto.objects.all()
)

    class Meta:
        model = Productos
        fields = [
            "id_categoria",
            "id_producto",
            "nombre",
            "precio_actual",
            "stock",
            "stock_minimo",
            "disponible",
            "foto_url",
            "stock_minimo",
            "disponible",
            "foto_url",
            "categoria",
            "id_categoria",
        ]


class CategoriaProductoSerializer(serializers.ModelSerializer):

    class Meta:
        model = CategoriaProducto
        fields = "__all__"


class DetallePedidoSerializer(serializers.ModelSerializer):

    class Meta:
        model = DetallePedido
        fields = "__all__"


class PedidoSerializer(serializers.ModelSerializer):

    alumno = serializers.SerializerMethodField()

    curso = serializers.SerializerMethodField()

    productos = serializers.SerializerMethodField()


    class Meta:

        model = Pedidos

        fields = [

            "id_pedido",

            "alumno",

            "curso",

            "horario_retiro",

            "estado",

            "total",

            "fecha_creacion",

            "productos"

        ]


    def get_alumno(self, obj):

        return f"{obj.id_alumno.nombre} {obj.id_alumno.apellido}"


    def get_curso(self, obj):

        return f"{obj.id_alumno.anio}°{obj.id_alumno.division}°"


    def get_productos(self, obj):

        detalles = DetallePedido.objects.filter(

            id_pedido=obj

        )

        return [

            {

                "nombre": detalle.id_producto.nombre,

                "cantidad": detalle.cantidad

            }

            for detalle in detalles

        ]

class VentaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ventas
        fields = "__all__"

class DetalleVentaSerializer(serializers.ModelSerializer):

    class Meta:
        model = DetalleVenta
        fields = "__all__"

class ProductoVentaSerializer(serializers.Serializer):

    id_producto = serializers.IntegerField()

    cantidad = serializers.IntegerField(
        min_value=1,
        error_messages={
            "min_value": "La cantidad debe ser mayor a cero."
        }
    )

class RegistroVentaPresencialSerializer(serializers.Serializer):

    id_usuario = serializers.IntegerField()

    productos = ProductoVentaSerializer(
        many=True
    )



class RegistroAlumnoSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True) # Campo que solo se utiliza para recibir la contraseña

    class Meta:
        model = Alumnos

        # Campos que se recibirán desde el frontend
        fields = [
            "nombre",
            "apellido",
            "anio",
            "division",
            "usuario",
            "password",
        ]

    def create(self, validated_data):
        
        # Extrae la contraseña para no guardarla en texto plano
        password = validated_data.pop("password")

        # Crea el alumno guardando la contraseña encriptada
        alumno = Alumnos.objects.create(
            **validated_data,
            pin_hash=make_password(password)
        )

        return alumno


class LoginSerializer(serializers.Serializer):
    
    # Usuario ingresado en el login
    usuario = serializers.CharField()
    # Contraseña ingresada en el login
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        # Obtiene los datos enviados por el usuario
        usuario = data["usuario"]
        password = data["password"]

        # Buscar en USUARIOS (Encargada o Ayudante)
        try:
            user = Usuarios.objects.get(usuario=usuario)

            # Comprueba que la contraseña sea correcta
            if check_password(password, user.contrasena_hash):
                return {
                    "tipo": "usuario",
                    "usuario": user
                }

        # Si no existe, continúa buscando en alumnos
        except Usuarios.DoesNotExist:
            pass

        # Buscar en ALUMNOS
        try:
            alumno = Alumnos.objects.get(usuario=usuario)

            # Comprueba que la contraseña sea correcta
            if check_password(password, alumno.pin_hash):
                return {
                    "tipo": "alumno",
                    "usuario": alumno
                }

        # Si no existe, continúa hasta lanzar el error
        except Alumnos.DoesNotExist:
            pass

        # Si no encontró ningún usuario válido
        raise serializers.ValidationError(
            "Usuario o contraseña incorrectos."
        )