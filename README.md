# SmartRest - Sistema de Gestión de Restaurante

Aplicación web completa para la gestión de un restaurante, con panel administrativo y interfaz de mesero. Incluye gestión de pedidos, mesas, productos, usuarios y generación automática de facturas.

## 🌟 Características

### Panel Administrativo
- **Gestión de Productos**: Crear, editar, eliminar y categorizar productos del menú con precios y disponibilidad
- **Gestión de Usuarios**: Administrar cuentas de meseros y administradores del sistema
- **Gestión de Mesas**: Configurar capacidad y estado de las mesas del restaurante
- **Gestión de Pedidos**: Ver pedidos activos en tiempo real, detalles completos y finalizar órdenes

### Interfaz de Mesero
- **Vista de Mesas**: Visualización intuitiva del estado de todas las mesas en tiempo real
- **Gestión de Pedidos**: Crear órdenes, agregar productos, modificar cantidades fácilmente
- **Sistema de Reservas**: Reservar mesas con un solo clic
- **Finalización de Pedidos**: Generar facturas automáticamente con recibos imprimibles

## 🚀 Inicio Rápido

### Acceso al Sistema
1. Ingresa tus credenciales en la pantalla de inicio
2. Selecciona tu rol (Administrativo o Mesero)
3. Accede a tu panel correspondiente

### Credenciales de Acceso

#### 👔 Administrador
- **Email:** admintest@gmail.com
- **Password:** 1234
- **Acceso:** Panel administrativo completo con todas las funcionalidades

#### 👨‍🍳 Mesero
- **Email:** waitertest@gmail.com
- **Password:** 1234
- **Acceso:** Interfaz de mesero para gestionar pedidos

## 📋 Guía de Uso

### Para Meseros

#### 1. Ver y Gestionar Mesas
- **Mesas Verdes** (Disponible): Mesas libres para atender
- **Mesas Rojas** (Ocupada): Mesas con pedidos activos
- **Mesas Grises** (Reservada): Mesas reservadas
- Haz clic en el botón "Reservar" para reservar una mesa disponible

#### 2. Crear un Pedido
1. Haz clic en una **mesa disponible** (verde) para abrirla
2. Se crea automáticamente un pedido vacío
3. La mesa cambia a estado "ocupada" cuando agregas el primer producto

#### 3. Agregar Productos
1. **Busca productos** usando la barra de búsqueda
2. Haz clic en el botón **"+"** para agregar productos al pedido
3. Los productos se agregan al resumen del pedido en tiempo real

#### 4. Modificar Pedido
- **Eliminar producto**: Haz clic en el botón **"×"** junto al producto
- **Reducir cantidad**: Se reduce automáticamente al eliminar
- **Cancelar orden**: Si eliminas todos los productos, la orden se cancela y la mesa queda disponible

#### 5. Finalizar Pedido
1. Revisa el resumen del pedido y el total
2. Haz clic en **"Finalizar Pedido"**
3. Se genera automáticamente la factura
4. Visualiza o imprime el recibo
5. La mesa vuelve a estado disponible

### Para Administradores

#### Gestión de Productos
**Agregar Producto:**
1. Ve a "Gestión de Productos"
2. Haz clic en "+ Agregar Producto"
3. Completa el formulario: nombre, categoría, precio y disponibilidad
4. Guarda el producto

**Editar Producto:**
- Haz clic en "Editar" junto al producto
- Modifica la información necesaria
- Guarda los cambios

**Eliminar Producto:**
- Haz clic en "Eliminar" junto al producto
- Confirma la eliminación

**Categorías Disponibles:**
- Entradas
- Platos Principales
- Pizzas
- Hamburguesas
- Ensaladas
- Postres
- Bebidas

#### Gestión de Usuarios
**Agregar Usuario:**
1. Ve a "Gestión de Usuarios"
2. Haz clic en "+ Agregar Usuario"
3. Completa: nombre, apellido, email, contraseña y rol
4. Guarda el usuario

**Editar Usuario:**
- Haz clic en "Editar"
- Modifica la información (contraseña opcional)
- Guarda los cambios

**Eliminar Usuario:**
- Haz clic en "Eliminar"
- Confirma la eliminación

#### Gestión de Mesas
**Agregar Mesa:**
1. Ve a "Gestión de Mesas"
2. Haz clic en "+ Agregar Mesa"
3. Define número de mesa y capacidad
4. Guarda la mesa

**Editar Mesa:**
- Modifica número, capacidad o estado
- Los cambios se aplican inmediatamente

**Eliminar Mesa:**
- Elimina mesas que ya no se usan
- Confirma la eliminación

#### Gestión de Pedidos
**Ver Pedidos Activos:**
- Ve a "Gestión de Pedidos"
- Visualiza todos los pedidos en curso
- Ver detalles de cada pedido

