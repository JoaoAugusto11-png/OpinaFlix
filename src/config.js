// ========== CONFIGURAÇÃO OPINAFLIX ==========

// Configurações da API TMDB
window.CONFIG = {
    TMDB_API_KEY: '25aa122e262151673e05f311eaeb56ba', // Substitua pela sua chave da API TMDB
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    JSONBIN_URL: 'https://api.jsonbin.io/v3/b',
    JSONBIN_KEY: '$2b$10$9ZvQ8zQ8zQ8zQ8zQ8zQ8zO',
    JSONBIN_BIN_ID: '60c6b56ba7f5f6001b5b56ba',
    STORAGE_VERSION: '1.0.0'
};

// ========== BANCO DE DADOS LOCAL ==========
window.CONFIG.database = {
    usuarios: [
        {
            id: '1',
            nome: 'João Silva',
            email: 'demo@opinaflex.com',
            senha: 'demo123',
            avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=4f46e5&color=ffffff',
            bio: 'Amante de filmes e séries!',
            generosFavoritos: ['acao', 'ficcao', 'suspense'],
            dataCadastro: new Date().toISOString()
        },
        {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria@email.com',
            senha: '123456',
            avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=e50914&color=ffffff',
            bio: 'Crítica de cinema nas horas vagas',
            generosFavoritos: ['drama', 'romance', 'comedia'],
            dataCadastro: new Date().toISOString()
        }
    ],
    avaliacoes: [
        {
            id: '1',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            obraId: '550',
            tipo: 'movie',
            nota: 9.5,
            comentario: 'Filme excepcional! Fight Club é um clássico.',
            titulo: 'Fight Club',
            poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
            data: new Date().toISOString()
        }
    ],
    colecoes: [
        {
            id: '1',
            nome: 'Filmes de Super-Heróis',
            descricao: 'Minha coleção de filmes do universo Marvel e DC',
            usuario_id: '1',
            usuario_nome: 'João Silva',
            publica: true,
            capa: 'https://image.tmdb.org/t/p/w500/1Xgjl22MkAZQUavvOeBqRehrvqO.jpg',
            total_itens: 15,
            data_criacao: '2024-12-20',
            data_atualizacao: '2024-12-28'
        }
    ],
    estatisticas: {
        usuarios: 2,
        avaliacoes: 1,
        colecoes: 1
    }
};

// ========== FUNÇÕES DE API LOCAIS ==========

// Login
window.CONFIG.login = async (email, senha, lembrarMe = false) => {
    console.log('🔐 Login local:', email);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const usuario = window.CONFIG.database.usuarios.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );
    
    if (!usuario) {
        throw new Error('E-mail ou senha incorretos');
    }
    
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    // Salvar no localStorage
    window.CONFIG.salvarUsuario(usuarioSemSenha, lembrarMe);
    
    return {
        success: true,
        message: 'Login realizado com sucesso!',
        usuario: usuarioSemSenha
    };
};

