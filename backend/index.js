const express = require('express');
const cors = require('cors');

const app = express();

// ========== CORS ==========
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// ========== MIDDLEWARES ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== IMPORTAR FIREBASE (COM FALLBACK) ==========
let db = null;
let useFirebase = false;

try {
    const firebase = require('./config/firebase');
    db = firebase.db;
    useFirebase = true;
    console.log('✅ Firebase conectado!');
} catch (error) {
    console.log('⚠️ Firebase não disponível, usando dados em memória:', error.message);
    useFirebase = false;
}

// ========== DADOS EM MEMÓRIA (FALLBACK) ==========
let usuarios = [
    {
        id: 1,
        nome: 'Usuário Teste',
        email: 'teste@teste.com',
        senha: '123456'
    }
];

let avaliacoes = [];
let colecoes = [];

// ========== ROTA PRINCIPAL ==========
app.get('/', (req, res) => {
    res.json({
        message: '🔥 OpinaFlix Backend com Firebase!',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        database: useFirebase ? 'Firestore' : 'Memory',
        status: 'OK',
        firebase_connected: useFirebase,
        uptime: process.uptime()
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({
        status: '✅ Healthy',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        database: useFirebase ? 'Firestore' : 'Memory',
        firebase_connected: useFirebase,
        uptime: process.uptime()
    });
});

// ========== LOGIN ==========
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        if (useFirebase) {
            // ========== FIREBASE LOGIN ==========
            const usuariosRef = db.collection('usuarios');
            const query = await usuariosRef.where('email', '==', email).where('senha', '==', senha).get();
            
            if (query.empty) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha incorretos'
                });
            }
            
            const usuario = query.docs[0];
            const userData = usuario.data();
            
            res.json({
                success: true,
                message: 'Login realizado com sucesso (Firebase)',
                usuario: {
                    id: usuario.id,
                    nome: userData.nome,
                    email: userData.email
                }
            });
            
        } else {
            // ========== MEMORY LOGIN ==========
            const usuario = usuarios.find(u => u.email === email && u.senha === senha);
            
            if (usuario) {
                res.json({
                    success: true,
                    message: 'Login realizado com sucesso (Memory)',
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Email ou senha incorretos'
                });
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// ========== CADASTRO ==========
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        console.log('📝 Cadastro attempt:', { nome, email });
        
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }
        
        if (useFirebase) {
            // ========== FIREBASE CADASTRO ==========
            const usuariosRef = db.collection('usuarios');
            const existeQuery = await usuariosRef.where('email', '==', email).get();
            
            if (!existeQuery.empty) {
                return res.status(409).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
            
            const novoUsuario = {
                nome,
                email,
                senha,
                dataCadastro: new Date().toISOString(),
                ativo: true
            };
            
            const docRef = await usuariosRef.add(novoUsuario);
            
            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso (Firebase)',
                usuario: {
                    id: docRef.id,
                    nome,
                    email
                }
            });
            
        } else {
            // ========== MEMORY CADASTRO ==========
            const usuarioExistente = usuarios.find(u => u.email === email);
            if (usuarioExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
            
            const novoUsuario = {
                id: Date.now(),
                nome,
                email,
                senha
            };
            
            usuarios.push(novoUsuario);
            
            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso (Memory)',
                usuario: {
                    id: novoUsuario.id,
                    nome: novoUsuario.nome,
                    email: novoUsuario.email
                }
            });
        }
        
    } catch (error) {
        console.error('Cadastro error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// ========== ROTAS BÁSICAS DE AVALIAÇÕES E COLEÇÕES ==========
app.get('/api/avaliacoes', (req, res) => {
    res.json({
        success: true,
        avaliacoes: avaliacoes,
        database: useFirebase ? 'Firebase' : 'Memory'
    });
});

app.post('/api/avaliacoes', (req, res) => {
    const novaAvaliacao = {
        id: Date.now(),
        ...req.body,
        data: new Date().toISOString()
    };
    
    avaliacoes.push(novaAvaliacao);
    
    res.status(201).json({
        success: true,
        message: 'Avaliação criada com sucesso',
        avaliacao: novaAvaliacao
    });
});

app.get('/api/colecoes', (req, res) => {
    res.json({
        success: true,
        colecoes: colecoes,
        database: useFirebase ? 'Firebase' : 'Memory'
    });
});

app.post('/api/colecoes', (req, res) => {
    const novaColecao = {
        id: Date.now(),
        ...req.body,
        dataCriacao: new Date().toISOString()
    };
    
    colecoes.push(novaColecao);
    
    res.status(201).json({
        success: true,
        message: 'Coleção criada com sucesso',
        colecao: novaColecao
    });
});

// ========== IMPORTAR ROUTES ==========
const usuarioRoutes = require('./routes/usuarioRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const filmeRoutes = require('./routes/filmeRoutes');

// ========== USAR ROTAS ==========
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/colecoes', colecaoRoutes);
app.use('/api/perfis', perfilRoutes);
app.use('/api/filmes', filmeRoutes);

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`,
        database: useFirebase ? 'Firebase' : 'Memory',
        availableRoutes: [
            'GET /',
            'GET /health',
            'POST /api/login',
            'POST /api/cadastro',
            'GET /api/avaliacoes',
            'POST /api/avaliacoes',
            'GET /api/colecoes',
            'POST /api/colecoes'
        ]
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        database: useFirebase ? 'Firebase' : 'Memory',
        error: err.message
    });
});

module.exports = app;