const db = require('../db');

let avaliacoes = [];

class Avaliacao {
  constructor(id, usuarioId, obraId, tipo, nota, comentario, data) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.obraId = obraId;
    this.tipo = tipo;
    this.nota = nota;
    this.comentario = comentario;
    this.data = data;
  }

  static criar(usuarioId, obraId, tipo, nota, comentario, callback) {
    db.run(
      `INSERT INTO avaliacoes (usuario_id, obra_id, tipo, nota, comentario) VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, obraId, tipo, nota, comentario],
      function (err) {
        if (err) return callback(err);
        callback(null, new Avaliacao(this.lastID, usuarioId, obraId, tipo, nota, comentario, new Date()));
      }
    );
  }

  static listarPorObra(obraId, callback) {
    db.all(
      `SELECT a.*, u.nome as usuarioNome FROM avaliacoes a
       LEFT JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.obra_id = ? ORDER BY a.data DESC`,
      [obraId],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
      }
    );
  }
}

module.exports = Avaliacao;