const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/usuarios', usuarioController.cadastrarUsuario);
router.post('/login', usuarioController.login); // Adicione esta linha

module.exports = router;