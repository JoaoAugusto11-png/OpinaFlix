const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');

// Rota para criar avaliação
router.post('/avaliacoes', avaliacaoController.criarAvaliacao);

// Rota para listar avaliações recentes (para o mural)
router.get('/avaliacoes/recentes', avaliacaoController.listarAvaliacoesRecentes);

module.exports = router;