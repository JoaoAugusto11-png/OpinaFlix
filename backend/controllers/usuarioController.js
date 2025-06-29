const { db } = require('../config/firebase');

exports.cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        success: false,
        message: 'Preencha todos os campos.' 
      });
    }

    // Verificar se email já existe no Firebase
    const usuariosRef = db.collection('usuarios');
    const existeQuery = await usuariosRef.where('email', '==', email).get();
    
    if (!existeQuery.empty) {
      return res.status(409).json({ 
        success: false,
        message: 'E-mail já cadastrado.' 
      });
    }

    // Criar novo usuário no Firebase
    const novoUsuario = {
      nome,
      email,
      senha,
      dataCadastro: new Date().toISOString(),
      ativo: true
    };

    const docRef = await usuariosRef.add(novoUsuario);

    res.status(201).json({ 
      success: true,
      id: docRef.id, 
      nome, 
      email 
    });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao cadastrar usuário.',
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ 
        success: false,
        message: 'Preencha todos os campos.' 
      });
    }

    // Buscar usuário no Firebase
    const usuariosRef = db.collection('usuarios');
    const query = await usuariosRef.where('email', '==', email).get();
    
    if (query.empty) {
      return res.status(401).json({ 
        success: false,
        message: 'E-mail ou senha inválidos.' 
      });
    }

    const usuario = query.docs[0];
    const userData = usuario.data();
    
    if (userData.senha !== senha) {
      return res.status(401).json({ 
        success: false,
        message: 'E-mail ou senha inválidos.' 
      });
    }

    // Não envie a senha para o frontend!
    res.json({ 
      success: true,
      id: usuario.id, 
      nome: userData.nome, 
      email: userData.email 
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar usuário.',
      error: error.message 
    });
  }
};