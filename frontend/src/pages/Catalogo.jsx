/* Este archivo es el corazón del catálogo, donde se muestra la lista de productos disponibles para comprar. Acá se implementa la lógica para filtrar por categorías, buscar por nombre y agregar productos al carrito. */

import { useState, useEffect, useRef } from 'react'
import NavbarAlumno from '../components/NavbarAlumno'
import CardProducto from '../components/CardProducto'
import iconBuscador from '../assets/icons/BuscadorBoton.png'
import iconCarrito from '../assets/icons/VentasBoton.png'
import btnTodos from '../assets/icons/Todos.png'
import btnSnacks from '../assets/icons/Snacks.png'
import btnBebidas from '../assets/icons/Bebidas.png'
import btnAlfajores from '../assets/icons/Alfajores.png'
import btnDulces from '../assets/icons/Dulces.png'
import btnBocados from '../assets/icons/Bocados.png'
import btnBebCalientes from '../assets/icons/Beb.Calientes.png'
import btnServicios from '../assets/icons/Servicios.png'
import hor1 from '../assets/icons/Horario1.png'
import hor2 from '../assets/icons/Horario2.png'
import hor3 from '../assets/icons/Horario3.png'
import hor4 from '../assets/icons/Horario4.png'
import hor5 from '../assets/icons/Horario5.png'
import hor6 from '../assets/icons/Horario6.png'
import hor7 from '../assets/icons/Horario7.png'
import hor8 from '../assets/icons/Horario8.png'
import hor9 from '../assets/icons/Horario9.png'
import hor10 from '../assets/icons/Horario10.png'
import hor11 from '../assets/icons/Horario11.png'
import hor12 from '../assets/icons/Horario12.png'
import iconCheck from '../assets/icons/SimboloCheck.png'
import iconReloj from '../assets/icons/Reloj.png'
import iconAdvertencia from '../assets/icons/Advertencia.png'
import iconEliminar from '../assets/icons/EliminarBoton.png'
import '../styles/Catalogo.css'

// Determina si el producto es un Servicio sin foto
function esServicioSinFoto(p) {
  return p.categoria === 'Servicios' && !p.imagen
}

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
const categorias = [
  { nombre: 'Todos',          imagen: btnTodos },
  { nombre: 'Snacks',         imagen: btnSnacks },
  { nombre: 'Bebidas',        imagen: btnBebidas },
  { nombre: 'Alfajores',      imagen: btnAlfajores },
  { nombre: 'Dulces',         imagen: btnDulces },
  { nombre: 'Bocados',        imagen: btnBocados },
  { nombre: 'Beb. Calientes', imagen: btnBebCalientes },
  { nombre: 'Servicios',      imagen: btnServicios },
]

