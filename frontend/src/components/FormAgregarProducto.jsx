/* Este componente es un formulario para agregar o editar productos en la sección de gestión de productos. Permite ingresar el nombre, precio, categoría, stock inicial y una foto del producto. Valida los campos antes de enviar los datos al componente padre a través de la función onGuardar. También muestra errores de validación debajo de cada campo si es necesario. */

import { useState, useEffect } from 'react'
import iconSubir from '../assets/icons/SubiralgoBoton.png'
import '../styles/GestionProductos.css'

const FORM_VACIO = {
  nombre: '',
  precio: '',
  categoria: '',
  stock: '',
  stock_minimo: '',
  foto: null,
  fotoPreview: null,
}

function FormAgregarProducto({ categorias, productoEditar, onGuardar, onCancelar }) {
  const [form, setForm]       = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (productoEditar) {
      setForm({
        nombre:      productoEditar.nombre,
        precio:      productoEditar.precio,
        categoria:   productoEditar.categoria,
        stock:       productoEditar.stock ?? '',
        stock_minimo: productoEditar.stock_minimo ?? '',
        foto:        null,
        fotoPreview: productoEditar.foto_url || null,
      })
    } else {
      setForm(FORM_VACIO)
    }
  }, [productoEditar])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  function handleFoto(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    const preview = URL.createObjectURL(archivo)
    setForm((prev) => ({ ...prev, foto: archivo, fotoPreview: preview }))
  }

  function validar() {
    const nuevosErrores = {}
    if (!form.nombre.trim())               nuevosErrores.nombre    = 'El nombre es obligatorio.'
    if (!form.precio || form.precio <= 0)  nuevosErrores.precio    = 'Ingresá un precio válido.'
    if (!form.categoria)                   nuevosErrores.categoria = 'Seleccioná una categoría.'
    if (form.stock_minimo === '' || form.stock_minimo < 0) nuevosErrores.stock_minimo = 'Ingresá un stock mínimo válido.'
    if (form.stock === '' || form.stock < 0) nuevosErrores.stock   = 'Ingresá un stock válido.'
    return nuevosErrores
  }

  function handleSubmit() {
    const erroresEncontrados = validar()
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    const payload = {
      ...(productoEditar ? { id: productoEditar.id } : {}),
      nombre:    form.nombre.trim(),
      precio:    Number(form.precio),
      categoria: form.categoria,
      stock:     Number(form.stock),
      stock_minimo: Number(form.stock_minimo),
      foto_url:  form.fotoPreview,
    }
    onGuardar(payload)
  }

  return (
    <section className="fap-section">
      <h3 className="fap-titulo">
        {productoEditar ? 'Editar Producto' : 'Agregar Producto'}
      </h3>

      <div className="fap-grid">

        {/* Nombre */}
        <div className="fap-campo fap-campo--nombre">
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Alfajor Milka"
          />
          {errores.nombre && <span className="fap-error">{errores.nombre}</span>}
        </div>

        {/* Precio con símbolo $ */}
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

        {/* Categoría */}
        <div className="fap-campo">
          <label>Categoría *</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
          >
            <option value="">Seleccionar</option>

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

        {/* Stock */}
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
         
        {/* Stock mínimo */}
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

        {/* Foto */}
        <div className="fap-campo fap-campo--foto">
          <label>Foto (JPG o PNG)</label>
          <label className="fap-foto-label">
            <img src={iconSubir} alt="Subir foto" className="fap-icono-subir" />
            <span className="fap-foto-texto">
              {form.foto ? form.foto.name : 'Seleccionar imagen'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFoto}
              style={{ display: 'none' }}
            />
          </label>
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

      <div className="fap-botones">
        <button className="fap-btn fap-btn--cancelar" onClick={onCancelar}>Cancelar</button>
        <button className="fap-btn fap-btn--guardar"  onClick={handleSubmit}>Guardar</button>
      </div>
    </section>
  )
}

export default FormAgregarProducto