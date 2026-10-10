// ==========================================================
// SHOPKART - FLIPKART WISHLIST CONTROLLER
// ==========================================================

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

document.addEventListener("DOMContentLoaded", () => {
    initUserProfile();
    displayWishlist();
});

function initUserProfile() {
    const currentUser = typeof api !== 'undefined' ? api.getCurrentUser() : null;
    const nameEl = document.getElementById("sidebarUserName");
    if (nameEl && currentUser) {
        nameEl.textContent = currentUser.fullName;
    }
}

function displayWishlist() {
    const container = document.getElementById("wishlistItems");
    const countEl = document.getElementById("wishlistCount");

    if (countEl) countEl.textContent = `(${wishlist.length})`;
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist-view">
                <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty Wishlist">
                <h3>Empty Wishlist</h3>
                <p>You have no items in your wishlist. Start adding!</p>
                <a href="home.html" class="btn-shop-wishlist">Shop Now</a>
            </div>
        `;
        return;
    }

    container.innerHTML = wishlist.map((item, index) => `
        <div class="wishlist-item-card">
            <img class="wishlist-item-img" src="${item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}" alt="${item.name}">
            
            <div class="wishlist-item-info">
                <h3>${item.name}</h3>
                
                <div class="wishlist-rating-row">
                    <span class="rating-badge">${item.rating || 4.5} ★</span>
                    <span class="assured-badge"><span class="f-text">f-</span>Assured</span>
                </div>

                <div class="wishlist-price-row">
                    <span class="wishlist-curr-price">₹${Number(item.price).toLocaleString('en-IN')}</span>
                    ${item.originalPrice ? `<span class="wishlist-orig-price">₹${Number(item.originalPrice).toLocaleString('en-IN')}</span>` : ''}
                </div>
            </div>

            <div class="wishlist-actions">
                <button class="btn-move-cart" onclick="moveToCart(${index})">
                    <i class="fa-solid fa-cart-shopping"></i> Move to Cart
                </button>
                <button class="btn-delete-wishlist" onclick="removeFromWishlist(${index})" title="Remove item">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join("");
}

function removeFromWishlist(index) {
    wishlist.splice(index, 1);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    displayWishlist();
}

function moveToCart(index) {
    const item = wishlist[index];
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(c => String(c.id) === String(item.id));
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            image: item.image,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    wishlist.splice(index, 1);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    displayWishlist();
    alert(`🛒 "${item.name}" moved to Cart!`);
}