import {Categoria, Precio, Propiedad } from '../models/index.js'
import { Sequelize} from 'sequelize'

const inicio = async (req, res) => {
    const [categorias, precios, casas, departamentos] = await Promise.all([
        Categoria.findAll({raw: true}),
        Precio.findAll({raw: true}),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:1
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:2
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
    ])

    res.setHeader('X-Test-Message', 'El inicio ha sido cargado correctamente');
    res.status(200).render("inicio",{
        pagina:'Inicio',
        categorias,
        precios,
        casas,
        departamentos,
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '' 
    })
}

const categoria = async (req, res) => {
    const {id} = req.params

    const categoria = await Categoria.findByPk(id)
    if(!categoria){
        res.setHeader('X-Test-Message', 'Se ha redireccionado a 404');
        return res.redirect("/404")
    }

    const propiedades = await Propiedad.findAll({
        where:{
            categoriaId: id
        },
        include:[
            { model: Precio, as: 'precio'}
        ]
    })

    res.setHeader('X-Test-Message', 'Se han cargado correctamente las categorias');
    res.status(200).render('categoria', {
        pagina: `${categoria.nombre}s en venta`,
        propiedades,
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : '' 
    })
}

const noEncontrado = async (req, res) => {
    res.setHeader('X-Test-Message', 'Pagina no Encontrada');
    res.status(404).render('404', {
        pagina: 'Pagina No Encontrada',
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : ''
    })
}

const buscador = async (req, res) => {
    const { termino } = process.env.NODE_ENV != 'test' ? req.body : req.headers

    if(!termino.trim()) {
        res.setHeader('X-Test-Message', 'No se ha escrito nada');
        return res.redirect('back')
    }

    // Consultar las propiedades
    const propiedades = await Propiedad.findAll({
        where:{
            titulo: {
                [Sequelize.Op.like] : '%' + termino + '%'
            }
        },
        include:[
            {model: Precio, as: 'precio'},

        ]
    })

    res.setHeader('X-Test-Message', 'La busqueda se ha realizado con exito');
    res.status(200).render('busqueda', {
        pagina: 'Resultados de la Búsqueda',
        propiedades,
        csrfToken: process.env.NODE_ENV != 'test' ? req.csrfToken() : ''
    })
}

export {
    buscador,
    inicio,
    categoria,
    noEncontrado
}