// ── DATOS DE PRODUCTOS REALES ─────────────────────────────
const productosPrueba = [
  { id: 1,   nombre: 'Saladix Jamón',             categoria: 'Snacks', precio: 3000, imagen: '/images/SaladixJamon.webp',         stock: 20, descripcion: 'Palitos de maíz sabor jamón.',         variantes: null },
  { id: 2,   nombre: 'Saladix Pizza',             categoria: 'Snacks', precio: 3000, imagen: '/images/SaladixPizza.webp',         stock: 20, descripcion: 'Palitos de maíz sabor pizza.',         variantes: null },
  { id: 3,   nombre: 'Nikitos Pizzitos',          categoria: 'Snacks', precio: 2800, imagen: '/images/NikitosPizzitos.webp',      stock: 20, descripcion: 'Snacks de maíz sabor pizza.',          variantes: null },
  { id: 4,   nombre: 'Nikitos Tutucas',           categoria: 'Snacks', precio: 2800, imagen: '/images/NikitosTutucas.webp',      stock: 20, descripcion: 'Snacks de maíz sabor tutucas.',        variantes: null },
  { id: 130, nombre: 'Nikitos Papas Fritas',      categoria: 'Snacks', precio: 2800, imagen: '/images/NikitosPapasFritas.webp',  stock: 20, descripcion: 'Snacks sabor papas fritas.',           variantes: null },
  { id: 5,   nombre: 'Krachitos Tradicionales',   categoria: 'Snacks', precio: 3500, imagen: '/images/KrachitosTradicional.png',stock: 15, descripcion: 'Palitos de maíz tradicionales.',      variantes: null },
  { id: 6,   nombre: 'Krachitos Americanas',      categoria: 'Snacks', precio: 3500, imagen: '/images/KrachitosAmericanos.png', stock: 15, descripcion: 'Palitos de maíz americanas.',         variantes: null },
  { id: 7,   nombre: 'Quento Papas Fritas Cheddar',        categoria: 'Snacks', precio: 2200, imagen: '/images/QuentoPapasFritasCheddar.webp',      stock: 20, descripcion: 'Papas fritas Quento sabor cheddar.',        variantes: null },
  { id: 201, nombre: 'Quento Papas Fritas Crema',          categoria: 'Snacks', precio: 2200, imagen: '/images/QuentoPapasFritasCrema.webp',        stock: 15, descripcion: 'Papas fritas Quento sabor crema.',          variantes: null },
  { id: 202, nombre: 'Quento Papas Fritas Jamón Serrano',  categoria: 'Snacks', precio: 2200, imagen: '/images/QuentoPapasFritasJamonSerrano.webp',  stock: 15, descripcion: 'Papas fritas Quento sabor jamón serrano.', variantes: null },
  { id: 8,   nombre: 'Twistos Mediano Jamón',               categoria: 'Snacks', precio: 5500, imagen: '/images/TwistosMedianosJamon.jpg', stock: 15, descripcion: 'Twistos sabor jamón, tamaño mediano.', variantes: null },
  { id: 203, nombre: 'Twistos Grande Jamón',                categoria: 'Snacks', precio: 6800, imagen: '/images/TwistosGrandesJamon.webp', stock: 10, descripcion: 'Twistos sabor jamón, tamaño grande.', variantes: null },
  { id: 10,  nombre: 'Galletitas Kesitas',        categoria: 'Snacks', precio: 2000, imagen: '/images/GalletitasKesitas.webp',   stock: 20, descripcion: 'Snacks de queso kesitas.',             variantes: null },
  { id: 11,  nombre: 'Galletitas Rex',            categoria: 'Snacks', precio: 2000, imagen: '/images/GalletitasRex.webp',       stock: 20, descripcion: 'Galletitas Rex clásicas.',             variantes: null },
  { id: 13,  nombre: 'Pipas',                     categoria: 'Snacks', precio: 1500, imagen: '/images/Pipas.webp',               stock: 20, descripcion: 'Pipas de girasol.',                    variantes: null },
  { id: 14,  nombre: 'Galletitas de Agua Traviata',        categoria: 'Snacks', precio: 1400, imagen: '/images/GalletitadeAguaTraviata.webp',         stock: 20, descripcion: 'Galletitas de agua Traviata.',          variantes: null },
  { id: 16,  nombre: 'Galletitas Cerealitas',              categoria: 'Snacks', precio: 3000, imagen: '/images/GalletitaCerealitas.webp',             stock: 15, descripcion: 'Galletitas Cerealitas clásicas.',      variantes: null },
  { id: 20,  nombre: 'Don Satur Salado',                   categoria: 'Snacks', precio: 2200, imagen: '/images/DonSaturSalada.jpg',  stock: 15, descripcion: 'Galletitas Don Satur saladas.', variantes: null },
  { id: 204, nombre: 'Don Satur Dulce',                    categoria: 'Snacks', precio: 2200, imagen: '/images/DonSaturDulce.webp',  stock: 15, descripcion: 'Galletitas Don Satur dulces.',  variantes: null },
  { id: 23,  nombre: 'Chocolinas Medianas',                categoria: 'Snacks', precio: 2600, imagen: '/images/ChocolinasNormal.jpg',   stock: 20, descripcion: 'Galletitas de chocolate Chocolinas, tamaño mediano.', variantes: null },
  { id: 205, nombre: 'Chocolinas Grandes',                 categoria: 'Snacks', precio: 4000, imagen: '/images/ChocolinasGrandes.webp', stock: 15, descripcion: 'Galletitas de chocolate Chocolinas, tamaño grande.', variantes: null },
  { id: 26,  nombre: 'Galletitas Toddy',                   categoria: 'Snacks', precio: 3000, imagen: '/images/GalletitasToddy.webp',                 stock: 15, descripcion: 'Galletitas Toddy de chocolate.',       variantes: null },
  { id: 28,  nombre: 'Galletas Suavecitas',                categoria: 'Snacks', precio: 2000, imagen: '/images/GalletitasSuavecitas.webp',             stock: 20, descripcion: 'Galletitas suavecitas.',               variantes: null },
  { id: 30,  nombre: 'Sonrisas',                           categoria: 'Snacks', precio: 2000, imagen: '/images/GalletitasSonrisas.webp',               stock: 20, descripcion: 'Galletitas Sonrisas.',                 variantes: null },
  { id: 31,  nombre: 'Merengadas',                         categoria: 'Snacks', precio: 2000, imagen: '/images/Merengadas.webp',                       stock: 20, descripcion: 'Galletitas merengadas.',               variantes: null },
  { id: 32,  nombre: 'Oreos',                              categoria: 'Snacks', precio: 2800, imagen: '/images/Oreo.webp',                             stock: 20, descripcion: 'Galletitas Oreo de chocolate.',        variantes: null },
  { id: 131, nombre: 'Pitusas Chocolate',                  categoria: 'Snacks', precio: 2000, imagen: '/images/PitusasChocolate.png',     stock: 20, descripcion: 'Galletitas Pitusas sabor chocolate.',      variantes: null },
  { id: 206, nombre: 'Pitusas Black',                      categoria: 'Snacks', precio: 2000, imagen: '/images/PitusasBlack.jpg',         stock: 20, descripcion: 'Galletitas Pitusas Black.',                 variantes: null },
  { id: 207, nombre: 'Pitusas Frutilla',                   categoria: 'Snacks', precio: 2000, imagen: '/images/PitusasFrutilla.png',      stock: 20, descripcion: 'Galletitas Pitusas sabor frutilla.',       variantes: null },
  { id: 208, nombre: 'Pitusas Limón',                      categoria: 'Snacks', precio: 2000, imagen: '/images/PitusasLimon.png',         stock: 20, descripcion: 'Galletitas Pitusas sabor limón.',          variantes: null },
  { id: 209, nombre: 'Pitusas Dulce de Leche',             categoria: 'Snacks', precio: 2000, imagen: '/images/PitusasDulcedeLeche.png',  stock: 20, descripcion: 'Galletitas Pitusas sabor dulce de leche.', variantes: null },
  { id: 34,  nombre: 'Alfajor Guaymallén Chocolate Negro', categoria: 'Alfajores', precio: 600, imagen: '/images/GuaymallenNegro.png',  stock: 30, descripcion: 'Alfajor Guaymallén con dulce de leche, chocolate negro.', variantes: null },
  { id: 210, nombre: 'Alfajor Guaymallén Chocolate Blanco',categoria: 'Alfajores', precio: 600, imagen: '/images/GuaymallenBlanco.png', stock: 30, descripcion: 'Alfajor Guaymallén con dulce de leche, chocolate blanco.', variantes: null },
  { id: 36,  nombre: 'Alfajor BonoBon',            categoria: 'Alfajores', precio: 2600, imagen: '/images/AlfajorBonobon.png',           stock: 20, descripcion: 'Alfajor BonoBon de chocolate.',        variantes: null },
  { id: 37,  nombre: 'Alfajor MiniTorta Águila Clásico',   categoria: 'Alfajores', precio: 2600, imagen: '/images/AlfajorAguilaClasico.webp', stock: 20, descripcion: 'Alfajor MiniTorta Águila, sabor clásico.', variantes: null },
  { id: 211, nombre: 'Alfajor MiniTorta Águila Brownie',   categoria: 'Alfajores', precio: 2600, imagen: '/images/AlfajorAguilaBrownie.webp', stock: 20, descripcion: 'Alfajor MiniTorta Águila, sabor brownie.', variantes: null },
  { id: 39,  nombre: 'Alfajor Jorgito Negro',              categoria: 'Alfajores', precio: 1800, imagen: '/images/AlfajorJorgitoNegro.jpeg', stock: 20, descripcion: 'Alfajor Jorgito de chocolate negro.', variantes: null },
  { id: 212, nombre: 'Alfajor Jorgito Blanco',             categoria: 'Alfajores', precio: 1800, imagen: '/images/AlfajorJorgitoBlanco.jpg', stock: 20, descripcion: 'Alfajor Jorgito de chocolate blanco.', variantes: null },
  { id: 41,  nombre: 'Alfajor Fantoche Triple Negro',      categoria: 'Alfajores', precio: 1500, imagen: '/images/AlfajorFantocheNegro.jpg',   stock: 20, descripcion: 'Alfajor Fantoche triple, chocolate negro.', variantes: null },
  { id: 213, nombre: 'Alfajor Fantoche Triple Blanco',     categoria: 'Alfajores', precio: 1500, imagen: '/images/AlfajorFantocheBlanco.jpeg', stock: 20, descripcion: 'Alfajor Fantoche triple, chocolate blanco.', variantes: null },
  { id: 43,  nombre: 'Alfajor Jorgelin Negro',             categoria: 'Alfajores', precio: 2000, imagen: '/images/AlfajorJorgelinNegro.webp',  stock: 20, descripcion: 'Alfajor Jorgelin de chocolate negro.', variantes: null },
  { id: 214, nombre: 'Alfajor Jorgelin Blanco',            categoria: 'Alfajores', precio: 2000, imagen: '/images/AlfajorJorgelinBlanco.webp', stock: 20, descripcion: 'Alfajor Jorgelin de chocolate blanco.', variantes: null },
  { id: 45,  nombre: 'Alfajor Pepitos',            categoria: 'Alfajores', precio: 2600, imagen: '/images/AlfajorPepitos.webp',          stock: 20, descripcion: 'Alfajor Pepitos.',                     variantes: null },
  { id: 46,  nombre: 'Alfajor Tri Shot',           categoria: 'Alfajores', precio: 2600, imagen: '/images/AlfajorTriShot.webp',          stock: 15, descripcion: 'Alfajor Tri Shot triple.',              variantes: null },
  { id: 47,  nombre: 'Alfajor Triple de Oreo',     categoria: 'Alfajores', precio: 2600, imagen: '/images/AlfajorTripleOreo.webp',       stock: 15, descripcion: 'Alfajor triple de Oreo.',              variantes: null },
  { id: 48,  nombre: 'Tita Chocolate',             categoria: 'Alfajores', precio: 1400, imagen: '/images/ChocolateTita.webp',           stock: 25, descripcion: 'Galletita Tita de chocolate.',         variantes: null },
  { id: 49,  nombre: 'Alfajor Cofler Block',       categoria: 'Alfajores', precio: 3000, imagen: '/images/AlfajorCoflerBlock.webp',      stock: 15, descripcion: 'Alfajor Cofler Block.',                variantes: null },
  { id: 50,  nombre: 'Bon o Bon Chocolate',                categoria: 'Alfajores', precio: 1000, imagen: '/images/BonoBonNegro.jpg',  stock: 30, descripcion: 'Bombón Bon o Bon de chocolate.', variantes: null },
  { id: 215, nombre: 'Bon o Bon Chocolate Blanco',         categoria: 'Alfajores', precio: 1000, imagen: '/images/BonoBonBlanco.jpg', stock: 30, descripcion: 'Bombón Bon o Bon de chocolate blanco.', variantes: null },
  { id: 52,  nombre: 'Sugus Confitados',          categoria: 'Dulces', precio: 2000, imagen: '/images/SugusConfitados.jpg',  stock: 20, descripcion: 'Caramelos Sugus masticables.',         variantes: null },
  { id: 53,  nombre: 'Chicles Beldent Frutilla',           categoria: 'Dulces', precio: 1300, imagen: '/images/BeldentFrutilla.webp',    stock: 20, descripcion: 'Chicles Beldent sabor frutilla.',     variantes: null },
  { id: 216, nombre: 'Chicles Beldent Menta',              categoria: 'Dulces', precio: 1300, imagen: '/images/BeldentMenta.webp',       stock: 20, descripcion: 'Chicles Beldent sabor menta.',       variantes: null },
  { id: 217, nombre: 'Chicles Beldent Menta Fuerte',       categoria: 'Dulces', precio: 1300, imagen: '/images/BeldentMentaFuerte.jpg',  stock: 20, descripcion: 'Chicles Beldent sabor menta fuerte.', variantes: null },
  { id: 56,  nombre: 'Chicle Bazooka Menta',               categoria: 'Dulces', precio: 200, imagen: '/images/BazookaMenta.jpg',   stock: 40, descripcion: 'Chicle Bazooka sabor menta.',  variantes: null },
  { id: 218, nombre: 'Chicle Bazooka Banana',              categoria: 'Dulces', precio: 200, imagen: '/images/BazookaBanana.jpeg', stock: 40, descripcion: 'Chicle Bazooka sabor banana.', variantes: null },
  { id: 58,  nombre: 'Gomitas Mogul Normal',       categoria: 'Dulces', precio: 1700, imagen: '/images/MogulRollo.webp',      stock: 20, descripcion: 'Gomitas Mogul Normal en rollo.',       variantes: null },
  { id: 59,  nombre: 'Gomitas Mogul Extreme Rollo',    categoria: 'Dulces', precio: 1700, imagen: '/images/MogulExtremeRollo.webp', stock: 20, descripcion: 'Gomitas ácidas Mogul Extreme en rollo.', variantes: null },
  { id: 219, nombre: 'Gomitas Mogul Extreme 500gr',    categoria: 'Dulces', precio: 1700, imagen: '/images/MogulExtreme.webp',      stock: 20, descripcion: 'Gomitas ácidas Mogul Extreme, paquete 500gr.', variantes: null },
  { id: 60,  nombre: 'Turrón de Maní Arcor',      categoria: 'Dulces', precio: 600,  imagen: '/images/TurronManiArcor.jpg',  stock: 30, descripcion: 'Turrón de maní Arcor.',                variantes: null },
  { id: 61,  nombre: 'Sugus Max Frutilla',         categoria: 'Dulces', precio: 200,  imagen: '/images/SugusMaxFrutilla.jpg', stock: 40, descripcion: 'Caramelo Sugus Max frutilla.',         variantes: null },
  { id: 62,  nombre: 'Gomitas Fizz Extreme',       categoria: 'Dulces', precio: 1000, imagen: '/images/FizzExtreme.webp',     stock: 20, descripcion: 'Gomitas ácidas Fizz Extreme.',         variantes: null },
  { id: 63,  nombre: 'Caramelito de Miel Arcor',  categoria: 'Dulces', precio: 200,  imagen: '/images/CarameloMielArcor.jpg',stock: 40, descripcion: 'Caramelo de miel Arcor.',              variantes: null },
  { id: 64,  nombre: 'Chicles Bubbaloo Frutilla',      categoria: 'Dulces', precio: 250, imagen: '/images/BubbalooFrutilla.jpg',    stock: 30, descripcion: 'Chicles Bubbaloo sabor frutilla.',     variantes: null },
  { id: 220, nombre: 'Chicles Bubbaloo Tutti Frutti',  categoria: 'Dulces', precio: 250, imagen: '/images/BubbalooTuttiFrutti.jpg', stock: 30, descripcion: 'Chicles Bubbaloo sabor tutti frutti.', variantes: null },
  { id: 221, nombre: 'Chicles Bubbaloo Menta',         categoria: 'Dulces', precio: 250, imagen: '/images/BubbalooMenta.jpg',       stock: 30, descripcion: 'Chicles Bubbaloo sabor menta.',        variantes: null },
  { id: 222, nombre: 'Chicles Bubbaloo Uva',           categoria: 'Dulces', precio: 250, imagen: '/images/BubbalooUva.jpg',         stock: 30, descripcion: 'Chicles Bubbaloo sabor uva.',          variantes: null },
  { id: 68,  nombre: 'Halls Menta',                    categoria: 'Dulces', precio: 1200, imagen: '/images/HallsMenta.webp',        stock: 20, descripcion: 'Halls sabor menta.',          variantes: null },
  { id: 223, nombre: 'Halls Menta Fuerte',             categoria: 'Dulces', precio: 1200, imagen: '/images/HallsMentaFuerte.webp',  stock: 20, descripcion: 'Halls sabor menta fuerte.',   variantes: null },
  { id: 224, nombre: 'Halls Naranja',                  categoria: 'Dulces', precio: 1200, imagen: '/images/HallsNaranja.webp',      stock: 20, descripcion: 'Halls sabor naranja.',        variantes: null },
  { id: 225, nombre: 'Halls Miel con Menta',           categoria: 'Dulces', precio: 1200, imagen: '/images/HallsMielConMenta.webp', stock: 20, descripcion: 'Halls sabor miel con menta.', variantes: null },
  { id: 74,  nombre: 'Agua Con Gas Magna',         categoria: 'Bebidas', precio: 2000, imagen: '/images/AguaConGas.webp',              stock: 20, descripcion: 'Agua con gas Magna 500cc.',            variantes: null },
  { id: 89,  nombre: 'Agua Villavicencio',         categoria: 'Bebidas', precio: 1800, imagen: '/images/AguaVillavicencio.webp',       stock: 20, descripcion: 'Agua mineral Villavicencio 500ml.',    variantes: null },
  { id: 75,  nombre: 'Jugo Cepita Naranja',        categoria: 'Bebidas', precio: 1800, imagen: '/images/CepitaNaranjaMini.webp', stock: 20, descripcion: 'Jugo Cepita pequeño sabor naranja.', variantes: null },
  { id: 226, nombre: 'Jugo Cepita Durazno',        categoria: 'Bebidas', precio: 1800, imagen: '/images/CepitaDuraznoMini.webp', stock: 20, descripcion: 'Jugo Cepita pequeño sabor durazno.', variantes: null },
  { id: 77,  nombre: 'Paso de los Toros 500ml',   categoria: 'Bebidas', precio: 2200, imagen: '/images/PasoDeLosToros.jpg',            stock: 15, descripcion: 'Paso de los Toros 500ml.',             variantes: null },
  { id: 78,  nombre: 'Pepsi 500ml',               categoria: 'Bebidas', precio: 2200, imagen: '/images/Pepsi.jpg',                   stock: 15, descripcion: 'Pepsi 500ml.',                         variantes: null },
  { id: 79,  nombre: '7up 500ml',                 categoria: 'Bebidas', precio: 2200, imagen: '/images/SevenUp.webp',                 stock: 15, descripcion: '7up 500ml.',                           variantes: null },
  { id: 80,  nombre: 'Coca Cola Mini',             categoria: 'Bebidas', precio: 2000, imagen: '/images/CocaColaMini.webp',            stock: 20, descripcion: 'Coca Cola lata mini.',                 variantes: null },
  { id: 81,  nombre: 'Coca Cola 600ml',            categoria: 'Bebidas', precio: 2800, imagen: '/images/CocaCola.webp',               stock: 15, descripcion: 'Coca Cola botella 600ml.',             variantes: null },
  { id: 82,  nombre: 'Fanta 500ml',               categoria: 'Bebidas', precio: 2800, imagen: '/images/Fanta.webp',                   stock: 15, descripcion: 'Fanta naranja 500ml.',                 variantes: null },
  { id: 83,  nombre: 'Jugo Baggio Naranja',        categoria: 'Bebidas', precio: 1500, imagen: '/images/BaggioNaranja.webp', stock: 30, descripcion: 'Jugo Baggio 200ml sabor naranja.', variantes: null },
  { id: 227, nombre: 'Jugo Baggio Manzana',        categoria: 'Bebidas', precio: 1500, imagen: '/images/BaggioManzana.webp', stock: 30, descripcion: 'Jugo Baggio 200ml sabor manzana.', variantes: null },
  { id: 85,  nombre: 'Chocolatada Shake 200ml',   categoria: 'Bebidas', precio: 1500, imagen: '/images/BaggioChocolatadaShake.png', stock: 25, descripcion: 'Chocolatada Shake 200ml.',             variantes: null },
  { id: 86,  nombre: 'Jugo Placer Pomelo',         categoria: 'Bebidas', precio: 1800, imagen: '/images/PlacerPomelo.jpg',  stock: 20, descripcion: 'Jugo Placer 500ml sabor pomelo.',  variantes: null },
  { id: 228, nombre: 'Jugo Placer Manzana',        categoria: 'Bebidas', precio: 1800, imagen: '/images/PlacerMnazana.jpg', stock: 20, descripcion: 'Jugo Placer 500ml sabor manzana.', variantes: null },
  { id: 229, nombre: 'Jugo Placer Naranja',        categoria: 'Bebidas', precio: 1800, imagen: '/images/PlacerNaranja.jpg', stock: 20, descripcion: 'Jugo Placer 500ml sabor naranja.', variantes: null },
  { id: 230, nombre: 'Jugo Placer Ananá',          categoria: 'Bebidas', precio: 1800, imagen: '/images/PlacerAnana.jpg',   stock: 20, descripcion: 'Jugo Placer 500ml sabor ananá.',   variantes: null },
  { id: 141, nombre: 'PowerAde Mountain Blast',    categoria: 'Bebidas', precio: 3000, imagen: '/images/PowerAdeMountainBlast.png',    stock: 10, descripcion: 'Bebida deportiva PowerAde sabor Mountain Blast.', variantes: null },
  { id: 231, nombre: 'PowerAde Frutas Tropicales', categoria: 'Bebidas', precio: 3000, imagen: '/images/PowerAdeFrutasTropicales.png', stock: 10, descripcion: 'Bebida deportiva PowerAde sabor frutas tropicales.', variantes: null },
  { id: 90,  nombre: 'Luneta',                     categoria: 'Bocados', precio: 4500, imagen: '/images/Luneta.jpg',                   stock: 15, descripcion: 'Luneta de panadería.',                 variantes: null },
  { id: 91,  nombre: 'Medialuna',                  categoria: 'Bocados', precio: 1500, imagen: '/images/Medialunas.jpg',               stock: 40, descripcion: 'Medialuna de manteca, sola.', variantes: null },
  { id: 232, nombre: 'Medialuna con Jamón y Queso', categoria: 'Bocados', precio: 2000, imagen: '/images/MedialunasconJamonyQueso.png', stock: 30, descripcion: 'Medialuna de manteca con jamón y queso.', variantes: null },
  { id: 93,  nombre: 'Tostado de Jamón y Queso',  categoria: 'Bocados', precio: 3000, imagen: '/images/TostadasdeJamonyQueso.jpg',    stock: 15, descripcion: 'Tostado de jamón y queso.',            variantes: null },
  { id: 94,  nombre: 'Torta Frita',               categoria: 'Bocados', precio: 1000, imagen: '/images/Tortafritas.png',              stock: 30, descripcion: 'Torta frita casera.',                  variantes: null },
  { id: 95,  nombre: 'Chipa',                      categoria: 'Bocados', precio: 400,  imagen: '/images/Chipas.png',                   stock: 40, descripcion: 'Chipa de almidón de mandioca.',        variantes: null },
  { id: 96,  nombre: 'Dona de Chocolate',          categoria: 'Bocados', precio: 1700, imagen: '/images/DonasdeChocolate.png',         stock: 20, descripcion: 'Dona bañada en chocolate.',            variantes: null },
  { id: 97,  nombre: 'Bizcochuelo de Vainilla',    categoria: 'Bocados', precio: 1500, imagen: '/images/BizcochuelodeVainilla.png',   stock: 15, descripcion: 'Porción de bizcochuelo de vainilla.',  variantes: null },
  { id: 233, nombre: 'Bizcochuelo de Chocolate',   categoria: 'Bocados', precio: 1500, imagen: '/images/BizcochuelodeChocolate.png',  stock: 15, descripcion: 'Porción de bizcochuelo de chocolate.', variantes: null },
  { id: 99,  nombre: 'Pebete',                     categoria: 'Bocados', precio: 4000, imagen: '/images/Pebete.png',                   stock: 15, descripcion: 'Pebete de panadería.',                 variantes: null },
  { id: 100, nombre: 'Cono de Papas',              categoria: 'Bocados', precio: 3500, imagen: '/images/ConodePapas.webp',             stock: 15, descripcion: 'Cono de papas fritas.',
    variantes: [
      { label: 'Solo',      precio: 3500, imagen: '/images/ConodePapas.webp' },
      { label: '+ Aderezo', precio: 3700, imagen: '/images/ConodePapas.webp', extraInfo: 'Elegí el aderezo en el mostrador.' },
    ]
  },
  { id: 101, nombre: 'Hamburguesa',                categoria: 'Bocados', precio: 5500, imagen: '/images/HamburguesaCompleta.jpg',      stock: 10, descripcion: 'Hamburguesa artesanal.',
    variantes: [
      { label: 'Sola',                 precio: 5500, imagen: '/images/HamburguesaCompleta.jpg' },
      { label: 'con Jamón y Queso',    precio: 6000, imagen: '/images/HamburguesaCompleta.jpg' },
      { label: 'con Lechuga y Tomate', precio: 6000, imagen: '/images/HamburguesaCompleta.jpg' },
      { label: 'Completa',             precio: 7000, imagen: '/images/HamburguesaCompleta.jpg' },
    ]
  },
  { id: 104, nombre: 'Sándwich de Milanesa',       categoria: 'Bocados', precio: 6000, imagen: '/images/SandwichMilanesa.jpg',         stock: 8,  descripcion: 'Sándwich de milanesa.',
    variantes: [
      { label: 'Sola',                 precio: 6000, imagen: '/images/SandwichMilanesa.jpg' },
      { label: 'con Jamón y Queso',    precio: 6500, imagen: '/images/SandwichMilanesa.jpg' },
      { label: 'con Lechuga y Tomate', precio: 6500, imagen: '/images/SandwichMilanesa.jpg' },
      { label: 'Completo',             precio: 7500, imagen: '/images/SandwichMilanesa.jpg' },
    ]
  },
  { id: 108, nombre: 'Patinesa',                   categoria: 'Bocados', precio: 5000, imagen: '/images/Patinesa.png',                 stock: 8,  descripcion: 'Milanesa de pollo en pan tipo patinesa.',
    variantes: [
      { label: 'Sola',                 precio: 5000, imagen: '/images/Patinesa.png' },
      { label: 'con Jamón y Queso',    precio: 5500, imagen: '/images/Patinesa.png' },
      { label: 'con Lechuga y Tomate', precio: 5500, imagen: '/images/Patinesa.png' },
      { label: 'Completa',             precio: 6000, imagen: '/images/Patinesa.png' },
      { label: 'Napolitana con Papas', precio: 7500, imagen: '/images/Patinesa.png' },
    ]
  },
  { id: 111, nombre: 'Churrasquito',               categoria: 'Bocados', precio: 6000, imagen: '/images/Churrasquito.jpg',             stock: 8,  descripcion: 'Churrasquito en pan.',
    variantes: [
      { label: 'Solo',                 precio: 6000, imagen: '/images/Churrasquito.jpg' },
      { label: 'con Jamón y Queso',    precio: 6500, imagen: '/images/Churrasquito.jpg' },
      { label: 'con Lechuga y Tomate', precio: 6500, imagen: '/images/Churrasquito.jpg' },
      { label: 'Completo',             precio: 7500, imagen: '/images/Churrasquito.jpg' },
    ]
  },
  { id: 115, nombre: 'Tortilla',                   categoria: 'Bocados', precio: 5500, imagen: '/images/Tortilla.jpg',                 stock: 8,  descripcion: 'Tortilla de papas.',                   variantes: null },
  { id: 116, nombre: 'Ensalada',                   categoria: 'Bocados', precio: 6500, imagen: '/images/Ensalada.webp',               stock: 8,  descripcion: 'Ensalada fresca.',                     variantes: null },
  { id: 117, nombre: 'Ensalada de Frutas',         categoria: 'Bocados', precio: 4000, imagen: '/images/EnsaladaDeFruta.webp',        stock: 10, descripcion: 'Ensalada de frutas frescas.',          variantes: null },
  { id: 118, nombre: 'Empanada',                   categoria: 'Bocados', precio: 2000, imagen: '/images/Empanadas.jpg',               stock: 25, descripcion: 'Empanada casera.',
    variantes: [
      { label: 'Jamón y Queso', precio: 2000, imagen: '/images/Empanadas.jpg' },
      { label: 'Carne',         precio: 2000, imagen: '/images/Empanadas.jpg' },
    ]
  },
  { id: 119, nombre: 'Porción de Pizza',           categoria: 'Bocados', precio: 1500, imagen: '/images/PorcionPizza.jpg',             stock: 20, descripcion: 'Porción de pizza.',                    variantes: null },
  { id: 120, nombre: 'Pancho',                     categoria: 'Bocados', precio: 2500, imagen: '/images/Pancho.jpg',                   stock: 15, descripcion: 'Pancho en pan con toppings a elección.',
    variantes: [
      { label: 'Solo',              precio: 2500, imagen: '/images/Pancho.jpg' },
      { label: '+ Mostaza y Ketchup',precio: 2700, imagen: '/images/Pancho.jpg', extraInfo: 'Los aderezos se agregan en el mostrador.' },
      { label: '+ Queso Cheddar',   precio: 2900, imagen: '/images/Pancho.jpg' },
    ]
  },
  { id: 121, nombre: 'Chocolatada Caliente',       categoria: 'Beb. Calientes', precio: 2500, imagen: '/images/ChocolatadaCaliente.webp', stock: 30, descripcion: 'Chocolatada caliente.',               variantes: null },
  { id: 122, nombre: 'Café Mediano',               categoria: 'Beb. Calientes', precio: 2000, imagen: '/images/CafeMediano.png', stock: 30, descripcion: 'Café con leche, tamaño mediano.', variantes: null },
  { id: 234, nombre: 'Café Grande',                categoria: 'Beb. Calientes', precio: 2500, imagen: '/images/CafeGrande.png',  stock: 30, descripcion: 'Café con leche, tamaño grande.',  variantes: null },
  // ── SERVICIOS — sin imagen, se renderiza con CardServicio ─────────────────
  { id: 127, nombre: 'Calentar Comida',            categoria: 'Servicios', precio: 200,  imagen: null, stock: 999, descripcion: 'Servicio de calentado de comida en microondas.', variantes: null },
  { id: 128, nombre: 'Calentar Agua',              categoria: 'Servicios', precio: 200,  imagen: null, stock: 999, descripcion: 'Servicio de agua caliente para mate o té.',       variantes: null },
  { id: 129, nombre: 'Calentar Vianda Escolar',    categoria: 'Servicios', precio: 300,  imagen: null, stock: 999, descripcion: 'Calentado de vianda escolar en microondas.',      variantes: null },
  // ── OTROS SERVICIOS (productos físicos con foto) ──────────────────────────
  { id: 123, nombre: 'Yerba Amanda',               categoria: 'Servicios', precio: 3200, imagen: '/images/YerbaAmanda.webp',            stock: 10, descripcion: 'Yerba Amanda 500g.',                   variantes: null },
  { id: 124, nombre: 'Protector Mosquitos Off',    categoria: 'Servicios', precio: 5500, imagen: '/images/ProtectordeMosquitos.jpg',    stock: 5,  descripcion: 'Repelente Off.',                       variantes: null },
  { id: 125, nombre: 'Vasos Descartables',         categoria: 'Servicios', precio: 100,  imagen: '/images/VasosDescartables.jpg',       stock: 100,descripcion: 'Vasos descartables por unidad.',        variantes: null },
  { id: 126, nombre: 'Pañuelos',                   categoria: 'Servicios', precio: 700,  imagen: '/images/PañuelitosDescartables.jpg',  stock: 20, descripcion: 'Pañuelos descartables.',               variantes: null },
]

