const express = require('express');
const cors = require('cors');
const app = express();

const usuarioRoutes = require('./routes/usuarioRoutes');
const colecaoRoutes = require('./routes/colecaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const filmeRoutes = require('./routes/filmeRoutes'); // Adicione esta linha se quiser rotas de filmes

const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', usuarioRoutes);
app.use('/api', colecaoRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', filmeRoutes); // Adicione esta linha se quiser rotas de filmes

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});