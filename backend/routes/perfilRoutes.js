const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const upload = require('../middleware/upload');

// Adicione este log temporário
console.log('perfilRoutes carregado!');

// Teste simples primeiro
router.get('/perfil/teste', (req, res) => {
    res.json({ message: 'Rota de perfil funcionando!' });
});

// Buscar dados do perfil do usuário
router.get('/perfil/:usuarioId', perfilController.obterPerfil);

// Buscar reviews do usuário
router.get('/perfil/:usuarioId/reviews', perfilController.obterReviews);

// Buscar coleções do usuário
router.get('/perfil/:usuarioId/colecoes', perfilController.obterColecoes);

// Atualizar foto de perfil (com upload real)
router.post('/perfil/:usuarioId/foto', upload.single('foto'), perfilController.atualizarFotoUpload);

// Manter a rota PUT para URL externa (se necessário)
router.put('/perfil/:usuarioId/foto', perfilController.atualizarFoto);

// Seguir usuário
router.post('/perfil/:usuarioId/seguir', perfilController.seguirUsuario);

// Deixar de seguir
router.delete('/perfil/:usuarioId/seguir', perfilController.deixarDeSeguir);

// Verificar se está seguindo
router.get('/perfil/:usuarioId/seguindo/:seguidorId', perfilController.verificarSeguindo);

module.exports = router;