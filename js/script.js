// ==========================================================
// SHOPKART - FRONTEND CONTROLLER (DEMO PROJECT)
// ==========================================================

console.log("ShopKart Controller Initialized");

// Global State
let allProducts = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popularity';
let activeModalProduct = null;

// =======================
// DOM INITIALIZATION
// =======================
document.addEventListener("DOMContentLoaded", () => {
    initBannerCarousel();
    initCategoryPills();
    initSearchSystem();
    initCartCounter();
    loadAllProducts();
});

// =======================
// FETCH PRODUCTS & RENDER SECTIONS
// =======================
async function loadAllProducts() {
    try {
        const res = typeof api !== 'undefined' 
            ? await api.get('/products') 
            : await (await fetch('http://localhost:5000/api/products')).json();

        if (res.success && res.products) {
            allProducts = res.products;
            renderHomeSections();
        }
    } catch (err) {
        console.error("Failed to load products from API:", err);
    }
}

// Render the 4 dedicated deal rows
function renderHomeSections() {
    const electronics = allProducts.filter(p => p.category === 'Electronics');
    const mobiles = allProducts.filter(p => p.category === 'Mobiles');
    const fashion = allProducts.filter(p => p.category === 'Fashion');
    const appliances = allProducts.filter(p => p.category === 'Appliances' || p.category === 'Home');

    renderCarouselRow('electronicsRow', electronics);
    renderCarouselRow('mobilesRow', mobiles);
    renderCarouselRow('fashionRow', fashion);
    renderCarouselRow('appliancesRow', appliances);
}

