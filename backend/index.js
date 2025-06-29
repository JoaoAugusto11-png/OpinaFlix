const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

const PORT = process.env.PORT || 3001;

// ========== CORS CORRIGIDO ==========
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:8080',
        'https://opinaflix-azy0ktrjt-joao-augustos-projects-4cd91631.vercel.app', // Seu domínio atual do Vercel
        'https://opinaflix.vercel.app', // Domínio personalizado do Vercel
        'https://opinaflix.site', // Seu domínio da Hostinger
        'https://www.opinaflix.site',
        /^https:\/\/.*\.vercel\.app$/ // Permite qualquer subdomínio do Vercel
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// ========== MIDDLEWARES ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== ROTA DE TESTE ==========
app.get('/', (req, res) => {
    res.json({
        message: 'OpinaFlix Backend funcionando!',
        timestamp: new Date().toISOString(),
        cors: 'Configurado para Vercel e outros domínios',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ========== ROTA DE HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ========== ROTAS DA API ==========
app.use('/api', usuarioRoutes);
app.use('/api', colecaoRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', perfilRoutes);

// ========== MIDDLEWARE DE ERRO 404 ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`,
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

// ========== MIDDLEWARE DE ERRO GLOBAL ==========
app.use((err, req, res, next) => {
    console.error('Erro capturado:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ CORS configurado para Vercel`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recebido. Fechando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recebido. Fechando servidor...');
    process.exit(0);
});