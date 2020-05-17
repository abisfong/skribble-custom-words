// jshint esversion: 9
const bodyParser = require('body-parser');
const express = require('express');
const authController = require('./../controllers/authController');
const viewController = require('./../controllers/viewController');
const wordController = require('./../controllers/wordController');

const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(authController.isLoggedIn);

router
  .route('/')
  .get(wordController.getAllWords, viewController.getHomepage)
  .post(
    authController.protect,
    wordController.createWord,
    wordController.getAllWords,
    viewController.getHomepage
  );

// router.post('/deleteWord/:word',
//   authController.protect,
//   wordController.deleteWord
// );

router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get('/me',
  authController.protect,
  wordController.getAllWords,
  viewController.getAccount
);

module.exports = router;



























// EOF
