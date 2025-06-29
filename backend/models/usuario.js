const { db } = require('../config/firebase');
const { getDefaultAvatar } = require('../middleware/upload');

class Usuario {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.avatar = data.avatar;
    this.bio = data.bio;
    this.dataCadastro = data.dataCadastro;
    this.ativo = data.ativo;
  }

  static async criar(nome, email, senha) {
    try {
      const novoUsuario = {
        nome,
        email,
        senha,
        avatar: getDefaultAvatar(Date.now(), nome),
        bio: '',
        dataCadastro: new Date().toISOString(),
        ativo: true
      };

      const docRef = await db.collection('usuarios').add(novoUsuario);
      
      return new Usuario({
        id: docRef.id,
        ...novoUsuario
      });

    } catch (error) {
      throw new Error('Erro ao criar usuário: ' + error.message);
    }
  }

  static async encontrarPorEmail(email) {
    try {
      const snapshot = await db.collection('usuarios').where('email', '==', email).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new Usuario({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      throw new Error('Erro ao buscar usuário por email: ' + error.message);
    }
  }

  static async encontrarPorId(id) {
    try {
      const doc = await db.collection('usuarios').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new Usuario({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      throw new Error('Erro ao buscar usuário por ID: ' + error.message);
    }
  }

  static async listarTodos() {
    try {
      const snapshot = await db.collection('usuarios').where('ativo', '==', true).get();
      const usuarios = [];
      
      snapshot.forEach(doc => {
        usuarios.push(new Usuario({
          id: doc.id,
          ...doc.data()
        }));
      });
      
      return usuarios;

    } catch (error) {
      throw new Error('Erro ao listar usuários: ' + error.message);
    }
  }

  static async atualizar(id, dados) {
    try {
      const usuarioRef = db.collection('usuarios').doc(id);
      
      const dadosAtualizacao = {
        ...dados,
        dataAtualizacao: new Date().toISOString()
      };
      
      await usuarioRef.update(dadosAtualizacao);
      
      return await Usuario.encontrarPorId(id);

    } catch (error) {
      throw new Error('Erro ao atualizar usuário: ' + error.message);
    }
  }

  static async deletar(id) {
    try {
      // Soft delete - marcar como inativo
      await db.collection('usuarios').doc(id).update({
        ativo: false,
        dataExclusao: new Date().toISOString()
      });
      
      return true;

    } catch (error) {
      throw new Error('Erro ao deletar usuário: ' + error.message);
    }
  }
}

module.exports = Usuario;