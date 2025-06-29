const express = require('express');
const cors = require('cors');

const app = express();

// ========== CORS ==========
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// ========== MIDDLEWARES ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== BANCO DE DADOS EM MEMÓRIA ==========
const memoryDB = require('./data/memoryDB');

// ========== ROTA PRINCIPAL ==========
app.get('/', (req, res) => {
    res.json({
        message: '🔥 OpinaFlix Backend - Funcionando Perfeitamente!',
        timestamp: new Date().toISOString(),
        platform: 'Vercel',
        database: 'Memory Storage',
        status: 'READY',
        stats: {
            usuarios: memoryDB.usuarios.size,
            avaliacoes: memoryDB.avaliacoes.size,
            colecoes: memoryDB.colecoes.size,
            filmes: memoryDB.filmes.size
        }
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({
        status: '✅ HEALTHY - MEMORY DB WORKING',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'Memory Storage'
    });
});

// ========== ROTAS DE USUÁRIO ==========
app.post('/api/cadastro', (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        console.log('📝 Cadastro attempt:', { nome, email });
        
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }
        
        // Verificar se email já existe
        const usuarioExistente = memoryDB.obterUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }
        
        // Criar usuário
        const novoUsuario = memoryDB.criarUsuario({
            nome,
            email,
            senha,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=ffffff`,
            bio: ''
        });
        
        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        
        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        console.error('Cadastro error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar usuário',
            error: error.message
        });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { email, senha } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        const usuario = memoryDB.obterUsuarioPorEmail(email);
        
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        
        // Remover senha da resposta
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no login',
            error: error.message
        });
    }
});

// ========== ROTAS DE AVALIAÇÃO ==========
app.get('/api/avaliacoes', (req, res) => {
    try {
        const { usuario_id, obra_id, tipo, limit = 20 } = req.query;
        
        const filtros = {};
        if (usuario_id) filtros.usuarioId = usuario_id;
        if (obra_id) filtros.obraId = obra_id;
        if (tipo) filtros.tipo = tipo;
        
        let avaliacoes = memoryDB.listarAvaliacoes(filtros);
        avaliacoes = avaliacoes.slice(0, parseInt(limit));
        
        res.json({
            success: true,
            avaliacoes,
            total: avaliacoes.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter avaliações',
            error: error.message
        });
    }
});

app.post('/api/avaliacoes', (req, res) => {
    try {
        const { usuario_id, obra_id, tipo, nota, comentario, titulo, poster } = req.body;
        
        if (!usuario_id || !obra_id || !tipo || nota === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Dados obrigatórios: usuario_id, obra_id, tipo, nota'
            });
        }
        
        // Buscar nome do usuário
        const usuario = memoryDB.obterUsuarioPorId(usuario_id);
        const usuarioNome = usuario ? usuario.nome : 'Usuário Desconhecido';
        
        const novaAvaliacao = memoryDB.criarAvaliacao({
            usuarioId: usuario_id,
            obraId: obra_id,
            tipo,
            nota: parseFloat(nota),
            comentario: comentario || '',
            titulo: titulo || '',
            poster: poster || '',
            usuarioNome
        });
        
        res.status(201).json({
            success: true,
            message: 'Avaliação criada com sucesso!',
            avaliacao: novaAvaliacao
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar avaliação',
            error: error.message
        });
    }
});

app.put('/api/avaliacoes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { nota, comentario } = req.body;
        
        const avaliacao = memoryDB.atualizarAvaliacao(id, { nota, comentario });
        
        if (!avaliacao) {
            return res.status(404).json({
                success: false,
                message: 'Avaliação não encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Avaliação atualizada com sucesso!',
            avaliacao
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar avaliação',
            error: error.message
        });
    }
});

app.delete('/api/avaliacoes/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const deletado = memoryDB.deletarAvaliacao(id);
        
        if (!deletado) {
            return res.status(404).json({
                success: false,
                message: 'Avaliação não encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Avaliação deletada com sucesso!'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar avaliação',
            error: error.message
        });
    }
});

// ========== ROTAS DE COLEÇÃO ==========
app.get('/api/colecoes', (req, res) => {
    try {
        const { usuario_id } = req.query;
        
        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'usuario_id é obrigatório'
            });
        }
        
        const colecoes = memoryDB.listarColecoesPorUsuario(usuario_id);
        
        res.json({
            success: true,
            colecoes,
            total: colecoes.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter coleções',
            error: error.message
        });
    }
});

app.post('/api/colecoes', (req, res) => {
    try {
        const { usuario_id, nome, descricao } = req.body;
        
        if (!usuario_id || !nome) {
            return res.status(400).json({
                success: false,
                message: 'usuario_id e nome são obrigatórios'
            });
        }
        
        const novaColecao = memoryDB.criarColecao({
            usuarioId: usuario_id,
            nome,
            descricao: descricao || ''
        });
        
        res.status(201).json({
            success: true,
            message: 'Coleção criada com sucesso!',
            colecao: novaColecao
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar coleção',
            error: error.message
        });
    }
});

app.get('/api/colecoes/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const colecao = memoryDB.obterColecaoPorId(id);
        
        if (!colecao) {
            return res.status(404).json({
                success: false,
                message: 'Coleção não encontrada'
            });
        }
        
        res.json({
            success: true,
            colecao
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter coleção',
            error: error.message
        });
    }
});

app.post('/api/colecoes/:id/itens', (req, res) => {
    try {
        const { id } = req.params;
        const { obra_id, tipo, titulo, poster } = req.body;
        
        if (!obra_id || !tipo || !titulo) {
            return res.status(400).json({
                success: false,
                message: 'obra_id, tipo e titulo são obrigatórios'
            });
        }
        
        const colecao = memoryDB.adicionarItemColecao(id, {
            obraId: obra_id,
            tipo,
            titulo,
            poster: poster || ''
        });
        
        if (!colecao) {
            return res.status(404).json({
                success: false,
                message: 'Coleção não encontrada'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Item adicionado à coleção!',
            colecao
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao adicionar item à coleção',
            error: error.message
        });
    }
});

app.delete('/api/colecoes/:id/itens', (req, res) => {
    try {
        const { id } = req.params;
        const { obra_id } = req.body;
        
        if (!obra_id) {
            return res.status(400).json({
                success: false,
                message: 'obra_id é obrigatório'
            });
        }
        
        const colecao = memoryDB.removerItemColecao(id, obra_id);
        
        if (!colecao) {
            return res.status(404).json({
                success: false,
                message: 'Coleção não encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Item removido da coleção!',
            colecao
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao remover item da coleção',
            error: error.message
        });
    }
});

// ========== ROTAS DE FILME ==========
app.get('/api/filmes/buscar', (req, res) => {
    try {
        const { query } = req.query;
        
        const filmes = memoryDB.buscarFilmes(query);
        
        res.json({
            success: true,
            resultados: filmes,
            total: filmes.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar filmes',
            error: error.message
        });
    }
});

app.get('/api/filmes/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const filme = memoryDB.obterFilmePorId(id);
        
        if (!filme) {
            return res.status(404).json({
                success: false,
                message: 'Filme não encontrado'
            });
        }
        
        // Buscar avaliações do filme
        const avaliacoes = memoryDB.listarAvaliacoes({ obraId: id });
        
        res.json({
            success: true,
            detalhes: {
                ...filme,
                estatisticas: {
                    total_avaliacoes: avaliacoes.length,
                    media_notas: avaliacoes.length > 0 ? 
                        parseFloat((avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length).toFixed(1)) : 0,
                    avaliacoes: avaliacoes.slice(0, 10)
                }
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter detalhes do filme',
            error: error.message
        });
    }
});

app.get('/api/filmes/populares', (req, res) => {
    try {
        const filmes = memoryDB.buscarFilmes();
        
        res.json({
            success: true,
            resultados: filmes.slice(0, 20),
            total: filmes.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter filmes populares',
            error: error.message
        });
    }
});

// ========== ROTA DE PERFIL ==========
app.get('/api/perfil/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const usuario = memoryDB.obterUsuarioPorId(id);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        // Buscar estatísticas do usuário
        const avaliacoes = memoryDB.listarAvaliacoes({ usuarioId: id });
        const colecoes = memoryDB.listarColecoesPorUsuario(id);
        
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.json({
            success: true,
            usuario: {
                ...usuarioSemSenha,
                estatisticas: {
                    total_avaliacoes: avaliacoes.length,
                    total_colecoes: colecoes.length,
                    media_notas: avaliacoes.length > 0 ? 
                        parseFloat((avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length).toFixed(1)) : 0
                }
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter perfil',
            error: error.message
        });
    }
});

app.put('/api/perfil/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { nome, bio, avatar } = req.body;
        
        const usuario = memoryDB.atualizarUsuario(id, { nome, bio, avatar });
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso!',
            usuario: usuarioSemSenha
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar perfil',
            error: error.message
        });
    }
});

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`,
        database: 'Memory Storage',
        availableRoutes: [
            'GET /',
            'GET /health',
            'POST /api/cadastro',
            'POST /api/login',
            'GET /api/avaliacoes',
            'POST /api/avaliacoes',
            'PUT /api/avaliacoes/:id',
            'DELETE /api/avaliacoes/:id',
            'GET /api/colecoes',
            'POST /api/colecoes',
            'GET /api/colecoes/:id',
            'POST /api/colecoes/:id/itens',
            'DELETE /api/colecoes/:id/itens',
            'GET /api/filmes/buscar',
            'GET /api/filmes/:id',
            'GET /api/filmes/populares',
            'GET /api/perfil/:id',
            'PUT /api/perfil/:id'
        ]
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: err.message
    });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`💾 Banco de dados em memória carregado`);
        console.log(`📊 Dados: ${memoryDB.usuarios.size} usuários, ${memoryDB.avaliacoes.size} avaliações`);
    });
}

module.exports = app;