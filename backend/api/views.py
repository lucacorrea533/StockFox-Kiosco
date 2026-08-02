# views.py contiene toda la lógica de la API: cada función recibe una solicitud HTTP,
# realiza el trabajo correspondiente (consultar/crear/modificar datos) y devuelve una respuesta JSON.
# Las vistas están agrupadas por módulo: productos, categorías, pedidos, ventas,
# autenticación, usuarios/alumnos, gastos, informes, notificaciones y menú del día.

import datetime  # Para calcular rangos de fecha (ej: "últimos 7 días")

from rest_framework.decorators import api_view       # Convierte una función en endpoint REST
from rest_framework.response import Response          # Devuelve la respuesta en formato JSON
from rest_framework import status                      # Códigos HTTP legibles (200, 404, etc.)

from django.utils import timezone
from django.db import IntegrityError, transaction
from django.db.models import Sum, F

from .jwt_utils import generar_access_token, generar_refresh_token
from .auth import login_requerido, roles_permitidos, solo_alumno

from .models import (
    Productos, CategoriaProducto, Pedidos, DetallePedido, Alumnos,
    Ventas, DetalleVenta, Usuarios, GastosOperativos, MenuDia,
)
from .serializers import (
    ProductoSerializer, CategoriaProductoSerializer, PedidoSerializer,
    DetalleVentaSerializer, VentaSerializer, RegistroVentaPresencialSerializer,
    RegistroAlumnoSerializer, LoginSerializer, UsuarioSerializer, AlumnoSerializer,
    CrearUsuarioSerializer, ActualizarUsuarioSerializer, GastoOperativoSerializer,
    MenuDiaSerializer,
)


# ════════════════════════════════════════════════════════════════════════════
# PRODUCTOS
# ════════════════════════════════════════════════════════════════════════════

# GET /productos/ → lista completa de productos (uso interno, requiere sesión)
@api_view(["GET"])
@login_requerido
def listar_productos(request):
    """Devuelve todos los productos (uso interno, con sesión iniciada)."""
    productos = Productos.objects.all()
    return Response(ProductoSerializer(productos, many=True).data)


# GET /productos/disponibles/ → catálogo público (solo productos con stock)
@api_view(["GET"])
def listar_productos_disponibles(request):
    """Devuelve solo los productos visibles para la venta (catálogo público)."""
    productos = Productos.objects.filter(disponible=1, activo=1, stock__gt=0)
    return Response(ProductoSerializer(productos, many=True).data)


# GET /productos/<id>/ → detalle de un producto puntual
@api_view(["GET"])
def obtener_producto(request, id_producto):
    """Devuelve un producto puntual por su ID."""
    try:
        producto = Productos.objects.get(id_producto=id_producto)
    except Productos.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=404)

    return Response(ProductoSerializer(producto).data)


# POST /productos/crear/ → alta de producto (solo Encargada)
@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada")
def crear_producto(request):
    """Crea un producto nuevo. Solo la Encargada puede hacerlo."""
    serializer = ProductoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /productos/editar/<id>/ → edición de producto (solo Encargada)
@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada")
def actualizar_producto(request, id_producto):
    """Actualiza un producto existente y recalcula su disponibilidad según el stock."""
    try:
        producto = Productos.objects.get(id_producto=id_producto)
    except Productos.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductoSerializer(producto, data=request.data)

    if serializer.is_valid():
        serializer.save()

        # Disponible = TRUE únicamente si queda stock
        producto.disponible = producto.stock > 0
        producto.save()

        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# PUT /productos/activo/<id>/ → activa/desactiva un producto sin eliminarlo (solo Encargada)
@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada")
def cambiar_activo_producto(request, id_producto):
    """
    Activa o desactiva un producto sin borrarlo de la base. A diferencia de
    'disponible' (que lo controla automáticamente el stock), este campo es
    100% manual: al desactivar, el producto se oculta del catálogo público
    pero conserva su historial de precios y ventas anteriores.
    """
    try:
        producto = Productos.objects.get(id_producto=id_producto)
    except Productos.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    nuevo_valor = request.data.get("activo")
    if nuevo_valor is None:
        return Response({"error": "Falta el campo 'activo'"}, status=status.HTTP_400_BAD_REQUEST)

    producto.activo = bool(nuevo_valor)
    producto.save()

    return Response({
        "mensaje": "Estado actualizado correctamente",
        "id_producto": producto.id_producto,
        "activo": producto.activo,
    })

