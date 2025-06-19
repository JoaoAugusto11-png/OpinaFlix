const Usuario = require('../models/usuario');

exports.cadastrarUsuario = (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  if (Usuario.encontrarPorEmail(email)) {
    return res.status(409).json({ message: 'E-mail já cadastrado.' });
  }
  const usuario = Usuario.criar(nome, email, senha);
  res.status(201).json({ message: 'Usuário cadastrado!', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
};