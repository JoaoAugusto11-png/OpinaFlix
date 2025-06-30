// Função utilitária para carregar dados do usuário com segurança
function carregarUsuario() {
    let usuario = null;
    try {
        const userData = localStorage.getItem('usuario');
        if (userData && userData !== 'undefined') {
            usuario = JSON.parse(userData);
        }
    } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
        // Limpa dados corrompidos
        localStorage.removeItem('usuario');
    }
    return usuario;
}

// Função para salvar dados do usuário com segurança
function salvarUsuario(dadosUsuario) {
    try {
        localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
        return true;
    } catch (e) {
        console.error('Erro ao salvar dados do usuário:', e);
        return false;
    }
}

// Função para fazer logout completo
function logout() {
    localStorage.removeItem('usuario');
    // Limpa também outros dados relacionados se existirem
    localStorage.removeItem('filtros');
    localStorage.removeItem('preferencias');
    window.location.href = 'login.html';
}

// Função para limpar completamente o localStorage em caso de problemas
function limparDadosAplicacao() {
    localStorage.clear();
    window.location.href = 'login.html';
}
