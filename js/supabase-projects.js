// js/supabase-projects.js
console.log('📁 Supabase Projects manager loading...');

class SupabaseProjectsManager {
    constructor() {
        if (!window.supabase) {
            console.error('Supabase не инициализирован');
            return;
        }
        this.supabase = window.supabase;
    }
    
    // Получить избранные проекты
    async getFeaturedProjects(limit = 3) {
        try {
            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(limit);
                
            if (error) throw error;
            
            console.log('✅ Загружено проектов из Supabase:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка загрузки проектов:', error);
            return [];
        }
    }
    
    // Получить все проекты
    async getAllProjects() {
        try {
            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка загрузки проектов:', error);
            return [];
        }
    }
    
    // Получить проект по ID
    async getProjectById(id) {
        try {
            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Ошибка загрузки проекта:', error);
            return null;
        }
    }
    
    // Создать проект
    async createProject(projectData) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('Пользователь не авторизован');
            
            const project = {
                ...projectData,
                creator_id: user.id,
                current_amount: 0,
                status: 'active',
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('projects')
                .insert([project])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, project: data };
        } catch (error) {
            console.error('❌ Ошибка создания проекта:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Поддержать проект
    async supportProject(projectId, amount) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            
            const donation = {
                project_id: projectId,
                user_id: user?.id || null,
                amount: parseFloat(amount),
                created_at: new Date().toISOString()
            };
            
            // Добавляем пожертвование
            const { error: donationError } = await this.supabase
                .from('donations')
                .insert([donation]);
                
            if (donationError) throw donationError;
            
            // Обновляем сумму в проекте
            const { error: updateError } = await this.supabase.rpc('increment_project_amount', {
                project_id: projectId,
                amount: parseFloat(amount)
            });
            
            if (updateError) throw updateError;
            
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка поддержки проекта:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Генерация HTML для карточки проекта
    generateProjectCardHTML(project) {
        // Используем реальное изображение или демо
        const defaultImage = 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&fit=crop';
        const imageUrl = project.image_url || defaultImage;
        const progress = project.goal_amount > 0 
            ? Math.min(100, (project.current_amount / project.goal_amount) * 100) 
            : 0;
        
        return `
            <div class="project-card">
                <div class="project-image">
                    <img src="${imageUrl}" 
                         alt="${project.title}" 
                         onerror="this.src='${defaultImage}'">
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.short_description || (project.description ? project.description.substring(0, 100) + '...' : '')}</p>
                    <div class="project-stats">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progress}%"></div>
                        </div>
                        <div class="stats">
                            <span><i class="fas fa-ruble-sign"></i> ${project.current_amount?.toLocaleString() || 0} собрано</span>
                            <span><i class="fas fa-bullseye"></i> ${project.goal_amount?.toLocaleString() || 0} цель</span>
                        </div>
                    </div>
                    <a href="pages/project-details.html?id=${project.id}" class="btn btn-small">Поддержать</a>
                </div>
            </div>
        `;
    }
    
    // Отображение проектов в контейнере
    async displayProjects(containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Контейнер #${containerId} не найден`);
            return;
        }
        
        container.innerHTML = '<div class="loading">Загрузка проектов...</div>';
        
        try {
            const projects = limit 
                ? await this.getFeaturedProjects(limit)
                : await this.getAllProjects();
            
            if (projects.length === 0) {
                container.innerHTML = '<div class="no-projects">Пока нет проектов. Будьте первым!</div>';
                return;
            }
            
            container.innerHTML = projects.map(project => 
                this.generateProjectCardHTML(project)
            ).join('');
        } catch (error) {
            container.innerHTML = '<div class="error">Ошибка загрузки проектов</div>';
        }
    }
}

// Создаем глобально
window.supabaseProjects = new SupabaseProjectsManager();
console.log('✅ Supabase Projects manager ready');

// Для обратной совместимости
async function getFeaturedProjects() {
    return await window.supabaseProjects.getFeaturedProjects(3);
}

// Автоматически показываем проекты при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('featured-projects')) {
        window.supabaseProjects.displayProjects('featured-projects', 3);
    }
});
