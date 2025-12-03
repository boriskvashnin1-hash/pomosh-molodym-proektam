class CrowdfundingApp {
    constructor() {
        this.projects = [];
        this.users = [];
        this.currentUser = null;
        this.currentRoute = 'home';
        this.currentProjectId = null;
        this.deferredPrompt = null;
        
        // Привязываем методы к контексту
        this.applyFilters = this.applyFilters.bind(this);
        this.handleProjectSubmit = this.handleProjectSubmit.bind(this);
        this.supportProject = this.supportProject.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.rateProject = this.rateProject.bind(this);
        this.showProjectDetail = this.showProjectDetail.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
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
        
        setTimeout(() => {
            this.requestNotificationPermission();
        }, 2000);
        
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
        if (!content) return;

        let html = '';
        switch(this.currentRoute) {
            case 'home':
                html = this.renderHome();
                break;
            case 'projects':
                html = this.renderProjects();
                break;
            case 'create':
                html = this.renderCreateForm();
                break;
            case 'stats':
                html = this.renderStats();
                break;
            case 'project-detail':
                html = this.renderProjectDetail();
                break;
            default:
                html = this.renderHome();
        }

        content.innerHTML = html;
        this.updateNavigation();
        this.setupDynamicEventListeners();
    }

    renderHome() {
        const featuredProjects = this.getRecommendedProjects();
        const trendingProjects = this.getTrendingProjects();
        const stats = this.getPlatformStats();

        return `
            <div class="hero-section fade-in">
                <div class="hero-content">
                    <h2>Помощь молодым проектам</h2>
                    <p>Поддержи начинания школьников и студентов - вместе мы можем больше!</p>
                    <button onclick="app.navigate('create')" class="btn btn-large btn-gradient hover-lift">
                        🚀 Создать проект
                    </button>
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

    renderProjects() {
        const categories = this.getCategories();
        const filteredProjects = this.applyFiltersOnRender();

        return `
            <div class="page-header fade-in">
                <h2>Все проекты</h2>
                <div class="filters">
                    <select id="categoryFilter">
                        <option value="all">Все категории</option>
                        ${categories.map(cat => `<option value="${cat}">${this.getCategoryIcon(cat)} ${cat}</option>`).join('')}
                    </select>
                    <select id="sortSelect">
                        <option value="newest">Сначала новые</option>
                        <option value="popular">По популярности</option>
                        <option value="almost-done">Почти собраны</option>
                        <option value="most-funded">Больше всего собрано</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="🔍 Поиск проектов...">
                </div>
            </div>

            <div class="projects-grid" id="projectsGrid">
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
        const achievements = this.getAchievements(project);
        const isFeatured = project.donors > 30 || progress > 80;

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

    renderCreateForm() {
        return `
            <div class="form-container fade-in">
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
                        <button type="submit" class="btn btn-primary btn-gradient hover-lift">🚀 Создать проект</button>
                        <button type="button" onclick="app.navigate('home')" class="btn btn-cancel hover-lift">Отмена</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderStats() {
        const stats = this.getPlatformStats();
        const advancedStats = this.getAdvancedStats();
        const recentProjects = this.projects.slice(0, 5);

        return `
            <div class="stats-page fade-in">
                <h2>📊 Статистика платформы</h2>
                
                <div class="stats-grid">
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.totalProjects}</div>
                        <div class="stat-label">Всего проектов</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.totalCollected}₽</div>
                        <div class="stat-label">Общая сумма сборов</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.avgDonation}₽</div>
                        <div class="stat-label">Средний донат</div>
                    </div>
                    <div class="stat-card hover-lift">
                        <div class="stat-number">${stats.successRate}%</div>
                        <div class="stat-label">Успешных проектов</div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-container hover-lift">
                        <h3>📈 Распределение по категориям</h3>
                        <div class="chart" id="categoryChart">
                            ${this.renderCategoryChart()}
                        </div>
                    </div>
                    
                    <div class="chart-container hover-lift">
                        <h3>🆕 Последние проекты</h3>
                        <div class="recent-projects">
                            ${recentProjects.map(project => `
                                <div class="recent-project hover-lift" onclick="app.showProjectDetail('${project.id}')">
                                    <span>${project.title}</span>
                                    <span class="project-amount">${project.collected}₽</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                ${advancedStats.trendingProjects.length > 0 ? `
                    <div class="chart-container hover-lift">
                        <h3>🔥 Топ проектов</h3>
                        <div class="recent-projects">
                            ${advancedStats.trendingProjects.map(project => `
                                <div class="recent-project hover-lift" onclick="app.showProjectDetail('${project.id}')">
                                    <span>${project.title}</span>
                                    <span class="project-amount">${project.collected}₽</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProjectDetail() {
        const project = this.projects.find(p => p.id === this.currentProjectId);
        if (!project) {
            return '<div class="error-state fade-in"><h3>Проект не найден</h3><button onclick="app.navigate(\'projects\')" class="btn">Вернуться к проектам</button></div>';
        }

        const progress = (project.collected / project.goal) * 100;
        const achievements = this.getAchievements(project);

        return `
            <div class="project-detail">
                <button onclick="app.navigate('projects')" class="btn btn-back hover-lift">← Назад к проектам</button>
                
                <div class="project-hero fade-in">
                    <div class="project-hero-image hover-lift">
                        ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy">` : '📁'}
                    </div>
                    <div class="project-hero-content">
                        <h1>${project.title}</h1>
                        <p class="project-meta">Автор: ${project.author} • 📅 ${this.formatDate(project.createdAt)}</p>
                        
                        ${achievements.length > 0 ? `
                            <div class="achievements">
                                ${achievements.map(ach => `<span class="achievement">${ach}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="project-stats-large">
                            <div class="stat hover-lift">
                                <span class="stat-number">${project.collected}₽</span>
                                <span class="stat-label">Собрано</span>
                            </div>
                            <div class="stat hover-lift">
                                <span class="stat-number">${project.goal}₽</span>
                                <span class="stat-label">Цель</span>
                            </div>
                            <div class="stat hover-lift">
                                <span class="stat-number">${project.donors}</span>
                                <span class="stat-label">Поддержали</span>
                            </div>
                            <div class="stat hover-lift">
                                <span class="stat-number">${Math.round(progress)}%</span>
                                <span class="stat-label">Прогресс</span>
                            </div>
                        </div>

                        <div class="progress large">
                            <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>

                        <button onclick="app.supportProject('${project.id}')" class="btn btn-donate-large btn-gradient hover-lift">
                            💝 Поддержать проект
                        </button>
                    </div>
                </div>

                <div class="project-content-detailed fade-in">
                    <div class="project-description-full">
                        <h3>📖 О проекте</h3>
                        <p>${project.description}</p>
                        
                        ${project.averageRating ? `
                            <div class="rating" style="margin-top: 2rem;">
                                <h4>⭐ Рейтинг проекта</h4>
                                <div>
                                    ${[1,2,3,4,5].map(star => `
                                        <span class="star ${star <= Math.round(project.averageRating) ? 'active' : ''}">
                                            ${star <= Math.round(project.averageRating) ? '⭐' : '☆'}
                                        </span>
                                    `).join('')}
                                    <span style="margin-left: 1rem; color: var(--text-light);">
                                        ${project.averageRating.toFixed(1)} из 5 (${project.rating.count} оценок)
                                    </span>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="project-sidebar">
                        <div class="info-card hover-lift">
                            <h4>📋 Информация</h4>
                            <div class="info-item">
                                <strong>Категория:</strong>
                                <span>${this.getCategoryIcon(project.category)} ${project.category}</span>
                            </div>
                            <div class="info-item">
                                <strong>Статус:</strong>
                                <span>${project.status}</span>
                            </div>
                            <div class="info-item">
                                <strong>Автор:</strong>
                                <span>${project.author}</span>
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

    // 🔧 ФИЛЬТРАЦИЯ И СОРТИРОВКА
    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('searchInput');
        
        if (!categoryFilter || !sortSelect || !searchInput) {
            return;
        }
        
        const category = categoryFilter.value;
        const sortBy = sortSelect.value;
        const searchQuery = searchInput.value.toLowerCase().trim();
        
        let filteredProjects = [...this.projects];
        
        // Фильтрация по категории
        if (category !== 'all') {
            filteredProjects = filteredProjects.filter(project => 
                project.category === category
            );
        }
        
        // Поиск
        if (searchQuery) {
            filteredProjects = filteredProjects.filter(project => 
                project.title.toLowerCase().includes(searchQuery) ||
                project.description.toLowerCase().includes(searchQuery) ||
                project.author.toLowerCase().includes(searchQuery) ||
                project.category.toLowerCase().includes(searchQuery)
            );
        }
        
        // Сортировка
        filteredProjects = this.sortProjects(filteredProjects, sortBy);
        
        // Обновляем отображение
        this.renderFilteredProjects(filteredProjects);
    }

    applyFiltersOnRender() {
        return this.sortProjects([...this.projects], 'newest');
    }

    sortProjects(projects, criteria) {
        const sorted = [...projects];
        
        switch(criteria) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'popular':
                return sorted.sort((a, b) => b.donors - a.donors);
            case 'almost-done':
                return sorted.sort((a, b) => {
                    const progressA = (a.collected / a.goal);
                    const progressB = (b.collected / b.goal);
                    return progressB - progressA;
                });
            case 'most-funded':
                return sorted.sort((a, b) => b.collected - a.collected);
            default:
                return sorted;
        }
    }

    renderFilteredProjects(projects) {
        const container = document.getElementById('projectsGrid');
        if (!container) return;
        
        container.innerHTML = projects.length > 0 ? 
            projects.map(project => this.renderProjectCard(project)).join('') :
            '<div class="empty-state"><h3>Проекты не найдены</h3><p>Попробуйте изменить параметры поиска</p></div>';
    }

    // 🔧 ОСНОВНОЙ ФУНКЦИОНАЛ
    setupEventListeners() {
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            authBtn.addEventListener('click', this.showAuthModal);
        }
    }

    setupDynamicEventListeners() {
        // Форма создания проекта
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            // Удаляем старые обработчики
            projectForm.removeEventListener('submit', this.handleProjectSubmit);
            // Добавляем новые
            projectForm.addEventListener('submit', this.handleProjectSubmit);

            // Счетчик символов
            const descTextarea = document.getElementById('projectDescription');
            const descCounter = document.getElementById('descCounter');
            if (descTextarea && descCounter) {
                descTextarea.addEventListener('input', () => {
                    descCounter.textContent = descTextarea.value.length;
                });
                descCounter.textContent = descTextarea.value.length;
            }
        }

        // Фильтры на странице проектов
        const categoryFilter = document.getElementById('categoryFilter');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) {
            categoryFilter.removeEventListener('change', this.applyFilters);
            categoryFilter.addEventListener('change', this.applyFilters);
        }
        if (sortSelect) {
            sortSelect.removeEventListener('change', this.applyFilters);
            sortSelect.addEventListener('change', this.applyFilters);
        }
        if (searchInput) {
            searchInput.removeEventListener('input', this.applyFilters);
            searchInput.addEventListener('input', this.applyFilters);
        }
    }

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
        
        this.showNotification('🎉 Проект успешно создан!', 'success');
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
            <p style="color: var(--text-light); margin: 1rem 0;">Выберите сумму поддержки:</p>
            
            <div class="donation-amounts" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin: 1.5rem 0;">
                <button onclick="app.processDonation('${projectId}', 100)" class="btn btn-outline hover-lift">100₽</button>
                <button onclick="app.processDonation('${projectId}', 500)" class="btn btn-outline hover-lift">500₽</button>
                <button onclick="app.processDonation('${projectId}', 1000)" class="btn btn-outline hover-lift">1000₽</button>
            </div>
            
            <div class="custom-amount" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <input type="number" id="customAmount" placeholder="Другая сумма" min="10" 
                       style="flex: 1; padding: 0.75rem; border: 2px solid var(--border); border-radius: 0.5rem; background: var(--surface); color: var(--text);">
                <button onclick="app.processCustomDonation('${projectId}')" class="btn btn-gradient hover-lift">Поддержать</button>
            </div>
        `);
    }

    processDonation(projectId, amount) {
        this.processCustomDonation(projectId, amount);
    }

    processCustomDonation(projectId, customAmount = null) {
        const amount = customAmount || parseInt(document.getElementById('customAmount')?.value);
        
        if (!amount || amount < 10) {
            this.showNotification('❌ Введите корректную сумму (минимум 10₽)', 'error');
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.collected += amount;
            project.donors += 1;
            
            this.saveToStorage();
            this.render();
            this.hideModal();
            
            this.showNotification(`🎉 Спасибо! Вы поддержали проект на ${amount}₽`, 'success');
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
            
            const message = project.isFavorite ? '⭐ Проект добавлен в избранное' : '📋 Проект удален из избранного';
            this.showNotification(message, 'success');
        }
    }

    rateProject(projectId, rating) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.rating = project.rating || { total: 0, count: 0 };
            project.rating.total += rating;
            project.rating.count += 1;
            project.averageRating = project.rating.total / project.rating.count;
            
            this.saveToStorage();
            this.render();
            this.hideModal();
            this.showNotification('⭐ Спасибо за вашу оценку!', 'success');
        }
    }

    showProjectDetail(projectId) {
        this.navigate(`project/${projectId}`);
    }

    // 🌙 ТЁМНАЯ ТЕМА
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDark);
        
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }
        
        this.showNotification(isDark ? '🌙 Тёмная тема включена' : '☀️ Светлая тема включена', 'info');
    }

    // 🏆 СИСТЕМА ДОСТИЖЕНИЙ
    getAchievements(project) {
        const achievements = [];
        const progress = (project.collected / project.goal) * 100;
        
        if (project.collected >= project.goal) {
            achievements.push('🎯 Цель достигнута');
        }
        
        if (project.donors >= 50) {
            achievements.push('👥 Популярный проект');
        }
        
        if (project.collected >= project.goal * 2) {
            achievements.push('🚀 Превышение цели');
        }
        
        if (progress >= 90 && progress < 100) {
            achievements.push('⏰ Почти у цели');
        }
        
        if (project.donors >= 100) {
            achievements.push('🔥 Мега-популярный');
        }
        
        return achievements;
    }

    // 📱 PWA ФУНКЦИИ
    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    // 🔔 УВЕДОМЛЕНИЯ
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('🔔 Уведомления включены!', 'success');
                }
            });
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

    getAdvancedStats() {
        const stats = this.getPlatformStats();
        const trendingProjects = this.projects
            .filter(p => p.donors > 0)
            .sort((a, b) => (b.collected / b.donors) - (a.collected / a.donors))
            .slice(0, 5);

        return {
            ...stats,
            trendingProjects
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

    getRecommendedProjects() {
        if (!this.currentUser) return this.projects.slice(0, 3);
        
        const userFavorites = this.projects.filter(p => p.isFavorite);
        const favoriteCategories = [...new Set(userFavorites.map(p => p.category))];
        
        if (favoriteCategories.length === 0) return this.projects.slice(0, 3);
        
        return this.projects
            .filter(project => 
                favoriteCategories.includes(project.category) && 
                !project.isFavorite &&
                project.status === 'active'
            )
            .slice(0, 3);
    }

    getTrendingProjects() {
        return this.projects
            .filter(p => p.donors > 10)
            .sort((a, b) => b.donors - a.donors)
            .slice(0, 3);
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

        const total = this.projects.length;
        
        return Object.entries(categories).map(([category, count]) => `
            <div class="chart-item">
                <div class="chart-label">
                    <span>${this.getCategoryIcon(category)} ${category}</span>
                    <span>${count}</span>
                </div>
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="width: ${(count / total) * 100}%"></div>
                </div>
            </div>
        `).join('');
    }

    // 🎪 UI ФУНКЦИИ
    showModal(content) {
        const modalBody = document.getElementById('modalBody');
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalBody && modalOverlay) {
            modalBody.innerHTML = content;
            modalOverlay.style.display = 'flex';
        }
    }

    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showRatingModal(projectId) {
        this.showModal(`
            <h3>⭐ Оцените проект</h3>
            <p>Как вам этот проект?</p>
            <div class="rating-large" style="font-size: 2rem; text-align: center; margin: 1.5rem 0; display: flex; justify-content: center; gap: 0.5rem;">
                ${[1,2,3,4,5].map(star => `
                    <span onclick="app.rateProject('${projectId}', ${star})" 
                          class="star hover-lift" 
                          style="cursor: pointer; transition: transform 0.2s;"
                          onmouseover="this.style.transform='scale(1.2)'"
                          onmouseout="this.style.transform='scale(1)'">
                        ☆
                    </span>
                `).join('')}
            </div>
        `);
    }

    showAuthModal() {
        this.showModal(`
            <h3>🔐 Вход в систему</h3>
            <div class="auth-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="text" id="authName" placeholder="Ваше имя" value="${this.currentUser?.name || ''}">
                <input type="email" id="authEmail" placeholder="Email" value="${this.currentUser?.email || ''}">
                <button onclick="app.handleAuth()" class="btn btn-gradient hover-lift">Войти / Зарегистрироваться</button>
            </div>
        `);
    }

    handleAuth() {
        const name = document.getElementById('authName').value || 'Пользователь';
        const email = document.getElementById('authEmail').value || 'user@example.com';
        
        this.currentUser = { 
            name, 
            email,
            avatar: name.charAt(0).toUpperCase()
        };
        this.saveToStorage();
        this.hideModal();
        this.render();
        
        this.showNotification(`🎉 Добро пожаловать, ${name}!`, 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.render();
        this.showNotification('👋 Вы вышли из системы', 'info');
    }

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-route') === this.currentRoute);
        });

        // Обновляем панель пользователя
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
