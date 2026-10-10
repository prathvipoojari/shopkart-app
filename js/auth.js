// ============================================
// SHOPKART AUTHENTICATION CONTROLLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initRegister();
  initLogin();
  initNavbarUser();
  initDemoHelper();
  initPasswordCriteria();
});

// Display alert message inside auth pages
function showAuthMessage(msg, isSuccess = false) {
  const box = document.getElementById('authMessage');
  if (!box) return;
  box.textContent = msg;
  box.style.display = 'block';
  box.className = isSuccess ? 'auth-message success' : 'auth-message error';
}

// Makes text safe before putting it inside HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : String(text);
  return div.innerHTML;
}

// =======================
// PASSWORD CRITERIA & STRENGTH (REGISTER PAGE)
// =======================
function initPasswordCriteria() {
  const passInput = document.getElementById('password');
  const criteriaBox = document.getElementById('passwordCriteria');
  if (!passInput || !criteriaBox) return;

  const critLength = document.getElementById('crit-length');
  const critUpper = document.getElementById('crit-upper');
  const critLower = document.getElementById('crit-lower');
  const critNumber = document.getElementById('crit-number');
  const critSpecial = document.getElementById('crit-special');

  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  passInput.addEventListener('input', () => {
    const val = passInput.value;

    const checks = {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
    };

    updateCriterion(critLength, checks.length, 'At least 8 characters');
    updateCriterion(critUpper, checks.upper, 'At least 1 uppercase letter (A-Z)');
    updateCriterion(critLower, checks.lower, 'At least 1 lowercase letter (a-z)');
    updateCriterion(critNumber, checks.number, 'At least 1 number (0-9)');
    updateCriterion(critSpecial, checks.special, 'At least 1 special character (!@#$%^&*)');

    // Calculate Strength Score (0 to 5)
    const passedCount = Object.values(checks).filter(Boolean).length;

    if (!strengthBar || !strengthText) return;

    if (val.length === 0) {
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = '#e0e0e0';
      strengthText.textContent = 'Password Strength';
      strengthText.style.color = '#666';
      return;
    }

    const strengthLevels = [
      { width: '20%', color: '#ef4444', text: 'Too Weak', textColor: '#ef4444' },
      { width: '40%', color: '#f97316', text: 'Weak', textColor: '#f97316' },
      { width: '60%', color: '#eab308', text: 'Fair', textColor: '#ca8a04' },
      { width: '80%', color: '#3b82f6', text: 'Good', textColor: '#2563eb' },
      { width: '100%', color: '#16a34a', text: 'Strong & Secure! 💪', textColor: '#16a34a' }
    ];

    const level = strengthLevels[passedCount - 1] || strengthLevels[0];
    strengthBar.style.width = level.width;
    strengthBar.style.backgroundColor = level.color;
    strengthText.textContent = `Strength: ${level.text}`;
    strengthText.style.color = level.textColor;
  });
}

function updateCriterion(el, isValid, label) {
  if (!el) return;
  if (isValid) {
    el.className = 'valid';
    el.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${label}`;
  } else {
    el.className = 'invalid';
    el.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${label}`;
  }
}

// =======================
// DEMO CREDENTIALS HELPER
// =======================
function initDemoHelper() {
  const fillBtn = document.getElementById('fillDemoBtn');
  if (!fillBtn) return;

  fillBtn.addEventListener('click', () => {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    if (emailInput && passInput) {
      emailInput.value = 'prithvi@shopkart.com';
      passInput.value = 'password123';
      showAuthMessage('Demo credentials filled! Click Login or press Enter.', true);
    }
  });
}

