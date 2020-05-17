// jshint esversion: 9
const express = require('express');
const wordController = require('./../controllers/wordController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/custom')
  .get(wordController.getCustomWords);

router
  .route('/')
  .get(wordController.getAllWords)
  .post(authController.protect, wordController.createWord)
  .delete(
    authController.protect,
    wordController.deleteWord
  );

module.exports = router;





























// EOF
