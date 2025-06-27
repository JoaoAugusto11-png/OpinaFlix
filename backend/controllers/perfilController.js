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
      
      // Buscar estatísticas incluindo seguidores
      db.get(
        `SELECT 
          COALESCE((SELECT COUNT(*) FROM avaliacoes WHERE usuario_id = ?), 0) as total_reviews,
          COALESCE((SELECT COUNT(*) FROM colecoes WHERE usuario_id = ?), 0) as total_colecoes,
          COALESCE((SELECT COUNT(*) FROM seguidores WHERE seguindo_id = ?), 0) as total_seguidores
        `,
        [usuarioId, usuarioId, usuarioId],
        (err, stats) => {
          if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            stats = { total_reviews: 0, total_colecoes: 0, total_seguidores: 0 };
          }
          
          const resultado = {
            ...usuario,
            total_reviews: stats?.total_reviews || 0,
            total_colecoes: stats?.total_colecoes || 0,
            total_seguidores: stats?.total_seguidores || 0
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

// Atualizar foto com upload de arquivo
exports.atualizarFotoUpload = (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }
  
  // URL da foto será: http://localhost:3001/uploads/perfil/filename
  const fotoUrl = `http://localhost:3001/uploads/perfil/${req.file.filename}`;
  
  db.run(
    `UPDATE usuarios SET foto_perfil = ? WHERE id = ?`,
    [fotoUrl, usuarioId],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar foto:', err);
        return res.status(500).json({ message: 'Erro ao atualizar foto.' });
      }
      res.json({ 
        success: true, 
        message: 'Foto atualizada com sucesso!',
        foto_url: fotoUrl
      });
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

// Seguir usuário
exports.seguirUsuario = (req, res) => {
  const seguindoId = parseInt(req.params.usuarioId);
  const { seguidor_id } = req.body;
  
  if (seguindoId === seguidor_id) {
    return res.status(400).json({ message: 'Não é possível seguir a si mesmo.' });
  }
  
  db.run(
    `INSERT INTO seguidores (seguidor_id, seguindo_id) VALUES (?, ?)`,
    [seguidor_id, seguindoId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Você já segue este usuário.' });
        }
        console.error('Erro ao seguir usuário:', err);
        return res.status(500).json({ message: 'Erro ao seguir usuário.' });
      }
      res.json({ success: true, message: 'Usuário seguido com sucesso!' });
    }
  );
};

// Deixar de seguir
exports.deixarDeSeguir = (req, res) => {
  const seguindoId = parseInt(req.params.usuarioId);
  const { seguidor_id } = req.body;
  
  db.run(
    `DELETE FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?`,
    [seguidor_id, seguindoId],
    function(err) {
      if (err) {
        console.error('Erro ao deixar de seguir:', err);
        return res.status(500).json({ message: 'Erro ao deixar de seguir.' });
      }
      res.json({ success: true, message: 'Deixou de seguir o usuário.' });
    }
  );
};

// Verificar se está seguindo
exports.verificarSeguindo = (req, res) => {
  const seguindoId = parseInt(req.params.usuarioId);
  const seguidorId = parseInt(req.params.seguidorId);
  
  db.get(
    `SELECT id FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?`,
    [seguidorId, seguindoId],
    (err, row) => {
      if (err) {
        console.error('Erro ao verificar seguimento:', err);
        return res.status(500).json({ seguindo: false });
      }
      res.json({ seguindo: !!row });
    }
  );
};