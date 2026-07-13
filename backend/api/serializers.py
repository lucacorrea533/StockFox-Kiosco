# El archivo serializers.py se encarga de convertir los datos entre los modelos de Django y el formato JSON que utiliza la API. 
# Además, valida que la información recibida desde el frontend sea correcta antes de guardarla en la base de datos. 
# Los serializers de DRF actúan como traductor entre el backend y el frontend
# Serializar: Acción de convertir objetos de Python o de la BBDD en JSON para enviarlos al frontend
# Deserializar: Convertir JSOn en objetos Python, validarlos y permitir guardarlos en la bbdd


from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers
from .models import (
    Productos,
    CategoriaProducto,
    Pedidos,
    DetallePedido,
    Ventas,
    DetalleVenta,
    Usuarios,
    Alumnos,
    GastosOperativos,
    MenuDia,
)


# Serialzier que convierte y valida la información de los productos

class ProductoSerializer(serializers.ModelSerializer):

    categoria = serializers.CharField(
        source="id_categoria.nombre",
        read_only=True
    )

    id_categoria = serializers.PrimaryKeyRelatedField(
    queryset=CategoriaProducto.objects.all()
)

    class Meta:
        model = Productos
        fields = [
            "id_categoria",
            "id_producto",
            "nombre",
            "precio_actual",
            "stock",
            "stock_minimo",
            "disponible",
            "foto_url",
            "stock_minimo",
            "disponible",
            "foto_url",
            "categoria",
            "id_categoria",
        ]


# Maneja las categorías de los productos

class CategoriaProductoSerializer(serializers.ModelSerializer):

    class Meta:
        model = CategoriaProducto
        fields = "__all__"


# Maneja el detalle de cada pedido

class DetallePedidoSerializer(serializers.ModelSerializer):

    class Meta:
        model = DetallePedido
        fields = "__all__"

# Devuelve los pedidos junto con información adicional como el alumno, el curso y los productos

class PedidoSerializer(serializers.ModelSerializer):

    alumno = serializers.SerializerMethodField()

    curso = serializers.SerializerMethodField()

    productos = serializers.SerializerMethodField()


    class Meta:

        model = Pedidos

        fields = [

            "id_pedido",

            "alumno",

            "curso",

            "horario_retiro",

            "estado",

            "total",

            "fecha_creacion",

            "productos"

        ]


    def get_alumno(self, obj):

        return f"{obj.id_alumno.nombre} {obj.id_alumno.apellido}"


    def get_curso(self, obj):

        return f"{obj.id_alumno.anio}°{obj.id_alumno.division}°"


    def get_productos(self, obj):

        detalles = DetallePedido.objects.filter(

            id_pedido=obj

        )

        return [

            {

                "nombre": detalle.id_producto.nombre,

                "cantidad": detalle.cantidad

            }

            for detalle in detalles

        ]

# Maneja las ventas

class VentaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ventas
        fields = "__all__"

# Maneja el detalle de cada venta

class DetalleVentaSerializer(serializers.ModelSerializer):

    class Meta:
        model = DetalleVenta
        fields = "__all__"

# Valida los prodcutos enviador al registrar una venta

class ProductoVentaSerializer(serializers.Serializer):

    id_producto = serializers.IntegerField()

    cantidad = serializers.IntegerField(
        min_value=1,
        error_messages={
            "min_value": "La cantidad debe ser mayor a cero."
        }
    )

# Valida toda la información necesaria para registrar una venta presencial

class RegistroVentaPresencialSerializer(serializers.Serializer):

    id_usuario = serializers.IntegerField()

    productos = ProductoVentaSerializer(
        many=True
    )

# Valida los datos de un alumno niuevo y cifra su contraseña antes de guardarla

class RegistroAlumnoSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True) # Campo que solo se utiliza para recibir la contraseña

    class Meta:
        model = Alumnos

        # Campos que se recibirán desde el frontend
        fields = [
            "nombre",
            "apellido",
            "anio",
            "division",
            "usuario",
            "password",
        ]

    def create(self, validated_data):
        
        # Extrae la contraseña para no guardarla en texto plano
        password = validated_data.pop("password")

        # Crea el alumno guardando la contraseña encriptada
        alumno = Alumnos.objects.create(
            **validated_data,
            pin_hash=make_password(password)
        )

        return alumno

# Valida el usuario y la contraseña durante el inicio de sesión 

class LoginSerializer(serializers.Serializer):
    
    # Usuario ingresado en el login
    usuario = serializers.CharField()
    # Contraseña ingresada en el login
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        # Obtiene los datos enviados por el usuario
        usuario = data["usuario"]
        password = data["password"]

        # Buscar en USUARIOS (Encargada o Ayudante)
        try:
            user = Usuarios.objects.get(usuario=usuario)

            # Comprueba que la contraseña sea correcta
            if check_password(password, user.contrasena_hash):
                return {
                    "tipo": "usuario",
                    "usuario": user
                }

        # Si no existe, continúa buscando en alumnos
        except Usuarios.DoesNotExist:
            pass

        # Buscar en ALUMNOS
        try:
            alumno = Alumnos.objects.get(usuario=usuario)

            # Comprueba que la contraseña sea correcta
            if check_password(password, alumno.pin_hash):
                return {
                    "tipo": "alumno",
                    "usuario": alumno
                }

        # Si no existe, continúa hasta lanzar el error
        except Alumnos.DoesNotExist:
            pass

        # Si no encontró ningún usuario válido
        raise serializers.ValidationError(
            "Usuario o contraseña incorrectos."
        )

# Convierte la información de los usuarios del personal

class UsuarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Usuarios
        fields = ["id_usuario", "nombre", "apellido", "usuario", "rol"]

# Convierte la infromación de los alumnos y agrega el curso

class AlumnoSerializer(serializers.ModelSerializer):

    curso = serializers.SerializerMethodField()

    class Meta:
        model = Alumnos
        fields = ["id_alumno", "nombre", "apellido", "usuario", "anio", "division", "curso"]

    def get_curso(self, obj):
        return f"{obj.anio}°{obj.division}°"

# Valida y crea nuevos usuarios del personal

class CrearUsuarioSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuarios
        fields = ["id_usuario", "nombre", "apellido", "usuario", "rol", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Usuarios.objects.create(
            **validated_data,
            contrasena_hash=make_password(password)
        )
        return usuario

# Valida y actualiza los datos de un usuario existente

class ActualizarUsuarioSerializer(serializers.ModelSerializer):

    # La contraseña es opcional al editar: si no se manda, se conserva la actual
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuarios
        fields = ["nombre", "apellido", "usuario", "password"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)

        if password:
            instance.contrasena_hash = make_password(password)

        instance.save()
        return instance
    
# Maneja los gastos operativos

class GastoOperativoSerializer(serializers.ModelSerializer):

    class Meta:
        model = GastosOperativos
        fields = ["id_gasto", "descripcion", "monto", "fecha", "categoria"]

# Maneja la información del menú del día 

class MenuDiaSerializer(serializers.ModelSerializer):

    class Meta:
        model = MenuDia
        fields = ["id_menu", "descripcion", "precio", "fecha"]
        read_only_fields = ["id_menu", "fecha"]