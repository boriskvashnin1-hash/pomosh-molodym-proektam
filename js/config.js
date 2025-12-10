// Конфигурация Supabase
const SUPABASE_URL = https://yhqchvmoymbfvumwgwse.supabase.co;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocWNodm1veW1iZnZ1bXdnd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTAyNzksImV4cCI6MjA4MDk2NjI3OX0.QRwyAqHGLPmEKYIp__3iqagewV_FEjoLFWyfy6cgeqo;

// Инициализация Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase инициализирован');
