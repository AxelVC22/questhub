const multer = require('multer');
const path = require('path');
const fs = require('fs');

function createUploadMiddleware(folderName = 'posts-multimedia') {
  const baseUploadDir = 'C:/questhub-uploads';
  const destination = path.join(baseUploadDir, folderName);

  // Asegurarse de que el directorio exista
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
      cb(null, `${baseName}_${timestamp}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Solo imágenes .jpg, .jpeg, .png.'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5 MB
    }
  });
}

module.exports = createUploadMiddleware;
