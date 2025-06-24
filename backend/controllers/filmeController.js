const db = require('../db');

// Lista todos os filmes (exemplo: busca todos do banco)
exports.listarFilmes = (req, res) => {
    db.all('SELECT * FROM filmes', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar filmes.' });
        }
        res.json(rows);
    });
};

// Busca detalhes de um filme por ID
exports.obterFilmePorId = (req, res) => {
    const id = parseInt(req.params.id);
    db.get('SELECT * FROM filmes WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar filme.' });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Filme não encontrado.' });
        }
    });
};