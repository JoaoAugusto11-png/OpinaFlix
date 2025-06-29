const { db } = require('../config/firebase');

// Obter dados do perfil
exports.obterPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário é obrigatório.' 
      });
    }

    // Buscar usuário no Firebase
    const usuarioRef = db.collection('usuarios').doc(id);
    const usuarioDoc = await usuarioRef.get();
    
    if (!usuarioDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado.' 
      });
    }

    const userData = usuarioDoc.data();

    // Buscar estatísticas do usuário em paralelo
    const [avaliacoesSnapshot, colecoesSnapshot] = await Promise.all([
      db.collection('avaliacoes').where('usuario_id', '==', id).get(),
      db.collection('colecoes').where('usuario_id', '==', id).where('ativa', '==', true).get()
    ]);

    // Calcular estatísticas das avaliações
    const avaliacoes = [];
    avaliacoesSnapshot.forEach(doc => {
      avaliacoes.push(doc.data());
    });

    const totalAvaliacoes = avaliacoes.length;
    const filmesAvaliados = avaliacoes.filter(a => a.tipo === 'movie').length;
    const seriesAvaliadas = avaliacoes.filter(a => a.tipo === 'tv').length;
    
    let somaNotas = 0;
    avaliacoes.forEach(a => somaNotas += a.nota);
    const mediaNotas = totalAvaliacoes > 0 ? (somaNotas / totalAvaliacoes).toFixed(1) : 0;

    // Calcular estatísticas das coleções
    const colecoes = [];
    let totalItensColecoes = 0;
    colecoesSnapshot.forEach(doc => {
      const colecaoData = doc.data();
      colecoes.push({
        id: doc.id,
        ...colecaoData
      });
      totalItensColecoes += colecaoData.totalItens || 0;
    });

    // Montar perfil completo
    const perfil = {
      id: usuarioDoc.id,
      nome: userData.nome,
      email: userData.email,
      dataCadastro: userData.dataCadastro,
      ativo: userData.ativo,
      avatar: userData.avatar || null,
      bio: userData.bio || '',
      estatisticas: {
        total_avaliacoes: totalAvaliacoes,
        filmes_avaliados: filmesAvaliados,
        series_avaliadas: seriesAvaliadas,
        media_notas: parseFloat(mediaNotas),
        total_colecoes: colecoes.length,
        total_itens_colecoes: totalItensColecoes
      },
      avaliacoes_recentes: avaliacoes
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5),
      colecoes: colecoes.slice(0, 5) // Últimas 5 coleções
    };

    res.json({ 
      success: true,
      perfil
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter perfil.',
      error: error.message 
    });
  }
};

// Atualizar perfil
exports.atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, bio, avatar } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário é obrigatório.' 
      });
    }

    // Verificar se usuário existe
    const usuarioRef = db.collection('usuarios').doc(id);
    const doc = await usuarioRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado.' 
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      dataAtualizacao: new Date().toISOString()
    };
    
    if (nome !== undefined && nome.trim() !== '') {
      dadosAtualizacao.nome = nome.trim();
    }
    
    if (bio !== undefined) {
      dadosAtualizacao.bio = bio.trim();
    }
    
    if (avatar !== undefined) {
      dadosAtualizacao.avatar = avatar;
    }

    // Atualizar no Firebase
    await usuarioRef.update(dadosAtualizacao);
    
    // Buscar usuário atualizado
    const usuarioAtualizado = await usuarioRef.get();
    const userData = usuarioAtualizado.data();

    res.json({ 
      success: true,
      message: 'Perfil atualizado com sucesso!',
      usuario: {
        id: usuarioAtualizado.id,
        nome: userData.nome,
        email: userData.email,
        bio: userData.bio,
        avatar: userData.avatar
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar perfil.',
      error: error.message 
    });
  }
};

// Alterar senha
exports.alterarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    
    if (!id || !senhaAtual || !novaSenha) {
      return res.status(400).json({ 
        success: false,
        message: 'ID, senha atual e nova senha são obrigatórios.' 
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'A nova senha deve ter pelo menos 6 caracteres.' 
      });
    }

    // Buscar usuário
    const usuarioRef = db.collection('usuarios').doc(id);
    const doc = await usuarioRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado.' 
      });
    }

    const userData = doc.data();

    // Verificar senha atual
    if (userData.senha !== senhaAtual) {
      return res.status(401).json({ 
        success: false,
        message: 'Senha atual incorreta.' 
      });
    }

    // Atualizar senha
    await usuarioRef.update({
      senha: novaSenha,
      dataAtualizacao: new Date().toISOString()
    });

    res.json({ 
      success: true,
      message: 'Senha alterada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao alterar senha.',
      error: error.message 
    });
  }
};

// Obter estatísticas detalhadas
exports.obterEstatisticasDetalhadas = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário é obrigatório.' 
      });
    }

    // Buscar todas as avaliações do usuário
    const avaliacoesSnapshot = await db.collection('avaliacoes')
      .where('usuario_id', '==', id)
      .get();
    
    const avaliacoes = [];
    avaliacoesSnapshot.forEach(doc => {
      avaliacoes.push(doc.data());
    });

    // Calcular estatísticas detalhadas
    const estatisticasDetalhadas = avaliacoes.map(avaliacao => {
      return {
        id: avaliacao.id,
        obra_id: avaliacao.obra_id,
        tipo: avaliacao.tipo,
        nota: avaliacao.nota,
        comentario: avaliacao.comentario,
        data: avaliacao.data,
        usuario_id: avaliacao.usuario_id
      };
    });

    res.json({ 
      success: true,
      estatisticas: estatisticasDetalhadas 
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas detalhadas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter estatísticas detalhadas.',
      error: error.message 
    });
  }
};