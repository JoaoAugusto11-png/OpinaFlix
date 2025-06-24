const db = require('../db');

// Criar coleção
exports.criarColecao = (req, res) => {
  const { usuarioId, nome } = req.body;
  if (!usuarioId || !nome) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }
  db.run(
    `INSERT INTO colecoes (usuario_id, nome) VALUES (?, ?)`,
    [usuarioId, nome],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criar coleção.' });
      }
      res.status(201).json({
        message: 'Coleção criada!',
        colecao: {
          id: this.lastID,
          usuarioId,
          nome,
        },
      });
    }
  );
};

// Listar coleções de um usuário
exports.listarColecoes = (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  if (!usuarioId) {
    return res.status(400).json({ message: 'Usuário não informado.' });
  }
  db.all(
    `SELECT * FROM colecoes WHERE usuario_id = ?`,
    [usuarioId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao buscar coleções.' });
      }
      res.json(rows);
    }
  );
};