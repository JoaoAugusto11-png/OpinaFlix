const express = require('express');
const cors = require('cors');

const app = express();

// ========== CORS MELHORADO ==========
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir todas as origens do Vercel e localhost
        const allowedOrigins = [
            'https://opinaflix-ecqutlaw1-joao-augustos-projects-4cd91631.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];
        
        // Permitir todas as origens do Vercel (que começam com https://opinaflix)
        if (!origin || 
            allowedOrigins.indexOf(origin) !== -1 || 
            origin.includes('opinaflix') || 
            origin.includes('vercel.app') ||
            origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(null, true); // Permitir todas por enquanto
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-HTTP-Method-Override'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// ========== MIDDLEWARE MANUAL DE CORS ==========
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Responder a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).json({
            success: true,
            message: 'CORS preflight OK'
        });
        return;
    }
    
    next();
});

// ========== MIDDLEWARES ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== BANCO DE DADOS EM MEMÓRIA ==========
const memoryDB = require('./data/memoryDB');

// ========== ROTA PRINCIPAL ==========
app.get('/', (req, res) => {
    res.json({
        message: '🔥 OpinaFlix Backend - Funcionando Perfeitamente!',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        database: 'Memory Storage',
        status: 'READY',
        cors: 'ENABLED',
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
    res.json({
        status: '✅ HEALTHY - MEMORY DB WORKING',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'Memory Storage',
        cors: 'ENABLED'
    });
});

// ========== TESTE DE CORS ==========
app.get('/api/cors-test', (req, res) => {
    res.json({
        success: true,
        message: '🎉 CORS funcionando perfeitamente!',
        origin: req.headers.origin,
        method: req.method,
        headers: req.headers
    });
});

// ========== ROTAS DE USUÁRIO ==========
app.post('/api/cadastro', (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        console.log('📝 Cadastro attempt:', { nome, email });
        
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
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
            nome,
            email,
            senha,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=ffffff`,
            bio: ''
        });
        
        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        
        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        console.error('Cadastro error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar usuário',
            error: error.message
        });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { email, senha } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        const usuario = memoryDB.obterUsuarioPorEmail(email);
        
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        
        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no login',
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
        
        res.json({
            success: true,
            avaliacoes,
            total: avaliacoes.length
        });
        
    } catch (error) {
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
        const usuarioNome = usuario ? usuario.nome : 'Usuário Desconhecido';
        
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
        
        res.json({
            success: true,
            resultados: filmes,
            total: filmes.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar filmes',
            error: error.message
        });
    }
});

// ========== ROTA DE PERFIL ==========
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
        
        // Buscar estatísticas do usuário
        const avaliacoes = memoryDB.listarAvaliacoes({ usuarioId: id });
        const colecoes = memoryDB.listarColecoesPorUsuario(id);
        
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.json({
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
        res.status(500).json({
            success: false,
            message: 'Erro ao obter perfil',
            error: error.message
        });
    }
});

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`,
        database: 'Memory Storage',
        cors: 'ENABLED'
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`💾 Banco de dados em memória carregado`);
        console.log(`🌐 CORS habilitado para todas as origens`);
    });
}

module.exports = app;