// Sistema de banco de dados em memória

class MemoryDB {
  constructor() {
    this.usuarios = new Map();
    this.avaliacoes = new Map();
    this.colecoes = new Map();
    this.filmes = new Map();
    this.contadores = {
      usuarios: 0,
      avaliacoes: 0,
      colecoes: 0,
      filmes: 0
    };
    
    // Dados iniciais de exemplo
    this.inicializarDados();
  }

  inicializarDados() {
    // Usuários de exemplo
    this.usuarios.set('1', {
      id: '1',
      nome: 'João Silva',
      email: 'joao@email.com',
      senha: '123456',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=4f46e5&color=ffffff',
      bio: 'Amante de filmes e séries!',
      dataCadastro: new Date().toISOString()
    });

    this.usuarios.set('2', {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      senha: '123456',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=e11d48&color=ffffff',
      bio: 'Crítica de cinema.',
      dataCadastro: new Date().toISOString()
    });

    // Filmes de exemplo
    this.filmes.set('1', {
      id: '1',
      titulo: 'Oppenheimer',
      ano: 2023,
      genero: 'Drama',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      sinopse: 'A história de J. Robert Oppenheimer e o desenvolvimento da bomba atômica.',
      diretor: 'Christopher Nolan',
      tipo: 'movie'
    });

    this.filmes.set('2', {
      id: '2',
      titulo: 'The Last of Us',
      ano: 2023,
      genero: 'Drama',
      poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      sinopse: 'Adaptação do famoso videogame.',
      diretor: 'Craig Mazin',
      tipo: 'tv'
    });

    // Avaliações de exemplo
    this.avaliacoes.set('1', {
      id: '1',
      usuarioId: '1',
      obraId: '1',
      tipo: 'movie',
      nota: 9.5,
      comentario: 'Filme excepcional! Nolan mais uma vez brilhante.',
      titulo: 'Oppenheimer',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      data: new Date().toISOString(),
      usuarioNome: 'João Silva'
    });

    this.contadores = {
      usuarios: 2,
      avaliacoes: 1,
      colecoes: 0,
      filmes: 2
    };
  }

  // Métodos para usuários
  criarUsuario(dados) {
    const id = (++this.contadores.usuarios).toString();
    const usuario = {
      id,
      ...dados,
      dataCadastro: new Date().toISOString()
    };
    this.usuarios.set(id, usuario);
    return usuario;
  }

  obterUsuarioPorEmail(email) {
    for (let usuario of this.usuarios.values()) {
      if (usuario.email === email) {
        return usuario;
      }
    }
    return null;
  }

  obterUsuarioPorId(id) {
    return this.usuarios.get(id) || null;
  }

  listarUsuarios() {
    return Array.from(this.usuarios.values());
  }

  atualizarUsuario(id, dados) {
    const usuario = this.usuarios.get(id);
    if (usuario) {
      const usuarioAtualizado = { ...usuario, ...dados };
      this.usuarios.set(id, usuarioAtualizado);
      return usuarioAtualizado;
    }
    return null;
  }

  // Métodos para avaliações
  criarAvaliacao(dados) {
    const id = (++this.contadores.avaliacoes).toString();
    const avaliacao = {
      id,
      ...dados,
      data: new Date().toISOString()
    };
    this.avaliacoes.set(id, avaliacao);
    return avaliacao;
  }

  listarAvaliacoes(filtros = {}) {
    let avaliacoes = Array.from(this.avaliacoes.values());
    
    if (filtros.usuarioId) {
      avaliacoes = avaliacoes.filter(a => a.usuarioId === filtros.usuarioId);
    }
    
    if (filtros.obraId) {
      avaliacoes = avaliacoes.filter(a => a.obraId === filtros.obraId);
    }
    
    if (filtros.tipo) {
      avaliacoes = avaliacoes.filter(a => a.tipo === filtros.tipo);
    }
    
    return avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  atualizarAvaliacao(id, dados) {
    const avaliacao = this.avaliacoes.get(id);
    if (avaliacao) {
      const avaliacaoAtualizada = { ...avaliacao, ...dados };
      this.avaliacoes.set(id, avaliacaoAtualizada);
      return avaliacaoAtualizada;
    }
    return null;
  }

  deletarAvaliacao(id) {
    return this.avaliacoes.delete(id);
  }

  // Métodos para coleções
  criarColecao(dados) {
    const id = (++this.contadores.colecoes).toString();
    const colecao = {
      id,
      ...dados,
      itens: [],
      dataCriacao: new Date().toISOString()
    };
    this.colecoes.set(id, colecao);
    return colecao;
  }

  listarColecoesPorUsuario(usuarioId) {
    return Array.from(this.colecoes.values())
      .filter(c => c.usuarioId === usuarioId);
  }

  obterColecaoPorId(id) {
    return this.colecoes.get(id) || null;
  }

  adicionarItemColecao(colecaoId, item) {
    const colecao = this.colecoes.get(colecaoId);
    if (colecao) {
      colecao.itens.push({
        ...item,
        dataAdicao: new Date().toISOString()
      });
      this.colecoes.set(colecaoId, colecao);
      return colecao;
    }
    return null;
  }

  removerItemColecao(colecaoId, obraId) {
    const colecao = this.colecoes.get(colecaoId);
    if (colecao) {
      colecao.itens = colecao.itens.filter(item => item.obraId !== obraId);
      this.colecoes.set(colecaoId, colecao);
      return colecao;
    }
    return null;
  }

  // Métodos para filmes
  buscarFilmes(query) {
    const filmes = Array.from(this.filmes.values());
    if (!query) return filmes;
    
    return filmes.filter(filme => 
      filme.titulo.toLowerCase().includes(query.toLowerCase()) ||
      filme.genero.toLowerCase().includes(query.toLowerCase()) ||
      filme.diretor.toLowerCase().includes(query.toLowerCase())
    );
  }

  obterFilmePorId(id) {
    return this.filmes.get(id) || null;
  }
}

// Instância única do banco de dados
const memoryDB = new MemoryDB();

module.exports = memoryDB;