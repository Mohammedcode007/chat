// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/multer')
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/search', userController.searchByUsername);
router.get('/searchbyid', userController.searchByUserId);
router.post('/edite', userController.editProfile);
router.post('/editestatus', userController.editStatus);

module.exports = router;