// ── MENÚ DEL DÍA Y PROMOCIONES ────────────────────────────────────────────────
const menuYpromociones = [
  { id: 'menu1',  tipo: 'MENÚ DEL DÍA', nombre: 'Hamburguesa Completa + Cono de Papas + Jugo Placer', desc: 'Precio especial · Separado sale $12.300', precio: 9000 },
  { id: 'promo1', tipo: 'PROMOCIÓN',    nombre: 'Café con Leche + 5 Chipá',                            desc: 'Café mediano + 5 chipas',                 precio: 3800 },
  { id: 'promo2', tipo: 'PROMOCIÓN',    nombre: 'Café + Medialuna c/ J y Q',                           desc: 'Desayuno completo',                        precio: 3800 },
  { id: 'promo3', tipo: 'PROMOCIÓN',    nombre: 'Café + 2 Medialunas',                                 desc: 'Café mediano + 2 medialunas',              precio: 4500 },
  { id: 'promo4', tipo: 'PROMOCIÓN',    nombre: 'Desayuno: Café + Tostado J y Q',                      desc: 'Café mediano + tostado',                   precio: 3500 },
  { id: 'promo5', tipo: 'PROMOCIÓN',    nombre: '2 Empanadas + Jugo Baggio',                           desc: '2 empanadas + jugo 200ml',                 precio: 5000 },
  { id: 'promo6', tipo: 'PROMOCIÓN',    nombre: 'Chocolatada + Bizcochuelo',                           desc: 'Chocolatada caliente + porción',           precio: 3500 },
]

