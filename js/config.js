
const SUPABASE_CONFIG = {
    url: https://njccbuhncnjudlgszcfd.supabase.co,
    anonKey: https://njccbuhncnjudlgszcfd.supabase.co    
};

// Инициализация Supabase
let supabaseClient = null;

function initSupabase() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.warn('⚠️ Ключи Supabase не настроены. Используется localStorage.');
        window.useLocalStorage = true;
        return;
    }
    
    try {
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        // Проверяем подключение
        testConnection();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Supabase:', error);
        window.useLocalStorage = true;
    }
}

async function testConnection() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) throw error;
        
        console.log('✅ Supabase подключен успешно');
        window.useLocalStorage = false;
        window.db = supabaseClient;
        
    } catch (error) {
        console.warn('⚠️ Не удалось подключиться к Supabase:', error.message);
        window.useLocalStorage = true;
    }
}

// Инициализируем при загрузке
document.addEventListener('DOMContentLoaded', initSupabase);

// Экспорт для использования в других файлах
if (typeof module !== 'undefined') {
    module.exports = { SUPABASE_CONFIG, initSupabase };
}