**Finalizar Pedidos:**
- Haz clic en "Ver" para ver detalles completos
- Haz clic en "Finalizar" para completar el pedido
- Se genera automáticamente la factura
- La mesa queda disponible

## 🎨 Interfaz y Características Visuales

### Diseño Responsivo
- **Desktop**: Sidebar completo con navegación lateral
- **Tablet**: Sidebar colapsable con menú hamburguesa
- **Móvil**: Vista optimizada con sidebar compacto

### Notificaciones
- **Verde** (Success): Operaciones exitosas
- **Rojo** (Error): Errores o problemas
- **Naranja** (Warning): Advertencias importantes
- **Azul** (Info): Información relevante

### Estado de Mesas
- **Verde**: Disponible para clientes
- **Rojo**: Ocupada con pedido activo
- **Gris**: Reservada

### Navegación
- **Sidebar**: Menú principal con acceso rápido
- **Menú Hamburguesa**: Para pantallas pequeñas
- **Atajos**: Botones de acción directa

## 🔔 Funcionalidades Avanzadas

### Sistema de Reservas
- Reserva mesas con un solo clic
- Las mesas reservadas se muestran en gris
- Las mesas reservadas pueden abrirse para crear pedidos

### Gestión Automática
- **Ocupación automática**: La mesa se ocupa al agregar el primer producto
- **Liberación automática**: La mesa se libera al finalizar o cancelar el pedido
- **Cancelación inteligente**: Los pedidos vacíos se cancelan automáticamente
- **Factura automática**: Se genera al finalizar cada pedido

### Búsqueda y Filtrado
- Busca productos por nombre o categoría
- Filtrado en tiempo real mientras escribes
- Interfaz intuitiva y rápida

### Gestión de Cantidades
- Aumenta productos fácilmente
- Reduce cantidades automáticamente
- Elimina productos individuales
- Cálculo automático de totales

## 📱 Tips de Uso

### Para Meseros
- ✅ Usa la búsqueda para encontrar productos rápidamente
- ✅ Revisa el total antes de finalizar
- ✅ Reserva mesas con anticipación
- ✅ Cancela pedidos vacíos para liberar mesas

### Para Administradores
- ✅ Mantén los precios actualizados
- ✅ Marca productos como no disponibles cuando se agoten
- ✅ Revisa pedidos activos regularmente
- ✅ Gestiona usuarios según necesidades

### Accesibilidad
- Teclas de acceso directo para acciones comunes
- Navegación por teclado
- Feedback visual en cada acción
- Mensajes claros y concisos

## 🛡️ Seguridad

- Autenticación requerida para acceder
- Validación de roles y permisos
- Sesiones seguras
- Datos protegidos en todo momento

## 📊 Resumen de Estados

### Estados de Mesa
| Estado | Color | Descripción |
|--------|-------|-------------|
| Disponible | Verde | Mesa libre para clientes |
| Ocupada | Rojo | Mesa con pedido activo |
| Reservada | Gris | Mesa reservada |

### Estados de Producto
| Estado | Badge | Descripción |
|--------|-------|-------------|
| Disponible | Verde | Producto en stock |
| No Disponible | Rojo | Producto agotado |

### Estados de Pedido
| Estado | Descripción |
|--------|-------------|
| En Curso | Pedido activo, agregando productos |
| Finalizado | Pedido completado, factura generada |

## 🔧 Soporte

Si experimentas algún problema:
1. Verifica tu conexión a internet
2. Recarga la página
3. Cierra sesión y vuelve a iniciar sesión
4. Contacta al administrador del sistema

## 📝 Notas Importantes

- ⚠️ Los cambios en productos afectan pedidos futuros, no pedidos activos
- ⚠️ Al eliminar usuarios, asegúrate de que no tengan pedidos activos
- ⚠️ Las mesas deben liberarse manualmente si el sistema detecta un problema
- ✅ Los datos se guardan automáticamente en cada acción
- ✅ Las facturas se generan de forma permanente

## 🎯 Flujo de Trabajo Recomendado

### Turno Matutino/Vespertino
1. Verificar estado de todas las mesas
2. Revisar productos disponibles
3. Actualizar precios si es necesario
4. Iniciar sesión para comenzar a atender

### Durante el Servicio
1. Reservar mesas según expectativa de llegada
2. Abrir mesas cuando lleguen los clientes
3. Agregar productos según orden
4. Finalizar pedidos cuando los clientes terminen

### Al Finalizar
1. Verificar que todas las mesas estén disponibles
2. Revisar pedidos finalizados del día
3. Cerrar sesión correctamente

---

## 🎉 ¡Comienza a gestionar tu restaurante con SmartRest!

Sistema intuitivo, rápido y confiable para la gestión completa de tu restaurante.

**¿Necesitas ayuda?** Consulta esta guía o contacta al soporte técnico.

---

*SmartRest v1.0 - Sistema de Gestión de Restaurante*
