const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

// Para Vercel, não definimos PORT fixo
const PORT = process.env.PORT || 3001;

// ========== CORS CORRIGIDO PARA VERCEL ==========
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://opinaflix-azy0ktrjt-joao-augustos-projects-4cd91631.vercel.app',
        'https://opinaflix-552j89muo-joao-augustos-projects-4cd91631.vercel.app', // ← SEU FRONTEND ATUAL
        'https://opinaflix.vercel.app',
        'https://opinaflix-backend.vercel.app',
        'https://opinaflix-backend-m6043c3jv-joao-augustos-projects-4cd91631.vercel.app',
        /^https:\/\/opinaflix.*\.vercel\.app$/, // ← REGEX PARA QUALQUER SUBDOMÍNIO OPINAFLIX
        /^https:\/\/.*joao-augustos-projects.*\.vercel\.app$/ // ← REGEX PARA SEUS PROJETOS
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// ========== MIDDLEWARE PARA HEADERS ADICIONAIS ==========
app.use((req, res, next) => {
    // Headers extras para garantir CORS
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Responder OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// ========== MIDDLEWARES ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== ROTA DE TESTE ==========
app.get('/', (req, res) => {
    res.json({
        message: '🚀 OpinaFlix Backend no Vercel!',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        cors: 'CORS configurado e funcionando',
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        origin: req.headers.origin || 'No origin header'
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.status(200).json({
        status: '✅ Healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        cors: 'OK',
        memory: process.memoryUsage(),
        origin: req.headers.origin
    });
});

// ========== ROTAS DA API ==========
app.use('/api', usuarioRoutes);
app.use('/api', colecaoRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', perfilRoutes);

// ========== MIDDLEWARE 404 ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `🔍 Rota ${req.originalUrl} não encontrada`,
        platform: 'Vercel',
        method: req.method,
        origin: req.headers.origin,
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

// ========== MIDDLEWARE DE ERRO ==========
app.use((err, req, res, next) => {
    console.error('❌ Erro capturado:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        platform: 'Vercel',
        origin: req.headers.origin,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========== EXPORT PARA VERCEL ==========
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor local rodando na porta ${PORT}`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export para Vercel
module.exports = app;