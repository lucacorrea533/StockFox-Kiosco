# urls.py es el archivo encargado de definir las rutas del proyecto
# Recibe cada solicitud que llega al servidor y decide a qué parte del programa debe enviarla para ser atendida

# Se definen las herramientas necesarias para definir las rutas del proyecto 
from django.contrib import admin # Importa el panel de administrador que incorpora Django, gracias a esto podemos acceder a administrador mediante URL

from django.urls import include, path # path definir rutas y el include sirve para delegar rutas a otro archivo 

# Lista que contiene todas las rutas principales del proyecto.
# Cada vez que llega una solcitud, Django revisa esta lista para encontrar una ruta que coincida con la dirección solicitada 
urlpatterns = [
    path("admin/", admin.site.urls), # Ruta que activa el panel de administración de Django

    path(
        "api/",
        include("api.urls") # Cuando una solicitud comienza con /api/ django no la procesa directamente 
        # En cambio, la envía al archivo api/urls.py para que allí se siga buscando la ruta específica
    ),
]
