const { db } = require('../config/firebase');

exports.criarColecao = async (req, res) => {
  try {
    const { usuario_id, nome, descricao } = req.body;
    
    if (!usuario_id || !nome) {
      return res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: usuario_id e nome.' 
      });
    }

    // Verificar se usuário já tem uma coleção com este nome
    const colecoesRef = db.collection('colecoes');
    const existeQuery = await colecoesRef
      .where('usuario_id', '==', usuario_id)
      .where('nome', '==', nome)
      .get();
    
    if (!existeQuery.empty) {
      return res.status(409).json({ 
        success: false,
        message: 'Você já possui uma coleção com este nome.' 
      });
    }

    // Criar nova coleção no Firebase
    const novaColecao = {
      usuario_id,
      nome,
      descricao: descricao || '',
      itens: [],
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      ativa: true,
      totalItens: 0
    };

    const docRef = await colecoesRef.add(novaColecao);

    res.status(201).json({ 
      success: true,
      message: 'Coleção criada com sucesso!',
      colecao: {
        id: docRef.id,
        ...novaColecao
      }
    });

  } catch (error) {
    console.error('Erro ao criar coleção:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar coleção.',
      error: error.message 
    });
  }
};

exports.obterColecoes = async (req, res) => {
  try {
    const { usuario_id, limit = 20 } = req.query;
    
    let query = db.collection('colecoes');
    
    // Filtrar por usuário se fornecido
    if (usuario_id) {
      query = query.where('usuario_id', '==', usuario_id);
    }
    
    // Filtrar apenas coleções ativas
    query = query.where('ativa', '==', true);
    
    // Ordenar por data de criação mais recente e limitar
    query = query.orderBy('dataCriacao', 'desc').limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    const colecoes = [];
    snapshot.forEach(doc => {
      colecoes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ 
      success: true,
      colecoes,
      total: colecoes.length
    });

  } catch (error) {
    console.error('Erro ao obter coleções:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter coleções.',
      error: error.message 
    });
  }
};

exports.obterColecaoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID da coleção é obrigatório.' 
      });
    }

    // Buscar coleção no Firebase
    const colecaoRef = db.collection('colecoes').doc(id);
    const doc = await colecaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada.' 
      });
    }

    const colecaoData = doc.data();

    res.json({ 
      success: true,
      colecao: {
        id: doc.id,
        ...colecaoData
      }
    });

  } catch (error) {
    console.error('Erro ao obter coleção:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter coleção.',
      error: error.message 
    });
  }
};

exports.adicionarItemColecao = async (req, res) => {
  try {
    const { id } = req.params;
    const { obra_id, tipo, titulo, poster, data_adicao } = req.body;
    
    if (!id || !obra_id || !tipo || !titulo) {
      return res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: obra_id, tipo e titulo.' 
      });
    }

    // Buscar coleção
    const colecaoRef = db.collection('colecoes').doc(id);
    const doc = await colecaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada.' 
      });
    }

    const colecaoData = doc.data();
    const itensAtuais = colecaoData.itens || [];
    
    // Verificar se item já existe na coleção
    const itemExiste = itensAtuais.some(item => item.obra_id === obra_id);
    if (itemExiste) {
      return res.status(409).json({ 
        success: false,
        message: 'Este item já está na coleção.' 
      });
    }

    // Adicionar novo item
    const novoItem = {
      obra_id,
      tipo,
      titulo,
      poster: poster || '',
      data_adicao: data_adicao || new Date().toISOString()
    };

    const itensAtualizados = [...itensAtuais, novoItem];

    // Atualizar coleção no Firebase
    await colecaoRef.update({
      itens: itensAtualizados,
      totalItens: itensAtualizados.length,
      dataAtualizacao: new Date().toISOString()
    });

    res.json({ 
      success: true,
      message: 'Item adicionado à coleção com sucesso!',
      item: novoItem
    });

  } catch (error) {
    console.error('Erro ao adicionar item à coleção:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao adicionar item à coleção.',
      error: error.message 
    });
  }
};

exports.removerItemColecao = async (req, res) => {
  try {
    const { id } = req.params;
    const { obra_id } = req.body;
    
    if (!id || !obra_id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID da coleção e obra_id são obrigatórios.' 
      });
    }

    // Buscar coleção
    const colecaoRef = db.collection('colecoes').doc(id);
    const doc = await colecaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada.' 
      });
    }

    const colecaoData = doc.data();
    const itensAtuais = colecaoData.itens || [];
    
    // Remover item da lista
    const itensAtualizados = itensAtuais.filter(item => item.obra_id !== obra_id);
    
    if (itensAtualizados.length === itensAtuais.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Item não encontrado na coleção.' 
      });
    }

    // Atualizar coleção no Firebase
    await colecaoRef.update({
      itens: itensAtualizados,
      totalItens: itensAtualizados.length,
      dataAtualizacao: new Date().toISOString()
    });

    res.json({ 
      success: true,
      message: 'Item removido da coleção com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao remover item da coleção:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao remover item da coleção.',
      error: error.message 
    });
  }
};

exports.atualizarColecao = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID da coleção é obrigatório.' 
      });
    }

    // Verificar se coleção existe
    const colecaoRef = db.collection('colecoes').doc(id);
    const doc = await colecaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada.' 
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      dataAtualizacao: new Date().toISOString()
    };
    
    if (nome !== undefined) {
      dadosAtualizacao.nome = nome;
    }
    
    if (descricao !== undefined) {
      dadosAtualizacao.descricao = descricao;
    }

    // Atualizar no Firebase
    await colecaoRef.update(dadosAtualizacao);
    
    // Buscar coleção atualizada
    const colecaoAtualizada = await colecaoRef.get();

    res.json({ 
      success: true,
      message: 'Coleção atualizada com sucesso!',
      colecao: {
        id: colecaoAtualizada.id,
        ...colecaoAtualizada.data()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar coleção:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar coleção.',
      error: error.message 
    });
  }
};

exports.deletarColecao = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID da coleção é obrigatório.' 
      });
    }

    // Verificar se coleção existe
    const colecaoRef = db.collection('colecoes').doc(id);
    const doc = await colecaoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada.' 
      });
    }

    // Soft delete - marcar como inativa
    await colecaoRef.update({
      ativa: false,
      dataExclusao: new Date().toISOString()
    });

    res.json({ 
      success: true,
      message: 'Coleção deletada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao deletar coleção:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao deletar coleção.',
      error: error.message 
    });
  }
};