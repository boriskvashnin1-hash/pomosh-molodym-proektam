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
            // Демо-проекты С РЕАЛЬНЫМИ ССЫЛКАМИ НА ИЗОБРАЖЕНИЯ
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
    
    // ... остальные методы остаются такими же ...
    
    // ОБНОВЛЕННЫЙ МЕТОД: Генерация HTML для карточки проекта
    generateProjectCardHTML(project) {
        // Используем URL Unsplash для демо или fallback
        const defaultImage = 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&fit=crop';
        const imageUrl = project.image_url || defaultImage;
        
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
                            <div class="progress" style="width: ${Math.min(100, (project.current_amount / project.goal) * 100)}%"></div>
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
}

// ... остальной код ...
