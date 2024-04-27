const multer = require("multer");
const path = require('path');

// Set up multer storage options
const imageStorage = multer.diskStorage({
    destination: 'public/images',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

// Create a multer instance with the storage options
const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 1000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            // upload only png and jpg format
            return cb(new Error('Please upload an Image'));
        }
        cb(null, true);
    }
}).fields([
    { name: 'image', maxCount: 1 }, // Set field name and max count for the first image
    { name: 'imageCover', maxCount: 1 } // Set field name and max count for the second image
]);

module.exports = { imageUpload };
