import express from "express";
import {cerrarSesion, formularioLogin, autenticar, formularioRegistro, formularioOlvidePassword, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword} from "../controllers/usuarioController.js";

const router = express.Router();

router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

//Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);


router.get('/confirmar/:token', confirmar)

export default router

// router.get('/', (req, res) => {
//     res.json({msg: "Hola mundo en Express"})
// });

// router.post('/', (req, res) => {
//     res.json({msg: "Hola mundo en Express POST"})
// });

// router.get('/nosotros', function(req, res){
//     res.send("Informacion de nosotros")
// });

// router.route('/')
//     .get(function(req, res){
//         res.json({msg: "Hola mundo en Express"})
//     })
//     .post(function(req, res){
//         res.json({msg: "Hola mundo en Express POST"})
//     })

