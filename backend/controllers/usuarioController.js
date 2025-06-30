const db = require('../db');

exports.cadastrarUsuario = (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ message: 'Erro ao verificar e-mail.' });
    if (row) return res.status(409).json({ message: 'E-mail já cadastrado.' });
    db.run(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha],
      function (err) {
        if (err) return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        const usuario = { id: this.lastID, nome, email };
        res.status(201).json({ usuario });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar usuário.' });
    if (!row || row.senha !== senha) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    // Não envie a senha para o frontend!
    const { id, nome, email: userEmail } = row;
    res.json({ id, nome, email: userEmail });
  });
};