// ── HORARIOS ─────────────────────────────────────────────────────────────────
const turnosHorarios = {
  'Mañana': [
    { id: 'h1',  imagen: hor1,  hora: '07:45 am', momento: 'Entrada' },
    { id: 'h2',  imagen: hor2,  hora: '09:05 am', momento: '1er recreo' },
    { id: 'h3',  imagen: hor3,  hora: '10:35 am', momento: '2do recreo' },
    { id: 'h4',  imagen: hor4,  hora: '12:05 am', momento: 'Salida Normal' },
    { id: 'h5',  imagen: hor5,  hora: '12:45 am', momento: 'Salida 7ma' },
  ],
  'Tarde': [
    { id: 'h6',  imagen: hor6,  hora: '13:30 pm', momento: 'Entrada' },
    { id: 'h7',  imagen: hor7,  hora: '14:50 pm', momento: '1er recreo' },
    { id: 'h8',  imagen: hor8,  hora: '16:20 pm', momento: '2do recreo' },
    { id: 'h9',  imagen: hor9,  hora: '17:50 pm', momento: 'Salida Normal' },
    { id: 'h10', imagen: hor10, hora: '18:30 pm', momento: 'Salida 7ma' },
  ],
  'Noche': [
    { id: 'h11', imagen: hor11, hora: '18:30 pm', momento: 'Entrada' },
    { id: 'h12', imagen: hor12, hora: '19:50 pm', momento: '1er recreo' },
  ],
}

