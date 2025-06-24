const db = require('../db');

class Colecao {
  constructor(id, usuarioId, nome) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.nome = nome;
  }

  static criar(usuarioId, nome, callback) {
    db.run(
      `INSERT INTO colecoes (usuario_id, nome) VALUES (?, ?)`,
      [usuarioId, nome],
      function (err) {
        if (err) return callback(err);
        callback(null, new Colecao(this.lastID, usuarioId, nome));
      }
    );
  }

  static listarPorUsuario(usuarioId, callback) {
    db.all(
      `SELECT * FROM colecoes WHERE usuario_id = ?`,
      [usuarioId],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows.map(row => new Colecao(row.id, row.usuario_id, row.nome)));
      }
    );
  }
}

module.exports = Colecao;