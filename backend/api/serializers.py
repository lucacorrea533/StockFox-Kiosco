from rest_framework import serializers
from .models import Productos, CategoriaProducto

class ProductoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Productos
        fields = "__all__"


class CategoriaProductoSerializer(serializers.ModelSerializer):

    class Meta:
        model = CategoriaProducto
        fields = "__all__"