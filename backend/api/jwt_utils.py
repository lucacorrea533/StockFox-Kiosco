import jwt
import datetime

from django.conf import settings


ACCESS_MINUTES = 60 # Tiempo de duración del Access Token (en minutos)

REFRESH_DAYS = 7 # Tiempo de duración del Refresh Token (en días)


def generar_access_token(usuario, tipo):

    ahora = datetime.datetime.now(datetime.timezone.utc) # Obtiene la fecha y hora actual en UTC

    # Información que contendrá el token
    payload = {   
        # Guarda el ID según el tipo de usuario
        "id": usuario.id_usuario if tipo == "usuario" else usuario.id_alumno,

        "usuario": usuario.usuario,

        "nombre": usuario.nombre,

        "tipo": tipo,
        
        # Guarda el rol (Encargada o Ayudante). Los alumnos tendrán None
        "rol": getattr(usuario, "rol", None),
        # Fecha de expiración del token
        "exp": ahora + datetime.timedelta(minutes=ACCESS_MINUTES),
        # Fecha de emisión del token
        "iat": ahora,

    }
     # Genera el Access Token firmado con la SECRET_KEY
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )


def generar_refresh_token(usuario, tipo):
    
    # Obtiene la fecha y hora actual en UTC
    ahora = datetime.datetime.now(datetime.timezone.utc)

    # Información que contendrá el Refresh Token
    payload = {

        # Guarda el ID según el tipo de usuario
        "id": usuario.id_usuario if tipo == "usuario" else usuario.id_alumno,
        
        # Guarda el tipo de usuario
        "tipo": tipo,
        
        # Fecha de expiración del Refresh Token
        "exp": ahora + datetime.timedelta(days=REFRESH_DAYS),

        # Fecha de emisión del Refresh Token
        "iat": ahora,
    }

    # Genera el Refresh Token firmado con la SECRET_KEY
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )