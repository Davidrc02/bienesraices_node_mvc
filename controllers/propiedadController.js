import { Categoria, Precio, Propiedad, Mensaje, Usuario } from "../models/index.js"
import { validationResult } from "express-validator"
import { unlink } from 'node:fs/promises'
import { esVendedor, formatearFecha} from "../helpers/index.js"

const admin = async (req, res) => {

    const { pagina: paginaActual } = req.query
    
    //Expresión regular
    const expresion = /^[1-9]$/

    if (!expresion.test(paginaActual)) {
        res.setHeader('X-Test-Message', 'La pagina actual no estaba correctamente puesta');
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = process.env.NODE_ENV != 'test' ? req.usuario : req.headers

        //Limites y Offset para el paginador
        const limit = 5;
        const offset = ((paginaActual * limit) - limit)


        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: { usuarioId: id },
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio' },
                    { model: Mensaje, as: 'mensajes' }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])
        res.setHeader('X-Test-Message', 'Las propiedades han sido encontradas');
        res.status(200).render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual : Number(paginaActual),
            total, 
            offset,
            limit
        })
    } catch (error) {
        console.log(error)
    }
}

//Formulario para crear una nueva propiedad
const crear = async (req, res) => {
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.setHeader('X-Test-Message', 'La pagina para crear una propiedad ha sido cargada');
    res.status(200).render('propiedades/crear', {
        pagina: 'Crear propiedad',
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {
    //Validacion
    let resultado = validationResult(req)
    console.log("RESULTADO: "+resultado)
    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        res.setHeader('X-Test-Message', 'Ha habido un error en el formulario de creacion');
        return res.status(400).render('propiedades/crear', {
            pagina: 'Crear propiedad',
            csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = process.env.NODE_ENV != 'test' ? req.body : req.headers

    const { id: usuarioId } = process.env.NODE_ENV != 'test' ? req.usuario : req.headers

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })
        const { id } = propiedadGuardada
        res.setHeader('X-Test-Message', 'Redireccionamiento a agregar imagen');
        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req, res) => {

    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render("propiedades/agregar-imagen", {
        pagina: 'Agregar Imagen',
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
        propiedad
    })
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {
        //Almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    } catch (error) {
        console.log(error)
    }
}

const editar = async (req, res) => {
    const { id } = req.params

    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }

    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades")
    }

    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar propiedad: ${propiedad.titulo}`,
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
        categorias,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) => {
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar propiedad',
            csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        await propiedad.save();

        res.redirect("/mis-propiedades")

    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req, res) => {
    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    await unlink(`public/uploads/${propiedad.imagen}`)

    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}

// Vamos a cambiar el estado
const cambiarEstado = async (req, res) => {
    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    // Actualizar
    propiedad.publicado = !propiedad.publicado

    await propiedad.save()

    res.json({
        resultado: 'OK'
    })
}

const mostrarPropiedad = async (req, res) => {
    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' }
        ]
    })

    if (!propiedad || !propiedad.publicado) {
        return res.redirect('/404')
    }


    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    })
}

const enviarMensaje = async (req, res) => {
    const { id } = req.params


    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' }
        ]
    })

    if (!propiedad) {
        return res.redirect('/404')
    }

    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })
    }

    const { mensaje } = req.body
    const { id: propiedadId } = req.params
    const { id: usuarioId } = req.usuario

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    // res.render('propiedades/mostrar', {
    //     propiedad,
    //     pagina: propiedad.titulo,
    //     csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '',
    //     usuario: req.usuario,
    //     esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    //     enviado:true
    // })
    res.redirect("/")
}

//Leer mensajes recibidos
const verMensajes = async (req, res) => {
    const { id } = req.params

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Mensaje, as: 'mensajes',
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            }
        ]
    })

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece a quien visita esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.rendr('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}