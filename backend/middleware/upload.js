const multer = require('multer');
const path = require('path');

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/perfil/') // Pasta onde salvar as fotos
  },
  filename: function (req, file, cb) {
    // Nome único: userid_timestamp.extensao
    const userId = req.params.usuarioId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `user_${userId}_${timestamp}${extension}`);
  }
});

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

module.exports = upload;