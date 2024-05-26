/////////////////////////////////////////////////////////////////
///////////////////////////IMPORTS///////////////////////////////
/////////////////////////////////////////////////////////////////

import {check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import {generarId, generarJWT} from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/emails.js'


/////////////////////////////////////////////////////////////////
/////////////////////////FORM LOGIN//////////////////////////////
/////////////////////////////////////////////////////////////////

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: "Iniciar Sesion",
        csrfToken: req.csrfToken()
    })
}


const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect("/auth/login")
}

/////////////////////////////////////////////////////////////////
/////////////////////////AUTENTICAR//////////////////////////////
/////////////////////////////////////////////////////////////////

const autenticar = async (req, res) => {

    await check('email').isEmail().withMessage("El email es Obligatorio").run(req)
    await check('password').notEmpty().withMessage("El password es Obligatorio").run(req)

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('auth/login', {
            pagina: "Iniciar Sesion",
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        })
    }

    const {email, password} = req.body

    //Verificar que el usuario no esté duplicado
    const usuario = await Usuario.findOne({where: {email}})

    //Comprobar usuario
    if(!usuario){
        return res.render('auth/login', {
            pagina: "Iniciar Sesion",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Existe'}]
        })
    }

    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: "Iniciar Sesion",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Está Confirmado'}]
        })
    }

    //Comprobar contraseña con BCRYPT
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: "Iniciar Sesion",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Password es incorrecto!'}]
        })
    }

    const token = generarJWT({id: usuario.id, nombre:usuario.nombre})

    console.log(token)

    //Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true
    }).redirect('/mis-propiedades')
}

/////////////////////////////////////////////////////////////////
///////////////////////FORM REGISTRO/////////////////////////////
/////////////////////////////////////////////////////////////////

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: "Crear cuenta",
        csrfToken: req.csrfToken()
    })
}

/////////////////////////////////////////////////////////////////
//////////////////////REGISTRAR CUENTA///////////////////////////
/////////////////////////////////////////////////////////////////

const registrar = async (req, res) => { 
    //Validacion
    await check('nombre').notEmpty().withMessage("El nombre no puede ir vacío").run(req)
    await check('email').isEmail().withMessage("El email no tiene el formato correcto").run(req)
    await check('password').isLength({min:6}).withMessage("El password tiene que tener al menos 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("Los passwords no son iguales").run(req)

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('auth/registro', {
            pagina: "Crear cuenta",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const {nombre, email, password} = req.body

    //Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne({where: {email}})
    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: "Crear cuenta",
            errores: [{msg: 'El usuario ya está registrado'}],
            usuario: {
                nombre: nombre,
                email: email
            }
        })
    }

    //Almacenar al usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia email de Confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email:usuario.email,
        token: usuario.token
    })

    //Mostrar mensaje de confirmación
    res.render('templates/mensaje',{
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmación, presiona en el enlace'
    })
}

/////////////////////////////////////////////////////////////////
//////////////////////CONFIRMAR CUENTA///////////////////////////
/////////////////////////////////////////////////////////////////

//Funcion que confirma una cuenta
const confirmar = async (req, res) => {
    const {token} =req.params

    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    usuario.token = null;
    usuario.confirmado= true;
    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó Correctamente'
    })
}

/////////////////////////////////////////////////////////////////
////////////////////FORM OLVIDÉ PASSWORD/////////////////////////
/////////////////////////////////////////////////////////////////

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: "Recuperar acceso a BienesRaices",
        csrfToken: req.csrfToken(),
    })
}

/////////////////////////////////////////////////////////////////
///////////////////////RESET PASSWORD////////////////////////////
/////////////////////////////////////////////////////////////////

const resetPassword = async (req, res) => {

    await check('email').isEmail().withMessage("El email no tiene el formato correcto").run(req)

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password', {
            pagina: "Recuperar acceso a BienesRaices",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
        })
    }

    //Buscar un usuario
    const { email } = req.body

    const usuario = await Usuario.findOne({where: { email }})

    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: "Recuperar acceso a BienesRaices",
            csrfToken: req.csrfToken(),
            errores : [{msg: 'El email no Pertenece a ningún usuario'}]
        })
    }

    usuario.token = generarId()

    await usuario.save();

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

/////////////////////////////////////////////////////////////////
///////////////////////COMPROBAR TOKEN///////////////////////////
/////////////////////////////////////////////////////////////////

const comprobarToken = async (req, res) => {
    const {token} = req.params;

    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    //Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken()
    })

}

/////////////////////////////////////////////////////////////////
///////////////////////NUEVO PASSWORD////////////////////////////
/////////////////////////////////////////////////////////////////

const nuevoPassword = async (req, res) => {

    await check('password').isLength({min:6}).withMessage("El password tiene que tener al menos 6 caracteres").run(req)
    
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render('auth/reset-password', {
            pagina: "Crear cuenta",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const {token} = req.params
    const {password} = req.body
    const usuario = await Usuario.findOne({where : {token}})

    //Hashear el password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token= null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardó correctamente'
    })
}

/////////////////////////////////////////////////////////////////
//////////////////////////EXPORTS////////////////////////////////
/////////////////////////////////////////////////////////////////

export{
    cerrarSesion,
    formularioLogin,
    formularioRegistro,
    registrar,
    autenticar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}