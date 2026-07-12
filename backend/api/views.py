from rest_framework.decorators import api_view # Transforma una función común en endpoint REST.
from rest_framework.response import Response #Devuelve JSON

from rest_framework import status 
# Nos permite escribir status=status.HTTP_201_CREATED en lugar de memorizar números

# Funciones para generar los tokens JWT
from .jwt_utils import (
    generar_access_token,
    generar_refresh_token,
)

from django.utils import timezone # Para usar la función timezone.now() que devuelve fecha y hora actual

from django.db import IntegrityError 


 #IntegrityError es una Excepción que Django lanza cuando una operación 
 #rompe alguna regla de integridad de la base de datos.

from django.db import transaction


from .models import (
    Productos,
    CategoriaProducto,
    Pedidos,
    DetallePedido,
    Alumnos,
    Ventas,
    DetalleVenta,
    Usuarios
)#Consulta los modelos de la bbdd

from .serializers import ( # Importamos los serializadores que convertirán objetos a JSON
    ProductoSerializer,
    CategoriaProductoSerializer,
    PedidoSerializer,
    DetallePedidoSerializer,
    VentaSerializer,
    DetalleVentaSerializer,
    RegistroVentaPresencialSerializer,
    VentaSerializer,
    RegistroAlumnoSerializer,
    LoginSerializer
)

#=====================================================================================
# Decoradores para autenticación y control de permisos
from .auth import (
    login_requerido,
    roles_permitidos,
    solo_alumno
)

@api_view(["GET"])
@login_requerido
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

#=====================================================================================

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


#=====================================================================================

@api_view(["POST"]) # Acepta únicamente peticiones HTTP POST
@login_requerido # Verifica que el usuario haya iniciado sesión mediante un token válido
@roles_permitidos("Encargada") # Permite acceder únicamente a usuarios con el rol Encargada
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

#=====================================================================================

