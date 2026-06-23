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
    detalle_pedido
)


urlpatterns = [
    path(
        "productos/",
        listar_productos,
        name="listar_productos"
    ),
    
     path(
        "productos/<int:id_producto>/",
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
]

