const db = require('../db');

class Usuario {
  constructor(id, nome, email, senha) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
  }

  static criar(nome, email, senha, callback) {
    db.run(
      `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
      [nome, email, senha],
      function (err) {
        if (err) return callback(err);
        callback(null, new Usuario(this.lastID, nome, email, senha));
      }
    );
  }

  static encontrarPorEmail(email, callback) {
    db.get(
      `SELECT * FROM usuarios WHERE email = ?`,
      [email],
      (err, row) => {
        if (err) return callback(err);
        if (row) {
          callback(null, new Usuario(row.id, row.nome, row.email, row.senha));
        } else {
          callback(null, null);
        }
      }
    );
  }
}

module.exports = Usuario;