const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');

// ========== AVALIAÇÕES PRINCIPAIS ==========

// Criar nova avaliação
router.post('/avaliacoes', avaliacaoController.criarAvaliacao);

// Listar avaliações (com filtros por query params)
router.get('/avaliacoes', avaliacaoController.obterAvaliacoes);

// Obter avaliação específica por ID
router.get('/avaliacoes/:id', (req, res) => {
    res.json({
        success: false,
        message: 'Funcionalidade de obter avaliação por ID ainda não implementada',
        feature: 'coming_soon'
    });
});

// Atualizar avaliação
router.put('/avaliacoes/:id', avaliacaoController.atualizarAvaliacao);

// Deletar avaliação
router.delete('/avaliacoes/:id', avaliacaoController.deletarAvaliacao);

// ========== ESTATÍSTICAS ==========

// Obter estatísticas de avaliações do usuário
router.get('/avaliacoes/estatisticas', avaliacaoController.obterEstatisticas);

// ========== ROTAS ESPECÍFICAS ==========

// Listar avaliações recentes (para o mural)
router.get('/avaliacoes/recentes', (req, res) => {
    // Limitar a 20 avaliações mais recentes
    req.query.limit = req.query.limit || 20;
    avaliacaoController.obterAvaliacoes(req, res);
});

// Avaliações por obra
router.get('/avaliacoes/obra/:obraId', (req, res) => {
    req.query.obra_id = req.params.obraId;
    avaliacaoController.obterAvaliacoes(req, res);
});

// Avaliações por usuário
router.get('/avaliacoes/usuario/:usuarioId', (req, res) => {
    req.query.usuario_id = req.params.usuarioId;
    avaliacaoController.obterAvaliacoes(req, res);
});

// Avaliações por tipo (filmes ou séries)
router.get('/avaliacoes/tipo/:tipo', (req, res) => {
    req.query.tipo = req.params.tipo;
    avaliacaoController.obterAvaliacoes(req, res);
});

// ========== ROTAS LEGACY (COMPATIBILIDADE) ==========

// Rota original para avaliações recentes
router.get('/mural/avaliacoes', (req, res) => {
    req.query.limit = 20;
    avaliacaoController.obterAvaliacoes(req, res);
});

module.exports = router;