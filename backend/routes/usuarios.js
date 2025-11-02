const express = require('express');
const router = express.Router();
const { crearUsuario, listarUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario } = require('../controllers/usuariosCtrl');

router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;






