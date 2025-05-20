const multer = require('multer');
const path = require('path');
const fs = require('fs');

function createUploadMiddleware(folderName = 'posts-multimedia') {
  const destination = `uploads/${folderName}`;
  
  // Asegurarse de que el directorio exista
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Solo imágenes o videos.'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      files: 5,
      fileSize: 20 * 1024 * 1024
    }
  });
}

module.exports = createUploadMiddleware;
