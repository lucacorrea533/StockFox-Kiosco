import jwt
from functools import wraps
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings

def verificar_token(request):
    
    auth = request.headers.get("Authorization") # Obtiene el contenido del header Authorization

    if not auth: # Si no existe el header, no hay token
        return None

    if not auth.startswith("Bearer "):# Verifica que el token tenga el formato Bearer
        return None

    token = auth.split(" ")[1] # Extrae únicamente el token

    try:
        # Decodifica el token utilizando la SECRET_KEY
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload # Devuelve la información almacenada en el token
    except jwt.ExpiredSignatureError:
        return None # El token expiró
    except jwt.InvalidTokenError:
        return None # El token es inválido
    


def login_requerido(view):

    @wraps(view)# Conserva el nombre y propiedades de la función original
    
    def wrapper(request, *args, **kwargs):

        payload = verificar_token(request)# Verifica que el usuario tenga un token válido

        if payload is None:

            return Response(
                {"error": "Token inválido o inexistente."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        request.usuario = payload # Guarda la información del usuario para usarla en la vista

        return view(request, *args, **kwargs) # Ejecuta la vista original

    return wrapper

def solo_encargada(view):

    @wraps(view)
    def wrapper(request, *args, **kwargs):

        usuario = request.usuario # Obtiene los datos del usuario autenticado
         # Verifica que sea un usuario del personal
        if usuario["tipo"] != "usuario":
            return Response(
                {"error": "No autorizado."},
                status=status.HTTP_403_FORBIDDEN
            )
        # Verifica que el rol sea Encargada
        if usuario["rol"] != "Encargada":
            return Response(
                {"error": "Solo la encargada puede realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN
            )
        # Permite acceder a la vista
        return view(request, *args, **kwargs)

    return wrapper


def roles_permitidos(*roles):
    
    def decorator(view): # Recibe uno o varios roles permitidos

        @wraps(view)
        def wrapper(request, *args, **kwargs):

            usuario = request.usuario # Obtiene el usuario autenticado

            # Verifica que sea un usuario del personal
            if usuario["tipo"] != "usuario":
                return Response(
                    {"error": "No autorizado."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Comprueba que el rol esté entre los permitidos
            if usuario["rol"] not in roles:
                return Response(
                    {"error": "No tiene permisos para realizar esta acción."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Ejecuta la vista si tiene permisos
            return view(request, *args, **kwargs)

        return wrapper

    return decorator


def solo_alumno(view):

    @wraps(view)
    def wrapper(request, *args, **kwargs):
        # Verifica que el usuario autenticado sea un alumno
        if request.usuario["tipo"] != "alumno":
            return Response(
                {"error": "Solo los alumnos pueden acceder."},
                status=status.HTTP_403_FORBIDDEN
            )
        # Permite ejecutar la vista
        return view(request, *args, **kwargs)

    return wrapper