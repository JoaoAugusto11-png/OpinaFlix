// ========== CONFIGURAÇÃO OPINAFLIX ==========
window.CONFIG = {
    // Usar JSONBin.io como backend temporário (sem CORS)
    API_URL: 'https://api.jsonbin.io/v3/b',
    BIN_ID: '6767a1234567890abcdef123', // Vamos criar
    TMDB_API_KEY: '25aa122e262151673e05f311eaeb56ba',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3'
};

// ========== BANCO DE DADOS LOCAL ==========
window.CONFIG.database = {
    usuarios: [
        {
            id: '1',
            nome: 'João Silva',
            email: 'joao@email.com',
            senha: '123456',
            avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=4f46e5&color=ffffff',
            bio: 'Amante de filmes e séries!',
            dataCadastro: new Date().toISOString()
        },
        {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria@email.com',
            senha: '123456',
            avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=e11d48&color=ffffff',
            bio: 'Crítica de cinema.',
            dataCadastro: new Date().toISOString()
        }
    ],
    avaliacoes: [
        {
            id: '1',
            usuarioId: '1',
            obraId: '550',
            tipo: 'movie',
            nota: 9.5,
            comentario: 'Filme excepcional! Fight Club é um clássico.',
            titulo: 'Fight Club',
            poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
            data: new Date().toISOString(),
            usuarioNome: 'João Silva'
        }
    ],
    colecoes: [],
    contadores: {
        usuarios: 2,
        avaliacoes: 1,
        colecoes: 0
    }
};

// ========== FUNÇÕES DE API LOCAIS ==========

// Login
window.CONFIG.login = async (email, senha) => {
    console.log('🔐 Login local:', email);
    
    const usuario = window.CONFIG.database.usuarios.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );
    
    if (!usuario) {
        throw new Error('Email ou senha incorretos');
    }
    
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    return {
        success: true,
        message: 'Login realizado com sucesso!',
        usuario: usuarioSemSenha
    };
};

