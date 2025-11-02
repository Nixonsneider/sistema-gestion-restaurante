const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        window.location.href = '../index.html';
        return;
    }
    
    if (usuario.rol !== 'administrativo') {
        alert('Acceso denegado. Solo usuarios administrativos pueden acceder a este panel.');
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('userName').textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById('userRole').textContent = usuario.rol;
    
    loadProductos();
    
    setupNavigation();
    setupModalHandlers();
    setupLogout();
    setupMobileMenu();
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const sectionName = this.dataset.section;
            showSection(sectionName);
        });
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    const titles = {
        'productos': 'Gestión de Productos',
        'usuarios': 'Gestión de Usuarios',
        'mesas': 'Gestión de Mesas',
        'pedidos': 'Gestión de Pedidos'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName];
    
    switch(sectionName) {
        case 'productos':
            loadProductos();
            break;
        case 'usuarios':
            loadUsuarios();
            break;
        case 'mesas':
            loadMesas();
            break;
        case 'pedidos':
            loadPedidos();
            break;
    }
}

async function loadProductos() {
    const tbody = document.getElementById('productosTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando productos...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        displayProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Error al cargar productos</td></tr>';
    }
}

function displayProductos(productos) {
    const tbody = document.getElementById('productosTableBody');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay productos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.id_producto}</td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>$${p.precio}</td>
            <td><span class="badge ${p.disponible ? 'badge-success' : 'badge-danger'}">${p.disponible ? 'Disponible' : 'No disponible'}</span></td>
            <td>
                <button class="btn-edit" onclick="editProducto(${p.id_producto})">Editar</button>
                <button class="btn-delete" onclick="deleteProducto(${p.id_producto})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnAddProducto').addEventListener('click', function() {
    showModal('Agregar Producto', `
        <form id="formProducto">
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" name="nombre" required>
            </div>
            <div class="form-group">
                <label>Categoría</label>
                <select name="categoria" required>
                    <option value="">Seleccionar...</option>
                    <option value="Entradas">Entradas</option>
                    <option value="Platos Principales">Platos Principales</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Hamburguesas">Hamburguesas</option>
                    <option value="Ensaladas">Ensaladas</option>
                    <option value="Postres">Postres</option>
                    <option value="Bebidas">Bebidas</option>
                </select>
            </div>
            <div class="form-group">
                <label>Precio</label>
                <input type="number" name="precio" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Disponible</label>
                <select name="disponible" required>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar</button>
            </div>
        </form>
    `);
    
    document.getElementById('formProducto').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const producto = {
            nombre: formData.get('nombre'),
            categoria: formData.get('categoria'),
            precio: parseFloat(formData.get('precio')),
            disponible: formData.get('disponible') === 'true'
        };
        
        try {
            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(producto)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Producto creado exitosamente');
                closeModal();
                loadProductos();
            } else {
                alert('Error: ' + (data.error || 'No se pudo crear el producto'));
            }
        } catch (error) {
            console.error('Error al crear producto:', error);
            alert('Error al conectar con el servidor');
        }
    });
});

async function editProducto(id) {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        const producto = productos.find(p => p.id_producto === id);
        
        if (!producto) {
            alert('Producto no encontrado');
            return;
        }
        
        showModal('Editar Producto', `
            <form id="formEditProducto">
                <div class="form-group">
                    <label>Nombre del Producto</label>
                    <input type="text" name="nombre" value="${producto.nombre}" required>
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select name="categoria" required>
                        <option value="">Seleccionar...</option>
                        <option value="Entradas" ${producto.categoria === 'Entradas' ? 'selected' : ''}>Entradas</option>
                        <option value="Platos Principales" ${producto.categoria === 'Platos Principales' ? 'selected' : ''}>Platos Principales</option>
                        <option value="Pizzas" ${producto.categoria === 'Pizzas' ? 'selected' : ''}>Pizzas</option>
                        <option value="Hamburguesas" ${producto.categoria === 'Hamburguesas' ? 'selected' : ''}>Hamburguesas</option>
                        <option value="Ensaladas" ${producto.categoria === 'Ensaladas' ? 'selected' : ''}>Ensaladas</option>
                        <option value="Postres" ${producto.categoria === 'Postres' ? 'selected' : ''}>Postres</option>
                        <option value="Bebidas" ${producto.categoria === 'Bebidas' ? 'selected' : ''}>Bebidas</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Precio</label>
                    <input type="number" name="precio" step="0.01" min="0" value="${producto.precio}" required>
                </div>
                <div class="form-group">
                    <label>Disponible</label>
                    <select name="disponible" required>
                        <option value="true" ${producto.disponible ? 'selected' : ''}>Sí</option>
                        <option value="false" ${!producto.disponible ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Actualizar</button>
                </div>
            </form>
        `);
        
        document.getElementById('formEditProducto').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const productoActualizado = {
                nombre: formData.get('nombre'),
                categoria: formData.get('categoria'),
                precio: parseFloat(formData.get('precio')),
                disponible: formData.get('disponible') === 'true'
            };
            
            try {
                const updateResponse = await fetch(`${API_URL}/productos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productoActualizado)
                });
                
                const data = await updateResponse.json();
                
                if (updateResponse.ok) {
                    alert('Producto actualizado exitosamente');
                    closeModal();
                    loadProductos();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar el producto'));
                }
            } catch (error) {
                console.error('Error al actualizar producto:', error);
                alert('Error al conectar con el servidor');
            }
        });
    } catch (error) {
        console.error('Error al cargar producto:', error);
        alert('Error al cargar el producto');
    }
}

async function deleteProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            const response = await fetch(`${API_URL}/productos/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Producto eliminado exitosamente');
                loadProductos();
            } else {
                alert('Error: ' + (data.error || 'No se pudo eliminar el producto'));
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al conectar con el servidor');
        }
    }
}

