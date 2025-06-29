const express = require('express');

const app = express();

// ========== CORS SUPER SIMPLES ==========
app.use((req, res, next) => {
    // Permitir TODAS as origens
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Max-Age', '86400');
    
    // Responder OPTIONS imediatamente
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// ========== MIDDLEWARES ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========== BANCO DE DADOS EM MEMÓRIA ==========
const memoryDB = require('./data/memoryDB');

// ========== ROTA PRINCIPAL ==========
app.get('/', (req, res) => {
    res.status(200).json({
        message: '🔥 OpinaFlix Backend - CORS CORRIGIDO!',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        database: 'Memory Storage',
        status: 'READY',
        cors: 'FUNCIONANDO',
        origin: req.headers.origin || 'none',
        stats: {
            usuarios: memoryDB.usuarios.size,
            avaliacoes: memoryDB.avaliacoes.size,
            colecoes: memoryDB.colecoes.size,
            filmes: memoryDB.filmes.size
        }
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.status(200).json({
        status: '✅ HEALTHY - CORS WORKING',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cors: 'ENABLED',
        origin: req.headers.origin || 'none'
    });
});

// ========== TESTE DE CORS ==========
app.get('/api/cors-test', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🎉 CORS funcionando 100%!',
        origin: req.headers.origin || 'none',
        method: req.method,
        timestamp: new Date().toISOString(),
        headers: Object.keys(req.headers)
    });
});

// ========== ROTAS DE USUÁRIO ==========
app.post('/api/cadastro', (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        console.log('📝 Cadastro:', { nome, email, origin: req.headers.origin });
        
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }
        
        if (senha.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Senha deve ter pelo menos 6 caracteres'
            });
        }
        
        // Verificar se email já existe
        const usuarioExistente = memoryDB.obterUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }
        
        // Criar usuário
        const novoUsuario = memoryDB.criarUsuario({
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            senha,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=ffffff`,
            bio: ''
        });
        
        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        
        console.log('✅ Usuário criado:', usuarioSemSenha.id);
        
        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        console.error('❌ Erro cadastro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { email, senha } = req.body;
        
        console.log('🔐 Login:', { email, origin: req.headers.origin });
        
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        const usuario = memoryDB.obterUsuarioPorEmail(email.toLowerCase().trim());
        
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        
        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        console.log('✅ Login OK:', usuarioSemSenha.id);
        
        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        console.error('❌ Erro login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// ========== ROTAS DE AVALIAÇÃO ==========
app.get('/api/avaliacoes', (req, res) => {
    try {
        const { usuario_id, obra_id, tipo, limit = 20 } = req.query;
        
        const filtros = {};
        if (usuario_id) filtros.usuarioId = usuario_id;
        if (obra_id) filtros.obraId = obra_id;
        if (tipo) filtros.tipo = tipo;
        
        let avaliacoes = memoryDB.listarAvaliacoes(filtros);
        avaliacoes = avaliacoes.slice(0, parseInt(limit));
        
        res.status(200).json({
            success: true,
            avaliacoes,
            total: avaliacoes.length
        });
        
    } catch (error) {
        console.error('❌ Erro avaliacoes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter avaliações',
            error: error.message
        });
    }
});

app.post('/api/avaliacoes', (req, res) => {
    try {
        const { usuario_id, obra_id, tipo, nota, comentario, titulo, poster } = req.body;
        
        if (!usuario_id || !obra_id || !tipo || nota === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Dados obrigatórios: usuario_id, obra_id, tipo, nota'
            });
        }
        
        // Buscar nome do usuário
        const usuario = memoryDB.obterUsuarioPorId(usuario_id);
        const usuarioNome = usuario ? usuario.nome : 'Usuário';
        
        const novaAvaliacao = memoryDB.criarAvaliacao({
            usuarioId: usuario_id,
            obraId: obra_id,
            tipo,
            nota: parseFloat(nota),
            comentario: comentario || '',
            titulo: titulo || '',
            poster: poster || '',
            usuarioNome
        });
        
        res.status(201).json({
            success: true,
            message: 'Avaliação criada com sucesso!',
            avaliacao: novaAvaliacao
        });
        
    } catch (error) {
        console.error('❌ Erro criar avaliacao:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar avaliação',
            error: error.message
        });
    }
});

// ========== ROTAS DE FILME ==========
app.get('/api/filmes/buscar', (req, res) => {
    try {
        const { query } = req.query;
        
        const filmes = memoryDB.buscarFilmes(query);
        
        res.status(200).json({
            success: true,
            resultados: filmes,
            total: filmes.length
        });
        
    } catch (error) {
        console.error('❌ Erro buscar filmes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar filmes',
            error: error.message
        });
    }
});

// ========== ROTAS DE PERFIL ==========
app.get('/api/perfil/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = memoryDB.obterUsuarioPorId(id);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        // Buscar estatísticas
        const avaliacoes = memoryDB.listarAvaliacoes({ usuarioId: id });
        const colecoes = memoryDB.listarColecoesPorUsuario(id);
        
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.status(200).json({
            success: true,
            usuario: {
                ...usuarioSemSenha,
                estatisticas: {
                    total_avaliacoes: avaliacoes.length,
                    total_colecoes: colecoes.length,
                    media_notas: avaliacoes.length > 0 ? 
                        parseFloat((avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length).toFixed(1)) : 0
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erro perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter perfil',
            error: error.message
        });
    }
});

// ========== CATCH ALL ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
        cors: 'ENABLED'
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Error'
    });
});

// ========== EXPORT ==========
module.exports = app;