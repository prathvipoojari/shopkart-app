// ==========================================================
// SHOPKART - FLIPKART CART & CHECKOUT CONTROLLER
// ==========================================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let savedAddress = JSON.parse(localStorage.getItem("shopkart_address")) || null;

document.addEventListener("DOMContentLoaded", () => {
    initAddressDisplay();
    displayCart();
});

// =======================
// ADDRESS LOGIC
// =======================
function initAddressDisplay() {
    const currentUser = typeof api !== 'undefined' ? api.getCurrentUser() : null;

    if (!savedAddress) {
        savedAddress = {
            name: currentUser ? currentUser.fullName : "Prithvi Poojari",
            mobile: currentUser ? (currentUser.mobile || "9876543210") : "9876543210",
            pincode: "560034",
            city: "Bengaluru",
            street: "12th Main, Koramangala 4th Block, Karnataka"
        };
        localStorage.setItem("shopkart_address", JSON.stringify(savedAddress));
    }

    const nameEl = document.getElementById("displayCustomerName");
    const addrEl = document.getElementById("displayAddress");

    if (nameEl) nameEl.textContent = `${savedAddress.name}, ${savedAddress.pincode}`;
    if (addrEl) addrEl.textContent = `${savedAddress.street}, ${savedAddress.city}`;
}

function openAddressModal() {
    const modal = document.getElementById("addressModal");
    if (!modal) return;

    document.getElementById("inputName").value = savedAddress.name || "";
    document.getElementById("inputMobile").value = savedAddress.mobile || "";
    document.getElementById("inputPincode").value = savedAddress.pincode || "";
    document.getElementById("inputCity").value = savedAddress.city || "";
    document.getElementById("inputStreet").value = savedAddress.street || "";

    modal.style.display = "flex";
}

function closeAddressModal() {
    const modal = document.getElementById("addressModal");
    if (modal) modal.style.display = "none";
}

function saveAddress(e) {
    e.preventDefault();

    savedAddress = {
        name: document.getElementById("inputName").value.trim(),
        mobile: document.getElementById("inputMobile").value.trim(),
        pincode: document.getElementById("inputPincode").value.trim(),
        city: document.getElementById("inputCity").value.trim(),
        street: document.getElementById("inputStreet").value.trim()
    };

    localStorage.setItem("shopkart_address", JSON.stringify(savedAddress));
    initAddressDisplay();
    closeAddressModal();
}

