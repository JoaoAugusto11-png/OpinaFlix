const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');

// Criar uma nova avaliação
router.post('/avaliacoes', avaliacaoController.criarAvaliacao);

// Listar avaliações de uma obra (filme ou série)
router.get('/avaliacoes/:obraId', avaliacaoController.listarAvaliacoes);

// Listar avaliações recentes
router.get('/avaliacoes/recentes', avaliacaoController.listarAvaliacoesRecentes);

module.exports = router;