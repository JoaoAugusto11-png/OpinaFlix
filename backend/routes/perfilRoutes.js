const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { uploadPerfil } = require('../middleware/upload');

console.log('✅ perfilRoutes carregado com Firebase!');

// Teste de funcionamento
router.get('/perfil/teste', (req, res) => {
    res.json({ 
        message: '🔥 Rota de perfil funcionando com Firebase!',
        timestamp: new Date().toISOString()
    });
});

// ========== ROTAS PRINCIPAIS ==========

// Obter perfil completo do usuário
router.get('/perfil/:id', perfilController.obterPerfil);

// Atualizar perfil (com avatar por URL)
router.put('/perfil/:id', 
    uploadPerfil, // Validar URL do avatar
    perfilController.atualizarPerfil
);

// Alterar senha
router.put('/perfil/:id/senha', perfilController.alterarSenha);

// Obter estatísticas detalhadas
router.get('/perfil/:id/estatisticas', perfilController.obterEstatisticasDetalhadas);

// Obter histórico de avaliações
router.get('/perfil/:id/avaliacoes', perfilController.obterHistoricoAvaliacoes);

// ========== ROTAS LEGACY (COMPATIBILIDADE) ==========

// Buscar dados do perfil (alias)
router.get('/perfil/:usuarioId/dados', perfilController.obterPerfil);

// Buscar reviews do usuário (alias para avaliacoes)
router.get('/perfil/:usuarioId/reviews', (req, res) => {
    req.params.id = req.params.usuarioId;
    perfilController.obterHistoricoAvaliacoes(req, res);
});

// Buscar coleções do usuário
router.get('/perfil/:usuarioId/colecoes', async (req, res) => {
    try {
        // Redirecionar para rota de coleções
        const { usuarioId } = req.params;
        res.redirect(`/api/colecoes?usuario_id=${usuarioId}`);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar coleções',
            error: error.message
        });
    }
});

// Atualizar foto por URL (alias)
router.put('/perfil/:usuarioId/foto', (req, res) => {
    req.params.id = req.params.usuarioId;
    req.body.avatar_url = req.body.foto_url || req.body.avatar_url;
    perfilController.atualizarPerfil(req, res);
});

// ========== ROTAS DE RELACIONAMENTO (PLACEHOLDER) ==========

// Seguir usuário (não implementado ainda)
router.post('/perfil/:usuarioId/seguir', (req, res) => {
    res.json({
        success: false,
        message: 'Funcionalidade de seguir ainda não implementada',
        feature: 'coming_soon'
    });
});

// Deixar de seguir (não implementado ainda)
router.delete('/perfil/:usuarioId/seguir', (req, res) => {
    res.json({
        success: false,
        message: 'Funcionalidade de deixar de seguir ainda não implementada',
        feature: 'coming_soon'
    });
});

// Verificar se está seguindo (não implementado ainda)
router.get('/perfil/:usuarioId/seguindo/:seguidorId', (req, res) => {
    res.json({
        success: false,
        seguindo: false,
        message: 'Funcionalidade de verificar seguidores ainda não implementada',
        feature: 'coming_soon'
    });
});

module.exports = router;