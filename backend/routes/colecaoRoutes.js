const express = require('express');
const router = express.Router();
const colecaoController = require('../controllers/colecaoController');

router.post('/colecoes', colecaoController.criarColecao);
router.get('/colecoes/:usuarioId', colecaoController.listarColecoes);

module.exports = router;