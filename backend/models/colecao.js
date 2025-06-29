const { db } = require('../config/firebase');

class Colecao {
  constructor(data) {
    this.id = data.id;
    this.usuarioId = data.usuarioId || data.usuario_id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.itens = data.itens || [];
    this.totalItens = data.totalItens || 0;
    this.dataCriacao = data.dataCriacao;
    this.dataAtualizacao = data.dataAtualizacao;
    this.ativa = data.ativa;
  }

  static async criar(usuarioId, nome, descricao = '') {
    try {
      const novaColecao = {
        usuario_id: usuarioId,
        nome,
        descricao,
        itens: [],
        totalItens: 0,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        ativa: true
      };

      const docRef = await db.collection('colecoes').add(novaColecao);
      
      return new Colecao({
        id: docRef.id,
        ...novaColecao
      });

    } catch (error) {
      throw new Error('Erro ao criar coleção: ' + error.message);
    }
  }

  static async listarPorUsuario(usuarioId, limit = 20) {
    try {
      const snapshot = await db.collection('colecoes')
        .where('usuario_id', '==', usuarioId)
        .where('ativa', '==', true)
        .orderBy('dataCriacao', 'desc')
        .limit(limit)
        .get();
      
      const colecoes = [];
      snapshot.forEach(doc => {
        colecoes.push(new Colecao({
          id: doc.id,
          ...doc.data()
        }));
      });
      
      return colecoes;

    } catch (error) {
      throw new Error('Erro ao listar coleções por usuário: ' + error.message);
    }
  }

  static async encontrarPorId(id) {
    try {
      const doc = await db.collection('colecoes').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new Colecao({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      throw new Error('Erro ao buscar coleção por ID: ' + error.message);
    }
  }

  static async adicionarItem(colecaoId, item) {
    try {
      const colecaoRef = db.collection('colecoes').doc(colecaoId);
      const doc = await colecaoRef.get();
      
      if (!doc.exists) {
        throw new Error('Coleção não encontrada');
      }
      
      const colecaoData = doc.data();
      const itensAtuais = colecaoData.itens || [];
      
      // Verificar se item já existe
      const itemExiste = itensAtuais.some(i => i.obra_id === item.obra_id);
      if (itemExiste) {
        throw new Error('Item já existe na coleção');
      }
      
      const novoItem = {
        obra_id: item.obra_id,
        tipo: item.tipo,
        titulo: item.titulo,
        poster: item.poster || '',
        data_adicao: new Date().toISOString()
      };
      
      const itensAtualizados = [...itensAtuais, novoItem];
      
      await colecaoRef.update({
        itens: itensAtualizados,
        totalItens: itensAtualizados.length,
        dataAtualizacao: new Date().toISOString()
      });
      
      return novoItem;

    } catch (error) {
      throw new Error('Erro ao adicionar item à coleção: ' + error.message);
    }
  }

  static async removerItem(colecaoId, obraId) {
    try {
      const colecaoRef = db.collection('colecoes').doc(colecaoId);
      const doc = await colecaoRef.get();
      
      if (!doc.exists) {
        throw new Error('Coleção não encontrada');
      }
      
      const colecaoData = doc.data();
      const itensAtuais = colecaoData.itens || [];
      
      const itensAtualizados = itensAtuais.filter(item => item.obra_id !== obraId);
      
      if (itensAtualizados.length === itensAtuais.length) {
        throw new Error('Item não encontrado na coleção');
      }
      
      await colecaoRef.update({
        itens: itensAtualizados,
        totalItens: itensAtualizados.length,
        dataAtualizacao: new Date().toISOString()
      });
      
      return true;

    } catch (error) {
      throw new Error('Erro ao remover item da coleção: ' + error.message);
    }
  }

  static async atualizar(id, dados) {
    try {
      const colecaoRef = db.collection('colecoes').doc(id);
      
      const dadosAtualizacao = {
        ...dados,
        dataAtualizacao: new Date().toISOString()
      };
      
      await colecaoRef.update(dadosAtualizacao);
      
      return await Colecao.encontrarPorId(id);

    } catch (error) {
      throw new Error('Erro ao atualizar coleção: ' + error.message);
    }
  }

  static async deletar(id) {
    try {
      // Soft delete
      await db.collection('colecoes').doc(id).update({
        ativa: false,
        dataExclusao: new Date().toISOString()
      });
      
      return true;

    } catch (error) {
      throw new Error('Erro ao deletar coleção: ' + error.message);
    }
  }
}

module.exports = Colecao;