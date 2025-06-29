const multer = require('multer');
const path = require('path');
const { admin } = require('../config/firebase');

// Configuração do Firebase Storage
const bucket = admin.storage().bucket();

// Configuração do multer para memória (não salva no disco)
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Middleware para fazer upload para Firebase Storage
const uploadToFirebase = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // Se não há arquivo, continua
    }

    const userId = req.params.usuarioId || req.user?.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(req.file.originalname);
    const fileName = `perfil/user_${userId}_${timestamp}${extension}`;

    // Criar referência do arquivo no Firebase Storage
    const file = bucket.file(fileName);

    // Stream de upload
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          userId: userId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Promise para aguardar o upload
    const uploadPromise = new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Erro no upload:', error);
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Tornar arquivo público (opcional)
          await file.makePublic();
          
          // URL pública do arquivo
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          // Adicionar URL ao request para uso posterior
          req.uploadedFile = {
            fileName: fileName,
            publicUrl: publicUrl,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
          };

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    // Escrever buffer do arquivo no stream
    stream.end(req.file.buffer);

    // Aguardar upload completar
    await uploadPromise;

    next();

  } catch (error) {
    console.error('Erro no middleware de upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no upload do arquivo',
      error: error.message
    });
  }
};

// Função para deletar arquivo do Firebase Storage
const deleteFromFirebase = async (fileName) => {
  try {
    const file = bucket.file(fileName);
    await file.delete();
    console.log(`Arquivo ${fileName} deletado com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

// Middleware simplificado - aceita URLs de avatar externos

const validateAvatarUrl = (req, res, next) => {
  try {
    const { avatar_url } = req.body;
    
    if (avatar_url) {
      // Validar se é uma URL válida
      try {
        new URL(avatar_url);
        
        // Verificar se é uma imagem (opcional)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const isImageUrl = imageExtensions.some(ext => 
          avatar_url.toLowerCase().includes(ext)
        ) || avatar_url.includes('imgur.com') || 
            avatar_url.includes('gravatar.com') ||
            avatar_url.includes('unsplash.com') ||
            avatar_url.includes('picsum.photos');
        
        if (!isImageUrl) {
          return res.status(400).json({
            success: false,
            message: 'URL deve ser de uma imagem válida'
          });
        }
        
        // Adicionar URL validada ao request
        req.uploadedFile = {
          publicUrl: avatar_url,
          type: 'external_url',
          validated: true
        };
        
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'URL do avatar inválida'
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Erro na validação do avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na validação',
      error: error.message
    });
  }
};

// Gerar avatar aleatório (backup)
const generateRandomAvatar = (userId) => {
  const avatarServices = [
    `https://ui-avatars.com/api/?name=User&background=random&size=200`,
    `https://robohash.org/${userId}?set=set1&size=200x200`,
    `https://picsum.photos/200?random=${userId}`,
    `https://source.unsplash.com/200x200/?portrait&${userId}`
  ];
  
  return avatarServices[Math.floor(Math.random() * avatarServices.length)];
};

const uploadPerfil = [validateAvatarUrl];

// Função para obter avatar padrão
const getDefaultAvatar = (userId, userName) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=4f46e5&color=ffffff&size=200&rounded=true`;
};

module.exports = { 
  upload,
  uploadPerfil,
  uploadToFirebase,
  deleteFromFirebase,
  validateAvatarUrl,
  generateRandomAvatar,
  getDefaultAvatar
};