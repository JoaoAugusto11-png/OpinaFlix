const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');

router.post('/avaliacoes', avaliacaoController.criarAvaliacao);
router.get('/avaliacoes/:obraId', avaliacaoController.listarAvaliacoes);

module.exports = router;