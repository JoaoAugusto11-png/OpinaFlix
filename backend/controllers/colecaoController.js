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
  const usuarioId = parseInt(req.query.usuarioId);
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

// Adicionar obra à coleção
exports.adicionarItemColecao = (req, res) => {
  const colecaoId = parseInt(req.params.colecaoId);
  const { obra_id, tipo, ordem } = req.body;
  if (!colecaoId || !obra_id || !tipo) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }
  db.run(
    `INSERT INTO colecao_itens (colecao_id, obra_id, tipo, ordem) VALUES (?, ?, ?, ?)`,
    [colecaoId, obra_id, tipo, ordem || 0],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erro ao adicionar item.' });
      res.status(201).json({ id: this.lastID, colecao_id: colecaoId, obra_id, tipo, ordem: ordem || 0 });
    }
  );
};

// Remover obra da coleção
exports.removerItemColecao = (req, res) => {
  const colecaoId = parseInt(req.params.colecaoId);
  const itemId = parseInt(req.params.itemId);
  db.run(
    `DELETE FROM colecao_itens WHERE id = ? AND colecao_id = ?`,
    [itemId, colecaoId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Erro ao remover item.' });
      res.json({ success: true });
    }
  );
};

// Listar itens de uma coleção
exports.listarItensColecao = (req, res) => {
  const colecaoId = parseInt(req.params.colecaoId);
  db.all(
    `SELECT * FROM colecao_itens WHERE colecao_id = ? ORDER BY ordem ASC, id ASC`,
    [colecaoId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar itens:', err); // Adicione esta linha
        return res.status(500).json({ message: 'Erro ao buscar itens.' });
      }
      res.json(rows);
    }
  );
};