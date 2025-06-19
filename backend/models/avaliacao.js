let avaliacoes = [];

class Avaliacao {
  constructor(id, usuarioId, obraId, nota, comentario) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.obraId = obraId;
    this.nota = nota;
    this.comentario = comentario;
  }

  static criar(usuarioId, obraId, nota, comentario) {
    const id = avaliacoes.length + 1;
    const avaliacao = new Avaliacao(id, usuarioId, obraId, nota, comentario);
    avaliacoes.push(avaliacao);
    return avaliacao;
  }

  static listarPorObra(obraId) {
    return avaliacoes.filter(a => a.obraId === obraId);
  }
}

module.exports = Avaliacao;