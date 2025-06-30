const db = require('../db');


exports.listarFilmes = (req, res) => {
    db.all('SELECT * FROM filmes', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar filmes.' });
        }
        res.json(rows);
    });
};


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