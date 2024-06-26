import express from 'express'
import { inicio, buscador, categoria, noEncontrado } from '../controllers/appController.js'


const router = express.Router()

//Página de Inicio
router.get("/", inicio)

//Categorias
router.get("/categorias/:id", categoria)

//Pagina 404
router.get("/404", noEncontrado)

//Buscador
router.post("/buscador", buscador)

export default router