// =======================
// DISPLAY CART ITEMS
// =======================
function displayCart() {
    const cartItemsEl = document.getElementById("cartItems");
    const priceDetailsEl = document.getElementById("priceDetails");
    const cartLayout = document.getElementById("cartLayout");

    if (!cartItemsEl) return;

    if (cart.length === 0) {
        cartLayout.innerHTML = `
            <div class="empty-cart-card" style="width:100%;">
                <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Missing Cart items">
                <h3>Your cart is empty!</h3>
                <p>Explore our best deals and add items to your cart.</p>
                <a href="home.html" class="btn-shop-now">Shop Now</a>
            </div>
        `;
        return;
    }

    // Render items list
    cartItemsEl.innerHTML = cart.map((item, index) => {
        const qty = item.quantity || 1;
        const itemTotal = Number(item.price) * qty;
        const origTotal = (item.originalPrice || item.price) * qty;

        return `
            <div class="cart-item-card">
                <div class="cart-item-img-col">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}" alt="${item.name}">
                    <div class="cart-qty-row">
                        <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
                        <span class="qty-num">${qty}</span>
                        <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
                    </div>
                </div>

                <div class="cart-item-details-col">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <div class="cart-item-seller">Seller: RetailNet <span class="assured-badge"><span class="f-text">f-</span>Assured</span></div>

                    <div class="cart-item-price-row">
                        <span class="cart-curr-price">₹${itemTotal.toLocaleString('en-IN')}</span>
                        ${item.originalPrice ? `<span class="cart-orig-price">₹${origTotal.toLocaleString('en-IN')}</span>` : ''}
                        <span class="cart-disc-pct">Save ₹${(origTotal - itemTotal).toLocaleString('en-IN')}</span>
                    </div>

                    <div class="cart-delivery-date">
                        Delivery by <strong>Tomorrow, 11:00 PM</strong> | <span>FREE</span>
                    </div>

                    <div class="cart-action-links">
                        <button class="btn-cart-action" onclick="saveForLater(${index})">SAVE FOR LATER</button>
                        <button class="btn-cart-action remove-btn" onclick="removeCartItem(${index})">REMOVE</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Compute Price Details
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalMRP = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * (item.quantity || 1)), 0);
    const totalPayable = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
    const totalSavings = Math.max(0, totalMRP - totalPayable);

    // Render Price Details Sidebar
    priceDetailsEl.innerHTML = `
        <div class="price-details-card">
            <h3 class="price-card-title">PRICE DETAILS</h3>

            <div class="price-breakdown-row">
                <span>Price (${totalItems} ${totalItems === 1 ? 'item' : 'items'})</span>
                <span>₹${totalMRP.toLocaleString('en-IN')}</span>
            </div>

            <div class="price-breakdown-row discount-row">
                <span>Discount</span>
                <span>− ₹${totalSavings.toLocaleString('en-IN')}</span>
            </div>

            <div class="price-breakdown-row free-row">
                <span>Delivery Charges</span>
                <span><span style="text-decoration:line-through; color:#878787; margin-right:4px;">₹70</span> FREE</span>
            </div>

            <div class="total-payable-row">
                <span>Total Amount</span>
                <span>₹${totalPayable.toLocaleString('en-IN')}</span>
            </div>

            ${totalSavings > 0 ? `<div class="savings-badge">🎉 You will save ₹${totalSavings.toLocaleString('en-IN')} on this order</div>` : ''}

            <button class="btn-place-order" onclick="openCheckoutModal(${totalPayable})">
                PLACE ORDER
            </button>
        </div>
    `;
}

function updateItemQty(index, change) {
    if (!cart[index]) return;

    cart[index].quantity = (cart[index].quantity || 1) + change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function saveForLater(index) {
    const item = cart[index];
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlist.some(w => String(w.id) === String(item.id))) {
        wishlist.push(item);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }

    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    alert(`"${item.name}" moved to your Wishlist!`);
}

// =======================
// CHECKOUT & PAYMENT MODAL
// =======================
let checkoutTotal = 0;

function openCheckoutModal(total) {
    checkoutTotal = total;
    const modal = document.getElementById("checkoutModal");
    const amountEl = document.getElementById("modalPayableAmount");

    if (amountEl) amountEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    if (modal) modal.style.display = "flex";
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.style.display = "none";
}

async function processOrderPlacement() {
    const confirmBtn = document.getElementById("btnConfirmOrder");
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Placing Order...";
    }

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "Cash on Delivery";

    const currentUser = typeof api !== 'undefined' ? api.getCurrentUser() : null;

    const fullShippingAddress = `${savedAddress.name}, ${savedAddress.mobile}, ${savedAddress.street}, ${savedAddress.city} - ${savedAddress.pincode}`;

    const orderPayload = {
        items: cart,
        totalAmount: checkoutTotal,
        customerName: savedAddress.name,
        customerEmail: currentUser ? currentUser.email : "prithvi@shopkart.com",
        shippingAddress: fullShippingAddress,
        paymentMethod: paymentMethod
    };

    try {
        const response = typeof api !== 'undefined' 
            ? await api.post('/orders', orderPayload)
            : await (await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
              })).json();

        if (response.success) {
            // Empty Cart
            cart = [];
            localStorage.setItem("cart", JSON.stringify([]));

            closeCheckoutModal();
            alert(`🎉 Order Placed Successfully!\nOrder ID: #${response.order.orderId}\n\nRedirecting to your My Orders page...`);
            window.location.href = 'orders.html';
        } else {
            alert("Error placing order: " + (response.message || "Please try again."));
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = "CONFIRM & PLACE ORDER";
            }
        }
    } catch (err) {
        console.error("Order error:", err);
        alert("Server connection error. Make sure backend is running.");
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = "CONFIRM & PLACE ORDER";
        }
    }
}