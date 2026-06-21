from rest_framework.decorators import api_view # Transforma una función común en endpoint REST.
from rest_framework.response import Response #Devuelve JSON

from rest_framework import status 
# Nos permite escribir status=status.HTTP_201_CREATED en lugar de memorizar números

from django.db import IntegrityError 

"""
 IntegrityError es una Excepción que Django lanza cuando una operación 
 rompe alguna regla de integridad de la base de datos.
"""

from .models import Productos, CategoriaProducto #Consulta los modelos de la bbdd

from .serializers import ( # Importamos los serializadores que convierten objetos a JSON
    ProductoSerializer,
    CategoriaProductoSerializer
)


@api_view(["GET"])
def listar_productos(request):

    productos = Productos.objects.all() # Django ejecuta SELECT * FROM productos;

    serializer = ProductoSerializer( # Convierte la QuerySet a JSON.
        productos,
        many=True
    )

    return Response(serializer.data) # Devuelve JSON 

#======================================================

@api_view(["GET"])
def listar_productos_disponibles(request):

    productos = Productos.objects.filter( # Django genera una consulta parecida a SELECT * FROM productos WHERE disponible = 1 AND stock > 0;
        disponible=1,
        stock__gt=0
    )

    serializer = ProductoSerializer( # Serializamos. Convierte el QuerySet a JSON.
        productos,
        many=True
    )

    return Response(serializer.data) # Devuelve la lista filtrada 

#======================================================

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


#======================================================

@api_view(["POST"])
def crear_producto(request):

    serializer = ProductoSerializer(
        data=request.data # Tomá lo que envió el cliente y dáselo al serializer
    )

    if serializer.is_valid(): # ¿Los datos cumplen las reglas?

        serializer.save() # Guarda y Django genera el INSERT 

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        ) # Respuesta exitosa devuelve el producto recién creado

    return Response(
        serializer.errors, # Devolerá cualquier aviso de error de algún campo invalido 
        status=status.HTTP_400_BAD_REQUEST
    )

#======================================================

@api_view(["PUT"]) #Esta función será un endpoint REST y solamente aceptará peticiones PUT
def actualizar_producto(request, id_producto): #Función que se ejecutará cuando llegue la petición. Recibe os datos nuevos y el ID del prodocuto que se quiere modificar


    try: # Python ejecuta un bloque que podría fallar, ya que el producto podría no existir

        producto = Productos.objects.get( #Busca un único porducto en la base ded atos. Internamente Django genera algo parecido a SELECT * FROM PRODUCTOS WHERE id_prodcuto = 159;
            id_producto=id_producto
        )

    except Productos.DoesNotExist: # En caso de no encontrar nada porque el producto no existe, entonces lanza una excepción avisando

        return Response(
            {"error": "Producto no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )


    serializer = ProductoSerializer( #Toma el producto existente y reemplazá sus datos con los que llegaron en la petición. El serialzier prepara la actualización pero todavía no lo guarda
        producto,
        data=request.data
    )


    if serializer.is_valid(): #¿Los datos cumplen todas las reglas?

        serializer.save() #Se guardan los cambios y ocurre la verdadera actualización. Internamnete Django genera algo parecido a UPDATE PRODUCTOS SET nombre = "NuevoNombre", stock = 50 WHERE id_producto = 159 

        return Response(serializer.data) #Respuesta exitosa que devuelve el producto actualizado


    return Response( # Respuesta si existen errores. Se eejcuta únicamente cuando serialzier.is_valid() devuelve false, es decir, algún campo es invalido. Devolvienddo el aviso del campo invalido y el 400 Bad Request 
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

#======================================================

@api_view(["DELETE"]) #Función que acepta solamente peticiones DELETE
def eliminar_producto(request, id_producto):


    try:

        producto = Productos.objects.get( #Internamente Django genera algo parecido a SELECT * FROM PRODUCTOS WHERE id_producto = ?;
            id_producto=id_producto
        )


    except Productos.DoesNotExist: # Tenemos el manejo de errores

        return Response(
            {"error": "Producto no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )


    producto.delete() # Internamente Django genera DELETE FROM PRODUCTOS WHERE id_producto = ?;


    return Response( #Nos devuelve una respuesta exitosa 
        {"mensaje": "Producto eliminado correctamente"},
        status=status.HTTP_200_OK
    )

#======================================================

@api_view(["GET"]) # La función acepta el método HTTP GET
def listar_categorias(request):

    categorias = CategoriaProducto.objects.all() # Conseguimos todos las categorías 

    serializer = CategoriaProductoSerializer( # Convertimos los objetos 
        categorias,
        many=True
    )

    return Response(serializer.data) # Devolvemos JSON

#======================================================

@api_view(["GET"])
def obtener_categoria(request, id_categoria):

    try: # Intenta este bloque de código

        categoria = CategoriaProducto.objects.get( # Buscamos una categoría por su ID
            id_categoria=id_categoria
        )

    except CategoriaProducto.DoesNotExist: # Si falla el bloque anterior

        return Response( # Devolvemos un error informando 
            {"error": "Categoría no encontrada"}, 
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = CategoriaProductoSerializer( # Serializamos 
        categoria 
    )

    return Response(serializer.data)

#======================================================

@api_view(["POST"])
def crear_categoria(request):

    serializer = CategoriaProductoSerializer( 
        data=request.data # request.data contiene el JSON enviado por el cliente (React o en este caso ThunderClient)
    )

    if serializer.is_valid(): # Validamos los campos 

        serializer.save() # Guardamos 

        return Response( # Si sale bien mostramos la categoría creada 
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response( # Sino, mostramos los campos invalidos 
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

#======================================================

@api_view(["PUT"])
def actualizar_categoria(request, id_categoria):


    try: # Intenta el bloque de código

        categoria = CategoriaProducto.objects.get( # Busca la categoría por su id
            id_categoria=id_categoria
        )

    except CategoriaProducto.DoesNotExist: # Si la categoría no existe 

        return Response( # Nos informa del error
            {"error": "Categoría no encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )


    serializer = CategoriaProductoSerializer( # El serializer reemplaza los datos de la ctegoría existente por los nuevos dados 
        categoria,
        data=request.data
    )


    if serializer.is_valid(): # Valida los campos

        serializer.save() # Actualiza los cambios 

        return Response(serializer.data) # Muestre la categoría creada 


    return Response( # Devuelve un error si algo salió mal con la actualización 
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

#======================================================

@api_view(["DELETE"])
def eliminar_categoria(request, id_categoria):

    try:

        categoria = CategoriaProducto.objects.get(
            id_categoria=id_categoria
        )

    except CategoriaProducto.DoesNotExist:

        return Response(
            {"error": "Categoría no encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:

        categoria.delete()

    except IntegrityError: # Este bloque maneja errores de violación de integridad
        
        """Los errores causados por romper la integridad de la bbdd en MySQL, 
        Django los captura y los transforma en una excepción Python llamada IntegrityError"""

        return Response(
            {
                "error": "No se puede eliminar la categoría porque tiene productos asociados"
            },
            status=status.HTTP_409_CONFLICT
        )

    return Response(
        {"mensaje": "Categoría eliminada correctamente"},
        status=status.HTTP_200_OK
    )


