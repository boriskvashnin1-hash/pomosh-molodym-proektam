console.log('📁 Projects manager loading...');

class ProjectsManager {
    constructor() {
        this.projects = [];
        this.loadProjects();
    }
    
    loadProjects() {
        const saved = localStorage.getItem('helprojects_projects');
        if (saved) {
            this.projects = JSON.parse(saved);
        } else {
            // Демо-проекты с реальными изображениями
            this.projects = [
                {
                    id: '1',
                    title: 'Школьный робот',
                    description: 'Создание программируемого робота для участия в городских соревнованиях по робототехнике',
                    short_description: 'Робот для школьных соревнований',
                    goal: 50000,
                    current_amount: 25000,
                    author: 'Иван Петров',
                    category: 'technology',
                    status: 'active',
                    image_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&fit=crop',
                    created_at: '2025-01-15'
                },
                {
                    id: '2',
                    title: 'Школьная газета',
                    description: 'Запуск регулярной школьной газеты с современным дизайном и интересными рубриками',
                    short_description: 'Школьная газета "Голос поколения"',
                    goal: 20000,
                    current_amount: 15000,
                    author: 'Мария Сидорова',
                    category: 'art',
                    status: 'active',
                    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop',
                    created_at: '2025-01-20'
                },
                {
                    id: '3',
                    title: 'Эко-сад на школьном дворе',
                    description: 'Создание экологического сада с редкими растениями и учебной зоной для биологии',
                    short_description: 'Экологический проект',
                    goal: 50000,
                    current_amount: 22500,
                    author: 'Алексей Иванов',
                    category: 'ecology',
                    status: 'active',
                    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&fit=crop',
                    created_at: '2025-02-01'
                }
            ];
            this.saveProjects();
        }
        console.log('✅ Загружено проектов:', this.projects.length);
    }
    
    saveProjects() {
        localStorage.setItem('helprojects_projects', JSON.stringify(this.projects));
    }
    
    getAllProjects() {
        return this.projects;
    }
    
    getFeaturedProjects(limit = 3) {
        return this.projects.slice(0, limit);
    }
    
    getProjectById(id) {
        return this.projects.find(p => p.id === id);
    }
    
    createProject(projectData) {
        const project = {
            id: 'project_' + Date.now(),
            ...projectData,
            current_amount: 0,
            status: 'active',
            created_at: new Date().toISOString(),
            image_url: projectData.image_url || 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&fit=crop'
        };
        
        this.projects.push(project);
        this.saveProjects();
        
        return { success: true, project };
    }
    
    supportProject(projectId, amount) {
        const project = this.getProjectById(projectId);
        if (!project) {
            return { success: false, message: 'Проект не найден' };
        }
        
        project.current_amount += parseFloat(amount);
        this.saveProjects();
        
        return { success: true, project };
    }
    
    generateProjectCardHTML(project) {
        const defaultImage = 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&fit=crop';
        const imageUrl = project.image_url || defaultImage;
        const progress = project.goal > 0 
            ? Math.min(100, (project.current_amount / project.goal) * 100) 
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
                    <p>${project.short_description || (project.description ? project.description.substring(0, 100) + '...' : 'Описание проекта')}</p>
                    <div class="project-stats">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progress}%"></div>
                        </div>
                        <div class="stats">
                            <span><i class="fas fa-ruble-sign"></i> ${project.current_amount.toLocaleString()} собрано</span>
                            <span><i class="fas fa-bullseye"></i> ${project.goal.toLocaleString()} цель</span>
                        </div>
                    </div>
                    <a href="pages/project-details.html?id=${project.id}" class="btn btn-small">Поддержать</a>
                </div>
            </div>
        `;
    }
    
    displayProjects(containerId, projects = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const projectsToDisplay = projects || this.projects;
        
        if (projectsToDisplay.length === 0) {
            container.innerHTML = '<div class="no-projects">Пока нет проектов. Будьте первым!</div>';
            return;
        }
        
        container.innerHTML = projectsToDisplay.map(project => 
            this.generateProjectCardHTML(project)
        ).join('');
    }
}

window.projectsManager = new ProjectsManager();
console.log('✅ Projects manager ready');

function getFeaturedProjects() {
    return window.projectsManager.getFeaturedProjects();
}

function displayFeaturedProjects() {
    const featuredProjects = window.projectsManager.getFeaturedProjects(3);
    window.projectsManager.displayProjects('featured-projects', featuredProjects);
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('featured-projects')) {
        displayFeaturedProjects();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
    // ДОБАВЬТЕ ЭТО В КОНЕЦ ФАЙЛА projects.js:

// Проверка и исправление демо-данных
function fixDemoImages() {
    const projects = window.projectsManager.projects;
    const demoImages = [
        'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop',
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&fit=crop'
    ];
    
    let updated = false;
    projects.forEach((project, index) => {
        if (!project.image_url) {
            project.image_url = demoImages[index % demoImages.length];
            updated = true;
        }
    });
    
    if (updated) {
        window.projectsManager.saveProjects();
        console.log('✅ Исправлены изображения проектов');
    }
}

// Вызываем после загрузки
setTimeout(fixDemoImages, 1000);

// И принудительно перерисовываем проекты
setTimeout(() => {
    if (document.getElementById('featured-projects')) {
        window.projectsManager.displayProjects('featured-projects', 
            window.projectsManager.getFeaturedProjects(3));
    }
}, 1500);
}