// ── HELPERS LOCALSTORAGE ──────────────────────────────────────────────────────
const CARRITO_KEY = 'recokiosco_carrito'

function cargarCarritoLocal() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function guardarCarritoLocal(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
}

// ── CARRUSEL MENÚ DEL DÍA ─────────────────────────────────────────────────────
const CARDS_POR_PAGINA = 4

function CarruselMenu({ items, onAgregar }) {
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.ceil(items.length / CARDS_POR_PAGINA)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPagina(p => (p + 1) % totalPaginas)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [totalPaginas])

  function irAPagina(i) {
    clearInterval(intervalRef.current)
    setPagina(i)
    intervalRef.current = setInterval(() => {
      setPagina(p => (p + 1) % totalPaginas)
    }, 4000)
  }

  const inicio = pagina * CARDS_POR_PAGINA
  const visibles = items.slice(inicio, inicio + CARDS_POR_PAGINA)

  return (
    <div className="carrusel-menu-wrapper">
      <div className="carrusel-menu-track">
        {visibles.map(item => (
          <div key={item.id} className="catalogo-menu-card">
            <p className="menu-card-tipo">{item.tipo}</p>
            <p className="menu-card-nombre">{item.nombre}</p>
            <p className="menu-card-desc">{item.desc}</p>
            <div className="menu-card-footer">
              <span className="menu-card-precio">${item.precio.toLocaleString('es-AR')}</span>
              <button
                className="menu-card-btn"
                onClick={() => onAgregar({
                  id: item.id,
                  nombre: item.nombre,
                  precio: item.precio,
                  categoria: item.tipo,
                  stock: 99,
                  imagen: null,
                })}
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
        {visibles.length < CARDS_POR_PAGINA &&
          Array.from({ length: CARDS_POR_PAGINA - visibles.length }).map((_, i) => (
            <div key={`ph-${i}`} className="catalogo-menu-card-placeholder" />
          ))
        }
      </div>
      {totalPaginas > 1 && (
        <div className="carrusel-dots">
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              className={`carrusel-dot ${i === pagina ? 'activo' : ''}`}
              onClick={() => irAPagina(i)}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── MODAL VARIANTES ───────────────────────────────────────────────────────────
function ModalVariantes({ producto, varianteInicial, onAgregar, onConfirmarEdicion, onCerrar }) {
  const esEdicion = !!onConfirmarEdicion
  const inicial = varianteInicial
    ? producto.variantes.find(v => v.label === varianteInicial) ?? producto.variantes[0]
    : null
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(inicial)
  const variante = varianteSeleccionada ?? producto.variantes[0]

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-producto modal-variantes" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        <div className="modal-producto-imagen">
          {variante.imagen
            ? <img src={variante.imagen} alt={variante.label} />
            : <div className="card-producto-placeholder" />
          }
        </div>
        <div className="modal-producto-info">
          <p className="modal-producto-categoria">{producto.categoria}</p>
          <h2 className="modal-producto-nombre">{producto.nombre}</h2>
          <p className="modal-producto-desc">{producto.descripcion}</p>
          <p className="modal-variantes-label">Elegí una opción:</p>
          <div className="modal-variantes-opciones">
            {producto.variantes.map((v, i) => (
              <button
                key={i}
                className={`modal-variante-btn ${variante === v ? 'activo' : ''}`}
                onClick={() => setVarianteSeleccionada(v)}
              >
                <span className="modal-variante-label">{v.label}</span>
                <span className="modal-variante-precio">${v.precio.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
          {variante.extraInfo && (
            <p className="modal-variante-extra">{variante.extraInfo}</p>
          )}
          <p className="modal-producto-precio">${variante.precio.toLocaleString('es-AR')}</p>
          {esEdicion ? (
            <button
              className="modal-producto-btn"
              onClick={() => { onConfirmarEdicion(variante.label); onCerrar() }}
            >
              Guardar cambios
            </button>
          ) : (
            <button
              className="modal-producto-btn"
              disabled={producto.stock === 0}
              onClick={() => {
                onAgregar({
                  ...producto,
                  baseId: producto.id,
                  id: `${producto.id}_${variante.label}`,
                  nombre: producto.nombre,
                  variedadSeleccionada: variante.label,
                  precio: variante.precio,
                  imagen: variante.imagen,
                })
              }}
            >
              {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MODAL CARRITO ─────────────────────────────────────────────────────────────
// Ya no maneja el undo internamente. Al eliminar un ítem llama a onEliminar(item)
// para que el padre (Catalogo) lo gestione como toast flotante.
export function ModalCarrito({
  carrito, setCarrito, mostrarCarrito, setMostrarCarrito, onEliminarItem
}) {
  const [horario, setHorario] = useState(null)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false)
  const [turnoActivo, setTurnoActivo] = useState('Mañana')

  function handleCambiarCantidad(id, delta) {
    setCarrito(prev =>
      prev
        .map(item => item.id === id ? { ...item, cantidad: item.cantidad + delta } : item)
        .filter(item => item.cantidad > 0)
    )
  }

  // Delega al padre para que gestione el toast de undo fuera del modal
  function handleEliminar(item) {
    setCarrito(prev => prev.filter(i => i.id !== item.id))
    onEliminarItem(item)
  }

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  function handleConfirmar() {
    if (!horario) return
    setPedidoConfirmado(true)
    localStorage.removeItem(CARRITO_KEY)
    setCarrito([])
  }

  if (!mostrarCarrito) return null

  return (
    <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
      <div className="modal-carrito" onClick={e => e.stopPropagation()}>

        {!pedidoConfirmado ? (
          <>
            <div className="modal-carrito-izq">
              <h2 className="modal-carrito-titulo">Tu Pedido</h2>
              <p className="modal-carrito-subtitulo">Productos seleccionados</p>

              {carrito.length === 0 && (
                <p className="modal-carrito-vacio">
                  <img src={iconAdvertencia} alt="!" className="modal-aviso-icono" />
                  No agregaste productos todavía.
                </p>
              )}

              {carrito.map(item => (
                <div key={item.id} className="modal-carrito-item">
                  <div className="modal-carrito-item-imagen">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : esServicioSinFoto(item)
                        ? <div className="card-producto-servicio-fondo" />
                        : <div className="card-producto-placeholder" />
                    }
                  </div>
                  <div className="modal-carrito-item-info">
                    <span className="modal-carrito-item-nombre">{item.nombre}</span>
                    <span className="modal-carrito-item-precio">${item.precio.toLocaleString('es-AR')} c/u</span>
                  </div>
                  <div className="carrito-item-centro">
                    {item.variedadSeleccionada && (
                      <span className="carrito-variedad-tag">{item.variedadSeleccionada}</span>
                    )}
                    <div className="carrito-item-acciones">
                      <button
                        className="carrito-btn-eliminar"
                        onClick={() => handleEliminar(item)}
                        title="Eliminar producto"
                      >
                        <img src={iconEliminar} alt="Eliminar" />
                      </button>
                    </div>
                  </div>
                  <div className="modal-carrito-item-controles">
                    <button onClick={() => handleCambiarCantidad(item.id, -1)}>−</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => handleCambiarCantidad(item.id, +1)}>+</button>
                  </div>
                  <span className="modal-carrito-item-subtotal">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}

              <button className="modal-seguir-btn" onClick={() => setMostrarCarrito(false)}>
                + Seguir comprando
              </button>
            </div>

            <div className="modal-carrito-der">
              <div className="modal-resumen">
                <h3>Resumen</h3>
                {carrito.map(item => (
                  <div key={item.id} className="modal-resumen-fila">
                    <span>
                      {item.nombre} {item.variedadSeleccionada && `(${item.variedadSeleccionada})`} x{item.cantidad}
                    </span>
                    <span>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                  </div>
                ))}
                <div className="modal-resumen-total">
                  <span>Total</span>
                  <span>${totalCarrito.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="modal-horarios">
                <h3>Elegir horario de retiro</h3>
                <div className="modal-turno-selector">
                  {['Mañana', 'Tarde', 'Noche'].map(turno => (
                    <button
                      key={turno}
                      className={`modal-turno-btn ${turnoActivo === turno ? 'activo' : ''}`}
                      onClick={() => { setTurnoActivo(turno); setHorario(null) }}
                    >
                      {turno}
                    </button>
                  ))}
                </div>
                {turnosHorarios[turnoActivo].map(h => (
                  <button
                    key={h.id}
                    className={`modal-horario-btn ${horario === h.hora ? 'activo' : ''}`}
                    onClick={() => setHorario(h.hora)}
                  >
                    <span className="modal-horario-hora">{h.hora}</span>
                    <span className="modal-horario-momento">{h.momento}</span>
                  </button>
                ))}
                {!horario && (
                  <p className="modal-horario-aviso">
                    <img src={iconAdvertencia} alt="!" className="modal-aviso-icono" />
                    <span>Seleccioná un horario para confirmar</span>
                  </p>
                )}
              </div>

              <button
                className="modal-confirmar-btn"
                onClick={handleConfirmar}
                disabled={!horario || carrito.length === 0}
              >
                Confirmar Pedido
              </button>
              <button
                className="modal-cancelar-btn"
                onClick={() => { setMostrarCarrito(false); setCarrito([]); setHorario(null); setPedidoConfirmado(false) }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <div className="modal-confirmado">
            <div className="modal-confirmado-icono">
              <img src={iconCheck} alt="Confirmado" />
            </div>
            <h2>¡Pedido confirmado!</h2>
            <p className="modal-confirmado-sub">Pedido enviado al kiosco</p>
            <p className="modal-confirmado-horario">
              <img src={iconReloj} alt="Horario" className="modal-aviso-icono" />
              Retirá tu pedido a partir de las {horario}
            </p>
            <button
              className="modal-confirmar-btn"
              onClick={() => { setMostrarCarrito(false); setPedidoConfirmado(false); setHorario(null) }}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
function Catalogo() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito]   = useState(() => cargarCarritoLocal())
  const [productoModal, setProductoModal]       = useState(null)
  const [productoVariantes, setProductoVariantes] = useState(null)
  const [mostrarCarrito, setMostrarCarrito]     = useState(false)

  // ── Toast de undo (fuera del modal, nivel página) ─────────────────────────
  // undoItem: { item, timerId } | null — solo un undo activo a la vez.
  const [undoItem, setUndoItem]   = useState(null)
  const undoTimerRef              = useRef(null)
  const UNDO_DURACION             = 3500 // ms

  useEffect(() => {
    guardarCarritoLocal(carrito)
  }, [carrito])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        setMostrarCarrito(false)
        setProductoModal(null)
        setProductoVariantes(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Limpia el timer de undo al desmontar
  useEffect(() => {
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  const productosFiltrados = productosPrueba.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    const coincideBusqueda  = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  function handleClickProducto(producto) {
    if (producto.variantes) {
      setProductoVariantes(producto)
    } else {
      setProductoModal(producto)
    }
  }

  function handleAgregar(producto) {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id)
      return existe
        ? prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...prev, { ...producto, cantidad: 1 }]
    })
    setProductoModal(null)
    setProductoVariantes(null)
  }

  // Recibe el item eliminado desde ModalCarrito y lanza el toast
  function handleEliminarItem(item) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    const timerId = setTimeout(() => setUndoItem(null), UNDO_DURACION)
    undoTimerRef.current = timerId
    setUndoItem({ item, timerId })
  }

  function handleDeshacer() {
    if (!undoItem) return
    clearTimeout(undoItem.timerId)
    setCarrito(prev => [...prev, undoItem.item])
    setUndoItem(null)
  }

  const totalCarrito   = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  const cantidadTotal  = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  return (
    <div className="catalogo-layout">
      <NavbarAlumno cantidadCarrito={cantidadTotal} onAbrirCarrito={() => setMostrarCarrito(true)} />
      <main className="catalogo-contenido">

        <div className="catalogo-banner-menu">
          <h2 className="catalogo-banner-titulo">Promociones y Menú del Día</h2>
          <CarruselMenu items={menuYpromociones} onAgregar={handleAgregar} />
        </div>

        <div className="catalogo-categorias">
          {categorias.map(cat => (
            <button
              key={cat.nombre}
              className={`catalogo-cat-btn ${categoriaActiva === cat.nombre ? 'activo' : ''}`}
              onClick={() => setCategoriaActiva(cat.nombre)}
            >
              <img src={cat.imagen} alt={cat.nombre} />
            </button>
          ))}
        </div>

        <div className="catalogo-buscador">
          <img src={iconBuscador} alt="Buscar" className="catalogo-buscador-icono" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="catalogo-grilla">
          {productosFiltrados.map(producto => (
            <div
              key={producto.id}
              onClick={() => handleClickProducto(producto)}
              className="catalogo-card-wrapper"
            >
              <CardProducto
                producto={producto}
                onAgregar={(p) => {
                  if (p.variantes) {
                    setProductoVariantes(p)
                  } else {
                    handleAgregar(p)
                  }
                }}
              />
            </div>
          ))}
        </div>
      </main>

      {cantidadTotal > 0 && (
        <button className="catalogo-carrito-flotante" onClick={() => setMostrarCarrito(true)}>
          <img src={iconCarrito} alt="Carrito" />
          <span className="catalogo-carrito-badge">{cantidadTotal}</span>
          <span className="catalogo-carrito-total">Ver pedido · ${totalCarrito.toLocaleString('es-AR')}</span>
        </button>
      )}

      {productoVariantes && (
        <ModalVariantes
          producto={productoVariantes}
          onAgregar={handleAgregar}
          onCerrar={() => setProductoVariantes(null)}
        />
      )}

      {productoModal && (
        <div className="modal-overlay" onClick={() => setProductoModal(null)}>
          <div className="modal-producto" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setProductoModal(null)}>✕</button>
            <div className="modal-producto-imagen">
              {productoModal.imagen
                ? <img src={productoModal.imagen} alt={productoModal.nombre} />
                : esServicioSinFoto(productoModal)
                  ? <div className="card-producto-servicio-fondo" />
                  : <div className="card-producto-placeholder" />
              }
            </div>
            <div className="modal-producto-info">
              <p className="modal-producto-categoria">{productoModal.categoria}</p>
              <h2 className="modal-producto-nombre">{productoModal.nombre}</h2>
              <p className="modal-producto-desc">{productoModal.descripcion}</p>
              <p className="modal-producto-precio">${productoModal.precio.toLocaleString('es-AR')}</p>
              <button
                className="modal-producto-btn"
                onClick={() => handleAgregar(productoModal)}
                disabled={productoModal.stock === 0}
              >
                {productoModal.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalCarrito
        carrito={carrito}
        setCarrito={setCarrito}
        mostrarCarrito={mostrarCarrito}
        setMostrarCarrito={setMostrarCarrito}
        onEliminarItem={handleEliminarItem}
      />

      {/* ── Toast flotante de undo — igual que GestionProductos ── */}
      {undoItem && (
        <div className="catalogo-toast">
          <span>"{undoItem.item.nombre}" eliminado</span>
          <button className="catalogo-toast-btn" onClick={handleDeshacer}>
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}

export default Catalogo