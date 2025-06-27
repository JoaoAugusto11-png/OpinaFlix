const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');

const PORT = 3001;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});