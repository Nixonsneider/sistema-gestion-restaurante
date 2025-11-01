// server.js
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Importar rutas
const usuariosRouter = require('./routes/usuarios');
app.use('/usuarios', usuariosRouter);

const loginRouter = require('./routes/login');
app.use('/login', loginRouter);


// Middleware de error
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