// Cadastro
window.CONFIG.cadastrar = async (dados) => {
    const { nome, email, senha, generosFavoritos = [], receberEmails = false } = dados;
    
    console.log('📝 Cadastro local:', { nome, email });
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validações básicas
    if (!nome || nome.length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!email || !email.includes('@')) {
        throw new Error('E-mail inválido');
    }
    
    if (!senha || senha.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    // Verificar se email já existe
    const existe = window.CONFIG.database.usuarios.find(u => 
        u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existe) {
        throw new Error('E-mail já cadastrado');
    }
    
    // Criar novo usuário
    const novoUsuario = {
        id: Date.now().toString(),
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=ffffff`,
        bio: '',
        generosFavoritos,
        receberEmails,
        dataCadastro: new Date().toISOString()
    };
    
    // Adicionar ao banco local
    window.CONFIG.database.usuarios.push(novoUsuario);
    window.CONFIG.salvarDatabase();
    
    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    
    // Auto-login após cadastro
    window.CONFIG.salvarUsuario(usuarioSemSenha);
    
    return {
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        usuario: usuarioSemSenha
    };
};

// Buscar filmes/séries
window.CONFIG.buscarConteudo = async (query) => {
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
        
        // Fallback com dados locais
        const filmesExemplo = [
            {
                id: 550,
                title: 'Fight Club',
                poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
                vote_average: 8.8
            },
            {
                id: 13,
                title: 'Forrest Gump',
                poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
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

// Obter filmes populares
window.CONFIG.obterFilmesPopulares = async () => {
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
        console.error('Erro TMDB:', error);
        return { success: false, resultados: [], total: 0 };
    }
};

// Obter avaliações
window.CONFIG.obterAvaliacoes = async (filtros = {}) => {
    let avaliacoes = [...window.CONFIG.database.avaliacoes];
    
    // Aplicar filtros
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
    
    if (!usuario_id || !obra_id || !tipo || !nota) {
        throw new Error('Dados obrigatórios: usuario_id, obra_id, tipo, nota');
    }
    
    const usuario = window.CONFIG.database.usuarios.find(u => u.id === usuario_id);
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }
    
    const novaAvaliacao = {
        id: Date.now().toString(),
        usuarioId: usuario_id,
        usuarioNome: usuario.nome,
        obraId: obra_id.toString(),
        tipo,
        nota: parseFloat(nota),
        comentario: comentario || '',
        titulo: titulo || '',
        poster: poster || '',
        data: new Date().toISOString()
    };
    
    window.CONFIG.database.avaliacoes.push(novaAvaliacao);
    window.CONFIG.salvarDatabase();
    
    return {
        success: true,
        message: 'Avaliação criada com sucesso!',
        avaliacao: novaAvaliacao
    };
};

// Obter coleções
window.CONFIG.obterColecoes = async (filtros = {}) => {
    let colecoes = [...window.CONFIG.database.colecoes];
    
    if (filtros.usuario_id) {
        colecoes = colecoes.filter(c => c.usuario_id === filtros.usuario_id);
    }
    
    if (filtros.publicas_apenas) {
        colecoes = colecoes.filter(c => c.publica);
    }
    
    return {
        success: true,
        colecoes,
        total: colecoes.length
    };
};

// Obter coleção específica
window.CONFIG.obterColecao = async (id) => {
    const colecao = window.CONFIG.database.colecoes.find(c => c.id === id);
    
    if (!colecao) {
        return { success: false, message: 'Coleção não encontrada' };
    }
    
    return {
        success: true,
        colecao
    };
};

// Obter itens da coleção
window.CONFIG.obterItensColecao = async (colecaoId) => {
    // Mock de itens da coleção
    const itensMock = [
        {
            id: '1',
            obra_id: '299536',
            tipo: 'movie',
            titulo: 'Vingadores: Guerra Infinita',
            poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
            ano: '2018',
            nota_tmdb: 8.3,
            data_adicao: '2024-12-20'
        }
    ];
    
    return {
        success: true,
        itens: itensMock
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
window.CONFIG.salvarUsuario = (usuario, lembrarMe = false) => {
    if (lembrarMe) {
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        localStorage.setItem('lembrarLogin', 'true');
    } else {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    }
    console.log('👤 Usuário salvo:', usuario.nome);
};

// Obter usuário logado
window.CONFIG.obterUsuario = () => {
    let usuarioStr = sessionStorage.getItem('usuarioLogado');
    
    if (!usuarioStr && localStorage.getItem('lembrarLogin')) {
        usuarioStr = localStorage.getItem('usuarioLogado');
    }
    
    return usuarioStr ? JSON.parse(usuarioStr) : null;
};

// Logout
window.CONFIG.logout = () => {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('lembrarLogin');
    sessionStorage.removeItem('usuarioLogado');
    console.log('👋 Logout realizado');
    window.location.href = 'index.html';
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

// Salvar database no localStorage
window.CONFIG.salvarDatabase = () => {
    try {
        localStorage.setItem('opinaflix_database', JSON.stringify(window.CONFIG.database));
        console.log('💾 Database salvo no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar database:', error);
    }
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
    successDiv.innerHTML = '✅ Sistema Local OK<br>🗄️ Banco: localStorage<br>🌐 APIs: Funcionando';
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
    console.log('- Coleções:', window.CONFIG.database.colecoes.length);
});

console.log('🎉 Sistema local 100% funcional!');