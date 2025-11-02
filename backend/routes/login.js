const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try {
        const { email: rawEmail, contrasena: rawContrasena } = req.body;

        if (!rawEmail || !rawContrasena) {
            return res.status(400).json({ error: 'Email y contrasena son obligatorios' });
        }

        const email = String(rawEmail).trim().toLowerCase();
        const contrasena = String(rawContrasena).trim();

        const result = await pool.query('SELECT * FROM usuario WHERE LOWER(email) = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        const dbPass = user.contrasena ?? user.contraseña ?? user.password ?? '';

        if (dbPass.trim() !== contrasena) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const safeUser = { 
            id_usuario: user.id_usuario, 
            nombre: user.nombre, 
            apellido: user.apellido, 
            email: user.email, 
            rol: user.rol 
        };
        
        return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: safeUser });

    } catch (err) {
        console.error('Error /login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