# DELETE /productos/eliminar/<id>/ → baja definitiva de producto (solo Encargada)
@api_view(["DELETE"])
@login_requerido
@roles_permitidos("Encargada")
def eliminar_producto(request, id_producto):
    """Elimina un producto de forma definitiva."""
    try:
        producto = Productos.objects.get(id_producto=id_producto)
    except Productos.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    producto.delete()
    return Response({"mensaje": "Producto eliminado correctamente"}, status=status.HTTP_200_OK)


# GET /productos/stock-bajo/ → productos que necesitan reposición
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def productos_stock_bajo(request):
    """Devuelve los productos cuyo stock llegó al mínimo o lo cruzó (alerta de reposición)."""
    productos = Productos.objects.filter(disponible=1, stock__lte=F("stock_minimo"))

    data = [
        {"id": p.id_producto, "nombre": p.nombre, "stock": p.stock, "stock_minimo": p.stock_minimo}
        for p in productos
    ]
    return Response(data)


# ════════════════════════════════════════════════════════════════════════════
# CATEGORÍAS
# ════════════════════════════════════════════════════════════════════════════

# GET /categorias/ → lista completa de categorías
@api_view(["GET"])
def listar_categorias(request):
    """Devuelve todas las categorías de productos."""
    categorias = CategoriaProducto.objects.all()
    return Response(CategoriaProductoSerializer(categorias, many=True).data)


