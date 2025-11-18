class CrowdfundingApp {
    constructor() {
        this.projects = [];
        this.users = [];
        this.currentUser = null;
        this.currentRoute = 'home';
        this.currentProjectId = null;
        this.init();
    }

    init() {
    this.setupRouter();
    this.setupEventListeners();
    this.loadInitialData();
    
    // Небольшая задержка для гарантированной отрисовки
    setTimeout(() => {
        this.render();
    }, 100);
}

    // 🛣️ СИСТЕМА РОУТИНГА
    setupRouter() {
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });

        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        let route = 'home';

        if (hash === '/') route = 'home';
        else if (hash === '/projects') route = 'projects';
        else if (hash === '/create') route = 'create';
        else if (hash === '/stats') route = 'stats';
        else if (hash.startsWith('/project/')) {
            route = 'project-detail';
            this.currentProjectId = hash.split('/')[2];
        }

        this.currentRoute = route;
        this.render();
    }

    navigate(route) {
        window.location.hash = route === 'home' ? '/' : `/${route}`;
    }

    // 🎨 СИСТЕМА РЕНДЕРИНГА
    render() {
    const content = document.getElementById('app-content');
    if (!content) {
        console.error('App content element not found');
        return;
    }
    
    // остальной код render...
        
        switch(this.currentRoute) {
            case 'home':
                content.innerHTML = this.renderHome();
                break;
            case 'projects':
                content.innerHTML = this.renderProjects();
                break;
            case 'create':
                content.innerHTML = this.renderCreateForm();
                break;
            case 'stats':
                content.innerHTML = this.renderStats();
                break;
            case 'project-detail':
                content.innerHTML = this.renderProjectDetail();
                break;
            default:
                content.innerHTML = this.renderHome();
        }

        this.updateNavigation();
        this.setupDynamicEventListeners();
    }

    renderHome() {
        const featuredProjects = this.projects.slice(0, 3);
        const stats = this.getPlatformStats();

        return `
            <div class="hero-section">
                <div class="hero-content">
                    <h2>Поддержи молодые проекты!</h2>
                    <p>Помогите реализовать интересные идеи и изменить мир к лучшему</p>
                    <button onclick="app.navigate('create')" class="btn btn-large">Создать проект</button>
                </div>
            </div>

            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalProjects}</div>
                    <div class="stat-label">Активных проектов</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalCollected}₽</div>
                    <div class="stat-label">Собрано всего</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalDonors}</div>
                    <div class="stat-label">Участников</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.successRate}%</div>
                    <div class="stat-label">Успешных сборов</div>
                </div>
            </div>

            <section class="featured-projects">
                <h3>Рекомендуемые проекты</h3>
                <div class="projects-grid">
                    ${featuredProjects.length > 0 ? 
                      featuredProjects.map(project => this.renderProjectCard(project)).join('') :
                      '<p class="empty-state">Пока нет проектов. Будьте первым!</p>'
                    }
                </div>
                ${featuredProjects.length > 0 ? `
                    <div class="text-center">
                        <button onclick="app.navigate('projects')" class="btn btn-outline">Смотреть все проекты</button>
                    </div>
                ` : ''}
            </section>
        `;
    }

    renderProjects() {
        const categories = this.getCategories();
        const filteredProjects = this.applyFilters();

        return `
            <div class="page-header">
                <h2>Все проекты</h2>
                <div class="filters">
                    <select id="categoryFilter">
                        <option value="all">Все категории</option>
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                    <select id="sortSelect">
                        <option value="newest">Сначала новые</option>
                        <option value="popular">По популярности</option>
                        <option value="almost-done">Почти собраны</option>
                        <option value="most-funded">Больше всего собрано</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="Поиск проектов...">
                </div>
            </div>

            <div class="projects-grid">
                ${filteredProjects.length > 0 ? 
                  filteredProjects.map(project => this.renderProjectCard(project)).join('') :
                  '<div class="empty-state"><h3>Проекты не найдены</h3><p>Попробуйте изменить параметры поиска</p></div>'
                }
            </div>
        `;
    }

    renderProjectCard(project) {
        const progress = (project.collected / project.goal) * 100;
        const daysLeft = project.deadline ? this.getDaysLeft(project.deadline) : null;
        const isUrgent = daysLeft && daysLeft < 7 && progress < 100;

        return `
            <div class="project-card" onclick="app.showProjectDetail('${project.id}')">
                <div class="project-image">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}">` : '📁'}
                    ${isUrgent ? '<div class="urgent-badge">Срочно!</div>' : ''}
                </div>
                
                <div class="project-content">
                    <div class="project-header">
                        <h4>${project.title}</h4>
                        <span class="project-category">${this.getCategoryIcon(project.category)} ${project.category}</span>
                    </div>
                    
                    <p class="project-description">${project.description.substring(0, 100)}...</p>
                    
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

                    <div class="project-actions">
                        <button onclick="event.stopPropagation(); app.supportProject('${project.id}')" 
                                class="btn btn-donate">Поддержать</button>
                        <button onclick="event.stopPropagation(); app.toggleFavorite('${project.id}')" 
                                class="btn-icon ${project.isFavorite ? 'favorite' : ''}">⭐</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderCreateForm() {
        return `
            <div class="form-container">
                <h2>Создать новый проект</h2>
                <form id="projectForm" class="project-form">
                    <div class="form-group">
                        <label for="projectTitle">Название проекта *</label>
                        <input type="text" id="projectTitle" required maxlength="100" placeholder="Введите название проекта">
                    </div>

                    <div class="form-group">
                        <label for="projectDescription">Описание проекта *</label>
                        <textarea id="projectDescription" required rows="5" maxlength="2000" placeholder="Опишите ваш проект подробно..."></textarea>
                        <div class="char-counter"><span id="descCounter">0</span>/2000</div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="projectGoal">Целевая сумма (руб) *</label>
                            <input type="number" id="projectGoal" required min="1000" max="1000000" placeholder="10000">
                        </div>
                        
                        <div class="form-group">
                            <label for="projectCategory">Категория *</label>
                            <select id="projectCategory" required>
                                <option value="">Выберите категорию</option>
                                <option value="технологии">💻 Технологии</option>
                                <option value="искусство">🎨 Искусство</option>
                                <option value="образование">📚 Образование</option>
                                <option value="экология">🌱 Экология</option>
                                <option value="спорт">⚽ Спорт</option>
                                <option value="социальный">🤝 Социальный</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="projectDeadline">Срок сбора (дней)</label>
                            <input type="number" id="projectDeadline" min="1" max="365" value="30">
                        </div>
                        
                        <div class="form-group">
                            <label for="projectAuthor">Имя автора</label>
                            <input type="text" id="projectAuthor" value="${this.currentUser?.name || ''}" placeholder="Ваше имя">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="projectImage">Изображение проекта (URL)</label>
                        <input type="url" id="projectImage" placeholder="https://example.com/image.jpg">
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Создать проект</button>
                        <button type="button" onclick="app.navigate('home')" class="btn btn-cancel">Отмена</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderStats() {
        const stats = this.getPlatformStats();
        const recentProjects = this.projects.slice(0, 5);

        return `
            <div class="stats-page">
                <h2>Статистика платформы</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalProjects}</div>
                        <div class="stat-label">Всего проектов</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalCollected}₽</div>
                        <div class="stat-label">Общая сумма сборов</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.avgDonation}₽</div>
                        <div class="stat-label">Средний донат</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.successRate}%</div>
                        <div class="stat-label">Успешных проектов</div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-container">
                        <h3>Распределение по категориям</h3>
                        <div class="chart" id="categoryChart">
                            ${this.renderCategoryChart()}
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Последние проекты</h3>
                        <div class="recent-projects">
                            ${recentProjects.map(project => `
                                <div class="recent-project">
                                    <span>${project.title}</span>
                                    <span class="project-amount">${project.collected}₽</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderProjectDetail() {
        const project = this.projects.find(p => p.id === this.currentProjectId);
        if (!project) {
            return '<div class="error-state"><h3>Проект не найден</h3><button onclick="app.navigate(\'projects\')" class="btn">Вернуться к проектам</button></div>';
        }

        const progress = (project.collected / project.goal) * 100;

        return `
            <div class="project-detail">
                <button onclick="app.navigate('projects')" class="btn btn-back">← Назад к проектам</button>
                
                <div class="project-hero">
                    <div class="project-hero-image">
                        ${project.image ? `<img src="${project.image}" alt="${project.title}">` : '📁'}
                    </div>
                    <div class="project-hero-content">
                        <h1>${project.title}</h1>
                        <p class="project-meta">Автор: ${project.author} • ${this.formatDate(project.createdAt)}</p>
                        
                        <div class="project-stats-large">
                            <div class="stat">
                                <div class="stat-number">${project.collected}₽</div>
                                <div class="stat-label">Собрано</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">${project.goal}₽</div>
                                <div class="stat-label">Цель</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">${project.donors}</div>
                                <div class="stat-label">Поддержали</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">${Math.round(progress)}%</div>
                                <div class="stat-label">Прогресс</div>
                            </div>
                        </div>

                        <div class="progress large">
                            <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>

                        <button onclick="app.supportProject('${project.id}')" class="btn btn-donate-large">Поддержать проект</button>
                    </div>
                </div>

                <div class="project-content-detailed">
                    <div class="project-description-full">
                        <h3>О проекте</h3>
                        <p>${project.description}</p>
                    </div>

                    <div class="project-sidebar">
                        <div class="info-card">
                            <h4>📋 Информация</h4>
                            <div class="info-item">
                                <strong>Категория:</strong>
                                <span>${this.getCategoryIcon(project.category)} ${project.category}</span>
                            </div>
                            <div class="info-item">
                                <strong>Статус:</strong>
                                <span>${project.status}</span>
                            </div>
                            ${project.deadline ? `
                                <div class="info-item">
                                    <strong>Дней осталось:</strong>
                                    <span>${project.deadline}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🔧 ФУНКЦИОНАЛ
    setupEventListeners() {
        document.getElementById('authBtn').addEventListener('click', () => {
            this.showAuthModal();
        });
    }

    setupDynamicEventListeners() {
        // Форма создания проекта
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProjectSubmit(e);
            });

            // Счетчик символов
            const descTextarea = document.getElementById('projectDescription');
            const descCounter = document.getElementById('descCounter');
            if (descTextarea && descCounter) {
                descTextarea.addEventListener('input', () => {
                    descCounter.textContent = descTextarea.value.length;
                });
            }
        }

        // Фильтры на странице проектов
        const categoryFilter = document.getElementById('categoryFilter');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.applyFilters());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
    }

    handleProjectSubmit(event) {
        event.preventDefault();
        
        const projectData = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            goal: parseInt(document.getElementById('projectGoal').value),
            category: document.getElementById('projectCategory').value,
            author: document.getElementById('projectAuthor').value || 'Аноним',
            deadline: parseInt(document.getElementById('projectDeadline').value) || 30,
            image: document.getElementById('projectImage').value,
            createdAt: new Date().toISOString(),
            collected: 0,
            donors: 0,
            status: 'active',
            id: Date.now().toString()
        };

        this.projects.unshift(projectData);
        this.saveToStorage();
        
        this.showNotification('Проект успешно создан!', 'success');
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
            <h3>Поддержать проект</h3>
            <p>«${project.title}»</p>
            
            <div class="donation-amounts" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin: 1.5rem 0;">
                <button onclick="app.processDonation('${projectId}', 100)" class="btn btn-outline">100₽</button>
                <button onclick="app.processDonation('${projectId}', 500)" class="btn btn-outline">500₽</button>
                <button onclick="app.processDonation('${projectId}', 1000)" class="btn btn-outline">1000₽</button>
            </div>
            
            <div class="custom-amount" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <input type="number" id="customAmount" placeholder="Другая сумма" min="10" style="flex: 1; padding: 0.75rem; border: 2px solid var(--border); border-radius: 0.5rem;">
                <button onclick="app.processCustomDonation('${projectId}')" class="btn">Поддержать</button>
            </div>
        `);
    }

    processDonation(projectId, amount) {
        this.processCustomDonation(projectId, amount);
    }

    processCustomDonation(projectId, customAmount = null) {
        const amount = customAmount || parseInt(document.getElementById('customAmount')?.value);
        
        if (!amount || amount < 10) {
            this.showNotification('Введите корректную сумму (минимум 10₽)', 'error');
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.collected += amount;
            project.donors += 1;
            
            this.saveToStorage();
            this.render();
            this.hideModal();
            
            this.showNotification(`Спасибо! Вы поддержали проект на ${amount}₽`, 'success');
        }
    }

    toggleFavorite(projectId) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.isFavorite = !project.isFavorite;
            this.saveToStorage();
            this.render();
            
            this.showNotification(
                project.isFavorite ? 'Проект добавлен в избранное' : 'Проект удален из избранное',
                'success'
            );
        }
    }

    showProjectDetail(projectId) {
        this.navigate(`project/${projectId}`);
    }

    applyFilters() {
        // В реальном приложении здесь была бы фильтрация
        // Сейчас просто перерисовываем
        if (this.currentRoute === 'projects') {
            this.render();
        }
    }

    // 💾 ХРАНЕНИЕ ДАННЫХ
    loadInitialData() {
        const saved = localStorage.getItem('crowdfunding_projects');
        this.projects = saved ? JSON.parse(saved) : this.getDemoProjects();
        
        const savedUsers = localStorage.getItem('crowdfunding_users');
        this.users = savedUsers ? JSON.parse(savedUsers) : [];
        
        const currentUser = localStorage.getItem('current_user');
        this.currentUser = currentUser ? JSON.parse(currentUser) : null;
    }

    saveToStorage() {
        localStorage.setItem('crowdfunding_projects', JSON.stringify(this.projects));
        localStorage.setItem('crowdfunding_users', JSON.stringify(this.users));
        if (this.currentUser) {
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        }
    }

    getDemoProjects() {
        return [
            {
                id: '1',
                title: "Школьный сад мечты",
                description: "Создание современной зоны отдыха с растениями и местом для учебы на открытом воздухе. Мы планируем посадить фруктовые деревья, разбить цветники и установить удобные скамейки для занятий.",
                goal: 50000,
                collected: 32500,
                category: "экология",
                author: "Эко-клуб школы №15",
                createdAt: new Date('2024-01-15').toISOString(),
                donors: 47,
                status: "active",
                deadline: 45,
                isFavorite: false
            },
            {
                id: '2', 
                title: "Робототехника для всех",
                description: "Закупка оборудования для кружка робототехники и проведение мастер-классов для всех желающих. Arduino, 3D-принтер, компоненты для сборки роботов.",
                goal: 75000,
                collected: 68200,
                category: "технологии", 
                author: "IT-лаборатория",
                createdAt: new Date('2024-01-10').toISOString(),
                donors: 89,
                status: "active",
                deadline: 15,
                isFavorite: true
            },
            {
                id: '3',
                title: "Молодежный театр",
                description: "Создание театральной студии для подростков. Костюмы, декорации, сценическое оборудование для постановки спектаклей.",
                goal: 30000,
                collected: 18500,
                category: "искусство",
                author: "Творческая мастерская",
                createdAt: new Date('2024-01-20').toISOString(),
                donors: 23,
                status: "active",
                deadline: 60,
                isFavorite: false
            }
        ];
    }

    // 📊 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    getPlatformStats() {
        const totalProjects = this.projects.length;
        const totalCollected = this.projects.reduce((sum, p) => sum + p.collected, 0);
        const totalDonors = this.projects.reduce((sum, p) => sum + p.donors, 0);
        const successfulProjects = this.projects.filter(p => p.collected >= p.goal).length;
        const successRate = totalProjects > 0 ? Math.round((successfulProjects / totalProjects) * 100) : 0;
        const avgDonation = totalDonors > 0 ? Math.round(totalCollected / totalDonors) : 0;

        return {
            totalProjects,
            totalCollected,
            totalDonors,
            successRate,
            avgDonation
        };
    }

    getCategories() {
        const categories = [...new Set(this.projects.map(p => p.category))];
        return categories.filter(Boolean);
    }

    getCategoryIcon(category) {
        const icons = {
            'технологии': '💻',
            'искусство': '🎨', 
            'образование': '📚',
            'экология': '🌱',
            'спорт': '⚽',
            'социальный': '🤝'
        };
        return icons[category] || '📋';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    getDaysLeft(deadline) {
        if (!deadline) return null;
        return Math.max(0, deadline);
    }

    renderCategoryChart() {
        const categories = {};
        this.projects.forEach(project => {
            categories[project.category] = (categories[project.category] || 0) + 1;
        });

        return Object.entries(categories).map(([category, count]) => `
            <div class="chart-item">
                <div class="chart-label">
                    <span>${this.getCategoryIcon(category)} ${category}</span>
                    <span>${count}</span>
                </div>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${(count / this.projects.length) * 100}%"></div>
                </div>
            </div>
        `).join('');
    }

    // 🎪 UI ФУНКЦИИ
    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalOverlay').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-route') === this.currentRoute);
        });

        // Обновляем панель пользователя
        const authBtn = document.getElementById('authBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            authBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            userName.textContent = this.currentUser.name;
        } else {
            authBtn.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    showAuthModal() {
        this.showModal(`
            <h3>Вход в систему</h3>
            <div class="auth-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="text" id="authName" placeholder="Ваше имя" value="${this.currentUser?.name || ''}">
                <input type="email" id="authEmail" placeholder="Email" value="${this.currentUser?.email || ''}">
                <button onclick="app.handleAuth()" class="btn btn-primary">Войти / Зарегистрироваться</button>
            </div>
        `);
    }

    handleAuth() {
        const name = document.getElementById('authName').value || 'Пользователь';
        const email = document.getElementById('authEmail').value || 'user@example.com';
        
        this.currentUser = { name, email };
        this.saveToStorage();
        this.hideModal();
        this.render();
        
        this.showNotification(`Добро пожаловать, ${name}!`, 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.render();
        this.showNotification('Вы вышли из системы', 'info');
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new CrowdfundingApp();
});
