const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

const PORT = process.env.PORT || 3001;

// ========== CORS UNIVERSAL PARA TODOS OS SEUS DOMÍNIOS ==========
app.use(cors({
    origin: function (origin, callback) {
        // Lista de domínios permitidos
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            /^https:\/\/opinaflix.*\.vercel\.app$/, // Qualquer subdomínio opinaflix
            /^https:\/\/.*joao-augustos-projects.*\.vercel\.app$/ // Qualquer projeto seu
        ];
        
        // Permitir se não há origin (Postman, etc) ou se está na lista
        if (!origin) {
            return callback(null, true);
        }
        
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('❌ CORS bloqueou origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// ========== MIDDLEWARE PARA GARANTIR CORS ==========
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Log para debug
    console.log('🌐 Request from origin:', origin);
    
    // Definir headers CORS manualmente para garantir
    if (origin && (
        origin.includes('vercel.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1')
    )) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    
    // Responder a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('✅ Responding to OPTIONS request');
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
        message: '🚀 OpinaFlix Backend - CORS Universal!',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        cors: 'CORS configurado universalmente',
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        origin: req.headers.origin || 'No origin header',
        userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.status(200).json({
        status: '✅ Healthy - CORS Universal',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        cors: 'Universal OK',
        memory: process.memoryUsage(),
        origin: req.headers.origin,
        requests_count: Math.floor(process.uptime() * 10) // Mock counter
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

module.exports = app;