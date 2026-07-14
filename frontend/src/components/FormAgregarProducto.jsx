/* Este componente es un formulario para agregar o editar productos en la sección de gestión de productos. Permite ingresar el nombre, precio, categoría, stock inicial y una foto del producto. Valida los campos antes de enviar los datos al componente padre a través de la función onGuardar. También muestra errores de validación debajo de cada campo si es necesario. */

// Hooks de React: useState para el estado del formulario, useEffect para reaccionar cuando cambia el producto a editar
import { useState, useEffect } from 'react'
// Ícono que se muestra en el botón de subir foto
import iconSubir from '../assets/icons/SubiralgoBoton.png'
// Estilos compartidos con la vista de Gestión de Productos
import '../styles/GestionProductos.css'

// Objeto que representa el estado "vacío" del formulario, usado para inicializar o resetear
const FORM_VACIO = {
  nombre: '',
  precio: '',
  categoria: '',
  stock: '',
  stock_minimo: '',
  foto: null,
  fotoPreview: null,
}

// Componente de formulario; recibe la lista de categorías, el producto a editar (si existe),
// y las funciones onGuardar/onCancelar para comunicarse con el componente padre
function FormAgregarProducto({ categorias, productoEditar, onGuardar, onCancelar }) {
  // Estado con los valores actuales de los campos del formulario
  const [form, setForm]       = useState(FORM_VACIO)
  // Estado con los mensajes de error de validación, uno por campo
  const [errores, setErrores] = useState({})

  // Efecto que se dispara cada vez que cambia "productoEditar"
  useEffect(() => {
    // Si se está editando un producto existente, precargamos el formulario con sus datos
    if (productoEditar) {
      setForm({
        nombre:      productoEditar.nombre,
        precio:      productoEditar.precio,
        categoria:   productoEditar.categoria,
        stock:       productoEditar.stock ?? '',       // Si stock es null/undefined, usamos string vacío
        stock_minimo: productoEditar.stock_minimo ?? '', // Ídem para stock mínimo
        foto:        null,                              // El archivo de foto nunca se precarga (no tenemos el File original)
        fotoPreview: productoEditar.foto_url || null,    // Pero sí mostramos la URL de la foto ya guardada
      })
    } else {
      // Si no hay producto para editar (se está agregando uno nuevo), reseteamos el formulario
      setForm(FORM_VACIO)
    }
  }, [productoEditar])

  // Maneja los cambios en los inputs de texto/número/select genéricos
  function handleChange(e) {
    const { name, value } = e.target
    // Actualizamos únicamente el campo correspondiente, manteniendo el resto del form igual
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiamos el error de ese campo en particular, ya que el usuario lo está corrigiendo
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  // Maneja la selección de una imagen desde el input de tipo file
  function handleFoto(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    // Generamos una URL temporal en memoria para poder previsualizar la imagen antes de subirla
    const preview = URL.createObjectURL(archivo)
    setForm((prev) => ({ ...prev, foto: archivo, fotoPreview: preview }))
  }

  // Valida los campos obligatorios del formulario y devuelve un objeto con los errores encontrados
  function validar() {
    const nuevosErrores = {}
    if (!form.nombre.trim())               nuevosErrores.nombre    = 'El nombre es obligatorio.'
    if (!form.precio || form.precio <= 0)  nuevosErrores.precio    = 'Ingresá un precio válido.'
    if (!form.categoria)                   nuevosErrores.categoria = 'Seleccioná una categoría.'
    if (form.stock_minimo === '' || form.stock_minimo < 0) nuevosErrores.stock_minimo = 'Ingresá un stock mínimo válido.'
    if (form.stock === '' || form.stock < 0) nuevosErrores.stock   = 'Ingresá un stock válido.'
    return nuevosErrores
  }

  // Se ejecuta al hacer click en "Guardar"
  function handleSubmit() {
    // Primero validamos los campos
    const erroresEncontrados = validar()
    // Si hay algún error, lo mostramos en pantalla y cortamos la ejecución (no se guarda nada)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    // Si todo está OK, armamos el objeto final a enviar al componente padre
    const payload = {
      // Si estamos editando, incluimos el id del producto original; si no, no se incluye (producto nuevo)
      ...(productoEditar ? { id: productoEditar.id } : {}),
      nombre:    form.nombre.trim(),
      precio:    Number(form.precio),      // Convertimos a número por si vino como string
      categoria: form.categoria,
      stock:     Number(form.stock),
      stock_minimo: Number(form.stock_minimo),
      foto_url:  form.fotoPreview,
    }
    // Delegamos el guardado real al componente padre, pasándole los datos ya validados
    onGuardar(payload)
  }

  return (
    // Sección contenedora de todo el formulario
    <section className="fap-section">
      {/* Título dinámico: cambia según si se está agregando o editando un producto */}
      <h3 className="fap-titulo">
        {productoEditar ? 'Editar Producto' : 'Agregar Producto'}
      </h3>

      {/* Grilla que organiza visualmente los distintos campos del formulario */}
      <div className="fap-grid">

        {/* Campo: Nombre del producto */}
        <div className="fap-campo fap-campo--nombre">
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Alfajor Milka"
          />
          {/* Mensaje de error, solo se muestra si existe */}
          {errores.nombre && <span className="fap-error">{errores.nombre}</span>}
        </div>

        {/* Campo: Precio, con símbolo $ */}
        <div className="fap-campo">
          <label>Precio *</label>
          <div className="fap-precio-wrapper">
            <span className="fap-precio-simbolo">$</span>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>
          {errores.precio && <span className="fap-error">{errores.precio}</span>}
        </div>

        {/* Campo: Categoría, desplegable con las categorías recibidas por props */}
        <div className="fap-campo">
          <label>Categoría *</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
          >
            <option value="">Seleccionar</option>

            {/* Recorremos el listado de categorías para generar las opciones del select */}
            {categorias.map((cat) => (
              <option
                key={cat.id_categoria}
                value={cat.nombre}
              >
                {cat.nombre}
              </option>
            ))}
          </select>
          {errores.categoria && <span className="fap-error">{errores.categoria}</span>}
        </div>

        {/* Campo: Stock inicial */}
        <div className="fap-campo">
          <label>Stock Inicial *</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
          {errores.stock && <span className="fap-error">{errores.stock}</span>}
        </div>
         
        {/* Campo: Stock mínimo (umbral para disparar la alerta de stock bajo) */}
        <div className="fap-campo">
          <label>Stock mínimo *</label>

          <input
            type="number"
            name="stock_minimo"
            value={form.stock_minimo}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />

          {errores.stock_minimo && (
            <span className="fap-error">
              {errores.stock_minimo}
            </span>
          )}
        </div>

        {/* Campo: Foto del producto */}
        <div className="fap-campo fap-campo--foto">
          <label>Foto (JPG o PNG)</label>
          {/* Label estilizado que actúa como botón visual para disparar el input file oculto */}
          <label className="fap-foto-label">
            <img src={iconSubir} alt="Subir foto" className="fap-icono-subir" />
            {/* Muestra el nombre del archivo seleccionado, o un texto genérico si no hay ninguno */}
            <span className="fap-foto-texto">
              {form.foto ? form.foto.name : 'Seleccionar imagen'}
            </span>
            {/* Input real de tipo file, oculto visualmente pero funcional */}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFoto}
              style={{ display: 'none' }}
            />
          </label>
          {/* Botón para quitar la foto seleccionada, solo aparece si hay una preview cargada */}
          {form.fotoPreview && (
            <button
              className="fap-btn-quitar-foto"
              onClick={() => setForm((prev) => ({ ...prev, foto: null, fotoPreview: null }))}
            >
              Quitar foto
            </button>
          )}
        </div>

      </div>

      {/* Botones de acción: cancelar (vuelve atrás sin guardar) y guardar (valida y envía) */}
      <div className="fap-botones">
        <button className="fap-btn fap-btn--cancelar" onClick={onCancelar}>Cancelar</button>
        <button className="fap-btn fap-btn--guardar"  onClick={handleSubmit}>Guardar</button>
      </div>
    </section>
  )
}

export default FormAgregarProducto