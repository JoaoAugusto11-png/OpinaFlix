const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Simulação de "banco de dados" em memória
let usuarios = [];
let colecoes = [];
let avaliacoes = [];

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend OpinaFlix rodando!');
});

// Cadastro de usuário
app.post('/api/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  if (usuarios.find(u => u.email === email)) {
    return res.status(409).json({ message: 'E-mail já cadastrado.' });
  }
  const usuario = { id: usuarios.length + 1, nome, email, senha };
  usuarios.push(usuario);
  res.status(201).json({ message: 'Usuário cadastrado!', usuario: { id: usuario.id, nome, email } });
});

// Login simples
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  if (!usuario) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }
  res.json({ message: 'Login realizado!', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

// Criar coleção
app.post('/api/colecoes', (req, res) => {
  const { usuarioId, nome } = req.body;
  if (!usuarioId || !nome) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }
  const colecao = { id: colecoes.length + 1, usuarioId, nome };
  colecoes.push(colecao);
  res.status(201).json({ message: 'Coleção criada!', colecao });
});

// Listar coleções de um usuário
app.get('/api/colecoes/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const userColecoes = colecoes.filter(c => c.usuarioId === usuarioId);
  res.json(userColecoes);
});

// Adicionar avaliação
app.post('/api/avaliacoes', (req, res) => {
  const { usuarioId, obraId, nota, comentario } = req.body;
  if (!usuarioId || !obraId || !nota) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }
  const avaliacao = { id: avaliacoes.length + 1, usuarioId, obraId, nota, comentario };
  avaliacoes.push(avaliacao);
  res.status(201).json({ message: 'Avaliação registrada!', avaliacao });
});

// Listar avaliações de uma obra
app.get('/api/avaliacoes/:obraId', (req, res) => {
  const obraId = parseInt(req.params.obraId);
  const obraAvaliacoes = avaliacoes.filter(a => a.obraId === obraId);
  res.json(obraAvaliacoes);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});