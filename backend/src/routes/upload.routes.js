const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(Object.assign(new Error('Only image files are allowed'), { statusCode: 400 }));
  }
});

// Turn multer's own errors (size limit, bad type) into 400s instead of 500s
const singleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB' : err.message;
    res.status(400).json({ success: false, message });
  });
};

router.post('/', authMiddleware, roleMiddleware('vendor', 'admin'), singleImage, uploadController.uploadImage);
router.get('/:id', uploadController.getImage);

module.exports = router;
