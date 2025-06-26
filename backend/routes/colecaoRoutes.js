const express = require('express');
const router = express.Router();
const colecaoController = require('../controllers/colecaoController');

router.post('/colecoes', colecaoController.criarColecao);
router.get('/colecoes', colecaoController.listarColecoes); // agora espera usuarioId como query param

// Adicionar obra à coleção
router.post('/colecoes/:colecaoId/itens', colecaoController.adicionarItemColecao);

// Remover obra da coleção
router.delete('/colecoes/:colecaoId/itens/:itemId', colecaoController.removerItemColecao);

// Listar itens de uma coleção
router.get('/colecoes/:colecaoId/itens', colecaoController.listarItensColecao);

// Excluir coleção
router.delete('/colecoes/:colecaoId', colecaoController.excluirColecao);

module.exports = router;