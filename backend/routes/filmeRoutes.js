const express = require('express');
const router = express.Router();
const filmeController = require('../controllers/filmeController');

// Rota para listar todos os filmes
router.get('/filmes', filmeController.listarFilmes);

// Rota para obter detalhes de um filme por ID
router.get('/filmes/:id', filmeController.obterFilmePorId);

module.exports = router;