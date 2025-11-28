import multer from 'multer';


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, DOC, DOCX, TXT`);
    error.code = 'UNSUPPORTED_FILETYPE';
    cb(error);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: fileFilter
});

// Error handling middleware
export const handleUploadError = (err, res) => {
  console.error('[ERROR] Upload error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds 5MB limit'
    });
  }

  if (err.code === 'UNSUPPORTED_FILETYPE') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err.code === 'MISSING_FIELD_NAME') {
    return res.status(400).json({
      success: false,
      message: 'File field name missing. In Postman form-data, add a key (e.g., "file") before selecting the file.'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field. Make sure you\'re uploading to the correct field.'
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || 'File upload failed'
  });
};

export { upload };