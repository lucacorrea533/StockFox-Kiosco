from rest_framework import serializers
from .models import (
    Productos,
    CategoriaProducto,
    Pedidos,
    DetallePedido,
    Ventas,
    DetalleVenta,
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
            "id_producto",
            "nombre",
            "precio_actual",
            "stock",
            "disponible",
            "foto_url",
            "categoria",
            "id_categoria",
            "stock_minimo",
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

class VentaSerializer(serializers.ModelSerializer):

    class Meta:

        model = Ventas

        fields = "__all__"