# GET /categorias/<id>/ → detalle de una categoría puntual
@api_view(["GET"])
def obtener_categoria(request, id_categoria):
    """Devuelve una categoría puntual por su ID."""
    try:
        categoria = CategoriaProducto.objects.get(id_categoria=id_categoria)
    except CategoriaProducto.DoesNotExist:
        return Response({"error": "Categoría no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    return Response(CategoriaProductoSerializer(categoria).data)


# POST /categorias/crear/ → alta de categoría (solo Encargada)
@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada")
def crear_categoria(request):
    """Crea una categoría nueva."""
    serializer = CategoriaProductoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /categorias/editar/<id>/ → edición de categoría (solo Encargada)
@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada")
def actualizar_categoria(request, id_categoria):
    """Actualiza el nombre de una categoría existente."""
    try:
        categoria = CategoriaProducto.objects.get(id_categoria=id_categoria)
    except CategoriaProducto.DoesNotExist:
        return Response({"error": "Categoría no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    serializer = CategoriaProductoSerializer(categoria, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /categorias/eliminar/<id>/ → baja de categoría (solo Encargada; falla si tiene productos)
@api_view(["DELETE"])
@login_requerido
@roles_permitidos("Encargada")
def eliminar_categoria(request, id_categoria):
    """Elimina una categoría. Falla si todavía tiene productos asociados (FK)."""
    try:
        categoria = CategoriaProducto.objects.get(id_categoria=id_categoria)
    except CategoriaProducto.DoesNotExist:
        return Response({"error": "Categoría no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    try:
        categoria.delete()
    except IntegrityError:
        # Django convierte la violación de integridad de MySQL en esta excepción
        return Response(
            {"error": "No se puede eliminar la categoría porque tiene productos asociados"},
            status=status.HTTP_409_CONFLICT,
        )

    return Response({"mensaje": "Categoría eliminada correctamente"}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════════════════════
# PEDIDOS
# ════════════════════════════════════════════════════════════════════════════

# GET /pedidos/ → lista completa de pedidos (personal)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def listar_pedidos(request):
    """Devuelve todos los pedidos registrados."""
    pedidos = Pedidos.objects.all()
    return Response(PedidoSerializer(pedidos, many=True).data)


# GET /pedidos/<id>/ → detalle de un pedido puntual (personal)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def obtener_pedido(request, id_pedido):
    """Devuelve un pedido puntual por su ID."""
    try:
        pedido = Pedidos.objects.get(id_pedido=id_pedido)
    except Pedidos.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    return Response(PedidoSerializer(pedido).data)


# POST /pedidos/crear/ → alumno crea un pedido anticipado (valida stock y descuenta)
@api_view(["POST"])
@transaction.atomic
@login_requerido
@solo_alumno
def crear_pedido(request):
    """
    Crea un pedido anticipado para el alumno autenticado.
    Valida stock, calcula el total, descuenta stock y actualiza disponibilidad.
    """
    id_alumno = request.data.get("id_alumno")
    horario_retiro = request.data.get("horario_retiro")
    productos = request.data.get("productos")

    try:
        alumno = Alumnos.objects.get(id_alumno=id_alumno)
    except Alumnos.DoesNotExist:
        return Response({"error": "Alumno no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # ── Validación de stock y cálculo del total ────────────────────────────
    total_pedido = 0

    for item in productos:
        try:
            producto = Productos.objects.get(id_producto=item["id_producto"])
        except Productos.DoesNotExist:
            return Response(
                {"error": f"El producto {item['id_producto']} no existe"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if item["cantidad"] > producto.stock:
            return Response(
                {"error": f"Stock insuficiente para el producto {producto.nombre}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_pedido += producto.precio_actual * item["cantidad"]

    # ── Creación del pedido ──────────────────────────────────────────────
    pedido = Pedidos.objects.create(
        id_alumno=alumno,
        horario_retiro=horario_retiro,
        estado="pendiente",
        total=total_pedido,
        fecha_creacion=timezone.now(),
    )

    # ── Detalle del pedido + descuento de stock ─────────────────────────
    for item in productos:
        producto = Productos.objects.get(id_producto=item["id_producto"])

        DetallePedido.objects.create(
            id_pedido=pedido,
            id_producto=producto,
            cantidad=item["cantidad"],
            precio_unitario=producto.precio_actual,
        )

        producto.stock -= item["cantidad"]
        producto.disponible = producto.stock > 0
        producto.save()

    return Response(
        {"mensaje": "Pedido creado correctamente", "id_pedido": pedido.id_pedido, "total": total_pedido},
        status=status.HTTP_201_CREATED,
    )


# PUT /pedidos/estado/<id>/ → cambia el estado del pedido; al entregarlo, genera la venta
@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def actualizar_estado_pedido(request, id_pedido):
    """
    Cambia el estado de un pedido (pendiente / listo / entregado).
    Al marcarlo como "entregado" por primera vez, se registra también como venta
    para que impacte en los informes.
    """
    try:
        pedido = Pedidos.objects.get(id_pedido=id_pedido)
    except Pedidos.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get("estado")
    estados_validos = ["pendiente", "en_preparacion", "listo", "entregado"]

    if nuevo_estado not in estados_validos:
        return Response({"error": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

    estado_anterior = pedido.estado
    pedido.estado = nuevo_estado
    pedido.save()

    # Registrar la venta real solo en la transición hacia "entregado"
    if nuevo_estado == "entregado" and estado_anterior != "entregado":
        usuario = Usuarios.objects.filter(id_usuario=request.usuario["id"]).first()

        if usuario is not None:
            with transaction.atomic():
                venta = Ventas.objects.create(
                    id_usuario=usuario, fecha_hora=timezone.now(), total=pedido.total
                )

                for detalle in DetallePedido.objects.filter(id_pedido=pedido):
                    DetalleVenta.objects.create(
                        id_venta=venta,
                        id_producto=detalle.id_producto,
                        cantidad=detalle.cantidad,
                        precio_unitario=detalle.precio_unitario,
                    )

    return Response({"mensaje": "Estado actualizado correctamente", "id_pedido": pedido.id_pedido, "estado": pedido.estado})



# GET /pedidos/<id>/detalle/ → productos que componen un pedido
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def detalle_pedido(request, id_pedido):
    """Devuelve un pedido junto con la lista de productos que lo componen."""
    try:
        pedido = Pedidos.objects.get(id_pedido=id_pedido)
    except Pedidos.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    productos = [
        {"producto": d.id_producto.nombre, "cantidad": d.cantidad, "precio_unitario": d.precio_unitario}
        for d in DetallePedido.objects.filter(id_pedido=pedido)
    ]

    return Response(
        {"id_pedido": pedido.id_pedido, "estado": pedido.estado, "total": pedido.total, "productos": productos}
    )


# GET /pedidos/alumno/<id_alumno>/ → historial de pedidos de un alumno (sin detalle de productos)
@api_view(["GET"])
def pedidos_alumno(request, id_alumno):
    """Devuelve los pedidos de un alumno, del más reciente al más antiguo."""
    try:
        alumno = Alumnos.objects.get(id_alumno=id_alumno)
    except Alumnos.DoesNotExist:
        return Response({"error": "Alumno no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    pedidos = Pedidos.objects.filter(id_alumno=alumno).order_by("-fecha_creacion")
    return Response(PedidoSerializer(pedidos, many=True).data)


# GET /alumnos/<id_alumno>/pedidos/detalle/ → historial de pedidos de un alumno CON detalle
@api_view(["GET"])
def pedidos_alumno_detalle(request, id_alumno):
    """Devuelve los pedidos de un alumno junto con el detalle de productos de cada uno."""
    try:
        alumno = Alumnos.objects.get(id_alumno=id_alumno)
    except Alumnos.DoesNotExist:
        return Response({"error": "Alumno no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    resultado = []

    for pedido in Pedidos.objects.filter(id_alumno=alumno):
        productos = [
            {"producto": d.id_producto.nombre, "cantidad": d.cantidad, "precio_unitario": d.precio_unitario}
            for d in DetallePedido.objects.filter(id_pedido=pedido)
        ]

        resultado.append({
            "id_pedido": pedido.id_pedido,
            "estado": pedido.estado,
            "horario_retiro": pedido.horario_retiro,
            "total": pedido.total,
            "fecha_creacion": pedido.fecha_creacion,
            "productos": productos,
        })

    return Response(resultado)


# ════════════════════════════════════════════════════════════════════════════
# VENTAS
# ════════════════════════════════════════════════════════════════════════════

# POST /ventas/registrar → venta de mostrador (contado, sin pedido previo)
@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def registrar_venta(request):
    """
    Registra una venta de mostrador (contado, sin pedido previo).
    Valida stock, descuenta unidades y avisa si algún producto llegó al mínimo.
    """
    serializer = RegistroVentaPresencialSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    datos = serializer.validated_data

    with transaction.atomic():
        productos = datos["productos"]

        # ── Validaciones previas (existencia, cantidad, stock) ─────────────
        for producto in productos:
            producto_db = Productos.objects.filter(id_producto=producto["id_producto"]).first()

            if producto_db is None:
                return Response(
                    {"error": f"El producto con ID {producto['id_producto']} no existe."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if producto["cantidad"] <= 0:
                return Response({"error": "La cantidad debe ser mayor a cero."}, status=status.HTTP_400_BAD_REQUEST)

            if producto_db.stock < producto["cantidad"]:
                return Response(
                    {"error": f"No hay stock suficiente para '{producto_db.nombre}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        usuario = Usuarios.objects.filter(id_usuario=datos["id_usuario"]).first()
        if usuario is None:
            return Response({"error": "El usuario no existe."}, status=status.HTTP_404_NOT_FOUND)

        # ── Creación de la venta ────────────────────────────────────────────
        venta = Ventas.objects.create(id_usuario=usuario, fecha_hora=timezone.now(), total=0)
        total_venta = 0
        alertas_stock = []

        # ── Detalle de venta + descuento de stock ──────────────────────────
        for producto in productos:
            producto_db = Productos.objects.get(id_producto=producto["id_producto"])

            DetalleVenta.objects.create(
                id_venta=venta, id_producto=producto_db,
                cantidad=producto["cantidad"], precio_unitario=producto_db.precio_actual,
            )

            producto_db.stock -= producto["cantidad"]
            producto_db.save()

            if producto_db.stock <= producto_db.stock_minimo:
                alertas_stock.append(f"El producto '{producto_db.nombre}' alcanzó el stock mínimo.")

            total_venta += producto_db.precio_actual * producto["cantidad"]

        venta.total = total_venta
        venta.save()

    return Response(
        {"mensaje": "Venta registrada correctamente.", "id_venta": venta.id_venta, "total": venta.total, "alertas_stock": alertas_stock},
        status=status.HTTP_201_CREATED,
    )


# GET /ventas/ → lista completa de ventas
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def listar_ventas(request):
    """Devuelve todas las ventas registradas."""
    ventas = Ventas.objects.all()
    return Response(VentaSerializer(ventas, many=True).data)


# GET /ventas/<id>/ → detalle de una venta puntual
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def obtener_venta(request, id_venta):
    """Devuelve una venta puntual junto con su detalle de productos."""
    try:
        venta = Ventas.objects.get(id_venta=id_venta)
    except Ventas.DoesNotExist:
        return Response({"error": "Venta no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    detalles = DetalleVenta.objects.filter(id_venta=venta)

    return Response(
        {"venta": VentaSerializer(venta).data, "detalles": DetalleVentaSerializer(detalles, many=True).data},
        status=status.HTTP_200_OK,
    )


# ════════════════════════════════════════════════════════════════════════════
# AUTENTICACIÓN
# ════════════════════════════════════════════════════════════════════════════

# POST (sin ruta activa) → alta de alumno sin login automático
@api_view(["POST"])
def registrar_alumno(request):
    """Alta de un alumno sin login automático (queda disponible por si se necesita a futuro)."""
    serializer = RegistroAlumnoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"mensaje": "Alumno registrado correctamente"}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# POST /auth/login/ → login de personal o alumno, devuelve tokens JWT
@api_view(["POST"])
def login(request):
    """Valida usuario/contraseña (personal o alumno) y devuelve el par de tokens JWT."""
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    datos = serializer.validated_data
    usuario = datos["usuario"]
    tipo = datos["tipo"]

    return Response({
        "access": generar_access_token(usuario, tipo),
        "refresh": generar_refresh_token(usuario, tipo),
        "tipo": tipo,
        "id": usuario.id_usuario if tipo == "usuario" else usuario.id_alumno,
        "nombre": usuario.nombre,
        "usuario": usuario.usuario,
        "rol": getattr(usuario, "rol", None),
    })


# POST /auth/registro/ → autorregistro de alumno con login automático
@api_view(["POST"])
def registro(request):
    """Autorregistro de alumnos: crea la cuenta y devuelve los tokens (login automático)."""
    serializer = RegistroAlumnoSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    alumno = serializer.save()

    return Response({
        "mensaje": "Alumno registrado correctamente.",
        "access": generar_access_token(alumno, "alumno"),
        "refresh": generar_refresh_token(alumno, "alumno"),
        "tipo": "alumno",
        "id": alumno.id_alumno,
        "usuario": alumno.usuario,
        "nombre": alumno.nombre,
    }, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════════════════════════
# USUARIOS Y ALUMNOS (gestión del personal, a cargo de la Encargada)
# ════════════════════════════════════════════════════════════════════════════

# GET /usuarios/ → lista del personal (solo Encargada)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada")
def listar_usuarios(request):
    """Devuelve todo el personal (Encargada + Ayudantes)."""
    usuarios = Usuarios.objects.all()
    return Response(UsuarioSerializer(usuarios, many=True).data)


# GET /alumnos/ → lista de alumnos registrados (solo Encargada)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada")
def listar_alumnos(request):
    """Devuelve todos los alumnos registrados."""
    alumnos = Alumnos.objects.all()
    return Response(AlumnoSerializer(alumnos, many=True).data)

# GET /alumnos/cursos/ → lista de cursos únicos existentes (Encargada y Ayudante, sin datos sensibles)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def listar_cursos(request):
    """Devuelve los cursos únicos (año + división combinados, ej. '2°2°') de todos los alumnos registrados."""
    combinaciones = Alumnos.objects.values_list("anio", "division").distinct()
    cursos = sorted({f"{anio}°{division}°" for anio, division in combinaciones})
    return Response(cursos)

# POST /usuarios/crear/ → alta de Ayudante (solo Encargada)
@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada")
def crear_usuario(request):
    """Crea un nuevo miembro del personal. Siempre se crea con rol Ayudante."""
    datos = request.data.copy()
    datos["rol"] = "Ayudante"  # El rol Encargada no se puede asignar desde acá

    serializer = CrearUsuarioSerializer(data=datos)

    if serializer.is_valid():
        usuario = serializer.save()
        return Response(UsuarioSerializer(usuario).data, status=status.HTTP_201_CREATED)  # No expone la contraseña

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /usuarios/editar/<id>/ → edición de usuario del personal (solo Encargada)
@api_view(["PUT"])
@login_requerido
@roles_permitidos("Encargada")
def actualizar_usuario(request, id_usuario):
    """Actualiza datos de un usuario del personal. La contraseña es opcional (partial=True)."""
    try:
        usuario = Usuarios.objects.get(id_usuario=id_usuario)
    except Usuarios.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ActualizarUsuarioSerializer(usuario, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(UsuarioSerializer(usuario).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /usuarios/eliminar/<id>/ → baja de usuario del personal (solo Encargada)
@api_view(["DELETE"])
@login_requerido
@roles_permitidos("Encargada")
def eliminar_usuario(request, id_usuario):
    """Elimina un miembro del personal. La Encargada no puede eliminarse a sí misma ni a otra Encargada."""
    try:
        usuario = Usuarios.objects.get(id_usuario=id_usuario)
    except Usuarios.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if usuario.rol == "Encargada":
        return Response({"error": "No se puede eliminar a una Encargada"}, status=status.HTTP_403_FORBIDDEN)

    usuario.delete()
    return Response({"mensaje": "Usuario eliminado correctamente"}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════════════════════
# GASTOS OPERATIVOS
# ════════════════════════════════════════════════════════════════════════════

# GET /gastos/ → lista de gastos operativos (personal)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def listar_gastos(request):
    """Devuelve los gastos operativos, del más reciente al más antiguo."""
    gastos = GastosOperativos.objects.all().order_by("-fecha")
    return Response(GastoOperativoSerializer(gastos, many=True).data)


# POST /gastos/crear/ → registrar un gasto operativo (personal)
@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def crear_gasto(request):
    """Registra un gasto operativo asociado al usuario autenticado (según el token)."""
    try:
        usuario = Usuarios.objects.get(id_usuario=request.usuario["id"])
    except Usuarios.DoesNotExist:
        return Response({"error": "Usuario no válido"}, status=status.HTTP_404_NOT_FOUND)

    serializer = GastoOperativoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(id_usuario=usuario)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /gastos/eliminar/<id>/ → eliminar gasto operativo (solo Encargada)
@api_view(["DELETE"])
@login_requerido
@roles_permitidos("Encargada")
def eliminar_gasto(request, id_gasto):
    """Elimina un gasto operativo."""
    try:
        gasto = GastosOperativos.objects.get(id_gasto=id_gasto)
    except GastosOperativos.DoesNotExist:
        return Response({"error": "Gasto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    gasto.delete()
    return Response({"mensaje": "Gasto eliminado correctamente"}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════════════════════
# INFORMES
# ════════════════════════════════════════════════════════════════════════════

# GET /informes/resumen-ventas/?periodo=dia|semana|mes → dashboard de InformeVentas
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def resumen_ventas(request):
    """
    Arma el dashboard de InformeVentas: totales del período, ventas por día (gráfico
    de barras), facturación por categoría (gráfico de torta) y ranking de productos.
    Período configurable por query param: dia | semana (default) | mes.
    """
    periodo = request.GET.get("periodo", "semana")
    ahora = timezone.now()

    if periodo == "dia":
        desde = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    elif periodo == "mes":
        desde = ahora - datetime.timedelta(days=30)
    else:
        desde = ahora - datetime.timedelta(days=7)

    # ── Totales generales ────────────────────────────────────────────────
    ventas = Ventas.objects.filter(fecha_hora__gte=desde)
    total_vendido = ventas.aggregate(total=Sum("total"))["total"] or 0
    cantidad_ventas = ventas.count()

    gastos = GastosOperativos.objects.filter(fecha__gte=desde.date())
    total_gastos = gastos.aggregate(total=Sum("monto"))["total"] or 0

    ganancia_neta = float(total_vendido) - float(total_gastos)

    # ── Ventas por día (gráfico de barras) ──────────────────────────────
    ventas_por_dia = {}
    for venta in ventas:
        dia = venta.fecha_hora.strftime("%d/%m")
        ventas_por_dia[dia] = ventas_por_dia.get(dia, 0) + float(venta.total)

    barras = [{"dia": k, "valor": v} for k, v in ventas_por_dia.items()]

    # ── Facturación por categoría (gráfico de torta) ────────────────────
    detalles = DetalleVenta.objects.filter(id_venta__in=ventas)

    por_categoria = {}
    for detalle in detalles:
        categoria = detalle.id_producto.id_categoria.nombre
        subtotal = float(detalle.cantidad * detalle.precio_unitario)
        por_categoria[categoria] = por_categoria.get(categoria, 0) + subtotal

    total_categorias = sum(por_categoria.values()) or 1
    colores = ["#5c2d0a", "#bf5902", "#e8813a", "#ffaa6f", "#ffe3cf"]

    torta = [
        {"label": cat, "porcentaje": round((valor / total_categorias) * 100), "color": colores[i % len(colores)]}
        for i, (cat, valor) in enumerate(por_categoria.items())
    ]

    # ── Ranking de productos más vendidos (top 5) ───────────────────────
    ranking = {}
    for detalle in detalles:
        nombre = detalle.id_producto.nombre
        ranking[nombre] = ranking.get(nombre, 0) + detalle.cantidad

    top = sorted(ranking.items(), key=lambda x: x[1], reverse=True)[:5]
    top_formateado = [{"pos": i + 1, "nombre": nombre, "unidades": cantidad} for i, (nombre, cantidad) in enumerate(top)]

    return Response({
        "total_vendido": total_vendido,
        "cantidad_ventas": cantidad_ventas,
        "total_gastos": total_gastos,
        "ganancia_neta": ganancia_neta,
        "barras": barras,
        "torta": torta,
        "top": top_formateado,
    })


# ════════════════════════════════════════════════════════════════════════════
# NOTIFICACIONES
# ════════════════════════════════════════════════════════════════════════════

# GET /notificaciones/ → alertas de stock bajo y pedidos pendientes (personal)
@api_view(["GET"])
@login_requerido
@roles_permitidos("Encargada", "Ayudante")
def notificaciones_encargada(request):
    """Arma la lista de alertas: stock bajo mínimo y pedidos pendientes de entrega."""
    productos_bajo = Productos.objects.filter(disponible=1, stock__lte=F("stock_minimo"))

    alertas = [
        f"Stock bajo: '{p.nombre}' tiene {p.stock} unidades (mínimo {p.stock_minimo})."
        for p in productos_bajo
    ]

    pendientes = Pedidos.objects.filter(estado="pendiente").count()
    if pendientes > 0:
        plural = "s" if pendientes != 1 else ""
        alertas.append(f"Hay {pendientes} pedido{plural} pendiente{plural} por entregar.")

    return Response({"alertas": alertas})


# ════════════════════════════════════════════════════════════════════════════
# MENÚ DEL DÍA
# ════════════════════════════════════════════════════════════════════════════

# GET /menu-dia/actual/ → menú del día vigente (público, sin login)
@api_view(["GET"])
def obtener_menu_dia(request):
    """Devuelve el menú del día más reciente (o null si no hay ninguno cargado)."""
    menu = MenuDia.objects.order_by("-fecha", "-id_menu").first()

    if menu is None:
        return Response(None)

    return Response(MenuDiaSerializer(menu).data)


# POST /menu-dia/guardar/ → carga el menú del día (solo Encargada, reemplaza el anterior)
@api_view(["POST"])
@login_requerido
@roles_permitidos("Encargada")
def guardar_menu_dia(request):
    """Carga el menú del día. Solo puede existir un menú activo a la vez (reemplaza al anterior)."""
    try:
        usuario = Usuarios.objects.get(id_usuario=request.usuario["id"])
    except Usuarios.DoesNotExist:
        return Response({"error": "Usuario no válido"}, status=status.HTTP_404_NOT_FOUND)

    serializer = MenuDiaSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    MenuDia.objects.all().delete()  # Solo puede existir un menú del día activo a la vez
    menu = serializer.save(id_usuario=usuario, fecha=timezone.now().date())

    return Response(MenuDiaSerializer(menu).data, status=status.HTTP_201_CREATED)


# DELETE /menu-dia/eliminar/ → elimina el menú del día activo (solo Encargada)
@api_view(["DELETE"])
@login_requerido
@roles_permitidos("Encargada")
def eliminar_menu_dia(request):
    """Elimina el menú del día activo."""
    MenuDia.objects.all().delete()
    return Response({"mensaje": "Menú del día eliminado correctamente"}, status=status.HTTP_200_OK)