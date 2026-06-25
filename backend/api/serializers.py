from rest_framework import serializers
from .models import (
    Productos,
    CategoriaProducto,
    Pedidos,
    DetallePedido
)

class ProductoSerializer(serializers.ModelSerializer):

    categoria = serializers.CharField(
        source="id_categoria.nombre",
        read_only=True
    )

    class Meta:
        model = Productos
        fields = [
            "id_producto",
            "nombre",
            "precio_actual",
            "stock",
            "foto_url",
            "categoria"
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