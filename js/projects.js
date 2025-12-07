// js/projects.js - Расширенное управление проектами

class ProjectsManager {
    constructor() {
        this.projects = [];
        this.categories = [
            { id: 'technology', name: 'Технологии', icon: 'fa-robot' },
            { id: 'science', name: 'Наука', icon: 'fa-flask' },
            { id: 'art', name: 'Искусство', icon: 'fa-palette' },
            { id: 'ecology', name: 'Экология', icon: 'fa-leaf' },
            { id: 'sport', name: 'Спорт', icon: 'fa-running' },
            { id: 'other', name: 'Другое', icon: 'fa-star' }
        ];
        this.init();
    }
    
    async init() {
        await this.loadProjects();
        this.setupEventListeners();
    }
    
    // Загрузка проектов
    async loadProjects() {
        try {
            // Пытаемся загрузить из Supabase
            if (window.db && !window.useLocalStorage) {
                const { data, error } = await window.db
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    this.projects = data;
                    this.saveToLocalStorage();
                    return;
                }
            }
            
            // Если Supabase недоступен, загружаем из localStorage
            this.loadFromLocalStorage();
            
        } catch (error) {
            console.warn('Ошибка загрузки проектов из Supabase:', error);
            this.loadFromLocalStorage();
        }
    }
    
    // Загрузка из localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('helprojects_projects');
        if (saved) {
            this.projects = JSON.parse(saved);
        } else {
            // Создаем примерные проекты для демонстрации
            this.createDemoProjects();
        }
    }
    
    // Сохранение в localStorage
    saveToLocalStorage() {
        localStorage.setItem('helprojects_projects', JSON.stringify(this.projects));
    }
    
    // Создание демо-проектов
    createDemoProjects() {
        this.projects = [
            {
                id: 'project_1',
                title: 'Школьный робот-помощник',
                description: 'Создание программируемого робота для помощи в уборке классов и переноске учебных материалов. Проект включает разработку конструкции, программирование и тестирование.',
                goal: 50000,
                current_amount: 32500,
                author: 'Иван Петров',
                author_email: 'ivan@school157.ru',
                school: 'Школа №157',
                category: 'technology',
                deadline: '2024-12-31',
                status: 'active',
                created_at: '2024-11-15T10:30:00Z',
                image_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'project_2',
                title: 'Школьная газета "Голос"',
                description: 'Запуск ежемесячной школьной газеты с новостями, интервью и творческими работами учащихся. Нужны средства на печать и оборудование для редакции.',
                goal: 25000,
                current_amount: 18000,
                author: 'Мария Сидорова',
                author_email: 'maria@licey23.ru',
                school: 'Лицей №23',
                category: 'art',
                deadline: '2024-12-20',
                status: 'active',
                created_at: '2024-11-10T14:20:00Z',
                image_url: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'project_3',
                title: 'Экологический сад',
                description: 'Создание сада с редкими растениями на территории школы. Проект включает закупку саженцев, создание системы полива и образовательные таблички.',
                goal: 75000,
                current_amount: 45000,
                author: 'Алексей Иванов',
                author_email: 'alex@gym5.ru',
                school: 'Гимназия №5',
                category: 'ecology',
                deadline: '2025-01-15',
                status: 'active',
                created_at: '2024-11-05T09:15:00Z',
                image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'project_4',
                title: 'Спортивная площадка',
                description: 'Оборудование современной спортивной площадки с турниками, брусьями и тренажерами для занятий на свежем воздухе.',
                goal: 120000,
                current_amount: 85000,
                author: 'Дмитрий Кузнецов',
                author_email: 'dima@sport-school.ru',
                school: 'Спортивная школа №12',
                category: 'sport',
                deadline: '2025-03-01',
                status: 'active',
                created_at: '2024-10-28T16:45:00Z',
                image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'project_5',
                title: 'Химическая лаборатория',
                description: 'Оснащение школьной химической лаборатории современным оборудованием для проведения опытов и исследований.',
                goal: 90000,
                current_amount: 62000,
                author: 'Елена Смирнова',
                author_email: 'elena@chem-school.ru',
                school: 'Химический лицей №8',
                category: 'science',
                deadline: '2025-02-28',
                status: 'active',
                created_at: '2024-10-20T11:10:00Z',
                image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            },
            {
                id: 'project_6',
                title: 'Театральная студия',
                description: 'Создание школьной театральной студии с костюмами, декорациями и звуковым оборудованием.',
                goal: 60000,
                current_amount: 42000,
                author: 'Ольга Николаева',
                author_email: 'olga@art-school.ru',
                school: 'Школа искусств №3',
                category: 'art',
                deadline: '2024-12-15',
                status: 'active',
                created_at: '2024-10-15T13:25:00Z',
                image_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            }
        ];
        this.saveToLocalStorage();
    }
    
    // Получение всех проектов
    getAllProjects() {
        return this.projects;
    }
    
    // Получение проекта по ID
    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }
    
    // Получение проектов пользователя
    getUserProjects(userEmail) {
        return this.projects.filter(project => project.author_email === userEmail);
    }
    
    // Получение проектов по категории
    getProjectsByCategory(categoryId) {
        return this.projects.filter(project => project.category === categoryId);
    }
    
    // Поиск проектов
    searchProjects(query) {
        const searchTerm = query.toLowerCase();
        return this.projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.author.toLowerCase().includes(searchTerm) ||
            project.school.toLowerCase().includes(searchTerm)
        );
    }
    
    // Создание проекта
    async createProject(projectData) {
        try {
            const project = {
                id: 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                ...projectData,
                current_amount: 0,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Сохранение в Supabase
            if (window.db && !window.useLocalStorage) {
                const { data, error } = await window.db
                    .from('projects')
                    .insert([project])
                    .select()
                    .single();
                
                if (error) throw error;
                
                if (data) {
                    project.id = data.id;
                }
            }
            
            // Добавление в локальный массив
            this.projects.unshift(project);
            this.saveToLocalStorage();
            
            // Вызываем событие создания проекта
            this.dispatchProjectCreated(project);
            
            return { success: true, project };
            
        } catch (error) {
            console.error('Ошибка создания проекта:', error);
            return { 
                success: false, 
                message: error.message || 'Ошибка при создании проекта' 
            };
        }
    }
    
    // Обновление проекта
    async updateProject(projectId, updates) {
        try {
            const projectIndex = this.projects.findIndex(p => p.id === projectId);
            if (projectIndex === -1) {
                return { success: false, message: 'Проект не найден' };
            }
            
            // Обновляем проект
            this.projects[projectIndex] = {
                ...this.projects[projectIndex],
                ...updates,
                updated_at: new Date().toISOString()
            };
            
            // Обновление в Supabase
            if (window.db && !window.useLocalStorage) {
                const { error } = await window.db
                    .from('projects')
                    .update(updates)
                    .eq('id', projectId);
                
                if (error) throw error;
            }
            
            this.saveToLocalStorage();
            
            // Вызываем событие обновления проекта
            this.dispatchProjectUpdated(this.projects[projectIndex]);
            
            return { success: true, project: this.projects[projectIndex] };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    // Удаление проекта
    async deleteProject(projectId) {
        try {
            const projectIndex = this.projects.findIndex(p => p.id === projectId);
            if (projectIndex === -1) {
                return { success: false, message: 'Проект не найден' };
            }
            
            const deletedProject = this.projects[projectIndex];
            
            // Удаление из Supabase
            if (window.db && !window.useLocalStorage) {
                const { error } = await window.db
                    .from('projects')
                    .delete()
                    .eq('id', projectId);
                
                if (error) throw error;
            }
            
            // Удаление из локального массива
            this.projects.splice(projectIndex, 1);
            this.saveToLocalStorage();
            
            // Вызываем событие удаления проекта
            this.dispatchProjectDeleted(deletedProject);
            
            return { success: true, message: 'Проект удален' };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    // Поддержка проекта
    async supportProject(projectId, amount, supporterData = {}) {
        try {
            const projectIndex = this.projects.findIndex(p => p.id === projectId);
            if (projectIndex === -1) {
                return { success: false, message: 'Проект не найден' };
            }
            
            if (amount <= 0) {
                return { success: false, message: 'Сумма должна быть больше 0' };
            }
            
            const project = this.projects[projectIndex];
            const newAmount = (parseFloat(project.current_amount) || 0) + parseFloat(amount);
            
            // Обновляем сумму
            this.projects[projectIndex].current_amount = newAmount;
            
            // Проверяем, достигнута ли цель
            if (newAmount >= project.goal) {
                this.projects[projectIndex].status = 'completed';
            }
            
            // Обновление в Supabase
            if (window.db && !window.useLocalStorage) {
                const updates = {
                    current_amount: newAmount,
                    status: this.projects[projectIndex].status
                };
                
                const { error } = await window.db
                    .from('projects')
                    .update(updates)
                    .eq('id', projectId);
                
                if (error) throw error;
            }
            
            this.saveToLocalStorage();
            
            // Сохраняем информацию о поддержке
            this.saveSupport(projectId, amount, supporterData);
            
            // Вызываем событие поддержки проекта
            this.dispatchProjectSupported(projectId, amount, supporterData);
            
            return { 
                success: true, 
                message: `Спасибо за поддержку! Собрано: ${newAmount} ₽ из ${project.goal} ₽`,
                project: this.projects[projectIndex]
            };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    // Сохранение информации о поддержке
    saveSupport(projectId, amount, supporterData) {
        const supports = JSON.parse(localStorage.getItem('helprojects_supports') || '[]');
        
        const supportRecord = {
            id: 'support_' + Date.now(),
            projectId,
            amount,
            ...supporterData,
            date: new Date().toISOString(),
            supporter_email: window.auth?.getUser()?.email || 'anonymous'
        };
        
        supports.push(supportRecord);
        localStorage.setItem('helprojects_supports', JSON.stringify(supports));
    }
    
    // Получение поддержек проекта
    getProjectSupports(projectId) {
        const supports = JSON.parse(localStorage.getItem('helprojects_supports') || '[]');
        return supports.filter(support => support.projectId === projectId);
    }
    
    // Получение статистики
    getStatistics() {
        const totalProjects = this.projects.length;
        const totalGoal = this.projects.reduce((sum, p) => sum + parseFloat(p.goal), 0);
        const totalCollected = this.projects.reduce((sum, p) => sum + (parseFloat(p.current_amount) || 0), 0);
        const activeProjects = this.projects.filter(p => p.status === 'active').length;
        const completedProjects = this.projects.filter(p => p.status === 'completed').length;
        
        // Статистика по категориям
        const categoryStats = {};
        this.categories.forEach(category => {
            const categoryProjects = this.getProjectsByCategory(category.id);
            categoryStats[category.id] = {
                name: category.name,
                count: categoryProjects.length,
                collected: categoryProjects.reduce((sum, p) => sum + (parseFloat(p.current_amount) || 0), 0),
                goal: categoryProjects.reduce((sum, p) => sum + parseFloat(p.goal), 0)
            };
        });
        
        return {
            totalProjects,
            totalGoal,
            totalCollected,
            activeProjects,
            completedProjects,
            completionPercentage: totalGoal > 0 ? (totalCollected / totalGoal * 100) : 0,
            categoryStats
        };
    }
    
    // Инициализация слушателей событий
    setupEventListeners() {
        // Создаем кастомные события
        window.addEventListener('project-created', (event) => {
            console.log('Проект создан:', event.detail.project);
        });
        
        window.addEventListener('project-updated', (event) => {
            console.log('Проект обновлен:', event.detail.project);
        });
        
        window.addEventListener('project-deleted', (event) => {
            console.log('Проект удален:', event.detail.project);
        });
        
        window.addEventListener('project-supported', (event) => {
            console.log('Проект поддержан:', event.detail);
        });
    }
    
    // Диспетчеризация событий
    dispatchProjectCreated(project) {
        window.dispatchEvent(new CustomEvent('project-created', {
            detail: { project }
        }));
    }
    
    dispatchProjectUpdated(project) {
        window.dispatchEvent(new CustomEvent('project-updated', {
            detail: { project }
        }));
    }
    
    dispatchProjectDeleted(project) {
        window.dispatchEvent(new CustomEvent('project-deleted', {
            detail: { project }
        }));
    }
    
    dispatchProjectSupported(projectId, amount, supporterData) {
        window.dispatchEvent(new CustomEvent('project-supported', {
            detail: { projectId, amount, supporterData }
        }));
    }
    
    // Вспомогательные методы
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Другое';
    }
    
    getCategoryIcon(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.icon : 'fa-star';
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    getDaysLeft(deadline) {
        if (!deadline) return Infinity;
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diff = deadlineDate.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    getProgressPercentage(project) {
        if (!project.goal) return 0;
        return Math.min((project.current_amount / project.goal) * 100, 100);
    }
    
    // Обновление проекта (публичный метод)
    async updateProjectStatus(projectId, status) {
        return this.updateProject(projectId, { status });
    }
    
    // Добавление комментария к проекту
    async addComment(projectId, commentData) {
        try {
            const comments = JSON.parse(localStorage.getItem('helprojects_comments') || '{}');
            
            if (!comments[projectId]) {
                comments[projectId] = [];
            }
            
            const comment = {
                id: 'comment_' + Date.now(),
                projectId,
                ...commentData,
                created_at: new Date().toISOString()
            };
            
            comments[projectId].push(comment);
            localStorage.setItem('helprojects_comments', JSON.stringify(comments));
            
            return { success: true, comment };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    // Получение комментариев проекта
    getProjectComments(projectId) {
        const comments = JSON.parse(localStorage.getItem('helprojects_comments') || '{}');
        return comments[projectId] || [];
    }
}

// Создаем глобальный экземпляр
window.projectsManager = new ProjectsManager();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
}
