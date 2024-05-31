import express from "express"
import { body, header} from "express-validator"
import {admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad, enviarMensaje, verMensajes, cambiarEstado} from '../controllers/propiedadController.js'
import protegerRuta from "../middleware/protegerRuta.js"
import upload from '../middleware/subirImagen.js'
import identificarUsuario from "../middleware/identificarUsuario.js"


const router = express.Router()

router.get('/mis-propiedades', protegerRuta, admin)

router.get('/propiedades/crear', protegerRuta, crear)

router.post('/propiedades/crear', protegerRuta,
    process.env.NODE_ENV != 'test' ? body('titulo').notEmpty().withMessage('El titulo del Anuncio es Obligatorio')  : header('titulo').notEmpty().withMessage('El titulo del Anuncio es Obligatorio'),
    process.env.NODE_ENV != 'test' ? body('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacío').isLength({max:200}).withMessage('La descripción es muy larga') : header('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacío').isLength({max:200}).withMessage('La descripción es muy larga'),
    process.env.NODE_ENV != 'test' ? body('categoria').isNumeric().withMessage('Selecciona una categoria') : header('categoria').isNumeric().withMessage('Selecciona una categoria'),
    process.env.NODE_ENV != 'test' ? body('precio').isNumeric().withMessage('Selecciona un rango de Precios') : header('precio').isNumeric().withMessage('Selecciona un rango de Precios'),    
    process.env.NODE_ENV != 'test' ? body('habitaciones').isNumeric().withMessage('Selecciona un número de Habitaciones') : header('habitaciones').isNumeric().withMessage('Selecciona un número de Habitaciones'),
    process.env.NODE_ENV != 'test' ? body('estacionamiento').isNumeric().withMessage('Selecciona un número de estacionamientos') : header('estacionamiento').isNumeric().withMessage('Selecciona un número de estacionamientos'),
    process.env.NODE_ENV != 'test' ? body('wc').isNumeric().withMessage('Selecciona un numero de Baños') : header('wc').isNumeric().withMessage('Selecciona un numero de Baños'),
    process.env.NODE_ENV != 'test' ? body('lat').notEmpty().withMessage('Ubica la Propiedad en el mapa') : header('lat').notEmpty().withMessage('Ubica la Propiedad en el mapa'),
    guardar
)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)

router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id', 
    protegerRuta,
    editar
)
router.post('/propiedades/editar/:id', 
    protegerRuta,
    process.env.NODE_ENV != 'test' ? body('titulo').notEmpty().withMessage('El titulo del Anuncio es Obligatorio') : header('titulo').notEmpty().withMessage('El titulo del Anuncio es Obligatorio'),
    process.env.NODE_ENV != 'test' ? body('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacío').isLength({max:200}).withMessage('La descripción es muy larga') : header('descripcion').notEmpty().withMessage('La Descripcion no puede ir vacío').isLength({max:200}).withMessage('La descripción es muy larga'),
    process.env.NODE_ENV != 'test' ? body('categoria').isNumeric().withMessage('Selecciona una categoria') : header('categoria').isNumeric().withMessage('Selecciona una categoria'),
    process.env.NODE_ENV != 'test' ? body('precio').isNumeric().withMessage('Selecciona un rango de Precios') : header('precio').isNumeric().withMessage('Selecciona un rango de Precios'),
    process.env.NODE_ENV != 'test' ? body('habitaciones').isNumeric().withMessage('Selecciona un número de Habitaciones') : header('habitaciones').isNumeric().withMessage('Selecciona un número de Habitaciones'),
    process.env.NODE_ENV != 'test' ? body('estacionamiento').isNumeric().withMessage('Selecciona un número de estacionamientos') : header('estacionamiento').isNumeric().withMessage('Selecciona un número de estacionamientos'),
    process.env.NODE_ENV != 'test' ? body('wc').isNumeric().withMessage('Selecciona un numero de Baños') : header('wc').isNumeric().withMessage('Selecciona un numero de Baños'),
    process.env.NODE_ENV != 'test' ? body('lat').notEmpty().withMessage('Ubica la Propiedad en el mapa') : header('lat').notEmpty().withMessage('Ubica la Propiedad en el mapa'),
    guardarCambios
)

router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
)

router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)

//Area publica
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
)

//Almacenar mensajes
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min:10}).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

router.get('mensajes/:id',
    protegerRuta,
    verMensajes
)



export default router