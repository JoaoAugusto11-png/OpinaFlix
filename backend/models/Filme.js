const db = require('../db');

class Filme {
    constructor(id, titulo, ano, genero, poster) {
        this.id = id;
        this.titulo = titulo;
        this.ano = ano;
        this.genero = genero;
        this.poster = poster;
    }

    static criar(titulo, ano, genero, poster, callback) {
        db.run(
            `INSERT INTO filmes (titulo, ano, genero, poster) VALUES (?, ?, ?, ?)`,
            [titulo, ano, genero, poster],
            function (err) {
                if (err) return callback(err);
                callback(null, new Filme(this.lastID, titulo, ano, genero, poster));
            }
        );
    }

    static listarTodos(callback) {
        db.all(
            `SELECT * FROM filmes`,
            [],
            (err, rows) => {
                if (err) return callback(err);
                callback(null, rows.map(row => new Filme(row.id, row.titulo, row.ano, row.genero, row.poster)));
            }
        );
    }

    static encontrarPorId(id, callback) {
        db.get(
            `SELECT * FROM filmes WHERE id = ?`,
            [id],
            (err, row) => {
                if (err) return callback(err);
                if (row) {
                    callback(null, new Filme(row.id, row.titulo, row.ano, row.genero, row.poster));
                } else {
                    callback(null, null);
                }
            }
        );
    }
}

module.exports = Filme;