# SmartRest - Guía de Despliegue en VPS

Esta guía te ayudará a desplegar SmartRest en un servidor VPS (Ubuntu/Debian).

## Requisitos Previos

- VPS con Ubuntu 20.04+ o Debian 11+
- Acceso root o sudo
- Dominio apuntando a la IP del VPS (opcional pero recomendado)
- Puerto 80, 443 y 3000 abiertos en el firewall

## Paso 1: Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

## Paso 2: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## Paso 3: Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configurar PostgreSQL

```bash
sudo -u postgres psql
```

En la consola de PostgreSQL:

```sql
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE restaurante;
\q
```

## Paso 4: Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Paso 5: Subir el Código al VPS

### Opción A: Usando Git (Recomendado)

```bash
cd /var/www
sudo git clone https://github.com/TU-USUARIO/sistema-gestion-restaurante.git
sudo chown -R $USER:$USER sistema-gestion-restaurante
cd sistema-gestion-restaurante
```

### Opción B: Usando SCP

Desde tu máquina local:

```bash
scp -r /ruta/local/proyecto usuario@tu-vps-ip:/var/www/
```

## Paso 6: Configurar el Backend

```bash
cd /var/www/sistema-gestion-restaurante/backend
npm install
```

### Crear archivo .env

```bash
nano .env
```

Agregar:

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurante
DB_USER=postgres
DB_PASSWORD=postgres
```

### Crear Base de Datos

```bash
sudo -u postgres psql restaurante < ../database/schema.sql
sudo -u postgres psql restaurante < ../database/sample_users.sql
sudo -u postgres psql restaurante < ../database/sample_products.sql
sudo -u postgres psql restaurante < ../database/sample_tables.sql
```

## Paso 7: Instalar PM2

PM2 mantiene tu aplicación corriendo:

```bash
sudo npm install -g pm2
```

### Iniciar el Backend con PM2

```bash
cd /var/www/sistema-gestion-restaurante/backend
pm2 start server.js --name smartrest-backend
pm2 save
pm2 startup
```

PM2 se iniciará automáticamente al reiniciar el servidor.

## Paso 8: Configurar Nginx como Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/smartrest
```

Agregar:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        root /var/www/sistema-gestion-restaurante;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/smartrest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 9: Configurar SSL con Let's Encrypt (Opcional pero Recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Certbot renovará automáticamente tu certificado.

## Paso 10: Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Paso 11: Actualizar URLs en el Frontend

Edita `js/admin.js`, `js/waiter.js` y `js/index.js`:

Cambiar:
```javascript
const API_URL = 'http://localhost:3000';
```

Por:
```javascript
const API_URL = window.location.origin + '/api';
```

O mejor aún, crear una configuración centralizada.

## Verificar el Despliegue

1. Visita `http://tu-dominio.com` o `http://tu-ip`
2. Prueba el login con las credenciales por defecto
3. Verifica que todas las funcionalidades trabajen

## Comandos Útiles de PM2

```bash
pm2 list                    # Ver procesos
pm2 logs smartrest-backend  # Ver logs
pm2 restart smartrest-backend # Reiniciar
pm2 stop smartrest-backend   # Detener
pm2 delete smartrest-backend # Eliminar
```

## Actualizar el Sistema

Para actualizar:

```bash
cd /var/www/sistema-gestion-restaurante
git pull origin main
cd backend
npm install
pm2 restart smartrest-backend
```

## Resolución de Problemas

### Backend no inicia

```bash
pm2 logs smartrest-backend
sudo systemctl status postgresql
```

### Nginx error 502

```bash
sudo nginx -t
sudo systemctl status nginx
pm2 list
```

### Base de datos no conecta

```bash
sudo -u postgres psql
\l
\c restaurante
```

## Configuración de Backups (Opcional)

Crear backup diario de la base de datos:

```bash
sudo crontab -e
```

Agregar:

```
0 2 * * * pg_dump -U postgres restaurante > /backup/restaurante_$(date +\%Y\%m\%d).sql
```

## Contacto y Soporte

Para problemas o consultas, revisa los logs de PM2 y Nginx.

