// js/database.js - Работа с данными проектов

// js/database.js (упрощенная версия)
class Database {
    constructor() {
        this.init();
    }
    
    async init() {
        console.log('Database initialized');
    }
    
    // Просто используем projectsManager
    getAllProjects() {
        return window.projectsManager.getAllProjects();
    }
    
    getProjectById(id) {
        return window.projectsManager.getProjectById(id);
    }
    
    async createProject(projectData) {
        return window.projectsManager.createProject(projectData);
    }
    
    async supportProject(projectId, amount) {
        return window.projectsManager.supportProject(projectId, amount);
    }
    
    async deleteProject(projectId) {
        return window.projectsManager.deleteProject(projectId);
    }
}

// Создаем глобальный экземпляр
window.projectDB = new Database();
    
    // Загрузка проектов
    async loadProjects() {
        try {
            if (window.db && !window.useLocalStorage) {
                // Загрузка из Supabase
                const { data, error } = await window.db
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error) {
                    this.projects = data || [];
                } else {
                    throw error;
                }
            } else {
                // Загрузка из localStorage
                this.loadLocalProjects();
            }
        } catch (error) {
            console.warn('Ошибка загрузки проектов:', error);
            this.loadLocalProjects();
        }
    }
    
    // Загрузка локальных проектов
    loadLocalProjects() {
        const saved = localStorage.getItem('helprojects_projects');
        if (saved) {
            this.projects = JSON.parse(saved);
        } else {
            // Примерные проекты для демонстрации
            this.projects = [
                {
                    id: '1',
                    title: 'Школьный робот-помощник',
                    description: 'Создание робота для помощи в уборке классов',
                    goal: 50000,
                    current_amount: 32500,
                    author: 'Иван Петров',
                    school: 'Школа №157',
                    category: 'Технологии',
                    deadline: '2024-12-31',
                    status: 'active',
                    created_at: '2024-11-15'
                },
                {
                    id: '2',
                    title: 'Школьная газета "Голос"',
                    description: 'Запуск ежемесячной школьной газеты',
                    goal: 25000,
                    current_amount: 18000,
                    author: 'Мария Сидорова',
                    school: 'Лицей №23',
                    category: 'Медиа',
                    deadline: '2024-12-20',
                    status: 'active',
                    created_at: '2024-11-10'
                },
                {
                    id: '3',
                    title: 'Экологический сад',
                    description: 'Создание сада с редкими растениями на территории школы',
                    goal: 75000,
                    current_amount: 45000,
                    author: 'Алексей Иванов',
                    school: 'Гимназия №5',
                    category: 'Экология',
                    deadline: '2025-01-15',
                    status: 'active',
                    created_at: '2024-11-05'
                }
            ];
            this.saveLocalProjects();
        }
    }
    
    // Сохранение проектов локально
    saveLocalProjects() {
        localStorage.setItem('helprojects_projects', JSON.stringify(this.projects));
    }
    
    // Получение всех проектов
    getAllProjects() {
        return this.projects;
    }
    
    // Получение проектов по категории
    getProjectsByCategory(category) {
        return this.projects.filter(project => project.category === category);
    }
    
    // Получение проекта по ID
    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }
    
    // Создание проекта
    async createProject(projectData) {
        try {
            const project = {
                id: 'project_' + Date.now(),
                ...projectData,
                current_amount: 0,
                status: 'active',
                created_at: new Date().toISOString(),
                author_id: window.auth.getUser()?.id,
                author_email: window.auth.getUser()?.email
            };
            
            // Сохранение в Supabase
            if (window.db && !window.useLocalStorage) {
                const { data, error } = await window.db
                    .from('projects')
                    .insert([project])
                    .select()
                    .single();
                
                if (error) throw error;
                
                project.id = data.id;
            }
            
            // Добавление в локальный массив
            this.projects.unshift(project);
            this.saveLocalProjects();
            
            return { success: true, project };
            
        } catch (error) {
            console.error('Ошибка создания проекта:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Поддержка проекта
    async supportProject(projectId, amount) {
        try {
            const project = this.getProjectById(projectId);
            if (!project) {
                return { success: false, message: 'Проект не найден' };
            }
            
            if (amount <= 0) {
                return { success: false, message: 'Сумма должна быть больше 0' };
            }
            
            // Обновление суммы
            project.current_amount = (parseFloat(project.current_amount) || 0) + parseFloat(amount);
            
            // Обновление в Supabase
            if (window.db && !window.useLocalStorage) {
                const { error } = await window.db
                    .from('projects')
                    .update({ current_amount: project.current_amount })
                    .eq('id', projectId);
                
                if (error) throw error;
            }
            
            // Сохранение локально
            this.saveLocalProjects();
            
            return { 
                success: true, 
                message: `Спасибо за поддержку! Собрано: ${project.current_amount} ₽ из ${project.goal} ₽`,
                project 
            };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    // Удаление проекта
    async deleteProject(projectId) {
        try {
            const index = this.projects.findIndex(p => p.id === projectId);
            if (index === -1) {
                return { success: false, message: 'Проект не найден' };
            }
            
            // Удаление из Supabase
            if (window.db && !window.useLocalStorage) {
                const { error } = await window.db
                    .from('projects')
                    .delete()
                    .eq('id', projectId);
                
                if (error) throw error;
            }
            
            // Удаление из локального массива
            this.projects.splice(index, 1);
            this.saveLocalProjects();
            
            return { success: true, message: 'Проект удален' };
            
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Создаем глобальный экземпляр
window.projectDB = new ProjectDatabase();
