let usuarios = [];

class Usuario {
  constructor(id, nome, email, senha) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
  }

  static criar(nome, email, senha) {
    const id = usuarios.length + 1;
    const usuario = new Usuario(id, nome, email, senha);
    usuarios.push(usuario);
    return usuario;
  }

  static encontrarPorEmail(email) {
    return usuarios.find(u => u.email === email);
  }
}

module.exports = Usuario;