const pool = require('../db');

const listarPedidos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.nombre || ' ' || u.apellido as mesero, m.numero_mesa
            FROM pedido p
            LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN mesa m ON p.id_mesa = m.id_mesa
            ORDER BY p.fecha_hora DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

const obtenerPedido = async (req, res) => {
    const { id } = req.params;
    
    try {
        const pedidoResult = await pool.query(`
            SELECT p.*, u.nombre || ' ' || u.apellido as mesero, m.numero_mesa
            FROM pedido p
            LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN mesa m ON p.id_mesa = m.id_mesa
            WHERE p.id_pedido = $1
        `, [id]);
        
        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        const detallesResult = await pool.query(`
            SELECT dp.*, pr.nombre as producto_nombre
            FROM detalle_pedido dp
            JOIN producto pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = $1
        `, [id]);
        
        const pedido = pedidoResult.rows[0];
        pedido.detalles = detallesResult.rows;
        
        res.json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
};

const crearPedido = async (req, res) => {
    const { id_usuario, id_mesa } = req.body;
    
    if (!id_usuario || !id_mesa) {
        return res.status(400).json({ error: 'Usuario y mesa son requeridos' });
    }
    
    const client = await pool.connect();
    let clientReleased = false;
    
    try {
        await client.query('BEGIN');
        
        const existingOrder = await client.query(
            'SELECT id_pedido FROM pedido WHERE id_mesa = $1 AND estado = $2',
            [id_mesa, 'en curso']
        );
        
        if (existingOrder.rows.length > 0) {
            await client.query('ROLLBACK');
            
            const pedidoExistente = await pool.query(`
                SELECT p.*, u.nombre || ' ' || u.apellido as mesero, m.numero_mesa
                FROM pedido p
                LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
                LEFT JOIN mesa m ON p.id_mesa = m.id_mesa
                WHERE p.id_pedido = $1
            `, [existingOrder.rows[0].id_pedido]);
            
            client.release();
            clientReleased = true;
            return res.status(200).json(pedidoExistente.rows[0]);
        }
        
        const pedidoResult = await client.query(
            'INSERT INTO pedido (id_usuario, id_mesa, estado, total) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_usuario, id_mesa, 'en curso', 0]
        );
        
        await client.query('COMMIT');
        res.status(201).json(pedidoResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error al crear pedido' });
    } finally {
        if (!clientReleased) {
            client.release();
        }
    }
};

const actualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE pedido SET estado = $1 WHERE id_pedido = $2 RETURNING *',
            [estado, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
};

const agregarProducto = async (req, res) => {
    const { id } = req.params;
    const { id_producto, cantidad } = req.body;
    
    if (!id_producto || !cantidad) {
        return res.status(400).json({ error: 'Producto y cantidad son requeridos' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const productoResult = await client.query(
            'SELECT precio FROM producto WHERE id_producto = $1',
            [id_producto]
        );
        
        if (productoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const precio = productoResult.rows[0].precio;
        
        const existingDetalle = await client.query(
            'SELECT * FROM detalle_pedido WHERE id_pedido = $1 AND id_producto = $2',
            [id, id_producto]
        );
        
        let detalleResult;
        
        if (existingDetalle.rows.length > 0) {
            detalleResult = await client.query(
                'UPDATE detalle_pedido SET cantidad = cantidad + $1 WHERE id_pedido = $2 AND id_producto = $3 RETURNING *',
                [cantidad, id, id_producto]
            );
        } else {
            detalleResult = await client.query(
                'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
                [id, id_producto, cantidad, precio]
            );
        }
        
        const pedidoResult = await client.query(
            'SELECT id_mesa FROM pedido WHERE id_pedido = $1',
            [id]
        );
        
        const id_mesa = pedidoResult.rows[0].id_mesa;
        
        await client.query(
            'UPDATE mesa SET estado = $1 WHERE id_mesa = $2 AND estado != $1',
            ['ocupada', id_mesa]
        );
        
        const totalResult = await client.query(
            'SELECT SUM(subtotal) as total FROM detalle_pedido WHERE id_pedido = $1',
            [id]
        );
        
        await client.query(
            'UPDATE pedido SET total = $1 WHERE id_pedido = $2',
            [totalResult.rows[0].total || 0, id]
        );
        
        await client.query('COMMIT');
        res.status(201).json(detalleResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error al agregar producto' });
    } finally {
        client.release();
    }
};

const eliminarProducto = async (req, res) => {
    const { id, idDetalle } = req.params;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const detalleResult = await client.query(
            'SELECT * FROM detalle_pedido WHERE id_detalle = $1 AND id_pedido = $2',
            [idDetalle, id]
        );
        
        if (detalleResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Detalle no encontrado' });
        }
        
        const detalle = detalleResult.rows[0];
        let finalResult;
        
        if (detalle.cantidad > 1) {
            finalResult = await client.query(
                'UPDATE detalle_pedido SET cantidad = cantidad - 1 WHERE id_detalle = $1 RETURNING *',
                [idDetalle]
            );
        } else {
            finalResult = await client.query(
                'DELETE FROM detalle_pedido WHERE id_detalle = $1 RETURNING *',
                [idDetalle]
            );
        }
        
        const pedidoResult = await client.query(
            'SELECT id_mesa FROM pedido WHERE id_pedido = $1',
            [id]
        );
        
        const id_mesa = pedidoResult.rows[0].id_mesa;
        
        const totalResult = await client.query(
            'SELECT SUM(subtotal) as total FROM detalle_pedido WHERE id_pedido = $1',
            [id]
        );
        
        const itemsCount = await client.query(
            'SELECT COUNT(*) as count FROM detalle_pedido WHERE id_pedido = $1',
            [id]
        );
        
        if (parseInt(itemsCount.rows[0].count) === 0) {
            await client.query(
                'DELETE FROM pedido WHERE id_pedido = $1',
                [id]
            );
            
            await client.query(
                'UPDATE mesa SET estado = $1 WHERE id_mesa = $2',
                ['disponible', id_mesa]
            );
            
            await client.query('COMMIT');
            return res.json({ message: 'Producto eliminado del pedido. Orden vacía cancelada.' });
        } else {
            await client.query(
                'UPDATE pedido SET total = $1 WHERE id_pedido = $2',
                [totalResult.rows[0].total || 0, id]
            );
        }
        
        await client.query('COMMIT');
        res.json(finalResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    } finally {
        client.release();
    }
};

const finalizarPedido = async (req, res) => {
    const { id } = req.params;
    const { metodo_pago } = req.body;
    
    if (!metodo_pago) {
        return res.status(400).json({ error: 'Método de pago es requerido' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const pedidoResult = await client.query(
            'SELECT * FROM pedido WHERE id_pedido = $1',
            [id]
        );
        
        if (pedidoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        const pedido = pedidoResult.rows[0];
        
        await client.query(
            'UPDATE pedido SET estado = $1 WHERE id_pedido = $2',
            ['finalizado', id]
        );
        
        await client.query(
            'UPDATE mesa SET estado = $1 WHERE id_mesa = $2',
            ['disponible', pedido.id_mesa]
        );
        
        const facturaResult = await client.query(
            'INSERT INTO factura (id_pedido, metodo_pago, total) VALUES ($1, $2, $3) RETURNING *',
            [id, metodo_pago, pedido.total]
        );
        
        const detallesResult = await client.query(`
            SELECT dp.*, pr.nombre as producto_nombre
            FROM detalle_pedido dp
            JOIN producto pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = $1
        `, [id]);
        
        await client.query('COMMIT');
        
        res.json({
            pedido: pedido,
            factura: facturaResult.rows[0],
            detalles: detallesResult.rows
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al finalizar pedido:', error);
        res.status(500).json({ error: 'Error al finalizar pedido' });
    } finally {
        client.release();
    }
};

const obtenerPedidoPorMesa = async (req, res) => {
    const { idMesa } = req.params;
    
    try {
        const pedidoResult = await pool.query(`
            SELECT p.*, u.nombre || ' ' || u.apellido as mesero, m.numero_mesa
            FROM pedido p
            LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
            LEFT JOIN mesa m ON p.id_mesa = m.id_mesa
            WHERE p.id_mesa = $1 AND p.estado = 'en curso'
            ORDER BY p.fecha_hora DESC
            LIMIT 1
        `, [idMesa]);
        
        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ error: 'No hay pedido activo para esta mesa' });
        }
        
        const detallesResult = await pool.query(`
            SELECT dp.*, pr.nombre as producto_nombre
            FROM detalle_pedido dp
            JOIN producto pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = $1
        `, [pedidoResult.rows[0].id_pedido]);
        
        const pedido = pedidoResult.rows[0];
        pedido.detalles = detallesResult.rows;
        
        res.json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido por mesa:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
};

module.exports = {
    listarPedidos,
    obtenerPedido,
    obtenerPedidoPorMesa,
    crearPedido,
    actualizarPedido,
    agregarProducto,
    eliminarProducto,
    finalizarPedido
};


