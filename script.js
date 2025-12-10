// Основной скрипт

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    console.log('HelProjects загружен');
    
    // Проверяем авторизацию
    const isAuthenticated = await checkAuth();
    
    // Если пользователь авторизован и на главной странице
    if (isAuthenticated && window.location.pathname.endsWith('index.html')) {
        // Можно загрузить последние проекты пользователя
        const userProjects = await db.getUserProjects(currentUser.id);
        if (userProjects.length > 0) {
            console.log('У пользователя проектов:', userProjects.length);
        }
    }
    
    // Добавляем обработчик выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Валидация форм
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
// Функции для работы с изображениями и аватарами

// Генерация аватара на основе имени
function generateAvatar(name, size = 50) {
    const colors = [
        '#667eea', '#764ba2', '#48bb78', '#ecc94b',
        '#f56565', '#4299e1', '#ed8936'
    ];
    
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    const colorIndex = name
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    
    return {
        initials,
        color: colors[colorIndex],
        size
    };
}

// Создание элемента аватара
function createAvatarElement(name, size = 50) {
    const avatar = generateAvatar(name, size);
    const div = document.createElement('div');
    div.className = 'user-avatar';
    div.style.width = `${avatar.size}px`;
    div.style.height = `${avatar.size}px`;
    div.style.background = avatar.color;
    div.textContent = avatar.initials;
    return div;
}

// Загрузка и отображение аватара пользователя
function loadUserAvatar(userName, elementId) {
    const avatar = createAvatarElement(userName);
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = '';
        container.appendChild(avatar);
    }
}

// Обновление изображений-заглушек
function updatePlaceholderImages() {
    // Для проектов без изображений
    document.querySelectorAll('.project-image-placeholder').forEach(el => {
        if (!el.style.backgroundImage || el.style.backgroundImage === 'none') {
            const subjects = ['Информатика', 'Физика', 'Химия', 'Биология', 'Математика'];
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            el.textContent = randomSubject.charAt(0);
            el.style.background = getSubjectColor(randomSubject);
        }
    });
}

// Получение цвета для предмета
function getSubjectColor(subject) {
    const colorMap = {
        'Информатика': '#667eea',
        'Физика': '#764ba2',
        'Химия': '#48bb78',
        'Биология': '#ecc94b',
        'Математика': '#f56565',
        'История': '#4299e1',
        'Обществознание': '#ed8936',
        'Литература': '#38b2ac'
    };
    return colorMap[subject] || '#a0aec0';
}

// Предзагрузка важных изображений
function preloadImages() {
    const images = [
        '../assets/images/hero-bg.jpg',
        '../assets/images/project-placeholder.jpg'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    preloadImages();
    updatePlaceholderImages();
    
    // Добавляем аватар текущему пользователю
    if (window.currentUser) {
        const userName = currentUser.user_metadata?.full_name || currentUser.email;
        loadUserAvatar(userName, 'userAvatar');
    }
});

// Экспорт функций
window.imageUtils = {
    generateAvatar,
    createAvatarElement,
    loadUserAvatar,
    getSubjectColor
};
function validatePassword(password) {
    return password.length >= 6;
}

// Утилиты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Экспорт утилит в глобальную область видимости
window.utils = {
    validateEmail,
    validatePassword,
    formatDate,
    showNotification
};
