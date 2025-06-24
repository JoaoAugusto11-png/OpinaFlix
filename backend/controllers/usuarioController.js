const db = require('../db');

exports.cadastrarUsuario = (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  // Verifica se o e-mail já está cadastrado
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar e-mail.' });
    }
    if (row) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    // Insere novo usuário
    db.run(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        }
        res.status(201).json({
          message: 'Usuário cadastrado!',
          usuario: { id: this.lastID, nome, email }
        });
      }
    );
  });
};