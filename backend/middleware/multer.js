const multer =require("multer") ;

// Set up multer storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("🚀 ~ file: upload.ts:11 ~ file", process.cwd());
    cb(null, `${process.cwd()}/src/Images`);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

// Create a multer instance with the storage options
const upload = multer({ storage });
module.exports = upload;
