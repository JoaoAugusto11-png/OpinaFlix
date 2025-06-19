const Colecao = require('../models/colecao');

exports.criarColecao = (req, res) => {
  const { usuarioId, nome } = req.body;
  if (!usuarioId || !nome) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }
  const colecao = Colecao.criar(usuarioId, nome);
  res.status(201).json({ message: 'Coleção criada!', colecao });
};

exports.listarColecoes = (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  if (!usuarioId) {
    return res.status(400).json({ message: 'Usuário não informado.' });
  }
  const colecoes = Colecao.listarPorUsuario(usuarioId);
  res.json(colecoes);
};