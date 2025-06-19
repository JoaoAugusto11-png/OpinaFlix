const Avaliacao = require('../models/avaliacao');

exports.criarAvaliacao = (req, res) => {
  const { usuarioId, obraId, nota, comentario } = req.body;
  if (!usuarioId || !obraId || !nota) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }
  const avaliacao = Avaliacao.criar(usuarioId, obraId, nota, comentario);
  res.status(201).json({ message: 'Avaliação registrada!', avaliacao });
};

exports.listarAvaliacoes = (req, res) => {
  const obraId = parseInt(req.params.obraId);
  if (!obraId) {
    return res.status(400).json({ message: 'Obra não informada.' });
  }
  const avaliacoes = Avaliacao.listarPorObra(obraId);
  res.json(avaliacoes);
};