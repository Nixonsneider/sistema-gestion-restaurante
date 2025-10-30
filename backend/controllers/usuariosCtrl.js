// controllers/usuariosCtrl.js
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

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        next(error);
    }
};

const listarUsuarios = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM usuario');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

module.exports = { crearUsuario, listarUsuarios };


