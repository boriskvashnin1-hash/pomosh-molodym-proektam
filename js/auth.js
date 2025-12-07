

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // Восстанавливаем сессию из localStorage
        const savedUser = localStorage.getItem('helprojects_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI();
                console.log('👤 Пользователь восстановлен:', this.currentUser.email);
            } catch (error) {
                console.error('Ошибка при восстановлении пользователя:', error);
            }
        }
    }
    
    // Регистрация
    async register(userData) {
        const { email, password, fullName, school, className } = userData;
        
        // Валидация
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Неверный формат email' };
        }
        
        if (password.length < 6) {
            return { success: false, message: 'Пароль должен быть не менее 6 символов' };
        }
        
        try {
            let result;
            
            // Проверяем режим (Supabase или localStorage)
            if (window.db && !window.useLocalStorage) {
                // Регистрация через Supabase
                const { data, error } = await window.db.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            school: school,
                            class: className,
                            role: 'student'
                        }
                    }
                });
                
                if (error) throw error;
                
                result = {
                    success: true,
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        ...userData
                    }
                };
                
            } else {
                // Локальная регистрация
                const users = JSON.parse(localStorage.getItem('helprojects_users') || '[]');
                
                // Проверка существующего пользователя
                if (users.some(u => u.email === email)) {
                    return { success: false, message: 'Пользователь с таким email уже существует' };
                }
                
                const newUser = {
                    id: 'user_' + Date.now(),
                    email,
                    fullName,
                    school,
                    class: className,
                    role: 'student',
                    createdAt: new Date().toISOString(),
                    projects: []
                };
                
                users.push(newUser);
                localStorage.setItem('helprojects_users', JSON.stringify(users));
                
                result = { success: true, user: newUser };
            }
            
            // Сохраняем текущего пользователя
            this.currentUser = result.user;
            localStorage.setItem('helprojects_user', JSON.stringify(this.currentUser));
            
            // Обновляем интерфейс
            this.updateUI();
            
            return result;
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { 
                success: false, 
                message: error.message || 'Ошибка при регистрации' 
            };
        }
    }
    
    // Вход
    async login(email, password) {
        try {
            let user;
            
            if (window.db && !window.useLocalStorage) {
                // Вход через Supabase
                const { data, error } = await window.db.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                user = data.user;
                
            } else {
                // Локальный вход
                const users = JSON.parse(localStorage.getItem('helprojects_users') || '[]');
                const foundUser = users.find(u => u.email === email);
                
                if (!foundUser) {
                    return { success: false, message: 'Пользователь не найден' };
                }
                
                // В реальном проекте здесь должно быть хеширование пароля!
                if (password !== foundUser.password) {
                    return { success: false, message: 'Неверный пароль' };
                }
                
                user = foundUser;
            }
            
            this.currentUser = user;
            localStorage.setItem('helprojects_user', JSON.stringify(user));
            this.updateUI();
            
            return { success: true, user };
            
        } catch (error) {
            return { success: false, message: error.message || 'Ошибка входа' };
        }
    }
    
    // Выход
    logout() {
        this.currentUser = null;
        localStorage.removeItem('helprojects_user');
        this.updateUI();
        return { success: true };
    }
    
    // Проверка авторизации
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    // Получение текущего пользователя
    getUser() {
        return this.currentUser;
    }
    
    // Обновление интерфейса
    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const profileLink = document.getElementById('profile-link');
        const loginBtn = document.getElementById('login-btn');
        
        if (authButtons && userMenu) {
            if (this.currentUser) {
                authButtons.style.display = 'none';
                userMenu.style.display = 'block';
                
                if (profileLink) {
                    profileLink.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.email}`;
                }
            } else {
                authButtons.style.display = 'block';
                userMenu.style.display = 'none';
            }
        }
    }
    
    // Валидация email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Создаем глобальный экземпляр
window.auth = new AuthSystem();
