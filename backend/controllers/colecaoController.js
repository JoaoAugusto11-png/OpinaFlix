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

// Listar todas as coleções (visível para todos)
exports.listarColecoes = (req, res) => {
  // Remove o filtro por usuário para mostrar todas as coleções
  db.all(
    `SELECT c.*, u.nome as criador_nome FROM colecoes c 
     LEFT JOIN usuarios u ON c.usuario_id = u.id 
     ORDER BY c.id DESC`,
    [],
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

// Excluir coleção (apenas o criador pode excluir)
exports.excluirColecao = (req, res) => {
  const colecaoId = parseInt(req.params.colecaoId);
  const { usuarioId } = req.body;
  
  if (!colecaoId || !usuarioId) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  // Verifica se a coleção pertence ao usuário
  db.get(
    `SELECT * FROM colecoes WHERE id = ? AND usuario_id = ?`,
    [colecaoId, usuarioId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao verificar coleção.' });
      }
      if (!row) {
        return res.status(403).json({ message: 'Você não tem permissão para excluir esta coleção.' });
      }

      // Primeiro, remove todos os itens da coleção
      db.run(
        `DELETE FROM colecao_itens WHERE colecao_id = ?`,
        [colecaoId],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Erro ao remover itens da coleção.' });
          }

          // Depois, remove a coleção
          db.run(
            `DELETE FROM colecoes WHERE id = ?`,
            [colecaoId],
            (err) => {
              if (err) {
                return res.status(500).json({ message: 'Erro ao excluir coleção.' });
              }
              res.json({ success: true, message: 'Coleção excluída com sucesso.' });
            }
          );
        }
      );
    }
  );
};