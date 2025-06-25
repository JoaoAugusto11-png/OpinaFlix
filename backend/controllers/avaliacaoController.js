const db = require('../db');

exports.criarAvaliacao = (req, res) => {
  const { usuarioId, obraId, tipo, comentario } = req.body;
  let { nota } = req.body;
  nota = Number(nota);
  if (!usuarioId || !obraId || !tipo || isNaN(nota) || nota < 1 || nota > 10) {
    return res.status(400).json({ message: 'Dados incompletos ou nota inválida.' });
  }
  db.run(
    `INSERT INTO avaliacoes (usuario_id, obra_id, tipo, nota, comentario) VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, obraId, tipo, nota, comentario],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erro ao registrar avaliação.' });
      res.status(201).json({ id: this.lastID, usuarioId, obraId, tipo, nota, comentario });
    }
  );
};

exports.listarAvaliacoes = (req, res) => {
  const obraId = parseInt(req.params.obraId);
  db.all(
    `SELECT a.*, u.nome as usuarioNome FROM avaliacoes a
     LEFT JOIN usuarios u ON a.usuario_id = u.id
     WHERE a.obra_id = ? ORDER BY a.data DESC`,
    [obraId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erro ao buscar avaliações.' });
      res.json(rows);
    }
  );
};

exports.listarAvaliacoesRecentes = (req, res) => {
  db.all(
    `SELECT a.*, u.nome as usuarioNome FROM avaliacoes a
     LEFT JOIN usuarios u ON a.usuario_id = u.id
     ORDER BY a.data DESC LIMIT 30`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erro ao buscar avaliações.' });
      res.json(rows);
    }
  );
};