@api_view(["PUT"]) #Esta función será un endpoint REST y solamente aceptará peticiones PUT
@login_requerido
@roles_permitidos("Encargada")
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

        if producto.stock > 0:

            producto.disponible = True

        else:

            producto.disponible = False

        producto.save()

        return Response(serializer.data) #Respuesta exitosa que devuelve el producto actualizado
    
    return Response( # Respuesta si existen errores. Se eejcuta únicamente cuando serialzier.is_valid() devuelve false, es decir, algún campo es invalido. Devolvienddo el aviso del campo invalido y el 400 Bad Request 
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

#=====================================================================================

@api_view(["DELETE"])#Función que acepta solamente peticiones DELETE
@login_requerido
@roles_permitidos("Encargada")
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

#=====================================================================================

@api_view(["GET"]) # La función acepta el método HTTP GET
def listar_categorias(request):

    categorias = CategoriaProducto.objects.all() # Conseguimos todos las categorías 

    serializer = CategoriaProductoSerializer( # Convertimos los objetos 
        categorias,
        many=True
    )

    return Response(serializer.data) # Devolvemos JSON

#=====================================================================================

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

#=====================================================================================

@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada")
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

#=====================================================================================

@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada")
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

#=====================================================================================

@api_view(["DELETE"])
@login_requerido
@roles_permitidos("Encargada")
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


#=====================================================================================

@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def listar_pedidos(request):

    pedidos = Pedidos.objects.all()

    serializer = PedidoSerializer(
        pedidos,
        many=True
    )

    return Response(serializer.data)


#=====================================================================================

@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def obtener_pedido(request, id_pedido):

    try:

        pedido = Pedidos.objects.get(
            id_pedido=id_pedido
        )

    except Pedidos.DoesNotExist:

        return Response(
            {"error": "Pedido no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = PedidoSerializer(
        pedido
    )

    return Response(serializer.data)


#=====================================================================================

@api_view(["POST"])
@transaction.atomic
@login_requerido
@solo_alumno
def crear_pedido(request):

    id_alumno = request.data.get("id_alumno")

    horario_retiro = request.data.get("horario_retiro")

    productos = request.data.get("productos")

    try:

        alumno = Alumnos.objects.get(
            id_alumno=id_alumno
        )

    except Alumnos.DoesNotExist:

        return Response(
            {"error": "Alumno no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    total_pedido = 0

    for item in productos:

        id_producto = item["id_producto"]

        try:

            producto = Productos.objects.get(
                id_producto=id_producto
            )

        except Productos.DoesNotExist:

            return Response(
                {
                    "error": f"El producto {id_producto} no existe"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        cantidad = item["cantidad"]

        if cantidad > producto.stock:

            return Response(
                {
                    "error": f"Stock insuficiente para el producto {producto.nombre}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        subtotal = producto.precio_actual * cantidad

        total_pedido += subtotal

    pedido = Pedidos.objects.create(

        id_alumno=alumno,

        horario_retiro=horario_retiro,

        estado="pendiente",

        total=total_pedido,

        fecha_creacion=timezone.now()
    )

    for item in productos:

        producto = Productos.objects.get(
            id_producto=item["id_producto"]
        )

        DetallePedido.objects.create(

            id_pedido=pedido,

            id_producto=producto,

            cantidad=item["cantidad"],

            precio_unitario=producto.precio_actual
        )

        producto.stock -= item["cantidad"]

        if producto.stock > 0:

            producto.disponible = 1

        else:

            producto.disponible = 0

        producto.save()

    return Response(
        {
            "mensaje": "Pedido creado correctamente",
            "id_pedido": pedido.id_pedido,
            "total": total_pedido
        },
        status=status.HTTP_201_CREATED
    )

#=====================================================================================

@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def actualizar_estado_pedido(request, id_pedido):

    try:

        pedido = Pedidos.objects.get( # Buscamos el pedido
            id_pedido=id_pedido
        )

    except Pedidos.DoesNotExist:

        return Response(
            {"error": "Pedido no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    nuevo_estado = request.data.get("estado") # Lee el nuevo estado y lo guarda en la variable 

    estados_validos = [ # Validamos el estado (tienen que ser alguno de estos)
        "pendiente",
        "listo",
        "entregado"
    ]

    if nuevo_estado not in estados_validos:

        return Response(
            {
                "error": "Estado inválido"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    pedido.estado = nuevo_estado # Guardamos los cambios 

    pedido.save()

    return Response(
        {
            "mensaje": "Estado actualizado correctamente",
            "id_pedido": pedido.id_pedido,
            "estado": pedido.estado
        }
    )

#=====================================================================================

@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def detalle_pedido(request, id_pedido):

    try:

        pedido = Pedidos.objects.get(
            id_pedido=id_pedido
        )

    except Pedidos.DoesNotExist:

        return Response(
            {"error": "Pedido no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    detalles = DetallePedido.objects.filter(
        id_pedido=pedido
    )

    productos = []

    for detalle in detalles:

        productos.append(
            {
                "producto": detalle.id_producto.nombre,
                "cantidad": detalle.cantidad,
                "precio_unitario": detalle.precio_unitario
            }
        )

    return Response(
        {
            "id_pedido": pedido.id_pedido,
            "estado": pedido.estado,
            "total": pedido.total,
            "productos": productos
        }
    )

#=====================================================================================

@api_view(["GET"])
def pedidos_alumno(request, id_alumno):

    try:

        alumno = Alumnos.objects.get(
            id_alumno=id_alumno
        )

    except Alumnos.DoesNotExist:

        return Response(
            {
                "error": "Alumno no encontrado."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    pedidos = Pedidos.objects.filter(
        id_alumno=alumno
    ).order_by("-fecha_creacion")

    serializer = PedidoSerializer(
        pedidos,
        many=True
    )

    return Response(serializer.data)

#=====================================================================================

@api_view(["GET"])
def pedidos_alumno_detalle(request, id_alumno):

    try:

        alumno = Alumnos.objects.get(  #Buscamo al alumno
            id_alumno=id_alumno
        )

    except Alumnos.DoesNotExist:

        return Response( #Si ocurre algún error devolvemos un 404
            {"error": "Alumno no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    pedidos = Pedidos.objects.filter( #luego de conseguir al alumno, obtenemos sus pedidos 
        id_alumno=alumno
    )

    resultado = [] # Se crea una lista vacía donde se guardará la respuesta 

    for pedido in pedidos: # Recorremos los pedidos del alumno 

        detalles = DetallePedido.objects.filter( # Y para cada pedido buscamos sus detalles 
            id_pedido=pedido
        )

        productos = [] # Luego creamos otra lsita vacía que contenga los productos de tal pedido 

        for detalle in detalles: # Recorremos cada detalle 

            productos.append( # Vamos agregando los productos que tengan tal detalle 
                {
                    "producto": detalle.id_producto.nombre,
                    "cantidad": detalle.cantidad,
                    "precio_unitario": detalle.precio_unitario
                }
            )

        resultado.append( # Luego agregamos ese pedido completo 
            {
                "id_pedido": pedido.id_pedido,
                "estado": pedido.estado,
                "horario_retiro": pedido.horario_retiro,
                "total": pedido.total,
                "fecha_creacion": pedido.fecha_creacion,
                "productos": productos
            }
        )

    return Response(resultado) # DRF finalmente transforma automáticametne esa lista de diccionarios en JSON 

#=====================================================================================

@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def registrar_venta(request):

    serializer = RegistroVentaPresencialSerializer(
        data=request.data
    )

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    datos = serializer.validated_data

    with transaction.atomic():

        productos = datos["productos"]

        # ==========================================
        # Validaciones
        # ==========================================

        for producto in productos:

            producto_db = Productos.objects.filter(
                id_producto=producto["id_producto"]
            ).first()

            if producto_db is None:

                return Response(
                    {
                        "error": f"El producto con ID {producto['id_producto']} no existe."
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            if producto["cantidad"] <= 0:

                return Response(
                    {
                        "error": "La cantidad debe ser mayor a cero."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if producto_db.stock < producto["cantidad"]:

                return Response(
                    {
                        "error": f"No hay stock suficiente para '{producto_db.nombre}'."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ==========================================
        # Validar usuario
        # ==========================================

        usuario = Usuarios.objects.filter(
            id_usuario=datos["id_usuario"]
        ).first()

        if usuario is None:

            return Response(
                {
                    "error": "El usuario no existe."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ==========================================
        # Crear venta
        # ==========================================

        venta = Ventas.objects.create(

            id_usuario=usuario,

            fecha_hora=timezone.now(),

            total=0
        )

        total_venta = 0

        alertas_stock = []

        # ==========================================
        # Crear detalles y descontar stock
        # ==========================================

        for producto in productos:

            producto_db = Productos.objects.get(
                id_producto=producto["id_producto"]
            )

            DetalleVenta.objects.create(

                id_venta=venta,

                id_producto=producto_db,

                cantidad=producto["cantidad"],

                precio_unitario=producto_db.precio_actual
            )

            producto_db.stock -= producto["cantidad"]

            producto_db.save()

            if producto_db.stock <= producto_db.stock_minimo:

                alertas_stock.append(
                    f"El producto '{producto_db.nombre}' alcanzó el stock mínimo."
                )

            total_venta += (
                producto_db.precio_actual * producto["cantidad"]
            )

        venta.total = total_venta

        venta.save()

    return Response(
        {
            "mensaje": "Venta registrada correctamente.",
            "id_venta": venta.id_venta,
            "total": venta.total,
            "alertas_stock": alertas_stock
        },
        status=status.HTTP_201_CREATED
    )

#=====================================================================================

@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def listar_ventas(request):

    ventas = Ventas.objects.all()

    serializer = VentaSerializer(
        ventas,
        many=True
    )

    return Response(serializer.data)

#=====================================================================================

@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def obtener_venta(request, id_venta):

    try:

        venta = Ventas.objects.get(
            id_venta=id_venta
        )

    except Ventas.DoesNotExist:

        return Response(
            {
                "error": "Venta no encontrada."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    detalles = DetalleVenta.objects.filter(
        id_venta=venta
    )

    serializer_venta = VentaSerializer(
        venta
    )

    serializer_detalles = DetalleVentaSerializer(
        detalles,
        many=True
    )

    return Response(
        {
            "venta": serializer_venta.data,
            "detalles": serializer_detalles.data
        },
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
def registrar_alumno(request):

    serializer = RegistroAlumnoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            {"mensaje": "Alumno registrado correctamente"},
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(["POST"])
def login(request):

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    datos = serializer.validated_data
    usuario = datos["usuario"]
    tipo = datos["tipo"]

    access = generar_access_token(usuario, tipo)
    refresh = generar_refresh_token(usuario, tipo)

    return Response({

    "access": access,
    "refresh": refresh,
    "tipo": tipo,
    "nombre": usuario.nombre,
    "usuario": usuario.usuario,
    "rol": getattr(usuario, "rol", None)
})

@api_view(["POST"])
def registro(request):

    serializer = RegistroAlumnoSerializer(data=request.data)

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    alumno = serializer.save()

    access = generar_access_token(alumno, "alumno")
    refresh = generar_refresh_token(alumno, "alumno")

    return Response(
        {
            "mensaje": "Alumno registrado correctamente.",
            "access": access,
            "refresh": refresh,
            "tipo": "alumno",
            "usuario": alumno.usuario,
            "nombre": alumno.nombre,
        },
        status=status.HTTP_201_CREATED
    )