// routes/login.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try {
        const { email: rawEmail, contrasena: rawContrasena } = req.body;

        console.log('--- POST /login recibido ---');
        console.log('Body:', req.body);

        if (!rawEmail || !rawContrasena) {
            return res.status(400).json({ error: 'Email y contrasena son obligatorios' });
        }

        const email = String(rawEmail).trim().toLowerCase();
        const contrasena = String(rawContrasena).trim();

        // Buscar usuario por email (convertimos email a lower para evitar mismatches)
        const result = await pool.query('SELECT * FROM usuario WHERE LOWER(email) = $1', [email]);

        if (result.rows.length === 0) {
            console.log('Login fallido: usuario no encontrado para', email);
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        // Aceptamos ambas variantes de nombre de columna por si quedó contraseña con ñ
        const dbPass = user.contrasena ?? user.contraseña ?? user.password ?? '';

        console.log('Usuario DB encontrado:', { id_usuario: user.id_usuario, email: user.email, dbPass });

        if (dbPass.trim() !== contrasena) {
            console.log('Login fallido: contrasena no coincide. peticion=', contrasena, 'bd=', dbPass);
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Si todo ok:
        // (En producción aquí crearías un token JWT o sesión en vez de enviar la contraseña)
        const safeUser = { id_usuario: user.id_usuario, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol };
        return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: safeUser });

    } catch (err) {
        console.error('Error /login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
