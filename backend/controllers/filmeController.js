const { filmes } = require('../models/Filme');

// Lista todos os filmes
exports.listarFilmes = (req, res) => {
    res.json(filmes);
};

// Busca detalhes de um filme por ID
exports.obterFilmePorId = (req, res) => {
    const id = parseInt(req.params.id);
    const filme = filmes.find(f => f.id === id);
    if (filme) {
        res.json(filme);
    } else {
        res.status(404).json({ message: 'Filme não encontrado.' });
    }
};