const express = require('express');
const router = express.Router();
const colecaoController = require('../controllers/colecaoController');

// ========== COLEÇÕES PRINCIPAIS ==========

// Criar nova coleção
router.post('/colecoes', colecaoController.criarColecao);

// Listar coleções (por usuário via query param)
router.get('/colecoes', colecaoController.obterColecoes);

// Obter coleção específica por ID
router.get('/colecoes/:id', colecaoController.obterColecaoPorId);

// Atualizar coleção
router.put('/colecoes/:id', colecaoController.atualizarColecao);

// Deletar coleção (soft delete)
router.delete('/colecoes/:id', colecaoController.deletarColecao);

// ========== GERENCIAR ITENS DA COLEÇÃO ==========

// Adicionar item à coleção
router.post('/colecoes/:id/itens', colecaoController.adicionarItemColecao);

// Remover item da coleção
router.delete('/colecoes/:id/itens', colecaoController.removerItemColecao);

// Listar itens de uma coleção (alias para obter coleção por ID)
router.get('/colecoes/:id/itens', colecaoController.obterColecaoPorId);

// ========== ROTAS LEGACY (COMPATIBILIDADE) ==========

// Adicionar obra à coleção (rota original)
router.post('/colecoes/:colecaoId/itens', (req, res) => {
    req.params.id = req.params.colecaoId;
    colecaoController.adicionarItemColecao(req, res);
});

// Remover obra da coleção (rota original)
router.delete('/colecoes/:colecaoId/itens/:itemId', (req, res) => {
    req.params.id = req.params.colecaoId;
    req.body.obra_id = req.params.itemId;
    colecaoController.removerItemColecao(req, res);
});

// Listar itens de uma coleção (rota original)
router.get('/colecoes/:colecaoId/itens', (req, res) => {
    req.params.id = req.params.colecaoId;
    colecaoController.obterColecaoPorId(req, res);
});

// Excluir coleção (rota original)
router.delete('/colecoes/:colecaoId', (req, res) => {
    req.params.id = req.params.colecaoId;
    colecaoController.deletarColecao(req, res);
});

module.exports = router;