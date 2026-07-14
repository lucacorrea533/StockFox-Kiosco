# El archivo urls.py define todas las rutas o endpoints de la API. 
# Su función es indicar qué función (vista) debe ejecutarse cuando el cliente realiza una solicitud a 
# una dirección determinada. 

from django.urls import path

from .views import (
    listar_productos,
    listar_productos_disponibles,
    obtener_producto,
    crear_producto,
    actualizar_producto,
    eliminar_producto,
    listar_categorias,
    obtener_categoria,
    crear_categoria,
    actualizar_categoria,
    eliminar_categoria,
    listar_pedidos,
    obtener_pedido,
    crear_pedido,
    actualizar_estado_pedido,
    detalle_pedido,
    registrar_venta,
    listar_ventas,
    obtener_venta,
    pedidos_alumno,
    pedidos_alumno_detalle,
    registrar_alumno,
    login,
    registro,
    listar_usuarios,
    listar_alumnos,
    crear_usuario,
    actualizar_usuario,
    eliminar_usuario,
    listar_gastos,
    crear_gasto,
    eliminar_gasto,
    resumen_ventas,
    notificaciones_encargada,
    obtener_menu_dia,
    guardar_menu_dia,
    eliminar_menu_dia,
    productos_stock_bajo,
)


urlpatterns = [
    path(
        "productos/", # Dirección solicitada por el frontend
        listar_productos, # Función/Vista que se ejecutará al acceder a esa URL
        name="listar_productos" # Nombre interno que Django utiliza para identificar esa ruta 
    ),
    
     path(
        "productos/<int:id_producto>/", # Aquí la URL recibe un parámetro de tipo (número entero)
        obtener_producto,
        name="obtener_producto"
    ),

    path(
    "productos/crear/",
    crear_producto,
    name="crear_producto"
    ),

    path(
    "productos/editar/<int:id_producto>/",
    actualizar_producto,
    name="actualizar_producto"
    ),

    path(
    "productos/eliminar/<int:id_producto>/",
    eliminar_producto,
    name="eliminar_producto"
   ),

   path(
    "productos/disponibles/",
    listar_productos_disponibles,
    name="listar_productos_disponibles"
   ),

   path(
    "categorias/",
    listar_categorias,
    name="listar_categorias"
   ),

   path(
    "categorias/<int:id_categoria>/",
    obtener_categoria,
    name="obtener_categoria"
   ),

   path(
    "categorias/crear/",
    crear_categoria,
    name="crear_categoria"
   ),

   path(
    "categorias/editar/<int:id_categoria>/",
    actualizar_categoria,
    name="actualizar_categoria"
   ),

   path(
    "categorias/eliminar/<int:id_categoria>/",
    eliminar_categoria,
    name="eliminar_categoria"
   ),

   path(
    "pedidos/",
    listar_pedidos,
    name="listar_pedidos"
   ),

   path(
    "pedidos/<int:id_pedido>/",
    obtener_pedido,
    name="obtener_pedido"
   ),

   path(
    "pedidos/alumno/<int:id_alumno>/",
    pedidos_alumno,
    name="pedidos_alumno"
  ),

   path(
    "pedidos/crear/",
    crear_pedido,
    name="crear_pedido"
   ),

   path(
    "pedidos/estado/<int:id_pedido>/",
    actualizar_estado_pedido,
    name="actualizar_estado_pedido"
   ),

   path(
    "pedidos/<int:id_pedido>/detalle/",
    detalle_pedido,
    name="detalle_pedido"
   ),

   path(
    "ventas/registrar",
    registrar_venta,
    name="registrar_venta"
   ),

   path(
    "ventas/",
    listar_ventas,
    name="listar_ventas"
   ),

   path(
    "ventas/<int:id_venta>/",
    obtener_venta,
    name="obtener_venta"
  ),

  path(
    "alumnos/<int:id_alumno>/pedidos/detalle/",
    pedidos_alumno_detalle,
    name="pedidos_alumno_detalle"
  ),

# Endpoint para iniciar sesión
path(
    "auth/login/",
    login,
    name="login"
  ),

# Endpoint para registrar un alumno (vista principal)
path(
    "auth/registro/",
    registro,
    name="registro"
),

path(
        "usuarios/",
        listar_usuarios,
        name="listar_usuarios"
    ),

    path(
        "alumnos/",
        listar_alumnos,
        name="listar_alumnos"
    ),

    path("usuarios/crear/", crear_usuario, name="crear_usuario"),
    path("usuarios/editar/<int:id_usuario>/", actualizar_usuario, name="actualizar_usuario"),
    path("usuarios/eliminar/<int:id_usuario>/", eliminar_usuario, name="eliminar_usuario"),
    path("gastos/", listar_gastos, name="listar_gastos"),
    path("gastos/crear/", crear_gasto, name="crear_gasto"),
    path("gastos/eliminar/<int:id_gasto>/", eliminar_gasto, name="eliminar_gasto"),
    path("informes/resumen-ventas/", resumen_ventas, name="resumen_ventas"),
    path("notificaciones/", notificaciones_encargada, name="notificaciones_encargada"),
    path("menu-dia/actual/", obtener_menu_dia, name="obtener_menu_dia"),
    path("menu-dia/guardar/", guardar_menu_dia, name="guardar_menu_dia"),
    path("menu-dia/eliminar/", eliminar_menu_dia, name="eliminar_menu_dia"),
    path("productos/stock-bajo/", productos_stock_bajo, name="productos_stock_bajo"),
]

