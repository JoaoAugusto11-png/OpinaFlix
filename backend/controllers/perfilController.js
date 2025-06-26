const db = require('../db');

// Obter dados do perfil
exports.obterPerfil = (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  
  if (!usuarioId || isNaN(usuarioId)) {
    return res.status(400).json({ message: 'ID de usuário inválido.' });
  }
  
  db.get(
    `SELECT id, nome, email, foto_perfil FROM usuarios WHERE id = ?`,
    [usuarioId],
    (err, usuario) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro ao buscar usuário.' });
      }
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      
      // Buscar estatísticas na tabela correta (avaliacoes)
      db.get(
        `SELECT 
          COALESCE((SELECT COUNT(*) FROM avaliacoes WHERE usuario_id = ?), 0) as total_reviews,
          COALESCE((SELECT COUNT(*) FROM colecoes WHERE usuario_id = ?), 0) as total_colecoes
        `,
        [usuarioId, usuarioId],
        (err, stats) => {
          if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            stats = { total_reviews: 0, total_colecoes: 0 };
          }
          
          const resultado = {
            ...usuario,
            total_reviews: stats?.total_reviews || 0,
            total_colecoes: stats?.total_colecoes || 0,
            total_seguidores: 0
          };
          
          res.json(resultado);
        }
      );
    }
  );
};

// Atualizar foto de perfil
exports.atualizarFoto = (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const { foto_url } = req.body;
  
  db.run(
    `UPDATE usuarios SET foto_perfil = ? WHERE id = ?`,
    [foto_url, usuarioId],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar foto:', err);
        return res.status(500).json({ message: 'Erro ao atualizar foto.' });
      }
      res.json({ success: true, message: 'Foto atualizada com sucesso!' });
    }
  );
};

// Obter reviews do usuário (com coluna correta)
exports.obterReviews = (req, res) => {
  console.log('=== obterReviews chamado ===');
  const usuarioId = parseInt(req.params.usuarioId);
  console.log('Buscando reviews para usuário:', usuarioId);
  
  db.all(
    `SELECT id, obra_id, tipo, nota, comentario, data as data_review 
     FROM avaliacoes 
     WHERE usuario_id = ? 
     ORDER BY data DESC 
     LIMIT 10`,
    [usuarioId],
    (err, reviews) => {
      if (err) {
        console.error('Erro ao buscar reviews:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('Reviews encontrados:', reviews);
      res.json(reviews || []);
    }
  );
};

// Obter coleções do usuário
exports.obterColecoes = (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  
  db.all(
    `SELECT * FROM colecoes WHERE usuario_id = ? ORDER BY id DESC`,
    [usuarioId],
    (err, colecoes) => {
      if (err) {
        console.error('Erro ao buscar coleções:', err);
        return res.json([]);
      }
      res.json(colecoes || []);
    }
  );
};