
console.log('🗄️ Database loading...');

class Database {
    constructor() {
        console.log('✅ Database created');
    }
    
    getAllProjects() {
        return window.projectsManager.getAllProjects();
    }
    
    getProjectById(id) {
        return window.projectsManager.getProjectById(id);
    }
    
    createProject(projectData) {
        return window.projectsManager.createProject(projectData);
    }
    
    supportProject(projectId, amount) {
        return window.projectsManager.supportProject(projectId, amount);
    }
    
    async getUsers() {
        return JSON.parse(localStorage.getItem('helprojects_users') || '[]');
    }
}

window.projectDB = new Database();
console.log('✅ Database ready');
