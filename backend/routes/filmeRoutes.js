const express = require('express');
const router = express.Router();
const filmeController = require('../controllers/filmeController');

// ========== BUSCA E LISTAGEM ==========

// Buscar filmes/séries
router.get('/filmes/buscar', filmeController.buscarFilmes);

// Listar filmes populares
router.get('/filmes/populares', filmeController.obterFilmesPopulares);

// Obter recomendações para usuário
router.get('/filmes/recomendacoes', filmeController.obterRecomendacoes);

// Listar todos os filmes (rota original)
router.get('/filmes', filmeController.buscarFilmes);

// ========== DETALHES DE FILME/SÉRIE ==========

// Obter detalhes de um filme por ID
router.get('/filmes/:id', filmeController.obterDetalhesFilme);

// ========== GERENCIAMENTO (ADMIN) ==========

// Salvar filme/série no banco local
router.post('/filmes', filmeController.salvarFilme);

// Atualizar filme/série
router.put('/filmes/:id', (req, res) => {
    res.json({
        success: false,
        message: 'Funcionalidade de atualizar filme ainda não implementada',
        feature: 'coming_soon'
    });
});

// Deletar filme/série
router.delete('/filmes/:id', (req, res) => {
    res.json({
        success: false,
        message: 'Funcionalidade de deletar filme ainda não implementada',
        feature: 'coming_soon'
    });
});

// ========== ROTAS ESPECÍFICAS ==========

// Buscar séries
router.get('/series', (req, res) => {
    req.query.tipo = 'tv';
    filmeController.buscarFilmes(req, res);
});

// Buscar série por ID
router.get('/series/:id', (req, res) => {
    req.query.tipo = 'tv';
    filmeController.obterDetalhesFilme(req, res);
});

// Séries populares
router.get('/series/populares', (req, res) => {
    req.query.tipo = 'tv';
    filmeController.obterFilmesPopulares(req, res);
});

module.exports = router;