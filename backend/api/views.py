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