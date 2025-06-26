const express = require('express');
const cors = require('cors');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
// const filmeRoutes = require('./routes/filmeRoutes'); // Descomente se existir

const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', usuarioRoutes);
app.use('/api', colecaoRoutes);
app.use('/api', avaliacaoRoutes);
// app.use('/api', filmeRoutes); // Descomente se existir

// Middleware de erro global (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});