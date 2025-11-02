require('dotenv').config();
const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

app.use(express.json());

const usuariosRouter = require('./routes/usuarios');
app.use('/usuarios', usuariosRouter);

const loginRouter = require('./routes/login');
app.use('/login', loginRouter);

const productosRouter = require('./routes/productos');
app.use('/productos', productosRouter);

const mesasRouter = require('./routes/mesas');
app.use('/mesas', mesasRouter);

const pedidosRouter = require('./routes/pedidos');
app.use('/pedidos', pedidosRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
