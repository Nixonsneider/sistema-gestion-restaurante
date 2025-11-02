const pool = require('../db');

const listarProductos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM producto ORDER BY id_producto');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, categoria, precio, disponible } = req.body;
    
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO producto (nombre, categoria, precio, disponible) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, categoria, precio, disponible !== undefined ? disponible : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, precio, disponible } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE producto SET nombre = $1, categoria = $2, precio = $3, disponible = $4 WHERE id_producto = $5 RETURNING *',
            [nombre, categoria, precio, disponible, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM producto WHERE id_producto = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

module.exports = {
    listarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};


