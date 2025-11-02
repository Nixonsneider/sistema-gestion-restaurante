const express = require('express');
const router = express.Router();
const mesasCtrl = require('../controllers/mesasCtrl');

router.get('/', mesasCtrl.listarMesas);
router.post('/', mesasCtrl.crearMesa);
router.post('/:id/reservar', mesasCtrl.reservarMesa);
router.put('/:id', mesasCtrl.actualizarMesa);
router.delete('/:id', mesasCtrl.eliminarMesa);

module.exports = router;


