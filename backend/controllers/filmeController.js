const { db } = require('../config/firebase');

// Função auxiliar para integração com TMDB (se você usar)
const TMDB_API_KEY = process.env.TMDB_API_KEY || '25aa122e262151673e05f311eaeb56ba';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

exports.buscarFilmes = async (req, res) => {
  try {
    const { query, page = 1, tipo = 'movie' } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Termo de busca é obrigatório.' 
      });
    }

    // Se você tiver integração com TMDB, pode fazer a busca na API
    // Por enquanto, vamos buscar nos dados salvos localmente
    
    let colecao = 'filmes';
    if (tipo === 'tv') {
      colecao = 'series';
    }

    // Buscar no Firebase (dados salvos localmente)
    const filmesRef = db.collection(colecao);
    const snapshot = await filmesRef
      .where('titulo', '>=', query.toLowerCase())
      .where('titulo', '<=', query.toLowerCase() + '\uf8ff')
      .limit(20)
      .get();
    
    const resultados = [];
    snapshot.forEach(doc => {
      resultados.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({ 
      success: true,
      resultados,
      total: resultados.length,
      page: parseInt(page),
      tipo
    });

  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar filmes.',
      error: error.message 
    });
  }
};

exports.obterDetalhesFilme = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = 'movie' } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do filme é obrigatório.' 
      });
    }

    let colecao = 'filmes';
    if (tipo === 'tv') {
      colecao = 'series';
    }

    // Buscar filme/série no Firebase
    const filmeRef = db.collection(colecao).doc(id);
    const doc = await filmeRef.get();
    
    let detalhes = null;
    
    if (doc.exists) {
      // Encontrou nos dados locais
      detalhes = {
        id: doc.id,
        ...doc.data(),
        fonte: 'local'
      };
    } else {
      // Se não encontrou localmente, você pode buscar no TMDB
      // e salvar para próximas consultas
      detalhes = {
        id,
        titulo: `Filme/Série ${id}`,
        sinopse: 'Detalhes não disponíveis',
        poster: '',
        ano: new Date().getFullYear(),
        tipo,
        fonte: 'placeholder'
      };
    }

    // Buscar avaliações deste filme/série
    const avaliacoesSnapshot = await db.collection('avaliacoes')
      .where('obra_id', '==', id)
      .where('tipo', '==', tipo)
      .get();
    
    const avaliacoes = [];
    let somaNotas = 0;
    avaliacoesSnapshot.forEach(doc => {
      const avaliacaoData = doc.data();
      avaliacoes.push({
        id: doc.id,
        ...avaliacaoData
      });
      somaNotas += avaliacaoData.nota;
    });

    const mediaNotas = avaliacoes.length > 0 ? 
      parseFloat((somaNotas / avaliacoes.length).toFixed(1)) : 0;

    res.json({ 
      success: true,
      detalhes: {
        ...detalhes,
        estatisticas: {
          total_avaliacoes: avaliacoes.length,
          media_notas: mediaNotas,
          avaliacoes: avaliacoes.slice(0, 10) // Últimas 10 avaliações
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter detalhes do filme:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter detalhes do filme.',
      error: error.message 
    });
  }
};