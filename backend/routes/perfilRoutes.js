const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

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

// Atualizar foto de perfil
router.put('/perfil/:usuarioId/foto', perfilController.atualizarFoto);

module.exports = router;