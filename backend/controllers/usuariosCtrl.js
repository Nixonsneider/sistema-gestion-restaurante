const pool = require('../db');

const crearUsuario = async (req, res, next) => {
    try {
        const { nombre, apellido, email, contrasena, rol } = req.body;
        if (!nombre || !apellido || !email || !contrasena || !rol) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const query = `
      INSERT INTO usuario (nombre, apellido, email, contrasena, rol)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const values = [nombre, apellido, email, contrasena, rol];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        next(error);
    }
};

const listarUsuarios = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM usuario ORDER BY id_usuario');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const obtenerUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const actualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, contrasena, rol } = req.body;
        
        let query;
        let values;
        
        if (contrasena) {
            query = `
                UPDATE usuario 
                SET nombre = $1, apellido = $2, email = $3, contrasena = $4, rol = $5
                WHERE id_usuario = $6
                RETURNING *;
            `;
            values = [nombre, apellido, email, contrasena, rol, id];
        } else {
            query = `
                UPDATE usuario 
                SET nombre = $1, apellido = $2, email = $3, rol = $4
                WHERE id_usuario = $5
                RETURNING *;
            `;
            values = [nombre, apellido, email, rol, id];
        }
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        next(error);
    }
};

const eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM usuario WHERE id_usuario = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        next(error);
    }
};

module.exports = { crearUsuario, listarUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario };


