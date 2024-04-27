// routes/userRoutes.js
const multer =require("multer") ;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { imageUpload } = require('../middleware/multer')

router.get('/search', userController.searchByUsername);
router.get('/searchbyid', userController.searchByUserId);
router.post('/edite', imageUpload, userController.editProfile);
router.post('/editeuser', userController.editUser);
router.delete('/deletfriend', userController.deleteFriend);
router.post('/sendemail', userController.forgetpassword);
router.get('/getAllFriends', userController.getAllFriends);

// router.post('/uploadImage', upload.imageUpload.single('image'), (req, res) => {
//     res.send(req.file)
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })
module.exports = router;
