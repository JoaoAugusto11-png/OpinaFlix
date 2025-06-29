// ========== CONFIGURAÇÃO OPINAFLIX ==========
window.CONFIG = {
    // Detectar ambiente automaticamente
    API_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3001'  // Desenvolvimento local
        : 'https://opinaflix-backend-m6043c3jv-joao-augustos-projects-4cd91631.vercel.app', // Produção
    
    TMDB_API_KEY: '6c5b5ca8f4fb458ad07b02c6162f0b42'
};

// ========== DEBUG E TESTES ==========
console.log('🔧 Ambiente detectado:', window.location.hostname);
console.log('🔧 Backend URL:', window.CONFIG.API_URL);

// Teste de conexão com o backend
async function testarBackend() {
    try {
        // Testar rota principal
        const response = await fetch(window.CONFIG.API_URL);
        const data = await response.json();
        console.log('✅ Backend principal:', data);
        
        // Testar health check
        const healthResponse = await fetch(window.CONFIG.API_URL + '/health');
        const healthData = await healthResponse.json();
        console.log('✅ Backend health:', healthData);
        
        return true;
    } catch (error) {
        console.error('❌ Erro de conexão com backend:', error);
        
        // Fallback para ambiente local se estiver em produção
        if (!window.location.hostname.includes('localhost')) {
            console.warn('⚠️ Tentando fallback local...');
            window.CONFIG.API_URL = 'http://localhost:3001';
        }
        
        return false;
    }
}

// Executar teste na inicialização
testarBackend();

// ========== UTILITIES ==========
window.CONFIG.isLocal = () => {
    return window.location.hostname.includes('localhost') || 
           window.location.hostname.includes('127.0.0.1');
};

window.CONFIG.getFullApiUrl = (endpoint) => {
    return window.CONFIG.API_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
};

// ========== TMDB UTILITIES ==========
window.CONFIG.getTMDBImageUrl = (path, size = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=Sem+Poster';
};

window.CONFIG.getTMDBUrl = (type, id) => {
    return `https://api.themoviedb.org/3/${type}/${id}?api_key=${window.CONFIG.TMDB_API_KEY}&language=pt-BR`;
};

console.log('🚀 CONFIG.js carregado com sucesso!');