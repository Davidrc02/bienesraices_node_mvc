//const express = require("express") //Common JS
import express from 'express' //ESM
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from "./routes/usuarioRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import appRoutes from "./routes/appRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"
import db from './config/db.js'

//Creamos la app
const app = express()

//Habilitar lectura de datos de formularios
app.use( express.urlencoded({extended:true}))
//Habilitar Cookie Parser
app.use( cookieParser())
//Hablitar CSRF
if(process.env.NODE_ENV != 'test'){
    app.use(csrf({cookie:true}))
}


//Conexión a la base de datos
try{
    await db.authenticate();
    db.sync();
    console.log('Conexión correcta a la base de datos')
}catch (error){
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')
//Carpeta publica
app.use( express.static('public'))
//Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)


export default app;