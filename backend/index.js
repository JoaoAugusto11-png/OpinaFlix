const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

const PORT = process.env.PORT || 3001;

// CORS para produção
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:8080',
        'https://opinaflix.vercel.app', // Vercel (será criado)
        'https://seudominio.com', // Seu domínio da Hostinger
        'https://www.seudominio.com'
    ],
    credentials: true
}));

app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', usuarioRoutes);
app.use('/api', colecaoRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', perfilRoutes);

// Middleware de erro global (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});