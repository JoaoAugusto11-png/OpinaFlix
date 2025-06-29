// ========== CONFIGURAÇÃO OPINAFLIX ==========
window.CONFIG = {
    // Detectar ambiente automaticamente
    API_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3001'  // Desenvolvimento local
        : 'https://opinaflix-backend-m6043c3jv-joao-augustos-projects-4cd91631.vercel.app', // Produção
    
    TMDB_API_KEY: '25aa122e262151673e05f311eaeb56ba', // ← SUA API KEY CORRETA
    TMDB_BASE_URL: 'https://api.themoviedb.org/3'
};

// ========== DEBUG E TESTES ==========
console.log('🔧 Ambiente detectado:', window.location.hostname);
console.log('🔧 Backend URL:', window.CONFIG.API_URL);
console.log('🔑 TMDB API Key:', window.CONFIG.TMDB_API_KEY);

// ========== TMDB UTILITIES ==========
window.CONFIG.getTMDBImageUrl = (path, size = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=Sem+Poster';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

window.CONFIG.getTMDBUrl = (endpoint) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${window.CONFIG.TMDB_BASE_URL}${endpoint}${separator}api_key=${window.CONFIG.TMDB_API_KEY}&language=pt-BR`;
};

// ========== TESTE TMDB ==========
async function testarTMDB() {
    try {
        console.log('🎬 Testando TMDB com nova API key...');
        
        const url = window.CONFIG.getTMDBUrl('/movie/popular');
        console.log('📡 URL TMDB:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            console.log('✅ TMDB funcionando! Filmes encontrados:', data.results.length);
            console.log('🎬 Primeiro filme:', data.results[0].title);
            
            // Mostrar indicador visual de sucesso
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'position:fixed; top:10px; right:10px; background:green; color:white; padding:10px; z-index:9999; border-radius:5px; font-size:12px;';
            successDiv.innerHTML = `✅ TMDB OK: ${data.results.length} filmes carregados`;
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);
            
            return data;
        } else {
            throw new Error('TMDB retornou dados vazios');
        }
    } catch (error) {
        console.error('❌ Erro ao testar TMDB:', error);
        
        // Mostrar erro visual
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed; top:10px; right:10px; background:red; color:white; padding:10px; z-index:9999; border-radius:5px; font-size:12px;';
        errorDiv.innerHTML = `❌ ERRO TMDB: ${error.message}`;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
        
        return null;
    }
}

// ========== TESTE BACKEND ==========
async function testarBackend() {
    try {
        console.log('🚀 Testando Backend...');
        
        const response = await fetch(window.CONFIG.API_URL + '/health');
        const data = await response.json();
        
        console.log('✅ Backend funcionando:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao testar Backend:', error);
        
        // Fallback para ambiente local se estiver em produção
        if (!window.location.hostname.includes('localhost')) {
            console.warn('⚠️ Tentando fallback local...');
            window.CONFIG.API_URL = 'http://localhost:3001';
        }
        
        return false;
    }
}

// ========== UTILITIES ==========
window.CONFIG.isLocal = () => {
    return window.location.hostname.includes('localhost') || 
           window.location.hostname.includes('127.0.0.1');
};

window.CONFIG.getFullApiUrl = (endpoint) => {
    return window.CONFIG.API_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
};

// ========== EXECUTAR TESTES ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CONFIG.js carregado!');
    
    // Executar testes
    testarBackend();
    testarTMDB();
});

console.log('🚀 CONFIG.js inicializado com nova API key!');