// =======================
// REGISTER PAGE
// =======================
function initRegister() {
  const regBtn = document.getElementById('registerBtn');
  if (!regBtn) return;

  const inputs = [
    document.getElementById('fullname'),
    document.getElementById('email'),
    document.getElementById('mobile'),
    document.getElementById('password')
  ];

  inputs.forEach(input => {
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        regBtn.click();
      }
    });
  });

  regBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullname')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const mobile = document.getElementById('mobile')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!fullName || !email || !password) {
      showAuthMessage('Please fill in your Name, Email, and Password.');
      return;
    }

    // Client-side criteria check
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const allPassed = Object.values(checks).every(Boolean);
    if (!allPassed) {
      showAuthMessage('Please fulfill all 5 password requirements shown below.');
      return;
    }

    regBtn.disabled = true;
    regBtn.textContent = 'Creating Account...';

    try {
      const data = await api.post('/auth/register', { fullName, email, mobile, password });

      if (data.success) {
        api.setToken(data.token);
        api.setCurrentUser(data.user);
        showAuthMessage('✅ Registration successful! Redirecting to ShopKart...', true);
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1200);
      } else {
        showAuthMessage(data.message || 'Registration failed.');
        regBtn.disabled = false;
        regBtn.textContent = 'Register';
      }
    } catch (err) {
      console.error(err);
      showAuthMessage('Could not connect to the backend server. Make sure it is running on port 5000.');
      regBtn.disabled = false;
      regBtn.textContent = 'Register';
    }
  });
}

// =======================
// LOGIN PAGE
// =======================
function initLogin() {
  const loginBtn = document.querySelector('.login-btn') || document.getElementById('loginBtn');
  if (!loginBtn) return;

  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');

  [emailInput, passInput].forEach(input => {
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  });

  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim();
    const password = passInput?.value;

    if (!email || !password) {
      showAuthMessage('Please enter both email and password.');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
      const data = await api.post('/auth/login', { email, password });

      if (data.success) {
        api.setToken(data.token);
        api.setCurrentUser(data.user);
        showAuthMessage(`✅ Welcome back, ${data.user.fullName}! Redirecting...`, true);
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      } else {
        showAuthMessage(data.message || 'Invalid email or password.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    } catch (err) {
      console.error(err);
      showAuthMessage('Could not connect to the backend server. Make sure it is running on port 5000.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });
}

// =======================
// NAVBAR USER PROFILE & LOGOUT
// =======================
function initNavbarUser() {
  const currentUser = api.getCurrentUser();

  // Not logged in
  if (!currentUser) {
    const icon = document.querySelector('.nav-icons .fa-user');
    if (icon) {
      icon.style.cursor = 'pointer';
      icon.title = 'Login / Register';
      icon.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
    return;
  }

  const firstName = (currentUser.fullName || 'User').split(' ')[0];

  // Header used on home.html
  const loginBtn = document.getElementById('loginBtnNav');
  const dropdown = document.getElementById('guestDropdown');

  if (loginBtn && dropdown) {
    loginBtn.textContent = firstName;
    loginBtn.href = '#';
    loginBtn.addEventListener('click', (e) => e.preventDefault());

    const header = dropdown.querySelector('.menu-header');
    if (header) header.style.display = 'none';

    if (!document.getElementById('logoutLink')) {
      const logout = document.createElement('a');
      logout.href = '#';
      logout.id = 'logoutLink';
      logout.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
      logout.addEventListener('click', (e) => {
        e.preventDefault();
        api.clearUser();
        window.location.reload();
      });
      dropdown.appendChild(logout);
    }
    return;
  }

  // Older header style on other pages
  const navUserIcon = document.querySelector('.nav-icons .fa-user');
  if (!navUserIcon) return;

  const userWrapper = document.createElement('div');
  userWrapper.className = 'user-profile-menu';
  userWrapper.innerHTML = `
    <button class="user-btn" id="userMenuBtn" title="Account">
      <i class="fa-solid fa-user-check"></i>
      <span>${escapeHtml(firstName)}</span>
    </button>
    <div class="user-dropdown" id="userDropdown" style="display: none;">
      <div class="dropdown-header">
        <strong>${escapeHtml(currentUser.fullName)}</strong>
        <small>${escapeHtml(currentUser.email)}</small>
      </div>
      <hr>
      <a href="wishlist.html"><i class="fa-regular fa-heart"></i> My Wishlist</a>
      <a href="cart.html"><i class="fa-solid fa-cart-shopping"></i> My Cart</a>
      <hr>
      <button id="logoutBtn" class="logout-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
    </div>
  `;

  navUserIcon.replaceWith(userWrapper);

  const menuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', () => {
    if (userDropdown) userDropdown.style.display = 'none';
  });

  logoutBtn?.addEventListener('click', () => {
    api.clearUser();
    window.location.reload();
  });
}