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

    class Meta:
        model = Pedidos
        fields = "__all__"

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