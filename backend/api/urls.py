# urls.py define todas las rutas (endpoints) de la API.
# Cada path() conecta una URL con la vista (función) que se ejecuta al acceder a ella.
# Las rutas están agrupadas por módulo funcional para facilitar su lectura.

from django.urls import path

from .views import (
    # Productos
    listar_productos, listar_productos_disponibles, obtener_producto,
    crear_producto, actualizar_producto, cambiar_activo_producto, eliminar_producto, productos_stock_bajo,
    # Categorías
    listar_categorias, obtener_categoria, crear_categoria,
    actualizar_categoria, eliminar_categoria,
    # Pedidos
    listar_pedidos, obtener_pedido, crear_pedido, actualizar_estado_pedido,
    detalle_pedido, pedidos_alumno, pedidos_alumno_detalle,
    # Ventas
    registrar_venta, listar_ventas, obtener_venta,
    # Autenticación
    login, registro,
    # Usuarios y alumnos (gestión del personal)
    listar_usuarios, listar_alumnos, listar_cursos, crear_usuario, actualizar_usuario, eliminar_usuario, cambiar_activo_usuario,
    cambiar_activo_alumno, eliminar_alumno, resetear_pin_alumno,
    # Gastos operativos
    listar_gastos, crear_gasto, eliminar_gasto,
    # Informes y notificaciones
    resumen_ventas, notificaciones_encargada,
    # Menú del día
    obtener_menu_dia, guardar_menu_dia, eliminar_menu_dia,
    # Cursos únicos de alumnos
    listar_usuarios, listar_alumnos, listar_cursos, crear_usuario, actualizar_usuario, eliminar_usuario,
)


urlpatterns = [

    # ── PRODUCTOS ────────────────────────────────────────────────────────────
    path("productos/", listar_productos, name="listar_productos"),
    path("productos/disponibles/", listar_productos_disponibles, name="listar_productos_disponibles"),
    path("productos/stock-bajo/", productos_stock_bajo, name="productos_stock_bajo"),
    path("productos/<int:id_producto>/", obtener_producto, name="obtener_producto"),
    path("productos/crear/", crear_producto, name="crear_producto"),
    path("productos/editar/<int:id_producto>/", actualizar_producto, name="actualizar_producto"),
    path("productos/eliminar/<int:id_producto>/", eliminar_producto, name="eliminar_producto"),
    path("productos/activo/<int:id_producto>/", cambiar_activo_producto, name="cambiar_activo_producto"),

    # ── CATEGORÍAS ───────────────────────────────────────────────────────────
    path("categorias/", listar_categorias, name="listar_categorias"),
    path("categorias/<int:id_categoria>/", obtener_categoria, name="obtener_categoria"),
    path("categorias/crear/", crear_categoria, name="crear_categoria"),
    path("categorias/editar/<int:id_categoria>/", actualizar_categoria, name="actualizar_categoria"),
    path("categorias/eliminar/<int:id_categoria>/", eliminar_categoria, name="eliminar_categoria"),

    # ── PEDIDOS ──────────────────────────────────────────────────────────────
    path("pedidos/", listar_pedidos, name="listar_pedidos"),
    path("pedidos/<int:id_pedido>/", obtener_pedido, name="obtener_pedido"),
    path("pedidos/<int:id_pedido>/detalle/", detalle_pedido, name="detalle_pedido"),
    path("pedidos/crear/", crear_pedido, name="crear_pedido"),
    path("pedidos/estado/<int:id_pedido>/", actualizar_estado_pedido, name="actualizar_estado_pedido"),
    path("pedidos/alumno/<int:id_alumno>/", pedidos_alumno, name="pedidos_alumno"),
    path("alumnos/", listar_alumnos, name="listar_alumnos"),
    path("alumnos/cursos/", listar_cursos, name="listar_cursos"),
    path("alumnos/activo/<int:id_alumno>/", cambiar_activo_alumno, name="cambiar_activo_alumno"),
    path("alumnos/eliminar/<int:id_alumno>/", eliminar_alumno, name="eliminar_alumno"),
    path("alumnos/resetear-pin/<int:id_alumno>/", resetear_pin_alumno, name="resetear_pin_alumno"),
    path("alumnos/<int:id_alumno>/pedidos/detalle/", pedidos_alumno_detalle, name="pedidos_alumno_detalle"),

    # ── VENTAS ───────────────────────────────────────────────────────────────
    path("ventas/registrar", registrar_venta, name="registrar_venta"),
    path("ventas/", listar_ventas, name="listar_ventas"),
    path("ventas/<int:id_venta>/", obtener_venta, name="obtener_venta"),

    # ── AUTENTICACIÓN ────────────────────────────────────────────────────────
    path("auth/login/", login, name="login"),
    path("auth/registro/", registro, name="registro"),  # Alta + login automático (devuelve tokens)

    # ── USUARIOS Y ALUMNOS (gestión del personal) ───────────────────────────
    path("usuarios/", listar_usuarios, name="listar_usuarios"),
    path("usuarios/crear/", crear_usuario, name="crear_usuario"),
    path("usuarios/editar/<int:id_usuario>/", actualizar_usuario, name="actualizar_usuario"),
    path("usuarios/eliminar/<int:id_usuario>/", eliminar_usuario, name="eliminar_usuario"),
    path("usuarios/activo/<int:id_usuario>/", cambiar_activo_usuario, name="cambiar_activo_usuario"),
    path("alumnos/", listar_alumnos, name="listar_alumnos"),

    # ── GASTOS OPERATIVOS ────────────────────────────────────────────────────
    path("gastos/", listar_gastos, name="listar_gastos"),
    path("gastos/crear/", crear_gasto, name="crear_gasto"),
    path("gastos/eliminar/<int:id_gasto>/", eliminar_gasto, name="eliminar_gasto"),

    # ── INFORMES Y NOTIFICACIONES ────────────────────────────────────────────
    path("informes/resumen-ventas/", resumen_ventas, name="resumen_ventas"),
    path("notificaciones/", notificaciones_encargada, name="notificaciones_encargada"),

    # ── MENÚ DEL DÍA ─────────────────────────────────────────────────────────
    path("menu-dia/actual/", obtener_menu_dia, name="obtener_menu_dia"),
    path("menu-dia/guardar/", guardar_menu_dia, name="guardar_menu_dia"),
    path("menu-dia/eliminar/", eliminar_menu_dia, name="eliminar_menu_dia"),
]