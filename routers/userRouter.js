// jshint esversion: 8
const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.protect, authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/username', userController.usernameIsTaken);

// Protect all routes below this point
router.use(authController.protect);

router.patch(
  '/updatePassword',
  authController.updatePassword
);

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.getMe, userController.updateMe)
  .delete(userController.getMe, userController.deleteMe);

// restrict to admin all routes below this point
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;



























// EOF
