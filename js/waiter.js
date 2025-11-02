const API_URL = 'http://localhost:3000';

let currentOrder = null;
let currentTable = null;
let allProducts = [];
let orderDetails = [];

document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || usuario.rol !== 'mesero') {
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('userName').textContent = `${usuario.nombre} ${usuario.apellido}`;
    
    loadTables();
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('btnLogout').addEventListener('click', function() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            localStorage.removeItem('usuario');
            window.location.href = '../index.html';
        }
    });
    
    document.getElementById('btnBackToTables').addEventListener('click', function() {
        showSection('tables');
        currentOrder = null;
        currentTable = null;
        orderDetails = [];
        loadTables();
    });
    
    document.getElementById('searchProduct').addEventListener('input', function(e) {
        filterProducts(e.target.value);
    });
    
    document.getElementById('btnFinishOrder').addEventListener('click', finishOrder);
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
}

async function loadTables() {
    const grid = document.getElementById('tablesGrid');
    grid.innerHTML = '<div class="loading">Cargando mesas...</div>';
    
    try {
        const response = await fetch(`${API_URL}/mesas`);
        const mesas = await response.json();
        displayTables(mesas);
    } catch (error) {
        console.error('Error al cargar mesas:', error);
        grid.innerHTML = '<div class="loading">Error al cargar mesas</div>';
    }
}

function displayTables(mesas) {
    const grid = document.getElementById('tablesGrid');
    
    if (mesas.length === 0) {
        grid.innerHTML = '<div class="loading">No hay mesas registradas</div>';
        return;
    }
    
    grid.innerHTML = mesas.map(mesa => {
        const estadoLabel = mesa.estado === 'disponible' ? 'Disponible' : 
                           mesa.estado === 'ocupada' ? 'Ocupada' : 
                           mesa.estado === 'reservado' ? 'Reservado' : mesa.estado;
        
        return `
        <div class="table-card ${mesa.estado}" onclick="selectTable(${mesa.id_mesa}, ${mesa.numero_mesa}, '${mesa.estado}')">
            <div class="table-number">Mesa ${mesa.numero_mesa}</div>
            <div class="table-capacity">Capacidad: ${mesa.capacidad} personas</div>
            <span class="table-status ${mesa.estado}">${estadoLabel}</span>
            ${mesa.estado === 'disponible' ? `<button class="btn-reserve" onclick="event.stopPropagation(); reservarMesa(${mesa.id_mesa}, ${mesa.numero_mesa})">Reservar</button>` : ''}
        </div>
        `;
    }).join('');
}

async function selectTable(id, numero, estado) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (estado === 'ocupada') {
        try {
            const response = await fetch(`${API_URL}/pedidos/mesa/${id}`);
            
            if (response.ok) {
                const pedido = await response.json();
                currentOrder = pedido.id_pedido;
                currentTable = id;
                orderDetails = pedido.detalles.map(d => ({
                    id_detalle: d.id_detalle,
                    id_producto: d.id_producto,
                    nombre: d.producto_nombre,
                    cantidad: d.cantidad,
                    precio_unitario: parseFloat(d.precio_unitario),
                    subtotal: parseFloat(d.subtotal)
                }));
                document.getElementById('orderTableNumber').textContent = numero;
                showSection('order');
                updateOrderSummary();
            } else {
                showToast('Error al cargar el pedido existente', 'error');
            }
        } catch (error) {
            console.error('Error al cargar pedido:', error);
            showToast('Error al conectar con el servidor', 'error');
        }
        return;
    }
    
    currentTable = id;
    currentOrder = null;
    orderDetails = [];
    document.getElementById('orderTableNumber').textContent = numero;
    showSection('order');
    updateOrderSummary();
}

