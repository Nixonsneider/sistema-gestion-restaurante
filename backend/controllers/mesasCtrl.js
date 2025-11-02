const pool = require('../db');

const listarMesas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mesa ORDER BY numero_mesa');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar mesas:', error);
        res.status(500).json({ error: 'Error al obtener mesas' });
    }
};

const crearMesa = async (req, res) => {
    const { numero_mesa, capacidad, estado } = req.body;
    
    if (!numero_mesa || !capacidad) {
        return res.status(400).json({ error: 'Número de mesa y capacidad son requeridos' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO mesa (numero_mesa, capacidad, estado) VALUES ($1, $2, $3) RETURNING *',
            [numero_mesa, capacidad, estado || 'disponible']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear mesa:', error);
        res.status(500).json({ error: 'Error al crear mesa' });
    }
};

const actualizarMesa = async (req, res) => {
    const { id } = req.params;
    const { numero_mesa, capacidad, estado } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE mesa SET numero_mesa = $1, capacidad = $2, estado = $3 WHERE id_mesa = $4 RETURNING *',
            [numero_mesa, capacidad, estado, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar mesa:', error);
        res.status(500).json({ error: 'Error al actualizar mesa' });
    }
};

const eliminarMesa = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM mesa WHERE id_mesa = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        
        res.json({ message: 'Mesa eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar mesa:', error);
        res.status(500).json({ error: 'Error al eliminar mesa' });
    }
};

const reservarMesa = async (req, res) => {
    const { id } = req.params;
    
    try {
        const mesaResult = await pool.query('SELECT * FROM mesa WHERE id_mesa = $1', [id]);
        
        if (mesaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        
        const mesa = mesaResult.rows[0];
        
        if (mesa.estado !== 'disponible') {
            return res.status(400).json({ error: 'La mesa no está disponible para reservar' });
        }
        
        const result = await pool.query(
            'UPDATE mesa SET estado = $1 WHERE id_mesa = $2 RETURNING *',
            ['reservado', id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al reservar mesa:', error);
        res.status(500).json({ error: 'Error al reservar mesa' });
    }
};

module.exports = {
    listarMesas,
    crearMesa,
    actualizarMesa,
    eliminarMesa,
    reservarMesa
};