async function loadUsuarios() {
    const tbody = document.getElementById('usuariosTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando usuarios...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const usuarios = await response.json();
        displayUsuarios(usuarios);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Error al cargar usuarios</td></tr>';
    }
}

function displayUsuarios(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay usuarios registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.id_usuario}</td>
            <td>${u.nombre}</td>
            <td>${u.apellido}</td>
            <td>${u.email}</td>
            <td><span class="badge ${u.rol === 'administrativo' ? 'badge-info' : 'badge-warning'}">${u.rol}</span></td>
            <td>
                <button class="btn-edit" onclick="editUsuario(${u.id_usuario})">Editar</button>
                <button class="btn-delete" onclick="deleteUsuario(${u.id_usuario})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnAddUsuario').addEventListener('click', function() {
    showModal('Agregar Usuario', `
        <form id="formUsuario">
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" required>
            </div>
            <div class="form-group">
                <label>Apellido</label>
                <input type="text" name="apellido" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="contrasena" required>
            </div>
            <div class="form-group">
                <label>Rol</label>
                <select name="rol" required>
                    <option value="">Seleccionar...</option>
                    <option value="mesero">Mesero</option>
                    <option value="administrativo">Administrativo</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar</button>
            </div>
        </form>
    `);
    
    document.getElementById('formUsuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const usuario = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            email: formData.get('email'),
            contrasena: formData.get('contrasena'),
            rol: formData.get('rol')
        };
        
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Usuario creado exitosamente');
                closeModal();
                loadUsuarios();
            } else {
                alert('Error: ' + (data.error || 'No se pudo crear el usuario'));
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Error al conectar con el servidor');
        }
    });
});

async function editUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        
        if (!response.ok) {
            alert('Usuario no encontrado');
            return;
        }
        
        const usuario = await response.json();
        showEditUsuarioModal(usuario);
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        alert('Error al cargar el usuario');
    }
}

