// ==========================================================
// SHOPKART - MY ORDERS CONTROLLER
// ==========================================================

let userOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    initOrderSearch();
});

async function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i> Fetching your orders...
        </div>
    `;

    try {
        const currentUser = typeof api !== 'undefined' ? api.getCurrentUser() : null;
        const endpoint = currentUser ? `/orders?email=${encodeURIComponent(currentUser.email)}` : '/orders';

        const data = typeof api !== 'undefined' 
            ? await api.get(endpoint)
            : await (await fetch(`http://localhost:5000/api${endpoint}`)).json();

        if (data.success && data.orders && data.orders.length) {
            userOrders = data.orders;
            renderOrders(userOrders);
        } else {
            renderEmptyOrders();
        }
    } catch (err) {
        console.error("Orders load error:", err);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <p>⚠️ Unable to connect to ShopKart server.</p>
                <small>Ensure the backend is running: <code>npm start</code></small>
            </div>
        `;
    }
}

function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;

    if (!orders.length) {
        renderEmptyOrders();
        return;
    }

    container.innerHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const isCancelled = order.status === 'Cancelled';
        const statusClass = isCancelled ? 'cancelled' : (order.status === 'Shipped' ? 'shipped' : 'placed');
        const statusText = isCancelled ? 'Cancelled' : `Confirmed • Arriving by ${order.estimatedDelivery || 'in 2 days'}`;

        return `
            <div class="order-card" id="order-${order.orderId}">
                <!-- Header -->
                <div class="order-card-header">
                    <div class="order-meta">
                        <span>Order Placed: <strong>${orderDate}</strong></span>
                        <span>Total: <strong>₹${Number(order.totalAmount).toLocaleString('en-IN')}</strong></span>
                        <span>Ship To: <strong>${order.customerName}</strong></span>
                        <span>Payment: <strong>${order.paymentMethod || 'Cash on Delivery'}</strong></span>
                    </div>
                    <div>
                        Order ID: <span class="order-id-tag">#${order.orderId}</span>
                    </div>
                </div>

                <!-- Body (Items List) -->
                <div class="order-card-body">
                    ${order.items.map(item => `
                        <div class="order-item-row">
                            <img src="${item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}" alt="${item.name}">
                            <div class="order-item-info">
                                <h3>${item.name}</h3>
                                <p class="item-price">₹${Number(item.price).toLocaleString('en-IN')} <span style="font-size:13px; color:#878787; font-weight:normal;">x ${item.quantity || 1}</span></p>
                            </div>
                            <div class="order-status-col">
                                <div class="status-badge ${statusClass}">
                                    <span class="status-dot"></span>
                                    <span>${statusText}</span>
                                </div>
                                <div class="delivery-subtext">Standard Express Courier</div>
                            </div>
                        </div>
                    `).join('')}

                    <!-- Progress Stepper (Only active if not cancelled) -->
                    ${!isCancelled ? `
                        <div class="order-stepper">
                            <div class="step-item active">
                                <div class="step-circle"><i class="fa-solid fa-check"></i></div>
                                <div class="step-label">Ordered</div>
                            </div>
                            <div class="step-item ${order.status === 'Shipped' || order.status === 'Delivered' ? 'active' : ''}">
                                <div class="step-circle"><i class="fa-solid fa-box"></i></div>
                                <div class="step-label">Packed</div>
                            </div>
                            <div class="step-item ${order.status === 'Shipped' || order.status === 'Delivered' ? 'active' : ''}">
                                <div class="step-circle"><i class="fa-solid fa-truck"></i></div>
                                <div class="step-label">Shipped</div>
                            </div>
                            <div class="step-item ${order.status === 'Delivered' ? 'active' : ''}">
                                <div class="step-circle"><i class="fa-solid fa-house-chimney"></i></div>
                                <div class="step-label">Delivered</div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Footer Actions -->
                <div class="order-card-actions">
                    ${!isCancelled ? `
                        <button class="btn-cancel" onclick="cancelOrder('${order.orderId}')">
                            <i class="fa-solid fa-ban"></i> Cancel Order
                        </button>
                    ` : `
                        <span style="color:#d32f2f; font-size:13px; font-weight:bold;">This order has been cancelled</span>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function renderEmptyOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-orders">
            <i class="fa-solid fa-box-open"></i>
            <h2>You haven't placed any orders yet!</h2>
            <p>Explore all categories and great deals on ShopKart.</p>
            <a href="home.html" class="shop-btn">Start Shopping</a>
        </div>
    `;
}

async function cancelOrder(orderId) {
    if (!confirm(`Are you sure you want to cancel order #${orderId}?`)) return;

    try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
            method: 'PUT'
        });
        const data = await res.json();

        if (data.success) {
            alert(`Order #${orderId} was successfully cancelled.`);
            loadOrders();
        } else {
            alert(data.message || 'Could not cancel order.');
        }
    } catch (err) {
        console.error(err);
        alert('Server connection error. Please try again.');
    }
}

function initOrderSearch() {
    const searchInput = document.getElementById('orderSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
            renderOrders(userOrders);
            return;
        }

        const filtered = userOrders.filter(order => 
            order.orderId.toLowerCase().includes(q) ||
            order.items.some(item => item.name.toLowerCase().includes(q))
        );

        renderOrders(filtered);
    });
}