function renderCarouselRow(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products.length) {
        container.innerHTML = `<p style="padding: 20px; color: #888;">No deals available right now.</p>`;
        return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    container.innerHTML = products.map(product => {
        const isWish = wishlist.some(w => String(w.id) === String(product.id));
        const heartClass = isWish ? 'fa-solid active' : 'fa-regular';

        return `
            <div class="fk-product-card" onclick="openProductModal('${product.id}')">
                <div class="card-img-wrap">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <i class="${heartClass} fa-heart wishlist-heart" 
                       onclick="event.stopPropagation(); toggleWishlist(this, '${product.id}')"
                       title="Add to Wishlist"></i>
                </div>

                <span class="card-brand">${product.brand || product.category}</span>
                <h4 class="card-title" title="${product.name}">${product.name}</h4>

                <div class="rating-row">
                    <span class="rating-badge">${product.rating || 4.5} ★</span>
                    <span class="rating-count-text">(${product.ratingCount || 120})</span>
                    ${product.assured ? `<span class="assured-badge">Quality Checked</span>` : ''}
                </div>

                <div class="price-row-card">
                    <span class="curr-price">₹${Number(product.price).toLocaleString('en-IN')}</span>
                    ${product.originalPrice ? `<span class="orig-price">₹${Number(product.originalPrice).toLocaleString('en-IN')}</span>` : ''}
                    ${product.discount ? `<span class="disc-percent">${product.discount}% off</span>` : ''}
                </div>

                <div class="card-delivery-text">Free delivery</div>

                <div class="card-actions">
                    <button class="card-cart-btn" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
                        <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// =======================
// DYNAMIC RESULTS (SEARCH & CATEGORY FILTERING)
// =======================
function showDynamicResults(products, title) {
    const resultsSection = document.getElementById('dynamicResultsSection');
    const resultsTitle = document.getElementById('dynamicResultsTitle');
    const resultsCount = document.getElementById('dynamicResultsCount');
    const grid = document.getElementById('productGrid');

    // Hide deal carousel sections to focus on results
    document.querySelectorAll('.deal-section').forEach(sec => sec.style.display = 'none');
    document.querySelector('.banner-carousel-wrap').style.display = 'none';
    document.querySelector('.trust-strip').style.display = 'none';

    resultsSection.style.display = 'block';
    resultsTitle.textContent = title;
    resultsCount.textContent = `${products.length} products found`;

    if (!products.length) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fa-solid fa-box-open" style="font-size: 50px; color: #878787; margin-bottom: 12px;"></i>
                <h3>No products found</h3>
                <p style="color:#878787; margin: 8px 0 16px;">Try searching with different keywords or browse other categories.</p>
                <button onclick="resetHomeView()" style="background:#2874f0; color:white; border:none; padding:8px 20px; border-radius:3px; cursor:pointer;">
                    Go Back to Home
                </button>
            </div>
        `;
        return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    grid.innerHTML = products.map(product => {
        const isWish = wishlist.some(w => String(w.id) === String(product.id));
        const heartClass = isWish ? 'fa-solid active' : 'fa-regular';

        return `
            <div class="fk-product-card" onclick="openProductModal('${product.id}')">
                <div class="card-img-wrap">
                    <img src="${product.image}" alt="${product.name}">
                    <i class="${heartClass} fa-heart wishlist-heart" 
                       onclick="event.stopPropagation(); toggleWishlist(this, '${product.id}')"></i>
                </div>

                <span class="card-brand">${product.brand || product.category}</span>
                <h4 class="card-title" title="${product.name}">${product.name}</h4>

                <div class="rating-row">
                    <span class="rating-badge">${product.rating || 4.5} ★</span>
                    <span class="rating-count-text">(${product.ratingCount || 100})</span>
                    ${product.assured ? `<span class="assured-badge">Quality Checked</span>` : ''}
                </div>

                <div class="price-row-card">
                    <span class="curr-price">₹${Number(product.price).toLocaleString('en-IN')}</span>
                    ${product.originalPrice ? `<span class="orig-price">₹${Number(product.originalPrice).toLocaleString('en-IN')}</span>` : ''}
                    ${product.discount ? `<span class="disc-percent">${product.discount}% off</span>` : ''}
                </div>

                <div class="card-delivery-text">Free delivery</div>

                <div class="card-actions">
                    <button class="card-cart-btn" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
                        <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function resetHomeView() {
    document.getElementById('dynamicResultsSection').style.display = 'none';
    document.querySelectorAll('.deal-section').forEach(sec => sec.style.display = 'flex');
    document.querySelector('.banner-carousel-wrap').style.display = 'block';
    document.querySelector('.trust-strip').style.display = 'grid';

    document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
    document.querySelector('.cat-pill[data-category="all"]')?.classList.add('active');
    document.getElementById('searchInput').value = '';
    currentCategory = 'all';
    currentSearch = '';
}

// =======================
// CATEGORY PILLS FILTER
// =======================
function initCategoryPills() {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const cat = pill.dataset.category;
            filterCategory(cat);
        });
    });
}

function filterCategory(category) {
    currentCategory = category;

    document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === category);
    });

    if (category === 'all') {
        resetHomeView();
        return;
    }

    const filtered = allProducts.filter(p => 
        p.category && p.category.toLowerCase() === category.toLowerCase()
    );

    showDynamicResults(filtered, `${category} Store`);
}

// =======================
// SEARCH SYSTEM WITH AUTO-SUGGESTIONS
// =======================
function initSearchSystem() {
    const searchInput = document.getElementById('searchInput');
    const suggestBox = document.getElementById('searchSuggestions');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) {
            suggestBox.style.display = 'none';
            return;
        }

        const matches = allProducts.filter(p => 
            p.name.toLowerCase().includes(q) || 
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        ).slice(0, 6);

        if (!matches.length) {
            suggestBox.style.display = 'none';
            return;
        }

        suggestBox.innerHTML = matches.map(p => `
            <div class="suggestion-item" onclick="selectSuggestion('${p.id}')">
                <i class="fa-solid fa-magnifying-glass" style="color:#aaa;"></i>
                <div>
                    <strong>${p.name}</strong>
                    <small style="display:block; color:#888;">in ${p.category}</small>
                </div>
            </div>
        `).join('');

        suggestBox.style.display = 'block';
    });

    // Handle form submit / enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            suggestBox.style.display = 'none';
            performSearch(searchInput.value.trim());
        }
    });

    document.getElementById('searchBtn')?.addEventListener('click', () => {
        suggestBox.style.display = 'none';
        performSearch(searchInput.value.trim());
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestBox.style.display = 'none';
        }
    });
}

function selectSuggestion(productId) {
    const suggestBox = document.getElementById('searchSuggestions');
    if (suggestBox) suggestBox.style.display = 'none';
    openProductModal(productId);
}

function performSearch(query) {
    if (!query) {
        resetHomeView();
        return;
    }
    currentSearch = query.toLowerCase();

    const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(currentSearch) ||
        (p.brand && p.brand.toLowerCase().includes(currentSearch)) ||
        (p.category && p.category.toLowerCase().includes(currentSearch)) ||
        (p.description && p.description.toLowerCase().includes(currentSearch))
    );

    showDynamicResults(results, `Results for "${query}"`);
}

function handleSortChange(sortType) {
    currentSort = sortType;
    let list = [...allProducts];

    if (currentCategory !== 'all') {
        list = list.filter(p => p.category && p.category.toLowerCase() === currentCategory.toLowerCase());
    }
    if (currentSearch) {
        list = list.filter(p => p.name.toLowerCase().includes(currentSearch));
    }

    if (sortType === 'low-to-high') {
        list.sort((a, b) => a.price - b.price);
    } else if (sortType === 'high-to-low') {
        list.sort((a, b) => b.price - a.price);
    } else if (sortType === 'rating') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    showDynamicResults(list, currentSearch ? `Results for "${currentSearch}"` : `${currentCategory} Store`);
}

// =======================
// PRODUCT DETAIL QUICK-VIEW MODAL
// =======================
function openProductModal(productId) {
    const product = allProducts.find(p => String(p.id) === String(productId));
    if (!product) return;

    activeModalProduct = product;

    // Elements
    document.getElementById('modalProductImg').src = product.image;
    document.getElementById('modalBrand').textContent = product.brand || product.category;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalRating').textContent = `${product.rating || 4.5} ★`;
    document.getElementById('modalReviews').textContent = `${product.ratingCount || 100} Ratings & Reviews`;

    document.getElementById('modalPrice').textContent = `₹${Number(product.price).toLocaleString('en-IN')}`;
    document.getElementById('modalOriginalPrice').textContent = product.originalPrice 
        ? `₹${Number(product.originalPrice).toLocaleString('en-IN')}` 
        : '';
    document.getElementById('modalDiscount').textContent = product.discount 
        ? `${product.discount}% off` 
        : '';

    document.getElementById('modalBankOffer').textContent = product.bankOffer || 'Demo offer: sample cashback';
    document.getElementById('modalDescription').textContent = product.description || 'Sample product description for this demo store.';

    // Specifications Table
    const specsTable = document.getElementById('modalSpecsTable');
    if (product.specs) {
        specsTable.innerHTML = Object.entries(product.specs).map(([key, val]) => `
            <tr>
                <td class="spec-name">${key}</td>
                <td class="spec-val">${val}</td>
            </tr>
        `).join('');
    } else {
        specsTable.innerHTML = `
            <tr><td class="spec-name">In The Box</td><td class="spec-val">1 Unit, User Manual</td></tr>
            <tr><td class="spec-name">Warranty</td><td class="spec-val">Sample warranty info (demo)</td></tr>
        `;
    }

    // Modal Wishlist Heart status
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isWish = wishlist.some(w => String(w.id) === String(product.id));
    const heart = document.getElementById('modalWishlistHeart');
    heart.className = isWish ? 'fa-solid fa-heart modal-wishlist-heart active' : 'fa-regular fa-heart modal-wishlist-heart';
    heart.onclick = () => toggleWishlist(heart, product.id);

    // Modal Actions
    document.getElementById('modalAddToCartBtn').onclick = () => {
        quickAddToCart(product.id);
    };

    document.getElementById('modalBuyNowBtn').onclick = () => {
        quickAddToCart(product.id);
        window.location.href = 'cart.html';
    };

    // Show Modal
    const modal = document.getElementById('productModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('pincodeResult').textContent = '';
    document.getElementById('pincodeInput').value = '';
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeProductModal();
    }
});

// Pincode Delivery Check (demo only)
function checkPincode() {
    const input = document.getElementById('pincodeInput');
    const result = document.getElementById('pincodeResult');
    const pin = input.value.trim();

    if (pin.length !== 6 || isNaN(pin)) {
        result.style.color = '#d32f2f';
        result.textContent = '❌ Please enter a valid 6-digit Pincode';
        return;
    }

    result.style.color = '#388e3c';
    result.textContent = `✅ Demo delivery estimate: 2-3 days for pincode ${pin}`;
}

// =======================
// CART & WISHLIST LOGIC
// =======================
function initCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.textContent = total;
    }
}

function quickAddToCart(productId) {
    const product = allProducts.find(p => String(p.id) === String(productId));
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => String(item.id) === String(productId));

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
            brand: product.brand,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    initCartCounter();
    showToast(`🛒 "${product.name.slice(0, 25)}..." added to Cart!`);
}

function toggleWishlist(heartEl, productId) {
    const product = allProducts.find(p => String(p.id) === String(productId));
    if (!product) return;

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.findIndex(item => String(item.id) === String(productId));

    if (index === -1) {
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            rating: product.rating
        });
        heartEl.classList.remove('fa-regular');
        heartEl.classList.add('fa-solid', 'active');
        showToast(`❤️ Added to your Wishlist!`);
    } else {
        wishlist.splice(index, 1);
        heartEl.classList.remove('fa-solid', 'active');
        heartEl.classList.add('fa-regular');
        showToast(`Removed from Wishlist`);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// =======================
// HERO BANNER CAROUSEL
// =======================
function initBannerCarousel() {
    const bannerImg = document.getElementById('bannerImage');
    const dots = document.querySelectorAll('.banner-dots .dot');
    if (!bannerImg) return;

    const banners = [
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"
    ];

    let current = 0;

    function setBanner(index) {
        current = index;
        bannerImg.src = banners[current];
        dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    document.getElementById('bannerNext')?.addEventListener('click', () => {
        setBanner((current + 1) % banners.length);
    });

    document.getElementById('bannerPrev')?.addEventListener('click', () => {
        setBanner((current - 1 + banners.length) % banners.length);
    });

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => setBanner(idx));
    });

    // Auto rotate every 4.5s
    setInterval(() => {
        setBanner((current + 1) % banners.length);
    }, 4500);
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// =======================
// TOAST NOTIFICATIONS
// =======================
function showToast(message, type = 'success') {
    const toastBox = document.getElementById('toastBox');
    if (!toastBox) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#388e3c;"></i> <span>${message}</span>`;

    toastBox.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}