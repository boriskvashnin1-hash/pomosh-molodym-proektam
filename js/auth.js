// =============================================
// ФУНКЦИИ АУТЕНТИФИКАЦИИ HELPROJECTS
// =============================================

let currentUser = null;

// Проверка инициализации Supabase
function checkSupabaseInit() {
    if (!window.supabase || typeof window.supabase !== 'object') {
        console.error('Supabase не инициализирован. Проверьте config.js');
        return false;
    }
    return true;
}

// Проверка авторизации
async function checkAuth() {
    console.log('🔐 Проверка авторизации...');
    
    // Проверяем инициализацию Supabase
    if (!checkSupabaseInit()) {
        console.error('Supabase не доступен');
        return false;
    }
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Ошибка проверки сессии:', error);
            return false;
        }
        
        if (session) {
            currentUser = session.user;
            console.log('✅ Пользователь авторизован:', currentUser.email);
            updateUIForLoggedInUser();
            return true;
        } else {
            console.log('❌ Пользователь не авторизован');
            currentUser = null;
            return false;
        }
    } catch (error) {
        console.error('Критическая ошибка при проверке авторизации:', error);
        return false;
    }
}

// Обновление UI для авторизованного пользователя
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const profileLink = document.getElementById('profileLink');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileLink) {
        profileLink.style.display = 'block';
        profileLink.href = 'pages/profile.html';
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    
    // Показываем приветствие если есть навигация
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && currentUser) {
        // Удаляем старое приветствие если есть
        const oldWelcome = document.querySelector('.welcome-text');
        if (oldWelcome) oldWelcome.remove();
        
        const welcomeElement = document.createElement('span');
        welcomeElement.className = 'welcome-text';
        welcomeElement.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email}`;
        welcomeElement.style.cssText = 'display: flex; align-items: center; gap: 5px; color: white;';
        
        // Вставляем перед кнопкой выхода или в начало
        if (logoutBtn) {
            logoutBtn.parentElement.insertBefore(welcomeElement, logoutBtn);
        } else if (navLinks.firstChild) {
            navLinks.insertBefore(welcomeElement, navLinks.firstChild);
        }
    }
}

// Регистрация нового пользователя
async function register() {
    if (!checkSupabaseInit()) {
        alert('Система не инициализирована. Обновите страницу.');
        return;
    }
    
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const fullName = document.getElementById('registerFullName')?.value;
    const className = document.getElementById('registerClass')?.value;
    
    if (!email || !password || !fullName) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    try {
        console.log('📝 Регистрация пользователя:', email);
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    class: className
                }
            }
        });
        
        if (error) {
            console.error('Ошибка регистрации:', error);
            alert('Ошибка регистрации: ' + error.message);
            return;
        }
        
        // Создание профиля пользователя
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        full_name: fullName,
                        class: className,
                        created_at: new Date().toISOString()
                    }
                ]);
            
            if (profileError) {
                console.error('Ошибка создания профиля:', profileError);
                // Не прерываем регистрацию, профиль можно создать позже
            }
        }
        
        alert('✅ Регистрация успешна! Проверьте email для подтверждения.');
        closeAuthModal();
        
    } catch (error) {
        console.error('Критическая ошибка регистрации:', error);
        alert('Произошла ошибка. Попробуйте еще раз.');
    }
}

// Вход пользователя
async function login() {
    if (!checkSupabaseInit()) {
        alert('Система не инициализирована. Обновите страницу.');
        return;
    }
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        alert('Введите email и пароль');
        return;
    }
    
    try {
        console.log('🔐 Вход пользователя:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Ошибка входа:', error);
            alert('Ошибка входа: ' + error.message);
            return;
        }
        
        currentUser = data.user;
        console.log('✅ Вход выполнен:', currentUser.email);
        
        updateUIForLoggedInUser();
        closeAuthModal();
        
        // Показываем уведомление
        showNotification('Вход выполнен успешно!', 'success');
        
    } catch (error) {
        console.error('Критическая ошибка входа:', error);
        alert('Произошла ошибка. Попробуйте еще раз.');
    }
}

// Выход пользователя
async function logout() {
    if (!checkSupabaseInit()) {
        alert('Система не инициализирована. Обновите страницу.');
        return;
    }
    
    try {
        console.log('🚪 Выход пользователя');
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Ошибка выхода:', error);
            alert('Ошибка выхода: ' + error.message);
            return;
        }
        
        currentUser = null;
        
        // Обновляем UI
        const loginBtn = document.getElementById('loginBtn');
        const profileLink = document.getElementById('profileLink');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) loginBtn.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Удаляем приветствие
        const welcomeElement = document.querySelector('.welcome-text');
        if (welcomeElement) welcomeElement.remove();
        
        console.log('✅ Выход выполнен');
        
        // Редирект на главную
        window.location.href = '../index.html';
        
    } catch (error) {
        console.error('Критическая ошибка выхода:', error);
        alert('Произошла ошибка при выходе.');
    }
}

// Открытие/закрытие модального окна авторизации
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'block';
        // Показываем форму входа по умолчанию
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

// Утилита для показа уведомлений
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    // Кнопка закрытия
    notification.querySelector('.notification-close').onclick = () => notification.remove();
    
    document.body.appendChild(notification);
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Инициализация обработчиков событий
function initAuthEventListeners() {
    console.log('🎮 Инициализация обработчиков авторизации');
    
    // Кнопка входа
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', openAuthModal);
    }
    
    // Переключение между формами
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        });
    }
    
    // Закрытие модального окна
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('authModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAuthModal();
        });
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Формы входа и регистрации
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        // Удаляем старые обработчики и добавляем новые
        const loginButton = loginForm.querySelector('button[onclick="login()"]');
        if (loginButton) {
            loginButton.removeAttribute('onclick');
            loginButton.addEventListener('click', login);
        }
    }
    
    if (registerForm) {
        const registerButton = registerForm.querySelector('button[onclick="register()"]');
        if (registerButton) {
            registerButton.removeAttribute('onclick');
            registerButton.addEventListener('click', register);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Инициализация системы авторизации');
    
    // Инициализируем обработчики
    initAuthEventListeners();
    
    // Проверяем авторизацию
    await checkAuth();
    
    // Добавляем стили для уведомлений если их нет
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                margin-left: auto;
                opacity: 0.8;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
});

// Экспорт функций для использования в других файлах
window.auth = {
    checkAuth,
    login,
    register,
    logout,
    currentUser,
    showNotification
};
