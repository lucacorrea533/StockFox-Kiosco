from rest_framework.decorators import api_view #Transforma una función común en endpoint REST.
from rest_framework.response import Response #Devuelve JSON

from .models import Productos #Consulta la base 
from .serializers import ProductoSerializer #Convierte objetos en JSON

@api_view(["GET"])
def listar_productos(request):

    productos = Productos.objects.all() # Django ejecuta SELECT * FROM productos;

    serializer = ProductoSerializer( # Convierte la QuerySet a JSON.
        productos,
        many=True
    )

    return Response(serializer.data) # Devuelve JSON 

@api_view(["GET"])
def obtener_producto(request, id_producto):

    try: # Se intenta ejecutar el bloque de código

        producto = Productos.objects.get( # Django internamente ejecuta: SELECT * FROM productos 
            id_producto=id_producto # WHERE id_producto = ?
        )

    except Productos.DoesNotExist: # Si un producto no existe, Django lanzará una excepción y devolverá un error interno.

        return Response(
            {"error": "Producto no encontrado"},
            status=404
        )

    serializer = ProductoSerializer(producto)

    return Response(serializer.data)