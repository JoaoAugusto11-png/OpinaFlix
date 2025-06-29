const { db } = require('../config/firebase');

exports.criarAvaliacao = async (req, res) => {
  try {
    const { usuario_id, obra_id, tipo, nota, comentario, titulo, poster } = req.body;
    
    if (!usuario_id || !obra_id || !tipo || nota === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: usuario_id, obra_id, tipo e nota.' 
      });
    }

    // Validar nota (0-10)
    if (nota < 0 || nota > 10) {
      return res.status(400).json({ 
        success: false,
        message: 'A nota deve estar entre 0 e 10.' 
      });
    }

    // Verificar se usuário já avaliou esta obra
    const avaliacoesRef = db.collection('avaliacoes');
    const existeQuery = await avaliacoesRef
      .where('usuario_id', '==', usuario_id)
      .where('obra_id', '==', obra_id)
      .get();
    
    if (!existeQuery.empty) {
      return res.status(409).json({ 
        success: false,
        message: 'Você já avaliou esta obra.' 
      });
    }

    // Criar nova avaliação no Firebase
    const novaAvaliacao = {
      usuario_id,
      obra_id,
      tipo,
      nota: parseFloat(nota),
      comentario: comentario || '',
      titulo: titulo || '',
      poster: poster || '',
      data: new Date().toISOString()
    };

    const docRef = await avaliacoesRef.add(novaAvaliacao);

    res.status(201).json({ 
      success: true,
      message: 'Avaliação criada com sucesso!',
      avaliacao: {
        id: docRef.id,
        ...novaAvaliacao
      }
    });

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar avaliação.',
      error: error.message 
    });
  }
};

exports.obterAvaliacoes = async (req, res) => {
  try {
    const { usuario_id, obra_id, tipo, limit = 20 } = req.query;
    
    let query = db.collection('avaliacoes');
    
    // Aplicar filtros se fornecidos
    if (usuario_id) {
      query = query.where('usuario_id', '==', usuario_id);
    }
    if (obra_id) {
      query = query.where('obra_id', '==', obra_id);
    }
    if (tipo) {
      query = query.where('tipo', '==', tipo);
    }
    
    // Ordenar por data mais recente e limitar resultados
    query = query.orderBy('data', 'desc').limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    const avaliacoes = [];
    snapshot.forEach(doc => {
      avaliacoes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ 
      success: true,
      avaliacoes,
      total: avaliacoes.length
    });

  } catch (error) {
    console.error('Erro ao obter avaliações:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter avaliações.',
      error: error.message 
    });
  }
};

exports.atualizarAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID da avaliação é obrigatório.' 
      });
    }

    // Verificar se avaliação existe
    const avaliacaoRef = db.collection('avaliacoes').doc(id);
    const doc = await avaliacaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Avaliação não encontrada.' 
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      dataAtualizacao: new Date().toISOString()
    };
    
    if (nota !== undefined) {
      if (nota < 0 || nota > 10) {
        return res.status(400).json({ 
          success: false,
          message: 'A nota deve estar entre 0 e 10.' 
        });
      }
      dadosAtualizacao.nota = parseFloat(nota);
    }
    
    if (comentario !== undefined) {
      dadosAtualizacao.comentario = comentario;
    }

    // Atualizar no Firebase
    await avaliacaoRef.update(dadosAtualizacao);
    
    // Buscar avaliação atualizada
    const avaliacaoAtualizada = await avaliacaoRef.get();

    res.json({ 
      success: true,
      message: 'Avaliação atualizada com sucesso!',
      avaliacao: {
        id: avaliacaoAtualizada.id,
        ...avaliacaoAtualizada.data()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar avaliação.',
      error: error.message 
    });
  }
};

exports.deletarAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID da avaliação é obrigatório.' 
      });
    }

    // Verificar se avaliação existe
    const avaliacaoRef = db.collection('avaliacoes').doc(id);
    const doc = await avaliacaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Avaliação não encontrada.' 
      });
    }

    // Deletar do Firebase
    await avaliacaoRef.delete();

    res.json({ 
      success: true,
      message: 'Avaliação deletada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao deletar avaliação.',
      error: error.message 
    });
  }
};

exports.obterEstatisticas = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    
    if (!usuario_id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário é obrigatório.' 
      });
    }

    // Buscar todas as avaliações do usuário
    const avaliacoesRef = db.collection('avaliacoes');
    const snapshot = await avaliacoesRef.where('usuario_id', '==', usuario_id).get();
    
    const avaliacoes = [];
    snapshot.forEach(doc => {
      avaliacoes.push(doc.data());
    });

    // Calcular estatísticas
    const total = avaliacoes.length;
    const filmes = avaliacoes.filter(a => a.tipo === 'movie').length;
    const series = avaliacoes.filter(a => a.tipo === 'tv').length;
    
    let somaNotas = 0;
    avaliacoes.forEach(a => somaNotas += a.nota);
    const mediaNotas = total > 0 ? (somaNotas / total).toFixed(1) : 0;

    res.json({ 
      success: true,
      estatisticas: {
        total_avaliacoes: total,
        filmes_avaliados: filmes,
        series_avaliadas: series,
        media_notas: parseFloat(mediaNotas)
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter estatísticas.',
      error: error.message 
    });
  }
};