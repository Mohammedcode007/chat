// routes/userRoutes.js
const multer =require("multer") ;

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { imageUpload } = require('../middleware/multer')

router.post('/create', roomController.CreateRoom);
router.get('/get', roomController.getAllRoomsSortedByUsers);
router.patch('/edit', roomController.editRoom);
router.post('/join', roomController.joinRoom);
router.post('/leave', roomController.leaveRoom);

// router.post('/edite', imageUpload, userController.editProfile);

module.exports = router;