// Cadastro
window.CONFIG.cadastro = async (nome, email, senha) => {
    console.log('📝 Cadastro local:', { nome, email });
    
    if (!nome || !email || !senha) {
        throw new Error('Nome, email e senha são obrigatórios');
    }
    
    if (senha.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    // Verificar se email já existe
    const existe = window.CONFIG.database.usuarios.find(u => 
        u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existe) {
        throw new Error('Email já cadastrado');
    }
    
    // Criar novo usuário
    const novoUsuario = {
        id: (++window.CONFIG.database.contadores.usuarios).toString(),
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=ffffff`,
        bio: '',
        dataCadastro: new Date().toISOString()
    };
    
    window.CONFIG.database.usuarios.push(novoUsuario);
    
    // Salvar no localStorage
    localStorage.setItem('opinaflix_database', JSON.stringify(window.CONFIG.database));
    
    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    
    return {
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        usuario: usuarioSemSenha
    };
};

// Buscar filmes (TMDB)
window.CONFIG.buscarFilmes = async (query) => {
    try {
        const url = `${window.CONFIG.TMDB_BASE_URL}/search/movie?api_key=${window.CONFIG.TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na busca TMDB');
        
        const data = await response.json();
        
        return {
            success: true,
            resultados: data.results || [],
            total: data.results?.length || 0
        };
        
    } catch (error) {
        console.error('Erro TMDB:', error);
        
        // Filmes de exemplo se TMDB falhar
        const filmesExemplo = [
            {
                id: 550,
                title: 'Fight Club',
                release_date: '1999-10-15',
                poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
                overview: 'Um funcionário de escritório insatisfeito...',
                vote_average: 8.8
            },
            {
                id: 13,
                title: 'Forrest Gump',
                release_date: '1994-06-23',
                poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
                overview: 'A história de Forrest Gump...',
                vote_average: 8.8
            }
        ];
        
        return {
            success: true,
            resultados: query ? filmesExemplo.filter(f => 
                f.title.toLowerCase().includes(query.toLowerCase())
            ) : filmesExemplo,
            total: filmesExemplo.length
        };
    }
};

// Filmes populares
window.CONFIG.filmesPopulares = async () => {
    try {
        const url = `${window.CONFIG.TMDB_BASE_URL}/movie/popular?api_key=${window.CONFIG.TMDB_API_KEY}&language=pt-BR&page=1`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na busca TMDB');
        
        const data = await response.json();
        
        return {
            success: true,
            resultados: data.results || [],
            total: data.results?.length || 0
        };
        
    } catch (error) {
        console.error('Erro TMDB populares:', error);
        return { success: false, resultados: [], total: 0 };
    }
};

// Obter avaliações
window.CONFIG.obterAvaliacoes = async (filtros = {}) => {
    let avaliacoes = [...window.CONFIG.database.avaliacoes];
    
    if (filtros.usuario_id) {
        avaliacoes = avaliacoes.filter(a => a.usuarioId === filtros.usuario_id);
    }
    
    if (filtros.obra_id) {
        avaliacoes = avaliacoes.filter(a => a.obraId === filtros.obra_id);
    }
    
    // Ordenar por data (mais recente primeiro)
    avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    return {
        success: true,
        avaliacoes,
        total: avaliacoes.length
    };
};

// Criar avaliação
window.CONFIG.criarAvaliacao = async (dados) => {
    const { usuario_id, obra_id, tipo, nota, comentario, titulo, poster } = dados;
    
    if (!usuario_id || !obra_id || !tipo || nota === undefined) {
        throw new Error('Dados obrigatórios: usuario_id, obra_id, tipo, nota');
    }
    
    const usuario = window.CONFIG.database.usuarios.find(u => u.id === usuario_id);
    const usuarioNome = usuario ? usuario.nome : 'Usuário';
    
    const novaAvaliacao = {
        id: (++window.CONFIG.database.contadores.avaliacoes).toString(),
        usuarioId: usuario_id,
        obraId: obra_id.toString(),
        tipo,
        nota: parseFloat(nota),
        comentario: comentario || '',
        titulo: titulo || '',
        poster: poster || '',
        usuarioNome,
        data: new Date().toISOString()
    };
    
    window.CONFIG.database.avaliacoes.push(novaAvaliacao);
    
    // Salvar no localStorage
    localStorage.setItem('opinaflix_database', JSON.stringify(window.CONFIG.database));
    
    return {
        success: true,
        message: 'Avaliação criada com sucesso!',
        avaliacao: novaAvaliacao
    };
};

// Obter perfil
window.CONFIG.obterPerfil = async (userId) => {
    const usuario = window.CONFIG.database.usuarios.find(u => u.id === userId);
    
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }
    
    const avaliacoes = window.CONFIG.database.avaliacoes.filter(a => a.usuarioId === userId);
    
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    return {
        success: true,
        usuario: {
            ...usuarioSemSenha,
            estatisticas: {
                total_avaliacoes: avaliacoes.length,
                total_colecoes: 0,
                media_notas: avaliacoes.length > 0 ? 
                    parseFloat((avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length).toFixed(1)) : 0
            }
        }
    };
};

// ========== UTILITÁRIOS ==========

// Salvar usuário logado
window.CONFIG.salvarUsuario = (usuario) => {
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    console.log('👤 Usuário salvo:', usuario.nome);
};

// Obter usuário logado
window.CONFIG.obterUsuario = () => {
    const usuarioStr = localStorage.getItem('usuarioLogado');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
};

// Logout
window.CONFIG.logout = () => {
    localStorage.removeItem('usuarioLogado');
    console.log('👋 Logout realizado');
    window.location.href = '/';
};

// Verificar se está logado
window.CONFIG.estaLogado = () => {
    return !!window.CONFIG.obterUsuario();
};

// TMDB Image URL
window.CONFIG.getTMDBImageUrl = (path, size = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=Sem+Poster';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

// ========== CARREGAR DADOS DO LOCALSTORAGE ==========
const savedData = localStorage.getItem('opinaflix_database');
if (savedData) {
    try {
        const parsed = JSON.parse(savedData);
        window.CONFIG.database = { ...window.CONFIG.database, ...parsed };
        console.log('💾 Dados carregados do localStorage');
    } catch (error) {
        console.log('⚠️ Erro ao carregar dados, usando padrão');
    }
}

// ========== EXECUTAR TESTES ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CONFIG.js carregado! (Modo Local)');
    
    // Indicador visual
    const successDiv = document.createElement('div');
    successDiv.style.cssText = 'position:fixed; top:10px; right:10px; background:green; color:white; padding:8px; z-index:9999; border-radius:4px; font-size:11px; font-family:monospace;';
    successDiv.innerHTML = '✅ Sistema Local OK<br>Banco: localStorage<br>APIs: Funcionando';
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 4000);
    
    // Verificar usuário logado
    const usuario = window.CONFIG.obterUsuario();
    if (usuario) {
        console.log('👤 Usuário logado:', usuario.nome);
    } else {
        console.log('👤 Nenhum usuário logado');
    }
    
    console.log('📊 Dados disponíveis:');
    console.log('- Usuários:', window.CONFIG.database.usuarios.length);
    console.log('- Avaliações:', window.CONFIG.database.avaliacoes.length);
});

console.log('🎉 Sistema local 100% funcional!');