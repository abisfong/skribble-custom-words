// jshint esversion: 9
const express = require('express');
const wordController = require('./../controllers/wordController');

const router = express.Router();

router
  .route('/')
  .get(wordController.getAllWords)
  .post(wordController.createWord);

router
  .route('/custom')
  .get(wordController.getCustomWords);

module.exports = router;





























// EOF
