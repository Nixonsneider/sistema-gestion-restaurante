// server.js - usando dotenv para variables sensibles
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

(async () => {
    try {
        await client.connect();
        console.log('✅ Conectado (dotenv)');
        const { rows } = await client.query('SELECT version()');
        console.log('Postgres version:', rows[0]);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
})();
