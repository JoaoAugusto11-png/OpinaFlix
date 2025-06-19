let colecoes = [];

class Colecao {
  constructor(id, usuarioId, nome) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.nome = nome;
  }

  static criar(usuarioId, nome) {
    const id = colecoes.length + 1;
    const colecao = new Colecao(id, usuarioId, nome);
    colecoes.push(colecao);
    return colecao;
  }

  static listarPorUsuario(usuarioId) {
    return colecoes.filter(c => c.usuarioId === usuarioId);
  }
}

module.exports = Colecao;