function showEditUsuarioModal(usuario) {
    showModal('Editar Usuario', `
        <form id="formEditUsuario">
            <div class="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value="${usuario.nombre}" required>
            </div>
            <div class="form-group">
                <label>Apellido</label>
                <input type="text" name="apellido" value="${usuario.apellido}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${usuario.email}" required>
            </div>
            <div class="form-group">
                <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
                <input type="password" name="contrasena" placeholder="Dejar vacío para mantener">
            </div>
            <div class="form-group">
                <label>Rol</label>
                <select name="rol" required>
                    <option value="">Seleccionar...</option>
                    <option value="mesero" ${usuario.rol === 'mesero' ? 'selected' : ''}>Mesero</option>
                    <option value="administrativo" ${usuario.rol === 'administrativo' ? 'selected' : ''}>Administrativo</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">Actualizar</button>
            </div>
        </form>
    `);
    
    document.getElementById('formEditUsuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const usuarioActualizado = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            email: formData.get('email'),
            contrasena: formData.get('contrasena'),
            rol: formData.get('rol')
        };
        
        try {
            const updateResponse = await fetch(`${API_URL}/usuarios/${usuario.id_usuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuarioActualizado)
            });
            
            const data = await updateResponse.json();
            
            if (updateResponse.ok) {
                alert('Usuario actualizado exitosamente');
                closeModal();
                loadUsuarios();
            } else {
                alert('Error: ' + (data.error || 'No se pudo actualizar el usuario'));
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            alert('Error al conectar con el servidor');
        }
    });
}

async function deleteUsuario(id) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Usuario eliminado exitosamente');
                loadUsuarios();
            } else {
                alert('Error: ' + (data.error || 'No se pudo eliminar el usuario'));
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al conectar con el servidor');
        }
    }
}

async function loadMesas() {
    const tbody = document.getElementById('mesasTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Cargando mesas...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/mesas`);
        const mesas = await response.json();
        displayMesas(mesas);
    } catch (error) {
        console.error('Error al cargar mesas:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error al cargar mesas</td></tr>';
    }
}

function displayMesas(mesas) {
    const tbody = document.getElementById('mesasTableBody');
    
    if (mesas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay mesas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = mesas.map(m => `
        <tr>
            <td>${m.id_mesa}</td>
            <td>Mesa ${m.numero_mesa}</td>
            <td>${m.capacidad} personas</td>
            <td><span class="badge ${m.estado === 'disponible' ? 'badge-success' : 'badge-danger'}">${m.estado}</span></td>
            <td>
                <button class="btn-edit" onclick="editMesa(${m.id_mesa})">Editar</button>
                <button class="btn-delete" onclick="deleteMesa(${m.id_mesa})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnAddMesa').addEventListener('click', function() {
    showModal('Agregar Mesa', `
        <form id="formMesa">
            <div class="form-group">
                <label>Número de Mesa</label>
                <input type="number" name="numero_mesa" min="1" required>
            </div>
            <div class="form-group">
                <label>Capacidad</label>
                <input type="number" name="capacidad" min="1" required>
            </div>
            <div class="form-group">
                <label>Estado</label>
                <select name="estado" required>
                    <option value="disponible">Disponible</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="reservada">Reservada</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar</button>
            </div>
        </form>
    `);
    
    document.getElementById('formMesa').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const mesa = {
            numero_mesa: parseInt(formData.get('numero_mesa')),
            capacidad: parseInt(formData.get('capacidad')),
            estado: formData.get('estado')
        };
        
        try {
            const response = await fetch(`${API_URL}/mesas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mesa)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Mesa creada exitosamente');
                closeModal();
                loadMesas();
            } else {
                alert('Error: ' + (data.error || 'No se pudo crear la mesa'));
            }
        } catch (error) {
            console.error('Error al crear mesa:', error);
            alert('Error al conectar con el servidor');
        }
    });
});

async function editMesa(id) {
    try {
        const response = await fetch(`${API_URL}/mesas`);
        const mesas = await response.json();
        const mesa = mesas.find(m => m.id_mesa === id);
        
        if (!mesa) {
            alert('Mesa no encontrada');
            return;
        }
        
        showModal('Editar Mesa', `
            <form id="formEditMesa">
                <div class="form-group">
                    <label>Número de Mesa</label>
                    <input type="number" name="numero_mesa" min="1" value="${mesa.numero_mesa}" required>
                </div>
                <div class="form-group">
                    <label>Capacidad</label>
                    <input type="number" name="capacidad" min="1" value="${mesa.capacidad}" required>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select name="estado" required>
                        <option value="disponible" ${mesa.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
                        <option value="ocupada" ${mesa.estado === 'ocupada' ? 'selected' : ''}>Ocupada</option>
                        <option value="reservada" ${mesa.estado === 'reservada' ? 'selected' : ''}>Reservada</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Actualizar</button>
                </div>
            </form>
        `);
        
        document.getElementById('formEditMesa').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const mesaActualizada = {
                numero_mesa: parseInt(formData.get('numero_mesa')),
                capacidad: parseInt(formData.get('capacidad')),
                estado: formData.get('estado')
            };
            
            try {
                const updateResponse = await fetch(`${API_URL}/mesas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(mesaActualizada)
                });
                
                const data = await updateResponse.json();
                
                if (updateResponse.ok) {
                    alert('Mesa actualizada exitosamente');
                    closeModal();
                    loadMesas();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar la mesa'));
                }
            } catch (error) {
                console.error('Error al actualizar mesa:', error);
                alert('Error al conectar con el servidor');
            }
        });
    } catch (error) {
        console.error('Error al cargar mesa:', error);
        alert('Error al cargar la mesa');
    }
}

async function deleteMesa(id) {
    if (confirm('¿Estás seguro de eliminar esta mesa?')) {
        try {
            const response = await fetch(`${API_URL}/mesas/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Mesa eliminada exitosamente');
                loadMesas();
            } else {
                alert('Error: ' + (data.error || 'No se pudo eliminar la mesa'));
            }
        } catch (error) {
            console.error('Error al eliminar mesa:', error);
            alert('Error al conectar con el servidor');
        }
    }
}

