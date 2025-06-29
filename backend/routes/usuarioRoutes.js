const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rotas de autenticação
router.post('/usuarios', usuarioController.cadastrarUsuario);
router.post('/cadastro', usuarioController.cadastrarUsuario); // Alias
router.post('/login', usuarioController.login);

// Rotas de usuários (se necessário)
router.get('/usuarios', usuarioController.listarUsuarios || ((req, res) => {
    res.json({ message: 'Rota não implementada ainda' });
}));

router.get('/usuarios/:id', usuarioController.obterUsuario || ((req, res) => {
    res.json({ message: 'Rota não implementada ainda' });
}));

module.exports = router;