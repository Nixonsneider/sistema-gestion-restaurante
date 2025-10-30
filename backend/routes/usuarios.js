// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { crearUsuario, listarUsuarios } = require('../controllers/usuariosCtrl');

router.get('/', listarUsuarios);
router.post('/', crearUsuario);

module.exports = router;