async function reservarMesa(id, numero) {
    if (!confirm(`¿Reservar Mesa ${numero}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/mesas/${id}/reservar`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Mesa reservada exitosamente', 'success');
            loadTables();
        } else {
            showToast(data.error || 'No se pudo reservar la mesa', 'error');
        }
    } catch (error) {
        console.error('Error al reservar mesa:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function displayProducts(productos) {
    const list = document.getElementById('productsList');
    
    if (productos.length === 0) {
        list.innerHTML = '<div class="loading">No hay productos disponibles</div>';
        return;
    }
    
    list.innerHTML = productos
        .filter(p => p.disponible)
        .map(p => `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${p.nombre}</div>
                    <div class="product-category">${p.categoria || 'Sin categoría'}</div>
                </div>
                <span class="product-price">$${parseFloat(p.precio).toFixed(2)}</span>
                <button class="btn-add" onclick="addProductToOrder(${p.id_producto}, '${p.nombre}', ${p.precio})">+</button>
            </div>
        `).join('');
}

function filterProducts(search) {
    const filtered = allProducts.filter(p => 
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.categoria && p.categoria.toLowerCase().includes(search.toLowerCase()))
    );
    displayProducts(filtered);
}

async function addProductToOrder(id_producto, nombre, precio) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!currentOrder && currentTable) {
        try {
            const response = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_usuario: usuario.id_usuario,
                    id_mesa: currentTable
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                currentOrder = data.id_pedido;
            } else {
                const data = await response.json();
                showToast(data.error || 'No se pudo crear el pedido', 'error');
                return;
            }
        } catch (error) {
            console.error('Error al crear pedido:', error);
            showToast('Error al conectar con el servidor', 'error');
            return;
        }
    }
    
    if (!currentOrder) {
        showToast('No hay pedido activo', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${currentOrder}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_producto: id_producto,
                cantidad: 1
            })
        });
        
        if (response.ok) {
            await loadOrderDetails();
        } else {
            const data = await response.json();
            showToast(data.error || 'No se pudo agregar el producto', 'error');
        }
    } catch (error) {
        console.error('Error al agregar producto:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
}

async function removeProductFromOrder(id_detalle, id_producto) {
    if (!currentOrder) return;
    
    const currentItem = orderDetails.find(item => item.id_detalle === id_detalle);
    const willBeLastItem = currentItem && currentItem.cantidad === 1 && orderDetails.length === 1;
    
    if (willBeLastItem) {
        if (!confirm('¿Estás seguro de que deseas eliminar el último producto? Esto cancelará la orden.')) {
            return;
        }
    }
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${currentOrder}/productos/${id_detalle}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadOrderDetails();
        } else {
            showToast('Error al eliminar producto', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
}

async function loadOrderDetails() {
    if (!currentOrder) return;
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${currentOrder}`);
        if (response.ok) {
            const pedido = await response.json();
            orderDetails = pedido.detalles.map(d => ({
                id_detalle: d.id_detalle,
                id_producto: d.id_producto,
                nombre: d.producto_nombre,
                cantidad: d.cantidad,
                precio_unitario: parseFloat(d.precio_unitario),
                subtotal: parseFloat(d.subtotal)
            }));
            updateOrderSummary();
        } else if (response.status === 404) {
            showToast('La orden fue cancelada por estar vacía', 'info');
            showSection('tables');
            currentOrder = null;
            currentTable = null;
            orderDetails = [];
            loadTables();
        }
    } catch (error) {
        console.error('Error al cargar detalles del pedido:', error);
    }
}

function updateOrderSummary() {
    const itemsContainer = document.getElementById('orderItems');
    const totalElement = document.getElementById('orderTotal');
    
    if (orderDetails.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-order">No hay productos en el pedido</p>';
        totalElement.textContent = '0.00';
        return;
    }
    
    itemsContainer.innerHTML = orderDetails.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <div class="order-item-name">${item.nombre}</div>
                <div class="order-item-quantity">${item.cantidad} x $${item.precio_unitario.toFixed(2)}</div>
            </div>
            <span class="order-item-price">$${item.subtotal.toFixed(2)}</span>
            <button class="btn-remove" onclick="removeProductFromOrder(${item.id_detalle}, ${item.id_producto})">×</button>
        </div>
    `).join('');
    
    const total = orderDetails.reduce((sum, item) => sum + item.subtotal, 0);
    totalElement.textContent = total.toFixed(2);
}

async function finishOrder() {
    if (!currentOrder || orderDetails.length === 0) {
        showToast('No hay productos en el pedido', 'warning');
        return;
    }
    
    if (!confirm('¿Finalizar el pedido?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${currentOrder}/finalizar`, {
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
            showReceipt(data);
        } else {
            showToast(data.error || 'No se pudo finalizar el pedido', 'error');
        }
    } catch (error) {
        console.error('Error al finalizar pedido:', error);
        showToast('Error al conectar con el servidor', 'error');
    }
}

function showReceipt(data) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const fecha = new Date(data.factura.fecha_emision);
    
    modalTitle.textContent = 'Recibo de Pago';
    modalBody.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h2>SmartRest</h2>
                <p>Sistema de Gestión de Restaurante</p>
            </div>
            
            <div class="receipt-info">
                <p><strong>Factura #:</strong> ${data.factura.id_factura}</p>
                <p><strong>Mesa:</strong> ${currentTable}</p>
                <p><strong>Fecha:</strong> ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}</p>
                <p><strong>Método de Pago:</strong> ${data.factura.metodo_pago}</p>
            </div>
            
            <div class="receipt-items">
                <h4>Productos:</h4>
                ${data.detalles.map(item => `
                    <div class="receipt-item">
                        <span>${item.cantidad}x ${item.producto_nombre}</span>
                        <span>$${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="receipt-total">
                Total: $${parseFloat(data.factura.total).toFixed(2)}
            </div>
            
            <div class="receipt-footer">
                <p>¡Gracias por su visita!</p>
            </div>
        </div>
        
        <button class="btn-secondary" onclick="closeReceipt()">Cerrar</button>
    `;
    
    modal.classList.add('active');
}

function closeReceipt() {
    document.getElementById('modal').classList.remove('active');
    showSection('tables');
    currentOrder = null;
    currentTable = null;
    orderDetails = [];
    loadTables();
}