async function loadPedidos() {
    const tbody = document.getElementById('pedidosTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Cargando pedidos...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        const pedidos = await response.json();
        const pedidosEnCurso = pedidos.filter(p => p.estado === 'en curso');
        displayPedidos(pedidosEnCurso);
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Error al cargar pedidos</td></tr>';
    }
}

function displayPedidos(pedidos) {
    const tbody = document.getElementById('pedidosTableBody');
    
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay pedidos en curso</td></tr>';
        return;
    }
    
    tbody.innerHTML = pedidos.map(p => {
        const fecha = new Date(p.fecha_hora);
        const fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const estadoLabel = p.estado === 'en curso' ? 'En Curso' : p.estado === 'finalizado' ? 'Finalizado' : p.estado;
        
        return `
        <tr>
            <td>${p.id_pedido}</td>
            <td>Mesa ${p.numero_mesa}</td>
            <td>${p.mesero || 'N/A'}</td>
            <td>${fechaFormateada}</td>
            <td><span class="badge ${p.estado === 'finalizado' ? 'finalizado' : 'en-curso'}">${estadoLabel}</span></td>
            <td>$${parseFloat(p.total || 0).toFixed(2)}</td>
            <td>
                <button class="btn-edit" onclick="viewPedido(${p.id_pedido})">Ver</button>
                ${p.estado === 'en curso' ? `<button class="btn-primary" onclick="finalizarPedidoAdmin(${p.id_pedido})" style="margin-left: 5px; padding: 4px 12px;">Finalizar</button>` : ''}
            </td>
        </tr>
        `;
    }).join('');
}

async function viewPedido(id) {
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}`);
        const pedido = await response.json();
        
        const detallesHTML = pedido.detalles.map(d => `
            <tr>
                <td style="padding: 8px;">${d.cantidad}x ${d.producto_nombre}</td>
                <td style="padding: 8px; text-align: right;">$${parseFloat(d.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');
        
        const estadoLabel = pedido.estado === 'en curso' ? 'En Curso' : pedido.estado === 'finalizado' ? 'Finalizado' : pedido.estado;
        
        showModal('Detalles del Pedido', `
            <div style="margin-bottom: 20px;">
                <p style="margin-bottom: 8px;"><strong>ID:</strong> ${pedido.id_pedido}</p>
                <p style="margin-bottom: 8px;"><strong>Mesa:</strong> ${pedido.numero_mesa}</p>
                <p style="margin-bottom: 8px;"><strong>Mesero:</strong> ${pedido.mesero || 'N/A'}</p>
                <p style="margin-bottom: 8px;"><strong>Estado:</strong> <span class="badge ${pedido.estado === 'finalizado' ? 'finalizado' : 'en-curso'}">${estadoLabel}</span></p>
                <p style="margin-bottom: 8px;"><strong>Total:</strong> $${parseFloat(pedido.total || 0).toFixed(2)}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #e0e0e0;">
                        <th style="text-align: left; padding: 10px;">Productos</th>
                        <th style="text-align: right; padding: 10px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${detallesHTML}
                </tbody>
            </table>
        `);
    } catch (error) {
        console.error('Error al cargar pedido:', error);
        alert('Error al cargar los detalles del pedido');
    }
}

async function finalizarPedidoAdmin(id) {
    if (!confirm('¿Finalizar este pedido? Esto marcará la mesa como disponible.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}/finalizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                metodo_pago: 'efectivo'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Pedido finalizado exitosamente');
            closeModal();
            loadPedidos();
        } else {
            alert('Error: ' + (data.error || 'No se pudo finalizar el pedido'));
        }
    } catch (error) {
        console.error('Error al finalizar pedido:', error);
        alert('Error al conectar con el servidor');
    }
}

function setupModalHandlers() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function setupLogout() {
    document.getElementById('btnLogout').addEventListener('click', function() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            localStorage.removeItem('usuario');
            window.location.href = '../index.html';
        }
    });
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const overlay = document.getElementById('sidebarOverlay');
    
    menuToggle.addEventListener('click', function() {
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
            if (window.innerWidth <= 1024) {
                overlay.classList.add('active');
            }
        } else {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
            overlay.classList.remove('active');
        }
    });
    
    overlay.addEventListener('click', function() {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
        overlay.classList.remove('active');
    });
}

