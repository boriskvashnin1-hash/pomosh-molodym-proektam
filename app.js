class CrowdfundingApp {
    constructor() {
        this.projects = [];
        this.users = [];
        this.currentUser = null;
        this.currentRoute = 'home';
        this.currentProjectId = null;
        this.deferredPrompt = null;
        this.liveUpdatesInterval = null;
        this.chatMessages = [];
        this.userStats = {
            coins: 100,
            level: 1,
            xp: 0,
            badges: [],
            notifications: []
        };
        
        // Привязываем методы
        this.applyFilters = this.applyFilters.bind(this);
        this.handleProjectSubmit = this.handleProjectSubmit.bind(this);
        this.supportProject = this.supportProject.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.rateProject = this.rateProject.bind(this);
        this.showProjectDetail = this.showProjectDetail.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleChat = this.toggleChat.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.showAuthModal = this.showAuthModal.bind(this);
        this.handleAuth = this.handleAuth.bind(this);
        this.logout = this.logout.bind(this);
        this.hideModal = this.hideModal.bind(this);
        
        this.init();
    }

    init() {
        this.setupRouter();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupPWA();
        this.startLiveUpdates();
        
        setTimeout(() => {
            this.requestNotificationPermission();
        }, 2000);
        
        this.render();
    }

    // 🚀 НОВЫЕ ПРОДВИНУТЫЕ ФУНКЦИИ

    // 💰 СИСТЕМА ВИРТУАЛЬНОЙ ВАЛЮТЫ
    addCoins(amount, reason = '') {
        if (!this.currentUser) return;
        
        this.userStats.coins += amount;
        this.saveUserStats();
        
        this.showLiveNotification(`🎉 +${amount} коинов! ${reason}`, 'success');
        this.updateCoinsDisplay();
        
        // Анимация коинов
        const coinsElement = document.querySelector('.coins-system');
        if (coinsElement) {
            coinsElement.classList.add('coin-animation');
            setTimeout(() => coinsElement.classList.remove('coin-animation'), 1000);
        }
        
        // Проверяем достижения
        this.checkCoinAchievements();
    }

    spendCoins(amount, reason = '') {
        if (!this.currentUser || this.userStats.coins < amount) {
            this.showNotification('❌ Недостаточно коинов', 'error');
            return false;
        }
        
        this.userStats.coins -= amount;
        this.saveUserStats();
        this.updateCoinsDisplay();
        this.showNotification(`💸 Потрачено ${amount} коинов: ${reason}`, 'info');
        return true;
    }

    updateCoinsDisplay() {
        const coinsElement = document.getElementById('userCoins');
        if (coinsElement) {
            coinsElement.textContent = this.userStats.coins;
        }
    }

    // 🏆 СИСТЕМА УРОВНЕЙ И ДОСТИЖЕНИЙ
    addXP(amount, source = '') {
        if (!this.currentUser) return;
        
        this.userStats.xp += amount;
        const oldLevel = this.userStats.level;
        const newLevel = Math.floor(this.userStats.xp / 100) + 1;
        
        if (newLevel > oldLevel) {
            this.userStats.level = newLevel;
            this.showLevelUpModal(newLevel);
            this.addCoins(50, 'За новый уровень!');
        }
        
        this.saveUserStats();
        this.updateLevelDisplay();
    }

    showLevelUpModal(level) {
        this.showAchievementModal(
            '🎊 Новый уровень!',
            `Поздравляем! Вы достигли ${level} уровня!`,
            '🚀'
        );
    }

    updateLevelDisplay() {
        const levelElement = document.getElementById('userLevel');
        const xpElement = document.getElementById('userXP');
        
        if (levelElement) levelElement.textContent = this.userStats.level;
        if (xpElement) {
            const currentLevelXP = this.userStats.xp % 100;
            xpElement.style.width = `${currentLevelXP}%`;
        }
    }

    // 🎯 СИСТЕМА ДОСТИЖЕНИЙ
    checkCoinAchievements() {
        const achievements = [
            { threshold: 100, badge: '💰 Начинающий инвестор', id: 'coin_collector_1' },
            { threshold: 500, badge: '💰 Опытный инвестор', id: 'coin_collector_2' },
            { threshold: 1000, badge: '💰 Крипто-кит', id: 'coin_collector_3' }
        ];

        achievements.forEach(achievement => {
            if (this.userStats.coins >= achievement.threshold && 
                !this.userStats.badges.includes(achievement.id)) {
                this.unlockBadge(achievement.badge, achievement.id);
            }
        });
    }

    checkProjectAchievements() {
        const createdProjects = this.projects.filter(p => p.author === this.currentUser?.name).length;
        const supportedProjects = this.projects.filter(p => p.donors > 0 && this.currentUser).length;
        
        if (createdProjects >= 1 && !this.userStats.badges.includes('first_project')) {
            this.unlockBadge('🚀 Первый проект', 'first_project');
        }
        
        if (createdProjects >= 5 && !this.userStats.badges.includes('pro_creator')) {
            this.unlockBadge('🎯 Про-создатель', 'pro_creator');
        }
        
        if (supportedProjects >= 3 && !this.userStats.badges.includes('supporter')) {
            this.unlockBadge('❤️ Активный сторонник', 'supporter');
        }
    }

    unlockBadge(badgeName, badgeId) {
        this.userStats.badges.push(badgeId);
        this.saveUserStats();
        
        this.showAchievementModal(
            '🏆 Новое достижение!',
            badgeName,
            '🎊'
        );
        
        this.addCoins(25, `За достижение: ${badgeName}`);
        this.addXP(25);
    }

    showAchievementModal(title, message, emoji) {
        const modal = document.getElementById('achievementModal');
        const body = document.getElementById('achievementModalBody');
        
        if (modal && body) {
            body.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${emoji}</div>
                    <h3>${title}</h3>
                    <p style="color: var(--text-light); margin: 1rem 0;">${message}</p>
                </div>
            `;
            modal.style.display = 'flex';
        }
    }

    hideAchievementModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 🔄 LIVE-ОБНОВЛЕНИЯ В РЕАЛЬНОМ ВРЕМЕНИ
    startLiveUpdates() {
        this.liveUpdatesInterval = setInterval(() => {
            this.simulateLiveActivity();
        }, 30000); // Каждые 30 секунд
    }

    simulateLiveActivity() {
        if (this.projects.length === 0) return;
        
        // Случайный проект получает поддержку
        const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
        if (randomProject && randomProject.collected < randomProject.goal) {
            const donation = Math.floor(Math.random() * 500) + 100;
            randomProject.collected += donation;
            randomProject.donors += 1;
            
            this.saveToStorage();
            
            // Показываем уведомление
            if (Math.random() > 0.7) { // 30% шанс показать уведомление
                this.showLiveNotification(
                    `💫 Кто-то поддержал проект "${randomProject.title}" на ${donation}₽`,
                    'info'
                );
            }
            
            // Перерисовываем если на нужной странице
            if (this.currentRoute === 'projects' || this.currentRoute === 'home') {
                this.render();
            }
        }
    }

    showLiveNotification(message, type = 'info') {
        const container = document.getElementById('liveNotifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `live-notification notification-${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <small>Только что</small>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // 💬 ЧАТ-БОТ ПОДДЕРЖКИ
    toggleChat() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.classList.toggle('open');
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const messagesContainer = document.getElementById('chatMessages');
        
        if (!input || !messagesContainer || !input.value.trim()) return;
        
        const message = input.value.trim();
        
        // Добавляем сообщение пользователя
        this.addChatMessage(message, 'user');
        input.value = '';
        
        // Имитируем ответ бота
        setTimeout(() => {
            this.generateBotResponse(message);
        }, 1000);
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.chatMessages.push({ message, sender, timestamp: new Date() });
    }

    generateBotResponse(userMessage) {
        const responses = {
            'привет': 'Привет! Как я могу помочь вам с вашими проектами?',
            'проект': 'Чтобы создать проект, перейдите на страницу "Создать проект" и заполните форму. Нужна помощь с чем-то конкретным?',
            'поддерж': 'Вы можете поддержать любой проект, нажав кнопку "Поддержать" на карточке проекта.',
            'коин': 'Коины начисляются за активность: создание проектов, поддержку других, достижения. Их можно тратить на продвижение проектов!',
            'уровен': 'Уровень повышается за получение опыта (XP). XP дается за любую активность на платформе.',
            'default': 'Извините, я не совсем понял вопрос. Вы можете спросить о создании проектов, поддержке, коинах или уровнях.'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        let response = responses.default;
        
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }
        
        this.addChatMessage(response, 'bot');
    }

    // 📊 РАСШИРЕННАЯ АНАЛИТИКА
    getProjectAnalytics(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return null;
        
        const created = new Date(project.createdAt);
        const now = new Date();
        const daysRunning = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const avgDailyCollection = project.collected / Math.max(daysRunning, 1);
        const completionEstimate = project.goal / avgDailyCollection;
        
        return {
            daysRunning,
            avgDailyCollection: Math.round(avgDailyCollection),
            completionEstimate: Math.round(completionEstimate),
            successProbability: this.calculateSuccessProbability(project),
            trend: this.calculateTrend(project)
        };
    }

    calculateSuccessProbability(project) {
        const progress = project.collected / project.goal;
        const timeLeft = project.deadline;
        const dailyNeed = (project.goal - project.collected) / timeLeft;
        const avgDaily = project.collected / (30 - timeLeft); // предполагаем 30 дней
        
        if (progress >= 1) return 100;
        if (dailyNeed > avgDaily * 2) return 25;
        if (dailyNeed > avgDaily) return 50;
        if (dailyNeed <= avgDaily) return 75;
        
        return Math.min(progress * 100 + 20, 95);
    }

    calculateTrend(project) {
        // Упрощенный расчет тренда
        const progress = project.collected / project.goal;
        const timeLeft = project.deadline;
        
        if (progress > 0.8) return '📈 Быстро растущий';
        if (progress > 0.5) return '↗️ Стабильный рост';
        if (progress > 0.2) return '➡️ Умеренный';
        return '📉 Нужна поддержка';
    }

    // 🎰 СИСТЕМА СЛУЧАЙНЫХ СОБЫТИЙ
    generateRandomEvent() {
        const events = [
            {
                type: 'bonus',
                message: '🎁 Сезонный бонус! Все проекты получают +10% к сбору сегодня!',
                action: () => {
                    this.projects.forEach(project => {
                        project.collected += Math.floor(project.collected * 0.1);
                    });
                    this.saveToStorage();
                }
            },
            {
                type: 'challenge',
                message: '🏆 Испытание дня! Поддержите 3 проекта и получите 50 коинов!',
                action: () => {
                    // Логика проверки выполнения будет в другом месте
                    this.showLiveNotification('🏆 Новое испытание доступно!', 'info');
                }
            },
            {
                type: 'luck',
                message: '🍀 Удача на вашей стороне! Следующая поддержка удваивается!',
                action: () => {
                    this.userStats.doubleNextDonation = true;
                    this.saveUserStats();
                }
            }
        ];
        
        if (Math.random() < 0.1) { // 10% шанс события
            const event = events[Math.floor(Math.random() * events.length)];
            this.showLiveNotification(event.message, 'success');
            event.action();
        }
    }

    // 🎮 ИГРОВИФИКАЦИЯ ПОДДЕРЖКИ
    processDonationWithBonus(projectId, amount) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        let finalAmount = amount;
        
        // Удвоение удачи
        if (this.userStats.doubleNextDonation) {
            finalAmount *= 2;
            this.showLiveNotification('🍀 Удача! Ваша поддержка удвоена!', 'success');
            delete this.userStats.doubleNextDonation;
            this.saveUserStats();
        }
        
        // Начисление коинов
        const coinsEarned = Math.floor(amount / 10);
        this.addCoins(coinsEarned, 'За поддержку проекта');
        this.addXP(10);
        
        // Обновление проекта
        project.collected += finalAmount;
        project.donors += 1;
        
        this.saveToStorage();
        this.render();
        this.hideModal();
        
        this.showNotification(`🎉 Поддержано на ${finalAmount}₽! +${coinsEarned} коинов`, 'success');
        this.checkProjectAchievements();
    }

    // 📝 ОБНОВЛЕННЫЙ РЕНДЕРИНГ С НОВЫМИ ФУНКЦИЯМИ
    renderHome() {
        const featuredProjects = this.getRecommendedProjects();
        const trendingProjects = this.getTrendingProjects();
        const stats = this.getPlatformStats();

        return `
            <div class="hero-section fade-in">
                <div class="hero-content">
                    <h2>Помощь молодым проектам</h2>
                    <p>Поддержи начинания школьников и студентов - вместе мы можем больше!</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
                        <button onclick="app.navigate('create')" class="btn btn-large btn-gradient hover-lift">
                            🚀 Создать проект
                        </button>
                        ${this.currentUser ? `
                            <div class="coins-system hover-glow">
                                🪙 <span id="userCoins">${this.userStats.coins}</span>
                            </div>
                            <div class="level-badge hover-glow tooltip">
                                ⭐ Ур. <span id="userLevel">${this.userStats.level}</span>
                                <span class="tooltip-text">Опыт: ${this.userStats.xp}/100 до след. уровня</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="stats-overview fade-in">
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.totalProjects}</div>
                    <div class="stat-label">Активных проектов</div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.totalCollected}₽</div>
                    <div class="stat-label">Собрано всего</div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.totalDonors}</div>
                    <div class="stat-label">Участников</div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-number">${stats.successRate}%</div>
                    <div class="stat-label">Успешных сборов</div>
                </div>
            </div>

            ${this.currentUser ? `
                <section class="achievements-panel fade-in">
                    <h3>🏆 Ваши достижения</h3>
                    <div class="badges-container">
                        ${this.renderUserBadges()}
                    </div>
                    <div class="level-progress">
                        <div class="level-progress-fill" id="userXP" style="width: ${this.userStats.xp % 100}%"></div>
                    </div>
                </section>
            ` : ''}

            <section class="featured-projects fade-in">
                <h3>🎯 Рекомендуемые проекты</h3>
                <div class="projects-grid">
                    ${featuredProjects.length > 0 ? 
                      featuredProjects.map(project => this.renderProjectCard(project)).join('') :
                      '<div class="empty-state"><h3>Пока нет проектов</h3><p>Будьте первым, кто создаст проект!</p></div>'
                    }
                </div>
                ${featuredProjects.length > 0 ? `
                    <div class="text-center">
                        <button onclick="app.navigate('projects')" class="btn btn-outline hover-lift">
                            👀 Смотреть все проекты
                        </button>
                    </div>
                ` : ''}
            </section>

            ${trendingProjects.length > 0 ? `
                <section class="featured-projects fade-in">
                    <h3>📈 Популярные проекты</h3>
                    <div class="projects-grid">
                        ${trendingProjects.map(project => this.renderProjectCard(project)).join('')}
                    </div>
                </section>
            ` : ''}
        `;
    }

    renderUserBadges() {
        const allBadges = [
            { id: 'first_project', name: '🚀 Первый проект', description: 'Создал первый проект' },
            { id: 'pro_creator', name: '🎯 Про-создатель', description: 'Создал 5 проектов' },
            { id: 'supporter', name: '❤️ Активный сторонник', description: 'Поддержал 3 проекта' },
            { id: 'coin_collector_1', name: '💰 Начинающий инвестор', description: 'Накопил 100 коинов' },
            { id: 'coin_collector_2', name: '💰 Опытный инвестор', description: 'Накопил 500 коинов' },
            { id: 'coin_collector_3', name: '💰 Крипто-кит', description: 'Накопил 1000 коинов' }
        ];

        return allBadges.map(badge => `
            <div class="badge ${this.userStats.badges.includes(badge.id) ? 'earned' : 'locked'} tooltip">
                ${badge.name}
                <span class="tooltip-text">${badge.description}</span>
            </div>
        `).join('');
    }

    renderProjectCard(project) {
        const progress = (project.collected / project.goal) * 100;
        const daysLeft = project.deadline ? this.getDaysLeft(project.deadline) : null;
        const isUrgent = daysLeft && daysLeft < 7 && progress < 100;
        const achievements = this.getAchievements(project);
        const isFeatured = project.donors > 30 || progress > 80;
        const analytics = this.getProjectAnalytics(project.id);

        return `
            <div class="project-card ${isFeatured ? 'featured' : ''} fade-in hover-lift">
                ${isFeatured ? '<div class="featured-badge">🔥 Популярный</div>' : ''}
                <div class="project-image">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy">` : '📁'}
                    ${isUrgent ? '<div class="urgent-badge">⏰ Срочно!</div>' : ''}
                </div>
                
                <div class="project-content">
                    <div class="project-header">
                        <h4>${project.title}</h4>
                        <span class="project-category">${this.getCategoryIcon(project.category)} ${project.category}</span>
                    </div>
                    
                    <p class="project-description">${project.description.substring(0, 100)}...</p>
                    
                    ${achievements.length > 0 ? `
                        <div class="achievements">
                            ${achievements.map(ach => `<span class="achievement">${ach}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${analytics ? `
                        <div class="project-meta">
                            <span class="countdown-timer ${isUrgent ? 'countdown-expiring' : ''}">
                                ⏰ ${daysLeft}д
                            </span>
                            <span>${analytics.trend}</span>
                            <span>🎯 ${analytics.successProbability}% успеха</span>
                        </div>
                    ` : ''}
                    
                    <div class="project-author">
                        <span>👤 ${project.author}</span>
                        <span>📅 ${this.formatDate(project.createdAt)}</span>
                    </div>

                    <div class="progress-container">
                        <div class="progress">
                            <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                        <div class="progress-stats">
                            <span><strong>${project.collected}₽</strong> собрано</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                    </div>

                    <div class="project-meta">
                        <span>🎯 ${project.goal}₽</span>
                        <span>👥 ${project.donors} поддержали</span>
                        ${daysLeft ? `<span>⏰ ${daysLeft} дней осталось</span>` : ''}
                    </div>

                    ${project.averageRating ? `
                        <div class="rating">
                            ${[1,2,3,4,5].map(star => `
                                <span class="star ${star <= Math.round(project.averageRating) ? 'active' : ''}">
                                    ${star <= Math.round(project.averageRating) ? '⭐' : '☆'}
                                </span>
                            `).join('')}
                            <small>(${project.rating.count})</small>
                        </div>
                    ` : ''}

                    <div class="project-actions">
                        <button onclick="app.supportProject('${project.id}')" 
                                class="btn btn-donate hover-lift">💝 Поддержать</button>
                        <button onclick="app.toggleFavorite('${project.id}')" 
                                class="btn-icon ${project.isFavorite ? 'favorite' : ''} hover-lift">⭐</button>
                        ${!project.averageRating ? `
                            <button onclick="app.showRatingModal('${project.id}')" 
                                    class="btn-icon hover-lift">👍</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // 💾 ОБНОВЛЕННОЕ ХРАНЕНИЕ ДАННЫХ
    loadInitialData() {
        const saved = localStorage.getItem('crowdfunding_projects');
        this.projects = saved ? JSON.parse(saved) : this.getDemoProjects();
        
        const savedUsers = localStorage.getItem('crowdfunding_users');
        this.users = savedUsers ? JSON.parse(savedUsers) : [];
        
        const currentUser = localStorage.getItem('current_user');
        this.currentUser = currentUser ? JSON.parse(currentUser) : null;
        
        const savedStats = localStorage.getItem('user_stats');
        this.userStats = savedStats ? JSON.parse(savedStats) : {
            coins: 100,
            level: 1,
            xp: 0,
            badges: [],
            notifications: []
        };
    }

    saveUserStats() {
        localStorage.setItem('user_stats', JSON.stringify(this.userStats));
    }

    // 🔧 ОБНОВЛЕННЫЕ ОСНОВНЫЕ МЕТОДЫ
    handleProjectSubmit(event) {
        event.preventDefault();
        
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const goal = parseInt(document.getElementById('projectGoal').value);
        const category = document.getElementById('projectCategory').value;
        const author = document.getElementById('projectAuthor').value || 'Аноним';
        const deadline = parseInt(document.getElementById('projectDeadline').value) || 30;
        const image = document.getElementById('projectImage').value;

        if (!title || !description || !goal || !category) {
            this.showNotification('❌ Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        const projectData = {
            title: title,
            description: description,
            goal: goal,
            category: category,
            author: author,
            deadline: deadline,
            image: image,
            createdAt: new Date().toISOString(),
            collected: 0,
            donors: 0,
            status: 'active',
            id: Date.now().toString()
        };

        this.projects.unshift(projectData);
        this.saveToStorage();
        
        // Награда за создание проекта
        this.addCoins(50, 'За создание проекта');
        this.addXP(25);
        this.checkProjectAchievements();
        
        this.showNotification('🎉 Проект успешно создан! +50 коинов', 'success');
        this.navigate('projects');
    }

    supportProject(projectId) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        this.showModal(`
            <h3>💝 Поддержать проект</h3>
            <p><strong>«${project.title}»</strong></p>
            ${this.userStats.doubleNextDonation ? `
                <div class="achievement" style="margin: 1rem 0;">
                    🍀 Удача! Следующая поддержка будет удвоена!
                </div>
            ` : ''}
            <p style="color: var(--text-light); margin: 1rem 0;">Выберите сумму поддержки:</p>
            
            <div class="donation-amounts" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin: 1.5rem 0;">
                <button onclick="app.processDonationWithBonus('${projectId}', 100)" class="btn btn-outline hover-lift">100₽</button>
                <button onclick="app.processDonationWithBonus('${projectId}', 500)" class="btn btn-outline hover-lift">500₽</button>
                <button onclick="app.processDonationWithBonus('${projectId}', 1000)" class="btn btn-outline hover-lift">1000₽</button>
            </div>
            
            <div class="custom-amount" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <input type="number" id="customAmount" placeholder="Другая сумма" min="10" 
                       style="flex: 1; padding: 0.75rem; border: 2px solid var(--border); border-radius: 0.5rem; background: var(--surface); color: var(--text);">
                <button onclick="app.processCustomDonationWithBonus('${projectId}')" class="btn btn-gradient hover-lift">Поддержать</button>
            </div>
            
            <div style="margin-top: 1rem; padding: 1rem; background: var(--background); border-radius: 0.5rem;">
                <small>💡 За поддержку вы получите коины и опыт!</small>
            </div>
        `);
    }

    processCustomDonationWithBonus(projectId) {
        const amount = parseInt(document.getElementById('customAmount')?.value);
        if (!amount || amount < 10) {
            this.showNotification('❌ Введите корректную сумму (минимум 10₽)', 'error');
            return;
        }
        this.processDonationWithBonus(projectId, amount);
    }

    // ... остальные методы из предыдущей версии ...

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-route') === this.currentRoute);
        });

        const authBtn = document.getElementById('authBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (this.currentUser && userMenu && userName && userAvatar) {
            authBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            userMenu.style.alignItems = 'center';
            userMenu.style.gap = '0.75rem';
            userName.textContent = this.currentUser.name;
            userAvatar.textContent = this.currentUser.avatar;
            
            // Добавляем коины и уровень в меню пользователя
            if (!document.getElementById('userCoinsMenu')) {
                const coinsElement = document.createElement('div');
                coinsElement.id = 'userCoinsMenu';
                coinsElement.className = 'coins-system';
                coinsElement.innerHTML = `🪙 ${this.userStats.coins}`;
                userMenu.insertBefore(coinsElement, userMenu.firstChild);
            }
        } else if (authBtn) {
            authBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new CrowdfundingApp();
});
