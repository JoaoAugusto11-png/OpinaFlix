const { db } = require('../config/firebase');

class Avaliacao {
  constructor(data) {
    this.id = data.id;
    this.usuarioId = data.usuarioId || data.usuario_id;
    this.obraId = data.obraId || data.obra_id;
    this.tipo = data.tipo;
    this.nota = data.nota;
    this.comentario = data.comentario;
    this.titulo = data.titulo;
    this.poster = data.poster;
    this.data = data.data;
    this.usuarioNome = data.usuarioNome;
  }

  static async criar(usuarioId, obraId, tipo, nota, comentario, dadosExtras = {}) {
    try {
      const novaAvaliacao = {
        usuario_id: usuarioId,
        obra_id: obraId,
        tipo,
        nota: parseFloat(nota),
        comentario: comentario || '',
        titulo: dadosExtras.titulo || '',
        poster: dadosExtras.poster || '',
        data: new Date().toISOString()
      };

      const docRef = await db.collection('avaliacoes').add(novaAvaliacao);
      
      return new Avaliacao({
        id: docRef.id,
        ...novaAvaliacao
      });

    } catch (error) {
      throw new Error('Erro ao criar avaliação: ' + error.message);
    }
  }

  static async listarPorObra(obraId, limit = 20) {
    try {
      const snapshot = await db.collection('avaliacoes')
        .where('obra_id', '==', obraId)
        .orderBy('data', 'desc')
        .limit(limit)
        .get();
      
      const avaliacoes = [];
      
      // Buscar nome dos usuários
      for (const doc of snapshot.docs) {
        const avaliacaoData = doc.data();
        
        // Buscar nome do usuário
        try {
          const usuarioDoc = await db.collection('usuarios').doc(avaliacaoData.usuario_id).get();
          const usuarioNome = usuarioDoc.exists ? usuarioDoc.data().nome : 'Usuário Desconhecido';
          
          avaliacoes.push(new Avaliacao({
            id: doc.id,
            ...avaliacaoData,
            usuarioNome
          }));
        } catch (error) {
          // Se não conseguir buscar o usuário, adicionar sem o nome
          avaliacoes.push(new Avaliacao({
            id: doc.id,
            ...avaliacaoData,
            usuarioNome: 'Usuário Desconhecido'
          }));
        }
      }
      
      return avaliacoes;

    } catch (error) {
      throw new Error('Erro ao listar avaliações por obra: ' + error.message);
    }
  }

  static async listarPorUsuario(usuarioId, limit = 20, tipo = null) {
    try {
      let query = db.collection('avaliacoes').where('usuario_id', '==', usuarioId);
      
      if (tipo) {
        query = query.where('tipo', '==', tipo);
      }
      
      query = query.orderBy('data', 'desc').limit(limit);
      
      const snapshot = await query.get();
      const avaliacoes = [];
      
      snapshot.forEach(doc => {
        avaliacoes.push(new Avaliacao({
          id: doc.id,
          ...doc.data()
        }));
      });
      
      return avaliacoes;

    } catch (error) {
      throw new Error('Erro ao listar avaliações por usuário: ' + error.message);
    }
  }

  static async encontrarPorId(id) {
    try {
      const doc = await db.collection('avaliacoes').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new Avaliacao({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      throw new Error('Erro ao buscar avaliação por ID: ' + error.message);
    }
  }

  static async encontrarPorUsuarioEObra(usuarioId, obraId) {
    try {
      const snapshot = await db.collection('avaliacoes')
        .where('usuario_id', '==', usuarioId)
        .where('obra_id', '==', obraId)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new Avaliacao({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      throw new Error('Erro ao buscar avaliação por usuário e obra: ' + error.message);
    }
  }

  static async calcularMediaPorObra(obraId) {
    try {
      const snapshot = await db.collection('avaliacoes')
        .where('obra_id', '==', obraId)
        .get();
      
      if (snapshot.empty) {
        return { media: 0, total: 0 };
      }
      
      let somaNotas = 0;
      let totalAvaliacoes = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        somaNotas += data.nota;
        totalAvaliacoes++;
      });
      
      const media = parseFloat((somaNotas / totalAvaliacoes).toFixed(1));
      
      return { media, total: totalAvaliacoes };

    } catch (error) {
      throw new Error('Erro ao calcular média por obra: ' + error.message);
    }
  }

  static async atualizar(id, dados) {
    try {
      const avaliacaoRef = db.collection('avaliacoes').doc(id);
      
      const dadosAtualizacao = {
        ...dados,
        dataAtualizacao: new Date().toISOString()
      };
      
      await avaliacaoRef.update(dadosAtualizacao);
      
      return await Avaliacao.encontrarPorId(id);

    } catch (error) {
      throw new Error('Erro ao atualizar avaliação: ' + error.message);
    }
  }

  static async deletar(id) {
    try {
      await db.collection('avaliacoes').doc(id).delete();
      return true;

    } catch (error) {
      throw new Error('Erro ao deletar avaliação: ' + error.message);
    }
  }
}

module.exports = Avaliacao;