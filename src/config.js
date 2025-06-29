// ========== CONFIGURAÇÃO OPINAFLIX ==========
window.CONFIG = {
    // SEMPRE usar o backend do Vercel (sem fallback que causa problemas)
    API_URL: 'https://opinaflix-backend-m6043c3jv-joao-augustos-projects-4cd91631.vercel.app',
    TMDB_API_KEY: '25aa122e262151673e05f311eaeb56ba',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3'
};

// ========== TMDB UTILITIES ==========
window.CONFIG.getTMDBImageUrl = (path, size = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=Sem+Poster';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

window.CONFIG.getTMDBUrl = (endpoint) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${window.CONFIG.TMDB_BASE_URL}${endpoint}${separator}api_key=${window.CONFIG.TMDB_API_KEY}&language=pt-BR`;
};

// ========== TESTE BACKEND SEM FALLBACK ==========
async function testarBackend() {
    try {
        console.log('🚀 Testando Backend...');
        
        const response = await fetch(window.CONFIG.API_URL + '/health');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Backend funcionando:', data);
        
        // Indicador visual
        const successDiv = document.createElement('div');
        successDiv.style.cssText = 'position:fixed; top:50px; right:10px; background:green; color:white; padding:8px; z-index:9999; border-radius:4px; font-size:11px;';
        successDiv.innerHTML = '✅ Backend OK';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao testar Backend:', error);
        
        // Indicador visual de erro
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed; top:50px; right:10px; background:red; color:white; padding:8px; z-index:9999; border-radius:4px; font-size:11px;';
        errorDiv.innerHTML = '❌ Backend Error';
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
        
        return false;
    }
}

// ========== TESTE TMDB ==========
async function testarTMDB() {
    try {
        console.log('🎬 Testando TMDB...');
        
        const url = window.CONFIG.getTMDBUrl('/movie/popular');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            console.log('✅ TMDB funcionando! Filmes encontrados:', data.results.length);
            
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'position:fixed; top:10px; right:10px; background:green; color:white; padding:8px; z-index:9999; border-radius:4px; font-size:11px;';
            successDiv.innerHTML = `✅ TMDB OK: ${data.results.length} filmes`;
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);
            
            return data;
        } else {
            throw new Error('TMDB retornou dados vazios');
        }
    } catch (error) {
        console.error('❌ Erro ao testar TMDB:', error);
        return null;
    }
}

// ========== EXECUTAR TESTES ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CONFIG.js carregado!');
    console.log('🔗 Backend URL:', window.CONFIG.API_URL);
    
    // Aguardar um pouco para executar testes
    setTimeout(() => {
        testarBackend();
        testarTMDB();
    }, 500);
});

console.log('🚀 CONFIG.js inicializado!');