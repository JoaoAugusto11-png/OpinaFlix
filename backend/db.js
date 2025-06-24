const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./opinaflix.db');

// Tabela de usuários
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL
)`);

// Tabela de avaliações
db.run(`CREATE TABLE IF NOT EXISTS avaliacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  obra_id INTEGER,
  tipo TEXT, -- 'movie' ou 'tv'
  nota INTEGER,
  comentario TEXT,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
)`);

// Tabela de coleções
db.run(`CREATE TABLE IF NOT EXISTS colecoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  nome TEXT NOT NULL,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
)`);

// Tabela de filmes/séries favoritos de uma coleção
db.run(`CREATE TABLE IF NOT EXISTS colecao_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colecao_id INTEGER,
  obra_id INTEGER,
  tipo TEXT, -- 'movie' ou 'tv'
  FOREIGN KEY(colecao_id) REFERENCES colecoes(id)
)`);

module.exports = db;