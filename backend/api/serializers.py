from rest_framework import serializers
from .models import (
    Productos,
    CategoriaProducto,
    Pedidos,
    DetallePedido
)

class ProductoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Productos
        fields = "__all__"


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