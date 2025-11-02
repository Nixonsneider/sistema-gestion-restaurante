const express = require('express');
const router = express.Router();
const pedidosCtrl = require('../controllers/pedidosCtrl');

router.get('/', pedidosCtrl.listarPedidos);
router.get('/mesa/:idMesa', pedidosCtrl.obtenerPedidoPorMesa);
router.get('/:id', pedidosCtrl.obtenerPedido);
router.post('/', pedidosCtrl.crearPedido);
router.put('/:id', pedidosCtrl.actualizarPedido);
router.post('/:id/productos', pedidosCtrl.agregarProducto);
router.delete('/:id/productos/:idDetalle', pedidosCtrl.eliminarProducto);
router.post('/:id/finalizar', pedidosCtrl.finalizarPedido);

module.exports = router;


